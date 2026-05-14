
import { openai } from "./client";

export async function summarizeTicket({
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
  const prompt = `Summarize the following support ticket concisely:
Subject: ${subject}
Description: ${description ?? "None"}

Comments (if any):
${commentsText || "No comments yet."}

Keep the summary under 150 words, clear and actionable.`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });
  return response.choices[0].message.content || "";
}
