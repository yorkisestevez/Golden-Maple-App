'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExpensiveButton } from '@/components/ui/ExpensiveButton';
import { PerformanceGraph } from '@/components/ui/PerformanceGraph';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { ArrowRight, Zap, Palette, Users, BarChart3, Code2, Shield, Star, CheckCircle, Sparkles, LayoutDashboard } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-blue-500/10">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              EstimateAI
            </h1>
          </motion.div>
          <div className="hidden sm:flex items-center gap-8">
            <Link href="#demo" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors tracking-wide">
              LIVE DEMO
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors tracking-wide">
              PRICING
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors tracking-wide">
              LOGIN
            </Link>
            <Link href="/signup">
              <ExpensiveButton size="sm" variant="primary">
                START FREE TRIAL
              </ExpensiveButton>
            </Link>
          </div>
          <Link href="/signup" className="sm:hidden">
            <ExpensiveButton size="sm" variant="primary">START</ExpensiveButton>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-48 sm:pb-32 lg:pt-64 lg:pb-48 relative overflow-hidden bg-white">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[140px] pointer-events-none" />
        
        <motion.div 
          className="max-w-5xl mx-auto px-4 text-center relative"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-600 mb-10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-slate-500 font-medium">Contractors are closing</span>
            <span className="text-slate-900 font-bold tracking-tight">3X MORE LEADS</span>
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-6xl sm:text-7xl lg:text-[100px] font-black leading-[0.9] tracking-tighter mb-10 text-slate-900"
          >
            Quoting at the speed of
            <br />
            <span className="text-blue-600 italic">your ambition.</span>
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="mt-8 text-xl sm:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light"
          >
            The world's first AI Neural pricing engine for elite contractors.
            <span className="text-slate-900 font-medium"> Instant estimates. Real leads. Zero friction.</span>
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup">
              <ExpensiveButton size="xl" variant="primary">
                START 14-DAY FREE TRIAL
                <ArrowRight className="w-5 h-5 ml-2" />
              </ExpensiveButton>
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center px-6 py-4 text-slate-500 hover:text-slate-900 transition-all text-lg font-medium group"
            >
              See the demo
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center ml-3 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xs text-slate-400 mt-8 tracking-[0.2em] uppercase font-bold"
          >
            Risk-free &middot; Built for the trades
          </motion.p>
        </motion.div>
      </section>

      {/* Private Beta band */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-black tracking-[0.2em] uppercase text-blue-700 mb-4">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Private Beta — Launching 2026
          </div>
          <p className="text-lg sm:text-xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Building the AI estimator purpose-built for outdoor living contractors.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Join the waitlist
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      {/* Neural Velocity Visualization */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-[10px] text-blue-700 mb-2 font-black tracking-widest uppercase">
                Neural Performance Metrics
              </div>
              <h3 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                Visualizing <br />
                <span className="text-blue-600 italic">Profit Velocity.</span>
              </h3>
              <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
                Our AI doesn't just calculate numbers—it maps market demand and pricing elasticity in real-time. Witness your lead-to-close ratio accelerate.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Computational Speed</div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">0.02ms</div>
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Accuracy Variance</div>
                  <div className="text-3xl font-black text-blue-600 tracking-tight">±0.4%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-lg font-black text-slate-900 tracking-tight italic">Net Profit Projection</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Market Analysis Active</div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
                  +124% UPSIDE
                </div>
              </div>
              
              <PerformanceGraph />
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Phase 01: Setup</span>
                <span className="text-blue-600">Phase 02: Expansion</span>
                <span>Phase 03: Dominance</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Live Demo */}
      <section id="demo" className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-600 mb-5 font-bold">
              LIVE PREVIEW
            </div>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              The Client Experience
            </h3>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              This is the Neural Pricing Engine embedded on your site. Clean. Fast. Professional.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[10px] text-slate-400 font-mono">https://your-contractor-site.com/estimate</span>
              </div>
            </div>
            <div className="bg-white">
              <iframe
                src="/estimator/demo"
                className="w-full border-0"
                style={{ minHeight: '800px' }}
                title="Live Demo Estimator"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-[3rem] p-12 sm:p-20 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            
            <div className="relative">
              <h3 className="text-3xl sm:text-5xl font-black text-center mb-14 tracking-tight text-slate-900">
                It's Not a Cost. <br />
                <span className="text-blue-600 italic">It's a Profit Engine.</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
                <div className="space-y-4">
                  <div className="text-5xl font-black tracking-tighter text-slate-900">$197<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Fixed Investment</p>
                </div>
                <div className="space-y-4 border-y sm:border-y-0 sm:border-x border-slate-100 py-8 sm:py-0">
                  <div className="text-5xl font-black text-blue-600 tracking-tighter">1 Lead</div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">To Break Even</p>
                </div>
                <div className="space-y-4">
                  <div className="text-5xl font-black text-emerald-500 tracking-tighter">120x</div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Average Annual ROI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h3 className="text-4xl sm:text-7xl font-black tracking-tighter mb-8 text-slate-900">
              Built for <span className="text-blue-600">Growth.</span>
            </h3>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-xl">
              Professional tools for contractors who don't have time for manual spreadsheets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Neural Estimation',
                desc: 'Highly accurate project algorithms based on real-world labor and material rates.',
                color: 'blue'
              },
              {
                icon: Shield,
                title: 'Verified Pricing',
                desc: 'Update your rates in seconds. Your math, mapped to a beautiful client interface.',
                color: 'emerald'
              },
              {
                icon: Users,
                title: 'Lead Enrichment',
                desc: 'Captures full project scope, dimensions, and tier preferences with every contact.',
                color: 'blue'
              },
              {
                icon: BarChart3,
                title: 'Market Insights',
                desc: 'AI analyzes local project trends to help you optimize your service margins.',
                color: 'blue'
              },
              {
                icon: Code2,
                title: 'Universal Embed',
                desc: 'Works on any website platform. One line of code to future-proof your sales funnel.',
                color: 'blue'
              },
              {
                icon: LayoutDashboard,
                title: 'Contractor CRM',
                desc: 'A dedicated control center to manage every project request and lead flow.',
                color: 'emerald'
              },
            ].map((feature) => (
              <SpotlightCard key={feature.title} className="hover:-translate-y-2 transition-transform duration-500">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-all ${
                  feature.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'
                }`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-black mb-4 tracking-tight text-slate-900">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of Performance Gallery */}
      <section className="py-32 relative overflow-hidden bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-7xl font-black mb-6 tracking-tighter text-slate-900">
              The Gold Standard <br />
              <span className="text-blue-600 italic">of Contractor Tools.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Elite Consultation",
                desc: "Data-backed estimates that build immediate homeowner trust.",
                img: "/images/success-contractor.png",
                label: "THE PROCESS"
              },
              {
                title: "Architectural Precision",
                desc: "High-end visualizations for complex project scopes.",
                img: "/images/success-result.png",
                label: "THE RESULT"
              },
              {
                title: "Seamless Payouts",
                desc: "Accelerate your cash flow with professional lead routing.",
                img: "/images/success-payment.png",
                label: "THE PAYOUT"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl transition-all duration-700 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-10 w-full">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 rounded-full">
                      {item.label}
                    </span>
                    <h4 className="text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-base font-medium italic">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Showcase */}
      <section className="py-32 sm:py-48 relative overflow-hidden bg-white">
        <motion.div
          className="max-w-4xl mx-auto px-4 text-center relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-5xl sm:text-8xl font-black mb-10 leading-[0.85] tracking-tighter text-slate-900">
            See It Run <br />
            <span className="text-blue-600">Right Now.</span>
          </h3>
          <p className="text-xl text-slate-500 mb-16 max-w-xl mx-auto font-medium leading-relaxed">
            This is the actual estimator your customers will use. No signup, no gimmicks — try it in the browser below.
          </p>

          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[10px] text-slate-400 font-mono">https://your-contractor-site.com/estimate</span>
              </div>
            </div>
            <div className="bg-white">
              <iframe
                src="/estimator/demo"
                className="w-full border-0"
                style={{ minHeight: '800px' }}
                title="Live Demo Estimator"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Proof of Performance Gallery */}
      <section className="py-32 relative overflow-hidden bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-7xl font-black mb-6 tracking-tighter text-slate-900">
              The Gold Standard <br />
              <span className="text-blue-600 italic">of Contractor Tools.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Elite Consultation",
                desc: "Data-backed estimates that build immediate homeowner trust.",
                img: "/images/success-contractor.png",
                label: "THE PROCESS"
              },
              {
                title: "Architectural Precision",
                desc: "High-end visualizations for complex project scopes.",
                img: "/images/success-result.png",
                label: "THE RESULT"
              },
              {
                title: "Seamless Payouts",
                desc: "Accelerate your cash flow with professional lead routing.",
                img: "/images/success-payment.png",
                label: "THE PAYOUT"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl transition-all duration-700 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-10 w-full">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 rounded-full">
                      {item.label}
                    </span>
                    <h4 className="text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-base font-medium italic">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 sm:py-48 relative overflow-hidden bg-white">
        <motion.div 
          className="max-w-4xl mx-auto px-4 text-center relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-5xl sm:text-8xl font-black mb-10 leading-[0.85] tracking-tighter text-slate-900">
            Dominate Your <br />
            <span className="text-blue-600">Local Market.</span>
          </h3>
          <p className="text-xl text-slate-500 mb-16 max-w-xl mx-auto font-medium leading-relaxed">
            Stop losing leads to the person who answers their phone first. 
            Automate your pricing today.
          </p>
          <Link href="/signup">
            <ExpensiveButton size="xl" variant="primary" className="pulse-ring">
              START YOUR 14-DAY FREE TRIAL
              <ArrowRight className="w-6 h-6 ml-3" />
            </ExpensiveButton>
          </Link>
          <div className="mt-16 flex flex-wrap justify-center gap-10 text-[11px] text-slate-400 font-bold tracking-[0.2em] uppercase">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> INSTANT ACCESS</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> CANCEL ANYTIME</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start justify-between gap-12">
          <div>
            <p className="text-3xl font-black text-slate-900 mb-2">EstimateAI</p>
            <p className="text-slate-500 font-medium">&copy; 2026 TradeFlow AI Systems. <br />Professional Grade Software for High-Ticket Trades.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Platform</p>
              <div className="flex flex-col gap-2">
                <Link href="/pricing" className="text-slate-500 hover:text-blue-600 font-medium">Pricing</Link>
                <Link href="#demo" className="text-slate-500 hover:text-blue-600 font-medium">Demo</Link>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Account</p>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-slate-500 hover:text-blue-600 font-medium">Login</Link>
                <Link href="/signup" className="text-slate-500 hover:text-blue-600 font-medium">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
