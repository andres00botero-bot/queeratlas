import { cityConfig } from "@/lib/cities";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const city = String(resolvedParams?.city || "").toLowerCase();
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
  const canonical = `/${city}`;
  const ownership = getCityKeywordOwnership(cityName);

  return {
    title: `Queer ${cityName} Guide (2026): Bars, Clubs, Saunas & Events`,
    description: `${ownership.primary} and queer nightlife in ${cityName}: discover bars, clubs, saunas, events, and trusted local signal. Updated for 2026.`,
    keywords: [ownership.primary, ...ownership.secondary],
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Queer ${cityName} Guide (2026): Bars, Clubs, Saunas & Events`,
      description: `Explore trusted queer places, nightlife, and events in ${cityName}. Updated for 2026.`,
      url: canonical,
      type: "website",
    },
  };
}

export default function CityLayout({ children }) {
  return children;
}
