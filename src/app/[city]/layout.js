import { cityGuideConfig } from "@/lib/cityGuides";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { getCityGuideResearch } from "@/lib/cityGuideResearch";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { CityRouteConfigProvider } from "@/components/city/CityRouteConfigProvider";
import CityEntityCrawlSection from "@/components/city/CityEntityCrawlSection";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { isEventVisibleOnCityPage } from "@/features/city/eventRailFeature";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
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
  const title = `Queer ${cityName} Guide 2026: Bars, Events & Safety`;
  const description = `${cityName}, ${country}: ${ownership.primary}, trusted queer venues, live events, and route-smart safety context${vibe ? ` with a ${vibe} city vibe` : ""}. Updated for 2026.`;

  return {
    title: title,
    description: description,
    keywords: [
      ownership.primary,
      ...ownership.secondary,
      `queer nightlife ${cityName} ${country}`,
      `queer travel ${cityName}`,
      `gay travel ${cityName}`,
      `LGBTQ events ${cityName}`,
      `queer friendly places ${cityName}`,
      `safe queer nightlife ${cityName}`,
    ],
    alternates: {
      canonical,
    },
    robots: {
      index: config.seoIndexable !== false,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function CityLayout({ children, params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const coreConfig = await getCityRegistryEntry(city);
  if (!coreConfig) notFound();

  const cityGuide = Array.isArray(cityGuideConfig[city])
    ? cityGuideConfig[city]
    : Array.isArray(coreConfig.guide) ? coreConfig.guide : [];
  const staticGuideResearch = getCityGuideResearch(city);
  const guideResearch = Array.isArray(staticGuideResearch?.sources) && staticGuideResearch.sources.length > 0
    ? staticGuideResearch
    : coreConfig.guideResearch || { checkedAt: "", sources: [] };
  const inventory = await loadSeoEntityInventory();
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
    </CityRouteConfigProvider>
  );
}
