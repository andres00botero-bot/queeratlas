import { writeFile } from "node:fs/promises";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const SOURCE_URL = "https://freedomhouse.org/country/scores?type=fotn";
const response = await fetch(SOURCE_URL);
if (!response.ok) throw new Error(`Freedom House request failed: ${response.status}`);
const html = await response.text();

function decode(value = "") {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", '"')
    .trim();
}

function scoreFromCell(row, group) {
  const match = row.match(new RegExp(`<td[^>]+data-group="${group}"[\\s\\S]*?<span class="score">(\\d+)</span>`));
  return match ? Number(match[1]) : null;
}

const records = [];
for (const match of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
  const row = match[1];
  const countryMatch = row.match(/data-group="country_name"[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>/);
  if (!countryMatch) continue;
  records.push({
    country: decode(countryMatch[2]),
    countryUrl: new URL(countryMatch[1], SOURCE_URL).href,
    freedomWorld2026: scoreFromCell(row, "fiw"),
    freedomNet2025: scoreFromCell(row, "fotn"),
  });
}

const aliases = new Map([
  ["Czech Republic", "Czechia"],
  ["Hong Kong", "Hong Kong*"],
  ["Puerto Rico", "United States"],
  ["South Korea", "South Korea"],
]);
const byCountry = new Map(records.map((record) => [record.country, record]));
const atlasCountries = [...new Set(Object.values(cityCoreConfig).map((city) => city.country))].sort();
const atlasRecords = atlasCountries.map((country) => {
  const sourceName = aliases.get(country) || country;
  const record = byCountry.get(sourceName) || null;
  if (!record) throw new Error(`Freedom House country mapping missing: ${country} -> ${sourceName}`);
  return { country, sourceCountry: record.country, countryUrl: record.countryUrl, freedomWorld2026: record.freedomWorld2026, freedomNet2025: record.freedomNet2025 };
});

const snapshot = {
  source: "Freedom House country scores",
  sourceUrl: SOURCE_URL,
  freedomWorldEdition: 2026,
  freedomNetEdition: 2025,
  retrievedAt: new Date().toISOString(),
  records: atlasRecords,
};

await writeFile(new URL("../src/lib/qariFreedomHouse2026.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "src/lib/qariFreedomHouse2026.json", countries: atlasRecords.length, freedomNetCovered: atlasRecords.filter((record) => Number.isFinite(record.freedomNet2025)).length, freedomWorldCovered: atlasRecords.filter((record) => Number.isFinite(record.freedomWorld2026)).length }, null, 2));
