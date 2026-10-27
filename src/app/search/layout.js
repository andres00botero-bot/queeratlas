import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

const metadata = {
  title: "Global Search",
  description:
    "Search queer-friendly cities, venues, and events with live intent-aware results and map discovery.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/search",
  },
  keywords: [
    "queer search",
    "LGBTQ events search",
    "queer-friendly places",
    "safe queer nightlife",
    "queer travel discovery",
  ],
  openGraph: {
    title: "Queer Atlas Global Search",
    description:
      "Discover queer bars, events, safe spaces, and city signal in one intelligent global search.",
    url: "https://www.queeratlas.app/search",
    type: "website",
    images: [
      {
        url: "/images/queer-atlas-global-city-search-hero.png",
        width: 1536,
        height: 1024,
        alt: "Queer Atlas global LGBTQ+ city, venue, and event search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Atlas Global Search",
    description:
      "Search queer cities, places, and events with trusted signal and live discovery.",
    images: ["/images/queer-atlas-global-city-search-hero.png"],
  },
};

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  if (locale !== "de") return metadata;
  const title = "Queere Orte, Städte & Events suchen | Queer Atlas";
  const description = "Durchsuche queere Städte, Orte, Veranstaltungen, Angebote und Guides mit aktuellen Treffern und Kartenansicht.";
  return {
    ...metadata,
    title,
    description,
    alternates: localizedAlternates("/search", locale),
    openGraph: { ...metadata.openGraph, title, description, url: localizedOpenGraphUrl("/search", locale), locale: "de_DE", images: metadata.openGraph.images.map((image) => ({ ...image, alt: "Queer Atlas: Suche nach Städten, Orten und Veranstaltungen" })) },
    twitter: { ...metadata.twitter, title, description },
  };
}

export default function SearchLayout({ children }) {
  return children;
}
