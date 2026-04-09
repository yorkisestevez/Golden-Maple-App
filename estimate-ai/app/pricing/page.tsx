import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

const PLANS = [
  {
    name: 'Standard',
    price: 97,
    desc: 'Perfect for getting started',
    features: [
      'Branded estimator widget',
      'Lead capture & email notifications',
      'Dashboard with lead management',
      'Up to 100 leads/month',
      'Multi-select estimator (all 4 steps)',
      'Mobile-responsive design',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: 197,
    desc: 'For serious lead generation',
    features: [
      'Everything in Standard',
      'AI-powered design insights (50/day)',
      'Webhook integration (CRM)',
      'CSV lead export',
      'Unlimited leads',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Agency',
    price: 497,
    desc: 'For multi-location operations',
    features: [
      'Everything in Pro',
      'White-label (remove EstimateAI branding)',
      'AI insights (200/day)',
      'Unlimited embed domains',
      'Custom domain support',
      'Priority support & onboarding',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F0E0A] text-[#F2EEE7]">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#D4AF63]" style={{ fontFamily: 'Georgia, serif' }}>
            EstimateAI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#A89F91] hover:text-[#F2EEE7]">Login</Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#D4AF63] text-[#0F0E0A] rounded-lg text-sm font-medium hover:brightness-110"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
            Simple, Transparent <span className="text-[#D4AF63]">Pricing</span>
          </h1>
          <p className="mt-4 text-lg text-[#A89F91]">
            14-day free trial on every plan. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-[#1A1814] border-2 border-[#D4AF63] shadow-xl shadow-[#D4AF63]/10'
                  : 'bg-[#1A1814] border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4AF63] text-[#0F0E0A] text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-[#A89F91] mt-1">{plan.desc}</p>

              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold text-[#D4AF63]">${plan.price}</span>
                <span className="text-[#A89F91]">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-[#D4AF63] mt-0.5 flex-shrink-0" />
                    <span className="text-[#A89F91]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full text-center py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-[#D4AF63] text-[#0F0E0A] hover:brightness-110'
                    : 'border-2 border-[#D4AF63] text-[#D4AF63] hover:bg-[#D4AF63] hover:text-[#0F0E0A]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center text-sm text-[#A89F91] hover:text-[#F2EEE7]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
