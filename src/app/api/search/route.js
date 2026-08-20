import { NextResponse } from "next/server";
import { runServerSearch } from "@/lib/server/searchEngine";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("q") || "").trim();
  const clientTimeZone = String(searchParams.get("tz") || "UTC").trim();
  const mode = searchParams.get("mode") === "suggestions" ? "suggestions" : "results";
  const requestedCity = String(searchParams.get("city") || "").trim().slice(0, 80);
  const requestedType = String(searchParams.get("type") || "all").trim().toLowerCase();

  if (!query) {
    return NextResponse.json(
      { results: { cities: [], places: [], events: [], services: [], guides: [], all: [] }, suggestions: [], meta: { engine: "server-v1", resultCount: 0 } },
      { status: 200, headers: { "Cache-Control": "private, max-age=0" } }
    );
  }

  try {
    const payload = await runServerSearch({ query, clientTimeZone, mode, requestedCity, requestedType });
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
