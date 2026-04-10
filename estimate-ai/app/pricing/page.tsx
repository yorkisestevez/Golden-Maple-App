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
    a: 'On Pro and Agency plans, our AI analyzes each homeowner\'s specific project combination and generates personalized design tips. It\'s like having a senior consultant review every estimate.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 noise">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gradient tracking-tight">
            EstimateAI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm mb-6">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-600 font-medium">14-day free trial on every plan</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
              One Lead Pays for a{' '}
              <span className="text-gradient">Full Year</span>
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
              Average outdoor living project: $15K–$45K. You do the math.
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover-lift ${
                plan.popular
                  ? 'bg-white border-2 border-blue-500 shadow-xl shadow-blue-600/15 glow-blue'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap uppercase tracking-wider shadow-lg shadow-blue-600/25">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>

              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-slate-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`group block w-full text-center py-3.5 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                    : 'border border-slate-200 text-slate-900 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
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
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center mb-20 bg-white border border-slate-200 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-slate-900">
              Risk-Free <span className="text-gradient">Guarantee</span>
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
              Try EstimateAI free for 14 days. No credit card, no commitment. If it doesn&apos;t generate leads, you pay nothing.
              If it does? You&apos;ll wonder how you ever lived without it.
            </p>
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 mb-20 shadow-sm">
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Quick ROI Math</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-500 font-medium" />
                  <th className="text-center p-3 text-slate-600 font-semibold">Standard</th>
                  <th className="text-center p-3 text-blue-600 font-bold">Pro</th>
                  <th className="text-center p-3 text-slate-600 font-semibold">Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">Monthly cost</td>
                  <td className="p-3 text-center text-slate-800">$97</td>
                  <td className="p-3 text-center text-slate-900 font-semibold">$197</td>
                  <td className="p-3 text-center text-slate-800">$497</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">Avg. project value</td>
                  <td className="p-3 text-center text-slate-800">$25K</td>
                  <td className="p-3 text-center text-slate-800">$25K</td>
                  <td className="p-3 text-center text-slate-800">$25K</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">Extra leads closed/month</td>
                  <td className="p-3 text-center text-slate-800">1</td>
                  <td className="p-3 text-center text-slate-800">2</td>
                  <td className="p-3 text-center text-slate-800">3</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 text-slate-700 font-medium">New monthly revenue</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">$25,000</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">$50,000</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">$75,000</td>
                </tr>
                <tr>
                  <td className="p-3 text-gradient font-bold">ROI</td>
                  <td className="p-3 text-center text-blue-600 font-bold">257x</td>
                  <td className="p-3 text-center text-blue-600 font-bold text-lg">253x</td>
                  <td className="p-3 text-center text-blue-600 font-bold">150x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <div className="flex items-center gap-2.5 justify-center mb-10">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
                <h4 className="font-semibold text-sm mb-2.5 text-slate-900">{item.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <h3 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight text-slate-900">
              Ready to <span className="text-gradient">Close More Leads</span>?
            </h3>
            <p className="text-slate-600 mb-8">Start free. Be live before your next coffee break.</p>
            <Link
              href="/signup"
              className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/25 pulse-ring"
            >
              Start Your 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="mt-6 flex items-center justify-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
