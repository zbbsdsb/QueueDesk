// Admin Console layout — middleware protects this route (role check done client-side)
import AdminShell from "@/components/shared/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
