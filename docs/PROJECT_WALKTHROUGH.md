# Project Walkthrough — weather-farming

Educational Next.js 16 App Router dashboard: live weather, forecast, AQI, Unsplash backgrounds, AI summary/farming tips, optional TTS & Sentry.

**Demo:** https://weather-farming.vercel.app/ · **Repo:** https://github.com/arnobt78/weather-app

---

## Stack
Next 16.3 · React 19.2 · TS 5.9 · Tailwind 3.4 · Framer Motion 12 · Lucide · Node 24 · Vercel  
No DB, auth, Redis, React Query, Zod, Vite, Python.

---

## Run
```bash
cp .env.example .env.local   # set OPENWEATHER_API_KEY at minimum
npm install && npm run dev   # http://localhost:3000
```
Scripts: `lint` · `typecheck` · `test` · `build` · `start`

---

## Routes
| Path | Role |
| --- | --- |
| `/` | SSR weather → client HomePage |
| `/gallery` | Unsplash grid |
| `GET /api/weather\|geocode\|forecast\|air-quality\|unsplash` | Proxies |
| `POST /api/ai/summary\|farming-tips\|tts` | AI (+ rate limit + body guards) |

---

## Data flow
1. Layout cookies → optional SSR BG (`getInitialBackgroundUrl`).
2. `page.tsx` city: `?city=` → cookie → Frankfurt → `fetchWeatherByCity` (300s cache).
3. Client: context + `useWeather`; forecast/AQI by lat/lon; panel errors on fail.
4. Glass toasts (`ToastContext` in `AppProvider`): city search + AI summary/tips/TTS (panel errors kept).
5. Saved cities: successful `/?city=` (SSR or client) → `addSavedCity(canonical name)` → cookie + localStorage → Navbar chips (case-insensitive; glow bleed via `.saved-chips-scroll`).
6. AI POST → IP limit → validate → Gemini→Groq→OpenRouter→HF (stream or JSON). Tokens: summary 1024 / farming 4096.
7. Wind UI/AI: `msToKmh` (OpenWeather m/s → km/h).

---

## Key folders
`src/app` · `Components/{pages,shared,ui}` · `context` (Weather + Toast) · `hooks` · `lib` · `types` · `data/constants.ts`

---

## Env (see `.env.example`)
**Required for weather:** `OPENWEATHER_API_KEY` (server-only).  
Optional: Unsplash, Gemini/Groq/OpenRouter/HF, ElevenLabs, Sentry, Agro (reserved).

---

## Security
Secrets server-only · [SECURITY.md](../SECURITY.md) · robots disallow `/api/` · AI 10/IP/min · OW cache 300s · Sentry tunnel `/api/monitoring` · `vercel.json` security headers (no `framework` override)

Full teaching README: [../README.md](../README.md) · Agent memory: [../CLAUDE.md](../CLAUDE.md) · Agile V: [../.agile-v/STATE.md](../.agile-v/STATE.md)
