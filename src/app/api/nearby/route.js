import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  buildNearbyBounds,
  distanceKmBetween,
  isCurrentOrUpcomingEvent,
  NEARBY_RADIUS_KM,
  NEARBY_RESULT_LIMIT,
  toNearbyCoordinate,
} from "@/lib/nearby";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

function normalizeVenue(row = {}, origin) {
  const distanceKm = distanceKmBetween(origin, row);
  if (!Number.isFinite(distanceKm) || distanceKm > NEARBY_RADIUS_KM) return null;
  return {
    id: row.id,
    entityType: "venue",
    name: String(row.name || "").trim(),
    category: String(row.type || "Venue").trim(),
    city: String(row.city || "").trim(),
    location: String(row.location || "").trim(),
    hours: String(row.hours || "").trim(),
    lat: Number(row.lat),
    lng: Number(row.lng),
    distanceKm,
  };
}

function normalizeEvent(row = {}, origin) {
  const distanceKm = distanceKmBetween(origin, row);
  if (!Number.isFinite(distanceKm) || distanceKm > NEARBY_RADIUS_KM || !isCurrentOrUpcomingEvent(row)) return null;
  return {
    id: row.id,
    entityType: "event",
    name: String(row.name || "").trim(),
    category: "Event",
    city: String(row.city || "").trim(),
    location: String(row.location || "").trim(),
    date: row.date || null,
    startDate: row.start_date || row.date || null,
    endDate: row.end_date || row.date || null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    distanceKm,
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: PRIVATE_HEADERS });
  }

  const lat = toNearbyCoordinate(body?.lat, -90, 90);
  const lng = toNearbyCoordinate(body?.lng, -180, 180);
  const origin = lat === null || lng === null ? null : { lat, lng };
  const bounds = origin ? buildNearbyBounds(origin) : null;
  if (!origin || !bounds) {
    return NextResponse.json({ error: "Valid coordinates are required." }, { status: 400, headers: PRIVATE_HEADERS });
  }

  try {
    const venueRequest = supabase
      .from("places")
      .select("id, name, type, city, location, hours, lat, lng")
      .not("lat", "is", null)
      .not("lng", "is", null)
      .gte("lat", bounds.minLat)
      .lte("lat", bounds.maxLat)
      .gte("lng", bounds.minLng)
      .lte("lng", bounds.maxLng)
      .range(0, 999);
    const eventRequest = supabase
      .from("events")
      .select("id, name, city, location, date, start_date, end_date, lat, lng")
      .not("lat", "is", null)
      .not("lng", "is", null)
      .gte("lat", bounds.minLat)
      .lte("lat", bounds.maxLat)
      .gte("lng", bounds.minLng)
      .lte("lng", bounds.maxLng)
      .range(0, 999);

    const [venuesResponse, eventsResponse] = await Promise.all([venueRequest, eventRequest]);
    if (venuesResponse.error || eventsResponse.error) {
      throw venuesResponse.error || eventsResponse.error;
    }

    const results = [
      ...(venuesResponse.data || []).map((row) => normalizeVenue(row, origin)),
      ...(eventsResponse.data || []).map((row) => normalizeEvent(row, origin)),
    ]
      .filter((item) => item?.id && item.name && item.city)
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, NEARBY_RESULT_LIMIT);

    return NextResponse.json(
      { results, radiusKm: NEARBY_RADIUS_KM },
      { status: 200, headers: PRIVATE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Nearby places are temporarily unavailable." },
      { status: 503, headers: PRIVATE_HEADERS }
    );
  }
}
