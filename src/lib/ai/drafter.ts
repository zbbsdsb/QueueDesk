
import { openai } from "./client";

export async function draftReply({
  subject,
  description,
  comments,
}: {
  subject: string;
  description: string | null;
  comments?: Array<{ body: string; author?: string }>;
}): Promise<string> {
  const commentsText = comments
    ? comments.map((c) => `${c.author || "Unknown"}: ${c.body}`).join("\n\n")
    : "";
  const prompt = `Write a friendly, professional reply to the requester of this support ticket:
Subject: ${subject}
Description: ${description ?? "None"}

Comments (if any):
${commentsText || "No comments yet."}

Keep it under 200 words, ask clarifying questions if needed, and end with a positive note.`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });
  return response.choices[0].message.content || "";
}
