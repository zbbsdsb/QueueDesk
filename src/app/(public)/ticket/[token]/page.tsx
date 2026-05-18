import { createClient } from "@/lib/supabase/server";
import { verifyPublicTicketToken, getAge, formatDate } from "@/lib/utils";
import { TICKET_STATUS_CONFIG } from "@/lib/types";
import { User, MessageSquare } from "lucide-react";

export default async function PublicTicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ticketId = verifyPublicTicketToken(token);

  if (!ticketId) {
    return (
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid or Expired Link</h2>
          <p className="text-muted-foreground">
            This ticket link is invalid or has expired. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .select(`
      id, ticket_no, subject, description, status, priority, queue_id,
      requester_user_id, lock_version, sla_deadline, created_at, updated_at,
      queue:queue_id(id, name, slug),
      requester:requester_user_id(id, display_name, email)
    `)
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground">
            The requested ticket could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Fetch public comments
  const { data: comments } = await supabase
    .from("ticket_comment")
    .select(`
      id, body, visibility, created_at,
      author:author_user_id(id, display_name, email)
    `)
    .eq("ticket_id", ticketId)
    .eq("visibility", "public")
    .order("created_at", { ascending: true });

  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="space-y-6">
        {/* Ticket header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-slate-400">#{ticket.ticket_no}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight mb-3">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              Created {getAge(ticket.created_at)} ago
            </span>
          </div>
        </div>

        {/* Requester info */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
              {(ticket.requester?.display_name ?? ticket.requester?.email ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {ticket.requester?.display_name ?? "Unknown"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.requester?.email}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Comments */}
        {comments && comments.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation
              <span className="ml-1 text-slate-400 font-normal">{comments.length}</span>
            </h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    comment.author_type === "system"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      : "bg-violet-600 text-white"
                  }`}>
                    {comment.author_type === "system" ? "S" :
                      (comment.author?.display_name ?? comment.author?.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {comment.author_type === "system" ? "System" :
                          (comment.author?.display_name ?? comment.author?.email ?? "Unknown")}
                      </span>
                      <span className="text-xs text-slate-400">{getAge(comment.created_at)}</span>
                      {comment.status === "edited" && (
                        <span className="text-xs text-slate-400">(edited)</span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {comment.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          <p>Last updated: {formatDate(ticket.updated_at)}</p>
        </div>
      </div>
    </div>
  );
}
