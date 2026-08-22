import { readFileSync } from "node:fs";

const targets = [
  "../src/app/cities/page.js",
  "../src/app/[city]/page.js",
  "../src/app/favorites/page.js",
];

const failures = [];

for (const relativePath of targets) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const mapInitIndex = source.indexOf("new mapboxgl.Map(");
  if (mapInitIndex < 0) {
    failures.push(`${relativePath}: missing mapbox map initialization`);
    continue;
  }

  const guardIndex = source.indexOf("evaluateMapInitReadiness({");
  if (guardIndex < 0 || guardIndex > mapInitIndex) {
    failures.push(`${relativePath}: map init occurs before readiness guard`);
  }

  if (!source.includes("shouldTriggerMapFallback(")) {
    failures.push(`${relativePath}: missing shared fallback trigger usage`);
  }
}

const cityMapSource = readFileSync(new URL("../src/app/[city]/page.js", import.meta.url), "utf8");
const anchoredCustomMarkers = cityMapSource.match(/new mapboxgl\.Marker\(\{\s*element[^}]*anchor:\s*["']bottom["']/g) || [];
if (anchoredCustomMarkers.length < 3) {
  failures.push("../src/app/[city]/page.js: all custom city markers must use a bottom anchor");
}

if (failures.length > 0) {
  console.error("Map guard smoke test failed:");
  failures.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log("Map guard smoke test passed.");
