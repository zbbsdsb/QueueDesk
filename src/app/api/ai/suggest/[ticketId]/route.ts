
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { classifyTicket, summarizeTicket, draftReply } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    );

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("ticket")
      .select("id, subject, description, ticket_no")
      .eq("id", params.ticketId)
      .single();
    if (ticketError) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Get comments for the ticket
    const { data: comments } = await supabase
      .from("ticket_comment")
      .select(`id, body, author:author_user_id(id, display_name, email)`)
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });

    const commentsForAI = comments?.map((c) => ({
      body: c.body,
      author: c.author?.display_name || c.author?.email,
    }));

    // Run all AI tasks in parallel
    const [classification, summary, draft] = await Promise.all([
      classifyTicket({
        subject: ticket.subject,
        description: ticket.description,
      }),
      summarizeTicket({
        subject: ticket.subject,
        description: ticket.description,
        comments: commentsForAI,
      }),
      draftReply({
        subject: ticket.subject,
        description: ticket.description,
        comments: commentsForAI,
      }),
    ]);

    return NextResponse.json({
      classification,
      summary,
      draftReply: draft,
    });
  } catch (err) {
    console.error("[AI Suggest] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
