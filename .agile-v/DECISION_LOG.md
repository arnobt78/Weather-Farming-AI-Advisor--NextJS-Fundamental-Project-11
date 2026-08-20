# Decision Log

Append-only. Cycle-tagged.

---

## [C1] 2026-08-20 | DEC-0001 | Bootstrap Agile V from repository, not from copied docs

- **AGENT:** Cursor Grok 4.6 (Requirement Architect + Discovery Analyst + Logic Gatekeeper pass)
- **DECISION:** Treat `src/` as source of truth. Bootstrap Cycle C1 because `.agile-v/` did not exist. Do not treat Redis/Sentry/PostHog/Agro/CodeBook AI registry paths as committed product scope.
- **RATIONALE:** Those docs name other products and files that are absent here. Implementing them would violate "preserve existing architecture unless approved."
- **LINKED_REQ:** REQ-0001–0015 (baseline), out-of-scope table
- **STATUS:** recorded; awaiting Human Gate 1

## [C1] 2026-08-20 | DEC-0002 | C1 primary slice is secret hygiene + model IDs + guardrails + validation

- **DECISION:** Prioritize REQ-0016–0019 and REQ-0023 over UI refactors and new integrations.
- **RATIONALE:** Critical security risk (public weather key / broken server-only key), likely-dead Groq model, missing SECURITY.md, no tests.
- **LINKED_REQ:** REQ-0016, REQ-0017, REQ-0018, REQ-0019, REQ-0023, REQ-0026
- **STATUS:** proposed

## [C1] 2026-08-20 | DEC-0003 | Rate-limit numbers and cache TTL are recommendations

- **DECISION:** Propose 10 AI POSTs/IP/minute and 300s OpenWeather cache. Human may change at Gate 1.
- **RATIONALE:** Logic Gatekeeper: do not silently pick production quotas.
- **LINKED_REQ:** REQ-0024, REQ-0025
- **STATUS:** accepted via DEC-0009

## [C1] 2026-08-20 | DEC-0004 | No implementation in this session

- **DECISION:** Analysis and planning documents only.
- **RATIONALE:** AGILE_V_PROTOCOL.md §4 and §15; Human Gate 1 not approved.
- **LINKED_REQ:** GATE-0001
- **STATUS:** superseded by DEC-0005

## [C1] 2026-08-20 | DEC-0005 | Implement narrowed guardrails + Node 24 + zero-audit slice

- **DECISION:** Ship REQ-0023 (headers, robots, SECURITY.md), pin Node `24.x`, upgrade Next to 16.3.1 and compatible minors only. Do not proxy OpenWeather, rewrite AI models, add Zod/rate-limit, ISR the home page, or jump Tailwind 4 / ESLint 10 / lucide 1 / Framer Motion 13.
- **RATIONALE:** Human approved the attached plan in Cursor. Firewall Bot Protection cannot be expressed in repo config (HA-0001).
- **LINKED_REQ:** REQ-0023
- **STATUS:** implemented; firewall still Human-Action

## [C1] 2026-08-20 | DEC-0006 | OpenWeather current-weather and geocode via Route Handlers only

- **DECISION:** Client uses `GET /api/weather` and optional `GET /api/geocode`. `getApiKey()` reads only `OPENWEATHER_API_KEY`. Skip duplicate `?city=` fetch when SSR name matches.
- **RATIONALE:** `NEXT_PUBLIC_OPENWEATHER_API_KEY` is public in the browser bundle. Human requested key off the client.
- **LINKED_REQ:** REQ-0016, REQ-0017, REQ-0018
- **STATUS:** implemented; Vercel must delete `NEXT_PUBLIC_OPENWEATHER_API_KEY` and rotate the leaked key

## [C1] 2026-08-20 | DEC-0007 | Shared free-tier model IDs for stream + JSON

- **DECISION:** Keep existing `/api/ai` signatures. Shared IDs in `src/lib/ai-providers.ts`. Chain: Gemini `gemini-2.5-flash` then `gemini-2.5-flash-lite` → Groq `openai/gpt-oss-20b` then `qwen/qwen3.6-27b` → OpenRouter `openai/gpt-oss-20b:free` then `deepseek/deepseek-chat-v3-0324:free` → optional Hugging Face `openai/gpt-oss-20b:fastest` via `https://router.huggingface.co/v1`. HTTP 429 skips remaining models on that provider. Do not copy CodeBook `backend/src/lib/ai/`. Do not rewrite `docs/LLM_MODEL_SELECTION.md`.
- **RATIONALE:** JSON used `gemini-1.5-flash`; stream used `gemini-2.0-flash`. Groq `llama-3.1-8b-instant` shut down 2026-08-16. OpenRouter `openrouter/free` is not a real model. Human approved the attached plan.
- **LINKED_REQ:** REQ-0019, REQ-0005, REQ-0006
- **STATUS:** implemented

## [C1] 2026-08-20 | DEC-0008 | Sentry via same-origin tunnel, not Vite/Redis/PostHog

- **DECISION:** Adopt `@sentry/nextjs` §2A only. Tunnel rewrite `/api/monitoring`. `silent: true` (not `!CI`). Traces 0 in development, 0.1 in production. No Session Replay. No hand-rolled monitoring Route Handler. Source maps skipped without `SENTRY_AUTH_TOKEN`; upload errors must not fail the build. Human confirms `SENTRY_PROJECT` is the project slug (not org name).
- **RATIONALE:** Human already set Sentry env on Vercel and asked for ad-blocker-safe client ingest plus quiet deploys.
- **LINKED_REQ:** REQ-0029
- **STATUS:** implemented

## [C1] 2026-08-20 | DEC-0009 | AI rate limit, OpenWeather cache, wind km/h, Node tests

- **DECISION:** 10 POSTs / IP / 60s on `/api/ai/*` (in-memory Map, first `x-forwarded-for` hop). Over limit is fail-closed (429 `{ error: "Too many requests" }`). If the limiter throws, fail-open. OpenWeather current/geocode/forecast/AQI use `next.revalidate` 300s (URL includes city or lat/lon; `null` failures are not stored as success). Convert OpenWeather metric wind m/s → km/h via `msToKmh` for UI and AI payloads; prompts keep saying km/h. Tests use Node built-in runner + `tsx`, not Vitest. No Redis, Zod, or HomePage split (REQ-0028 deferred).
- **RATIONALE:** Human approved the C1 P1 remaining REQs plan. DEC-0003 numbers were pending; this records them. Fluid instances do not share the Map, so the limit is coarse.
- **LINKED_REQ:** REQ-0020, REQ-0021, REQ-0022, REQ-0024, REQ-0025, REQ-0026, REQ-0027
- **STATUS:** implemented
