import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { createPageMetadata } from "@/lib/seo/pageMetadata";

const metadata = {
  title: "LGBTQ+ Events & Pride Calendar 2026",
  description:
    "Track LGBTQ events, queer nightlife events, and curated city-level happenings with live community signal.",
  alternates: {
    canonical: "/events",
  },
};

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  const isGerman = locale === "de";
  const isFrench = locale === "fr";
  const title = isSpanish ? "Calendario de eventos LGBTQ+" : isGerman ? "Queerer Eventkalender" : isFrench ? "Calendrier des événements LGBTQ+" : metadata.title;
  const description = isSpanish ? "Sigue eventos LGBTQ+, vida nocturna queer y actividades seleccionadas por ciudad con señales de comunidad en directo." : isGerman ? "Finde LGBTQ+ Events, queeres Nachtleben und kuratierte Veranstaltungen nach Stadt – mit aktuellen Community-Hinweisen." : isFrench ? "Suivez les événements LGBTQ+, la vie nocturne queer et les rendez-vous sélectionnés par ville avec des signaux de la communauté." : metadata.description;
  return { ...metadata, ...createPageMetadata({ path: "/events", locale, title, description }) };
}

export default function EventsLayout({ children }) {
  return children;
}
