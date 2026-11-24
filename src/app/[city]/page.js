import CityPageClient from "./CityPageClient";
import CityIndexableContent from "@/components/city/CityIndexableContent";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { cityNameFromConfig } from "@/features/city/checkinFeature";
import { notFound, permanentRedirect } from "next/navigation";
import { cityPath } from "@/lib/cityRouting";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { getLocalizedCityGuide } from "@/lib/cityGuideTranslations";

export const revalidate = 300;

export default async function CityPage({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolvedParams = await params;
  const requestedCity = String(resolvedParams?.city || "");
  const city = normalizeCityKey(resolvedParams?.city);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();
  if (requestedCity.includes("_")) permanentRedirect(cityPath(city));
  const localizedGuide = getLocalizedCityGuide(city, locale, Array.isArray(config?.guide) ? config.guide : []);

  return (
    <CityPageClient
      indexableContent={
        <CityIndexableContent
          city={city}
          locale={locale}
          cityName={cityNameFromConfig(config, city)}
          guide={localizedGuide.slice(0, 1)}
        />
      }
    />
  );
}
