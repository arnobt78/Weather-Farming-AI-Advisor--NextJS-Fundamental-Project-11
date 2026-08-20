/**
 * lib/sentry-env.ts — DSN helpers and tunnel path for client + server Sentry init.
 *
 * Walkthrough:
 * - Client uses `NEXT_PUBLIC_SENTRY_DSN` (bundled). Server prefers `SENTRY_DSN`, then the public DSN.
 * - Empty DSN → SDK stays disabled (`enabled: !!dsn` in the init files).
 * - Tunnel is same-origin `/api/monitoring` so ad blockers never see `ingest.sentry.io`.
 * - Sample rates match docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md §2A.
 */

export const SENTRY_TUNNEL_ROUTE = "/api/monitoring";

export function getClientSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

export function getServerSentryDsn(): string | undefined {
  const dsn =
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

export function getTracesSampleRate(): number {
  return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
}
