"use client";

import { useWeatherContext } from "@/context/WeatherContext";
import { BG_IMAGE_COOKIE_KEY, WEATHER_UNSPLASH_QUERY } from "@/data/constants";
import type { UnsplashPhoto } from "@/types/unsplash";
import { useEffect, useMemo, useState } from "react";

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
  const [displayUrl, setDisplayUrl] = useState<string | null>(initialImageUrl);

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
      setDisplayUrl(activeUrl);
    };
  }, [activeUrl]);

  // Persist the active URL in a cookie so layout can pass it as initialImageUrl
  // on every route — prevents flash/mismatch when navigating between pages.
  useEffect(() => {
    if (!displayUrl) return;
    try {
      document.cookie = `${BG_IMAGE_COOKIE_KEY}=${encodeURIComponent(displayUrl)}; path=/; max-age=86400; samesite=lax`;
    } catch {
      // ignore
    }
  }, [displayUrl]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.1),transparent_65%)]" />
      {displayUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${displayUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-slate-950/18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03),transparent_60%)]" />
    </div>
  );
}
