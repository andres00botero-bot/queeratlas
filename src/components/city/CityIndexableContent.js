import Link from "next/link";
import { localePath } from "@/lib/seo/localizedSeo";

const COPY = {
  en: { overview: "{city} at a glance", moreVenues: "View all {city} venues", moreEvents: "View all {city} events" },
  es: { overview: "{city} de un vistazo", moreVenues: "Ver todos los lugares de {city}", moreEvents: "Ver todos los eventos de {city}" },
  de: { overview: "{city} im Überblick", moreVenues: "Alle Orte in {city} ansehen", moreEvents: "Alle Events in {city} ansehen" },
  fr: { overview: "{city} en bref", moreVenues: "Voir tous les lieux à {city}", moreEvents: "Voir tous les événements à {city}" },
};

function text(locale) {
  return COPY[locale] || COPY.en;
}

function compactText(value, limit = 300) {
  const textValue = String(value || "").replace(/\s+/g, " ").trim();
  if (textValue.length <= limit) return textValue;
  const cutoff = textValue.lastIndexOf(" ", limit - 1);
  return `${textValue.slice(0, cutoff > 0 ? cutoff : limit).trim()}…`;
}

function copyWithCity(value, cityName) {
  return String(value || "").replace("{city}", cityName);
}

export default function CityIndexableContent({ city, cityName, locale = "en", guide = [] }) {
  const copy = text(locale);
  const cityPath = localePath(`/${city}`, locale);
  const guideEntry = guide.find(Boolean);
  const guideTitle = typeof guideEntry === "object" ? String(guideEntry?.title || "").trim() : "";
  const guideText = compactText(typeof guideEntry === "object" ? guideEntry?.text || guideEntry?.description : guideEntry);

  return (
    <section className="mt-10 border-t border-white/10 pt-8 text-white" aria-label={`${cityName} guide and directory links`}>
      {guideText ? (
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copyWithCity(copy.overview, cityName)}</h2>
          {guideTitle ? <p className="mt-3 text-sm font-medium text-white/90">{guideTitle}</p> : null}
          <p className="mt-2 text-sm leading-6 text-white/70">{guideText}</p>
        </div>
      ) : null}

      <nav aria-label={cityName} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={`${cityPath}/directory`} className="py-2 text-cyan-100 underline underline-offset-4">{copyWithCity(copy.moreVenues, cityName)}</Link>
        <Link href={`${cityPath}/events`} className="py-2 text-violet-100 underline underline-offset-4">{copyWithCity(copy.moreEvents, cityName)}</Link>
      </nav>
    </section>
  );
}
