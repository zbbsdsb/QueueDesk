"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { notifyTicketAssigned } from "@/lib/slack/notifier";
import {
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  VALID_TRANSITIONS,
  SLA_STATUS_COLORS,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Lock,
  ChevronDown,
  Clock,
  User,
  Tag,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { getAge } from "@/lib/utils";

type TicketDetail = {
  id: string;
  ticket_no: number;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  queue_id: string;
  assigned_agent_id: string | null;
  requester_id: string;
  lock_version: number;
  sla_deadline: string | null;
  created_at: string;
  updated_at: string;
  queue?: { id: string; name: string; slug: string };
  requester?: { id: string; display_name: string | null; email: string };
  assigned_agent?: { id: string; display_name: string | null; email: string } | null;
};

type Comment = {
  id: string;
  body: string;
  visibility: "public" | "internal";
  author_type: "user" | "contact" | "system";
  created_at: string;
  status: "published" | "edited" | "redacted";
  author?: { id: string; display_name: string | null; email: string };
};


type Agent = {
  id: string;
  display_name: string | null;
  email: string;
};

export default function TicketDetail({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const reassignMenuRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentVisibility, setCommentVisibility] = useState<"public" | "internal">("public");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    classification?: { category: string; suggestedPriority: string; confidence: number };
    summary?: string;
    draftReply?: string;
  } | null>(null);
  const [showAiCard, setShowAiCard] = useState(false);

  // Reassign related state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showReassignMenu, setShowReassignMenu] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  async function fetchTicket() {
    const { data, error } = await supabase
      .from("ticket")
      .select(`
        id, ticket_no, subject, description, status, priority, queue_id, assigned_agent_id,
        requester_id, lock_version, sla_deadline, created_at, updated_at,
        queue:queue_id(id, name, slug),
        requester:requester_id(id, display_name, email),
        assigned_agent:assigned_agent_id(id, display_name, email)
      `)
      .eq("id", ticketId)
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Failed to load ticket", description: error.message });
      router.push("/agent/tickets");
      return;
    }
    setTicket(data as TicketDetail);
    fetchComments();
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("ticket_comment")
      .select(`
        id, body, visibility, author_type, created_at, status,
        author:author_id(id, display_name, email)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    setComments((data as Comment[]) ?? []);
    setLoading(false);
  }

  async function fetchAgents() {
    const { data } = await supabase
      .from("app_user")
      .select("id, display_name, email")
      .in("role", ["owner", "admin", "agent"])
      .eq("status", "active");

    setAgents((data as Agent[]) ?? []);
  }

  async function handleReassign(newAgentId: string | null) {
    if (!ticket) return;
    setReassigning(true);
    setShowReassignMenu(false);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/reassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_assigned_agent_id: newAgentId }),
      });
      if (!res.ok) throw new Error("Failed to reassign ticket");
      toast({ title: "Ticket reassigned" });
      fetchTicket();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to reassign",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setReassigning(false);
    }
  }

  useEffect(() => {
    fetchTicket();
    fetchAgents();
  }, [ticketId]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        setShowStatusMenu(false);
      }
      if (
        reassignMenuRef.current &&
        !reassignMenuRef.current.contains(event.target as Node)
      ) {
        setShowReassignMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || !user) return;
    setShowStatusMenu(false);
    startTransition(async () => {
      const { error } = await supabase
        .from("ticket")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          lock_version: ticket.lock_version + 1,
        })
        .eq("id", ticket.id)
        .eq("lock_version", ticket.lock_version);

      if (error) {
        toast({ variant: "destructive", title: "Failed to update status", description: error.message });
      } else {
        toast({ title: "Status updated", description: `Ticket moved to ${TICKET_STATUS_CONFIG[newStatus].label}.` });
        fetchTicket();
      }
    });
  }

  async function handleAssignSelf() {
    if (!ticket || !user) return;
    startTransition(async () => {
      const { error } = await supabase
        .from("ticket")
        .update({
          assigned_agent_id: user.id,
          status: ticket.status === "open" ? "in_progress" : ticket.status,
          updated_at: new Date().toISOString(),
          lock_version: ticket.lock_version + 1,
        })
        .eq("id", ticket.id)
        .eq("lock_version", ticket.lock_version);

      if (error) {
        toast({ variant: "destructive", title: "Failed to assign", description: error.message });
      } else {
        toast({ title: "Assigned", description: "Ticket has been assigned to you." });
        const newStatus = ticket.status === "open" ? "in_progress" : ticket.status;
        notifyTicketAssigned(supabase, {
          tenantId: user.tenant_id,
          ticketId: ticket.id,
          ticketNo: ticket.ticket_no,
          subject: ticket.subject,
          priority: ticket.priority,
          status: newStatus,
          requesterName: ticket.requester?.display_name ?? ticket.requester?.email ?? "Unknown",
          queueName: ticket.queue?.name ?? "General",
          assigneeId: user.id,
          assigneeName: user.display_name ?? user.email,
          ticketUrl: typeof window !== "undefined" ? `${window.location.origin}/agent/tickets/${ticket.id}` : undefined,
        });
        fetchTicket();
      }
    });
  }

  async function handleApprove() {
    if (!ticket || !user) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/approvals/${ticket.id}/approve`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to approve ticket");
      }
      toast({ title: "Ticket approved", description: "The ticket has been approved and moved to In Progress." });
      fetchTicket();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to approve ticket", description: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!ticket || !user) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/approvals/${ticket.id}/reject`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to reject ticket");
      }
      toast({ title: "Ticket rejected", description: "The ticket has been rejected and moved to In Progress." });
      fetchTicket();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to reject ticket", description: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setRejecting(false);
    }
  }

  async function handleAddComment() {
    if (!ticket || !user || !newComment.trim()) return;
    setSubmittingComment(true);

    const { error } = await supabase.from("ticket_comment").insert({
      tenant_id: user.tenant_id,
      ticket_id: ticket.id,
      author_id: user.id,
      author_type: "user",
      visibility: commentVisibility,
      body: newComment.trim(),
    });

    if (error) {
      toast({ variant: "destructive", title: "Failed to post comment", description: error.message });
    } else {
      setNewComment("");
      fetchComments();
    }
    setSubmittingComment(false);
  }

  async function handleAiSuggest() {
    if (!ticket || !user) return;
    setAiLoading(true);
    setShowAiCard(true);
    try {
      const res = await fetch(`/api/ai/suggest/${ticket.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to get AI suggestions");
      const data = await res.json();
      setAiSuggestions(data);
      toast({ title: "AI suggestions ready", description: "Review suggestions below." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to get AI suggestions",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAcceptDraft() {
    if (aiSuggestions?.draftReply && ticket) {
      setNewComment(aiSuggestions.draftReply);
      toast({ title: "Draft accepted", description: "Draft reply added to comment input." });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ticket) return null;

  const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
  const validNextStatuses = VALID_TRANSITIONS[ticket.status] ?? [];

  // Calculate SLA status
  let slaStatus: "on_track" | "at_risk" | "breached" | null = null;
  if (ticket.sla_deadline) {
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffMs < 0) {
      slaStatus = "breached";
    } else if (diffHours < 24) {
      slaStatus = "at_risk";
    } else {
      slaStatus = "on_track";
    }
  }

  const canTake = !ticket.assigned_agent_id && ticket.status === "open";
  const canAssignSelf = !ticket.assigned_agent_id;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Ticket header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/agent/tickets")}
              className="mt-0.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">#{ticket.ticket_no}</span>
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                    {ticket.subject}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Thinking..." : "AI Suggest"}
                </button>
                {ticket.status === "pending_approval" && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={rejecting}
                      className="px-3 py-1.5 text-sm font-medium border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rejecting ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approving ? "Approving..." : "Approve"}
                    </button>
                  </>
                )}
                {canTake && (
                  <button
                    onClick={handleAssignSelf}
                    className="px-3 py-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    Take & Start
                  </button>
                )}
                {canAssignSelf && !canTake && (
                  <button
                    onClick={handleAssignSelf}
                    className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                  >
                    Assign to me
                  </button>
                )}

                  {/* Status transition dropdown */}
                  {validNextStatuses.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${statusCfg.bg} ${statusCfg.text} border-current/20 hover:opacity-80`}
                      >
                        {statusCfg.label}
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                      {showStatusMenu && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-44 overflow-hidden">
                          {validNextStatuses.map((s) => {
                            const cfg = TICKET_STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${cfg.text}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${cfg.bg.replace("bg-", "bg-").split(" ")[0]}`} />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
                  {priorityCfg.label}
                </span>
                {slaStatus && ticket.sla_deadline && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${SLA_STATUS_COLORS[slaStatus].bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${SLA_STATUS_COLORS[slaStatus].dot}`} />
                    {slaStatus === "breached"
                      ? "SLA Breached"
                      : slaStatus === "at_risk"
                      ? "SLA At Risk"
                      : "SLA On Track"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {getAge(ticket.created_at)} old
                </span>
                {ticket.queue && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Tag className="w-3 h-3" />
                    {ticket.queue.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="w-3 h-3" />
                  v{ticket.lock_version}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversation
            <span className="ml-1 text-slate-400 font-normal">{comments.length}</span>
          </h3>
          <div className="space-y-4">
            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400 dark:text-slate-500">No comments yet. Add the first one below.</p>
              </div>
            )}
            {comments.map((comment) => {
              const isInternal = comment.visibility === "internal";
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isInternal ? "opacity-80" : ""}`}
                >
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
                      {isInternal && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                          Internal
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{getAge(comment.created_at)}</span>
                      {comment.status === "edited" && (
                        <span className="text-xs text-slate-400">(edited)</span>
                      )}
                    </div>
                    <div className={`text-sm leading-relaxed rounded-xl px-4 py-3 ${
                      isInternal
                        ? "bg-amber-50 dark:bg-amber-950/30 text-slate-800 dark:text-slate-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}>
                      {comment.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment input */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 mb-2">
            {(["public", "internal"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCommentVisibility(v)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  commentVisibility === v
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {v === "public" ? "Reply (public)" : "Internal note"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAddComment();
                }
              }}
              placeholder={
                commentVisibility === "public"
                  ? "Reply to customer… (Cmd+Enter to send)"
                  : "Add an internal note… (Cmd+Enter to send)"
              }
              rows={3}
              className="flex-1 resize-none px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleAddComment}
              disabled={submittingComment || !newComment.trim()}
              className="self-end px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-5 space-y-5">
          {/* Requester */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Requester</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
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

          {/* Assigned Agent */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Assigned Agent</h4>
            {ticket.assigned_agent ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {(ticket.assigned_agent.display_name ?? ticket.assigned_agent.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {ticket.assigned_agent.display_name ?? ticket.assigned_agent.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Agent</p>
                  </div>
                </div>
                <div className="relative" ref={reassignMenuRef}>
                  <button
                    onClick={() => setShowReassignMenu(!showReassignMenu)}
                    disabled={reassigning}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {reassigning ? "Reassigning..." : "Reassign"}
                  </button>
                  {showReassignMenu && (
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search agents..."
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button
                          onClick={() => handleReassign(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-slate-500">Unassign</span>
                        </button>
                        {agents
                          .filter(
                            (agent) =>
                              agent.id !== ticket.assigned_agent_id &&
                              (agent.display_name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
                                agent.email.toLowerCase().includes(agentSearch.toLowerCase()))
                          )
                          .map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => handleReassign(agent.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                {(agent.display_name ?? agent.email)[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {agent.display_name ?? agent.email.split("@")[0]}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{agent.email}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleAssignSelf}
                  className="w-full px-3 py-2 text-sm border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Assign to me
                </button>
                <div className="relative" ref={reassignMenuRef}>
                  <button
                    onClick={() => setShowReassignMenu(!showReassignMenu)}
                    disabled={reassigning}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {reassigning ? "Assigning..." : "Assign to someone else"}
                  </button>
                  {showReassignMenu && (
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search agents..."
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {agents
                          .filter(
                            (agent) =>
                              (agent.display_name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
                                agent.email.toLowerCase().includes(agentSearch.toLowerCase()))
                          )
                          .map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => handleReassign(agent.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                {(agent.display_name ?? agent.email)[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {agent.display_name ?? agent.email.split("@")[0]}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{agent.email}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Timeline</h4>
            <div className="space-y-2.5">
              <TimelineEvent icon={Clock} label="Created" value={new Date(ticket.created_at).toLocaleString()} />
              <TimelineEvent icon={RefreshCw} label="Updated" value={new Date(ticket.updated_at).toLocaleString()} />
              {ticket.sla_deadline && (
                <TimelineEvent
                  icon={AlertCircle}
                  label="SLA Deadline"
                  value={new Date(ticket.sla_deadline).toLocaleString()}
                  iconClassName={
                    slaStatus
                      ? SLA_STATUS_COLORS[slaStatus].dot.replace("bg-", "text-")
                      : "text-slate-400"
                  }
                />
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {showAiCard && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Suggestions</h4>
              </div>
              <div className="space-y-3">
                {aiLoading && (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating suggestions...
                  </div>
                )}
                {!aiLoading && aiSuggestions && (
                  <>
                    {aiSuggestions.summary && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Summary</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          {aiSuggestions.summary}
                        </p>
                      </div>
                    )}
                    {aiSuggestions.classification && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Category: {aiSuggestions.classification.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Priority: {aiSuggestions.classification.suggestedPriority}
                        </span>
                      </div>
                    )}
                    {aiSuggestions.draftReply && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Draft Reply</p>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">{aiSuggestions.draftReply}</p>
                          <button onClick={handleAcceptDraft} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            Use this reply
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function TimelineEvent({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${iconClassName || "text-slate-400"}`} />
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-xs text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}
