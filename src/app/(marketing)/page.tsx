import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-6">
        Your team deserves
        <br />
        <span className="text-primary">smarter support</span>
      </h1>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
        QueueDesk is an AI-first internal service desk that routes, prioritises,
        and resolves tickets — before your team has to.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/register"
          className="rounded-full bg-foreground px-6 py-3 text-background font-medium hover:opacity-90 transition-opacity"
        >
          Start free trial
        </Link>
        <Link
          href="/login"
          className="rounded-full border px-6 py-3 font-medium hover:bg-muted transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
