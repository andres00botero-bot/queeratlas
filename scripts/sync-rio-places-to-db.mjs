import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { seedPlaces } from "../src/lib/seedContent.js";

const CITY = "rio_de_janeiro";

function readDotEnvLocal(cwd) {
  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function normalizeName(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sanitizeType(type = "") {
  const safe = String(type || "").trim().toLowerCase();
  if (!safe) return "bar";
  return safe;
}

async function main() {
  readDotEnvLocal(process.cwd());
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const rioSeeds = seedPlaces.filter((place) => String(place.city || "").trim() === CITY);
  const { data: existing, error: existingError } = await supabase
    .from("places")
    .select("id,name,city")
    .eq("city", CITY);
  if (existingError) throw existingError;

  const existingKeys = new Set((existing || []).map((row) => normalizeName(row.name)));
  const rowsToInsert = [];

  for (const seed of rioSeeds) {
    const key = normalizeName(seed.name);
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    rowsToInsert.push({
      name: seed.name,
      type: sanitizeType(seed.type),
      city: CITY,
      lat: seed.lat ?? null,
      lng: seed.lng ?? null,
      location: String(seed.location || "").trim() || null,
      description: String(seed.description || "").trim(),
      vibe: String(seed.vibe || "Community spot").trim(),
      hours: String(seed.hours || "").trim(),
      link: String(seed.link || "").trim(),
    });
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("places").insert(rowsToInsert);
    if (insertError) throw insertError;
  }

  console.log(
    JSON.stringify(
      {
        city: CITY,
        seedVenues: rioSeeds.length,
        existingVenues: (existing || []).length,
        insertedVenues: rowsToInsert.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("sync-rio-places-to-db failed:", error?.message || error);
  process.exit(1);
});

