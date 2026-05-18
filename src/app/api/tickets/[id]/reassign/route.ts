import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const { new_assignee_user_id } = await req.json();

    // Get current authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get app user to check role
    const { data: appUser } = await supabase
      .from("app_user")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has permission to reassign (only owner, admin, agent)
    if (!["owner", "admin", "agent"].includes(appUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get current ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("ticket")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: ticketError?.message || "Ticket not found" },
        { status: ticketError ? 500 : 404 }
      );
    }

    // If new_assignee_user_id is provided, validate it's a valid user in same tenant
    if (new_assignee_user_id) {
      const { data: newAgent, error: agentError } = await supabase
        .from("app_user")
        .select("id, tenant_id")
        .eq("id", new_assignee_user_id)
        .single();

      if (agentError || !newAgent) {
        return NextResponse.json(
          { error: "Invalid assigned agent" },
          { status: 400 }
        );
      }

      // Ensure same tenant
      if (newAgent.tenant_id !== ticket.tenant_id) {
        return NextResponse.json(
          { error: "Agent must be in the same tenant" },
          { status: 400 }
        );
      }
    }

    // Update the ticket
    const { error: updateError } = await supabase
      .from("ticket")
      .update({
        assignee_user_id: new_assignee_user_id || null,
        updated_at: new Date().toISOString(),
        lock_version: ticket.lock_version + 1,
      })
      .eq("id", ticketId)
      .eq("lock_version", ticket.lock_version);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record audit log
    const { error: auditError } = await supabase.from("audit_log").insert({
      tenant_id: ticket.tenant_id,
      actor_user_id: appUser.id,
      action: "ticket.reassign",
      entity_type: "ticket",
      entity_id: ticketId,
      changed_fields: ["assignee_user_id"],
      before_data: { assignee_user_id: ticket.assignee_user_id },
      after_data: { assignee_user_id: new_assignee_user_id || null },
      occurred_at: new Date().toISOString(),
    });

    if (auditError) {
      console.error("[Reassign API] Failed to record audit log:", auditError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Reassign API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
