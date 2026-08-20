/**
 * POST /api/ai/farming-tips — compact markdown farming advice from dashboard context
 *
 * Body may include weather, air quality, forecast slice, geo — `buildPrompt` assembles instructions.
 * Uses AI_MAX_TOKENS_FARMING so all required sections can finish (avoids mid-sentence cuts).
 * Same streaming-then-JSON fallback pattern as summary.
 */
import { generateWithAI } from "@/lib/ai";
import { generateWithAIStream } from "@/lib/ai-stream";
import { enforceAiRateLimit } from "@/lib/ai-rate-limit";
import { validateFarmingTipsBody } from "@/lib/ai-validate";
import { AI_MAX_TOKENS_FARMING } from "@/lib/ai-providers";
import { NextRequest, NextResponse } from "next/server";

type Body = {
  city: string;
  weather: {
    temp: number;
    humidity: number;
    wind: number;
    main: string;
    description: string;
    pressure?: number;
    visibility?: number;
  } | null;
  airQuality?: {
    aqi: number;
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  } | null;
  forecast?: Array<{
    date: string;
    temp: number;
    humidity: number;
    description: string;
  }> | null;
  geo?: {
    country?: string;
    lat?: number;
    lon?: number;
  } | null;
};

function getSeason(lat: number): string {
  const month = new Date().getMonth();
  const isNorthern = lat >= 0;
  if (isNorthern) {
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Autumn";
    return "Winter";
  }
  if (month >= 2 && month <= 4) return "Autumn";
  if (month >= 5 && month <= 7) return "Winter";
  if (month >= 8 && month <= 10) return "Spring";
  return "Summer";
}

const AQI_LABELS: Record<number, string> = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor",
};

/** Shared headers so Vercel/proxies flush chunks instead of buffering the full body. */
const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  "Transfer-Encoding": "chunked",
  "X-Accel-Buffering": "no",
} as const;

/**
 * Build a tight farming prompt: facts + required section headers.
 * Bans long greetings; requires every section to finish (no mid-sentence stop).
 */
function buildPrompt(body: Body): string {
  const { city, weather, airQuality, forecast, geo } = body;
  const parts: string[] = [];

  parts.push(
    "You are a farming/gardening advisor. Output ONLY the seven headed sections below. No greeting, no 'Dear Farmer', no apology, no 'As an AI', no closing essay.",
  );

  if (geo?.lat != null) {
    const season = getSeason(geo.lat);
    parts.push(
      `Location: ${city}${geo.country ? `, ${geo.country}` : ""} (${geo.lat.toFixed(2)}°, ${geo.lon?.toFixed(2) ?? "?"}°). Season: ${season}.`,
    );
  } else {
    parts.push(`Location: ${city}.`);
  }

  if (weather) {
    parts.push(
      `Weather: ${weather.main} (${weather.description}), ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h${weather.pressure ? `, pressure ${weather.pressure} hPa` : ""}${weather.visibility != null ? `, visibility ${(weather.visibility / 1000).toFixed(1)} km` : ""}.`,
    );
  }

  if (airQuality) {
    parts.push(
      `Air quality: AQI ${airQuality.aqi} (${AQI_LABELS[airQuality.aqi] ?? "Unknown"}), PM2.5 ${airQuality.pm2_5.toFixed(1)}, PM10 ${airQuality.pm10.toFixed(1)}, O₃ ${airQuality.o3.toFixed(1)}, NO₂ ${airQuality.no2.toFixed(1)} µg/m³.`,
    );
  }

  if (forecast && forecast.length > 0) {
    const forecastStr = forecast
      .slice(0, 5)
      .map((f) => `${f.date}: ${f.temp}°C, ${f.humidity}%, ${f.description}`)
      .join("; ");
    parts.push(`5-day forecast: ${forecastStr}.`);
  }

  parts.push(
    [
      "Write ALL of these sections with **Bold** headers and 1–3 short bullets each:",
      "**Watering**, **Planting**, **Soil Care**, **Pest Control**, **Protection**, **Harvest Tips**, **Air Quality Advisory**.",
      "Tie tips to the weather/season/AQI above. Name 1–2 suitable crops for the temperature/humidity.",
      "CRITICAL: Finish every section completely. Never stop mid-sentence. Prefer short bullets so all seven headers complete. No fluff before or after the sections.",
    ].join(" "),
  );

  return parts.join("\n\n");
}

export async function POST(request: NextRequest) {
  const limited = enforceAiRateLimit(request);
  if (limited) return limited;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateFarmingTipsBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const prompt = buildPrompt(body);

  const stream = await generateWithAIStream(prompt, AI_MAX_TOKENS_FARMING);
  if (stream) {
    return new Response(stream, {
      status: 200,
      headers: STREAM_HEADERS,
    });
  }

  const text = await generateWithAI(prompt, AI_MAX_TOKENS_FARMING);
  if (!text) {
    return NextResponse.json(
      {
        error:
          "AI service unavailable. Check AI API keys (Gemini, Groq, or OpenRouter).",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ text });
}
