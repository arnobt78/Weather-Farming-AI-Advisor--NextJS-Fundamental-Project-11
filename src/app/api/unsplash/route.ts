import { searchUnsplash } from "@/lib/unsplash";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "weather";
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("page") ?? "1") || 1,
  );
  const result = await searchUnsplash(keyword, 9, page);
  return NextResponse.json(result);
}
