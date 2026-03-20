import type { AirPollutionResponse } from "@/types/air";
import type { GeoItem } from "@/types/geo";
import type { ForecastResponse } from "@/types/forecast";
import type { WeatherApiError, WeatherApiSuccess } from "@/types/weather";

const OPEN_WEATHER_BASE = "https://api.openweathermap.org";

function getApiKey(): string | undefined {
  return process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
}

function isWeatherSuccess(value: WeatherApiSuccess | WeatherApiError): value is WeatherApiSuccess {
  return typeof value.cod === "number" && value.cod === 200;
}

/**
 * Calls OpenWeather API using a city name and returns a typed result.
 */
export async function fetchWeatherByCity(city: string): Promise<WeatherApiSuccess | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const query = new URLSearchParams({
    q: city,
    units: "metric",
    appid: apiKey,
  });
  const response = await fetch(`${OPEN_WEATHER_BASE}/data/2.5/weather?${query.toString()}`, {
    cache: "no-store",
  });
  const json: WeatherApiSuccess | WeatherApiError = (await response.json()) as
    | WeatherApiSuccess
    | WeatherApiError;
  if (isWeatherSuccess(json)) return json;
  return null;
}

/**
 * Geocoding: get lat/lon from city name for forecast and AQI.
 */
export async function geocodeCity(city: string): Promise<GeoItem | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const query = new URLSearchParams({ q: city, limit: "1", appid: apiKey });
  const response = await fetch(`${OPEN_WEATHER_BASE}/geo/1.0/direct?${query.toString()}`, {
    cache: "no-store",
  });
  const list: GeoItem[] = (await response.json()) as GeoItem[];
  return list.length > 0 ? list[0] : null;
}

/**
 * 5-day forecast (3-hour steps) by lat/lon.
 */
export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    appid: apiKey,
  });
  const response = await fetch(`${OPEN_WEATHER_BASE}/data/2.5/forecast?${query.toString()}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as ForecastResponse & { cod?: number };
  if (data.cod !== "200" && data.cod !== 200) return null;
  return data as ForecastResponse;
}

/**
 * Current air pollution by lat/lon.
 */
export async function fetchAirPollution(
  lat: number,
  lon: number,
): Promise<AirPollutionResponse | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    appid: apiKey,
  });
  const response = await fetch(`${OPEN_WEATHER_BASE}/data/2.5/air_pollution?${query.toString()}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as AirPollutionResponse;
  return Array.isArray(data?.list) && data.list.length > 0 ? data : null;
}

