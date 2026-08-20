# Requirements (Blueprint)

<!-- project: weather-farming | version: 1.0.0 | Revision: C1 | Date: 2026-08-20 | Human Gate 1: PENDING -->

Status tags: `new [C1]` pending Gate 1. Baseline REQs describe as-built behavior to preserve. Gap REQs are proposed C1 work. None are approved until GATE-0001.

---

## Baseline — preserve existing product

### REQ-0001
- **Requirement:** Visiting `/` must render a weather dashboard for a resolved city: URL `?city=` if present, else city cookie, else default city `Frankfurt`.
- **Constraint:** Home route remains a Server Component that fetches current weather on the server and passes `initialData` into a client island.
- **Verification Criteria:** Load `/`, `/?city=London`, and `/` after a city cookie exists; each shows the corresponding city or documented fallback.
- **Done Criteria:** [ ] SSR city resolution matches `app/page.tsx` contract [ ] Default city unchanged unless CR approved
- **Status:** new [C1] (as-built) · **Lineage:** OBS-0001

### REQ-0002
- **Requirement:** When current weather is available, the dashboard must show temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset, country, and coordinates for that city.
- **Constraint:** Use existing OpenWeather current-weather payload types in `src/types/weather.ts`. Metric units.
- **Verification Criteria:** Ready state UI contains each field when the API payload includes it; missing optional fields do not crash.
- **Done Criteria:** [ ] Fields present in HomePage ready state [ ] Type-safe against `WeatherApiSuccess`
- **Status:** new [C1] (as-built)

### REQ-0003
- **Requirement:** After coordinates are known, the dashboard must load a 5-day forecast via `GET /api/forecast?lat=&lon=`.
- **Constraint:** Route Handler remains the only browser-facing forecast entry; OpenWeather key stays server-side in this path.
- **Verification Criteria:** Valid lat/lon returns 200 JSON; missing/invalid params return 400; upstream failure returns 502.
- **Done Criteria:** [ ] Route contract unchanged or improved with tests [ ] UI shows aggregated daily forecast
- **Status:** new [C1] (as-built)

### REQ-0004
- **Requirement:** After coordinates are known, the dashboard must load air quality via `GET /api/air-quality?lat=&lon=` and display AQI plus pollutant values.
- **Constraint:** Same proxy pattern as forecast.
- **Verification Criteria:** Valid coords → 200; invalid → 400; upstream fail → 502.
- **Done Criteria:** [ ] AQI section renders from `AirPollutionResponse`
- **Status:** new [C1] (as-built)

### REQ-0005
- **Requirement:** User can request an AI weather summary via `POST /api/ai/summary` with city + weather snapshot. Response may be streamed `text/plain` or JSON `{ text }`.
- **Constraint:** LLM keys remain server-only. Fallback chain Gemini → Groq → OpenRouter → optional Hugging Face.
- **Verification Criteria:** Valid body with at least one working provider returns text; no providers configured returns 503; invalid JSON returns 400.
- **Done Criteria:** [ ] UI consumes stream or JSON [ ] No client LLM keys
- **Status:** new [C1] (as-built)

### REQ-0006
- **Requirement:** User can request AI farming tips via `POST /api/ai/farming-tips` using weather plus optional AQI, forecast slice, and geo.
- **Constraint:** Same secret and fallback rules as REQ-0005.
- **Verification Criteria:** Same status-code contract as summary; prompt includes available context sections.
- **Done Criteria:** [ ] Tips UI renders markdown-ish bold/bullets already supported
- **Status:** new [C1] (as-built)

### REQ-0007
- **Requirement:** When summary and/or tips text exists, user can play TTS via `POST /api/ai/tts`. Prefer ElevenLabs; fall back to Edge TTS.
- **Constraint:** ElevenLabs key server-only. Text length capped in `lib/tts.ts`.
- **Verification Criteria:** Non-empty text with a working TTS path returns audio; empty text 400; both providers fail 503.
- **Done Criteria:** [ ] Play/stop works in UI
- **Status:** new [C1] (as-built)

### REQ-0008
- **Requirement:** Dynamic Unsplash backgrounds must be fetched through `GET /api/unsplash` so `UNSPLASH_ACCESS_KEY` never ships to the client.
- **Constraint:** Missing key degrades to empty photos, not a thrown server crash.
- **Verification Criteria:** Client network tab shows only same-origin `/api/unsplash`, never Unsplash with a key.
- **Done Criteria:** [ ] `WeatherBackground` and gallery use the proxy
- **Status:** new [C1] (as-built)

