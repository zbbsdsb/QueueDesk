import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/client";
import { notifyApprovalResult } from "@/lib/slack/notifier";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const ticketId = params.id;

    // First, get the current user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the app_user record
    const { data: appUser } = await supabase
      .from("app_user")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("ticket")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError) {
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status !== "pending_approval") {
      return NextResponse.json(
        { error: "Ticket is not pending approval" },
        { status: 400 }
      );
    }

    // Update the ticket status to in_progress
    const { error: updateError } = await supabase
      .from("ticket")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
        lock_version: ticket.lock_version + 1,
      })
      .eq("id", ticketId)
      .eq("lock_version", ticket.lock_version);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: requesterData } = await supabase
      .from("contact")
      .select("display_name, primary_email")
      .eq("id", ticket.requester_id)
      .single();

    const { data: queueData } = await supabase
      .from("queue")
      .select("name")
      .eq("id", ticket.queue_id)
      .single();

    const clientSupabase = createClient();
    notifyApprovalResult(clientSupabase, {
      tenantId: ticket.tenant_id,
      ticketId: ticket.id,
      ticketNo: ticket.ticket_no,
      subject: ticket.subject,
      priority: ticket.priority,
      status: "in_progress",
      requesterName: requesterData?.display_name ?? ticket.requester_id,
      requesterEmail: requesterData?.primary_email ?? "",
      queueName: queueData?.name ?? "General",
      approverName: appUser.display_name ?? appUser.email,
      approverDecision: "approved",
    });

    return NextResponse.json({ success: true, ticket: { ...ticket, status: "in_progress" } });
  } catch (err) {
    console.error("[Approve API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
