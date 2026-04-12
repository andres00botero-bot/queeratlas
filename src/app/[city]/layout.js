import { cityConfig } from "@/lib/cities";

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

  return {
    title: `Queer ${cityName}`,
    description: `Discover queer venues, events, and local guide signal in ${cityName}.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Queer ${cityName} | Queer Atlas`,
      description: `Explore trusted queer places and events in ${cityName}.`,
      url: canonical,
      type: "website",
    },
  };
}

export default function CityLayout({ children }) {
  return children;
}
