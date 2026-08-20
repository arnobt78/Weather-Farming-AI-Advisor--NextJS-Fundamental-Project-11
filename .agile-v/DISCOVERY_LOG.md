# Discovery Log — C1 bootstrap

**Source:** repository inspection on 2026-08-20. No user interviews. Code is source of truth.

Status legend: confirmed = observed in source; assumed = inferred; unverified = docs or comments only.

---

## OBS-0001: Working Next.js App Router dashboard

**Source:** `src/app/`, `package.json`, README.md
**Raw Data:** Next.js `^16.2.0`, React `^19.2.0`, TypeScript `^5.9.2`, Tailwind `^3.4.17`, Framer Motion `^12.23.24`. Routes: `/`, `/gallery`, six API handlers.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0002: No Agile V workspace existed

**Source:** glob of `.agile-v/`
**Raw Data:** zero files before this session. `CLAUDE.md` was an empty template.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0003: No automated tests

**Source:** glob for `*.test.*` / `*.spec.*`; `package.json` scripts
**Raw Data:** no test files; scripts are `dev`, `build`, `start`, `lint` only. No `typecheck` script.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0004: Client components call OpenWeather helpers directly

**Source:** `src/hooks/useWeather.ts`, `src/Components/pages/home-page.tsx`
**Raw Data:** `useWeather` imports `fetchWeatherByCity`; HomePage imports `geocodeCity`. Both live in `src/lib/openweather.ts` and read `OPENWEATHER_API_KEY` or `NEXT_PUBLIC_OPENWEATHER_API_KEY`.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0005: Duplicate city fetch on search

**Source:** `Navbar.tsx` + `app/page.tsx` + `home-page.tsx`
**Raw Data:** Navbar `router.push("/?city=...")` triggers SSR `fetchWeatherByCity`. HomePage `useEffect` then calls `searchWeather(cityFromQuery)` again.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0006: Weather payload already includes coordinates

**Source:** `src/types/weather.ts`
**Raw Data:** `WeatherApiSuccess.coord?: { lon, lat }`. HomePage still calls `geocodeCity` after a successful weather fetch.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0007: `getInitialBackgroundUrl` is unused

**Source:** grep
**Raw Data:** defined in `src/lib/background.ts`; layout reads a background cookie only. README claims SSR may fetch initial background via `getInitialBackgroundUrl`.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0008: Agro API is documented but unused

**Source:** grep `AGRO_API`
**Raw Data:** `.env.example` and README mention `AGRO_API_KEY`. No TypeScript usage.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0009: AI model IDs disagree with project docs

**Source:** `src/lib/ai.ts`, `src/lib/ai-stream.ts`, `docs/LLM_MODEL_SELECTION.md`
**Raw Data:** Gemini 1.5-flash (JSON) vs 2.0-flash (stream). Groq `llama-3.1-8b-instant` listed as shut down 2026-08-16. OpenRouter model `openrouter/free`.
**Confidence:** medium · **Validation Status:** assumed (code confirmed; live provider status unverified this session)

## OBS-0010: Portable docs were copied from other products

**Source:** `docs/LLM_MODEL_SELECTION.md`, `docs/VERCEL_PRODUCTION_GUARDRAILS.md`, `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md`
**Raw Data:** references CodeBook, FreeScribe, multi-ai-chatbot, Vite paths, `backend/src/lib/ai/`, REQ-1613. None of those paths exist here. Redis/Sentry/PostHog packages are not in `package.json`.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0011: README links SECURITY.md which does not exist

**Source:** README.md vs glob
**Raw Data:** "Private reports → SECURITY.md". File missing.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0012: Home dashboard is one large client component

**Source:** `src/Components/pages/home-page.tsx`
**Raw Data:** 1286 lines; weather, forecast, AQI, AI stream, TTS, skeletons, formatting helpers.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0013: API error UI is often silent

**Source:** `home-page.tsx` fetch callbacks
**Raw Data:** `if (!res.ok) return;` for AI, forecast, AQI, TTS. User may see a spinner end with empty content.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0014: No production bot/cache/header guardrails in app config