### REQ-0009
- **Requirement:** `/gallery` shows a paginated Unsplash grid keyed off current weather description, with dialog and download.
- **Constraint:** Gallery remains a server route shell + client island. Layout shell (navbar, footer, background) stays in `layout.tsx`.
- **Verification Criteria:** Navigate Home → Gallery without losing layout; pagination fetches `/api/unsplash`.
- **Done Criteria:** [ ] Gallery route works without converting layout to client
- **Status:** new [C1] (as-built)

### REQ-0010
- **Requirement:** Remote images on home and gallery must use `SafeImage` so a `next/image` optimizer failure still shows a native `<img>`.
- **Constraint:** Do not replace `SafeImage` with raw `next/image` on Unsplash/OpenWeather URLs.
- **Verification Criteria:** Simulated optimizer error still renders the photo.
- **Done Criteria:** [ ] Home icons and gallery grid use `SafeImage`
- **Status:** new [C1] (as-built)

### REQ-0011
- **Requirement:** Last city, saved cities (max 10), and last background URL persist across refresh using cookies readable by the server layout. Coordinates may persist in localStorage.
- **Constraint:** No database. Cookie keys remain those in `src/data/constants.ts` unless a CR changes them.
- **Verification Criteria:** Refresh `/` restores last city; saved-city chips survive reload.
- **Done Criteria:** [ ] Cookie names documented [ ] Layout hydrates provider from cookies
- **Status:** new [C1] (as-built)

### REQ-0012
- **Requirement:** Root layout must publish SEO metadata (title, description, Open Graph, Twitter, canonical base from `NEXT_PUBLIC_SITE_URL`).
- **Constraint:** Keep layout a Server Component.
- **Verification Criteria:** View-source / metadata tags present; `metadataBase` uses configured site URL or documented default.
- **Done Criteria:** [ ] `layout.tsx` metadata remains server-exported
- **Status:** new [C1] (as-built)

### REQ-0013
- **Requirement:** Navbar city search navigates with `/?city=...` so the server page can refetch. Saved-city chips reuse that navigation.
- **Constraint:** Do not convert the home page into a fully client-routed SPA for search.
- **Verification Criteria:** Submit search updates URL and dashboard city.
- **Done Criteria:** [ ] Navbar uses `router.push` with query param
- **Status:** new [C1] (as-built)

### REQ-0014
- **Requirement:** UI must continue to follow `docs/UI_STYLING_GUIDE.md` (glass cards, existing tokens, Framer Motion usage already in shared/ui components).
- **Constraint:** No parallel design system. New UI reuses `Components/ui/*` and `cn()`.
- **Verification Criteria:** Visual review against the styling guide; no new CSS framework.
- **Done Criteria:** [ ] No new styling library [ ] Primitives reused
- **Status:** new [C1] (as-built)

### REQ-0015
- **Requirement:** AI, Unsplash, ElevenLabs, and Agro keys listed in `.env.example` must not be committed. Agents must not read `.env.local`.
- **Constraint:** `.gitignore` already ignores `.env*.local`. Prefer adding `.cursorignore` for env files.
- **Verification Criteria:** `git ls-files` has no `.env.local`; `.env.example` has placeholders only.
- **Done Criteria:** [ ] Example env stays placeholder-only [ ] Cursor ignore recommended/applied if approved
- **Status:** new [C1] (as-built)

---

## Gap — proposed C1 work

### REQ-0016
- **Requirement:** All OpenWeather current-weather and geocoding calls from the browser must go through same-origin Route Handlers. `NEXT_PUBLIC_OPENWEATHER_API_KEY` must not be required for search or geocode.
- **Constraint:** Reuse `lib/openweather.ts` from Route Handlers only. Client modules must not import that file.
- **Verification Criteria:** Client bundle / network: no `api.openweathermap.org` from the browser; search works with only `OPENWEATHER_API_KEY`.
- **Done Criteria:** [ ] `/api/weather` (or equivalent) exists [ ] `useWeather` and HomePage do not import `openweather.ts` [ ] `.env.example` documents server key as sufficient
- **Status:** implemented [C1] (code + lint/build). Residual: delete `NEXT_PUBLIC_OPENWEATHER_API_KEY` on Vercel after deploy. · **Priority:** P0 · **Lineage:** INS-0001, HYP-0001

### REQ-0017
- **Requirement:** A city search that already triggered SSR weather fetch must not immediately refetch the same city from the client.
- **Constraint:** Client `searchWeather` remains available for cases without SSR data (error retry), but `?city=` matching `initialData.name` must not duplicate the request.
- **Verification Criteria:** Searching a city produces one OpenWeather current-weather call per navigation, plus forecast/AQI as needed.
- **Done Criteria:** [ ] Duplicate `useEffect` search removed or gated [ ] Forecast/AQI still load
- **Status:** implemented [C1] · **Priority:** P0 · **Lineage:** OBS-0005

