/**
 * QueueDesk email templates.
 * All templates return { subject, html, text }.
 */

const BRAND_COLOR = "#4f46e5"; // indigo-600
const BRAND_LIGHT = "#eef2ff"; // indigo-50
const GRAY_600 = "#4b5563";
const GRAY_900 = "#111827";
const GRAY_100 = "#f3f4f6";

function baseTemplate(content: string, footer?: string): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QueueDesk</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td style="padding:0 0 28px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:${BRAND_COLOR};letter-spacing:-0.5px;">
                      ⚡ QueueDesk
                    </span>
                  </td>
                  <td align="right" style="font-size:13px;color:${GRAY_600};">
                    ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:${GRAY_600};line-height:1.6;">
                ${footer ?? `You received this email because you're part of a QueueDesk workspace.<br>QueueDesk — Internal service desk, powered by AI.`}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Strip HTML tags for plain text
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

  return { html, text };
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    open: "#2563eb",
    pending: "#7c3aed",
    waiting_approval: "#d97706",
    waiting_customer: "#f59e0b",
    resolved: "#16a34a",
    closed: "#6b7280",
    cancelled: "#9ca3af",
  };
  return map[status] ?? "#6b7280";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "Open",
    pending: "Pending",
    waiting_approval: "Pending Approval",
    waiting_customer: "Awaiting Customer",
    resolved: "Resolved",
    closed: "Closed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

/** ── New Ticket Created ──────────────────────────────────── */
export interface NewTicketEmailParams {
  ticketNo: string;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  priority: string;
  queueName: string;
  description: string;
  ticketUrl: string;
}

export function newTicketEmail(p: NewTicketEmailParams) {
  const priorityBadge = p.priority === "urgent"
    ? `<span style="display:inline-block;background-color:#fef2f2;color:#dc2626;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;text-transform:uppercase;">${p.priority}</span>`
    : `<span style="display:inline-block;background-color:${BRAND_LIGHT};color:${BRAND_COLOR};border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;text-transform:uppercase;">${p.priority}</span>`;

  const content = `
<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:${GRAY_900};">New Ticket Received</h1>
<p style="margin:0 0 24px 0;font-size:14px;color:${GRAY_600};">
  Ticket <strong>#${p.ticketNo}</strong> has been opened in <strong>${p.queueName}</strong>.
</p>

<!-- Meta -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${[
    ["Ticket", `#${p.ticketNo}`],
    ["Priority", priorityBadge],
    ["Requester", `${p.requesterName} &lt;${p.requesterEmail}&gt;`],
    ["Queue", p.queueName],
  ].map(([label, value]) => `
  <tr>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_600};width:100px;">${label}</td>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_900};font-weight:500;">${value}</td>
  </tr>`).join("")}
</table>

<!-- Subject -->
<p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${GRAY_900};">Subject</p>
<p style="margin:0 0 16px 0;font-size:14px;color:${GRAY_900};">${p.subject}</p>

<!-- Description -->
<p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${GRAY_900};">Description</p>
<div style="background-color:${GRAY_100};border-radius:8px;padding:16px;font-size:14px;color:${GRAY_600};line-height:1.6;white-space:pre-wrap;margin-bottom:28px;">${p.description}</div>

<!-- CTA -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <a href="${p.ticketUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        View Ticket →
      </a>
    </td>
  </tr>
</table>`;

  const { html, text } = baseTemplate(content);
  return { subject: `[#${p.ticketNo}] New: ${p.subject}`, html, text };
}

/** ── Ticket Assigned to Agent ─────────────────────────────── */
export interface TicketAssignedEmailParams {
  ticketNo: string;
  subject: string;
  agentName: string;
  agentEmail: string;
  assignedBy: string;
  priority: string;
  ticketUrl: string;
}

export function ticketAssignedEmail(p: TicketAssignedEmailParams) {
  const priorityBadge = p.priority === "urgent"
    ? `<span style="display:inline-block;background-color:#fef2f2;color:#dc2626;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;text-transform:uppercase;">${p.priority}</span>`
    : `<span style="display:inline-block;background-color:${BRAND_LIGHT};color:${BRAND_COLOR};border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;text-transform:uppercase;">${p.priority}</span>`;

  const content = `
<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:${GRAY_900};">Ticket Assigned to You</h1>
<p style="margin:0 0 24px 0;font-size:14px;color:${GRAY_600};">
  Hi ${p.agentName}, you've been assigned to <strong>#${p.ticketNo}</strong> by ${p.assignedBy}.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${[
    ["Ticket", `#${p.ticketNo}`],
    ["Priority", priorityBadge],
    ["Subject", p.subject],
    ["Assigned by", p.assignedBy],
  ].map(([label, value]) => `
  <tr>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_600};width:100px;">${label}</td>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_900};font-weight:500;">${value}</td>
  </tr>`).join("")}
</table>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <a href="${p.ticketUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        Open Ticket →
      </a>
    </td>
  </tr>
</table>`;

  const { html, text } = baseTemplate(content);
  return { subject: `[#${p.ticketNo}] Assigned: ${p.subject}`, html, text };
}

