"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    workspace: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
      },
    });

    if (authError || !authData.user) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: authError?.message ?? "Something went wrong.",
      });
      setLoading(false);
      return;
    }

    // 2. Create tenant (auto-generate slug from workspace name)
    const slug = form.workspace.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    const { data: tenant, error: tenantError } = await supabase
      .from("tenant")
      .insert({ name: form.workspace, slug })
      .select("id")
      .single();

    if (tenantError || !tenant) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Could not create workspace. Please try again.",
      });
      setLoading(false);
      return;
    }

    // 3. Create app_user record linked to tenant
    // Role assignment is handled via user_role_assignment table separately
    const { error: userError } = await supabase.from("app_user").insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      email: authData.user.email!,
      display_name: form.name,
      status: "active",
    });

    if (userError) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: userError.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Workspace created!",
      description: "Check your email to confirm your account.",
    });
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your workspace
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Start your free 14-day trial — no credit card needed
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="workspace">Workspace name</Label>
          <Input
            id="workspace"
            type="text"
            placeholder="Acme Corp"
            value={form.workspace}
            onChange={(e) => setForm({ ...form, workspace: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@acmecorp.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating workspace…
            </>
          ) : (
            "Create workspace"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
