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
  const initialCity = requestedCity || cookieCity || DEFAULT_CITY;

  const initialData =
    (await fetchWeatherByCity(initialCity)) ??
    (initialCity !== DEFAULT_CITY
      ? await fetchWeatherByCity(DEFAULT_CITY)
      : null);

  return (
    <main className="mx-auto flex w-full max-w-9xl flex-1 items-stretch">
      <HomePage initialData={initialData} />
    </main>
  );
}
