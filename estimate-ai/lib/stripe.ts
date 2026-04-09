import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return _stripe;
}

export const PLANS = {
  standard: {
    name: 'Standard',
    price: 97,
    priceId: process.env.STRIPE_PRICE_STANDARD!,
    features: [
      'Branded estimator',
      'Lead capture & email notifications',
      'Dashboard with lead management',
      'Up to 100 leads/month',
    ],
  },
  pro: {
    name: 'Pro',
    price: 197,
    priceId: process.env.STRIPE_PRICE_PRO!,
    features: [
      'Everything in Standard',
      'AI-powered design insights',
      'Webhook integration (CRM)',
      'CSV lead export',
      'Unlimited leads',
    ],
  },
  agency: {
    name: 'Agency',
    price: 497,
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    features: [
      'Everything in Pro',
      'White-label (remove branding)',
      'Unlimited embed domains',
      'Priority support',
      'Custom domain support',
    ],
  },
} as const;
