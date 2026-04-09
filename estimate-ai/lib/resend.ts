import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

interface LeadNotificationData {
  contractorEmail: string;
  contractorName: string;
  leadName: string;
  leadEmail: string | null;
  leadPhone: string;
  leadNotes: string | null;
  features: { label: string; qty: number; unit: string }[];
  tier: string;
  estimateLow: number;
  estimateHigh: number;
  currency: string;
  leadId: string;
}

export async function sendLeadNotification(data: LeadNotificationData) {
  const featureList = data.features
    .map((f) => `${f.label}: ${f.qty} ${f.unit}`)
    .join('\n    ');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await getResend().emails.send({
    from: 'EstimateAI <notifications@estimateai.com>',
    to: data.contractorEmail,
    subject: `New Lead: ${data.leadName} — Project Estimate`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF63;">New Lead from EstimateAI</h2>
        <p>You have a new project inquiry!</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contact Info</h3>
          <p><strong>Name:</strong> ${data.leadName}</p>
          <p><strong>Phone:</strong> ${data.leadPhone}</p>
          ${data.leadEmail ? `<p><strong>Email:</strong> ${data.leadEmail}</p>` : ''}
          ${data.leadNotes ? `<p><strong>Notes:</strong> ${data.leadNotes}</p>` : ''}
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Project Details</h3>
          <p><strong>Features:</strong></p>
          <pre style="white-space: pre-wrap;">${featureList}</pre>
          <p><strong>Quality Tier:</strong> ${data.tier}</p>
          <p><strong>Estimate Range:</strong> $${data.estimateLow.toLocaleString()} — $${data.estimateHigh.toLocaleString()} ${data.currency}</p>
        </div>

        <a href="${appUrl}/dashboard/leads"
           style="display: inline-block; background: #D4AF63; color: #0F0E0A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View in Dashboard
        </a>
      </div>
    `,
  });
}
