import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const reportPath = path.join(process.cwd(), ".tmp", "place-coordinate-audit.json");
const backupPath = path.join(process.cwd(), ".tmp", `place-coordinate-safe-backup-${Date.now()}.json`);

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ignoredStreetWords = new Set([
  "the", "de", "del", "la", "el", "and", "y", "street", "st", "road", "rd",
  "avenue", "av", "ave", "calle", "carrera", "cra", "rua", "rue", "via", "strasse",
  "carrer", "ak", "cl", "kr", "no",
]);

function firstAddressPart(value) {
  return String(value || "").split(",")[0];
}

function streetWords(value) {
  return normalize(firstAddressPart(value))
    .split(" ")
    .filter((word) => word.length >= 2 && !ignoredStreetWords.has(word) && !/^\d/.test(word));
}

function addressNumbers(value) {
  return normalize(firstAddressPart(value)).match(/\b\d+[a-z]?\b/g) || [];
}

function isSafeFix(row) {
  if (row.status !== "fix" || row.inventorySource !== "database" || row.distanceMeters > 10000) return false;
  if (!row.current.address) return row.distanceMeters <= 1000;
  const currentWords = streetWords(row.current.address);
  const candidateWords = new Set(streetWords(row.candidate.address));
  const currentNumbers = addressNumbers(row.current.address);
  const candidateNumbers = new Set(addressNumbers(row.candidate.address));
  const wordCoverage = currentWords.length
    ? currentWords.filter((word) => candidateWords.has(word)).length / currentWords.length
    : 0;
  return currentNumbers.length > 0 &&
    currentNumbers.every((number) => candidateNumbers.has(number)) &&
    wordCoverage >= 0.75;
}

function sameNumber(first, second) {
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

function matchesApplied(current, fix) {
  return current &&
    current.name === fix.name &&
    current.city === fix.city &&
    current.location === (fix.current.address || fix.candidate.address) &&
    distanceMeters(current, fix.candidate) <= 75;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Missing Supabase environment variables.");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const fixes = report.rows.filter(isSafeFix);
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: currentRows, error: readError } = await supabase
    .from("places")
    .select("id,name,city,location,lat,lng")
    .in("id", fixes.map((row) => row.id));
  if (readError) throw readError;
  const currentById = new Map((currentRows || []).map((row) => [row.id, row]));
  const conflicts = fixes.filter((fix) => {
    const current = currentById.get(fix.id);
    if (matchesApplied(current, fix)) return false;
    return !current || current.name !== fix.name || current.city !== fix.city ||
      (current.location ?? null) !== (fix.current.address ?? null) ||
      !sameNumber(current.lat, fix.current.lat) || !sameNumber(current.lng, fix.current.lng);
  });
  if (conflicts.length) {
    throw new Error(`Safety check found ${conflicts.length} changed records; no batch changes were made.`);
  }

  fs.writeFileSync(backupPath, `${JSON.stringify({ createdAt: new Date().toISOString(), rows: currentRows }, null, 2)}\n`);
  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", safeDatabaseFixes: fixes.length, conflicts: 0, backupPath }, null, 2));
    return;
  }

  const appliedIds = [];
  for (const fix of fixes) {
    if (matchesApplied(currentById.get(fix.id), fix)) continue;
    const location = fix.current.address || fix.candidate.address;
    const { data, error } = await supabase
      .from("places")
      .update({ location, lat: fix.candidate.lat, lng: fix.candidate.lng })
      .eq("id", fix.id)
      .eq("name", fix.name)
      .eq("city", fix.city)
      .select("id,location,lat,lng")
      .single();
    if (error) throw error;
    if (data.location !== location || distanceMeters(data, fix.candidate) > 75) {
      throw new Error(`Readback verification failed for ${fix.id}.`);
    }
    appliedIds.push(fix.id);
  }
  console.log(JSON.stringify({ mode: "apply", applied: appliedIds.length, ids: appliedIds, backupPath }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
