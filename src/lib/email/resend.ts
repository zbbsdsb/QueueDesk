/**
 * Resend email client singleton.
 * Used server-side only — never import this in client components.
 */

import { Resend } from "resend";

let _client: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_api_key_here") {
    return null;
  }
  if (!_client) {
    _client = new Resend(apiKey);
  }
  return _client;
}

export function isEmailConfigured(): boolean {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "your_resend_api_key_here"
  );
}
