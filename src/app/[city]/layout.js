import { cityGuideConfig } from "@/lib/cityGuides";
import { cityCoreConfig } from "@/lib/cityCore";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { getCityGuideResearch } from "@/lib/cityGuideResearch";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { CityRouteConfigProvider } from "@/components/city/CityRouteConfigProvider";
import CityEntityCrawlSection from "@/components/city/CityEntityCrawlSection";
import { CityRelatedGuides } from "@/components/city/CityGuideLinks";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { isEventVisibleOnCityPage } from "@/features/city/eventRailFeature";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";
import { getLocalizedCityGuide } from "@/lib/cityGuideTranslations";

export async function generateMetadata({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const config = await getCityRegistryEntry(city);

  if (!config) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityName = String(config.title || "").replace(/^Queer\s+/i, "").trim() || city;
  const country = String(config.country || "").trim();
  const vibe = String(config.vibe || "").trim();
  const canonical = `/${city}`;
  const ownership = getCityKeywordOwnership(cityName);
  const isSpanish = locale === "es";
  const title = isSpanish
    ? `Guía queer de ${cityName} 2026: bares, eventos y seguridad`
    : `Queer ${cityName} Guide 2026: Bars, Events & Safety`;
  const detailedDescription = isSpanish
    ? `En ${cityName}, descubre lugares queer verificados, eventos en directo, vida nocturna y contexto práctico de seguridad. Actualizado para 2026.`
    : `${cityName}, ${country}: ${ownership.primary}, trusted queer venues, live events, and route-smart safety context${vibe ? ` with a ${vibe} city vibe` : ""}. Updated for 2026.`;
  const description = detailedDescription.length <= 160
    ? detailedDescription
    : isSpanish
      ? `${cityName}, ${country}: descubre lugares queer verificados, eventos en directo, vida nocturna y contexto práctico de seguridad. Actualizado para 2026.`
      : `${cityName}, ${country}: discover trusted queer venues, live events, nightlife and practical safety context. Updated for 2026.`;

  return {
    title: title,
    description: description,
    keywords: [
      ...(isSpanish
        ? [
          `guía queer ${cityName}`,
          `bares LGBTQ+ ${cityName}`,
          `vida nocturna queer ${cityName}`,
          `eventos LGBTQ+ ${cityName}`,
          `viaje queer ${cityName}`,
          `lugares queer seguros ${cityName}`,
        ]
        : [
          ownership.primary,
          ...ownership.secondary,
          `queer nightlife ${cityName} ${country}`,
          `queer travel ${cityName}`,
          `gay travel ${cityName}`,
          `LGBTQ events ${cityName}`,
          `queer friendly places ${cityName}`,
          `safe queer nightlife ${cityName}`,
        ]),
    ],
    alternates: localizedAlternates(canonical, locale),
    robots: {
      index: config.seoIndexable !== false,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: localizedOpenGraphUrl(canonical, locale),
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
  };
}

export default async function CityLayout({ children, params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const coreConfig = await getCityRegistryEntry(city);
  if (!coreConfig) notFound();

  const defaultCityGuide = Array.isArray(cityGuideConfig[city])
    ? cityGuideConfig[city]
    : Array.isArray(coreConfig.guide) ? coreConfig.guide : [];
  const cityGuide = getLocalizedCityGuide(city, locale, defaultCityGuide);
  const staticGuideResearch = getCityGuideResearch(city);
  const guideResearch = Array.isArray(staticGuideResearch?.sources) && staticGuideResearch.sources.length > 0
    ? staticGuideResearch
    : coreConfig.guideResearch || { checkedAt: "", sources: [] };
  const inventory = await loadSeoEntityInventory();
  const indexableCities = Object.entries(cityCoreConfig).map(([key, value]) => ({
    key,
    ...value,
    seoIndexable: true,
  }));
  const normalizedCity = normalizeCitySlug(city);
  const matchesCity = (item) => normalizeCitySlug(item?.city) === normalizedCity;
  const countEntities = (items, sourceAvailable) => {
    const count = items.filter(matchesCity).length;
    // Places and events have bundled seed fallbacks. Preserve those crawlable
    // counts when Supabase is temporarily unavailable instead of rendering 0.
    return sourceAvailable || count > 0 ? count : null;
  };
  const initialEntityCounts = {
    venues: countEntities(inventory.allVenues, inventory.availability.places),
    events: countEntities(
      inventory.allEvents.filter(isEventVisibleOnCityPage),
      inventory.availability.events,
    ),
    services: countEntities(inventory.allServices, inventory.availability.services),
  };
  const routeConfig = {
    ...coreConfig,
    key: city,
    guide: cityGuide,
    guideResearch,
    initialEntityCounts,
  };

  return (
    <CityRouteConfigProvider config={routeConfig}>
      {children}
      <CityEntityCrawlSection
        city={city}
        cityName={String(coreConfig.title || city).replace(/^Queer\s+/i, "").trim()}
        inventory={inventory}
      />
      <CityRelatedGuides currentCity={routeConfig} cities={indexableCities} />
    </CityRouteConfigProvider>
  );
}
