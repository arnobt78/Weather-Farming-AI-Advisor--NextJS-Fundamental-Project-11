/**
 * Server-only. TTS: try ElevenLabs first, then Edge TTS (no key).
 */

const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function textToSpeechElevenLabs(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: "eleven_monolingual_v1",
      }),
    },
  );
  if (!res.ok) return null;
  return res.arrayBuffer();
}

export async function textToSpeechEdge(text: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const { EdgeTTS } = await import("edge-tts-universal");
    const tts = new EdgeTTS(text.slice(0, 5000), "en-US-AriaNeural");
    const result = await tts.synthesize();
    const buffer = Buffer.from(await result.audio.arrayBuffer());
    return { buffer, contentType: "audio/mpeg" };
  } catch {
    return null;
  }
}
