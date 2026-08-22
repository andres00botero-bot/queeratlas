import {
  isCoordinateInsideBounds,
  resolveCityGeocodingContext,
} from "@/lib/cityGeocodingContext";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mapboxId = String(searchParams.get("id") || "").trim();
  const sessionToken = String(searchParams.get("sessionToken") || "").trim();
  const context = resolveCityGeocodingContext(searchParams.get("city"));
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";

  if (!mapboxId || !sessionToken || !context.city || !context.bounds || !accessToken) {
    return Response.json({ error: "The selected address could not be verified." }, { status: 400 });
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    language: "en",
    session_token: sessionToken,
  });

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?${params}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      console.error("[api/geocode/retrieve] Mapbox request failed", { status: response.status });
      return Response.json({ error: "The selected address could not be retrieved." }, { status: 502 });
    }

    const payload = await response.json();
    const feature = payload?.features?.[0];
    const lng = Number(feature?.geometry?.coordinates?.[0]);
    const lat = Number(feature?.geometry?.coordinates?.[1]);
    if (!isCoordinateInsideBounds({ lat, lng }, context.bounds)) {
      return Response.json(
        { error: `The selected result is outside ${context.city}. Choose another result or place the pin manually.` },
        { status: 422 },
      );
    }

    const properties = feature?.properties || {};
    return Response.json({
      address: properties.full_address || [properties.name, properties.place_formatted].filter(Boolean).join(", "),
      label: properties.name || properties.full_address || "Selected location",
      lat,
      lng,
      mapboxId,
      source: "mapbox-searchbox",
    });
  } catch (error) {
    console.error("[api/geocode/retrieve] failed", { error: String(error) });
    return Response.json({ error: "The selected address could not be retrieved." }, { status: 502 });
  }
}