### REQ-0018
- **Requirement:** When `WeatherApiSuccess.coord` is present, the app must use those coordinates for forecast and AQI instead of a extra geocode request.
- **Constraint:** Geocode remains available only as server-side fallback when coord is missing.
- **Verification Criteria:** Ready weather with coord set does not call geocoding; forecast still loads.
- **Done Criteria:** [ ] HomePage uses `data.coord` [ ] No client `geocodeCity`
- **Status:** implemented [C1] · **Priority:** P0 · **Lineage:** OBS-0006

### REQ-0019
- **Requirement:** Configured AI providers must use currently valid model IDs. Streaming and non-streaming paths for the same provider must use the same generation of model unless a decision log records a reason.
- **Constraint:** Prefer the fallback architecture in `docs/LLM_MODEL_SELECTION.md` (registry + generic client) without copying CodeBook file paths. Replace deprecated Groq `llama-3.1-8b-instant`. Replace likely-invalid OpenRouter `openrouter/free`. Align Gemini 1.5 vs 2.0 vs 2.5 after a live/docs check.
- **Verification Criteria:** With each single provider key, summary returns text or a classified error (billing/rate-limit/upstream), not a silent empty body caused by a dead model id.
- **Done Criteria:** [x] Model IDs verified against provider docs [x] Stream and JSON paths aligned [x] DEC logged
- **Status:** implemented [C1] · **Priority:** P0 · **Lineage:** OBS-0009, HYP-0002

### REQ-0020
- **Requirement:** AI POST bodies must be validated (required fields and numeric ranges). Invalid bodies return 400 with a stable JSON error shape.
- **Constraint:** No new validation library required; TypeScript guards or a small existing pattern are enough.
- **Verification Criteria:** Missing `city` or `weather` → 400; valid body unchanged.
- **Done Criteria:** [x] summary + farming-tips validate [x] tests or documented manual cases
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** OBS-0013

### REQ-0021
- **Requirement:** Dashboard fetch failures (weather, forecast, AQI, AI, TTS) must show a user-visible error in the relevant panel. Do not fail silently after a loading spinner.
- **Constraint:** Keep layout stable; error replaces or appears in the panel, not a full-page crash.
- **Verification Criteria:** Forced 502/503 still shows a message; success path unchanged.
- **Done Criteria:** [x] Each panel has an error state [x] TTS failure is visible
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** OBS-0013

### REQ-0022
- **Requirement:** Either call `getInitialBackgroundUrl` during SSR so first paint can include a weather-matched Unsplash URL, or stop README from claiming that behavior. Cookie preload remains valid.
- **Constraint:** Do not add a blocking Unsplash failure path that blanks the page.
- **Verification Criteria:** Docs match code. If wired: first HTML or cookie after first paint has a background URL for a known weather `main`.
- **Done Criteria:** [x] Code/docs reconciled [ ] DEC if left unwired
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** OBS-0007

### REQ-0023
- **Requirement:** Add a real `SECURITY.md` (vulnerability reporting) because README already links it. Add Next.js `headers()` (and/or `vercel.json` headers) for nosniff, frame deny, referrer policy, permissions policy. Add `app/robots.ts` that does not invite unbounded AI-crawler indexing of API routes.
- **Constraint:** Dashboard itself stays publicly readable. Do not add auth. Dashboard bot Challenge remains a Vercel dashboard Human-Action (not code-only).
- **Verification Criteria:** `SECURITY.md` exists; response headers present on `/`; robots disallows `/api/`.
- **Done Criteria:** [ ] SECURITY.md [ ] headers [ ] robots.ts [ ] README link works
- **Status:** implemented [C1] (code + lint/build). Residual: HA-0001 Vercel Firewall dashboard. · **Priority:** P0 · **Lineage:** OBS-0011, OBS-0014

### REQ-0024
- **Requirement:** AI routes must have a coarse abuse limit: reject excess `POST`s from the same IP within a one-minute window with 429. Document the numeric limit in the decision log (proposed default: 10 POSTs/IP/minute across `/api/ai/*`).
- **Constraint:** Prefer in-memory/Fluid instance limiting if Redis is not approved. Must fail open or closed — decide at implementation and log it. Do not add Upstash solely for this unless Gate 1 includes Redis.
- **Verification Criteria:** Burst > limit returns 429; normal UI usage of two AI buttons succeeds.
- **Done Criteria:** [x] Limit implemented [x] DEC records fail-open vs fail-closed
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** INS-0003

