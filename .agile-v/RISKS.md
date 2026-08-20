# Risks — C1

Append-only. Severity: Critical / High / Medium / Low.

| ID | Cycle | Category | Description | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0001 | C1 | Security | Client imports of `lib/openweather` force `NEXT_PUBLIC_OPENWEATHER_API_KEY` or break search. Public weather keys can be scraped and quota-abused. | High | High | Critical | Code: `/api/weather` + `/api/geocode`; server key only. Residual: delete `NEXT_PUBLIC_OPENWEATHER_API_KEY` on Vercel and rotate the key. | Human | **partial** |
| RISK-0002 | C1 | Technical | Groq model `llama-3.1-8b-instant` documented as shut down 2026-08-16. Gemini 1.5 vs 2.0 mismatch. OpenRouter `openrouter/free` likely invalid. AI feature may fail depending on which keys are set. | High | Medium | High | REQ-0019: shared IDs in `ai-providers.ts` (Gemini 2.5, Groq gpt-oss/qwen, OpenRouter `:free`, optional HF). | Build | **closed** |
| RISK-0003 | C1 | Technical | Unbounded `cache: "no-store"` OpenWeather + public `index/follow` + no bot headers. Copied FreeScribe incident is **not** this project's production evidence, but the same pattern exists. | Medium | High | High | Code: headers + robots + Next 16.3.1 image DoS fixes + OpenWeather `revalidate` 300s (REQ-0025). Residual: enable Vercel Bot Protection Challenge (HA-0001). | Human + Build | **partial** |
| RISK-0004 | C1 | Security | Unauthenticated AI/TTS routes can be invoked by anyone who can hit the deployment. | High | Medium | High | robots disallow `/api/`; in-memory 10/IP/min (REQ-0024). Residual: firewall Challenge (HA-0001). Limit is per Fluid instance. | Build | **partial** |
| RISK-0005 | C1 | Process | Zero tests and no typecheck script. Regressions from C1 hardening may ship unnoticed. | High | Medium | High | REQ-0026: `typecheck` + `node:test` | Build | **closed** |
| RISK-0006 | C1 | Process | Portable docs (Redis/Sentry/PostHog, CodeBook AI registry, FreeScribe guardrails) can be mistaken for this repo's backlog. | High | Low | Medium | Gate 1 out-of-scope list. Sentry adopted as REQ-0029 (DEC-0008). Redis/PostHog still out. | Human | **partial** |
| RISK-0007 | C1 | Technical | Duplicate SSR + client weather fetch doubles quota use and can race error states. | High | Medium | Medium | REQ-0017 | Build | open |
| RISK-0008 | C1 | Technical | Wind speed labeled km/h while OpenWeather metric is m/s → bad farming advice. | Medium | Medium | Medium | REQ-0027 `msToKmh` in UI and AI payloads | Build | **closed** |
| RISK-0009 | C1 | Compliance | README SECURITY.md link is broken. | High | Low | Low | Added `SECURITY.md`. | Build | **closed** |
| RISK-0010 | C1 | Security | Client-set cookies lack `Secure`. Acceptable for a public non-auth app but weaker on HTTPS. | Medium | Low | Low | Optional cookie flags in REQ-0011 follow-up; not blocking Gate 1. | Build | accepted-pending |
| RISK-0011 | C1 | Technical | `home-page.tsx` size (1286 lines) raises change risk during P0 fetch/secret work. | Medium | Medium | Medium | Do P0 in-place; split only as P2 REQ-0028. | Build | open |
