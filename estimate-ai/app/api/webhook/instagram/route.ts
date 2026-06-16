import { NextRequest, NextResponse } from 'next/server';
import {
  verifyInstagramSignature,
  sendInstagramMessage,
  replyToInstagramComment,
} from '@/lib/instagram';
import { generateAssistantReply } from '@/lib/ig-assistant';

// ============================================================================
// Instagram webhook for the "DYG123" assistant.
// ----------------------------------------------------------------------------
// GET  — Meta's subscription verification handshake (hub.challenge).
// POST — Inbound events: DMs (`messaging`) and comments (`changes`/comments).
//        Each is handed to the AI, which replies via the Graph API.
// ============================================================================

// Meta expects raw, unbuffered access for signature verification — run on the
// Node.js runtime, not the edge.
export const runtime = 'nodejs';

// ---- Webhook verification (GET) -------------------------------------------
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.IG_VERIFY_TOKEN) {
    // Meta requires the raw challenge string echoed back as the body.
    return new NextResponse(challenge ?? '', { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ---- Event delivery (POST) -------------------------------------------------
export async function POST(request: NextRequest) {
  // Read the raw body first so we can verify the signature over exact bytes.
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyInstagramSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: InstagramWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.object !== 'instagram') {
    // Not for us — acknowledge so Meta doesn't retry.
    return NextResponse.json({ received: true });
  }

  // Process events without blocking the 200. Meta retries on non-2xx, so we
  // always ack quickly and log failures rather than erroring the webhook.
  for (const entry of payload.entry ?? []) {
    const accountId = entry.id;

    // Direct messages.
    for (const event of entry.messaging ?? []) {
      await handleMessage(event).catch((err) =>
        console.error('IG DM handling error:', err)
      );
    }

    // Comments (and other field changes).
    for (const change of entry.changes ?? []) {
      if (change.field === 'comments') {
        await handleComment(change.value, accountId).catch((err) =>
          console.error('IG comment handling error:', err)
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function handleMessage(event: MessagingEvent) {
  // Skip echoes of our own outgoing messages and non-text payloads.
  if (event.message?.is_echo) return;
  const text = event.message?.text?.trim();
  const senderId = event.sender?.id;
  if (!text || !senderId) return;

  const reply = await generateAssistantReply('dm', text);
  await sendInstagramMessage(senderId, reply);
}

async function handleComment(value: CommentValue, accountId: string) {
  const text = value.text?.trim();
  const commentId = value.id;
  if (!text || !commentId) return;

  // Don't reply to the account's own comments (e.g. our own replies).
  if (value.from?.id && value.from.id === accountId) return;

  const reply = await generateAssistantReply('comment', text);
  await replyToInstagramComment(commentId, reply);
}

// ---- Minimal payload typings (only the fields we use) ----------------------
interface InstagramWebhookPayload {
  object?: string;
  entry?: WebhookEntry[];
}

interface WebhookEntry {
  id: string;
  time?: number;
  messaging?: MessagingEvent[];
  changes?: ChangeEvent[];
}

interface MessagingEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: { mid?: string; text?: string; is_echo?: boolean };
}

interface ChangeEvent {
  field?: string;
  value: CommentValue;
}

interface CommentValue {
  id?: string;
  text?: string;
  from?: { id?: string; username?: string };
  media?: { id?: string };
}
