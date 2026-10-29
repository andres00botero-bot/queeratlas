import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import CityIndexableContent from "@/components/city/CityIndexableContent";
import CityPageClient from "./CityPageClient";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { normalizeLocale } from "@/lib/i18n/locales";
import { getLocalizedCityGuide } from "@/lib/cityGuideTranslations";
import { cityGuideConfig } from "@/lib/cityGuides";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import { notFound } from "next/navigation";

export const revalidate = 300;

const getCitySearchContent = unstable_cache(
  async (city) => {
    const [config, inventory] = await Promise.all([
      getCityRegistryEntry(city),
      loadSeoEntityInventory(),
    ]);
    return { config, venues: inventory.publicVenues, events: inventory.publicEvents };
  },
  ["city-search-content"],
  { revalidate: 300, tags: ["city-search-content"] },
);

export default async function CityPage({ params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const { config, venues, events } = await getCitySearchContent(city);
  if (!config) notFound();

  const cityName = String(config.title || "").replace(/^Queer\s+/i, "").trim() || city;
  const defaultGuide = Array.isArray(cityGuideConfig[city]) ? cityGuideConfig[city] : config.guide;
  const guide = getLocalizedCityGuide(city, locale, defaultGuide || []);

  return (
    <>
      <CityPageClient />
      <CityIndexableContent city={city} cityName={cityName} locale={locale} guide={guide} venues={venues} events={events} />
    </>
  );
}
