"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      setLoading(false);
    } else {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const { data: appUser } = await supabase
          .from("app_user")
          .select("role")
          .single();
        const destination =
          appUser?.role === "requester" ? "/app/tickets" : "/agent/dashboard";
        router.push(destination);
      }
      router.refresh();
    }
  }

  return (
    <div className="space-y-7">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
          </span>
          Welcome back
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to QueueDesk</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Enter your credentials to access your workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
            <Link
              href="#"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 premium-btn bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
