/**
 * Server-only. Streaming AI text generation with fallback chain: Gemini → Groq → OpenRouter.
 */

async function tryGeminiStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  });
  if (!res.ok || !res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          processGeminiBuffer(buffer, controller);
        }
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        processGeminiLine(line, controller);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

function processGeminiLine(
  line: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return;
  const jsonStr = trimmed.slice(5).trim();
  if (!jsonStr || jsonStr === "[DONE]") return;
  try {
    const parsed = JSON.parse(jsonStr) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      controller.enqueue(new TextEncoder().encode(text));
    }
  } catch {
    // skip malformed JSON chunks
  }
}

function processGeminiBuffer(
  buffer: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
) {
  const lines = buffer.split("\n");
  for (const line of lines) {
    processGeminiLine(line, controller);
  }
}

async function tryGroqStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) return null;
  return parseOpenAISSE(res.body);
}

async function tryOpenRouterStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) return null;
  return parseOpenAISSE(res.body);
}

function parseOpenAISSE(
  body: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        } catch {
          // skip malformed chunks
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/**
 * Generate streaming text using AI with fallback chain: Gemini → Groq → OpenRouter.
 * Returns a ReadableStream of UTF-8 text chunks, or null if all providers fail.
 */
export async function generateWithAIStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const fromGemini = await tryGeminiStream(prompt);
  if (fromGemini) return fromGemini;
  const fromGroq = await tryGroqStream(prompt);
  if (fromGroq) return fromGroq;
  return tryOpenRouterStream(prompt);
}
