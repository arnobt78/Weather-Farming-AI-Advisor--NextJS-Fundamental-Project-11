/**
 * sentry.server.config.ts — Node runtime Sentry init (RSC, Route Handlers).
 *
 * Loaded from `instrumentation.ts` when `NEXT_RUNTIME === "nodejs"`.
 * No-op when both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` are empty.
 */
import * as Sentry from "@sentry/nextjs";
import { getServerSentryDsn, getTracesSampleRate } from "@/lib/sentry-env";
import { SENTRY_IGNORE_ERRORS, sentryBeforeSend } from "@/lib/sentry-filters";

const dsn = getServerSentryDsn();

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: getTracesSampleRate(),
  environment: process.env.NODE_ENV || "development",
  debug: false,
  sendDefaultPii: false,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
  beforeSend: sentryBeforeSend,
});
