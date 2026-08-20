/**
 * app/page.tsx — Home route (Server Component)
 *
 * Walkthrough:
 * - Next.js runs this on the server for each request (dynamic route when cookies/search vary).
 * - City resolution order: URL ?city= → cookie (last searched) → DEFAULT_CITY — so refresh keeps context.
 * - `fetchWeatherByCity` runs only on the server (`lib/openweather` + `OPENWEATHER_API_KEY`).
 * - Client search uses `GET /api/weather` so the key never enters the browser bundle.
 * - Fallback: if the chosen city fails but isn’t default, retry DEFAULT_CITY so the page still hydrates.
 * - `HomePage` is a Client Component: it receives `initialData` as props for first paint, then handles live search.
 */
import { HomePage } from "@/Components/pages/home-page";
import { CITY_COOKIE_KEY, DEFAULT_CITY } from "@/data/constants";
import { fetchWeatherByCity } from "@/lib/openweather";
import { cookies } from "next/headers";

/**
 * SSR: fetch weather for the current city and pass it to the HomePage.
 * WeatherBackground is rendered globally in layout.tsx.
 */
type PageProps = {
  searchParams?: Promise<{ city?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCity = resolvedSearchParams?.city?.trim();
  const cookieStore = await cookies();
  const cookieCity = cookieStore.get(CITY_COOKIE_KEY)?.value?.trim();
  // Prefer explicit search, then persisted cookie, then app default (see README / WeatherContext).
  const initialCity = requestedCity || cookieCity || DEFAULT_CITY;

  const initialData =
    (await fetchWeatherByCity(initialCity)) ??
    (initialCity !== DEFAULT_CITY
      ? await fetchWeatherByCity(DEFAULT_CITY)
      : null);

  return (
    <main className="mx-auto flex w-full max-w-9xl flex-1 items-stretch">
      <HomePage key={initialCity} initialData={initialData} />
    </main>
  );
}
