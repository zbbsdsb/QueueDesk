import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "QueueDesk — Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">QueueDesk</span>
          </Link>
        </div>

        {/* Card */}
        <div className="premium-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          © {new Date().getFullYear()} QueueDesk. All rights reserved.
        </p>
      </div>

      <Toaster />
    </div>
  );
}
