/**
 * instrumentation-client.ts — browser Sentry init (Next client instrumentation hook).
 *
 * Walkthrough:
 * - Does not convert `layout.tsx` to a client component.
 * - `tunnel` POSTs envelopes to same-origin `/api/monitoring` (ad-blocker bypass).
 * - `withSentryConfig({ tunnelRoute })` registers the matching rewrite at build time.
 */
import * as Sentry from "@sentry/nextjs";
import {
  getClientSentryDsn,
  getTracesSampleRate,
  SENTRY_TUNNEL_ROUTE,
} from "@/lib/sentry-env";
import { SENTRY_IGNORE_ERRORS, sentryBeforeSend } from "@/lib/sentry-filters";

const dsn = getClientSentryDsn();

Sentry.init({
  dsn,
  enabled: !!dsn,
  tunnel: SENTRY_TUNNEL_ROUTE,
  tracesSampleRate: getTracesSampleRate(),
  environment: process.env.NODE_ENV || "development",
  debug: false,
  sendDefaultPii: false,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
  beforeSend: sentryBeforeSend,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
