"use client";

/**
 * GalleryPage — paginated Unsplash grid driven by current weather description keyword
 *
 * Uses `currentWeather` from context (set on Home). Resets to page 1 when keyword changes; download uses blob + object URL.
 */
import { Card } from "@/Components/ui/card";
import { ImageDialog } from "@/Components/ui/image-dialog";
import { Pagination } from "@/Components/ui/pagination";
import { Skeleton } from "@/Components/ui/skeleton";
import { useWeatherContext } from "@/context/WeatherContext";
import { WEATHER_GIFS } from "@/data/constants";
import type { UnsplashPhoto } from "@/types/unsplash";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import { SafeImage } from "@/Components/ui/safe-image";
import { useCallback, useEffect, useRef, useState } from "react";

export function GalleryPage() {
  const { currentWeather } = useWeatherContext();
  const keyword =
    currentWeather?.weather[0]?.description
      ?.toLowerCase()
      .replace(/\s+/g, "+") ?? "weather";
  const weatherKind = currentWeather?.weather[0]?.main ?? "Clear";
  const weatherGif = WEATHER_GIFS[weatherKind] ?? WEATHER_GIFS.Clear;
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogPhoto, setDialogPhoto] = useState<UnsplashPhoto | null>(null);
  const galleryTopRef = useRef<HTMLDivElement>(null);

  const fetchPhotos = useCallback(async (kw: string, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/unsplash?keyword=${encodeURIComponent(kw)}&page=${pg}`,
      );
      if (res.ok) {
        const data = (await res.json()) as {
          photos: UnsplashPhoto[];
          totalPages: number;
        };
        setPhotos(data.photos ?? []);
        setTotalPages(data.totalPages ?? 1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    void fetchPhotos(keyword, page);
  }, [keyword, page, fetchPhotos]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    galleryTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleDownload = useCallback(async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <motion.div
      ref={galleryTopRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-gray-900/30 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={weatherGif}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${weatherGif})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "screen",
            }}
          />
        </AnimatePresence>
        <div className="relative z-10 flex flex-col items-start gap-2">
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white">
            <ImageIcon className="h-6 w-6" />
            Weather gallery
          </h1>
          <p className="inline-flex items-center gap-1 text-white/90">
            <Sparkles className="h-4 w-4" />
            Photos for &quot;{keyword.replace(/\+/g, " ")}&quot; from Unsplash.
          </p>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <Card className="max-w-lg border-white/25 p-6">
          <p className="inline-flex items-center gap-2 text-sm text-white/90">
            <ImageIcon className="h-4 w-4" />
            No photos found for this weather keyword.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative overflow-hidden border-white/25 bg-gray-900/30">
                  <div
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                    onClick={() => setDialogPhoto(photo)}
                  >
                    <SafeImage
                      src={photo.urls.regular}
                      alt={photo.alt_description ?? "Weather photo"}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDownload(
                          photo.urls.regular,
                          photo.alt_description ?? photo.id,
                        );
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white/90 opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
                      title="Download image"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="p-2 text-xs text-white/90">{photo.user.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
      <ImageDialog
        open={dialogPhoto !== null}
        onClose={() => setDialogPhoto(null)}
        src={dialogPhoto?.urls.regular ?? ""}
        alt={dialogPhoto?.alt_description ?? "Weather photo"}
        photographerName={dialogPhoto?.user.name}
      />
    </motion.div>
  );
}
