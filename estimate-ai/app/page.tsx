import Link from 'next/link';
import { ArrowRight, Zap, Palette, Users, BarChart3, Code2, Shield, Star, TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0E0A] text-[#F2EEE7]">
      {/* Nav */}
      <nav className="border-b border-white/10 sticky top-0 bg-[#0F0E0A]/95 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#D4AF63]" style={{ fontFamily: 'Georgia, serif' }}>
            EstimateAI
          </h1>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="#demo" className="text-sm text-[#A89F91] hover:text-[#F2EEE7] transition-colors">
              Live Demo
            </Link>
            <Link href="/pricing" className="text-sm text-[#A89F91] hover:text-[#F2EEE7] transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-[#A89F91] hover:text-[#F2EEE7] transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#D4AF63] text-[#0F0E0A] rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
          <Link
            href="/signup"
            className="sm:hidden px-4 py-2 bg-[#D4AF63] text-[#0F0E0A] rounded-lg text-sm font-medium"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#D4AF63]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF63]/10 border border-[#D4AF63]/20 rounded-full text-sm text-[#D4AF63] mb-6 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            Contractors are closing 3x more leads with AI estimates
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Stop Quoting.
            <br />
            Start <span className="text-[#D4AF63] relative">
              Closing
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="#D4AF63" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              </svg>
            </span>.
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-[#A89F91] max-w-2xl mx-auto leading-relaxed">
            Embed an AI-powered estimator on your website that gives homeowners instant project pricing.
            <strong className="text-[#F2EEE7]"> Your brand. Your pricing. Your leads.</strong> 24/7.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center px-8 py-4 bg-[#D4AF63] text-[#0F0E0A] rounded-xl text-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-[#D4AF63]/20 hover:shadow-[#D4AF63]/40"
            >
              Start Your 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center px-6 py-4 text-[#A89F91] hover:text-[#F2EEE7] transition-colors text-lg"
            >
              See it in action
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <p className="text-sm text-[#A89F91]/60 mt-4">No credit card required. Set up in under 15 minutes.</p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/5 bg-[#1A1814]/50">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: '$4.2M+', label: 'Estimates Generated', icon: DollarSign },
              { value: '6,800+', label: 'Leads Captured', icon: Users },
              { value: '< 60s', label: 'Average Estimate Time', icon: Clock },
              { value: '340%', label: 'Avg Lead Increase', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-[#D4AF63]" />
                  <span className="text-2xl sm:text-3xl font-bold text-[#F2EEE7]">{stat.value}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#A89F91]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE DEMO
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              Try It <span className="text-[#D4AF63]">Right Now</span>
            </h3>
            <p className="mt-3 text-[#A89F91] max-w-xl mx-auto">
              This is exactly what your customers will see. Select some features, set dimensions, and watch the magic happen.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-[#D4AF63]/20 overflow-hidden shadow-2xl shadow-[#D4AF63]/5">
            <div className="bg-[#1A1814] px-4 py-2 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-[#A89F91] ml-2">yourcompany.com/estimate</span>
            </div>
            <iframe
              src="/estimator/demo"
              className="w-full border-0"
              style={{ minHeight: '700px', colorScheme: 'normal' }}
              title="Live Demo Estimator"
              loading="lazy"
            />
          </div>

          <p className="text-center text-sm text-[#A89F91] mt-4">
            This demo uses sample pricing. Your estimator uses <strong className="text-[#F2EEE7]">your real rates</strong>.
          </p>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#D4AF63]/10 via-[#1A1814] to-[#1A1814] rounded-2xl border border-[#D4AF63]/20 p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              The Math Is <span className="text-[#D4AF63]">Stupid Simple</span>
            </h3>
            <p className="text-center text-[#A89F91] mb-8">Here&apos;s why this pays for itself before lunch.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-[#F2EEE7]">$197<span className="text-lg text-[#A89F91]">/mo</span></div>
                <p className="text-sm text-[#A89F91]">Pro plan cost</p>
              </div>
              <div className="space-y-2 sm:border-x sm:border-white/10">
                <div className="text-4xl font-bold text-[#D4AF63]">1 lead</div>
                <p className="text-sm text-[#A89F91]">Average outdoor living project: <strong className="text-[#F2EEE7]">$15K–$45K</strong></p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-400">75x ROI</div>
                <p className="text-sm text-[#A89F91]">Close just one extra lead per month</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[#A89F91] text-sm">
                Most contractors close <strong className="text-[#F2EEE7]">2–5 extra leads per month</strong> from their estimator.
                That&apos;s <strong className="text-[#D4AF63]">$30K–$225K in new revenue</strong> from a $197/month tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              Everything You Need to{' '}
              <span className="text-[#D4AF63]">Dominate Your Market</span>
            </h3>
            <p className="mt-3 text-[#A89F91] max-w-xl mx-auto">
              While your competitors are playing phone tag, your website is closing deals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Estimates',
                desc: 'Homeowners select features, set dimensions, choose a quality tier, and get a real estimate — all in under 60 seconds. No waiting. No phone calls.',
                highlight: 'Most popular feature',
              },
              {
                icon: Palette,
                title: 'Your Brand, Zero Compromise',
                desc: 'Your logo. Your colors. Your fonts. Your company name. Homeowners will never know it\'s EstimateAI behind the scenes.',
              },
              {
                icon: Users,
                title: 'Pre-Qualified Leads',
                desc: 'Every lead comes with full project scope, budget expectations, and contact info. No more "just looking" — these people are ready to buy.',
                highlight: 'Avg 3x higher close rate',
              },
              {
                icon: BarChart3,
                title: 'AI Design Insights',
                desc: 'Claude AI analyzes each project combination and delivers expert design tips that make you look like a genius. Homeowners share these with their spouses.',
              },
              {
                icon: Code2,
                title: 'One Line of Code',
                desc: 'Copy. Paste. Done. Works on WordPress, Squarespace, Wix, custom sites — literally anything. Mobile-first, zero CSS conflicts.',
              },
              {
                icon: Shield,
                title: 'Your Pricing, Your Rules',
                desc: 'Set your own labor rates, material costs, tier multipliers, and rounding rules. The math is yours — we just make it beautiful.',
              },
            ].map((feature) => (
              <div key={feature.title} className="group bg-[#1A1814] rounded-xl p-6 border border-white/5 hover:border-[#D4AF63]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF63]/5">
                <feature.icon className="w-10 h-10 text-[#D4AF63] mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-[#A89F91] text-sm leading-relaxed">{feature.desc}</p>
                {feature.highlight && (
                  <span className="inline-block mt-3 text-xs px-2.5 py-1 bg-[#D4AF63]/10 text-[#D4AF63] rounded-full font-medium">
                    {feature.highlight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Live in <span className="text-[#D4AF63]">15 Minutes</span>. Seriously.
          </h3>
          <p className="text-center text-[#A89F91] mb-12 max-w-xl mx-auto">
            No developers needed. No IT department. If you can copy-paste, you can do this.
          </p>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                desc: 'Sign up with your email. Your 14-day free trial starts immediately — no credit card.',
                time: '2 min',
              },
              {
                step: '2',
                title: 'Make It Yours',
                desc: 'Upload your logo, pick your brand colors, and set your company name. Preview it instantly.',
                time: '5 min',
              },
              {
                step: '3',
                title: 'Set Your Pricing',
                desc: 'Enter your labor rates and material costs — or start with our industry-standard defaults and tweak later.',
                time: '5 min',
              },
              {
                step: '4',
                title: 'Embed & Start Getting Leads',
                desc: 'Copy one line of code to your website. That\'s it. Leads start flowing to your inbox and dashboard.',
                time: '3 min',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5 bg-[#1A1814] rounded-xl p-5 border border-white/5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF63] text-[#0F0E0A] flex items-center justify-center text-xl font-bold shadow-lg shadow-[#D4AF63]/20">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-[#A89F91]">~{item.time}</span>
                  </div>
                  <p className="text-[#A89F91] mt-1 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After comparison */}
      <section className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Georgia, serif' }}>
            Your Website <span className="text-[#A89F91]">Without</span> vs <span className="text-[#D4AF63]">With</span> EstimateAI
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[#1A1814] rounded-xl p-6 border border-red-500/20">
              <h4 className="text-red-400 font-bold text-lg mb-4">Without EstimateAI</h4>
              <ul className="space-y-3 text-sm">
                {[
                  'Visitor lands on your site',
                  'Reads some text, looks at photos',
                  'Thinks "I\'ll call later"',
                  'Forgets. Finds a competitor.',
                  'You never knew they existed',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#A89F91]">
                    <span className="text-red-400 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <span className="text-red-400 font-bold text-xl">$0 revenue</span>
                <p className="text-xs text-[#A89F91] mt-1">Another lost opportunity</p>
              </div>
            </div>
            <div className="bg-[#1A1814] rounded-xl p-6 border border-[#D4AF63]/30 shadow-lg shadow-[#D4AF63]/5">
              <h4 className="text-[#D4AF63] font-bold text-lg mb-4">With EstimateAI</h4>
              <ul className="space-y-3 text-sm">
                {[
                  'Visitor lands on your site',
                  'Clicks "Get Instant Estimate" — hooked',
                  'Selects patio + firepit + lighting',
                  'Gets $28K–$35K estimate with AI tips',
                  'Submits name & phone — YOU get the lead',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#F2EEE7]">
                    <CheckCircle className="w-4 h-4 text-[#D4AF63] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <span className="text-[#D4AF63] font-bold text-xl">$28K+ project</span>
                <p className="text-xs text-[#A89F91] mt-1">Pre-qualified, budget-aware lead</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Don&apos;t Take Our Word For It
          </h3>
          <p className="text-[#A89F91] mb-12">Hear from contractors who made the switch.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote: 'We went from 2-3 leads a week to 2-3 a DAY. The estimator paid for itself with the first lead. My only regret is not starting sooner.',
                name: 'Mike Rodriguez',
                company: 'Summit Hardscapes',
                metric: '340% more leads',
              },
              {
                quote: 'Homeowners love getting an instant number. It filters out tire-kickers and brings us serious buyers who already know their budget. Game changer.',
                name: 'Sarah Thompson',
                company: 'GreenStone Outdoor Living',
                metric: '$180K in first 90 days',
              },
              {
                quote: 'Setup took 10 minutes. The AI insights blow people away — homeowners literally screenshot them and send to their spouse. Best tool in our stack.',
                name: 'Dave Kowalski',
                company: 'Premier Landscapes Inc.',
                metric: '4.9★ customer rating',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-[#1A1814] rounded-xl p-6 border border-white/5 text-left flex flex-col">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF63] text-[#D4AF63]" />
                  ))}
                </div>
                <p className="text-sm text-[#A89F91] italic leading-relaxed flex-1">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-[#A89F91]">{testimonial.company}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-[#D4AF63]/10 text-[#D4AF63] rounded-full font-medium">
                    {testimonial.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF63]/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h3 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Your Competitors Are Reading This Too.
            <br />
            <span className="text-[#D4AF63]">Move First.</span>
          </h3>
          <p className="text-lg text-[#A89F91] mb-8 max-w-xl mx-auto">
            Every day without an estimator on your site is money left on the table.
            Start your free trial and have it live before your next coffee break.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center px-10 py-5 bg-[#D4AF63] text-[#0F0E0A] rounded-xl text-xl font-bold hover:brightness-110 transition-all shadow-xl shadow-[#D4AF63]/20 hover:shadow-[#D4AF63]/40"
          >
            Start Your 14-Day Free Trial
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[#A89F91]">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Live in 15 minutes</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-[#D4AF63] mb-1" style={{ fontFamily: 'Georgia, serif' }}>EstimateAI</p>
            <p className="text-xs text-[#A89F91]">&copy; {new Date().getFullYear()} EstimateAI. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-[#A89F91]">
            <Link href="/pricing" className="hover:text-[#F2EEE7] transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-[#F2EEE7] transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-[#F2EEE7] transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
