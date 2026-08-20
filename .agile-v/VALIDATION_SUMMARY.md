# Validation Summary — C1

| VAL-ID | Command | Environment | Result | Notes |
|---|---|---|---|---|
| VAL-0001 | repository analysis | local 2026-08-20 | PASS | Architecture + gaps. |
| VAL-0002 | `npm run lint` | Node 24.19.0 | **PASS** | After safe dep refresh + react-hooks v7 fixes. |
| VAL-0003 | `npm run typecheck` | Node 24.19.0 | **PASS** | After safe dep refresh. |
| VAL-0004 | `npm run build` | Next 16.3.1 | **PASS** | Cache-Control warn on `/_next/static` (keep). |
| VAL-0005 | `npm test` | tsx + node:test | **PASS** | 6/6 (ai-validate, openweather, units). |
| VAL-0006 | `npm audit` | Node 24.19.0 | **PASS** | 0 vulnerabilities. |
| VAL-0007 | safe dep refresh | 2026-08-20 | **PASS** | `npm update` + `lucide-react` 0.542→0.577. Skipped majors: TW4, ESLint10, TS7, FM13, Lucide1, `@types/node`26. |
| VAL-0008 | AI Insights UX | 2026-08-20 | **PASS** | Farming 2048 tokens, tighter prompts, Loader2 + live stream panels; lint/typecheck/test/build PASS. |
| VAL-0009 | Glass toasts | 2026-08-20 | **PASS** | ToastContext + glass Toaster; search + AI wired; lint/typecheck/test/build PASS. |
| VAL-0010 | AI tokens + vercel | 2026-08-20 | **PASS** | summary 1024 / farming 4096; prompts tightened; `framework` removed from vercel.json; lint/typecheck/test/build PASS. |
| VAL-0011 | Saved cities SSR | 2026-08-20 | **PASS** | SSR `?city=` saves canonical name; case-insensitive chips; lint/typecheck/test/build PASS. |

**EvalGate:** n/a (Gate 2 not open).
