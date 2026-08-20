/**
 * app/layout.tsx — Root layout (Server Component)
 *
 * Walkthrough:
 * - Defines global `metadata` for SEO (title template, Open Graph, Twitter, author).
 * - Loads Google fonts as CSS variables for the whole app.
 * - Reads HTTP cookies on the server to hydrate `WeatherProvider` without navbar hydration mismatches.
 * - `data-scroll-behavior="smooth"` on `<html>` is the App Router scroll hint (no JS delay).
 * - Mounts shell: AppProvider → WeatherProvider → preload + fixed background → Navbar → page `children` → Footer.
 * - `BackgroundPreload` / `WeatherBackground`: cookie URL wins; otherwise SSR Unsplash via `getInitialBackgroundUrl`.
 */
import type { Metadata } from "next";
import { DM_Sans, Lilita_One } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/Components/shared/Navbar";
import { Footer } from "@/Components/shared/Footer";
import { BackgroundPreload } from "@/Components/shared/background-preload";
import { WeatherBackground } from "@/Components/shared/WeatherBackground";
import { WeatherProvider } from "@/context/WeatherContext";
import {
  BG_IMAGE_COOKIE_KEY,
  CITY_COOKIE_KEY,
  DEFAULT_CITY,
  SAVED_CITIES_COOKIE_KEY,
} from "@/data/constants";
import { AppProvider } from "@/provider/app-provider";
import { getInitialBackgroundUrl } from "@/lib/background";
import { fetchWeatherByCity } from "@/lib/openweather";

const fontDisplay = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-display",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

/** Production / canonical base URL — used for Open Graph, Twitter cards, and absolute asset URLs. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://weather-farming.vercel.app";

const defaultTitle =
  process.env.NEXT_PUBLIC_APP_TITLE ||
  "AI-Powered Weather & Farming Advisory Dashboard";

const longTitle =
  "AI-Powered Weather & Farming Advisory Dashboard — Next.js, React, TypeScript, OpenWeather API, Agro API, Tailwind CSS, Framer Motion (Fundamental Project 11)";

const metaDescription =
  "Search any city for live weather, 5-day forecast, air quality, and AI-powered weather summaries and farming tips. Built with Next.js, OpenWeather API, optional Agro API, Unsplash backgrounds, Tailwind CSS, and Framer Motion. Live demo and learning project by Arnob Mahmud.";

const metaKeywords = [
  "weather dashboard",
  "farming advisory",
  "agriculture weather",
  "AI weather summary",
  "farming tips",
  "OpenWeather API",
  "Agro API",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "air quality",
  "weather forecast",
  "Arnob Mahmud",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  applicationName: defaultTitle,
  description: metaDescription,
  keywords: metaKeywords,
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://www.arnobmahmud.com",
    },
  ],
  creator: "Arnob Mahmud",
  publisher: "Arnob Mahmud",
  category: "weather",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: defaultTitle,
    title: longTitle,
    description: metaDescription,
    images: [
      {
        url: "/images/sunny.png",
        width: 1280,
        height: 720,
        alt: "AI-Powered Weather & Farming Advisory Dashboard — weather illustration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: longTitle,
    description: metaDescription,
    images: [`${siteUrl}/images/sunny.png`],
  },
  other: {
    "author:email": "contact@arnobmahmud.com",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * RootLayout — reads cookies once per request, passes into `WeatherProvider`, renders global shell.
 * `children` is the active route (e.g. home or gallery main column only).
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const initialCity = cookieStore.get(CITY_COOKIE_KEY)?.value ?? undefined;
  const savedRaw = cookieStore.get(SAVED_CITIES_COOKIE_KEY)?.value;
  // Background URL saved client-side after the first load — ensures every route
  // (home, gallery, etc.) starts with the same image the user last saw.
  // Cookie from a previous visit wins. First visit: weather-matched Unsplash (cached 300s).
  let initialBgUrl = cookieStore.get(BG_IMAGE_COOKIE_KEY)?.value
    ? decodeURIComponent(cookieStore.get(BG_IMAGE_COOKIE_KEY)!.value)
    : null;
  if (!initialBgUrl) {
    try {
      const cityForBg = initialCity?.trim() || DEFAULT_CITY;
      const weather = await fetchWeatherByCity(cityForBg);
      const main = weather?.weather[0]?.main ?? null;
      initialBgUrl = await getInitialBackgroundUrl(main);
    } catch {
      initialBgUrl = null;
    }
  }
  let initialSavedCities: string[] = [];
  if (savedRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(savedRaw)) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        initialSavedCities = parsed;
      }
    } catch {
      initialSavedCities = [];
    }
  }

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontBody.variable} ${fontDisplay.variable} min-h-screen bg-transparent font-sans antialiased`}
      >
        <AppProvider>
          <WeatherProvider
            initialCity={initialCity}
            initialSavedCities={initialSavedCities}
          >
            <BackgroundPreload imageUrl={initialBgUrl} />
            <WeatherBackground initialImageUrl={initialBgUrl} />
            <div className="relative z-10 flex min-h-screen flex-col">
              <Navbar />
              <div className="mx-auto flex min-h-screen w-full max-w-9xl flex-1 flex-col px-4 pb-8 sm:px-6">
                {children}
              </div>
              <Footer />
            </div>
          </WeatherProvider>
        </AppProvider>
      </body>
    </html>
  );
}
