import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// "DYG123" — the Instagram AI assistant brain.
// ----------------------------------------------------------------------------
// Given an inbound Instagram DM or comment, generate a short, on-brand reply.
// Tone and business identity are configurable via env so the same code can
// front different accounts:
//   IG_ASSISTANT_NAME   — display name of the assistant (default "DYG123")
//   IG_BUSINESS_NAME    — the business it speaks for (default "Golden Maple")
//   NEXT_PUBLIC_APP_URL — used to point people at the online estimator
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const ASSISTANT_NAME = process.env.IG_ASSISTANT_NAME || 'DYG123';
const BUSINESS_NAME = process.env.IG_BUSINESS_NAME || 'Golden Maple';

export type IncomingKind = 'dm' | 'comment';

function systemPrompt(kind: IncomingKind): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const estimatorLine = appUrl
    ? `When someone asks about pricing or wants a quote, invite them to get an instant estimate at ${appUrl} or to share their project details so the team can follow up.`
    : `When someone asks about pricing or wants a quote, invite them to share their project details so the team can follow up.`;

  return [
    `You are ${ASSISTANT_NAME}, the Instagram assistant for ${BUSINESS_NAME}, a decking and outdoor-living company.`,
    `You reply to ${kind === 'dm' ? 'direct messages' : 'comments on posts'} from real prospective customers.`,
    `Be warm, concise, and genuinely helpful — sound like a friendly human on the team, not a corporate bot.`,
    estimatorLine,
    kind === 'comment'
      ? `Keep comment replies to ONE short sentence (under 200 characters). No links unless asked.`
      : `Keep DM replies to 1-3 short sentences. It's fine to ask one clarifying question to keep the conversation going.`,
    `Never invent specific prices, availability, or promises. If you don't know something, say the team will follow up.`,
    `Do not use hashtags. Use at most one tasteful emoji.`,
  ].join(' ');
}

/**
 * Produce the assistant's reply text for an inbound message. Returns a string
 * ready to send back via the Instagram Graph API.
 */
export async function generateAssistantReply(
  kind: IncomingKind,
  message: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt(kind),
    messages: [{ role: 'user', content: message }],
  });

  const text =
    response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

  // Safety net: if the model returns nothing, fall back to a neutral reply so
  // the user still gets a response.
  return (
    text ||
    `Thanks for reaching out to ${BUSINESS_NAME}! Someone from our team will get back to you shortly.`
  );
}
