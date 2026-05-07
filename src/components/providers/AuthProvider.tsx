"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

interface AuthContextValue {
  supabase: SupabaseClient<Database>;
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  supabase: null as unknown as SupabaseClient<Database>,
  user: null,
  loading: true,
});

export function AuthProvider({
  supabase,
  initialUser,
  children,
}: {
  supabase: SupabaseClient<Database>;
  initialUser: AppUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(initialUser);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("app_user")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(data);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ supabase, user, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
