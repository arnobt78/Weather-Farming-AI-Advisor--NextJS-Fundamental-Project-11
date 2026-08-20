# Gates

## GATE-0001 — Human Gate 1 (Requirements / Blueprint)

| Field | Value |
|---|---|
| Cycle | C1 |
| Type | Human-Decision |
| Stage | After Stage 1–2 (Requirements + Gatekeeper notes) |
| Status | **Conditional** — P0+P1 (REQ-0016–0027, 0029) + README walkthrough 2026-08-20. Optional: REQ-0028. HA-0001 done. |
| Scope | Approve or amend REQ-0001–0028, task waves, out-of-scope list, rate-limit/TTL recommendations |
| Resume token | `C1-HG1-20260820-WF` |
| Checkpoint | INT-0001 |
| Evidence | `.agile-v/REQUIREMENTS.md`, `TASKS.md`, `RISKS.md`, `DISCOVERY_LOG.md`, `phases/01-requirements/PLAN.md` |
| Next if approved | Stage 3 Synthesis — TASK-0001 (do not start until this gate is recorded in APPROVALS.md) |

## GATE-0002 — Human Gate 2 (Release)

Not opened. Requires Stage 4 Red Team + `VALIDATION_SUMMARY.md` + `EVAL_RESULTS.md` eval_gate_status PASS or WAIVED.

---

## Human-Action (not code)

| ID | Action | Why |
|---|---|---|
| HA-0001 | **Done (human):** Firewall Bot Protection Challenge. | Stops scrapers before SSR/API. |
| HA-0002 | Optional: `HUGGINGFACE_API_KEY` on Vercel. | REQ-0019 optional last rung |
| HA-0003 | **Ignored (human):** rotate OW key / delete `NEXT_PUBLIC_OPENWEATHER_API_KEY` — not required by owner. | Was residual from public key era |
