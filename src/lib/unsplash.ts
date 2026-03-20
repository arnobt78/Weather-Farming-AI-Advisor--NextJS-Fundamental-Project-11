import type { UnsplashPhoto, UnsplashSearchResponse } from "@/types/unsplash";

const UNSPLASH_SEARCH = "https://api.unsplash.com/search/photos";

export type UnsplashSearchResult = {
  photos: UnsplashPhoto[];
  total: number;
  totalPages: number;
};

/**
 * Server-side only. Search Unsplash by keyword; return photo URLs, alt text, and pagination info.
 */
export async function searchUnsplash(
  keyword: string,
  perPage = 6,
  page = 1,
): Promise<UnsplashSearchResult> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return { photos: [], total: 0, totalPages: 0 };

  const query = new URLSearchParams({
    query: keyword,
    per_page: String(perPage),
    page: String(page),
    client_id: key,
  });

  const response = await fetch(`${UNSPLASH_SEARCH}?${query.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) return { photos: [], total: 0, totalPages: 0 };

  const data = (await response.json()) as UnsplashSearchResponse;
  const photos = Array.isArray(data.results) ? data.results : [];
  const total = data.total ?? 0;
  const totalPages = Math.ceil(total / perPage);
  return { photos, total, totalPages };
}
