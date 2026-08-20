"use client";

/**
 * useWeather — client hook for “search city → fetch → UI state”
 *
 * Walkthrough:
 * - Holds discriminated union state: loading | ready | error(message).
 * - `searchWeather` calls same-origin `GET /api/weather` (server holds OPENWEATHER_API_KEY).
 * - Default-city / SSR failure shows “Weather unavailable.” (no infinite skeleton).
 * - Other failed searches show “City not found.”
 * - `onSuccess` syncs context (city, coords, saved cities) from the parent — keeps hook focused on fetch state only.
 */
import { DEFAULT_CITY } from "@/data/constants";
import type { WeatherApiSuccess, WeatherState } from "@/types/weather";
import { useCallback, useState } from "react";

export type UseWeatherOptions = {
  onSuccess?: (data: WeatherApiSuccess, city: string) => void;
};

/** Same-origin proxy — never call api.openweathermap.org from the browser. */
async function fetchWeatherByCity(city: string): Promise<WeatherApiSuccess | null> {
  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) return null;
    return (await res.json()) as WeatherApiSuccess;
  } catch {
    return null;
  }
}

/**
 * Custom hook that manages weather fetch flow. Optional onSuccess runs when search succeeds.
 */
export function useWeather(
  initialData: WeatherApiSuccess | null,
  options?: UseWeatherOptions,
) {
  const onSuccess = options?.onSuccess;

  const [state, setState] = useState<WeatherState>(
    initialData
      ? { status: "ready", data: initialData, notFound: false }
      : {
          status: "error",
          data: null,
          notFound: true,
          message: "Weather unavailable.",
        },
  );

  const searchWeather = useCallback(
    async (city: string, showLoading = true) => {
      // Optional loading flag: e.g. background refetch can skip the full-screen skeleton.
      if (showLoading) {
        setState({ status: "loading", data: null, notFound: false });
      }
      const data = await fetchWeatherByCity(city);
      if (!data) {
        const message =
          city === DEFAULT_CITY ? "Weather unavailable." : "City not found.";
        setState({ status: "error", data: null, notFound: true, message });
        return;
      }
      setState({ status: "ready", data, notFound: false });
      onSuccess?.(data, city);
    },
    [onSuccess],
  );

  return {
    state,
    searchWeather,
  };
}
