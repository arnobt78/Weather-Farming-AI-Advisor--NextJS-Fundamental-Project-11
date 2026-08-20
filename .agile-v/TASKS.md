# Tasks — C1

Wave rule: no-deps first; prefer vertical slices.

| ID | REQ | Priority | Wave | Task | Status | Affected files (expected) | Depends |
|---|---|---|---|---|---|---|---|
| TASK-0001 | REQ-0016, REQ-0017, REQ-0018 | P0 | 1 | Add server current-weather (and optional geocode) Route Handlers. Point `useWeather` at `/api/weather`. Use `coord` from weather payload. Remove client imports of `lib/openweather`. Deduplicate `?city=` refetch when SSR data already matches. | **done** 2026-08-20 | `src/app/api/weather/route.ts`, `src/app/api/geocode/route.ts`, `src/hooks/useWeather.ts`, `src/Components/pages/home-page.tsx`, `.env.example`, `README.md` | — |
| TASK-0002 | REQ-0019 | P0 | 1 | Align Gemini/Groq/OpenRouter/HF model IDs for stream + JSON paths; log DEC. Shared registry in `ai-providers.ts`. | **done** 2026-08-20 | `src/lib/ai-providers.ts`, `src/lib/ai.ts`, `src/lib/ai-stream.ts`, `.env.example`, `README.md`, `.agile-v/DECISION_LOG.md` | — |
| TASK-0003 | REQ-0023 | P0 | 1 | Add `SECURITY.md`, security headers, `app/robots.ts` (disallow `/api/`). Node 24 engines + dep audit included in same approved slice. `.cursorignore` deferred. | **done** 2026-08-20 | `SECURITY.md`, `next.config.ts`, `vercel.json`, `src/app/robots.ts`, `.nvmrc`, `package.json` | — |
| TASK-0004 | REQ-0020, REQ-0021 | P1 | 2 | Validate AI bodies; surface panel errors for weather/forecast/AQI/AI/TTS. | **done** 2026-08-20 | `src/app/api/ai/*/route.ts`, `src/lib/ai-validate.ts`, `src/Components/pages/home-page.tsx`, `src/hooks/useWeather.ts` | TASK-0001 |
| TASK-0005 | REQ-0024, REQ-0025 | P1 | 2 | AI coarse rate limit; OpenWeather fetch cache ~300s. | **done** 2026-08-20 | `src/lib/ai-rate-limit.ts`, `src/lib/openweather.ts`, AI routes | TASK-0002 |
| TASK-0006 | REQ-0022, REQ-0027 | P1 | 2 | Reconcile SSR background helper vs README; fix wind unit labeling in UI and prompts. | **done** 2026-08-20 | `src/app/layout.tsx`, `src/lib/units.ts`, `README.md`, AI routes, HomePage | — |
| TASK-0007 | REQ-0026 | P1 | 3 | Add `typecheck` script, tests for openweather null-on-missing-key and AI 400s, record validation. | **done** 2026-08-20 | `package.json`, `src/lib/*.test.ts` | TASK-0001, TASK-0004 |
| TASK-0008 | REQ-0028 | P2 | 4 | Split HomePage into section components after P0/P1 behavior is stable. | planned | `src/Components/pages/home-page.tsx` | TASK-0001, TASK-0004 |
| TASK-0009 | REQ-0001–0015 | — | 3 | Regression pass of baseline features after P0/P1. | planned | (manual + tests) | TASK-0001–0007 |
| TASK-0010 | docs | — | 1 | Keep `.agile-v/` + `CLAUDE.md` in sync as work proceeds. | ongoing | `.agile-v/*`, `CLAUDE.md` | — |
| TASK-0011 | REQ-0029 | P1 | 1 | Lean `@sentry/nextjs` with `/api/monitoring` tunnel, noise filters, quiet CI. | **done** 2026-08-20 | `src/lib/sentry-*.ts`, `src/instrumentation*.ts`, `src/sentry.*.config.ts`, `next.config.ts`, `src/app/global-error.tsx` | — |


## Not scheduled

- Agro API
- Redis / PostHog install
- Auth / DB
- Full rewrite of `docs/LLM_MODEL_SELECTION.md` to remove other-product names (optional cleanup; not blocking)
