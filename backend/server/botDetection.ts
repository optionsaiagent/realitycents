/**
 * Server-side bot detection for public form submissions.
 *
 * The client-side checks in frontend/client/src/lib/mailchimp.ts don't help
 * against bots that post directly to the API, so the same rules (plus
 * message heuristics and rate limiting) are enforced here. Callers should
 * return a fake success response when these checks fail, so bots don't
 * learn and retry.
 */
import type { Request } from "express";

/** Same rules as the client-side isHumanName in lib/mailchimp.ts. */
export function isHumanName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true; // empty is handled by schema validation
  if (trimmed.length > 40) return false;
  if (!/[aeiouAEIOU]/.test(trimmed)) return false;
  if (/[^aeiouAEIOU\s]{4,}/i.test(trimmed)) return false;
  if (/\d/.test(trimmed)) return false;
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 3) {
    const upperCount = (letters.match(/[A-Z]/g) || []).length;
    if (upperCount / letters.length > 0.5) return false;
  }
  return true;
}

/** Heuristics for junk message bodies (digits-only, no real words, link spam). */
export function isLikelyBotMessage(message: string): boolean {
  const trimmed = message.trim();
  // Must contain at least two "words" of 2+ letters — rejects "3860354707"
  const words = trimmed.match(/[a-zA-Z]{2,}/g) ?? [];
  if (words.length < 2) return true;
  // Mostly digits
  const digits = (trimmed.match(/\d/g) ?? []).length;
  if (trimmed.length > 0 && digits / trimmed.length > 0.6) return true;
  // Link spam
  const links = (trimmed.match(/https?:\/\//gi) ?? []).length;
  if (links > 3) return true;
  return false;
}

// ── Simple in-memory rate limiter (per IP, sliding window) ────────────────
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every(t => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}
