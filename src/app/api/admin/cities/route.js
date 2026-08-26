import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cityCoreConfig } from "@/lib/cityCore";
import { normalizeRegistrySlug } from "@/lib/cityRegistryShared";
import { getSupportedTimeZones, isValidTimeZone } from "@/lib/timeZones";
import {
  getTelemetryServiceClient,
  hasAuthorizedSeoAdminRequest,
} from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

const GUIDE_TITLES = ["About", "Districts", "Safety", "Nightlife", "Cost"];

function failure(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function distanceKm(left, right) {
  const toRadians = (value) => Number(value) * Math.PI / 180;
  const lat1 = toRadians(left[1]);
  const lat2 = toRadians(right[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(right[0] - left[0]);
  const value = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function normalizeGuideItems(value) {
  const rows = Array.isArray(value) ? value : [];
  return GUIDE_TITLES.map((title) => {
    const match = rows.find((row) => String(row?.title || "").toLowerCase() === title.toLowerCase());
    return { title, text: String(match?.text || "").trim(), extra: String(match?.extra || "").trim() };
  });
}

function normalizeGuideSources(value) {
  return (Array.isArray(value) ? value : []).map((source) => ({
    label: String(source?.label || "").trim(),
    url: String(source?.url || "").trim(),
  })).filter((source) => source.label && /^https:\/\//i.test(source.url)).slice(0, 5);
}

function validateGuide(guideItems, guideSources, checkedAt) {
  const incomplete = guideItems.find((item) => item.text.length < 80);
  if (incomplete) return `${incomplete.title} must contain at least 80 characters.`;
  if (guideSources.length < 2) return "Add at least two labelled HTTPS sources for the Essential guide.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) return "Add the date when the Essential guide was checked.";
  return "";
}

export async function GET(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) return failure("Admin access required.", 403);
  const client = getTelemetryServiceClient();
  const [{ data: cities, error: cityError }, { data: qariProfiles, error: qariError }] = await Promise.all([
    client.from("qa_cities").select("*").order("created_at", { ascending: false }),
    client
      .from("qa_qari_profiles")
      .select("destination_key,country,qari_score,confidence,summary,reviewed_at")
      .eq("scope_type", "country")
      .eq("is_published", true)
      .order("country"),
  ]);
  if (cityError) return failure(cityError.message, 500);
  if (qariError) return failure(qariError.message, 500);
  return NextResponse.json({
    cities: cities || [],
    qariProfiles: qariProfiles || [],
    timezones: getSupportedTimeZones(),
  });
}

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) return failure("Admin access required.", 403);
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid request body.");

  const name = String(body.name || "").trim();
  const slug = normalizeRegistrySlug(body.slug || name);
  const country = String(body.country || "").trim();
  const countryCode = String(body.countryCode || "").trim().toUpperCase();
  const timezone = String(body.timezone || "").trim();
  const vibe = String(body.vibe || "").trim();
  const localMood = String(body.localMood || "").trim();
  const queerStatus = String(body.queerStatus || "").trim();
  const crowd = String(body.crowd || "").trim();
  const introduction = String(body.introduction || "").trim();
  const guideItems = normalizeGuideItems(body.guideItems);
  const guideSources = normalizeGuideSources(body.guideSources);
  const guideCheckedAt = String(body.guideCheckedAt || "").trim();
  const safetyContext = String(body.safetyContext || "").trim();
  const qariDestinationKey = String(body.qariDestinationKey || "").trim();

  if (name.length < 2 || !slug || country.length < 2) return failure("City, country and URL slug are required.");
  const requestedPoint = [Number(body.longitude), Number(body.latitude)];
  const existingStaticCity = Object.entries(cityCoreConfig).find(([key, config]) => {
    if (key === slug) return true;
    if (!Array.isArray(config?.center) || String(config?.country || "").toLowerCase() !== country.toLowerCase()) return false;
    return distanceKm(config.center, requestedPoint) < 25;
  });
  if (existingStaticCity) return failure(`${existingStaticCity[1].title || "This city"} already exists in the Atlas.`, 409);
  if (!/^[A-Z]{2}$/.test(countryCode)) return failure("A valid two-letter country code is required.");
  if (!validCoordinate(body.latitude, -90, 90) || !validCoordinate(body.longitude, -180, 180)) {
    return failure("Valid city coordinates are required.");
  }
  if (body.mapConfirmed !== true) return failure("Confirm the city point on the map before saving.");
  if (!isValidTimeZone(timezone)) return failure("Choose a valid timezone from the list.");
  if (vibe.length < 3) return failure("Add a short city vibe.");
  if (localMood.length < 30) return failure("Local mood must contain at least 30 characters.");
  if (queerStatus.length < 30) return failure("Queer status must contain at least 30 characters.");
  if (crowd.length < 30) return failure("Crowd must contain at least 30 characters.");
  if (introduction.length < 120) return failure("The introduction must contain at least 120 characters.");
  const guideError = validateGuide(guideItems, guideSources, guideCheckedAt);
  if (guideError) return failure(guideError);
  if (safetyContext.length < 80) return failure("The city safety context must contain at least 80 characters.");

  const client = getTelemetryServiceClient();
  const { data: qari, error: qariError } = await client
    .from("qa_qari_profiles")
    .select("destination_key,country,qari_score,confidence,summary")
    .eq("destination_key", qariDestinationKey)
    .eq("scope_type", "country")
    .eq("is_published", true)
    .maybeSingle();
  if (qariError) return failure(qariError.message, 500);
  if (!qari || qari.country.toLowerCase() !== country.toLowerCase()) {
    return failure("Choose the published QARI profile matching the selected country.");
  }

  const { data, error } = await client
    .from("qa_cities")
    .insert({
      slug,
      name,
      title: `Queer ${name}`,
      country,
      country_code: countryCode,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      map_confirmed: true,
      timezone,
      vibe,
      local_mood: localMood,
      queer_status: queerStatus,
      crowd_profile: crowd,
      introduction,
      guide_items: guideItems,
      guide_sources: guideSources,
      guide_checked_at: guideCheckedAt,
      safety_context: safetyContext,
      qari_destination_key: qari.destination_key,
      qari_score: qari.qari_score,
      qari_summary: qari.summary,
      qari_confidence: qari.confidence,
      status: "published",
    })
    .select("*")
    .single();
  if (error) return failure(error.message, error.code === "23505" ? 409 : 500);

  await client.rpc("qa_refresh_city_seo_status", { target_slug: slug });
  revalidatePath(`/${slug}`);
  revalidatePath("/cities");
  revalidatePath("/sitemap-pages.xml");
  return NextResponse.json({ city: data }, { status: 201 });
}

export async function PATCH(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) return failure("Admin access required.", 403);
  const body = await request.json().catch(() => null);
  if (!body?.id) return failure("A city id is required.");

  const name = String(body.name || "").trim();
  const country = String(body.country || "").trim();
  const countryCode = String(body.countryCode || "").trim().toUpperCase();
  const timezone = String(body.timezone || "").trim();
  const vibe = String(body.vibe || "").trim();
  const localMood = String(body.localMood || "").trim();
  const queerStatus = String(body.queerStatus || "").trim();
  const crowd = String(body.crowd || "").trim();
  const introduction = String(body.introduction || "").trim();
  const guideItems = normalizeGuideItems(body.guideItems);
  const guideSources = normalizeGuideSources(body.guideSources);
  const guideCheckedAt = String(body.guideCheckedAt || "").trim();
  const safetyContext = String(body.safetyContext || "").trim();
  const qariDestinationKey = String(body.qariDestinationKey || "").trim();

  if (name.length < 2 || country.length < 2) return failure("City and country are required.");
  if (!/^[A-Z]{2}$/.test(countryCode)) return failure("A valid two-letter country code is required.");
  if (!validCoordinate(body.latitude, -90, 90) || !validCoordinate(body.longitude, -180, 180)) return failure("Valid city coordinates are required.");
  if (body.mapConfirmed !== true) return failure("Confirm the city point on the map before saving.");
  if (!isValidTimeZone(timezone)) return failure("Choose a valid timezone from the list.");
  if (vibe.length < 3) return failure("Add a short city vibe.");

  const client = getTelemetryServiceClient();
  const [{ data: existing, error: existingError }, { data: qari, error: qariError }] = await Promise.all([
    client.from("qa_cities").select("id,slug").eq("id", body.id).maybeSingle(),
    client
      .from("qa_qari_profiles")
      .select("destination_key,country,qari_score,confidence,summary")
      .eq("destination_key", qariDestinationKey)
      .eq("scope_type", "country")
      .eq("is_published", true)
      .maybeSingle(),
  ]);
  if (existingError) return failure(existingError.message, 500);
  if (!existing) return failure("City not found.", 404);
  if (qariError) return failure(qariError.message, 500);
  if (!qari || qari.country.toLowerCase() !== country.toLowerCase()) return failure("Choose the published QARI profile matching the selected country.");

  const { data, error } = await client
    .from("qa_cities")
    .update({
      name,
      title: `Queer ${name}`,
      country,
      country_code: countryCode,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      map_confirmed: true,
      timezone,
      vibe,
      local_mood: localMood || null,
      queer_status: queerStatus || null,
      crowd_profile: crowd || null,
      introduction,
      guide_items: guideItems,
      guide_sources: guideSources,
      guide_checked_at: guideCheckedAt || null,
      safety_context: safetyContext,
      qari_destination_key: qari.destination_key,
      qari_score: qari.qari_score,
      qari_summary: qari.summary,
      qari_confidence: qari.confidence,
    })
    .eq("id", body.id)
    .select("*")
    .single();
  if (error) return failure(error.message, 500);

  await client.rpc("qa_refresh_city_seo_status", { target_slug: existing.slug });
  revalidatePath(`/${existing.slug}`);
  revalidatePath("/cities");
  revalidatePath("/sitemap-pages.xml");
  return NextResponse.json({ city: data });
}
