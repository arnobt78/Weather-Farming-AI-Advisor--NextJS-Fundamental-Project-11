# STATE.md

**Resume from this file.**

| Field | Value |
|---|---|
| Project | weather-farming |
| Cycle | **C1** |
| Status | P0+P1 done. Glass toasts + AI token budgets (summary 1024 / farming 4096) + vercel.json framework removed. |
| Gate | GATE-0001 Conditional · token `C1-HG1-20260820-WF` |
| Skip | REQ-0028 unless asked · HA-0003 ignored |
| Human | HA-0001 Firewall **done** |

## Implemented
REQ-0016–0018 OW proxy · 0019 AI IDs · 0020 validate · 0021 panel errors · 0022 SSR BG · 0023 guardrails · 0024 rate limit · 0025 OW 300s · 0026 tests · 0027 km/h · 0029 Sentry

## Out of scope
Agro UI · Redis · PostHog · auth · DB · Zod · densify · Vite

## Validate (2026-08-20 Node 24.19)
lint · typecheck · test (6) · build — **PASS** (AI tokens + vercel.json)

## Session note
AI: summary 1024 / farming 4096 / fallback 2048; tighter no-fluff prompts. `vercel.json`: removed `framework` (headers kept) so dashboard Overridden clears after deploy.

## Next
None required. Optional: REQ-0028 HomePage split if approved.
