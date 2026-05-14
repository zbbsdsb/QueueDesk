import { NextRequest, NextResponse } from "next/server";
import { sendTestMessage } from "@/lib/slack/client";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl } = await req.json();
    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: "Webhook URL is required" }, { status: 400 });
    }

    const result = await sendTestMessage(webhookUrl);
    if (result.success) {
      return NextResponse.json({ success: true, message: "Test message sent successfully!" });
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to send test message" }, { status: 500 });
    }
  } catch (err) {
    console.error("[Slack Test] Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
