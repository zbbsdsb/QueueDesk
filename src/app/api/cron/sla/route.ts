/**
 * SLA Monitoring Cron Job
 *
 * Vercel Cron: vercel.json → { "cron": "* * * * *" }
 * Or call manually: GET /api/cron/sla?secret=YOUR_CRON_SECRET
 *
 * Checks all open tickets against their queue's SLA policy.
 * Sends email alerts when:
 * - First response is overdue
 * - Resolution target is overdue
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notifySLAWarning } from "@/lib/email/sender";

const CRON_SECRET = process.env.CRON_SECRET;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret (skip in Vercel cron context)
  if (CRON_SECRET) {
    const provided = req.nextUrl.searchParams.get("secret");
    if (provided !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
          setAll() {
            // Read-only
          },
        },
      }
    );

    const now = new Date();
    let alertsSent = 0;
    let errors = 0;

    // Find all open tickets that need SLA checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tickets, error: ticketError } = await supabase
      .from("ticket")
      .select(`
        id,
        ticket_no,
        subject,
        status,
        priority,
        assigned_agent_id,
        sla_policy_id,
        queue_id,
        created_at,
        sla_first_response_at,
        sla_resolution_at,
        sla_breach_notified_at,
        queue:queue_id (
          id,
          name,
          slug,
          sla_policy_id
        ),
        assigned_agent:assigned_agent_id (
          id,
          display_name,
          email
        )
      `)
      .in("status", ["open", "in_progress", "pending"])
      .is("sla_breach_notified_at", null);

    // Also fetch SLA policies separately to avoid array-relation type issues
    const { data: slaPolicies } = await supabase
      .from("sla_policy")
      .select("id, name, first_response_target_minutes, resolution_target_minutes")
      .eq("status", "active");

    const slaMap = new Map(
      (slaPolicies ?? []).map((p) => [p.id, p])
    );

    if (ticketError) {
      console.error("[SLA Cron] Failed to fetch tickets:", ticketError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: "No tickets to check", alertsSent: 0 });
    }

    for (const ticket of tickets) {
      try {
        const queue = ticket.queue as any;
        const agent = ticket.assigned_agent as any;
        const sla = slaMap.get(queue?.sla_policy_id ?? null) as {
          id: string;
          name: string;
          first_response_target_minutes: number;
          resolution_target_minutes: number;
        } | undefined;
        if (!sla) continue; // No SLA policy attached to this queue

        const createdAt = new Date(ticket.created_at);
        const minutesElapsed = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const ticketUrl = `${baseUrl}/agent/tickets/${ticket.id}`;

        // First response check
        if (
          sla.first_response_target_minutes > 0 &&
          minutesElapsed > sla.first_response_target_minutes &&
          !ticket.sla_first_response_at &&
          !ticket.sla_breach_notified_at
        ) {
          const minutesOverdue = minutesElapsed - sla.first_response_target_minutes;

          if (agent) {
            await notifySLAWarning({
              ticketNo: ticket.ticket_no,
              ticketSubject: ticket.subject,
              agentName: agent.display_name ?? "Agent",
              agentEmail: agent.email,
              slaPolicyName: sla.name,
              breachType: "first_response",
              minutesOverdue,
              ticketUrl,
            });
          }

          // Mark as notified
          await supabase
            .from("ticket")
            .update({ sla_breach_notified_at: now.toISOString() })
            .eq("id", ticket.id);

          alertsSent++;
        }

        // Resolution check
        if (
          sla.resolution_target_minutes > 0 &&
          minutesElapsed > sla.resolution_target_minutes &&
          !ticket.sla_resolution_at &&
          !ticket.sla_breach_notified_at
        ) {
          const minutesOverdue = minutesElapsed - sla.resolution_target_minutes;

          if (agent) {
            await notifySLAWarning({
              ticketNo: ticket.ticket_no,
              ticketSubject: ticket.subject,
              agentName: agent.display_name ?? "Agent",
              agentEmail: agent.email,
              slaPolicyName: sla.name,
              breachType: "resolution",
              minutesOverdue,
              ticketUrl,
            });
          }

          await supabase
            .from("ticket")
            .update({ sla_breach_notified_at: now.toISOString() })
            .eq("id", ticket.id);

          alertsSent++;
        }
      } catch (e) {
        console.error(`[SLA Cron] Error processing ticket ${ticket.ticket_no}:`, e);
        errors++;
      }
    }

    console.log(`[SLA Cron] Done — alerts sent: ${alertsSent}, errors: ${errors}`);
    return NextResponse.json({ ok: true, alertsSent, errors });
  } catch (err) {
    console.error("[SLA Cron] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
