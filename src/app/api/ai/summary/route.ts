/**
 * POST /api/ai/summary — short natural-language weather summary (+ outfit hint)
 *
 * Body: `{ city, weather: { temp, humidity, wind, main, description } }`.
 * Tries streaming first (`text/plain` chunks); if no stream, returns JSON `{ text }`.
 */
import { generateWithAI } from "@/lib/ai";
import { generateWithAIStream } from "@/lib/ai-stream";
import { enforceAiRateLimit } from "@/lib/ai-rate-limit";
import { validateSummaryBody } from "@/lib/ai-validate";
import { NextRequest, NextResponse } from "next/server";

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
  const prompt = `In 2 to 3 short sentences, summarize the weather in ${city}: ${weather.main}, ${weather.description}, ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h. Add one brief suggestion on what to wear or carry. Keep it friendly and concise.`;

  const stream = await generateWithAIStream(prompt);
  if (stream) {
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  const text = await generateWithAI(prompt);
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
