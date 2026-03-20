import type { UnsplashPhoto, UnsplashSearchResponse } from "@/types/unsplash";

const UNSPLASH_SEARCH = "https://api.unsplash.com/search/photos";

/**
 * Server-side only. Search Unsplash by keyword; return photo URLs and alt text.
 */
export async function searchUnsplash(keyword: string, perPage = 6): Promise<UnsplashPhoto[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  const query = new URLSearchParams({
    query: keyword,
    per_page: String(perPage),
    client_id: key,
  });

  const response = await fetch(`${UNSPLASH_SEARCH}?${query.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];

  const data = (await response.json()) as UnsplashSearchResponse;
  return Array.isArray(data.results) ? data.results : [];
}
