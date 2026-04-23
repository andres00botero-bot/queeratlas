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
    title: `Gay Bars in ${cityName} | Queer Atlas`,
    description: `Queer nightlife guide for ${cityName}: bars, clubs, saunas, events, and trusted local signal.`,
    keywords: [ownership.primary, ...ownership.secondary],
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Gay Bars in ${cityName} & Queer Nightlife | Queer Atlas`,
      description: `Explore trusted queer places, nightlife, and events in ${cityName}.`,
      url: canonical,
      type: "website",
    },
  };
}

export default function CityLayout({ children }) {
  return children;
}
