import Link from 'next/link';
import { ArrowRight, Zap, Palette, Users, BarChart3, Code2, Shield, Star, TrendingUp, Clock, DollarSign, CheckCircle, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAF9] noise">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient tracking-tight">
            EstimateAI
          </h1>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="#demo" className="text-sm text-white/50 hover:text-white transition-colors">
              Live Demo
            </Link>
            <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF63] to-[#C49B4A] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-[#D4AF63]/10"
            >
              Start Free Trial
            </Link>
          </div>
          <Link
            href="/signup"
            className="sm:hidden px-4 py-2 bg-gradient-to-r from-[#D4AF63] to-[#C49B4A] text-[#0A0A0A] rounded-lg text-sm font-semibold"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#D4AF63]/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF63]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF63]/20 to-transparent" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-[#D4AF63] mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-white/70">Contractors are closing</span>
            <span className="font-semibold">3x more leads</span>
            <span className="text-white/70">with AI estimates</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight">
            Stop Quoting.
            <br />
            <span className="text-gradient">Start Closing.</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
            Embed an AI-powered estimator on your website that gives homeowners instant project pricing.
            <span className="text-white/80 font-normal"> Your brand. Your pricing. Your leads.</span> 24/7.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D4AF63] to-[#C49B4A] text-[#0A0A0A] rounded-xl text-lg font-bold hover:brightness-110 transition-all shadow-xl shadow-[#D4AF63]/20 hover:shadow-[#D4AF63]/30"
            >
              Start Your 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center px-6 py-4 text-white/50 hover:text-white transition-colors text-lg font-light"
            >
              See it in action
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <p className="text-sm text-white/30 mt-5">No credit card required &middot; Live in 15 minutes</p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '$4.2M+', label: 'Estimates Generated', icon: DollarSign },
              { value: '6,800+', label: 'Leads Captured', icon: Users },
              { value: '< 60s', label: 'Average Estimate Time', icon: Clock },
              { value: '340%', label: 'Avg Lead Increase', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <stat.icon className="w-4 h-4 text-[#D4AF63]/60" />
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/30 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 mb-5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              LIVE DEMO
            </div>
            <h3 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Try It <span className="text-gradient">Right Now</span>
            </h3>
            <p className="mt-4 text-white/40 max-w-xl mx-auto font-light">
              This is exactly what your customers will see. Select features, set dimensions, and watch the magic.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden glow-gold">
            <div className="glass-strong px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-white/20 bg-white/5 px-3 py-0.5 rounded-full">yourcompany.com/estimate</span>
              </div>
            </div>
            <iframe
              src="/estimator/demo"
              className="w-full border-0"
              style={{ minHeight: '700px', colorScheme: 'normal' }}
              title="Live Demo Estimator"
              loading="lazy"
            />
          </div>

          <p className="text-center text-sm text-white/25 mt-5 font-light">
            Demo uses sample pricing. Your estimator uses <span className="text-white/50">your real rates</span>.
          </p>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14">
            {/* Glass background */}
            <div className="absolute inset-0 glass-strong rounded-3xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF63]/30 to-transparent" />

            <div className="relative">
              <h3 className="text-2xl sm:text-4xl font-bold text-center mb-2 tracking-tight">
                The Math Is <span className="text-gradient">Stupid Simple</span>
              </h3>
              <p className="text-center text-white/30 mb-10 font-light">Here&apos;s why this pays for itself before lunch.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold tracking-tight">$197<span className="text-lg text-white/30 font-light">/mo</span></div>
                  <p className="text-sm text-white/30 font-light">Pro plan cost</p>
                </div>
                <div className="space-y-2 sm:border-x sm:border-white/5 sm:px-6">
                  <div className="text-4xl sm:text-5xl font-bold text-gradient tracking-tight">1 lead</div>
                  <p className="text-sm text-white/30 font-light">Avg project: <span className="text-white/50">$15K–$45K</span></p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold text-emerald-400 tracking-tight">75x</div>
                  <p className="text-sm text-white/30 font-light">ROI from one extra lead</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-white/30 text-sm font-light">
                  Most contractors close <span className="text-white/60">2–5 extra leads/month</span>.
                  That&apos;s <span className="text-gradient font-semibold">$30K–$225K in new revenue</span> from a $197/month tool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Everything to{' '}
              <span className="text-gradient">Dominate Your Market</span>
            </h3>
            <p className="mt-4 text-white/30 max-w-xl mx-auto font-light">
              While your competitors play phone tag, your website is closing deals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                title: 'Instant Estimates',
                desc: 'Select features, set dimensions, choose quality — get a real estimate in under 60 seconds. No calls. No waiting.',
                highlight: 'Most popular',
              },
              {
                icon: Palette,
                title: 'Your Brand, Zero Compromise',
                desc: 'Your logo. Your colors. Your fonts. Homeowners will never know there\'s a platform behind it.',
              },
              {
                icon: Users,
                title: 'Pre-Qualified Leads',
                desc: 'Every lead includes full project scope, budget range, and contact info. No more tire-kickers.',
                highlight: '3x higher close rate',
              },
              {
                icon: BarChart3,
                title: 'AI Design Insights',
                desc: 'Our AI analyzes each project and delivers expert design tips that make you look like a genius.',
              },
              {
                icon: Code2,
                title: 'One Line of Code',
                desc: 'Copy. Paste. Done. WordPress, Squarespace, Wix — literally anything. Mobile-first.',
              },
              {
                icon: Shield,
                title: 'Your Pricing, Your Rules',
                desc: 'Set your own labor rates, materials, tier multipliers. Your math, made beautiful.',
              },
            ].map((feature) => (
              <div key={feature.title} className="group glass rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF63]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF63]/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#D4AF63]" />
                </div>
                <h4 className="text-base font-semibold mb-2">{feature.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed font-light">{feature.desc}</p>
                {feature.highlight && (
                  <span className="inline-block mt-3 text-[11px] px-2.5 py-1 bg-[#D4AF63]/10 text-[#D4AF63] rounded-full font-medium uppercase tracking-wider">
                    {feature.highlight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-3xl sm:text-5xl font-bold text-center mb-3 tracking-tight">
            Live in <span className="text-gradient">15 Minutes</span>
          </h3>
          <p className="text-center text-white/30 mb-14 font-light">
            No developers needed. If you can copy-paste, you can do this.
          </p>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up and start your 14-day free trial. No credit card.', time: '2 min' },
              { step: '02', title: 'Make It Yours', desc: 'Upload your logo, pick your colors, and preview it instantly.', time: '5 min' },
              { step: '03', title: 'Set Your Pricing', desc: 'Enter labor rates and material costs — or start with industry defaults.', time: '5 min' },
              { step: '04', title: 'Embed & Go', desc: 'Copy one line of code. Leads start flowing to your dashboard.', time: '3 min' },
            ].map((item) => (
              <div key={item.step} className="glass rounded-2xl p-5 flex items-start gap-5 hover:bg-white/[0.04] transition-all">
                <span className="text-[#D4AF63]/30 text-3xl font-bold tracking-tighter shrink-0 w-10">{item.step}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold">{item.title}</h4>
                    <span className="text-[11px] px-2 py-0.5 bg-white/5 rounded-full text-white/30 font-light">{item.time}</span>
                  </div>
                  <p className="text-white/35 mt-1 text-sm font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl sm:text-5xl font-bold text-center mb-14 tracking-tight">
            <span className="text-white/30">Without</span> vs <span className="text-gradient">With</span> EstimateAI
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 border-red-500/10">
              <h4 className="text-red-400/80 font-semibold text-sm uppercase tracking-wider mb-5">Without EstimateAI</h4>
              <ul className="space-y-3 text-sm">
                {[
                  'Visitor lands on your site',
                  'Reads some text, looks at photos',
                  'Thinks "I\'ll call later"',
                  'Forgets. Finds a competitor.',
                  'You never knew they existed',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/30 font-light">
                    <span className="text-red-400/60 mt-0.5 text-xs">&#x2715;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-5 border-t border-white/5 text-center">
                <span className="text-red-400/60 font-bold text-lg">$0 revenue</span>
              </div>
            </div>
            <div className="relative rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 glass-strong rounded-2xl" />
              <div className="absolute inset-0 rounded-2xl border border-[#D4AF63]/20" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF63]/40 to-transparent" />
              <div className="relative">
                <h4 className="text-[#D4AF63] font-semibold text-sm uppercase tracking-wider mb-5">With EstimateAI</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    'Visitor lands on your site',
                    'Clicks "Get Instant Estimate" — hooked',
                    'Selects patio + firepit + lighting',
                    'Gets $28K–$35K estimate with AI tips',
                    'Submits name & phone — YOU get the lead',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 font-light">
                      <CheckCircle className="w-4 h-4 text-[#D4AF63]/70 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 border-t border-white/10 text-center">
                  <span className="text-gradient font-bold text-lg">$28K+ project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-3xl sm:text-5xl font-bold text-center mb-3 tracking-tight">
            Don&apos;t Take Our Word For It
          </h3>
          <p className="text-center text-white/30 mb-14 font-light">Hear from contractors who made the switch.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                quote: 'We went from 2-3 leads a week to 2-3 a DAY. The estimator paid for itself with the first lead. My only regret is not starting sooner.',
                name: 'Mike Rodriguez',
                company: 'Summit Hardscapes',
                metric: '340% more leads',
              },
              {
                quote: 'Homeowners love getting an instant number. It filters out tire-kickers and brings us serious buyers who already know their budget.',
                name: 'Sarah Thompson',
                company: 'GreenStone Outdoor Living',
                metric: '$180K in 90 days',
              },
              {
                quote: 'Setup took 10 minutes. The AI insights blow people away — homeowners screenshot them and send to their spouse. Best tool in our stack.',
                name: 'Dave Kowalski',
                company: 'Premier Landscapes Inc.',
                metric: '4.9 star rating',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="glass rounded-2xl p-6 flex flex-col hover-lift">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF63] text-[#D4AF63]" />
                  ))}
                </div>
                <p className="text-sm text-white/40 leading-relaxed flex-1 font-light">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-white/25 font-light">{testimonial.company}</p>
                  <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 bg-[#D4AF63]/10 text-[#D4AF63] rounded-full font-medium">
                    {testimonial.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF63]/[0.03] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF63]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h3 className="text-3xl sm:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
            Your Competitors Are
            <br />
            Reading This Too.
            <br />
            <span className="text-gradient">Move First.</span>
          </h3>
          <p className="text-lg text-white/30 mb-10 max-w-xl mx-auto font-light leading-relaxed">
            Every day without an estimator is money left on the table.
            Start free and have it live before your next coffee break.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-[#D4AF63] to-[#C49B4A] text-[#0A0A0A] rounded-2xl text-xl font-bold hover:brightness-110 transition-all shadow-2xl shadow-[#D4AF63]/15 hover:shadow-[#D4AF63]/25 pulse-ring"
          >
            Start Your 14-Day Free Trial
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-white/25 font-light">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500/50" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500/50" /> Live in 15 minutes</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500/50" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-gradient mb-0.5">EstimateAI</p>
            <p className="text-[11px] text-white/20 font-light">&copy; {new Date().getFullYear()} EstimateAI. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-white/25 font-light">
            <Link href="/pricing" className="hover:text-white/50 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white/50 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white/50 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
