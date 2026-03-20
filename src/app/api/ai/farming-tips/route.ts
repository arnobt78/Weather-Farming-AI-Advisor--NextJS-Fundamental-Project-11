import { generateWithAI } from "@/lib/ai";
import { generateWithAIStream } from "@/lib/ai-stream";
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

function buildPrompt(body: Body): string {
  const { city, weather, airQuality, forecast, geo } = body;
  const parts: string[] = [];

  parts.push(
    "You are an expert farming, gardening, and agricultural advisor. Provide detailed, practical, and actionable advice.",
  );

  if (geo?.lat != null) {
    const season = getSeason(geo.lat);
    parts.push(
      `Location: ${city}${geo.country ? `, ${geo.country}` : ""} (${geo.lat?.toFixed(2)}°, ${geo.lon?.toFixed(2)}°). Current season: ${season}.`,
    );
  } else {
    parts.push(`Location: ${city}.`);
  }

  if (weather) {
    parts.push(
      `Current weather: ${weather.main} (${weather.description}), temperature ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h${weather.pressure ? `, pressure ${weather.pressure} hPa` : ""}${weather.visibility != null ? `, visibility ${(weather.visibility / 1000).toFixed(1)} km` : ""}.`,
    );
  }

  if (airQuality) {
    parts.push(
      `Air quality: AQI ${airQuality.aqi} (${AQI_LABELS[airQuality.aqi] ?? "Unknown"}), PM2.5: ${airQuality.pm2_5.toFixed(1)}, PM10: ${airQuality.pm10.toFixed(1)}, O₃: ${airQuality.o3.toFixed(1)}, NO₂: ${airQuality.no2.toFixed(1)} µg/m³.`,
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
    "Based on ALL the above data, provide 5 to 7 detailed farming and gardening tips organized with these sections: **Watering**, **Planting**, **Soil Care**, **Pest Control**, **Protection**, **Harvest Tips**, **Air Quality Advisory**. Use markdown bold for section headers. Be specific to the current weather conditions, season, and air quality. Include crop suggestions suitable for the temperature and humidity range.",
  );

  return parts.join("\n\n");
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = buildPrompt(body);

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
          "AI service unavailable. Check AI API keys (Gemini, Groq, or OpenRouter).",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ text });
}
