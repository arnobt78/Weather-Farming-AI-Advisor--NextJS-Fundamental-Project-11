/**
 * POST /api/ai/summary — short natural-language weather summary (+ outfit hint)
 *
 * Body: `{ city, weather: { temp, humidity, wind, main, description } }`.
 * Tries streaming first (`text/plain` chunks); if no stream, returns JSON `{ text }`.
 * Uses AI_MAX_TOKENS_SUMMARY so the short reply is not starved by farming-scale budgets.
 */
import { generateWithAI } from "@/lib/ai";
import { generateWithAIStream } from "@/lib/ai-stream";
import { enforceAiRateLimit } from "@/lib/ai-rate-limit";
import { validateSummaryBody } from "@/lib/ai-validate";
import { AI_MAX_TOKENS_SUMMARY } from "@/lib/ai-providers";
import { NextRequest, NextResponse } from "next/server";

/** Shared headers so Vercel/proxies flush chunks instead of buffering the full body. */
const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  "Transfer-Encoding": "chunked",
  "X-Accel-Buffering": "no",
} as const;

export async function POST(request: NextRequest) {
  const limited = enforceAiRateLimit(request);
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateSummaryBody(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { city, weather } = parsed;
  // Stick to payload facts only — no invented conditions or long essays.
  const prompt = `Write exactly 2–3 short sentences about the weather in ${city} using ONLY these facts: ${weather.main}, ${weather.description}, ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h. End with one brief wear/carry tip. Factual and direct. No greeting, no "Dear…", no filler openers, no markdown, no closing sign-off.`;

  const stream = await generateWithAIStream(prompt, AI_MAX_TOKENS_SUMMARY);
  if (stream) {
    return new Response(stream, {
      status: 200,
      headers: STREAM_HEADERS,
    });
  }

  const text = await generateWithAI(prompt, AI_MAX_TOKENS_SUMMARY);
  if (!text) {
    return NextResponse.json(
      {
        error:
          "AI summary unavailable. Check AI API keys (Gemini, Groq, or OpenRouter).",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ text });
}
