/**
 * lib/ai-validate.ts — runtime guards for POST /api/ai/summary and farming-tips
 *
 * Walkthrough:
 * - TypeScript types are compile-time only; these checks return a stable `{ error }` string for 400s.
 * - No Zod. Empty DSN/keys are unrelated — this only validates JSON bodies.
 */

export type AiWeatherSnapshot = {
  temp: number;
  humidity: number;
  wind: number;
  main: string;
  description: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function readCity(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const city = (body as { city?: unknown }).city;
  return typeof city === "string" ? city.trim() : "";
}

/** Weather snapshot required by the summary route. */
export function parseWeatherSnapshot(value: unknown): AiWeatherSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const w = value as Record<string, unknown>;
  if (
    !isFiniteNumber(w.temp) ||
    !isFiniteNumber(w.humidity) ||
    !isFiniteNumber(w.wind)
  ) {
    return null;
  }
  if (typeof w.main !== "string" || !w.main.trim()) return null;
  if (typeof w.description !== "string" || !w.description.trim()) return null;
  return {
    temp: w.temp,
    humidity: w.humidity,
    wind: w.wind,
    main: w.main.trim(),
    description: w.description.trim(),
  };
}

export type SummaryBodyOk = {
  ok: true;
  city: string;
  weather: AiWeatherSnapshot;
};

export type FarmingCityOk = { ok: true; city: string };

export type BodyInvalid = { ok: false; error: string };

export function validateSummaryBody(body: unknown): SummaryBodyOk | BodyInvalid {
  const city = readCity(body);
  if (!city) return { ok: false, error: "city required" };
  const weather = parseWeatherSnapshot(
    body && typeof body === "object"
      ? (body as { weather?: unknown }).weather
      : undefined,
  );
  if (!weather) return { ok: false, error: "weather required" };
  return { ok: true, city, weather };
}

/** City required; weather may be omitted/null, but if present it must be a valid snapshot. */
export function validateFarmingTipsBody(
  body: unknown,
): FarmingCityOk | BodyInvalid {
  const city = readCity(body);
  if (!city) return { ok: false, error: "city required" };
  if (!body || typeof body !== "object") {
    return { ok: false, error: "city required" };
  }
  const weather = (body as { weather?: unknown }).weather;
  if (weather != null) {
    if (!parseWeatherSnapshot(weather)) {
      return { ok: false, error: "weather required" };
    }
  }
  return { ok: true, city };
}
