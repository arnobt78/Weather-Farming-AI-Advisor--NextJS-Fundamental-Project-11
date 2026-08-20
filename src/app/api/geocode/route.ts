/**
 * GET /api/geocode?city= — OpenWeather geocoding proxy
 *
 * Fallback when current-weather JSON has no `coord`. Same server-key rule as `/api/weather`.
 */
import { geocodeCity } from "@/lib/openweather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  if (!city) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }
  const data = await geocodeCity(city);
  if (!data) {
    return NextResponse.json({ error: "Geocode unavailable" }, { status: 502 });
  }
  return NextResponse.json(data);
}
