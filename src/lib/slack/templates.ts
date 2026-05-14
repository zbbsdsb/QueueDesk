/**
 * Slack Block Kit Message Templates
 * Reference: https://api.slack.com/reference/block-kit
 */

interface TicketInfo {
  ticketNo: number;
  subject: string;
  priority: string;
  status: string;
  requesterName: string;
  requesterEmail: string;
  queueName: string;
  assigneeName?: string;
  ticketUrl?: string;
}

interface ApprovalInfo extends TicketInfo {
  approverName: string;
  decision?: "approved" | "rejected";
  comment?: string;
}

function getPriorityEmoji(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "🔴";
    case "high":
      return "🟠";
    case "normal":
      return "🟡";
    default:
      return "⚪";
  }
}

function getStatusEmoji(status: string): string {
  switch (status.toLowerCase()) {
    case "open":
      return "📨";
    case "in_progress":
      return "🔧";
    case "pending_approval":
      return "⏳";
    case "pending_customer":
      return "🕐";
    case "resolved":
      return "✅";
    case "closed":
      return "🔒";
    default:
      return "📋";
  }
}

export function newTicketTemplate(info: TicketInfo) {
  return {
    text: `新工单 #${info.ticketNo}: ${info.subject}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${getPriorityEmoji(info.priority)} 新工单 #${info.ticketNo}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${info.subject}*`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdown",
            text: `*请求人:*\n${info.requesterName}`,
          },
          {
            type: "mrkdwn",
            text: `*优先级:*\n${info.priority}`,
          },
          {
            type: "mrkdwn",
            text: `*队列:*\n${info.queueName}`,
          },
          {
            type: "mrkdwn",
            text: `*状态:*\n${info.status}`,
          },
        ],
      },
      ...(info.ticketUrl
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "查看工单", emoji: true },
                  url: info.ticketUrl,
                  style: "primary",
                },
              ],
            },
          ]
        : []),
    ],
  };
}

export function ticketAssignedTemplate(info: TicketInfo) {
  return {
    text: `工单 #${info.ticketNo} 已分配给 ${info.assigneeName}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${getStatusEmoji(info.status)} *工单 #${info.ticketNo}* 已分配给 *${info.assigneeName}*`,
        },
        accessory: {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `请求人: ${info.requesterName} | ${info.priority} | ${info.queueName}`,
            },
          ],
        },
      },
      ...(info.ticketUrl
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "查看工单", emoji: true },
                  url: info.ticketUrl,
                  style: "primary",
                },
              ],
            },
          ]
        : []),
    ],
  };
}

export function ticketResolvedTemplate(info: TicketInfo) {
  return {
    text: `工单 #${info.ticketNo} 已解决: ${info.subject}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${getStatusEmoji("resolved")} *工单 #${info.ticketNo}* 已解决`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${info.subject}*`,
        },
      },
      ...(info.ticketUrl
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "查看详情", emoji: true },
                  url: info.ticketUrl,
                },
              ],
            },
          ]
        : []),
    ],
  };
}

export function approvalRequestTemplate(info: ApprovalInfo) {
  return {
    text: `工单 #${info.ticketNo} 需要审批: ${info.subject}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⏳ 需要审批",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${info.subject}*`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*工单号:*\n#${info.ticketNo}`,
          },
          {
            type: "mrkdwn",
            text: `*请求人:*\n${info.requesterName}`,
          },
          {
            type: "mrkdwn",
            text: `*优先级:*\n${info.priority}`,
          },
          {
            type: "mrkdwn",
            text: `*审批人:*\n${info.approverName}`,
          },
        ],
      },
      ...(info.ticketUrl
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "✅ 批准", emoji: true },
                  url: info.ticketUrl,
                  style: "primary",
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "❌ 拒绝", emoji: true },
                  url: info.ticketUrl,
                  style: "danger",
                },
              ],
            },
          ]
        : []),
    ],
  };
}

export function approvalResultTemplate(info: ApprovalInfo) {
  const emoji = info.decision === "approved" ? "✅" : "❌";
  const resultText = info.decision === "approved" ? "已批准" : "已拒绝";

  return {
    text: `工单 #${info.ticketNo} 审批结果: ${resultText}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} 工单 #${info.ticketNo} *${resultText}* by ${info.approverName}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${info.subject}*`,
        },
      },
      ...(info.comment
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*备注:*\n${info.comment}`,
              },
            },
          ]
        : []),
      ...(info.ticketUrl
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "查看工单", emoji: true },
                  url: info.ticketUrl,
                },
              ],
            },
          ]
        : []),
    ],
  };
}
