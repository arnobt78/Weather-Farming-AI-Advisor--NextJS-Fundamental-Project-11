/**
 * instrumentation.ts — Next.js server/edge hook that boots Sentry.
 *
 * Walkthrough:
 * - `register` runs once per runtime. Node vs Edge pick their config file.
 * - `onRequestError` forwards unhandled request errors (not handled 400/502 JSON).
 * - Client init lives in `instrumentation-client.ts` (do not use sentry.client.config.ts).
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
