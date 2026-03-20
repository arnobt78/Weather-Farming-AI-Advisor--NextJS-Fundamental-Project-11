"use client";

import {
  CITY_COOKIE_KEY,
  DEFAULT_CITY,
  SAVED_CITIES_COOKIE_KEY,
} from "@/data/constants";
import type { WeatherApiSuccess } from "@/types/weather";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type WeatherContextValue = {
  city: string;
  setCity: (city: string) => void;
  lat: number | null;
  lon: number | null;
  setCoordinates: (lat: number, lon: number) => void;
  currentWeather: WeatherApiSuccess | null;
  setCurrentWeather: (data: WeatherApiSuccess | null) => void;
  weatherDescription: string;
  savedCities: string[];
  addSavedCity: (city: string) => void;
  removeSavedCity: (city: string) => void;
};

const STORAGE_KEY = "weather-live-city";
const STORAGE_LAT = "weather-live-lat";
const STORAGE_LON = "weather-live-lon";
const STORAGE_SAVED = "weather-live-saved-cities";
const MAX_SAVED = 10;

const WeatherContext = createContext<WeatherContextValue | null>(null);

function loadStored(): {
  city: string;
  lat: number | null;
  lon: number | null;
} {
  if (typeof window === "undefined") {
    return { city: DEFAULT_CITY, lat: null, lon: null };
  }
  try {
    const city = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CITY;
    const latS = localStorage.getItem(STORAGE_LAT);
    const lonS = localStorage.getItem(STORAGE_LON);
    const lat = latS != null ? Number(latS) : null;
    const lon = lonS != null ? Number(lonS) : null;
    return {
      city,
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
    };
  } catch {
    return { city: DEFAULT_CITY, lat: null, lon: null };
  }
}

type WeatherProviderProps = {
  children: ReactNode;
  initialCity?: string;
  initialSavedCities?: string[];
};

export function WeatherProvider({
  children,
  initialCity = DEFAULT_CITY,
  initialSavedCities = [],
}: WeatherProviderProps) {
  const [city, setCityState] = useState(initialCity);
  const [lat, setLat] = useState<number | null>(() => loadStored().lat);
  const [lon, setLon] = useState<number | null>(() => loadStored().lon);
  const [currentWeather, setCurrentWeather] =
    useState<WeatherApiSuccess | null>(null);
  const [savedCities, setSavedCities] = useState<string[]>(initialSavedCities);

  const setCity = useCallback((c: string) => {
    setCityState(c);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, c);
        document.cookie = `${CITY_COOKIE_KEY}=${encodeURIComponent(c)}; path=/; max-age=31536000; samesite=lax`;
      }
    } catch {
      /**/
    }
  }, []);

  const setCoordinates = useCallback((newLat: number, newLon: number) => {
    setLat(newLat);
    setLon(newLon);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_LAT, String(newLat));
        localStorage.setItem(STORAGE_LON, String(newLon));
      }
    } catch {
      /**/
    }
  }, []);

  const addSavedCity = useCallback((c: string) => {
    const trimmed = c.trim();
    if (!trimmed) return;
    setSavedCities((prev) => {
      const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(
        0,
        MAX_SAVED,
      );
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_SAVED, JSON.stringify(next));
          document.cookie = `${SAVED_CITIES_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=31536000; samesite=lax`;
        }
      } catch {
        /**/
      }
      return next;
    });
  }, []);

  const removeSavedCity = useCallback((c: string) => {
    setSavedCities((prev) => {
      const next = prev.filter((x) => x !== c);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_SAVED, JSON.stringify(next));
          document.cookie = `${SAVED_CITIES_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=31536000; samesite=lax`;
        }
      } catch {
        /**/
      }
      return next;
    });
  }, []);

  const value: WeatherContextValue = {
    city,
    setCity,
    lat,
    lon,
    setCoordinates,
    currentWeather,
    setCurrentWeather,
    weatherDescription: currentWeather?.weather[0]?.description ?? "",
    savedCities,
    addSavedCity,
    removeSavedCity,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error("useWeatherContext must be used within WeatherProvider");
  }
  return ctx;
}
