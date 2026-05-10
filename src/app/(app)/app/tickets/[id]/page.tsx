"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  type TicketWithRelations,
  type TicketCommentWithAuthor,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
} from "@/lib/types";
import {
  ArrowLeft,
  Clock,
  Ticket,
  User,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { timeAgo, formatDate } from "@/lib/utils";


function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const colors = [
    "bg-blue-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${colors[colorIndex]}`}>
      {initials}
    </div>
  );
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketWithRelations | null>(null);
  const [comments, setComments] = useState<TicketCommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  async function loadTicket() {
    if (!user) return;
    setLoading(true);

    const [{ data: t }, { data: cs }] = await Promise.all([
      supabase
        .from("ticket")
        .select(
          `
          id, tenant_id, queue_id, requester_id, assigned_agent_id,
          status, priority, subject, description, created_at, updated_at,
          queue:queue_id(name, slug),
          assigned_agent:assigned_agent_id(display_name, email),
          requester:requester_id(display_name, email)
        `
        )
        .eq("id", params.id)
        .eq("tenant_id", user.tenant_id)
        .eq("requester_id", user.id)
        .single(),
      supabase
        .from("ticket_comment")
        .select(
          `
          id, ticket_id, author_id, author_type, visibility, body, status,
          mentions, created_at, updated_at,
          author:author_id(display_name, email)
        `
        )
        .eq("ticket_id", params.id)
        .eq("visibility", "public")
        .eq("status", "published")
        .order("created_at", { ascending: true }),
    ]);

    if (t) setTicket(t as unknown as TicketWithRelations);
    if (cs) setComments((cs as unknown as TicketCommentWithAuthor[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTicket();
  }, [params.id, user?.tenant_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    setReplyError("");
    setSubmitting(true);

    const { data, error } = await supabase
      .from("ticket_comment")
      .insert({
        tenant_id: user.tenant_id,
        ticket_id: params.id,
        author_id: user.id,
        author_type: "user",
        visibility: "public",
        body: replyText.trim(),
        status: "published",
      })
      .select(
        `
        id, ticket_id, author_id, author_type, visibility, body, status,
        mentions, created_at, updated_at,
        author:author_id(display_name, email)
      `
      )
      .single();

    if (error) {
      setReplyError(error.message);
      setSubmitting(false);
    } else if (data) {
      setComments((prev) => [...prev, data as unknown as TicketCommentWithAuthor]);
      setReplyText("");
      setSubmitting(false);
      // Update ticket updated_at optimistically
      setTicket((prev) => prev ? { ...prev, updated_at: new Date().toISOString() } : prev);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">Ticket not found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          This ticket doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/app/tickets" className="text-sm text-blue-600 hover:underline">
          Back to My Tickets
        </Link>
      </div>
    );
  }

  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 shrink-0">
        <Link
          href="/app/tickets"
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          My Tickets
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
          #{ticket.id.slice(0, 8)}
        </span>
        <button
          onClick={() => startTransition(() => loadTicket())}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto flex">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Ticket title */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {ticket.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                {statusCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                {priorityCfg.label}
              </span>
              {ticket.queue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Ticket className="w-3 h-3" />
                  {ticket.queue.name}
                </span>
              )}
            </div>
          </div>

          {/* Original description */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <Avatar name={ticket.requester?.display_name ?? ticket.requester?.email ?? "?"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {ticket.requester?.display_name ?? ticket.requester?.email ?? "You"}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(ticket.created_at)}</span>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {ticket.description ?? "No description provided."}
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="px-6 py-4 space-y-4">
            {comments.filter((c) => c.author_type !== "user" || c.author_id !== ticket.requester_id).length > 0 && (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                {comments.length} {comments.length === 1 ? "reply" : "replies"}
              </p>
            )}

            {comments.map((comment) => {
              const isSelf = comment.author_id === user?.id;
              return (
                <div key={comment.id} className={`flex items-start gap-3 ${isSelf ? "flex-row-reverse" : ""}`}>
                  <Avatar name={comment.author?.display_name ?? comment.author?.email ?? "?"} size="sm" />
                  <div className={`flex-1 min-w-0 ${isSelf ? "text-right" : ""}`}>
                    <div className={`flex items-baseline gap-2 mb-1.5 ${isSelf ? "justify-end" : ""}`}>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isSelf ? "You" : (comment.author?.display_name ?? comment.author?.email ?? "Support")}
                      </span>
                      {!isSelf && comment.author_type !== "system" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                          Agent
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    <div
                      className={`inline-block text-sm whitespace-pre-wrap leading-relaxed ${
                        isSelf
                          ? "bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-2xl rounded-tl-md"
                      }`}
                    >
                      {comment.body}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply form */}
          <div className="mt-auto px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form onSubmit={handleReply} className="flex gap-3">
              <Avatar name={user?.display_name ?? user?.email ?? "?"} size="sm" />
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add a reply… (visible to support team and you)"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                />
                {replyError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {replyError}
                  </p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!replyText.trim() || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar metadata */}
        <aside className="w-64 shrink-0 border-l border-slate-100 dark:border-slate-800 p-5 space-y-5 bg-white dark:bg-slate-900 hidden lg:block">
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Request Details
            </p>
            <div className="space-y-3">
              <MetaRow icon={<Clock className="w-3.5 h-3.5" />} label="Created" value={formatDate(ticket.created_at)} />
              <MetaRow icon={<Clock className="w-3.5 h-3.5" />} label="Updated" value={formatDate(ticket.updated_at)} />
              {ticket.queue && <MetaRow icon={<Ticket className="w-3.5 h-3.5" />} label="Category" value={ticket.queue.name} />}
              {ticket.assigned_agent ? (
                <MetaRow
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Assigned to"
                  value={ticket.assigned_agent.display_name ?? ticket.assigned_agent.email}
                />
              ) : (
                <MetaRow icon={<User className="w-3.5 h-3.5" />} label="Assigned to" value="Unassigned" />
              )}
              <MetaRow icon={<AlertCircle className="w-3.5 h-3.5" />} label="Status" value={statusCfg.label} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 dark:text-slate-500 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{value}</p>
      </div>
    </div>
  );
}
