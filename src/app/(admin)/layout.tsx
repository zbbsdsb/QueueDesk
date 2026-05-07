// Admin Console layout — all routes under /admin/*
import AdminShell from "@/components/shared/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
