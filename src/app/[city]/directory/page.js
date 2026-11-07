import Link from "next/link";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey, cityNameFromConfig } from "@/features/city/checkinFeature";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { isPublishedEntity } from "@/lib/publicInventory";
import { evaluateVenueSeoQuality } from "@/lib/seo/entityIndexing";
import { buildVenuePath } from "@/lib/seo/entitySlug";
import { cityPath } from "@/lib/cityRouting";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";
import { normalizeLocale } from "@/lib/i18n/locales";
import { createPageMetadata } from "@/lib/seo/pageMetadata";

export const revalidate = 300;

const PAGE_SIZE = 24;

function pageNumber(value) {
  const parsed = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function getDirectoryVenues(city) {
  try {
    const { data } = await fetchPlacesForAtlas({ filters: { city } });
    return (data || [])
      .filter((venue) => isPublishedEntity(venue) && evaluateVenueSeoQuality(venue).indexable)
      .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params, searchParams }) {
  const city = normalizeCityKey((await params)?.city);
  const config = await getCityRegistryEntry(city);
  if (!config || isVenueAccessRestricted(city)) return { robots: { index: false, follow: false } };

  const page = pageNumber((await searchParams)?.page);
  const cityName = cityNameFromConfig(config, city);
  const path = `${cityPath(city)}/directory`;
  const metadata = createPageMetadata({
    path,
    locale: normalizeLocale((await headers()).get("x-qa-locale")),
    title: `Verified queer venues in ${cityName} | Queer Atlas`,
    description: `Browse source-backed queer venues in ${cityName}, with practical local context and direct venue guides.`,
  });

  return page > 1 ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function CityDirectoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const requestedCity = String(resolvedParams?.city || "");
  const city = normalizeCityKey(requestedCity);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();
  if (requestedCity.includes("_")) permanentRedirect(`${cityPath(city)}/directory`);

  const cityName = cityNameFromConfig(config, city);
  const restricted = isVenueAccessRestricted(city);
  const venues = restricted ? [] : await getDirectoryVenues(city);
  const page = pageNumber((await searchParams)?.page);
  const pageCount = Math.max(1, Math.ceil(venues.length / PAGE_SIZE));
  if (page > pageCount) notFound();
  const pageVenues = venues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const basePath = `${cityPath(city)}/directory`;

  return (
    <main className="qa-page min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <Link href={cityPath(city)} className="text-sm text-cyan-100 underline underline-offset-4">Back to {cityName}</Link>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Queer Atlas directory</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Verified queer venues in {cityName}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">Source-backed venue guides with practical local context. Only venues that meet our publication standard appear here.</p>

        {restricted ? (
          <p className="mt-8 rounded-2xl border border-amber-100/20 bg-amber-100/[0.06] p-5 text-sm leading-6 text-amber-50/85">Venue details are protected for this destination.</p>
        ) : pageVenues.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageVenues.map((venue) => (
              <li key={String(venue.id)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">{venue.type || "Venue"}</p>
                <Link href={buildVenuePath(city, venue)} className="mt-2 block text-lg font-semibold text-cyan-50 underline-offset-4 hover:underline">{venue.name}</Link>
                {venue.location ? <p className="mt-2 text-sm text-white/58">{venue.location}</p> : null}
                {venue.description ? <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/70">{venue.description}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-white/70">No verified venue guides are published for {cityName} yet.</p>
        )}

        {pageCount > 1 ? (
          <nav className="mt-10 flex items-center justify-between border-t border-white/10 pt-5" aria-label="Venue directory pages">
            {page > 1 ? <Link href={page === 2 ? basePath : `${basePath}?page=${page - 1}`} className="text-sm font-medium text-cyan-100 underline underline-offset-4">Previous page</Link> : <span />}
            <span className="text-sm text-white/60">Page {page} of {pageCount}</span>
            {page < pageCount ? <Link href={`${basePath}?page=${page + 1}`} className="text-sm font-medium text-cyan-100 underline underline-offset-4">Next page</Link> : <span />}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
