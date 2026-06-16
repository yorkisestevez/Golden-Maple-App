import crypto from 'crypto';

// ============================================================================
// Instagram Messaging API client (Meta Graph API)
// ----------------------------------------------------------------------------
// Powers the "DYG123" assistant: receiving + replying to Instagram DMs and
// comments. Requires an Instagram *Professional* (Business/Creator) account
// linked to a Facebook Page, and a Meta app with the Instagram Messaging
// product enabled. See docs/INSTAGRAM-DYG123-SETUP.md for the full setup.
//
// Env (set in .env.local / Netlify):
//   IG_APP_SECRET           — Meta app secret, used to verify webhook payloads
//   IG_VERIFY_TOKEN         — arbitrary string you choose; echoed during the
//                             webhook subscription handshake
//   IG_ACCESS_TOKEN         — long-lived Instagram/Page access token used to
//                             send replies
//   IG_GRAPH_API_VERSION    — optional, defaults to v21.0
// ============================================================================

const GRAPH_API_VERSION = process.env.IG_GRAPH_API_VERSION || 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Verify an incoming webhook payload came from Meta by checking the
 * X-Hub-Signature-256 header against an HMAC-SHA256 of the raw body.
 * Returns false (rather than throwing) so callers can reject cleanly.
 */
export function verifyInstagramSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.IG_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');

  // Constant-time compare; lengths must match or timingSafeEqual throws.
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function graphPost(path: string, body: Record<string, unknown>) {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    throw new Error('IG_ACCESS_TOKEN is not configured');
  }

  const res = await fetch(`${GRAPH_BASE}/${path}?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Graph API ${path} failed (${res.status}): ${detail}`);
  }

  return res.json();
}

/**
 * Send a direct message reply to an Instagram user (their IGSID — the sender id
 * delivered in the webhook). Uses the Messenger Send API surface exposed for
 * Instagram messaging.
 */
export function sendInstagramMessage(recipientId: string, text: string) {
  return graphPost('me/messages', {
    recipient: { id: recipientId },
    message: { text },
  });
}

/**
 * Post a public reply underneath an Instagram comment.
 */
export function replyToInstagramComment(commentId: string, text: string) {
  return graphPost(`${commentId}/replies`, { message: text });
}

/**
 * Send a one-time private DM in response to a comment (Instagram allows this
 * within a 7-day window after the comment). Useful for moving a public
 * comment thread into DMs.
 */
export function privateReplyToComment(commentId: string, text: string) {
  return graphPost('me/messages', {
    recipient: { comment_id: commentId },
    message: { text },
  });
}
