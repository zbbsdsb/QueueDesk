import crypto from "crypto";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shared utility functions — single source of truth for time formatting.
 * Import from here instead of copy-pasting across pages/components.
 */

const TOKEN_SECRET = process.env.TICKET_TOKEN_SECRET || "fallback-secret-change-me-in-prod";

/**
 * Generates a signed token for public ticket access.
 * Format: base64url(ticketId) + "." + base64url(hmac-sha256(ticketId, secret))
 */
export function generatePublicTicketToken(ticketId: string): string {
  const ticketIdB64 = Buffer.from(ticketId).toString("base64url");
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
  hmac.update(ticketId);
  const signature = hmac.digest("base64url");
  return `${ticketIdB64}.${signature}`;
}

/**
 * Verifies a signed token and returns the ticket ID if valid.
 * Returns null if invalid.
 */
export function verifyPublicTicketToken(token: string): string | null {
  try {
    const [ticketIdB64, signature] = token.split(".");
    if (!ticketIdB64 || !signature) return null;

    const ticketId = Buffer.from(ticketIdB64, "base64url").toString("utf8");
    const expectedHmac = crypto.createHmac("sha256", TOKEN_SECRET);
    expectedHmac.update(ticketId);
    const expectedSignature = expectedHmac.digest("base64url");

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, "base64url"),
      Buffer.from(expectedSignature, "base64url")
    );

    return isValid ? ticketId : null;
  } catch {
    return null;
  }
}

/**
 * Returns a compact relative time string suitable for dense UIs (tables, rows).
 * Examples: "<1m" | "45m" | "3h" | "12d" | "2mo"
 */
export function getAge(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

/**
 * Returns a human-friendly relative time string.
 * Examples: "just now" | "5m ago" | "3h ago" | "2d ago" | "Jan 5, 2026"
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Returns a formatted date+time string.
 * Example: "Jan 5, 2026, 02:30 PM"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * SLA time conversion utilities.
 * Database uses seconds for precision, UI uses minutes for user-friendliness.
 */
export function minutesToSeconds(minutes: number): number {
  return Math.max(0, minutes * 60);
}

export function secondsToMinutes(seconds: number | null | undefined): number {
  if (seconds == null) return 0;
  return Math.max(0, seconds / 60);
}
