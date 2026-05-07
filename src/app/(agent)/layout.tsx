// Agent Console layout — all routes under /agent/*
import AgentShell from "@/components/shared/AgentShell";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
