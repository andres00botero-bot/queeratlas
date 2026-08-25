import { NextResponse } from "next/server";
import { hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const query = String(new URL(request.url).searchParams.get("q") || "").trim();
  if (query.length < 2) return NextResponse.json({ results: [] });
  const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  if (!token) return NextResponse.json({ error: "Mapbox token is not configured." }, { status: 503 });

  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("types", "place,locality");
  url.searchParams.set("limit", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "City search is temporarily unavailable." }, { status: 502 });
  const payload = await response.json();
  const results = (payload.features || []).map((feature) => {
    const context = feature.properties?.context || {};
    const coordinates = feature.geometry?.coordinates || [];
    return {
      id: feature.id,
      name: feature.properties?.name || feature.text || "",
      label: feature.properties?.full_address || feature.place_name || feature.properties?.name || "",
      country: context.country?.name || feature.properties?.context?.country?.name || "",
      countryCode: String(context.country?.country_code || "").toUpperCase(),
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1]),
    };
  }).filter((result) => result.name && result.country && Number.isFinite(result.latitude) && Number.isFinite(result.longitude));
  return NextResponse.json({ results });
}
