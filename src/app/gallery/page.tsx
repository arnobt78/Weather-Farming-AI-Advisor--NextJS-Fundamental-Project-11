import { GalleryPage as GalleryPageClient } from "@/Components/pages/gallery-page";

/**
 * Gallery: Unsplash photos by weather keyword.
 * WeatherBackground is rendered globally in layout.tsx.
 */
export default async function GalleryRoute() {
  return (
    <main className="mx-auto w-full max-w-9xl flex-1 px-4 py-6 sm:px-6">
      <GalleryPageClient />
    </main>
  );
}
