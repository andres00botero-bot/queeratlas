import { keywordOwnership } from "@/lib/seo/keywordOwnership";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

const metadata = {
  title: "Queer Events Calendar",
  description:
    "Track LGBTQ events, queer nightlife events, and curated city-level happenings with live community signal.",
  keywords: [
    keywordOwnership.events.primary,
    ...keywordOwnership.events.secondary,
    "LGBTQ nightlife",
    "inclusive nightlife",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Queer Events | Queer Atlas",
    description:
      "Find LGBTQ events, queer nightlife calendars, and city-by-city event momentum.",
    url: "/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LGBTQ Events Calendar | Queer Atlas",
    description:
      "Track queer nightlife events, city highlights, and inclusive event signal.",
  },
};

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  return {
    ...metadata,
    title: isSpanish ? "Calendario de eventos LGBTQ+" : metadata.title,
    description: isSpanish ? "Sigue eventos LGBTQ+, vida nocturna queer y actividades seleccionadas por ciudad con señales de comunidad en directo." : metadata.description,
    alternates: localizedAlternates("/events", locale),
    openGraph: { ...metadata.openGraph, title: isSpanish ? "Eventos LGBTQ+ | Queer Atlas" : metadata.openGraph.title, description: isSpanish ? "Encuentra eventos LGBTQ+, calendarios de vida nocturna queer y actividad ciudad por ciudad." : metadata.openGraph.description, url: localizedOpenGraphUrl("/events", locale), locale: isSpanish ? "es_ES" : "en_US" },
    twitter: { ...metadata.twitter, title: isSpanish ? "Calendario de eventos LGBTQ+ | Queer Atlas" : metadata.twitter.title, description: isSpanish ? "Sigue vida nocturna queer, eventos locales y señales inclusivas." : metadata.twitter.description },
  };
}

export default function EventsLayout({ children }) {
  return children;
}
