import { fetchAirPollution } from "@/lib/openweather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const latN = lat != null ? Number(lat) : NaN;
  const lonN = lon != null ? Number(lon) : NaN;
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }
  const data = await fetchAirPollution(latN, lonN);
  if (!data) return NextResponse.json({ error: "Air quality data unavailable" }, { status: 502 });
  return NextResponse.json(data);
}
