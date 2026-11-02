import { cityCoreConfig } from "../src/lib/cityCore.js";
import { getCityHeroCopy } from "../src/features/city/cityHeroCopy.js";
import { getLocalizedCityGuide, hasLocalizedCityGuide } from "../src/lib/cityGuideTranslations.js";

const cityKeys = Object.keys(cityCoreConfig).sort();
const complete = [];
const missingGuide = [];
const missingHero = [];

for (const city of cityKeys) {
  const guide = getLocalizedCityGuide(city, "fr", []);
  const hero = getCityHeroCopy(city, "fr");
  const guideReady = hasLocalizedCityGuide(city, "fr") && guide.length >= 5;
  const heroReady = Boolean(hero?.hook && hero?.status && hero?.crowd && hero?.intro);

  if (guideReady && heroReady) complete.push(city);
  if (!guideReady) missingGuide.push(city);
  if (!heroReady) missingHero.push(city);
}

const percent = cityKeys.length ? ((complete.length / cityKeys.length) * 100).toFixed(1) : "0.0";
console.log(`French editorial coverage: ${complete.length}/${cityKeys.length} cities (${percent}%).`);
console.log(`Missing guide: ${missingGuide.length}${missingGuide.length ? ` — ${missingGuide.join(", ")}` : ""}`);
console.log(`Missing hero: ${missingHero.length}${missingHero.length ? ` — ${missingHero.join(", ")}` : ""}`);

