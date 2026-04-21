import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const REQUIRED = ["bar", "club", "sauna", "cruise_club", "cruising_area", "hotel", "cafe"];

async function main() {
  readDotEnvLocal(process.cwd());
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing supabase env vars in .env.local");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("places")
    .select("city,type")
    .order("city", { ascending: true });
  if (error) throw error;

  const cityMap = new Map();
  for (const row of data || []) {
    const city = String(row.city || "").trim();
    if (!city) continue;
    const type = String(row.type || "").trim().toLowerCase();
    if (!cityMap.has(city)) cityMap.set(city, new Set());
    if (type) cityMap.get(city).add(type);
  }

  const result = [];
  for (const [city, types] of cityMap.entries()) {
    const missing = REQUIRED.filter((t) => !types.has(t));
    result.push({ city, present: [...types].sort(), missing, missingCount: missing.length });
  }

  result.sort((a, b) => b.missingCount - a.missingCount || a.city.localeCompare(b.city));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
