/**
 * Next.js config — remote images + production security/cache headers + Sentry.
 *
 * Walkthrough:
 * - `images.remotePatterns` allow `next/image` for Unsplash + OpenWeather icon CDN.
 * - `headers()` applies OWASP-oriented security headers on every path (no HSTS here —
 *   that can pin HTTPS on localhost). Do not set Cache-Control on HTML/`/api` —
 *   layout reads cookies so pages must stay dynamic.
 * - `/_next/static` immutable cache is mirrored in `vercel.json` for the CDN edge.
 * - `withSentryConfig` adds a rewrite for `/api/monitoring` (browser → our origin → Sentry ingest).
 *   Quiet CI: `silent: true`, `telemetry: false`. Sourcemaps upload when org/project/token are set,
 *   then delete from the deploy artifact (guide §2A Step 6 / 6b).
 */
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/** Shared with vercel.json — keep both lists identical. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: "/api/monitoring",
  silent: true,
  telemetry: false,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
