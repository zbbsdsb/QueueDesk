// Requester Portal layout — all routes under /app/*
import AppShell from "@/components/shared/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
