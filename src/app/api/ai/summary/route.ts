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
  };
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { city, weather } = body;
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
