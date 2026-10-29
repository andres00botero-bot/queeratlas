import { keywordOwnership } from "@/lib/seo/keywordOwnership";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl, openGraphLocale } from "@/lib/seo/localizedSeo";

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
  const isGerman = locale === "de";
  const isFrench = locale === "fr";
  return {
    ...metadata,
    title: isSpanish ? "Calendario de eventos LGBTQ+" : isGerman ? "Queerer Eventkalender" : isFrench ? "Calendrier des événements LGBTQ+" : metadata.title,
    description: isSpanish ? "Sigue eventos LGBTQ+, vida nocturna queer y actividades seleccionadas por ciudad con señales de comunidad en directo." : isGerman ? "Finde LGBTQ+ Events, queeres Nachtleben und kuratierte Veranstaltungen nach Stadt – mit aktuellen Community-Hinweisen." : isFrench ? "Suivez les événements LGBTQ+, la vie nocturne queer et les rendez-vous sélectionnés par ville avec des signaux de la communauté." : metadata.description,
    alternates: localizedAlternates("/events", locale),
    openGraph: { ...metadata.openGraph, title: isSpanish ? "Eventos LGBTQ+ | Queer Atlas" : isGerman ? "LGBTQ+ Events | Queer Atlas" : isFrench ? "Événements LGBTQ+ | Queer Atlas" : metadata.openGraph.title, description: isSpanish ? "Encuentra eventos LGBTQ+, calendarios de vida nocturna queer y actividad ciudad por ciudad." : isGerman ? "Finde LGBTQ+ Events, queere Nachtleben-Kalender und Aktivitäten nach Stadt." : isFrench ? "Trouvez des événements LGBTQ+, des calendriers de vie nocturne queer et l'activité ville par ville." : metadata.openGraph.description, url: localizedOpenGraphUrl("/events", locale), locale: openGraphLocale(locale) },
    twitter: { ...metadata.twitter, title: isSpanish ? "Calendario de eventos LGBTQ+ | Queer Atlas" : metadata.twitter.title, description: isSpanish ? "Sigue vida nocturna queer, eventos locales y señales inclusivas." : metadata.twitter.description },
  };
}

export default function EventsLayout({ children }) {
  return children;
}
