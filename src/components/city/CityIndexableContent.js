import Link from "next/link";
import { buildEventPath, buildVenuePath, normalizeCitySlug } from "@/lib/seo/entitySlug";
import { localePath } from "@/lib/seo/localizedSeo";
import { isUpcomingPublishedEvent } from "@/lib/publicInventory";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";
import { evaluateEventSeoQuality, evaluateVenueSeoQuality } from "@/lib/seo/entityIndexing";

const COPY = {
  en: { overview: "{city} at a glance", places: "Places to explore", events: "Coming up", moreVenues: "View all {city} venues", moreEvents: "View all {city} events", noVenues: "Venue details are protected for this destination.", noEvents: "No upcoming published events yet." },
  es: { overview: "{city} de un vistazo", places: "Lugares para explorar", events: "Próximamente", moreVenues: "Ver todos los lugares de {city}", moreEvents: "Ver todos los eventos de {city}", noVenues: "Los detalles de los lugares están protegidos para este destino.", noEvents: "Aún no hay eventos publicados próximos." },
  de: { overview: "{city} im Überblick", places: "Orte zum Entdecken", events: "Demnächst", moreVenues: "Alle Orte in {city} ansehen", moreEvents: "Alle Events in {city} ansehen", noVenues: "Ortsdetails sind für dieses Reiseziel geschützt.", noEvents: "Derzeit gibt es keine veröffentlichten kommenden Events." },
  fr: { overview: "{city} en bref", places: "Lieux à découvrir", events: "À venir", moreVenues: "Voir tous les lieux à {city}", moreEvents: "Voir tous les événements à {city}", noVenues: "Les détails des lieux sont protégés pour cette destination.", noEvents: "Aucun événement à venir n’est encore publié." },
};

function text(locale) {
  return COPY[locale] || COPY.en;
}

function preview(items, count) {
  return items.slice(0, count);
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

export default function CityIndexableContent({ city, cityName, locale = "en", guide = [], venues = [], events = [] }) {
  const copy = text(locale);
  const restricted = isVenueAccessRestricted(city);
  const cityVenues = preview(venues.filter((venue) => normalizeCitySlug(venue?.city) === city && evaluateVenueSeoQuality(venue).indexable), 3);
  const cityEvents = preview(events.filter((event) => normalizeCitySlug(event?.city) === city && isUpcomingPublishedEvent(event) && evaluateEventSeoQuality(event).indexable), 2);
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

      <div className={`grid gap-8 ${guideText ? "mt-8" : ""} lg:grid-cols-2`}>
        <section aria-labelledby="city-venues-heading">
          <h2 id="city-venues-heading" className="text-base font-semibold text-white">{copy.places}</h2>
          {restricted ? <p className="mt-3 text-sm text-white/70">{copy.noVenues}</p> : cityVenues.length ? (
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {cityVenues.map((venue) => (
                <li key={String(venue.id)} className="py-3 first:pt-3 last:pb-3">
                  <Link href={localePath(buildVenuePath(city, venue), locale)} className="font-medium text-cyan-100 underline-offset-4 hover:underline">{venue.name}</Link>
                  {venue.type ? <p className="mt-0.5 text-xs text-white/55">{String(venue.type)}</p> : null}
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-white/70">{copy.noVenues}</p>}
          <Link href={`${cityPath}/directory`} className="mt-4 inline-flex text-sm font-medium text-cyan-100 underline underline-offset-4">{copyWithCity(copy.moreVenues, cityName)}</Link>
        </section>

        <section aria-labelledby="city-events-heading">
          <h2 id="city-events-heading" className="text-base font-semibold text-white">{copy.events}</h2>
          {cityEvents.length ? (
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {cityEvents.map((event) => (
                <li key={String(event.id)} className="py-3 first:pt-3 last:pb-3">
                  <Link href={localePath(buildEventPath(city, event), locale)} className="font-medium text-violet-100 underline-offset-4 hover:underline">{event.name}</Link>
                  {event.startDate || event.date ? <p className="mt-0.5 text-xs text-white/55">{String(event.startDate || event.date)}</p> : null}
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-white/70">{copy.noEvents}</p>}
          <Link href={`${cityPath}/events`} className="mt-4 inline-flex text-sm font-medium text-violet-100 underline underline-offset-4">{copyWithCity(copy.moreEvents, cityName)}</Link>
        </section>
      </div>
    </section>
  );
}
