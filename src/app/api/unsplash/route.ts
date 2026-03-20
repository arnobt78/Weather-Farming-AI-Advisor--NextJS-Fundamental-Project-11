import { searchUnsplash } from "@/lib/unsplash";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "weather";
  const photos = await searchUnsplash(keyword, 9);
  return NextResponse.json({ photos });
}
