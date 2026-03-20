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
  SAVED_CITIES_COOKIE_KEY,
} from "@/data/constants";
import { AppProvider } from "@/provider/app-provider";

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

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE || "Weather Live",
  description: "Weather app tutorial project with Next.js and TypeScript.",
  icons: {
    icon: "/favicon.ico",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Server-rendered root layout. Interactive UI is delegated to client components.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const initialCity = cookieStore.get(CITY_COOKIE_KEY)?.value ?? undefined;
  const savedRaw = cookieStore.get(SAVED_CITIES_COOKIE_KEY)?.value;
  // Background URL saved client-side after the first load — ensures every route
  // (home, gallery, etc.) starts with the same image the user last saw.
  const initialBgUrl = cookieStore.get(BG_IMAGE_COOKIE_KEY)?.value
    ? decodeURIComponent(cookieStore.get(BG_IMAGE_COOKIE_KEY)!.value)
    : null;
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
    <html lang="en" suppressHydrationWarning>
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
