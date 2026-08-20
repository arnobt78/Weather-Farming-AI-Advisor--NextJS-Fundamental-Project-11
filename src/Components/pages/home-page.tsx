"use client";

/**
 * HomePage — main dashboard (Client Component)
 *
 * Walkthrough:
 * - `initialData` from `app/page.tsx` (SSR) seeds first render; `useWeather` handles user searches and loading UI.
 * - On successful search, `onSuccess` updates context, persists city, and sets lat/lon from `weather.coord` (geocode API only if coord is missing).
 * - AI blocks call `/api/ai/summary` and `/api/ai/farming-tips` (stream preferred). TTS posts to `/api/ai/tts`.
 * - Panel errors (`forecastError`, `airError`, `summaryError`, `tipsError`, `ttsError`) replace silent spinner failures.
 * - Summary/Tips buttons show Loader2 while generating; streamed text grows in auto-height panels (no Framer height clip).
 * - Glass toasts (ToastContext) for city search + AI success/error; panel error boxes stay as well.
 * - Helpers: date/compass formatting, `groupForecastByDay`, `renderAiText` for **bold** / bullets in streamed markdown.
 */
import { Card } from "@/Components/ui/card";
import { RippleButton } from "@/Components/ui/ripple-button";
import { Skeleton } from "@/Components/ui/skeleton";
import { useToast } from "@/context/ToastContext";
import { useWeatherContext } from "@/context/WeatherContext";
import { DEFAULT_CITY, WEATHER_GIFS, WEATHER_IMAGES } from "@/data/constants";
import { useWeather } from "@/hooks/useWeather";
import { msToKmh } from "@/lib/units";
import type { AirPollutionResponse } from "@/types/air";
import type { ForecastResponse } from "@/types/forecast";
import type { GeoItem } from "@/types/geo";
import type { WeatherApiSuccess } from "@/types/weather";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Cloud,
  CloudCog,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Flag,
  Gauge,
  Globe,
  Info,
  Leaf,
  Loader2,
  MapPin,
  MousePointerClick,
  Sparkles,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSun,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import { SafeImage } from "@/Components/ui/safe-image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ─── types ──────────────────────────────────────────────── */

type HomePageProps = {
  initialData: WeatherApiSuccess | null;
};

/** Use OpenWeather `coord` when present; otherwise same-origin geocode (no browser API key). */
function applyCoordinatesFromWeather(
  data: WeatherApiSuccess,
  city: string,
  setCoordinates: (lat: number, lon: number) => void,
): void {
  const lat = data.coord?.lat;
  const lon = data.coord?.lon;
  if (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  ) {
    setCoordinates(lat, lon);
    return;
  }
  void fetch(`/api/geocode?city=${encodeURIComponent(city)}`)
    .then((res) => (res.ok ? (res.json() as Promise<GeoItem>) : null))
    .then((geo) => {
      if (
        geo &&
        Number.isFinite(geo.lat) &&
        Number.isFinite(geo.lon)
      ) {
        setCoordinates(geo.lat, geo.lon);
      }
    })
    .catch(() => {
      /* forecast/AQI stay empty if coords never resolve */
    });
}

/** Read `{ error }` from a failed Route Handler; fallback if the body is empty or non-JSON. */
async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    /* ignore */
  }
  return fallback;
}

/**
 * Consume a text/plain AI stream, calling onChunk with the full accumulated text after each delta.
 * Used so Summary/Tips panels grow live instead of waiting for the full response.
 */
async function readPlainTextStream(
  res: Response,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(accumulated);
  }
  return accumulated;
}

/* ─── helpers ────────────────────────────────────────────── */

/** Render AI text with basic markdown formatting (bold, bullets, newlines) */
function renderAiText(text: string, isStreaming: boolean) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, li) => {
        const trimmed = line.trim();
        const isBullet = /^[-•*]\s/.test(trimmed);
        const content = isBullet ? trimmed.slice(2) : trimmed;
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pi} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={pi}>{part}</span>;
        });
        return (
          <span key={li}>
            {li > 0 && <br />}
            {isBullet && <span className="mr-1">•</span>}
            {rendered}
          </span>
        );
      })}
      {isStreaming && <span className="ai-streaming-cursor" />}
    </span>
  );
}

