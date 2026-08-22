import { resolveCityGeocodingContext } from "@/lib/cityGeocodingContext";

export const runtime = "nodejs";

function formatBounds(bounds) {
  return [bounds.west, bounds.south, bounds.east, bounds.north].join(",");
}

function normalizeSuggestionKey(item) {
  return String(item.address || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cityLocalityScore(item, context) {
  const city = normalizeSuggestionKey({ address: context?.city });
  if (!city) return 0;
  const segments = [item.secondary, item.address]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => normalizeSuggestionKey({ address: value }))
    .filter(Boolean);
  if (segments.includes(city)) return 2;
  if (segments.some((segment) => segment.startsWith(`${city} `))) return 1;
  return 0;
}

function mergeSuggestions(primary, secondary, context) {
  const seen = new Set();
  return [...primary, ...secondary]
    .map((item, index) => ({ item, index, localityScore: cityLocalityScore(item, context) }))
    .sort((first, second) => second.localityScore - first.localityScore || first.index - second.index)
    .map(({ item }) => item)
    .filter((item) => {
      const key = normalizeSuggestionKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

async function searchGeocodingV6({ accessToken, context, query }) {
  const contextualQuery = [query, context.city, context.country].filter(Boolean).join(", ");
  const params = new URLSearchParams({
    access_token: accessToken,
    autocomplete: "true",
    bbox: formatBounds(context.bounds),
    language: "en",
    limit: "8",
    proximity: context.center.join(","),
    q: contextualQuery,
    types: "address,street",
  });
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload?.features || []).map((feature) => {
    const properties = feature?.properties || {};
    const lng = Number(feature?.geometry?.coordinates?.[0]);
    const lat = Number(feature?.geometry?.coordinates?.[1]);
    return {
      address: properties.full_address || [properties.name, properties.place_formatted].filter(Boolean).join(", "),
      featureType: properties.feature_type || "",
      id: feature.id,
      lat,
      lng,
      name: properties.name || "",
      provider: "mapbox-geocoding-v6",
      secondary: properties.place_formatted || properties.full_address || "",
    };
  }).filter((item) => item.id && item.address && Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("q") || "").trim();
  const sessionToken = String(searchParams.get("sessionToken") || "").trim();
  const context = resolveCityGeocodingContext(searchParams.get("city"));
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";

  if (query.length < 3 || !sessionToken || !context.city || !context.center || !accessToken) {
    return Response.json({ suggestions: [] });
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    language: "en",
    limit: "8",
    proximity: context.center.join(","),
    q: query,
    session_token: sessionToken,
    types: "poi,address,street",
  });
  if (context.bounds) {
    params.set("bbox", formatBounds(context.bounds));
  }

  try {
    const [searchboxResponse, geocodingSuggestions] = await Promise.all([
      fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params}`, {
        cache: "no-store",
      }),
      context.bounds ? searchGeocodingV6({ accessToken, context, query }) : Promise.resolve([]),
    ]);
    const payload = searchboxResponse.ok ? await searchboxResponse.json() : { suggestions: [] };
    const searchboxSuggestions = (payload?.suggestions || []).map((item) => ({
      address: item.full_address || [item.name, item.place_formatted].filter(Boolean).join(", "),
      featureType: item.feature_type || "",
      id: item.mapbox_id,
      name: item.name || "",
      provider: "mapbox-searchbox",
      secondary: item.place_formatted || item.full_address || "",
    })).filter((item) => item.id && item.address);
    const addressLikeQuery = /\d/.test(query);
    const suggestions = addressLikeQuery
      ? mergeSuggestions(geocodingSuggestions, searchboxSuggestions, context)
      : mergeSuggestions(searchboxSuggestions, geocodingSuggestions, context);
    return Response.json({ suggestions });
  } catch (error) {
    console.error("[api/geocode/suggest] failed", { error: String(error) });
    return Response.json({ error: "Address suggestions are temporarily unavailable." }, { status: 502 });
  }
}
