import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateInsight(
  features: { label: string; qty: number; unit: string }[],
  tier: { label: string; desc: string },
  site: { label: string },
  estimate: { low: number; high: number },
  currency: string
): Promise<string> {
  const items = features.map((f) => `${f.label}: ${f.qty} ${f.unit}`).join(', ');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are a senior hardscape and outdoor living consultant. A homeowner wants: ${items}. Material tier: ${tier.label} (${tier.desc}). Site: ${site.label}. Budget range: ${formatCurrency(estimate.low, currency)}–${formatCurrency(estimate.high, currency)}.

Give exactly 3 sentences: (1) A smart design tip that adds value to THIS specific combination of features. (2) One thing most homeowners overlook that saves money or prevents headaches with this type of project. (3) Why this investment makes sense for their property value. Sound like a trusted expert — not a salesman. Conversational but authoritative. No bullet points. No filler phrases.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
