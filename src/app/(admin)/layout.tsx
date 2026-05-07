"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/shared/AdminShell";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "owner"))) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