function formatDate(date: Date): string {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatDateUtc(date: Date): string {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${daysOfWeek[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUnixTime(unix: number, timezoneOffset: number): string {
  const d = new Date((unix + timezoneOffset) * 1000);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function degToCompass(deg: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** One representative forecast entry per calendar day (OpenWeather returns 3h steps). */
function groupForecastByDay(
  list: ForecastResponse["list"],
): Array<ForecastResponse["list"][number]> {
  const byDay = new Map<string, ForecastResponse["list"][number]>();
  for (const item of list) {
    const key = item.dt_txt.slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, item);
  }
  return Array.from(byDay.values()).slice(0, 5);
}

const AQI_CONFIG: Record<number, { label: string; color: string; bg: string }> =
  {
    1: {
      label: "Good",
      color: "text-emerald-300",
      bg: "bg-emerald-500/20 border-emerald-400/30",
    },
    2: {
      label: "Fair",
      color: "text-yellow-300",
      bg: "bg-yellow-500/20 border-yellow-400/30",
    },
    3: {
      label: "Moderate",
      color: "text-orange-300",
      bg: "bg-orange-500/20 border-orange-400/30",
    },
    4: {
      label: "Poor",
      color: "text-red-300",
      bg: "bg-red-500/20 border-red-400/30",
    },
    5: {
      label: "Very Poor",
      color: "text-purple-300",
      bg: "bg-purple-500/20 border-purple-400/30",
    },
  };

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.02 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

/* ─── skeleton loading ──────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Location header skeleton */}
      <Card className="p-5 sm:p-6 bg-gray-900/30">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="ml-auto h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-4 w-28" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>

      {/* 4 weather cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 bg-gray-900/30">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-16" />
            {i === 1 && <Skeleton className="mt-3 h-32 w-full rounded-2xl" />}
          </Card>
        ))}
      </div>

      {/* Weather details skeleton */}
      <Card className="p-5 sm:p-6 bg-gray-900/30">
        <Skeleton className="h-6 w-40" />
        <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-6 w-20" />
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights skeleton */}
      <Card className="p-5 sm:p-6 bg-gray-900/30">
        <Skeleton className="h-6 w-32" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </Card>

      {/* 2-col: Forecast + Air Quality */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Forecast skeleton */}
        <Card className="p-5 sm:p-6 bg-gray-900/30">
          <Skeleton className="h-6 w-36" />
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-3">
                <Skeleton className="h-4 w-24" />
                <div className="mt-2 flex items-center gap-3">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Air quality skeleton */}
        <Card className="p-5 sm:p-6 bg-gray-900/30">
          <Skeleton className="h-6 w-32" />
          <div className="mt-3 grid gap-3 grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 p-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-2 h-5 w-14" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */

export function HomePage({ initialData }: HomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const toastSuccess = toast.success;
  const toastError = toast.error;
  const { setCity, setCoordinates, setCurrentWeather, lat, lon, addSavedCity } =
    useWeatherContext();
  const initialSync = useRef(false);
  /** Dedupe city toasts so SSR remount / same ?city= does not spam. */
  const lastToastedCityKey = useRef<string | null>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [tips, setTips] = useState<string | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsStreaming, setTipsStreaming] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [air, setAir] = useState<AirPollutionResponse | null>(null);
  const [airLoading, setAirLoading] = useState(false);
  const [airError, setAirError] = useState<string | null>(null);
  const [lastAiCityKey, setLastAiCityKey] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [clockMs, setClockMs] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onSuccess = useCallback(
    (data: WeatherApiSuccess, city: string) => {
      setCity(city);
      setCurrentWeather(data);
      // Canonical OpenWeather name so SAVED chips match the dashboard title.
      addSavedCity(data.name);
      applyCoordinatesFromWeather(data, city, setCoordinates);
      const key = `ok:${data.name}`;
      if (lastToastedCityKey.current !== key) {
        lastToastedCityKey.current = key;
        toastSuccess({
          title: "City found",
          description: `Showing weather for ${data.name}.`,
        });
      }
    },
    [setCity, setCoordinates, setCurrentWeather, addSavedCity, toastSuccess],
  );

  const onError = useCallback(
    (message: string, city: string) => {
      const key = `err:${city.toLowerCase()}:${message}`;
      if (lastToastedCityKey.current !== key) {
        lastToastedCityKey.current = key;
        toastError({
          title:
            message === "Weather unavailable."
              ? "Weather unavailable"
              : "City not found",
          description: message,
        });
      }
    },
    [toastError],
  );

  const { state, searchWeather } = useWeather(initialData, {
    onSuccess,
    onError,
  });

  // One-time: push SSR weather into context so Navbar/background see the same city as the server.
  useEffect(() => {
    if (initialSync.current || !initialData) return;
    initialSync.current = true;
    setCurrentWeather(initialData);
    setCity(initialData.name);
    applyCoordinatesFromWeather(initialData, initialData.name, setCoordinates);
  }, [initialData, setCity, setCoordinates, setCurrentWeather]);

  // Navbar sets `?city=`. Skip a second OpenWeather hit when SSR already loaded that city.
  // If SSR fell back to the default city, names differ → client search shows not-found.
  useEffect(() => {
    const cityFromQuery = searchParams.get("city")?.trim();
    if (!cityFromQuery) return;
    if (
      initialData &&
      cityFromQuery.toLowerCase() === initialData.name.trim().toLowerCase()
    ) {
      // SSR already matched — save + toast without a second OpenWeather fetch.
      addSavedCity(initialData.name);
      const key = `ok:${initialData.name}`;
      if (lastToastedCityKey.current !== key) {
        lastToastedCityKey.current = key;
        toastSuccess({
          title: "City found",
          description: `Showing weather for ${initialData.name}.`,
        });
      }
      return;
    }
    void searchWeather(cityFromQuery);
  }, [searchParams, searchWeather, initialData, toastSuccess, addSavedCity]);

  /* ── fetch callbacks (AI + geo APIs; streaming readers mirror route Content-Type) ── */

  const fetchSummary = useCallback(async () => {
    if (state.status !== "ready") return;
    setSummaryLoading(true);
    setSummary(null);
    setSummaryError(null);
    setSummaryStreaming(false);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: state.data.name,
          weather: {
            temp: state.data.main.temp,
            humidity: state.data.main.humidity,
            wind: msToKmh(state.data.wind.speed),
            main: state.data.weather[0]?.main ?? "",
            description: state.data.weather[0]?.description ?? "",
          },
        }),
      });
      if (!res.ok) {
        const msg = await readApiError(res, "Weather summary unavailable.");
        setSummaryError(msg);
        toastError({
          title: "Weather summary unavailable",
          description: msg,
        });
        return;
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("text/plain") && res.body) {
        // Show empty panel + cursor immediately so growth is visible as chunks arrive.
        setSummary("");
        setSummaryStreaming(true);
        await readPlainTextStream(res, setSummary);
        setSummaryStreaming(false);
      } else {
        const data = (await res.json()) as { text: string };
        setSummary(data.text);
      }
      toastSuccess({
        title: "Weather summary ready",
        description: `AI briefing for ${state.data.name}.`,
      });
    } catch {
      setSummaryError("Weather summary unavailable.");
      toastError({
        title: "Weather summary unavailable",
        description: "Something went wrong. Try again.",
      });
    } finally {
      setSummaryLoading(false);
      setSummaryStreaming(false);
    }
  }, [state, toastSuccess, toastError]);

  const fetchTips = useCallback(async () => {
    if (state.status !== "ready") return;
    setTipsLoading(true);
    setTips(null);
    setTipsError(null);
    setTipsStreaming(false);
    try {
      const res = await fetch("/api/ai/farming-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: state.data.name,
          weather: {
            temp: state.data.main.temp,
            humidity: state.data.main.humidity,
            wind: msToKmh(state.data.wind.speed),
            main: state.data.weather[0]?.main ?? "",
            description: state.data.weather[0]?.description ?? "",
            pressure: state.data.main.pressure,
            visibility: state.data.visibility,
          },
          airQuality: air?.list[0]
            ? {
                aqi: air.list[0].main.aqi,
                pm2_5: air.list[0].components.pm2_5,
                pm10: air.list[0].components.pm10,
                o3: air.list[0].components.o3,
                no2: air.list[0].components.no2,
                so2: air.list[0].components.so2,
                co: air.list[0].components.co,
              }
            : null,
          forecast: forecast?.list
            ? forecast.list.slice(0, 5).map((f) => ({
                date: f.dt_txt,
                temp: Math.round(f.main.temp),
                humidity: f.main.humidity,
                description: f.weather[0]?.description ?? "",
              }))
            : null,
          geo: state.data.coord
            ? {
                country: state.data.sys?.country,
                lat: state.data.coord.lat,
                lon: state.data.coord.lon,
              }
            : null,
        }),
      });
      if (!res.ok) {
        const msg = await readApiError(res, "Farming tips unavailable.");
        setTipsError(msg);
        toastError({
          title: "Farming tips unavailable",
          description: msg,
        });
        return;
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("text/plain") && res.body) {
        setTips("");
        setTipsStreaming(true);
        await readPlainTextStream(res, setTips);
        setTipsStreaming(false);
      } else {
        const data = (await res.json()) as { text: string };
        setTips(data.text);
      }
      toastSuccess({
        title: "Farming tips ready",
        description: `AI advice for ${state.data.name}.`,
      });
    } catch {
      setTipsError("Farming tips unavailable.");
      toastError({
        title: "Farming tips unavailable",
        description: "Something went wrong. Try again.",
      });
    } finally {
      setTipsLoading(false);
      setTipsStreaming(false);
    }
  }, [state, air, forecast, toastSuccess, toastError]);

  const handleTTS = useCallback(async () => {
    if (ttsPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTtsPlaying(false);
      return;
    }
    const text = [summary, tips].filter(Boolean).join("\n\n");
    if (!text) return;
    setTtsLoading(true);
    setTtsError(null);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const msg = await readApiError(res, "Voice reader unavailable.");
        setTtsError(msg);
        toastError({
          title: "Voice reader unavailable",
          description: msg,
        });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setTtsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTtsPlaying(false);
        URL.revokeObjectURL(url);
        setTtsError("Voice reader unavailable.");
        toastError({
          title: "Voice reader unavailable",
          description: "Could not play audio.",
        });
      };
      await audio.play();
      setTtsPlaying(true);
      toastSuccess({
        title: "Playing AI voice",
        description: "Listening to your weather and farming insights.",
      });
    } catch {
      setTtsError("Voice reader unavailable.");
      toastError({
        title: "Voice reader unavailable",
        description: "Something went wrong. Try again.",
      });
    } finally {
      setTtsLoading(false);
    }
  }, [summary, tips, ttsPlaying, toastSuccess, toastError]);
  const fetchForecast = useCallback(async () => {
    if (lat == null || lon == null) return;
    setForecastLoading(true);
    setForecastError(null);
    try {
      const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        setForecastError(await readApiError(res, "Forecast unavailable."));
        return;
      }
      const data = (await res.json()) as ForecastResponse;
      setForecast(data);
    } catch {
      setForecastError("Forecast unavailable.");
    } finally {
      setForecastLoading(false);
    }
  }, [lat, lon]);

  const fetchAir = useCallback(async () => {
    if (lat == null || lon == null) return;
    setAirLoading(true);
    setAirError(null);
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        setAir(null);
        setAirError(await readApiError(res, "Air quality unavailable."));
        return;
      }
      const data = (await res.json()) as AirPollutionResponse;
      setAir(data);
    } catch {
      setAir(null);
      setAirError("Air quality unavailable.");
    } finally {
      setAirLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (state.status !== "ready" || lat == null || lon == null) return;
    const timer = window.setTimeout(() => {
      void fetchForecast();
      void fetchAir();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state.status, lat, lon, fetchForecast, fetchAir]);

  useEffect(() => {
    const tick = () => setClockMs(Date.now());
    const timer = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  const cityKeyForAi =
    state.status === "ready"
      ? `${state.data.name}|${state.data.sys?.country ?? ""}`
      : null;
  // Clear AI panels when leaving ready or switching city (adjust during render).
  if (cityKeyForAi !== lastAiCityKey) {
    if (lastAiCityKey != null) {
      setSummary(null);
      setTips(null);
      setSummaryError(null);
      setTipsError(null);
      setTtsError(null);
    }
    setLastAiCityKey(cityKeyForAi);
  }

  /* ── derived UI state (icons, local clock from OpenWeather timezone offset) ── */

  const weatherKind =
    state.status === "ready"
      ? (state.data.weather[0]?.main ?? "Clear")
      : "Clear";
  const weatherIconCode =
    state.status === "ready"
      ? (state.data.weather[0] as { icon?: string } | undefined)?.icon
      : null;
  const weatherImage = WEATHER_IMAGES[weatherKind] ?? WEATHER_IMAGES.Clear;
  const weatherIconSrc = weatherIconCode
    ? `https://openweathermap.org/img/wn/${weatherIconCode}@4x.png`
    : weatherImage;
  const weatherGif = WEATHER_GIFS[weatherKind] ?? WEATHER_GIFS.Clear;

  const localNow =
    clockMs == null
      ? null
      : state.status === "ready"
        ? new Date(clockMs + state.data.timezone * 1000)
        : new Date(clockMs);
  const localDate = localNow ? formatDate(localNow) : "—";
  const localTime = localNow ? formatTime(localNow) : "—";

  const aqiData = useMemo(() => {
    const aqi = air?.list[0]?.main.aqi;
    if (!aqi) return null;
    return AQI_CONFIG[aqi] ?? null;
  }, [air]);

  /* ── render ── */

  return (
    <div className="relative min-h-screen w-full py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-9xl flex-col gap-6">
        {state.status === "loading" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardSkeleton />
          </motion.div>
        ) : state.notFound ? (
          <Card className="p-6 text-center">
            <p className="text-lg text-white">{state.message}</p>
            <div className="cta-shine-wrap mt-4 rounded-lg">
              <RippleButton
                type="button"
                onClick={() => {
                  router.replace(
                    `/?city=${encodeURIComponent(DEFAULT_CITY)}`,
                  );
                }}
                className="cta-shine-button rounded-lg bg-slate-700 px-4 py-2 text-sm"
              >
                Load default city
              </RippleButton>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* ═══════ LOCATION HEADER ═══════ */}
            <motion.div variants={stagger.item}>
              <Card className="relative overflow-hidden p-5 sm:p-6 bg-gray-900/30">
                {/* GIF overlay */}
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

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white/90" />
                    <h1 className="font-display text-2xl text-white sm:text-3xl">
                      {state.data.name}
                    </h1>
                    {state.data.sys?.country && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white">
                        {state.data.sys.country}
                      </span>
                    )}
                  </div>
                  <p className="text-sm capitalize text-white/90">
                    {state.data.weather[0]?.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
                    <span
                      className="inline-flex items-center gap-1"
                      suppressHydrationWarning
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      {localTime}, {localDate}
                    </span>
                    {state.data.main.feels_like != null && (
                      <span className="inline-flex items-center gap-1">
                        <ThermometerSun className="h-3.5 w-3.5" />
                        Feels {Math.round(state.data.main.feels_like)}°
                      </span>
                    )}
                    {state.data.main.pressure != null && (
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        {state.data.main.pressure} hPa
                      </span>
                    )}
                    {state.data.visibility != null && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {(state.data.visibility / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ═══════ 4-CARD WEATHER GRID ═══════ */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Weather Status + GIF */}
              <motion.div variants={stagger.item}>
                <Card className="relative overflow-hidden p-5 bg-gray-900/30 h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={weatherGif}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.22 }}
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
                  <div className="relative z-10 flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-white">
                      Weather Status
                    </p>
                    <div className="relative">
                      <SafeImage
                        src={weatherIconSrc}
                        alt={weatherKind}
                        width={80}
                        height={80}
                        priority
                        className="transform-gpu drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                      />
                      {weatherKind === "Clear" && (
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            animation: "sun-pulse 3s ease-in-out infinite",
                          }}
                        />
                      )}
                    </div>
                    <p className="text-md font-semibold capitalize text-white">
                      {state.data.weather[0]?.description}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Card 2: Temperature */}
              <motion.div variants={stagger.item}>
                <Card className="p-5 bg-gray-900/30 h-full">
                  <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-white">
                    <Thermometer className="h-3.5 w-3.5" />
                    Temperature
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {Math.round(state.data.main.temp)}°
                  </p>
                  <div className="mt-3 space-y-1">
                    {state.data.main.feels_like != null && (
                      <p className="text-sm text-white/90">
                        Feels like {Math.round(state.data.main.feels_like)}°
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-white/90">
                      {state.data.main.temp_min != null && (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowDown className="h-3 w-3 text-sky-300" />
                          {Math.round(state.data.main.temp_min)}°
                        </span>
                      )}
                      {state.data.main.temp_max != null && (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowUp className="h-3 w-3 text-orange-300" />
                          {Math.round(state.data.main.temp_max)}°
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Card 3: Humidity */}
              <motion.div variants={stagger.item}>
                <Card className="p-5 bg-gray-900/30 h-full">
                  <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-white">
                    <Droplets className="h-3.5 w-3.5" />
                    Humidity
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {state.data.main.humidity}%
                  </p>
                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${state.data.main.humidity}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/90">
                      {state.data.main.humidity < 30
                        ? "Low"
                        : state.data.main.humidity < 60
                          ? "Comfortable"
                          : "High"}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Card 4: Wind */}
              <motion.div variants={stagger.item}>
                <Card className="p-5 bg-gray-900/30 h-full">
                  <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-white">
                    <Wind className="h-3.5 w-3.5" />
                    Wind
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {msToKmh(state.data.wind.speed)}{" "}
                    <span className="text-lg font-normal text-white/90">
                      km/h
                    </span>
                  </p>
                  {state.data.wind.deg != null && (
                    <div className="mt-3 flex items-center gap-2">
                      <Compass
                        className="h-5 w-5 text-white"
                        style={{
                          transform: `rotate(${state.data.wind.deg}deg)`,
                        }}
                      />
                      <p className="text-sm text-white/90">
                        {degToCompass(state.data.wind.deg)} (
                        {state.data.wind.deg}°)
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* ═══════ WEATHER DETAILS GRID ═══════ */}
            <motion.div variants={stagger.item}>
              <Card className="p-5 sm:p-6 bg-gray-900/30">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
                  <Globe className="h-5 w-5" />
                  Weather Details
                </h2>
                <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-4">
                  {state.data.sys?.sunrise != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Sunrise className="h-3.5 w-3.5 text-amber-300" />
                        Sunrise
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatUnixTime(
                          state.data.sys.sunrise,
                          state.data.timezone,
                        )}
                      </p>
                    </div>
                  )}
                  {state.data.sys?.sunset != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Sunset className="h-3.5 w-3.5 text-orange-300" />
                        Sunset
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatUnixTime(
                          state.data.sys.sunset,
                          state.data.timezone,
                        )}
                      </p>
                    </div>
                  )}
                  {state.data.clouds?.all != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Cloud className="h-3.5 w-3.5" />
                        Cloudiness
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {state.data.clouds.all}%
                      </p>
                    </div>
                  )}
                  {state.data.main.pressure != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Gauge className="h-3.5 w-3.5" />
                        Pressure
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {state.data.main.pressure}{" "}
                        <span className="text-xs font-normal text-white">
                          hPa
                        </span>
                      </p>
                    </div>
                  )}
                  {state.data.visibility != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Eye className="h-3.5 w-3.5" />
                        Visibility
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {(state.data.visibility / 1000).toFixed(1)}{" "}
                        <span className="text-xs font-normal text-white">
                          km
                        </span>
                      </p>
                    </div>
                  )}
                  {state.data.main.feels_like != null && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <ThermometerSun className="h-3.5 w-3.5" />
                        Feels Like
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {Math.round(state.data.main.feels_like)}°
                      </p>
                    </div>
                  )}
                  {state.data.sys?.country && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <Flag className="h-3.5 w-3.5" />
                        Country
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {state.data.sys.country}
                      </p>
                    </div>
                  )}
                  {state.data.coord && (
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                      <p className="inline-flex items-center gap-1 text-xs text-white">
                        <MapPin className="h-3.5 w-3.5" />
                        Coordinates
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {state.data.coord.lat.toFixed(2)}°,{" "}
                        {state.data.coord.lon.toFixed(2)}°
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* ═══════ AI INSIGHTS ═══════ */}
            <motion.div variants={stagger.item}>
              <Card className="p-5 sm:p-6 bg-gray-900/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    AI Insights
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="cta-shine-wrap rounded-lg">
                      <RippleButton
                        type="button"
                        onClick={() => void fetchSummary()}
                        disabled={summaryLoading}
                        className="cta-shine-button rounded-lg border border-sky-300/50 bg-gradient-to-r from-sky-500/35 via-sky-500/20 to-sky-500/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(2,132,199,0.3)] backdrop-blur-sm transition hover:border-sky-200/60 hover:from-sky-500/45 hover:via-sky-500/25 hover:to-sky-500/15"
                      >
                        {summaryLoading ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <CloudCog className="h-4 w-4 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {summaryLoading
                            ? "Generating Summary..."
                            : "AI Weather Summary"}
                        </span>
                      </RippleButton>
                    </div>
                    <div className="cta-shine-wrap rounded-lg">
                      <RippleButton
                        type="button"
                        onClick={() => void fetchTips()}
                        disabled={tipsLoading}
                        className="cta-shine-button rounded-lg border border-emerald-300/50 bg-gradient-to-r from-emerald-500/35 via-emerald-500/20 to-emerald-500/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)] backdrop-blur-sm transition hover:border-emerald-200/60 hover:from-emerald-500/45 hover:via-emerald-500/25 hover:to-emerald-500/15"
                      >
                        {tipsLoading ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <Leaf className="h-4 w-4 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {tipsLoading
                            ? "Generating Tips..."
                            : "AI Farming Tips"}
                        </span>
                      </RippleButton>
                    </div>
                    <div className="cta-shine-wrap rounded-lg">
                      <RippleButton
                        type="button"
                        onClick={() => void handleTTS()}
                        disabled={ttsLoading || (!summary && !tips)}
                        className="cta-shine-button rounded-lg border border-violet-300/50 bg-gradient-to-r from-violet-500/35 via-violet-500/20 to-violet-500/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] backdrop-blur-sm transition hover:border-violet-200/60 hover:from-violet-500/45 hover:via-violet-500/25 hover:to-violet-500/15"
                      >
                        {ttsLoading ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : ttsPlaying ? (
                          <VolumeX className="h-4 w-4 shrink-0" />
                        ) : (
                          <Volume2 className="h-4 w-4 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {ttsLoading
                            ? "Loading Audio..."
                            : ttsPlaying
                              ? "Stop Reading"
                              : "AI Voice Reader"}
                        </span>
                      </RippleButton>
                    </div>
                  </div>
                </div>
                {summaryError && (
                  <p className="mt-3 rounded-xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm text-white/90">
                    {summaryError}
                  </p>
                )}
                {tipsError && (
                  <p className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-white/90">
                    {tipsError}
                  </p>
                )}
                {ttsError && (
                  <p className="mt-3 rounded-xl border border-violet-300/20 bg-violet-500/10 p-3 text-sm text-white/90">
                    {ttsError}
                  </p>
                )}
                {!summary && !tips && !summaryLoading && !tipsLoading && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <p className="inline-flex items-start gap-2 rounded-xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm text-white/90">
                      <CloudCog className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" />
                      Click{" "}
                      <span className="font-semibold text-white">
                        AI Weather Summary
                      </span>{" "}
                      for a quick weather briefing.
                    </p>
                    <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-white/90">
                      <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                      Click{" "}
                      <span className="font-semibold text-white">
                        AI Farming Tips
                      </span>{" "}
                      for crop-friendly guidance.
                    </p>
                    <p className="inline-flex items-start gap-2 rounded-xl border border-violet-300/20 bg-violet-500/10 p-3 text-sm text-white/90">
                      <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" />
                      Click{" "}
                      <span className="font-semibold text-white">
                        AI Voice Reader
                      </span>{" "}
                      to listen to AI insights aloud.
                    </p>
                  </div>
                )}
                <AnimatePresence>
                  {summary !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Natural height — no height:0/overflow clip so streamed text can grow. */}
                      <div className="mt-3 rounded-xl border border-sky-300/20 bg-sky-500/10 p-4 text-sm leading-relaxed text-white/90">
                        {summary
                          ? renderAiText(summary, summaryStreaming)
                          : summaryStreaming
                            ? renderAiText("", true)
                            : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {tips !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm leading-relaxed text-white/90">
                        {tips
                          ? renderAiText(tips, tipsStreaming)
                          : tipsStreaming
                            ? renderAiText("", true)
                            : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* ═══════ FORECAST + AIR QUALITY (2-col) ═══════ */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 5-Day Forecast */}
              <motion.div variants={stagger.item}>
                <Card className="flex h-full flex-col p-5 sm:p-6 bg-gray-900/30">
                  <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
                    <CloudRain className="h-5 w-5" />
                    5-Day Forecast
                  </h2>
                  {forecastLoading && !forecast ? (
                    <div className="mt-3 space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/10 p-3"
                        >
                          <Skeleton className="h-4 w-24" />
                          <div className="mt-2 flex items-center gap-3">
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : forecastError ? (
                    <p className="mt-3 text-sm text-white">{forecastError}</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {groupForecastByDay(forecast?.list ?? []).map((item) => {
                        const itemWeatherKind =
                          item.weather[0]?.main ?? "Clear";
                        const itemWeatherIconCode = item.weather[0]?.icon;
                        const itemImage =
                          WEATHER_IMAGES[itemWeatherKind] ??
                          WEATHER_IMAGES.Clear;
                        const itemIconSrc = itemWeatherIconCode
                          ? `https://openweathermap.org/img/wn/${itemWeatherIconCode}@2x.png`
                          : itemImage;
                        return (
                          <motion.div
                            key={item.dt}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <SafeImage
                                src={itemIconSrc}
                                alt={itemWeatherKind}
                                width={36}
                                height={36}
                                className="shrink-0 drop-shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white/90">
                                  {formatDateUtc(new Date(item.dt * 1000))}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/90">
                                  <span className="inline-flex items-center gap-1">
                                    <Thermometer className="h-3.5 w-3.5" />
                                    {Math.round(item.main.temp)}°
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-white/90">
                                    <ThermometerSun className="h-3.5 w-3.5" />
                                    {Math.round(item.main.feels_like)}°
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Droplets className="h-3.5 w-3.5" />
                                    {item.main.humidity}%
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Wind className="h-3.5 w-3.5" />
                                    {msToKmh(item.wind.speed)} km/h
                                  </span>
                                  <span className="inline-flex items-center gap-1 capitalize">
                                    <Cloud className="h-3.5 w-3.5" />
                                    {item.weather[0]?.description}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Air Quality */}
              <motion.div variants={stagger.item}>
                <Card className="p-5 sm:p-6 bg-gray-900/30 h-full">
                  <div className="flex items-center gap-3">
                    <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
                      <Gauge className="h-5 w-5" />
                      Air Quality
                    </h2>
                    {aqiData && air?.list[0] && (
                      <span
                        className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${aqiData.bg} ${aqiData.color}`}
                      >
                        {aqiData.label}
                      </span>
                    )}
                  </div>
                  {airLoading && !air ? (
                    <div className="mt-3 grid gap-3 grid-cols-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-white/10 p-3"
                        >
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="mt-2 h-5 w-14" />
                        </div>
                      ))}
                    </div>
                  ) : air?.list[0] ? (
                    <>
                      <div className="mt-3 grid gap-3 grid-cols-3">
                        {/* AQI */}
                        <div
                          className={`rounded-xl border p-3 ${aqiData?.bg ?? "border-white/15 bg-white/5"}`}
                        >
                          <p className="text-xs text-white">AQI</p>
                          <p
                            className={`text-xl font-bold ${aqiData?.color ?? "text-white"}`}
                          >
                            {air.list[0].main.aqi}
                          </p>
                        </div>
                        {/* Pollutants */}
                        {(
                          [
                            ["PM2.5", air.list[0].components.pm2_5],
                            ["PM10", air.list[0].components.pm10],
                            ["O\u2083", air.list[0].components.o3],
                            ["NO\u2082", air.list[0].components.no2],
                            ["SO\u2082", air.list[0].components.so2],
                            ["CO", air.list[0].components.co],
                            ["NO", air.list[0].components.no],
                            ["NH\u2083", air.list[0].components.nh3],
                          ] as [string, number][]
                        ).map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-white/15 bg-white/5 p-3"
                          >
                            <p className="text-xs text-white">{label}</p>
                            <p className="text-lg font-semibold text-white">
                              {value.toFixed(1)}
                            </p>
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400"
                                style={{
                                  width: `${Math.min((value / 100) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-3">
                        <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-[11px] leading-5 text-white/90">
                          <p className="inline-flex items-center gap-1.5 font-medium text-white/90">
                            <Info className="h-3.5 w-3.5 text-sky-200" />
                            AQI quick guide
                          </p>
                          <p className="mt-1">
                            AQI is overall air health (1 Good to 5 Very Poor).
                            PM2.5 and PM10 are dust particles; O3 ozone; NO2
                            traffic gas; SO2 sulfur gas; CO combustion gas; NO
                            and NH3 reactive gases. Lower is better.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : airError ? (
                    <p className="mt-3 text-sm text-white">{airError}</p>
                  ) : (
                    <p className="mt-3 text-sm text-white">
                      No air quality data available yet.
                    </p>
                  )}
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
