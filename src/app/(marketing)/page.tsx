import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Shield, Zap, MessageSquare, Database, Globe, Lock } from "lucide-react";

const FEATURES = [
  {
    title: "AI-Powered Routing",
    description:
      "Tickets are instantly classified and routed to the right team using AI — no manual triage required.",
    icon: Sparkles,
  },
  {
    title: "Smart SLA Tracking",
    description:
      "Business-hour-aware SLA clocks pause automatically on weekends and holidays.",
    icon: Zap,
  },
  {
    title: "Email Intake",
    description:
      "Your existing support inbox becomes a ticket queue — no change management needed.",
    icon: MessageSquare,
  },
  {
    title: "Enterprise Security",
    description:
      "SOC2-ready architecture with full audit trail and enterprise-grade security.",
    icon: Shield,
  },
  {
    title: "Knowledge Base",
    description:
      "AI suggests relevant articles when tickets are created — reduce resolution time dramatically.",
    icon: Database,
  },
  {
    title: "Global Scalability",
    description:
      "Built for teams of any size, from startups to enterprise organizations.",
    icon: Globe,
  },
];

const TESTIMONIALS = [
  {
    quote: "QueueDesk reduced our average response time by 60%. The AI routing is incredible.",
    author: "Sarah Chen",
    role: "Head of Support, TechCorp",
  },
  {
    quote: "Finally, a helpdesk that actually gets out of the way of our team.",
    author: "Marcus Rodriguez",
    role: "Engineering Manager, StartupXYZ",
  },
];

const TRUST_BADGES = [
  { name: "SOC2 Ready", icon: Shield },
  { name: "99.9% Uptime", icon: CheckCircle },
  { name: "Enterprise", icon: Lock },
  { name: "Global", icon: Globe },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-hidden">
      {/* Hero background gradient */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-slate-200/60 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">QueueDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors px-4 py-2 rounded-xl"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="premium-btn bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-blue-500/20"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/60 px-4 py-2 text-sm text-blue-700 mb-8 shadow-sm">
            <span className="pulse-dot relative flex h-2 w-2 rounded-full bg-emerald-500" />
            AI-powered · Multi-tenant · SLA-native
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Your team&apos;s support,
            <br />
            <span className="gradient-text">intelligently managed</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            QueueDesk is an AI-first internal service desk that routes,
            prioritizes, and resolves tickets automatically — before your
            team has to step in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/register"
              className="premium-btn bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3.5 text-base font-semibold rounded-xl hover:opacity-95 transition-all shadow-xl shadow-blue-500/25"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="border border-slate-200 bg-white text-slate-700 px-8 py-3.5 text-base font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              View demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-200 to-violet-200" />
              ))}
            </div>
            <span>Join 1,000+ teams transforming support</span>
          </div>
        </section>

        {/* Trust badges */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                <badge.icon className="w-4 h-4" />
                {badge.name}
              </div>
            ))}
          </div>
        </section>

        {/* Feature grid */}
        <section className="border-t border-slate-200/60 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything your team needs
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto text-lg">
                From email intake to SLA-aware routing — QueueDesk handles
                the operational complexity so your team can focus on answers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="premium-card rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Loved by support teams
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="premium-card bg-white border border-slate-200/70 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="premium-card bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-10 md:p-12 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                Ready to upgrade your support?
              </h2>
              <p className="text-blue-100 mb-8 max-w-md mx-auto text-lg">
                Set up your workspace in under 5 minutes. No infrastructure
                changes required.
              </p>
              <Link
                href="/register"
                className="premium-btn inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 text-base font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Q</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">QueueDesk</span>
              </div>
              <p className="text-slate-600 text-sm max-w-xs">
                AI-first internal service desk for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
            <span className="text-sm text-slate-500">© 2026 QueueDesk. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
