/**
 * QueueDesk email sender.
 * Central place for all outbound emails.
 * Logs errors but never throws — email failures should not break ticket operations.
 */

import { getResendClient, isEmailConfigured } from "./resend";
import {
  newTicketEmail,
  ticketAssignedEmail,
  newCommentEmail,
  ticketStatusChangedEmail,
  slaWarningEmail,
} from "./templates";

const FROM_ADDRESS = "QueueDesk <onboarding@resend.dev>"; // Replace with your verified domain

interface SendOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

async function sendEmail({ to, subject, html, text }: SendOptions): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(`[Email] Not configured — skipping email to ${Array.isArray(to) ? to.join(", ") : to}`);
    return false;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn("[Email] Resend client not initialized");
    return false;
  }

  const toAddresses = Array.isArray(to) ? to : [to];

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toAddresses,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[Email] Failed to send to ${toAddresses.join(", ")}:`, error);
      return false;
    }

    console.log(`[Email] Sent to ${toAddresses.join(", ")} — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error(`[Email] Unexpected error sending to ${toAddresses.join(", ")}:`, err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Notify agents in a queue about a new ticket */
export async function notifyNewTicket(params: {
  ticketNo: string;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  priority: string;
  queueName: string;
  description: string;
  ticketUrl: string;
  agentEmails: string[];
}) {
  if (!params.agentEmails.length) return;
  const { subject, html, text } = newTicketEmail(params);
  return sendEmail({ to: params.agentEmails, subject, html, text });
}

/** Notify an agent they have been assigned a ticket */
export async function notifyTicketAssigned(params: {
  ticketNo: string;
  subject: string;
  agentName: string;
  agentEmail: string;
  assignedBy: string;
  priority: string;
  ticketUrl: string;
}) {
  const { subject, html, text } = ticketAssignedEmail(params);
  return sendEmail({ to: params.agentEmail, subject, html, text });
}

/** Notify relevant parties of a new comment */
export async function notifyNewComment(params: {
  ticketNo: string;
  ticketSubject: string;
  commentBy: string;
  commentBody: string;
  isPublic: boolean;
  recipientName: string;
  recipientEmail: string;
  ticketUrl: string;
}) {
  const { subject, html, text } = newCommentEmail(params);
  return sendEmail({ to: params.recipientEmail, subject, html, text });
}

/** Notify requester when ticket status changes */
export async function notifyStatusChanged(params: {
  ticketNo: string;
  ticketSubject: string;
  recipientName: string;
  recipientEmail: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  ticketUrl: string;
}) {
  const { subject, html, text } = ticketStatusChangedEmail(params);
  return sendEmail({ to: params.recipientEmail, subject, html, text });
}

/** Alert agent of SLA breach */
export async function notifySLAWarning(params: {
  ticketNo: string;
  ticketSubject: string;
  agentName: string;
  agentEmail: string;
  slaPolicyName: string;
  breachType: "first_response" | "resolution";
  minutesOverdue: number;
  ticketUrl: string;
}) {
  const { subject, html, text } = slaWarningEmail(params);
  return sendEmail({ to: params.agentEmail, subject, html, text });
}
