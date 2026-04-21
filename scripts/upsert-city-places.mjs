import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function readDotEnvLocal(cwd) {
  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx < 1) continue;
    const key = t.slice(0, idx).trim();
    let value = t.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function usage() {
  console.log("Usage: node scripts/upsert-city-places.mjs <city_slug> [--dry-run]");
}

function normalizeKey(v = "") {
  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const city = String(process.argv[2] || "").trim();
const dryRun = process.argv.includes("--dry-run");

if (!city) {
  usage();
  process.exit(1);
}

const dataPath = path.join(process.cwd(), "scripts", "verified-city-venues.json");
if (!fs.existsSync(dataPath)) {
  throw new Error(`Missing data file: ${dataPath}`);
}

const allData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const cityRows = Array.isArray(allData?.[city]) ? allData[city] : [];
if (!cityRows.length) {
  console.log(`No rows found for city=${city} in verified-city-venues.json`);
  process.exit(0);
}

readDotEnvLocal(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env vars in .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: existing, error: existingError } = await supabase
  .from("places")
  .select("id,name,city")
  .eq("city", city);
if (existingError) throw existingError;

const existingByName = new Map((existing || []).map((r) => [normalizeKey(r.name), r]));

let inserts = 0;
let updates = 0;

for (const row of cityRows) {
  const name = String(row.name || "").trim();
  const type = String(row.type || "").trim();
  if (!name || !type) {
    console.log(`SKIP invalid row (missing name/type): ${JSON.stringify(row)}`);
    continue;
  }

  const payload = {
    name,
    city,
    type,
    vibe: String(row.vibe || "Community spot").trim(),
    description: String(row.description || "").trim(),
    location: String(row.location || "").trim() || null,
    hours: String(row.hours || "").trim() || null,
    link: String(row.link || "").trim() || null,
    lat: Number.isFinite(Number(row.lat)) ? Number(row.lat) : null,
    lng: Number.isFinite(Number(row.lng)) ? Number(row.lng) : null,
  };

  const keyName = normalizeKey(name);
  const existingRow = existingByName.get(keyName);

  if (!existingRow) {
    inserts += 1;
    console.log(`${dryRun ? "DRY INSERT" : "INSERT"}: ${name} (${type})`);
    if (!dryRun) {
      const { error } = await supabase.from("places").insert(payload);
      if (error) throw error;
    }
  } else {
    updates += 1;
    console.log(`${dryRun ? "DRY UPDATE" : "UPDATE"}: ${name} (${type})`);
    if (!dryRun) {
      const { error } = await supabase
        .from("places")
        .update(payload)
        .eq("id", existingRow.id);
      if (error) throw error;
    }
  }
}

console.log(JSON.stringify({ city, dryRun, inserts, updates, totalInput: cityRows.length }, null, 2));
