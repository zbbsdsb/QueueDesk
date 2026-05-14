
import { openai } from "./client";

interface ClassificationResult {
  category: string;
  suggestedPriority: "low" | "normal" | "high" | "urgent";
  confidence: number;
}

export async function classifyTicket({
  subject,
  description,
}: {
  subject: string;
  description: string | null;
}): Promise<ClassificationResult> {
  const prompt = `Classify this support ticket:
Subject: ${subject}
Description: ${description ?? "None"}

Respond in JSON format with fields:
- category: (e.g., "Hardware", "Software", "Access", "Billing", "Other")
- suggestedPriority: ("low", "normal", "high", "urgent")
- confidence: (0.0 to 1.0)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content ?? "";
  const parsed = JSON.parse(content);

  return {
    category: parsed.category || "Other",
    suggestedPriority: parsed.suggestedPriority || "normal",
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.8)),
  };
}
