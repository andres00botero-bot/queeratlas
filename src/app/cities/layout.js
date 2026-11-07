import { CityIndexDirectory } from "@/components/city/CityGuideLinks";
import { listCityRegistry } from "@/lib/server/cityRegistry";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { createPageMetadata } from "@/lib/seo/pageMetadata";

const metadata = {
  title: "LGBTQ-Friendly Cities & Travel Context 2026",
  description:
    "Compare gay friendly cities, queer-safe areas, and LGBTQ nightlife signal with legal-rights-safety context for smarter travel decisions.",
  alternates: {
    canonical: "/cities",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  const isGerman = locale === "de";
  const isFrench = locale === "fr";
  const title = isSpanish ? "Ciudades LGBTQ+ y mapa de seguridad queer 2026" : isGerman ? "LGBTQ+ freundliche Städte & queere Sicherheitskarte 2026" : isFrench ? "Villes LGBTQ+ et carte de sécurité queer 2026" : metadata.title;
  const description = isSpanish ? "Compara ciudades LGBTQ+ acogedoras, zonas queer seguras y vida nocturna con contexto de derechos y seguridad para viajar con más confianza." : isGerman ? "Vergleiche LGBTQ+ freundliche Städte, queere Orte und Nachtleben mit nachvollziehbarem Rechte- und Sicherheitskontext für eine besser geplante Reise." : isFrench ? "Comparez les villes LGBTQ+ accueillantes, les quartiers queer et la vie nocturne avec un contexte clair sur les droits et la sécurité." : metadata.description;
  return { ...metadata, ...createPageMetadata({ path: "/cities", locale, title, description }), robots: metadata.robots };
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
