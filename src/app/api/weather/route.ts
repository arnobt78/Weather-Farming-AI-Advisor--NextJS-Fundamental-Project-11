/**
 * GET /api/weather?city= — OpenWeather current-weather proxy
 *
 * Keeps `OPENWEATHER_API_KEY` on the server. Client search (`useWeather`) calls this
 * instead of api.openweathermap.org so the key never ships in the browser bundle.
 * Empty city → 400; missing key / unknown city / upstream fail → 502.
 */
import { fetchWeatherByCity } from "@/lib/openweather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  if (!city) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }
  const data = await fetchWeatherByCity(city);
  if (!data) {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
  }
  return NextResponse.json(data);
}
