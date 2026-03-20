"use client";

import { Card } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { useWeatherContext } from "@/context/WeatherContext";
import type { UnsplashPhoto } from "@/types/unsplash";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function GalleryPage() {
  const { currentWeather } = useWeatherContext();
  const keyword =
    currentWeather?.weather[0]?.main?.toLowerCase().replace(" ", "+") ??
    "weather";
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/unsplash?keyword=${encodeURIComponent(keyword)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { photos: UnsplashPhoto[] };
        setPhotos(data.photos ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white">
        <ImageIcon className="h-6 w-6" />
        Weather gallery
      </h1>
      <p className="inline-flex items-center gap-1 text-white">
        <Sparkles className="h-4 w-4" />
        Photos for “{keyword.replace("+", " ")}” from Unsplash.
      </p>
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border-white/25 bg-gray-900/30">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.urls.regular}
                    alt={photo.alt_description ?? "Weather photo"}
                    fill
                    className="object-cover transition duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <p className="p-2 text-xs text-white/90">{photo.user.name}</p>
              </Card>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
