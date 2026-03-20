import { textToSpeechEdge, textToSpeechElevenLabs } from "@/lib/tts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const elevenBuffer = await textToSpeechElevenLabs(text);
  if (elevenBuffer && elevenBuffer.byteLength > 0) {
    return new NextResponse(elevenBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(elevenBuffer.byteLength),
      },
    });
  }

  const edgeResult = await textToSpeechEdge(text);
  if (edgeResult) {
    return new NextResponse(new Uint8Array(edgeResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": edgeResult.contentType,
        "Content-Length": String(edgeResult.buffer.length),
        "X-TTS-Fallback": "edge",
      },
    });
  }

  return NextResponse.json({ error: "TTS unavailable" }, { status: 503 });
}
