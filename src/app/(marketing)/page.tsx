import Link from "next/link";

const FEATURES = [
  {
    title: "AI-Powered Routing",
    description:
      "Tickets are instantly classified and routed to the right team using AI — no manual triage.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
  },
  {
    title: "Smart SLA Tracking",
    description:
      "Business-hour-aware SLA clocks pause automatically on weekends and holidays.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Email Intake",
    description:
      "Your existing support inbox becomes a ticket queue — no change management required.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Multi-Channel",
    description:
      "Handle requests from email, web form, and chat — all in one unified workspace.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Knowledge Base",
    description:
      "AI suggests relevant articles when tickets are created — reduce resolution time dramatically.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0 6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Full Audit Trail",
    description:
      "Every change is immutably logged with cryptographic signatures — compliance-ready out of the box.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">QueueDesk</span>
          <div className="flex gap-1 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-foreground px-5 py-2 text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            AI-powered · Multi-tenant · SLA-native
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Your team&apos;s support,
            <br />
            <span className="text-primary">intelligently managed</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            QueueDesk is an AI-first internal service desk that routes,
            prioritises, and resolves tickets automatically — before your
            team has to step in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="rounded-full bg-foreground text-background px-8 py-3.5 text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-border px-8 py-3.5 text-base font-medium hover:bg-muted transition-colors"
            >
              View live demo
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 14-day free trial
          </p>
        </section>

        {/* Feature grid */}
        <section className="border-t border-border/50 bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Everything your team needs
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                From email intake to SLA-aware routing — QueueDesk handles
                the operational complexity so your team can focus on answers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-border/50 bg-background p-6 space-y-3 hover:border-primary/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to upgrade your support?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            Set up your workspace in under 5 minutes. No infrastructure
            changes required.
          </p>
          <Link
            href="/register"
            className="rounded-full bg-foreground text-background px-8 py-3.5 text-base font-medium hover:opacity-90 transition-opacity"
          >
            Get started for free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <span>© 2026 QueueDesk. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
