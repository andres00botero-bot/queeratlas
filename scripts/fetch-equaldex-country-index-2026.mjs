import { writeFileSync } from "node:fs";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const COUNTRY_SLUGS = Object.freeze({
  "Bosnia and Herzegovina": "bosnia-and-herzegovina",
  "Czech Republic": "czech-republic",
  "Dominican Republic": "dominican-republic",
  "El Salvador": "el-salvador",
  "Hong Kong": "hong-kong",
  "New Zealand": "new-zealand",
  "Puerto Rico": "puerto-rico",
  "South Africa": "south-africa",
  "South Korea": "south-korea",
  "United Kingdom": "united-kingdom",
  "United States": "united-states",
});

const countries = [...new Set(Object.values(cityCoreConfig).map((config) => config.country))].sort();
const slugFor = (country) => COUNTRY_SLUGS[country] || country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const numberAfter = (html, label) => {
  const match = html.match(new RegExp(`${label}[\\s\\S]{0,300}?<b[^>]*>([0-9]+(?:\\.[0-9]+)?)<\\/b>`, "i"));
  return match ? Number(match[1]) : null;
};

async function fetchCountry(country) {
  const slug = slugFor(country);
  const url = `https://www.equaldex.com/region/${slug}`;
  const response = await fetch(url, { headers: { "user-agent": "QueerAtlas-Research/1.0 (+https://www.queeratlas.app/)" } });
  if (!response.ok) return { country, url, status: response.status, equality: null, legal: null, opinion: null };
  const html = await response.text();
  const equalityMatch = html.match(/href="\/equality-index"[\s\S]{0,1000}?class="huge"[^>]*>([0-9]+(?:\.[0-9]+)?)</i);
  return {
    country,
    url,
    status: response.status,
    equality: equalityMatch ? Number(equalityMatch[1]) : null,
    legal: numberAfter(html, "Legal Rights"),
    opinion: numberAfter(html, "Public Opinion"),
  };
}

const records = [];
for (let index = 0; index < countries.length; index += 4) {
  records.push(...await Promise.all(countries.slice(index, index + 4).map(fetchCountry)));
}

const snapshot = {
  source: "Equaldex Equality Index",
  methodologyUrl: "https://www.equaldex.com/equality-index",
  retrievedAt: new Date().toISOString(),
  terms: "Published with source credit and direct country links; values are frozen for this Queer Atlas edition.",
  records,
};

writeFileSync(new URL("../src/lib/seo/equaldexCountryEvidence2026.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ countries: records.length, complete: records.filter((record) => record.legal !== null && record.opinion !== null).length, incomplete: records.filter((record) => record.legal === null || record.opinion === null) }, null, 2));
