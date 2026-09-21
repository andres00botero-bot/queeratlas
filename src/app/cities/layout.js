import { keywordOwnership } from "@/lib/seo/keywordOwnership";
import { CityIndexDirectory } from "@/components/city/CityGuideLinks";
import { listCityRegistry } from "@/lib/server/cityRegistry";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

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
  return {
    ...metadata,
    title: isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026" : metadata.title,
    description: isSpanish ? "Compara ciudades LGBTQ+ acogedoras, zonas queer seguras y vida nocturna con contexto de derechos y seguridad para viajar con más confianza." : metadata.description,
    alternates: localizedAlternates("/cities", locale),
    openGraph: { ...metadata.openGraph, title: isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026 | Queer Atlas" : metadata.openGraph.title, description: isSpanish ? "Compara contexto de seguridad, vida nocturna y rutas locales de confianza ciudad por ciudad." : metadata.openGraph.description, url: localizedOpenGraphUrl("/cities", locale), locale: isSpanish ? "es_ES" : "en_US" },
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
