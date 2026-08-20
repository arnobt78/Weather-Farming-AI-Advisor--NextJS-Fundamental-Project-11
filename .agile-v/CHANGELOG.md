# Changelog (project memory)

## 2026-08-20 — C1 bootstrap

- Created `.agile-v/` (did not exist).
- Filled operational `CLAUDE.md` from the actual stack.
- Pointed `AGENTS.md` at `docs/AGILE_V_PROTOCOL.md`.
- No implementation code changed.

## 2026-08-20 — Guardrails + Node 24 + zero-audit slice

- REQ-0023: security headers, robots.ts, SECURITY.md, scroll hint.
- Node `engines` 24.x + `.nvmrc`.
- Next 16.3.1 and compatible minors; `npm audit` = 0.
- Lint / tsc / build PASS on Node 24.19.0.
- Firewall Bot Protection remains Human-Action (HA-0001).

## 2026-08-20 — OpenWeather server proxy

- `GET /api/weather` + `GET /api/geocode`.
- Client no longer imports `lib/openweather`.
- `OPENWEATHER_API_KEY` only. Human must delete `NEXT_PUBLIC_OPENWEATHER_API_KEY` on Vercel and rotate the key.

## 2026-08-20 — Free-tier AI model IDs (REQ-0019)

- Shared registry `src/lib/ai-providers.ts`.
- Gemini 2.5 Flash / Flash-Lite; Groq gpt-oss-20b / qwen3.6-27b; OpenRouter `:free`; optional HF router.
- Stream and JSON paths use the same chain. 429 skips remaining models on that provider.

## 2026-08-20 — Sentry same-origin tunnel (REQ-0029)

- `@sentry/nextjs` client+server; tunnel rewrite `/api/monitoring`.
- Quiet CI (`silent`, no plugin telemetry). Sourcemaps only with auth token.
- Extension/benign noise filtered. No Replay/Redis/PostHog.

## 2026-08-20 — C1 P1 remaining REQs (0020–0022, 0024–0027)

- Panel errors + default-city “Weather unavailable.” (REQ-0021).
- TypeScript AI body guards, 400 `{ error }` (REQ-0020).
- Wind m/s → km/h via `msToKmh` (REQ-0027).
- In-memory AI 10/IP/60s → 429 (REQ-0024, DEC-0009).
- OpenWeather `next.revalidate` 300 (REQ-0025).
- Layout SSR Unsplash when no BG cookie; README matches (REQ-0022).
- `typecheck` + node:test via `tsx` (REQ-0026).
- REQ-0028 HomePage split still deferred.

## 2026-08-20 — Docs + memory + release prep

- Educational README rewrite (title + screenshots kept).
- `docs/PROJECT_WALKTHROUGH.md`; compact `CLAUDE.md`.
- HA-0001 marked done; HA-0003 ignored; INT-0001 closed for P1.

## 2026-08-20 — Safe within-major dep refresh

- `npm update` + `lucide-react` ^0.577.0 (not Lucide 1).
- Skipped: Tailwind 4, ESLint 10, TS 7, Framer 13, `@types/node` 26.
- Lint fixes for eslint-plugin-react-hooks v7 (gallery/home fetch + clock purity).
- lint · typecheck · test · build · audit 0 PASS.

## 2026-08-20 — AI Insights stream / truncation fix

- Earlier: summary 512 / farming 2048 + stream UX (Loader2, live panels).
- Follow-up: summary **1024** / farming **4096** / fallback 2048; prompts ban fluff / “As an AI”.
- `vercel.json`: removed `framework` (headers kept) — clears dashboard Overridden after deploy.

## 2026-08-20 — Glass toast notifications

- `ToastContext` + glass `toaster.tsx` in `AppProvider` (no sonner).
- Navbar empty search; HomePage city + Summary/Tips/TTS success/error (panel errors kept).
- `useWeather` `onError` for client search failures.

## 2026-08-20 — Saved cities SSR fix

- SSR `/?city=` match calls `addSavedCity(initialData.name)` (was skipped).
- Client `onSuccess` saves canonical `data.name`.
- Case-insensitive dedupe in `WeatherContext.addSavedCity`.



