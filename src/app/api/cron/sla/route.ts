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
import { secondsToMinutes } from "@/lib/utils";
import type { Ticket, Queue, SlaPolicy, AppUser } from "@/lib/types";

const CRON_SECRET = process.env.CRON_SECRET;

export const dynamic = "force-dynamic";

interface TicketWithRelations extends Ticket {
  queue: Queue | null;
  assignee_user: AppUser | null;
}

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
    const { data: tickets, error: ticketError } = await supabase
      .from("ticket")
      .select(`
        id,
        ticket_no,
        subject,
        status,
        priority,
        assignee_user_id,
        queue_id,
        created_at,
        next_sla_breach_at,
        submitted_at,
        first_responded_at,
        resolved_at,
        queue:queue_id (
          id,
          name,
          default_sla_policy_id
        ),
        assignee_user:assignee_user_id (
          id,
          display_name,
          email
        )
      `)
      .in("status", ["open", "pending", "waiting_approval", "waiting_customer"])
      .is("deleted_at", null);

    // Also fetch SLA policies separately
    const { data: slaPolicies } = await supabase
      .from("sla_policy")
      .select("*")
      .is("deleted_at", null);

    const slaMap = new Map(
      (slaPolicies as SlaPolicy[] ?? []).map((p) => [p.id, p])
    );

    if (ticketError) {
      console.error("[SLA Cron] Failed to fetch tickets:", ticketError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: "No tickets to check", alertsSent: 0 });
    }

    const ticketsWithRelations = tickets as Array<Record<string, unknown>>;

    for (const ticket of ticketsWithRelations) {
      try {
        const queue = ticket.queue as Queue | null;
        const agent = ticket.assignee_user as AppUser | null;
        const ticketData = ticket as unknown as Ticket;
        const sla = queue?.default_sla_policy_id ? slaMap.get(queue.default_sla_policy_id) : null;
        
        if (!sla) continue; // No SLA policy attached to this queue

        const createdAt = new Date(ticketData.submitted_at || ticketData.created_at);
        const minutesElapsed = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const ticketUrl = `${baseUrl}/agent/tickets/${ticketData.id}`;

        // First response check
        if (
          sla.first_response_seconds &&
          !ticketData.first_responded_at &&
          !ticketData.next_sla_breach_at
        ) {
          const firstRespMinutes = secondsToMinutes(sla.first_response_seconds);
          if (minutesElapsed > firstRespMinutes) {
            const minutesOverdue = minutesElapsed - firstRespMinutes;

            if (agent && agent.email) {
              await notifySLAWarning({
                ticketNo: ticketData.ticket_no ?? 0,
                ticketSubject: ticketData.subject,
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
              .update({ next_sla_breach_at: now.toISOString() })
              .eq("id", ticketData.id);

            alertsSent++;
          }
        }

        // Resolution check
        if (
          sla.resolution_seconds &&
          !ticketData.resolved_at &&
          !ticketData.next_sla_breach_at
        ) {
          const resolutionMinutes = secondsToMinutes(sla.resolution_seconds);
          if (minutesElapsed > resolutionMinutes) {
            const minutesOverdue = minutesElapsed - resolutionMinutes;

            if (agent && agent.email) {
              await notifySLAWarning({
                ticketNo: ticketData.ticket_no ?? 0,
                ticketSubject: ticketData.subject,
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
              .update({ next_sla_breach_at: now.toISOString() })
              .eq("id", ticketData.id);

            alertsSent++;
          }
        }
      } catch (e) {
        console.error(`[SLA Cron] Error processing ticket:`, e);
        errors++;
      }
    }

    console.log(`[SLA Cron] Done — alerts sent: ${alertsSent}, errors: ${errors}");
    return NextResponse.json({ ok: true, alertsSent, errors });
  } catch (err) {
    console.error("[SLA Cron] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
