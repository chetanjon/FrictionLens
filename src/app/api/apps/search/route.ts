import { NextRequest, NextResponse } from "next/server";
import { searchApps } from "@/lib/scrapers";

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("q");

  if (!term || term.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  try {
    const results = await searchApps(term.trim(), 5);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("App search failed:", err);
    return NextResponse.json(
      { error: "Failed to search app stores. Please try again." },
      { status: 500 }
    );
  }
}