/** ── New Comment / Reply ─────────────────────────────────── */
export interface NewCommentEmailParams {
  ticketNo: string;
  ticketSubject: string;
  commentBy: string;
  commentBody: string;
  isPublic: boolean;
  recipientName: string;
  recipientEmail: string;
  ticketUrl: string;
}

export function newCommentEmail(p: NewCommentEmailParams) {
  const visibilityNote = p.isPublic
    ? `This comment was posted publicly and is visible to the requester.`
    : `This is an internal note and is not visible to the requester.`;

  const content = `
<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:${GRAY_900};">New Comment on Ticket #${p.ticketNo}</h1>
<p style="margin:0 0 24px 0;font-size:14px;color:${GRAY_600};">
  Hi ${p.recipientName}, ${p.commentBy} left a comment on your ticket.
</p>

<p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${GRAY_900};">
  ${p.ticketSubject}
</p>

<div style="background-color:${GRAY_100};border-radius:8px;padding:16px;font-size:14px;color:${GRAY_900};line-height:1.6;white-space:pre-wrap;margin-bottom:16px;">${p.commentBody}</div>

<p style="margin:0 0 28px 0;font-size:12px;color:${GRAY_600};font-style:italic;">${visibilityNote}</p>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <a href="${p.ticketUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        View Ticket →
      </a>
    </td>
  </tr>
</table>`;

  const { html, text } = baseTemplate(content);
  return {
    subject: `[#${p.ticketNo}] New comment: ${p.ticketSubject}`,
    html,
    text,
  };
}

/** ── Ticket Status Changed ────────────────────────────────── */
export interface TicketStatusChangedEmailParams {
  ticketNo: string;
  ticketSubject: string;
  recipientName: string;
  recipientEmail: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  ticketUrl: string;
}

export function ticketStatusChangedEmail(p: TicketStatusChangedEmailParams) {
  const content = `
<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:${GRAY_900};">Ticket Status Updated</h1>
<p style="margin:0 0 24px 0;font-size:14px;color:${GRAY_600};">
  Hi ${p.recipientName}, the status of your ticket has been updated.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${[
    ["Ticket", `#${p.ticketNo}`],
    ["Subject", p.ticketSubject],
    ["Previous", `<span style="color:${statusColor(p.oldStatus)};font-weight:600;">${statusLabel(p.oldStatus)}</span>`],
    ["Current", `<span style="color:${statusColor(p.newStatus)};font-weight:600;">${statusLabel(p.newStatus)}</span>`],
    ["Updated by", p.changedBy],
  ].map(([label, value]) => `
  <tr>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_600};width:120px;">${label}</td>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_900};font-weight:500;">${value}</td>
  </tr>`).join("")}
</table>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <a href="${p.ticketUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        View Ticket →
      </a>
    </td>
  </tr>
</table>`;

  const { html, text } = baseTemplate(content);
  return {
    subject: `[#${p.ticketNo}] Status changed to ${statusLabel(p.newStatus)}`,
    html,
    text,
  };
}

/** ── SLA Breach Warning ───────────────────────────────────── */
export interface SLAWarningEmailParams {
  ticketNo: string;
  ticketSubject: string;
  agentName: string;
  agentEmail: string;
  slaPolicyName: string;
  breachType: "first_response" | "resolution";
  minutesOverdue: number;
  ticketUrl: string;
}

export function slaWarningEmail(p: SLAWarningEmailParams) {
  const typeLabel = p.breachType === "first_response"
    ? "First Response"
    : "Resolution";
  const urgencyColor = "#dc2626";
  const urgencyBg = "#fef2f2";

  const content = `
<div style="background-color:${urgencyBg};border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
  <p style="margin:0;font-size:13px;font-weight:600;color:${urgencyColor};text-transform:uppercase;letter-spacing:0.5px;">
    ⚠️ SLA Breach Warning — ${typeLabel} overdue by ${p.minutesOverdue} min
  </p>
</div>

<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:${GRAY_900};">SLA Breach Alert</h1>
<p style="margin:0 0 24px 0;font-size:14px;color:${GRAY_600};">
  Hi ${p.agentName}, ticket <strong>#${p.ticketNo}</strong> has exceeded its SLA target.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${[
    ["Ticket", `#${p.ticketNo}`],
    ["Subject", p.ticketSubject],
    ["SLA Policy", p.slaPolicyName],
    ["Breach Type", typeLabel],
    ["Minutes Overdue", `<span style="color:${urgencyColor};font-weight:700;">${p.minutesOverdue} min</span>`],
  ].map(([label, value]) => `
  <tr>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_600};width:140px;">${label}</td>
    <td style="padding:6px 0;border-bottom:1px solid ${GRAY_100};font-size:13px;color:${GRAY_900};font-weight:500;">${value}</td>
  </tr>`).join("")}
</table>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <a href="${p.ticketUrl}"
         style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        Handle Ticket →
      </a>
    </td>
  </tr>
</table>`;

  const { html, text } = baseTemplate(content);
  return {
    subject: `🚨 [#${p.ticketNo}] SLA Breach: ${typeLabel} overdue`,
    html,
    text,
  };
}
