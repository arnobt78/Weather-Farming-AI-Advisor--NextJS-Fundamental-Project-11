/**
 * global-error.tsx — App Router root error UI (replaces the root layout when it crashes).
 *
 * Walkthrough:
 * - Must render its own `<html>` + `<body>` (the crashed layout is gone).
 * - Reports the error to Sentry, then offers a reset. No Navbar/Footer here —
 *   those live in the layout and may be the failure.
 */
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans text-white antialiased">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-6 text-center shadow-[0_15px_35px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-white/70">
              The dashboard hit an unexpected error. You can try again without
              leaving this page.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-sky-300/50"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
