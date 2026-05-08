"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

export function AuthProviderWrapper({
  initialUser,
  children,
}: {
  initialUser: AppUser | null;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  return (
    <AuthProvider supabase={supabase} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