### REQ-0025
- **Requirement:** Current weather and forecast/AQI OpenWeather fetches must use a short server cache (proposed 300s, same as Unsplash background helper) instead of unconditional `cache: "no-store"`, unless a CR keeps live-only weather.
- **Constraint:** Cache key must include city or lat/lon. Do not cache error responses as success.
- **Verification Criteria:** Two SSR loads of the same city within TTL do not produce two upstream OpenWeather current-weather calls (or Next fetch cache hit is evidenced in logs).
- **Done Criteria:** [x] Cache TTL in code [x] DEC records TTL
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** INS-0003

### REQ-0026
- **Requirement:** The repo must have an executable validation path: `lint`, TypeScript check, unit tests for `lib/openweather` + AI route validation, and `next build`. Record results in `VALIDATION_SUMMARY.md`.
- **Constraint:** Use existing toolchain. A `typecheck` script (`tsc --noEmit`) is enough; pick one test runner (Node built-in or vitest) at implementation and log it.
- **Verification Criteria:** Commands in VALIDATION_SUMMARY were actually run. At least one failing-input test and one success-shape test exist for weather key-missing → null.
- **Done Criteria:** [x] scripts in package.json [x] tests exist [x] results recorded
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** OBS-0003

### REQ-0027
- **Requirement:** Wind speed shown or sent to AI must use a labeled unit that matches OpenWeather metric (`m/s`), or be converted to km/h consistently. Prompts must not say km/h if the number is m/s.
- **Constraint:** Single conversion helper if conversion is chosen.
- **Verification Criteria:** Prompt text and UI label agree with the numeric unit.
- **Done Criteria:** [x] UI label [x] summary + farming prompts
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** code review of `farming-tips/route.ts` and summary prompt

### REQ-0028
- **Requirement:** Split `home-page.tsx` into reusable presentational sections (current weather, forecast, AQI, AI panels) without changing behavior. Keep the page route a Server Component.
- **Constraint:** No new state libraries. Extract only after P0 secret/fetch work so behavior is stable.
- **Verification Criteria:** Home visual/behavior regression checklist passes; file sizes of extracted modules are each smaller than the current 1286-line file.
- **Done Criteria:** [ ] HomePage orchestrates extracted sections [ ] no duplicate fetch logic introduced
- **Status:** new [C1] · **Priority:** P2 · **Lineage:** OBS-0012

### REQ-0029
- **Requirement:** When a Sentry DSN is configured, client and server errors must be reported to Sentry. Browser events must POST to same-origin `/api/monitoring` (not `*.ingest.sentry.io`) so ad blockers do not drop them. Empty DSN disables the SDK.
- **Constraint:** Use `@sentry/nextjs` + `withSentryConfig({ tunnelRoute: "/api/monitoring" })`. Do not add a hand-rolled Route Handler for the tunnel. Do not add Session Replay, Redis, or PostHog. Filter extension/benign noise. Vercel builds stay silent (`silent: true`, `telemetry: false`); source maps upload only when `SENTRY_AUTH_TOKEN` is set and must not fail the deploy.
- **Verification Criteria:** Build rewrite includes `/api/monitoring`. Lint/tsc/build pass. No `sentry.client.config.ts`. Root layout remains a Server Component.
- **Done Criteria:** [x] Shared env/filters [x] instrumentation + client tunnel [x] global-error [x] quiet withSentryConfig
- **Status:** implemented [C1] · **Priority:** P1 · **Lineage:** Human request 2026-08-20

---

## Explicitly out of scope unless Gate 1 expands them

| Item | Reason |
|---|---|
| Agro API integration | Env key reserved; zero code (OBS-0008) |
| Redis / PostHog | Portable docs from other products; not in `package.json` |
| User authentication | Product has none |
| Database | Cookie/localStorage by design |
| Copying CodeBook `backend/src/lib/ai/` paths | Those files do not exist here |

---

## Logic Gatekeeper notes (pre-Gate 1)

Validated as testable: REQ-0001–0028 except REQ-0014 (visual; verified against existing guide, not a metric).

Flags (not halt):
- REQ-0024 / REQ-0025 numbers confirmed in DEC-0009 (10 POSTs/IP/60s; OpenWeather 300s; fail-closed over limit, fail-open if limiter throws).
- REQ-0019 live model IDs checked 2026-08-20 (Gemini 2.5, Groq gpt-oss/qwen, OpenRouter `:free`, HF router).
- REQ-0016 vs current README (`NEXT_PUBLIC_OPENWEATHER_API_KEY`) is an intentional tightening, not a conflict.

No REQ vs REQ halt.
