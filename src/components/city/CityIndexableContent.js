import Link from "next/link";
import { buildEventPath, buildVenuePath, normalizeCitySlug } from "@/lib/seo/entitySlug";
import { localePath } from "@/lib/seo/localizedSeo";
import { isUpcomingPublishedEvent } from "@/lib/publicInventory";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";

const COPY = {
  en: { guide: "City guide", venues: "Trusted queer venues", events: "Upcoming queer events", moreVenues: "Explore all venues", moreEvents: "Explore all events", noVenues: "Venue details are protected for this destination.", noEvents: "No upcoming published events yet." },
  es: { guide: "Guía de la ciudad", venues: "Lugares queer de confianza", events: "Próximos eventos queer", moreVenues: "Explorar todos los lugares", moreEvents: "Explorar todos los eventos", noVenues: "Los detalles de los lugares están protegidos para este destino.", noEvents: "Aún no hay eventos publicados próximos." },
  de: { guide: "Stadtguide", venues: "Vertrauenswürdige queere Orte", events: "Kommende queere Events", moreVenues: "Alle Orte entdecken", moreEvents: "Alle Events entdecken", noVenues: "Ortsdetails sind für dieses Reiseziel geschützt.", noEvents: "Derzeit gibt es keine veröffentlichten kommenden Events." },
  fr: { guide: "Guide de la ville", venues: "Lieux queer de confiance", events: "Prochains événements queer", moreVenues: "Explorer tous les lieux", moreEvents: "Explorer tous les événements", noVenues: "Les détails des lieux sont protégés pour cette destination.", noEvents: "Aucun événement à venir n’est encore publié." },
};

function text(locale) {
  return COPY[locale] || COPY.en;
}

function preview(items, count = 12) {
  return items.slice(0, count);
}

export default function CityIndexableContent({ city, cityName, locale = "en", guide = [], venues = [], events = [] }) {
  const copy = text(locale);
  const restricted = isVenueAccessRestricted(city);
  const cityVenues = preview(venues.filter((venue) => normalizeCitySlug(venue?.city) === city));
  const cityEvents = preview(events.filter((event) => normalizeCitySlug(event?.city) === city && isUpcomingPublishedEvent(event)));
  const cityPath = localePath(`/${city}`, locale);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 text-white sm:px-6" aria-label={`${cityName} search guide`}>
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{cityName}</h1>

        {guide.length > 0 ? (
          <section className="mt-7" aria-labelledby="city-guide-heading">
            <h2 id="city-guide-heading" className="text-xl font-semibold">{copy.guide}</h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-white/75">
              {guide.map((entry, index) => {
                const title = typeof entry === "object" ? String(entry?.title || "").trim() : "";
                const body = typeof entry === "object" ? String(entry?.text || entry?.description || "").trim() : String(entry || "").trim();
                if (!body) return null;
                return <article key={`${city}-guide-${index}`}>{title ? <h3 className="font-medium text-white">{title}</h3> : null}<p>{body}</p></article>;
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-8" aria-labelledby="city-venues-heading">
          <h2 id="city-venues-heading" className="text-xl font-semibold">{copy.venues}</h2>
          {restricted ? <p className="mt-3 text-sm text-white/70">{copy.noVenues}</p> : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cityVenues.map((venue) => (
                <li key={String(venue.id)} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <Link href={localePath(buildVenuePath(city, venue), locale)} className="font-medium text-cyan-100 underline-offset-4 hover:underline">{venue.name}</Link>
                  {venue.description ? <p className="mt-1 text-sm leading-5 text-white/65">{String(venue.description)}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <Link href={`${cityPath}/directory`} className="mt-4 inline-flex text-sm font-medium text-cyan-100 underline underline-offset-4">{copy.moreVenues}</Link>
        </section>

        <section className="mt-8" aria-labelledby="city-events-heading">
          <h2 id="city-events-heading" className="text-xl font-semibold">{copy.events}</h2>
          {cityEvents.length ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cityEvents.map((event) => (
                <li key={String(event.id)} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <Link href={localePath(buildEventPath(city, event), locale)} className="font-medium text-violet-100 underline-offset-4 hover:underline">{event.name}</Link>
                  {event.startDate || event.date ? <p className="mt-1 text-sm text-white/65">{String(event.startDate || event.date)}</p> : null}
                  {event.description ? <p className="mt-1 text-sm leading-5 text-white/65">{String(event.description)}</p> : null}
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-white/70">{copy.noEvents}</p>}
          <Link href={`${cityPath}/events`} className="mt-4 inline-flex text-sm font-medium text-violet-100 underline underline-offset-4">{copy.moreEvents}</Link>
        </section>
      </div>
    </section>
  );
}
