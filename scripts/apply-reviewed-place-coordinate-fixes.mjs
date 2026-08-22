import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const cityArg = [...args].find((value) => value.startsWith("--city="));
const city = cityArg ? cityArg.slice(7).trim().toLowerCase() : "";
const apply = args.has("--apply");
const ledgerPath = path.join(process.cwd(), "scripts", "reviewed-place-coordinate-fixes.json");
const backupPath = path.join(process.cwd(), ".tmp", `place-coordinate-backup-${city || "unknown"}-${Date.now()}.json`);

function sameNullableText(first, second) {
  return (first ?? null) === (second ?? null);
}

function sameNumber(first, second) {
  // The production columns store four decimal places (roughly 11 metres).
  return Math.abs(Number(first) - Number(second)) <= 0.00005;
}

function distanceMeters(first, second) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDelta = toRadians(Number(second.lat) - Number(first.lat));
  const lngDelta = toRadians(Number(second.lng) - Number(first.lng));
  const a = Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(Number(first.lat))) * Math.cos(toRadians(Number(second.lat))) * Math.sin(lngDelta / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(a));
}

function matchesPrevious(row, fix) {
  return row.id === fix.id &&
    row.name === fix.name &&
    row.city === city &&
    sameNullableText(row.location, fix.previous.location) &&
    sameNumber(row.lat, fix.previous.lat) &&
    sameNumber(row.lng, fix.previous.lng);
}

function matchesNext(row, fix) {
  const targetCity = String(fix.next.city || city).trim().toLowerCase();
  return row.id === fix.id &&
    row.name === fix.name &&
    row.city === targetCity &&
    sameNullableText(row.location, fix.next.location) &&
    distanceMeters(row, fix.next) <= 75;
}

async function main() {
  if (!city) throw new Error("Pass a reviewed city with --city=<slug>.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Missing Supabase environment variables.");

  const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
  const fixes = ledger[city];
  if (!Array.isArray(fixes) || fixes.length === 0) throw new Error(`No reviewed fixes for ${city}.`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const ids = fixes.map((fix) => fix.id);
  const { data: currentRows, error: readError } = await supabase
    .from("places")
    .select("id,name,city,location,lat,lng")
    .in("id", ids);
  if (readError) throw readError;

  const currentById = new Map((currentRows || []).map((row) => [row.id, row]));
  const conflicts = fixes.filter((fix) => {
    const row = currentById.get(fix.id) || {};
    return !matchesPrevious(row, fix) && !matchesNext(row, fix);
  });
  if (conflicts.length > 0) {
    console.error(JSON.stringify({
      error: "Safety check failed; no records were changed.",
      conflicts: conflicts.map((fix) => ({ fix, current: currentById.get(fix.id) || null })),
    }, null, 2));
    process.exit(2);
  }

  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, `${JSON.stringify({ city, createdAt: new Date().toISOString(), rows: currentRows }, null, 2)}\n`);

  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", city, reviewed: fixes.length, conflicts: 0, backupPath }, null, 2));
    return;
  }

  const applied = [];
  for (const fix of fixes) {
    if (matchesNext(currentById.get(fix.id) || {}, fix)) continue;
    const targetCity = String(fix.next.city || city).trim().toLowerCase();
    const { data, error } = await supabase
      .from("places")
      .update({ city: targetCity, location: fix.next.location, lat: fix.next.lat, lng: fix.next.lng })
      .eq("id", fix.id)
      .eq("city", city)
      .eq("name", fix.name)
      .select("id,name,city,location,lat,lng")
      .single();
    if (error) throw error;
    if (!sameNullableText(data.location, fix.next.location) || distanceMeters(data, fix.next) > 75) {
      throw new Error(`Readback verification failed for place ${fix.id}.`);
    }
    applied.push(data.id);
  }

  console.log(JSON.stringify({ mode: "apply", city, applied: applied.length, ids: applied, backupPath }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
