# CLAUDE.md

## Overview
**weather-farming** — Next.js weather + farming dashboard (OpenWeather, Unsplash, AI summary/tips, optional TTS/Sentry).

**Status:** C1 P0+P1 done (REQ-0016–0027, 0029). Skip REQ-0028 unless asked. HA-0001 done (human). HA-0003 ignored. Resume: `C1-HG1-20260820-WF` · Gate 1 Conditional.

---

## Stack
Next 16.3 App Router · React 19.2 · TS 5.9 strict · Tailwind 3.4 · Framer 12 · Node 24.x · Vercel  
No DB / auth / Redis / Zod / Vite / Python. Persistence: cookies + localStorage.

**Validate:** `npm run lint` · `typecheck` · `test` · `build`

---

## Architecture (preserve)
- `src/app` pages + Route Handlers; `Components/{pages,shared,ui}`
- `WeatherContext` + `useWeather`; `lib/*` server helpers; `types/*`; `data/constants.ts`
- Browser weather/geocode → `/api/weather` · `/api/geocode` only. Never import `openweather.ts` in client.
- OpenWeather: `next.revalidate` 300s. AI: `ai-providers` → Gemini→Groq→OpenRouter→HF; `ai-validate` + `ai-rate-limit` (10/IP/60s). Wind: `msToKmh`.
- Layout SSR Unsplash via `getInitialBackgroundUrl` if no BG cookie.
- Sentry: `instrumentation*` + tunnel `/api/monitoring`. Keep layout Server Component.

**SSR prefer.** Client only for interactivity islands.

---

## Rules
Implement only approved scope. No duplicate fetch/state/schemas. Update affected `.agile-v/*` only. Never claim success without lint/typecheck/test/build. Comments in code files. Resume from `.agile-v/STATE.md`.

Portable docs in `docs/` (Redis/Sentry guide, guardrails, LLM selection) = reference until a REQ adopts them.
