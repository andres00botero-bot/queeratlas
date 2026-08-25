import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cityCoreConfig } from "@/lib/cityCore";
import { normalizeRegistrySlug } from "@/lib/cityRegistryShared";
import {
  getTelemetryServiceClient,
  hasAuthorizedSeoAdminRequest,
} from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

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
  return NextResponse.json({ cities: cities || [], qariProfiles: qariProfiles || [] });
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
  const introduction = String(body.introduction || "").trim();
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
  if (!/^[A-Za-z_+-]+\/[A-Za-z0-9_+\-/]+$/.test(timezone)) return failure("Use an IANA timezone such as Europe/Stockholm.");
  if (vibe.length < 3) return failure("Add a short city vibe.");
  if (introduction.length < 120) return failure("The introduction must contain at least 120 characters.");
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
      introduction,
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
