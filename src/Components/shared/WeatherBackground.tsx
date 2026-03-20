"use client";

import { useWeatherContext } from "@/context/WeatherContext";
import { BG_IMAGE_COOKIE_KEY, WEATHER_UNSPLASH_QUERY } from "@/data/constants";
import type { UnsplashPhoto } from "@/types/unsplash";
import { useEffect, useMemo, useRef, useState } from "react";

const SLIDE_INTERVAL_MS = 9000;

type WeatherBackgroundProps = {
  initialImageUrl?: string | null;
};

export function WeatherBackground({
  initialImageUrl = null,
}: WeatherBackgroundProps) {
  const { currentWeather } = useWeatherContext();
  const weatherKey = currentWeather?.weather[0]?.main ?? "Clear";
  const keyword = useMemo(
    () => WEATHER_UNSPLASH_QUERY[weatherKey] ?? "weather nature",
    [weatherKey],
  );
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [index, setIndex] = useState(0);

  // Two-layer crossfade: layerA and layerB alternate as active/inactive
  const [layerA, setLayerA] = useState<string | null>(initialImageUrl);
  const [layerB, setLayerB] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<"a" | "b">("a");
  const activeLayerRef = useRef<"a" | "b">("a");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/unsplash?keyword=${encodeURIComponent(keyword)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { photos: UnsplashPhoto[] };
        if (cancelled) return;
        setPhotos(data.photos ?? []);
        setIndex(0);
      } catch {
        // Keep fallback gradients only when image fetch fails.
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [keyword]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [photos.length]);

  const activeUrl = photos[index]?.urls.regular;

  useEffect(() => {
    if (!activeUrl) return;
    const img = new window.Image();
    img.src = activeUrl;
    img.onload = () => {
      // Load new image into the inactive layer, then flip active
      if (activeLayerRef.current === "a") {
        setLayerB(activeUrl);
        setActiveLayer("b");
        activeLayerRef.current = "b";
      } else {
        setLayerA(activeUrl);
        setActiveLayer("a");
        activeLayerRef.current = "a";
      }
      // Persist for cross-route consistency
      try {
        document.cookie = `${BG_IMAGE_COOKIE_KEY}=${encodeURIComponent(activeUrl)}; path=/; max-age=86400; samesite=lax`;
      } catch {
        // ignore
      }
    };
  }, [activeUrl]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Layer A */}
      {layerA && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            activeLayer === "a" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${layerA})` }}
        />
      )}
      {/* Layer B */}
      {layerB && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            activeLayer === "b" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${layerB})` }}
        />
      )}
      {/* Overlays always on top */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.1),transparent_65%)]" />
      <div className="absolute inset-0 bg-slate-950/18" />
    </div>
  );
}
