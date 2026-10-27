import { cityGuideConfig } from "@/lib/cityGuides";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { getCityGuideResearch } from "@/lib/cityGuideResearch";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { CityRouteConfigProvider } from "@/components/city/CityRouteConfigProvider";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";
import { getLocalizedCityGuide } from "@/lib/cityGuideTranslations";
import { getPublicQariProfileForCountry } from "@/lib/qariPublicProfiles";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";

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
  const venueAccessRestricted = isVenueAccessRestricted(city);
  const canonical = `/${city}`;
  const ownership = getCityKeywordOwnership(cityName);
  const isSpanish = locale === "es";
  const isGerman = locale === "de";
  const defaultTitle = isSpanish
    ? `Guía queer de ${cityName} 2026: bares, eventos y seguridad`
    : isGerman ? `Queerer Guide für ${cityName} 2026: Bars, Events & Sicherheit` : `Queer ${cityName} Guide 2026: Bars, Events & Safety`;
  const title = venueAccessRestricted
    ? (isSpanish ? `${cityName}: contexto de viaje y seguridad LGBTQ+` : isGerman ? `${cityName}: LGBTQ+ Reisekontext & Sicherheit` : `${cityName}: LGBTQ+ Travel Context & Safety`)
    : defaultTitle;
  const isMiamiRegionalGuide = city === "miami";
  const detailedDescription = isSpanish
    ? isMiamiRegionalGuide
      ? `Guía queer de Miami y el sur de Florida: Miami Beach, Fort Lauderdale Beach y Wilton Manors, con lugares verificados, eventos y contexto práctico para planificar la ruta.`
      : `En ${cityName}, descubre lugares queer verificados, eventos en directo, vida nocturna y contexto práctico de seguridad. Actualizado para 2026.`
    : isGerman
      ? isMiamiRegionalGuide
        ? "Queerer Guide für Miami und Südflorida: Miami Beach, Fort Lauderdale Beach und Wilton Manors – mit geprüften Orten, Events und praktischem Kontext für deine Route."
        : `${cityName}, ${country}: entdecke geprüfte queere Orte, aktuelle Events, Nachtleben und praktischen Sicherheitskontext. Aktualisiert für 2026.`
    : isMiamiRegionalGuide
      ? "Queer Miami and South Florida guide: Miami Beach, Fort Lauderdale Beach and Wilton Manors, with trusted venues, live events and practical route context."
      : `${cityName}, ${country}: ${ownership.primary}, trusted queer venues, live events, and route-smart safety context${vibe ? ` with a ${vibe} city vibe` : ""}. Updated for 2026.`;
  const defaultDescription = detailedDescription.length <= 160
    ? detailedDescription
    : isSpanish
      ? `${cityName}, ${country}: descubre lugares queer verificados, eventos en directo, vida nocturna y contexto práctico de seguridad. Actualizado para 2026.`
      : isGerman
        ? `${cityName}, ${country}: geprüfte queere Orte, aktuelle Events, Nachtleben und praktischer Sicherheitskontext. Aktualisiert für 2026.`
      : `${cityName}, ${country}: discover trusted queer venues, live events, nightlife and practical safety context. Updated for 2026.`;
  const description = venueAccessRestricted
    ? (isSpanish
      ? `${cityName}, ${country}: contexto de viaje LGBTQ+, información de seguridad actualizada y detalles locales protegidos.`
      : isGerman
        ? `${cityName}, ${country}: LGBTQ+ Reisekontext, aktuelle Sicherheitsinformationen und geschützte lokale Details.`
      : `${cityName}, ${country}: LGBTQ+ travel context, current safety information and protected local details.`)
    : defaultDescription;

  return {
    title: title,
    description: description,
    keywords: venueAccessRestricted ? (
      isSpanish
        ? [`contexto LGBTQ+ ${cityName}`, `seguridad LGBTQ+ ${cityName}`, `viaje LGBTQ+ ${cityName}`]
        : [`LGBTQ+ travel context ${cityName}`, `LGBTQ+ safety context ${cityName}`, `queer travel ${cityName}`]
    ) : [
      ...(isSpanish
        ? [
          `guía queer ${cityName}`,
          `bares LGBTQ+ ${cityName}`,
          `vida nocturna queer ${cityName}`,
          `eventos LGBTQ+ ${cityName}`,
          `viaje queer ${cityName}`,
          `lugares queer seguros ${cityName}`,
        ]
        : isGerman
          ? [
            `queerer Guide ${cityName}`,
            `LGBTQ+ Bars ${cityName}`,
            `queeres Nachtleben ${cityName}`,
            `LGBTQ+ Events ${cityName}`,
            `queere Reise ${cityName}`,
            `queere sichere Orte ${cityName}`,
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
      index: venueAccessRestricted ? false : config.seoIndexable !== false,
      follow: !venueAccessRestricted,
    },
    openGraph: {
      title: title,
      description: description,
      url: localizedOpenGraphUrl(canonical, locale),
      locale: locale === "es" ? "es_ES" : locale === "de" ? "de_DE" : "en_US",
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
  const normalizedCity = normalizeCitySlug(city);
  const matchesCity = (item) => normalizeCitySlug(item?.city) === normalizedCity;
  const countEntities = (items, sourceAvailable) => {
    const count = items.filter(matchesCity).length;
    // Places and events have bundled seed fallbacks. Preserve those crawlable
    // counts when Supabase is temporarily unavailable instead of rendering 0.
    return sourceAvailable || count > 0 ? count : null;
  };
  const initialEntityCounts = {
    venues: countEntities(inventory.publicVenues, inventory.availability.places),
    events: countEntities(inventory.publicEvents, inventory.availability.events),
    services: countEntities(inventory.allServices, inventory.availability.services),
  };
  const routeConfig = {
    ...coreConfig,
    key: city,
    qariProfile: getPublicQariProfileForCountry(coreConfig.country),
    guide: cityGuide,
    guideResearch,
    initialEntityCounts,
  };

  return (
    <CityRouteConfigProvider config={routeConfig}>
      {children}
    </CityRouteConfigProvider>
  );
}
