/**
 * sentry.edge.config.ts — Edge runtime Sentry init (middleware / edge routes if added later).
 *
 * Loaded from `instrumentation.ts` when `NEXT_RUNTIME === "edge"`.
 * Same DSN + filters as the Node config. This app has no middleware today.
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
