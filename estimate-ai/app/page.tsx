import Link from 'next/link';
import { ArrowRight, Zap, Palette, Users, BarChart3, Code2, Shield, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0E0A] text-[#F2EEE7]">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#D4AF63]" style={{ fontFamily: 'Georgia, serif' }}>
            EstimateAI
          </h1>
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 bg-[#D4AF63]/10 border border-[#D4AF63]/20 rounded-full text-sm text-[#D4AF63] mb-6">
            AI-Powered Estimates in 60 Seconds
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Turn Your Website Into a{' '}
            <span className="text-[#D4AF63]">Lead Machine</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-[#A89F91] max-w-2xl mx-auto">
            Give homeowners instant project estimates with your pricing, your brand, and your leads.
            The AI-powered estimator that works while you sleep.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-[#D4AF63] text-[#0F0E0A] rounded-xl text-lg font-bold hover:brightness-110 transition-all"
            >
              Start Your 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <p className="text-sm text-[#A89F91]">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              Everything You Need to <span className="text-[#D4AF63]">Capture More Leads</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Estimates',
                desc: 'Homeowners select features, set dimensions, choose a tier, and get a real estimate in under 60 seconds.',
              },
              {
                icon: Palette,
                title: 'Your Brand, Your Way',
                desc: 'Custom logo, colors, fonts, and company name. It looks like YOUR tool, not ours.',
              },
              {
                icon: Users,
                title: 'Lead Capture Built In',
                desc: 'Every estimate ends with a lead form. Name, phone, email, and project scope — delivered straight to you.',
              },
              {
                icon: BarChart3,
                title: 'AI Design Insights',
                desc: 'Claude AI analyzes each project and provides smart design tips that impress homeowners and build trust.',
              },
              {
                icon: Code2,
                title: 'Embed Anywhere',
                desc: 'One script tag. Works on any website. Responsive on mobile. Zero CSS conflicts.',
              },
              {
                icon: Shield,
                title: 'Your Pricing Data',
                desc: 'Set your own labor rates, material costs, and tier multipliers. The math is yours — we just make it beautiful.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-[#1A1814] rounded-xl p-6 border border-white/5">
                <feature.icon className="w-10 h-10 text-[#D4AF63] mb-4" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-[#A89F91] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-16" style={{ fontFamily: 'Georgia, serif' }}>
            Live in <span className="text-[#D4AF63]">15 Minutes</span>
          </h3>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account and start your 14-day free trial. No credit card.' },
              { step: '2', title: 'Brand It', desc: 'Upload your logo, set your colors, and customize your estimator.' },
              { step: '3', title: 'Set Your Pricing', desc: 'Enter your labor rates, material costs, and tiers — or use our defaults.' },
              { step: '4', title: 'Embed & Go', desc: 'Copy one line of code to your website. Start capturing leads immediately.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF63] text-[#0F0E0A] flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{item.title}</h4>
                  <p className="text-[#A89F91] mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-12" style={{ fontFamily: 'Georgia, serif' }}>
            Trusted by <span className="text-[#D4AF63]">Contractors</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote: 'We went from 2-3 leads a week to 2-3 a day. The estimator pays for itself in one lead.',
                name: 'Mike R.',
                company: 'Summit Hardscapes',
              },
              {
                quote: 'Homeowners love getting an instant number. It filters tire-kickers and brings serious buyers.',
                name: 'Sarah T.',
                company: 'GreenStone Outdoor',
              },
              {
                quote: 'Setup took 10 minutes. The AI insights blow people away. Best tool in our stack.',
                name: 'Dave K.',
                company: 'Premier Landscapes',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-[#1A1814] rounded-xl p-6 border border-white/5 text-left">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF63] text-[#D4AF63]" />
                  ))}
                </div>
                <p className="text-sm text-[#A89F91] italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-[#A89F91]">{testimonial.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to <span className="text-[#D4AF63]">Grow Your Business</span>?
          </h3>
          <p className="text-lg text-[#A89F91] mb-8">
            Join contractors who are capturing more leads, closing more deals, and spending less time on quotes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-[#D4AF63] text-[#0F0E0A] rounded-xl text-lg font-bold hover:brightness-110 transition-all"
          >
            Start Your 14-Day Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#A89F91]">
            &copy; {new Date().getFullYear()} EstimateAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#A89F91]">
            <Link href="/pricing" className="hover:text-[#F2EEE7] transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-[#F2EEE7] transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
