import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    );

    const { searchParams } = new URL(req.url);
    const actorUserId = searchParams.get("actorUserId");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("audit_log")
      .select(
        `
        audit_id,
        occurred_at,
        tenant_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        changed_fields,
        before_data,
        after_data,
        payload,
        actor:actor_user_id(id, display_name, email)
      `
      )
      .order("occurred_at", { ascending: false })
      .limit(100);

    if (actorUserId) {
      query = query.eq("actor_user_id", actorUserId);
    }

    if (action) {
      query = query.eq("action", action);
    }

    if (startDate) {
      query = query.gte("occurred_at", new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte("occurred_at", new Date(endDate).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Audit API] Error fetching audit logs:", error);
      return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Audit API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
