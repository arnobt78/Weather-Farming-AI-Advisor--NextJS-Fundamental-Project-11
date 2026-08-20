# Playbook (short)

1. Read `docs/AGILE_V_PROTOCOL.md`, then `CLAUDE.md`, then `.agile-v/STATE.md`.
2. If CHECKPOINTS.md has PENDING, require matching `resume_token` in APPROVALS.md before synthesis.
3. Code is source of truth. Update `.agile-v/` when behavior or plan changes; do not copy the same facts into README, CLAUDE.md, and STATE.md.
4. Do not implement Redis/PostHog/Agro unless STATE.md active REQs include them.
5. Never read or commit `.env.local`.
6. After code: lint, typecheck, tests, build; write VALIDATION_SUMMARY.md with commands actually run.
