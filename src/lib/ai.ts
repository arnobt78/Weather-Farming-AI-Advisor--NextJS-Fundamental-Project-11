/**
 * lib/ai.ts — non-streaming AI text (Server / Route Handlers only)
 *
 * Walkthrough:
 * - `generateWithAI` walks Gemini → Groq → OpenRouter → Hugging Face (skip unconfigured).
 * - Model IDs live in `ai-providers.ts` (same list as streaming).
 * - Optional `maxTokens` overrides the default `AI_MAX_TOKENS` (summary vs farming budgets).
 * - Missing key / HTTP error / empty text → next model; 429 → next provider.
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
  geminiGenerateUrl,
  getHuggingFaceKey,
  skipRemainingModels,
  tryModelChain,
} from "@/lib/ai-providers";

async function tryGemini(
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  return tryModelChain(GEMINI_MODELS, async (model) => {
    const res = await fetch(geminiGenerateUrl(model, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: AI_TEMPERATURE,
        },
      }),
    });
    if (!res.ok) {
      return { value: null, skipProvider: skipRemainingModels(res.status) };
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const value = typeof text === "string" && text.length > 0 ? text : null;
    return { value, skipProvider: false };
  });
}

type OpenAIChatJson = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function tryOpenAICompatible(
  url: string,
  apiKey: string,
  models: readonly string[],
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
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
        max_tokens: maxTokens,
        temperature: AI_TEMPERATURE,
      }),
    });
    if (!res.ok) {
      return { value: null, skipProvider: skipRemainingModels(res.status) };
    }
    const data = (await res.json()) as OpenAIChatJson;
    const text = data.choices?.[0]?.message?.content;
    const value = typeof text === "string" && text.length > 0 ? text : null;
    return { value, skipProvider: false };
  });
}

async function tryGroq(
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return tryOpenAICompatible(
    GROQ_CHAT_URL,
    apiKey,
    GROQ_MODELS,
    prompt,
    maxTokens,
  );
}

async function tryOpenRouter(
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  return tryOpenAICompatible(
    OPENROUTER_CHAT_URL,
    apiKey,
    OPENROUTER_MODELS,
    prompt,
    maxTokens,
  );
}

async function tryHuggingFace(
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = getHuggingFaceKey();
  if (!apiKey) return null;
  return tryOpenAICompatible(
    HUGGINGFACE_CHAT_URL,
    apiKey,
    HUGGINGFACE_MODELS,
    prompt,
    maxTokens,
  );
}

/**
 * Generate text using AI: Gemini → Groq → OpenRouter → Hugging Face.
 * @param maxTokens — route-specific budget (defaults to AI_MAX_TOKENS).
 */
export async function generateWithAI(
  prompt: string,
  maxTokens: number = AI_MAX_TOKENS,
): Promise<string | null> {
  const fromGemini = await tryGemini(prompt, maxTokens);
  if (fromGemini) return fromGemini;
  const fromGroq = await tryGroq(prompt, maxTokens);
  if (fromGroq) return fromGroq;
  const fromOpenRouter = await tryOpenRouter(prompt, maxTokens);
  if (fromOpenRouter) return fromOpenRouter;
  return tryHuggingFace(prompt, maxTokens);
}
