/**
 * lib/ai-rate-limit.ts — coarse in-memory limit for POST /api/ai/*
 *
 * Walkthrough:
 * - 10 POSTs per IP per 60s across summary, farming-tips, and TTS (DEC-0009).
 * - Map lives on this Fluid/serverless instance only — not a global Redis quota.
 * - Over limit → caller returns 429. If this helper throws → fail-open (allow the request).
 */
import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_HITS = 10;

const hitsByIp = new Map<string, number[]>();

export function clientIpFromRequest(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** True when this IP is still under the window limit. */
export function allowAiRequest(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const previous = hitsByIp.get(ip) ?? [];
  const recent = previous.filter((t) => t > windowStart);
  if (recent.length >= MAX_HITS) {
    hitsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return true;
}

/** 429 JSON when over limit; null when allowed or if the limiter itself fails. */
export function enforceAiRateLimit(request: NextRequest): NextResponse | null {
  try {
    const ip = clientIpFromRequest(request);
    if (!allowAiRequest(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return null;
  } catch {
    return null;
  }
}
