import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { cityGuideConfig } from "@/lib/cityGuides";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { CityRouteConfigProvider } from "@/components/city/CityRouteConfigProvider";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const config = cityConfig[city];

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
  const title = `Queer ${cityName} Guide 2026: Bars, Clubs, Events & Safety Signal`;
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
  const coreConfig = cityConfig[city] || cityConfig.berlin;
  const fallbackGuide = Array.isArray(cityGuideConfig.berlin) ? cityGuideConfig.berlin : [];
  const cityGuide = Array.isArray(cityGuideConfig[city]) ? cityGuideConfig[city] : fallbackGuide;
  const routeConfig = {
    ...coreConfig,
    guide: cityGuide,
  };

  return (
    <CityRouteConfigProvider config={routeConfig}>
      {children}
    </CityRouteConfigProvider>
  );
}
