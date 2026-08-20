/**
 * lib/ai-providers.ts — free-tier model IDs shared by JSON (`ai.ts`) and stream (`ai-stream.ts`)
 *
 * Source of truth for *strategy*: docs/LLM_MODEL_SELECTION.md
 * Live IDs (2026-08): Gemini 2.5 Flash, Groq gpt-oss / Qwen 3.6, OpenRouter `:free`, HF router.
 * HTTP 429 on a provider → skip remaining models for that provider (rate limit is usually account-wide).
 */

export const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

/** Groq: llama-3.1-8b-instant shut down 2026-08-16 → gpt-oss-20b, then Qwen 3.6 27B. */
export const GROQ_MODELS = ["openai/gpt-oss-20b", "qwen/qwen3.6-27b"] as const;

/** OpenRouter free-tier IDs must end in `:free`. */
export const OPENROUTER_MODELS = [
  "openai/gpt-oss-20b:free",
  "deepseek/deepseek-chat-v3-0324:free",
] as const;

export const HUGGINGFACE_MODELS = ["openai/gpt-oss-20b:fastest"] as const;

export const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
export const HUGGINGFACE_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

/** Default / fallback max output tokens when a route does not pass its own budget. */
export const AI_MAX_TOKENS = 2048;
/** Short weather summary — 2–3 sentences + outfit hint. */
export const AI_MAX_TOKENS_SUMMARY = 1024;
/** Farming tips — all required sections must finish; higher budget avoids mid-sentence cuts. */
export const AI_MAX_TOKENS_FARMING = 4096;
export const AI_TEMPERATURE = 0.7;

export function geminiGenerateUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

export function geminiStreamUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
}

export function getHuggingFaceKey(): string | undefined {
  return process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN;
}

/** Rate limit → skip the rest of this provider's model chain. */
export function skipRemainingModels(status: number): boolean {
  return status === 429;
}

export type ModelAttempt<T> = {
  value: T | null;
  skipProvider: boolean;
};

/** Try each model until one returns a value, or 429 skips the provider. */
export async function tryModelChain<T>(
  models: readonly string[],
  attempt: (model: string) => Promise<ModelAttempt<T>>,
): Promise<T | null> {
  for (const model of models) {
    const { value, skipProvider } = await attempt(model);
    if (value) return value;
    if (skipProvider) break;
  }
  return null;
}
