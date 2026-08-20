# CLAUDE.md

## Overview
**weather-farming** — Next.js weather + farming dashboard (OpenWeather, Unsplash, AI summary/tips, TTS/Sentry).

**Status:** C1 P0+P1 done (REQ-0016–0027, 0029). Skip REQ-0028 unless asked. HA-0001 done. HA-0003 ignored. Resume: `C1-HG1-20260820-WF` · Gate 1 Conditional.

**Recent:** glass toasts · AI tokens 1024/4096 · vercel no `framework` · saved cities on SSR `/?city=` (canonical name, case-insensitive).

---

## Stack
Next 16.3 · React 19.2 · TS 5.9 · Tailwind 3.4 · Framer 12 · Lucide 0.577 · Node 24.x · Vercel  
No DB / auth / Redis / Zod / Vite / Python / densify / React Query. Persistence: cookies + localStorage.
Stay on current majors (no TW4 / ESLint10 / TS7 / FM13 / Lucide1).

**Validate:** `npm run lint` · `typecheck` · `test` · `build` · audit 0

---

## Architecture (preserve)
- `src/app` pages + Route Handlers; `Components/{pages,shared,ui}`
- `WeatherContext` + `useWeather`; `ToastContext` + `toaster` via `AppProvider`
- `lib/*` server helpers; `types/*`; `data/constants.ts`
- Browser weather/geocode → `/api/weather` · `/api/geocode` only. Never import `openweather.ts` in client.
- OpenWeather: `next.revalidate` 300s. AI: Gemini→Groq→OpenRouter→HF; `ai-validate` + rate limit 10/IP/60s. Wind: `msToKmh`.
- Layout SSR Unsplash if no BG cookie. Sentry tunnel `/api/monitoring`. Keep layout Server Component.

**SSR prefer.** Client only for interactivity islands.

---

## Rules
Implement only approved scope. No duplicate fetch/state/schemas. Update affected `.agile-v/*` only. Never claim success without lint/typecheck/test/build. Resume from `.agile-v/STATE.md`.

Portable docs in `docs/` = reference until a REQ adopts them.
