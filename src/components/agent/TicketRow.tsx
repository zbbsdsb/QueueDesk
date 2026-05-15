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
      className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group"
    >
      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-16 shrink-0">
        {ticket.id.slice(0, 8)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {ticket.subject}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {ticket.requester?.display_name ?? ticket.requester?.email ?? "Unknown"}
        </p>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-24 shrink-0 text-center hidden sm:block">
        {ticket.queue?.name ?? "—"}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize hidden md:flex items-center gap-1 w-20 shrink-0 justify-center ${priorityCfg.bg} ${priorityCfg.text}`}>
        {ticket.priority === "urgent" && <AlertCircle className="w-3 h-3" />}
        {priorityCfg.label}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-20 shrink-0 text-center ${statusCfg.bg} ${statusCfg.text}`}>
        {statusCfg.label}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right hidden lg:block">
        {age}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}
