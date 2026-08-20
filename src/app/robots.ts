/**
 * robots.ts — crawl scope for search engines and scrapers (App Router metadata route).
 *
 * Walkthrough:
 * - Single source of truth: this file only (do not add public/robots.txt).
 * - Humans and SEO still get `/` and `/gallery`. `/api/` and `/_next/` are
 *   disallowed so polite crawlers skip Route Handlers and image optimizer URLs.
 * - Named AI scrapers are denied here as a backup; Vercel Firewall "AI Bots = Deny"
 *   is the control that actually stops them at the edge before SSR runs.
 */
import type { MetadataRoute } from "next";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: ["/"],
      })),
    ],
  };
}
