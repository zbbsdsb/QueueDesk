import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.formData();
    const payloadStr = payload.get("payload") as string;
    if (!payloadStr) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const data = JSON.parse(payloadStr);
    const { actions, user, message } = data;

    const action = actions?.[0];
    const actionValue = action?.value; // e.g., "approve:123" or "reject:456"
    const [decision, ticketId] = (actionValue || "").split(":");

    if (!ticketId || !["approve", "reject"].includes(decision)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    );

    const newStatus = decision === "approve" ? "in_progress" : "in_progress";
    const { error } = await supabase
      .from("ticket")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update ticket", text: `❌ 操作失败: ${error.message}` },
        { status: 500 }
      );
    }

    // Record audit log
    await supabase.from("audit_log").insert({
      tenant_id: "",
      actor_id: user?.id || "slack",
      actor_type: "slack_user",
      action: `ticket.${decision}`,
      entity_type: "ticket",
      entity_id: ticketId,
      metadata: { slack_user: user?.username, decision, message_ts: message?.ts },
    });

    const responseText =
      decision === "approve"
        ? "✅ 工单已批准！"
        : "❌ 工单已拒绝！";

    return NextResponse.json({ text: responseText });
  } catch (err) {
    console.error("[Slack Interact] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
