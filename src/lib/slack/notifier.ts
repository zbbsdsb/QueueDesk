/**
 * Slack Notifier
 * Triggers Slack notifications based on ticket events
 */

import { sendSlackMessage } from "./client";
import {
  newTicketTemplate,
  ticketAssignedTemplate,
  ticketResolvedTemplate,
  approvalRequestTemplate,
  approvalResultTemplate,
} from "./templates";

type SlackSettings = {
  enabled: boolean;
  webhook_url: string;
  notify_new_ticket: boolean;
  notify_assignment: boolean;
  notify_resolved: boolean;
  notify_approval: boolean;
};

interface TicketContext {
  tenantId: string;
  ticketId: string;
  ticketNo: number;
  subject: string;
  priority: string;
  status: string;
  requesterId?: string;
  requesterName?: string;
  requesterEmail?: string;
  queueName?: string;
  assigneeId?: string;
  assigneeName?: string;
  ticketUrl?: string;
  approverName?: string;
  approverDecision?: "approved" | "rejected";
  approverComment?: string;
}

async function getSlackSettings(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  tenantId: string
): Promise<SlackSettings | null> {
  const { data } = await supabase
    .from("tenant")
    .select("settings")
    .eq("id", tenantId)
    .single();

  const settings = data?.settings as Record<string, unknown> | null;
  if (!settings?.slack) return null;

  return settings.slack as SlackSettings;
}

export async function notifyNewTicket(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  context: TicketContext
): Promise<void> {
  const settings = await getSlackSettings(supabase, context.tenantId);
  if (!settings?.enabled || !settings?.webhook_url || !settings?.notify_new_ticket) {
    return;
  }

  const message = newTicketTemplate({
    ticketNo: context.ticketNo,
    subject: context.subject,
    priority: context.priority,
    status: context.status,
    requesterName: context.requesterName || "Unknown",
    requesterEmail: context.requesterEmail || "",
    queueName: context.queueName || "General",
    ticketUrl: context.ticketUrl,
  });

  await sendSlackMessage(settings.webhook_url, message);
}

export async function notifyTicketAssigned(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  context: TicketContext
): Promise<void> {
  const settings = await getSlackSettings(supabase, context.tenantId);
  if (!settings?.enabled || !settings?.webhook_url || !settings?.notify_assignment) {
    return;
  }

  const message = ticketAssignedTemplate({
    ticketNo: context.ticketNo,
    subject: context.subject,
    priority: context.priority,
    status: context.status,
    requesterName: context.requesterName || "Unknown",
    requesterEmail: context.requesterEmail || "",
    queueName: context.queueName || "General",
    assigneeName: context.assigneeName,
    ticketUrl: context.ticketUrl,
  });

  await sendSlackMessage(settings.webhook_url, message);
}

export async function notifyTicketResolved(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  context: TicketContext
): Promise<void> {
  const settings = await getSlackSettings(supabase, context.tenantId);
  if (!settings?.enabled || !settings?.webhook_url || !settings?.notify_resolved) {
    return;
  }

  const message = ticketResolvedTemplate({
    ticketNo: context.ticketNo,
    subject: context.subject,
    priority: context.priority,
    status: context.status,
    requesterName: context.requesterName || "Unknown",
    requesterEmail: context.requesterEmail || "",
    queueName: context.queueName || "General",
    ticketUrl: context.ticketUrl,
  });

  await sendSlackMessage(settings.webhook_url, message);
}

export async function notifyApprovalRequest(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  context: TicketContext
): Promise<void> {
  const settings = await getSlackSettings(supabase, context.tenantId);
  if (!settings?.enabled || !settings?.webhook_url || !settings?.notify_approval) {
    return;
  }

  const message = approvalRequestTemplate({
    ticketNo: context.ticketNo,
    subject: context.subject,
    priority: context.priority,
    status: context.status,
    requesterName: context.requesterName || "Unknown",
    requesterEmail: context.requesterEmail || "",
    queueName: context.queueName || "General",
    approverName: context.approverName || "Unknown",
    ticketUrl: context.ticketUrl,
  });

  await sendSlackMessage(settings.webhook_url, message);
}

export async function notifyApprovalResult(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  context: TicketContext
): Promise<void> {
  const settings = await getSlackSettings(supabase, context.tenantId);
  if (!settings?.enabled || !settings?.webhook_url || !settings?.notify_approval) {
    return;
  }

  const message = approvalResultTemplate({
    ticketNo: context.ticketNo,
    subject: context.subject,
    priority: context.priority,
    status: context.status,
    requesterName: context.requesterName || "Unknown",
    requesterEmail: context.requesterEmail || "",
    queueName: context.queueName || "General",
    approverName: context.approverName || "Unknown",
    decision: context.approverDecision,
    comment: context.approverComment,
    ticketUrl: context.ticketUrl,
  });

  await sendSlackMessage(settings.webhook_url, message);
}
