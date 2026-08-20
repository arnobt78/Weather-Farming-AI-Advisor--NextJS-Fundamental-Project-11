# Approvals

Append-only. Name + role required. Resume from a PENDING checkpoint only when `resume_token` matches.

| GATE-ID | Gate type | Cycle | Scope | Decision | Conditions | Approver | Role | Timestamp | Signature method | Evidence | resume_token | INTERRUPT-ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GATE-0001 | Human Gate 1 | C1 | REQ-0001–0028 + C1 plan | PENDING (remainder) | — | — | — | — | — | `.agile-v/REQUIREMENTS.md` | C1-HG1-20260820-WF | INT-0001 |
| GATE-0001 | Human Gate 1 (slice) | C1 | REQ-0023 + Node 24 + zero-audit plan | Conditional / Approved for this slice | No OpenWeather proxy, no AI model rewrite, no Zod/rate-limit, no major-version jumps | Project owner | Cursor plan approval | 2026-08-20 | Cursor plan confirm | `vercel_guardrails_deps` plan | C1-HG1-20260820-WF | INT-0001 |