**Source:** `next.config.ts`, `vercel.json`
**Raw Data:** `vercel.json` is `{ "framework": "nextjs" }` only. No security headers, `robots.ts`, `sitemap.ts`, or middleware. Metadata robots in `layout.tsx` currently `index: true, follow: true`.
**Confidence:** high · **Validation Status:** confirmed

## OBS-0015: Persistence is cookies + localStorage, no database

**Source:** `WeatherContext.tsx`, `layout.tsx`
**Raw Data:** city, saved cities, background URL. Cookies set from client without `Secure` / `HttpOnly`. No auth.
**Confidence:** high · **Validation Status:** confirmed

---

## INS-0001: Secrets boundary is incomplete for OpenWeather

**Derived From:** OBS-0004, OBS-0006
**Insight:** Forecast, AQI, Unsplash, and AI already proxy through Route Handlers. Current weather and geocoding do not. Client search therefore requires a public OpenWeather key or fails when only a server key is set.
**Evidence:** `useWeather.ts`, `openweather.ts`, README env table.

## INS-0002: C1 should harden the existing product, not add a new stack

**Derived From:** OBS-0003, OBS-0010, OBS-0014, OBS-0008
**Insight:** Redis/Sentry/PostHog/Agro are portable playbooks, not implemented features. Highest-leverage work is secret hygiene, model-ID correctness, validation, and production guardrails.
**Evidence:** `package.json` vs those docs.

## INS-0003: Cost and quota risk on Vercel + OpenWeather

**Derived From:** OBS-0005, OBS-0014, `openweather.ts` `cache: "no-store"`, `VERCEL_PRODUCTION_GUARDRAILS.md`
**Insight:** Every home request hits OpenWeather with no cache. City search hits it twice. Public indexing is allowed. Guardrails doc describes a sibling project exceeding Vercel free-tier limits.
**Evidence:** code + copied incident write-up (incident is not this repo's production evidence).

---

## HYP-0001: Client OpenWeather calls fail if only `OPENWEATHER_API_KEY` is set

**Statement:** If `.env.local` has server-only `OPENWEATHER_API_KEY` and no `NEXT_PUBLIC_OPENWEATHER_API_KEY`, SSR home works but client search and geocode return null.
**Derived From:** INS-0001 · **Validation:** EXP-0001 (manual or test after approval)
**Status:** pending

## HYP-0002: Groq fallback is already dead

**Statement:** If Groq is the only configured provider, AI summary/tips fail because `llama-3.1-8b-instant` was scheduled to shut down 2026-08-16.
**Derived From:** OBS-0009 · **Validation:** live Groq models list or a keyed request
**Status:** pending

---

## ASM-0001: Product intent remains an educational weather + farming dashboard

**Assumption:** C1 should preserve current UX and stack; no auth, no database, no Agro unless explicitly requested.
**Risk if Wrong:** Plan would under-scope a product expansion.
**Validation Plan:** Human Gate 1 confirmation
**Status:** unvalidated

## ASM-0002: Live demo at weather-farming.vercel.app still represents this main branch

**Assumption:** README live demo matches current `main`.
**Risk if Wrong:** Production behavior may differ from analyzed source.
**Validation Plan:** optional production smoke after Gate 1
**Status:** unvalidated

---

## Candidate requirements (formalized in REQUIREMENTS.md)

| Candidate | Lineage | Intent |
|---|---|---|
| CANDIDATE-0001..0015 | OBS-0001, stakeholder-as-built | Baseline product behavior |
| CANDIDATE-0016 | INS-0001 | Server-only OpenWeather |
| CANDIDATE-0017 | OBS-0005 | No duplicate weather fetch |
| CANDIDATE-0018 | OBS-0009 | Current AI model IDs |
| CANDIDATE-0019 | OBS-0011, OBS-0014 | Security/docs/guardrails |
| CANDIDATE-0020 | OBS-0003 | Validation pipeline |
| CANDIDATE-0021 | OBS-0013 | User-visible API errors |
| CANDIDATE-0022 | OBS-0007 | SSR background truth |
| CANDIDATE-0023 | OBS-0012 | Split HomePage (P2) |
| CANDIDATE-0024 | OBS-0010 | Treat portable docs as reference, not backlog |
