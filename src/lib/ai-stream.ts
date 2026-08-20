/**
 * lib/ai-stream.ts — streaming AI text (SSE / chunked bodies)
 *
 * Walkthrough:
 * - Gemini uses `streamGenerateContent` + SSE; we re-emit plain UTF-8 chunks.
 * - Groq / OpenRouter / Hugging Face use OpenAI-style SSE (`choices[0].delta.content`).
 * - Model IDs match `ai-providers.ts` (same chain as JSON `ai.ts`).
 * - 429 skips remaining models on that provider.
 */

import {
  AI_MAX_TOKENS,
  AI_TEMPERATURE,
  GEMINI_MODELS,
  GROQ_CHAT_URL,
  GROQ_MODELS,
  HUGGINGFACE_CHAT_URL,
  HUGGINGFACE_MODELS,
  OPENROUTER_CHAT_URL,
  OPENROUTER_MODELS,
  geminiStreamUrl,
  getHuggingFaceKey,
  skipRemainingModels,
  tryModelChain,
} from "@/lib/ai-providers";

async function tryGeminiStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  return tryModelChain(GEMINI_MODELS, async (model) => {
    const res = await fetch(geminiStreamUrl(model, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: AI_MAX_TOKENS, temperature: AI_TEMPERATURE },
      }),
    });
    if (!res.ok || !res.body) {
      return { value: null, skipProvider: skipRemainingModels(res.status) };
    }
    return { value: geminiSseToTextStream(res.body), skipProvider: false };
  });
}

function geminiSseToTextStream(
  body: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const reader = body.getReader();
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

async function tryOpenAICompatibleStream(
  url: string,
  apiKey: string,
  models: readonly string[],
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  return tryModelChain(models, async (model) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: AI_MAX_TOKENS,
        temperature: AI_TEMPERATURE,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      return { value: null, skipProvider: skipRemainingModels(res.status) };
    }
    return { value: parseOpenAISSE(res.body), skipProvider: false };
  });
}

async function tryGroqStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return tryOpenAICompatibleStream(GROQ_CHAT_URL, apiKey, GROQ_MODELS, prompt);
}

async function tryOpenRouterStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return tryOpenAICompatibleStream(
    OPENROUTER_CHAT_URL,
    apiKey,
    OPENROUTER_MODELS,
    prompt,
  );
}

async function tryHuggingFaceStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = getHuggingFaceKey();
  if (!apiKey) return null;
  return tryOpenAICompatibleStream(
    HUGGINGFACE_CHAT_URL,
    apiKey,
    HUGGINGFACE_MODELS,
    prompt,
  );
}

/** Transform upstream OpenAI-compatible SSE into a simple byte stream of decoded text deltas. */
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
 * Generate streaming text: Gemini → Groq → OpenRouter → Hugging Face.
 * Returns a ReadableStream of UTF-8 text chunks, or null if all providers fail.
 */
export async function generateWithAIStream(
  prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const fromGemini = await tryGeminiStream(prompt);
  if (fromGemini) return fromGemini;
  const fromGroq = await tryGroqStream(prompt);
  if (fromGroq) return fromGroq;
  const fromOpenRouter = await tryOpenRouterStream(prompt);
  if (fromOpenRouter) return fromOpenRouter;
  return tryHuggingFaceStream(prompt);
}
