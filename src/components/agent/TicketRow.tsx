import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import { getAge } from "@/lib/utils";

type TicketWithQueue = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  queue?: { name: string } | null;
  requester?: { display_name: string | null; email: string } | null;
};

interface TicketRowProps {
  ticket: TicketWithQueue;
}

export default function TicketRow({ ticket }: TicketRowProps) {
  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
  const age = getAge(ticket.created_at);

  return (
    <Link
      href={`/agent/tickets/${ticket.id}`}
      className="group relative flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-primary/[0.02]"
    >
      {/* Left Accent Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-full bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full" />
      
      {/* Ticket ID Badge */}
      <div className="relative flex items-center justify-center w-20 h-8 rounded-lg bg-secondary/30 px-2 shrink-0">
        <span className="text-[11px] font-mono font-semibold text-muted-foreground tracking-tight">
          #{ticket.id.slice(0, 8)}
        </span>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
            {ticket.subject}
          </p>
          {ticket.priority === "urgent" && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-error/10 text-error">
              <AlertCircle className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {ticket.requester?.display_name ?? ticket.requester?.email ?? "Unknown"}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground/70">{age} ago</span>
        </div>
      </div>
      
      {/* Queue Badge */}
      <div className="hidden sm:flex items-center shrink-0">
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-secondary/30 text-muted-foreground">
          {ticket.queue?.name ?? "—"}
        </span>
      </div>
      
      {/* Priority Badge */}
      <div className="hidden md:flex items-center shrink-0">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
          {priorityCfg.label}
        </span>
      </div>
      
      {/* Status Badge */}
      <div className="flex items-center shrink-0">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
          {statusCfg.label}
        </span>
      </div>
      
      {/* Arrow */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-secondary/0 group-hover:bg-primary/10 transition-all duration-200 shrink-0">
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Link>
  );
}
