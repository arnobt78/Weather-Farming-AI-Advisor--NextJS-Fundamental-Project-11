import { unstable_cache } from "next/cache";
import { WEATHER_UNSPLASH_QUERY } from "@/data/constants";
import { searchUnsplash } from "@/lib/unsplash";

/**
 * Server helper to get a first-paint background image URL for any route.
 */
const getCachedBackgroundUrl = unstable_cache(
  async (query: string) => {
    const photos = await searchUnsplash(query, 1);
    return photos[0]?.urls?.regular ?? null;
  },
  ["initial-background-url"],
  { revalidate: 300 },
);

export async function getInitialBackgroundUrl(
  weatherMain?: string | null,
): Promise<string | null> {
  const query = weatherMain
    ? (WEATHER_UNSPLASH_QUERY[weatherMain] ?? "weather")
    : "weather";
  return getCachedBackgroundUrl(query);
}
