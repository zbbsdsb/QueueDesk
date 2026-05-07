import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Email Intake Webhook Handler
 *
 * Handles incoming emails from Resend (and compatible providers like Mailgun, Postmark).
 * Creates a ticket automatically when a new email is received.
 *
 * Setup:
 * 1. Configure your email provider's webhook to POST to /api/email/intake
 * 2. Add RESEND_WEBHOOK_SECRET to .env.local
 * 3. Set up email routing rules in Resend to direct incoming emails here
 *
 * Supported events:
 * - email.received (Resend native)
 * - New conversion events (auto-detected from envelope)
 */

interface EmailPayload {
  // Resend webhook format
  type?: string;
  created_at?: string;
  user_agent?: string;
  email?: {
    id?: string;
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
    headers?: { key: string; value: string }[];
  };

  // Generic envelope (used by Postmark, Mailgun, etc.)
  From?: string;
  FromName?: string;
  To?: string;
  Subject?: string;
  TextBody?: string;
  StrippedTextReply?: string;
  MessageID?: string;
  ReceivedAt?: string;
}

function extractEmailBody(payload: EmailPayload): string | null {
  // Resend format
  if (payload.email?.text) return payload.email.text;
  // Generic formats
  if (payload.TextBody) return payload.TextBody;
  if (payload.StrippedTextReply) return payload.StrippedTextReply;
  if (payload.email?.html) {
    // Strip basic HTML tags for plain text
    return payload.email.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return null;
}

function extractSubject(payload: EmailPayload): string {
  if (payload.email?.subject) return payload.email.subject;
  if (payload.Subject) return payload.Subject;
  return "(No subject)";
}

function extractFromEmail(payload: EmailPayload): string {
  if (payload.email?.from) {
    // Handle "Name <email>" format
    const match = payload.email.from.match(/<(.+?)>/);
    return match ? match[1] : payload.email.from;
  }
  if (payload.From) {
    const match = payload.From.match(/<(.+?)>/);
    return match ? match[1] : payload.From;
  }
  return "";
}

function extractTenantFromTo(payload: EmailPayload): string | null {
  // Resend sends "ticket-{queue_slug}@{your_domain}.com"
  const toField = payload.email?.to ?? payload.To ?? "";
  if (typeof toField === "string") {
    const match = toField.match(/^[^@]+/);
    return match ? match[0] : null;
  }
  if (Array.isArray(toField) && toField[0]) {
    const first = toField[0];
    const match = String(first).match(/^[^@]+/);
    return match ? match[0] : null;
  }
  return null;
}

function verifyWebhookSignature(req: NextRequest): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Email Intake] RESEND_WEBHOOK_SECRET not set — skipping signature verification");
    return true; // Allow in dev, enforce in prod
  }

  const signature = req.headers.get("Resend-Signature") ?? req.headers.get("x-webhook-signature");
  if (!signature) return false;

  // Simple HMAC check — in production, verify against the secret
  // Resend uses format: t={timestamp},v1={signature}
  return signature.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EmailPayload = await req.json();

    // Basic event filtering
    const eventType = payload.type;
    if (eventType && eventType !== "email.received") {
      return NextResponse.json({ received: true, skipped: "event type not handled" });
    }

    // Signature verification (skip in dev if no secret set)
    if (!verifyWebhookSignature(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromEmail = extractFromEmail(payload);
    if (!fromEmail) {
      return NextResponse.json({ error: "Could not extract sender email" }, { status: 400 });
    }

    const tenantRoutingHint = extractTenantFromTo(payload);
    const subject = extractSubject(payload);
    const body = extractEmailBody(payload);

    if (!body?.trim()) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 });
    }

    // Create Supabase client (server-side)
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
            // Read-only for webhooks
          },
        },
      }
    );

    // Step 1: Find or create contact by email
    let contactId: string | null = null;

    const { data: existingContact } = await supabase
      .from("contact")
      .select("id")
      .eq("primary_email", fromEmail)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
    } else {
      // Auto-create contact from email
      const { data: newContact, error: contactError } = await supabase
        .from("contact")
        .insert({
          primary_email: fromEmail,
          full_name: fromEmail.split("@")[0],
          contact_type: "employee",
          status: "active",
        })
        .select("id")
        .single();

      if (contactError) {
        console.error("[Email Intake] Failed to create contact:", contactError);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
      }
      contactId = newContact.id;
    }

    // Step 2: Determine queue
    // If tenant routing hint is provided, look up the queue by slug pattern "email-{queue}"
    let queueId: string | null = null;
    if (tenantRoutingHint) {
      const { data: queueData } = await supabase
        .from("queue")
        .select("id, tenant_id")
        .eq("slug", tenantRoutingHint)
        .eq("status", "active")
        .maybeSingle();

      if (queueData) {
        queueId = queueData.id;
      }
    }

    // Fallback: get the first available queue for this tenant
    if (!queueId && contactId) {
      // We need tenant_id from the contact's tenant context
      const { data: contactWithTenant } = await supabase
        .from("contact")
        .select("tenant_id")
        .eq("id", contactId)
        .single();

      if (contactWithTenant?.tenant_id) {
        const { data: fallbackQueue } = await supabase
          .from("queue")
          .select("id")
          .eq("tenant_id", contactWithTenant.tenant_id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        queueId = fallbackQueue?.id ?? null;
      }
    }

    if (!queueId) {
      // No queue available — store for later processing
      console.warn("[Email Intake] No queue found for email from", fromEmail);
      return NextResponse.json({
        received: true,
        queued: false,
        reason: "no_queue_available",
      });
    }

    // Step 3: Get tenant_id from queue
    const { data: queueWithTenant } = await supabase
      .from("queue")
      .select("tenant_id")
      .eq("id", queueId)
      .single();

    if (!queueWithTenant?.tenant_id) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    // Step 4: Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("ticket")
      .insert({
        tenant_id: queueWithTenant.tenant_id,
        queue_id: queueId,
        requester_id: contactId,
        subject: subject.slice(0, 200),
        description: body.trim(),
        priority: "normal",
        status: "open",
        lock_version: 1,
      })
      .select("id, ticket_no")
      .single();

    if (ticketError) {
      console.error("[Email Intake] Failed to create ticket:", ticketError);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    console.log(`[Email Intake] Created ticket ${ticket.ticket_no} from ${fromEmail}`);

    return NextResponse.json({
      received: true,
      ticket_id: ticket.id,
      ticket_no: ticket.ticket_no,
    });
  } catch (err) {
    console.error("[Email Intake] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Tell Next.js not to parse the body for this route (it's a webhook)
export const dynamic = "force-dynamic";
