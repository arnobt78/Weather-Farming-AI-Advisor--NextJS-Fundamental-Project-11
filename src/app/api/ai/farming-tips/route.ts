import { generateWithAI } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

type Body = {
  city: string;
  weather: {
    temp: number;
    humidity: number;
    wind: number;
    main: string;
    description: string;
  } | null;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { city, weather } = body;
  const prompt = weather
    ? `You are a farming and gardening advisor. Based on this weather in ${city}: ${weather.main}, ${weather.description}, temperature ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h. Give 3 to 5 short, practical farming or gardening tips (watering, planting, protection, etc.). Use clear bullet points or short paragraphs.`
    : `You are a farming and gardening advisor. The user is in ${city}. Give 3 to 5 general short farming or gardening tips for the current season. Use clear bullet points or short paragraphs.`;

  const text = await generateWithAI(prompt);
  if (!text) {
    return NextResponse.json(
      { error: "AI service unavailable. Check AI API keys (Gemini, Groq, or OpenRouter)." },
      { status: 503 },
    );
  }
  return NextResponse.json({ text });
}
