/**
 * Slack Webhook Client
 * Uses Slack Incoming Webhooks to send formatted messages
 * Reference: https://api.slack.com/messaging/webhooks
 */

interface SlackPayload {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  accessory?: unknown;
  elements?: unknown[];
  fields?: { type: string; text: string }[];
  block_id?: string;
}

interface SlackAttachment {
  color?: string;
  blocks?: SlackBlock[];
}

export async function sendSlackMessage(
  webhookUrl: string,
  payload: SlackPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Slack] Failed to send message:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (err) {
    console.error("[Slack] Error sending message:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendTestMessage(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  return sendSlackMessage(webhookUrl, {
    text: "✅ QueueDesk 集成测试成功！Slack 通知已配置完成。",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 QueueDesk 集成测试",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Slack 集成已成功配置！您将收到 QueueDesk 工单通知。",
        },
      },
    ],
  });
}
