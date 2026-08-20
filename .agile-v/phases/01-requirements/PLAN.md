# C1 Phase 01 — Requirements plan

**Gate:** GATE-0001 PENDING · **Token:** `C1-HG1-20260820-WF`

## Verified architecture (facts)

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3.4, Framer Motion 12.
- Server: `app/page.tsx`, `app/layout.tsx`, `app/gallery/page.tsx` + Route Handlers under `app/api/`.
- Client islands: `HomePage` (1286 lines), `GalleryPage`, `Navbar`, `WeatherBackground`, `WeatherProvider`.
- Data: OpenWeather (current, forecast, AQI, geo), Unsplash proxy, Gemini/Groq/OpenRouter, ElevenLabs + Edge TTS.
- Persistence: cookies + localStorage. No DB, no auth.
- Tests: none. Scripts: `dev`, `build`, `start`, `lint`.
- Deploy: Vercel (`vercel.json` framework only). Demo URL in README.

## Docs vs code (do not treat docs as unimplemented features)

| Claim | Code |
|---|---|
| `getInitialBackgroundUrl` on first load | Helper exists; layout does not call it |
| Agro API | Env only |
| Redis/Sentry/PostHog | Not in dependencies |
| SECURITY.md | Missing |
| Prefer server OpenWeather key | Client still imports `openweather.ts` |

## Prioritized implementation (after approval)

### Wave 1 — P0

1. **TASK-0001** server weather proxy, use `coord`, kill duplicate `?city=` client fetch (REQ-0016–0018)
2. **TASK-0002** valid AI model IDs, stream/JSON aligned (REQ-0019) — **done** 2026-08-20
3. **TASK-0003** SECURITY.md, headers, robots (REQ-0023)

### Wave 2 — P1

4. AI body validation + visible errors (REQ-0020–0021)
5. AI rate limit + OpenWeather cache (REQ-0024–0025) — numbers pending Human
6. SSR background truth + wind units (REQ-0022, REQ-0027)

### Wave 3 — P1 validation

7. typecheck script + tests + record VALIDATION_SUMMARY (REQ-0026)
8. Baseline regression REQ-0001–0015

### Wave 4 — P2

9. Split HomePage (REQ-0028)

## Rendering / mutation rules for later synthesis

- Keep layouts and pages server-first; extract interactive panels only.
- No React Query unless Human asks; current pattern is fetch + context.
- After city change: persist cookie, invalidate in-memory forecast/AQI/AI text (already partly done).

## Stop

Wait for Gate 1. Do not edit `src/` until APPROVALS.md matches the resume token.
