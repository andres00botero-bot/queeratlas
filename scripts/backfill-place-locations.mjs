import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal(cwd) {
  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function usage() {
  console.log(
    [
      "Usage:",
      "  npm run backfill:place-locations -- --dry-run",
      "  npm run backfill:place-locations -- --write",
      "",
      "Optional flags:",
      "  --city=amsterdam",
      "  --limit=50",
      "  --delay-ms=150",
    ].join("\n"),
  );
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reverseGeocode({ lat, lng, token }) {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?types=address,poi,neighborhood,locality,place` +
    `&limit=1&language=en&access_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Mapbox HTTP ${response.status}`);
  }
  const data = await response.json();
  const feature = Array.isArray(data?.features) ? data.features[0] : null;
  if (!feature) return null;

  const center = Array.isArray(feature.center) ? feature.center : null;
  const centerLng = Number(center?.[0]);
  const centerLat = Number(center?.[1]);
  const distanceKm =
    Number.isFinite(centerLat) && Number.isFinite(centerLng)
      ? haversineKm(lat, lng, centerLat, centerLng)
      : null;

  const text =
    String(feature?.place_name || "").trim() ||
    String(feature?.text || "").trim() ||
    null;

  if (!text) return null;
  return {
    text,
    distanceKm,
  };
}

async function main() {
  loadDotEnvLocal(process.cwd());

  const args = new Set(process.argv.slice(2));
  if (args.has("--help")) {
    usage();
    return;
  }

  const cityArg = [...args].find((x) => x.startsWith("--city="));
  const limitArg = [...args].find((x) => x.startsWith("--limit="));
  const delayArg = [...args].find((x) => x.startsWith("--delay-ms="));

  const city = cityArg ? cityArg.slice("--city=".length).trim().toLowerCase() : "";
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : 5000;
  const delayMs = delayArg ? Number(delayArg.slice("--delay-ms=".length)) : 120;
  const writeMode = args.has("--write");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";

  if (!supabaseUrl || !supabaseServiceKey || !mapboxToken) {
    throw new Error(
      "Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_MAPBOX_TOKEN (or MAPBOX_TOKEN).",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
    },
  });

  let query = supabase
    .from("places")
    .select("id, city, name, lat, lng, location")
    .or("location.is.null,location.eq.")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(Number.isFinite(limit) ? limit : 5000);

  if (city) {
    query = query.ilike("city", city);
  }

  const { data: places, error } = await query;
  if (error) {
    throw new Error(`Supabase read error: ${error.message}`);
  }

  const rows = Array.isArray(places) ? places : [];
  if (!rows.length) {
    console.log("No places need location backfill.");
    return;
  }

  console.log(
    `Found ${rows.length} place(s) missing location${city ? ` in city=${city}` : ""}. Mode=${writeMode ? "WRITE" : "DRY-RUN"}`,
  );

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const place of rows) {
    const id = place.id;
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      skipped += 1;
      continue;
    }

    try {
      const geocoded = await reverseGeocode({ lat, lng, token: mapboxToken });
      if (!geocoded?.text) {
        skipped += 1;
        continue;
      }

      const distanceKm = geocoded.distanceKm;
      const confidenceOk = distanceKm == null || distanceKm <= 2;
      if (!confidenceOk) {
        console.log(
          `SKIP low-confidence (${distanceKm.toFixed(2)}km): [${place.city}] ${place.name} -> ${geocoded.text}`,
        );
        skipped += 1;
        continue;
      }

      if (writeMode) {
        const { error: updateError } = await supabase
          .from("places")
          .update({ location: geocoded.text })
          .eq("id", id);

        if (updateError) {
          failed += 1;
          console.log(
            `FAIL update id=${id} [${place.city}] ${place.name}: ${updateError.message}`,
          );
        } else {
          updated += 1;
          console.log(
            `UPDATED [${place.city}] ${place.name} -> ${geocoded.text}${distanceKm == null ? "" : ` (${distanceKm.toFixed(2)}km)`}`,
          );
        }
      } else {
        updated += 1;
        console.log(
          `DRY [${place.city}] ${place.name} -> ${geocoded.text}${distanceKm == null ? "" : ` (${distanceKm.toFixed(2)}km)`}`,
        );
      }
    } catch (err) {
      failed += 1;
      console.log(`FAIL geocode id=${id} [${place.city}] ${place.name}: ${err.message}`);
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  console.log(
    [
      "",
      "Backfill summary",
      `  candidates: ${rows.length}`,
      `  ${writeMode ? "updated" : "dry-run matches"}: ${updated}`,
      `  skipped: ${skipped}`,
      `  failed: ${failed}`,
    ].join("\n"),
  );
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});

