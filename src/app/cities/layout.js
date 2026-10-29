import { keywordOwnership } from "@/lib/seo/keywordOwnership";
import { CityIndexDirectory } from "@/components/city/CityGuideLinks";
import { listCityRegistry } from "@/lib/server/cityRegistry";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl, openGraphLocale } from "@/lib/seo/localizedSeo";

const metadata = {
  title: "Gay Friendly Cities & LGBTQ Safety Map 2026",
  description:
    "Compare gay friendly cities, queer-safe areas, and LGBTQ nightlife signal with legal-rights-safety context for smarter travel decisions.",
  keywords: [
    keywordOwnership.cities.primary,
    ...keywordOwnership.cities.secondary,
    "queer neighborhoods",
    "queer friendly places",
    "LGBTQ travel safety",
    "gay friendly cities 2026",
    "queer safe areas map",
  ],
  alternates: {
    canonical: "/cities",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gay Friendly Cities & LGBTQ Safety Map 2026 | Queer Atlas",
    description:
      "Compare queer city safety context, nightlife signal, and trusted local routes in one city-by-city atlas.",
    url: "/cities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gay Friendly Cities & LGBTQ Safety Map 2026 | Queer Atlas",
    description:
      "Explore safer queer travel cities, local nightlife context, and trusted venue signal.",
  },
};

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  const isGerman = locale === "de";
  const isFrench = locale === "fr";
  return {
    ...metadata,
    title: isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026" : isGerman ? "LGBTQ+ freundliche Städte & queere Sicherheitskarte 2026" : isFrench ? "Villes LGBTQ+ et carte de sécurité queer 2026" : metadata.title,
    description: isSpanish ? "Compara ciudades LGBTQ+ acogedoras, zonas queer seguras y vida nocturna con contexto de derechos y seguridad para viajar con más confianza." : isGerman ? "Vergleiche LGBTQ+ freundliche Städte, queere Orte und Nachtleben mit nachvollziehbarem Rechte- und Sicherheitskontext für eine besser geplante Reise." : isFrench ? "Comparez les villes LGBTQ+ accueillantes, les quartiers queer et la vie nocturne avec un contexte clair sur les droits et la sécurité." : metadata.description,
    alternates: localizedAlternates("/cities", locale),
    openGraph: { ...metadata.openGraph, title: isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026 | Queer Atlas" : isGerman ? "LGBTQ+ freundliche Städte & queere Sicherheitskarte 2026 | Queer Atlas" : isFrench ? "Villes LGBTQ+ et carte de sécurité queer 2026 | Queer Atlas" : metadata.openGraph.title, description: isSpanish ? "Compara contexto de seguridad, vida nocturna y rutas locales de confianza ciudad por ciudad." : isGerman ? "Sicherheitskontext, Nachtleben und verlässliche lokale Routen – Stadt für Stadt." : isFrench ? "Comparez le contexte de sécurité, la vie nocturne et des itinéraires locaux fiables, ville par ville." : metadata.openGraph.description, url: localizedOpenGraphUrl("/cities", locale), locale: openGraphLocale(locale) },
    twitter: { ...metadata.twitter, title: isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026 | Queer Atlas" : metadata.twitter.title, description: isSpanish ? "Explora ciudades queer seguras, vida nocturna local y señales de confianza." : metadata.twitter.description },
  };
}

export default async function CitiesLayout({ children }) {
  const cities = await listCityRegistry({ indexableOnly: true });

  return (
    <>
      {children}
      <CityIndexDirectory cities={cities} />
    </>
  );
}
