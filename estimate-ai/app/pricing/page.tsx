import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, Shield, HelpCircle, CheckCircle, Zap } from 'lucide-react';

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

const FAQ = [
  {
    q: 'Do I need a developer to set this up?',
    a: 'No. You copy one line of code and paste it into your website. If you can edit a WordPress page, you can do this. Most contractors are live in under 15 minutes.',
  },
  {
    q: 'How accurate are the estimates?',
    a: 'As accurate as your pricing data. You enter your own labor rates, material costs, and tier multipliers. The estimator uses YOUR numbers — we just make the math beautiful and instant.',
  },
  {
    q: 'What happens after the 14-day trial?',
    a: 'If you love it, add a payment method and pick your plan. If not, your account simply pauses. No charge, no hassle. We don\'t even ask for a credit card upfront.',
  },
  {
    q: 'Can homeowners see my actual costs or margins?',
    a: 'Absolutely not. Homeowners only see the final estimate range. Your labor rates, material markups, and pricing formulas are completely hidden.',
  },
  {
    q: 'What if a lead submits through the estimator at 2 AM?',
    a: 'You get an instant email notification with their full project scope, contact info, and estimate range. You can also set up a webhook to push leads directly to your CRM.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Yes, upgrade or downgrade anytime from your dashboard. Changes take effect immediately. If you downgrade, you keep access to your current plan until the billing cycle ends.',
  },
  {
    q: 'Does this work with my existing website?',
    a: 'Yes. EstimateAI works with WordPress, Squarespace, Wix, Webflow, Shopify, custom HTML — literally any website that lets you add a script tag or iframe.',
  },
  {
    q: 'What are AI design insights?',
    a: 'On Pro and Agency plans, Claude AI analyzes each homeowner\'s specific project combination and generates personalized design tips. It\'s like having a senior consultant review every estimate.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F0E0A] text-[#F2EEE7]">
      {/* Nav */}
      <nav className="border-b border-white/10 sticky top-0 bg-[#0F0E0A]/95 backdrop-blur-md z-50">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            14-day free trial on every plan
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
            One Lead Pays for a <span className="text-[#D4AF63]">Full Year</span>
          </h1>
          <p className="mt-4 text-lg text-[#A89F91] max-w-xl mx-auto">
            Average outdoor living project: $15K–$45K. You do the math.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-[#1A1814] border-2 border-[#D4AF63] shadow-xl shadow-[#D4AF63]/10'
                  : 'bg-[#1A1814] border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4AF63] text-[#0F0E0A] text-sm font-bold rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-[#A89F91] mt-1">{plan.desc}</p>

              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold text-[#D4AF63]">${plan.price}</span>
                <span className="text-[#A89F91]">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-[#D4AF63] mt-0.5 flex-shrink-0" />
                    <span className="text-[#A89F91]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`group block w-full text-center py-3.5 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-[#D4AF63] text-[#0F0E0A] hover:brightness-110 shadow-lg shadow-[#D4AF63]/20'
                    : 'border-2 border-[#D4AF63] text-[#D4AF63] hover:bg-[#D4AF63] hover:text-[#0F0E0A]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="bg-gradient-to-r from-[#D4AF63]/5 via-[#1A1814] to-[#D4AF63]/5 rounded-2xl border border-[#D4AF63]/20 p-8 sm:p-10 text-center mb-16">
          <Shield className="w-12 h-12 text-[#D4AF63] mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Risk-Free Guarantee
          </h3>
          <p className="text-[#A89F91] max-w-lg mx-auto leading-relaxed">
            Try EstimateAI free for 14 days. No credit card, no commitment. If it doesn&apos;t generate leads, you pay nothing.
            If it does? You&apos;ll wonder how you ever lived without it.
          </p>
        </div>

        {/* ROI Breakdown */}
        <div className="bg-[#1A1814] rounded-2xl border border-white/10 p-8 sm:p-10 mb-16">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Zap className="w-5 h-5 text-[#D4AF63]" />
            <h3 className="text-xl font-bold">Quick ROI Math</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-[#A89F91] font-medium" />
                  <th className="text-center p-3 text-[#A89F91] font-medium">Standard</th>
                  <th className="text-center p-3 text-[#D4AF63] font-bold">Pro</th>
                  <th className="text-center p-3 text-[#A89F91] font-medium">Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-3 text-[#A89F91]">Monthly cost</td>
                  <td className="p-3 text-center text-[#F2EEE7]">$97</td>
                  <td className="p-3 text-center text-[#F2EEE7] font-semibold">$197</td>
                  <td className="p-3 text-center text-[#F2EEE7]">$497</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3 text-[#A89F91]">Avg. project value</td>
                  <td className="p-3 text-center text-[#F2EEE7]">$25K</td>
                  <td className="p-3 text-center text-[#F2EEE7]">$25K</td>
                  <td className="p-3 text-center text-[#F2EEE7]">$25K</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3 text-[#A89F91]">Extra leads closed/month</td>
                  <td className="p-3 text-center text-[#F2EEE7]">1</td>
                  <td className="p-3 text-center text-[#F2EEE7]">2</td>
                  <td className="p-3 text-center text-[#F2EEE7]">3</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3 text-[#A89F91] font-semibold">New monthly revenue</td>
                  <td className="p-3 text-center text-green-400 font-bold">$25,000</td>
                  <td className="p-3 text-center text-green-400 font-bold">$50,000</td>
                  <td className="p-3 text-center text-green-400 font-bold">$75,000</td>
                </tr>
                <tr>
                  <td className="p-3 text-[#D4AF63] font-bold">ROI</td>
                  <td className="p-3 text-center text-[#D4AF63] font-bold">257x</td>
                  <td className="p-3 text-center text-[#D4AF63] font-bold text-lg">253x</td>
                  <td className="p-3 text-center text-[#D4AF63] font-bold">150x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="flex items-center gap-2 justify-center mb-8">
            <HelpCircle className="w-5 h-5 text-[#D4AF63]" />
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-[#1A1814] rounded-xl p-5 border border-white/5">
                <h4 className="font-semibold text-sm text-[#F2EEE7] mb-2">{item.q}</h4>
                <p className="text-sm text-[#A89F91] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-[#A89F91] hover:text-[#F2EEE7]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
