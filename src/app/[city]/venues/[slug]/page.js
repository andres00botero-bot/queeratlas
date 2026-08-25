import Link from "next/link";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import {
  buildEntitySlug,
  buildVenuePath,
  normalizeCitySlug,
  parseEntitySlug,
  placeMatchesSlug,
} from "@/lib/seo/entitySlug";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { evaluateVenueSeoQuality } from "@/lib/seo/entityIndexing";
import {
  schemaTypeForVenue,
  supportsVenueAggregateRating,
} from "@/lib/seo/venueStructuredData";
import VenuePracticalIntel from "@/components/city/VenuePracticalIntel";
import CityPanelButton from "@/components/city/CityPanelButton";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";
import { ArrowLeft, MapPin } from "lucide-react";

export const revalidate = 300;

function resolveCityValue(input = "") {
  return normalizeCitySlug(input);
}

function normalizedExternalIdentity(value = "") {
  try {
    const url = new URL(String(value || ""));
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, "").toLowerCase();
    return hostname ? `${hostname}${pathname}` : "";
  } catch {
    return "";
  }
}

const findVenueByParams = cache(async (cityParam = "", slugParam = "") => {
  const city = resolveCityValue(cityParam);
  const slug = String(slugParam || "").trim();
  if (!city || !slug) return { city, place: null };

  const coreConfig = await getCityRegistryEntry(city);
  if (!coreConfig) return { city, place: null };

  const parsed = parseEntitySlug(slug);
  const isDatabaseId = Boolean(parsed.id && !parsed.id.startsWith("seed-"));
  const { data: allPlaces } = await fetchPlacesForAtlas({
    filters: isDatabaseId ? { city, id: parsed.id } : { city },
    mergeSeed: !isDatabaseId,
  });
  const cityPlaces = (Array.isArray(allPlaces) ? allPlaces : []).filter(
    (row) => normalizeCityKey(String(row?.city || "")) === city
  );

  const byId = parsed.id
    ? cityPlaces.find((row) => String(row?.id || "") === parsed.id) || null
    : null;
  const bySlug = cityPlaces.find((row) => placeMatchesSlug(row, slug)) || null;
  const matchedPlace = byId || bySlug;
  const matchedOfficialIdentity = normalizedExternalIdentity(matchedPlace?.link);
  const databaseDuplicate = String(matchedPlace?.id || "").startsWith("seed-") && matchedOfficialIdentity
    ? cityPlaces.find((row) =>
        !String(row?.id || "").startsWith("seed-") &&
        normalizedExternalIdentity(row?.link) === matchedOfficialIdentity
      ) || null
    : null;
  const place = databaseDuplicate || matchedPlace;

  return { city, place, coreConfig };
});

function toAbsoluteUrl(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.queeratlas.app";
  return `${String(baseUrl).replace(/\/+$/, "")}${path}`;
}

function buildVenueDiscoverLinks({ city, cityName, placeType }) {
  const normalizedType = String(placeType || "").toLowerCase();
  const byType = {
    club: "queer-clubs",
    bar: "queer-bars",
    cafe: "queer-cafes",
    hotel: "queer-hotels",
    sauna: "gay-sauna-guide",
    cruise_club: "underground-queer-nightlife",
    cruising_area: "queer-safe-areas",
  };
  const primaryKey = byType[normalizedType] || "queer-bars";
  const topicHub = ["cafe", "hotel"].includes(normalizedType) ? "/topics/cafes" : "/topics/nightlife";

  return [
    {
      href: `/${city}/discover/${primaryKey}`,
      label: `Best Matching Route in ${cityName}`,
    },
    {
      href: `/${city}/discover/safest-queer-bars`,
      label: `Safer Queer Bars in ${cityName}`,
    },
    {
      href: `/${city}/discover/events-tonight`,
      label: `LGBTQ Events Tonight in ${cityName}`,
    },
    {
      href: topicHub,
      label: "Compare This Topic Across Cities",
    },
  ];
}

function buildPlaceJsonLd({ place, city, cityName }) {
  const canonicalPath = buildVenuePath(city, place);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const maybeLat = Number(place?.lat);
  const maybeLng = Number(place?.lng);
  const hasGeo = Number.isFinite(maybeLat) && Number.isFinite(maybeLng);
  const reviewCount = Number(place?.reviewCount || 0);
  const ratingValue = Number(place?.avgRating || 0);
  const schemaType = schemaTypeForVenue(place?.type);

  const payload = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${canonicalUrl}#place`,
    name: String(place?.name || ""),
    description: String(place?.description || "").trim() || `${String(place?.name || "")} in ${cityName}.`,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: String(place?.location || cityName),
      addressLocality: cityName,
    },
  };

  if (hasGeo) {
    payload.geo = {
      "@type": "GeoCoordinates",
      latitude: maybeLat,
      longitude: maybeLng,
    };
  }

  if (place?.link) {
    payload.sameAs = [String(place.link)];
  }

  if (
    reviewCount > 0 &&
    ratingValue > 0 &&
    supportsVenueAggregateRating(place?.type)
  ) {
    payload.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
    };
  }

  return payload;
}

function buildVenueDetailBreadcrumbJsonLd({ city, cityName, place, canonicalUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Cities", item: toAbsoluteUrl("/cities") },
      { "@type": "ListItem", position: 3, name: cityName, item: toAbsoluteUrl(`/${city}`) },
      { "@type": "ListItem", position: 4, name: "Venues", item: toAbsoluteUrl(`/${city}`) },
      { "@type": "ListItem", position: 5, name: String(place?.name || "Venue"), item: canonicalUrl },
    ],
  };
}

function buildVenueDetailWebPageJsonLd({ cityName, canonicalUrl, placeJsonLdId }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `Venue detail: ${cityName}`,
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    mainEntity: {
      "@id": placeJsonLdId,
    },
  };
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const { city, place, coreConfig } = await findVenueByParams(resolved?.city, resolved?.slug);

  if (!place || !coreConfig) {
    return {
      title: "Venue Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildVenuePath(city, place);
  const title = `${place.name} (${cityName}) | Queer Atlas Venue Guide`;
  const description =
    String(place?.description || "").trim() ||
    `${place.name} in ${cityName}: opening hours, vibe, location, and trusted queer nightlife context.`;
  const quality = evaluateVenueSeoQuality(place);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: quality.indexable && coreConfig.seoIndexable !== false
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityVenueDetailPage({ params }) {
  const resolved = await params;
  const { city, place, coreConfig } = await findVenueByParams(resolved?.city, resolved?.slug);

  if (!coreConfig) {
    notFound();
  }

  if (!place) notFound();

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildVenuePath(city, place);
  const canonicalSlug = canonicalPath.split("/").filter(Boolean).at(-1) || "";
  if (canonicalSlug !== String(resolved?.slug || "").trim()) {
    permanentRedirect(canonicalPath);
  }
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const placeJsonLd = buildPlaceJsonLd({ place, city, cityName });
  const breadcrumbJsonLd = buildVenueDetailBreadcrumbJsonLd({
    city,
    cityName,
    place,
    canonicalUrl,
  });
  const webPageJsonLd = buildVenueDetailWebPageJsonLd({
    cityName,
    canonicalUrl,
    placeJsonLdId: placeJsonLd["@id"],
  });
  const fallbackSlug = buildEntitySlug(place.name, place.id);
  const discoverLinks = buildVenueDiscoverLinks({
    city,
    cityName,
    placeType: place?.type,
  });

  return (
    <main className="min-h-screen bg-[#050505] px-3.5 py-4 text-white sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <div className="mx-auto max-w-4xl space-y-3.5 sm:space-y-6">
        <nav className="sticky top-2 z-40 -mx-0.5 flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-white/14 bg-[#090a0ee8] px-2.5 shadow-[0_14px_38px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:static sm:hidden">
          <Link href={`/${city}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-white/88">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {cityName}
          </Link>
          <CityPanelButton city={city} entityKind="place" entityId={String(place.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-200/24 bg-cyan-200/10 px-3 text-xs font-semibold text-cyan-50">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            City panel
          </CityPanelButton>
        </nav>
        <header className="rounded-[22px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Venue Detail</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{place.name}</h1>
          <CityPanelButton
            city={city}
            entityKind="place"
            entityId={String(place.id)}
            className="group relative mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-cyan-100/55 bg-[linear-gradient(105deg,rgba(8,145,178,0.34),rgba(124,58,237,0.34),rgba(219,39,119,0.28))] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_34px_rgba(34,211,238,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-50/80 hover:shadow-[0_16px_42px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909] sm:w-auto"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_22%_50%,rgba(103,232,249,0.28),transparent_44%)] motion-reduce:animate-none"
            />
            <MapPin className="relative h-4 w-4 shrink-0 text-cyan-100" aria-hidden="true" />
            <span className="relative">Open {place.name} in the {cityName} city guide</span>
            <span className="relative text-cyan-100 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </CityPanelButton>
          <p className="mt-2 hidden text-sm text-white/70 sm:block">
            {cityName} venue intelligence with route context, hours, and trusted local signal.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              Type: {String(place?.type || "place")}
            </span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              Rating: {Number.isFinite(Number(place?.avgRating)) ? Number(place.avgRating).toFixed(1) : "-"}
            </span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              Reviews: {Number(place?.reviewCount || 0)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(place?.location || `${place.name}, ${cityName}`))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cyan-200/28 bg-cyan-200/12 px-3 text-sm font-semibold text-cyan-50"
            >
              Directions
            </a>
            {place?.link ? (
              <OfficialExternalLink href={String(place.link)} kind="venue" className="min-h-12" />
            ) : (
              <CityPanelButton city={city} entityKind="place" entityId={String(place.id)} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 text-sm font-semibold text-fuchsia-50">
                Open panel
              </CityPanelButton>
            )}
          </div>
        </header>

        <section className="rounded-[20px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[24px] sm:p-6">
          <h2 className="text-lg font-semibold">About this venue</h2>
          <p className="qa-clamp-3 mt-2 text-sm leading-6 text-white/82 sm:mt-3 sm:line-clamp-none sm:leading-7">
            {String(place?.description || "").trim() || `${place.name} is part of ${cityName}'s live queer nightlife network.`}
          </p>
        </section>

        <section className="rounded-[20px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[24px] sm:p-6">
          <h2 className="text-lg font-semibold">Practical details</h2>
          <div className="mt-3 space-y-2 text-sm text-white/82">
            <p>
              <span className="text-white/55">Address:</span> {String(place?.location || cityName)}
            </p>
            <p>
              <span className="text-white/55">Hours:</span>{" "}
              {String(place?.hours || "").trim() || "Hours vary by night; verify before going."}
            </p>
            <p className="hidden sm:block">
              <span className="text-white/55">Canonical:</span>{" "}
              <a href={canonicalUrl} className="text-cyan-100 underline decoration-cyan-200/45 underline-offset-2">
                {canonicalUrl}
              </a>
            </p>
          </div>
          {place?.link ? (
            <OfficialExternalLink
              href={String(place.link)}
              kind="venue"
              className="mt-4 hidden sm:mt-6 sm:flex sm:max-w-sm"
            />
          ) : null}
        </section>

        <VenuePracticalIntel place={place} />

        <section className="rounded-[20px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-4 sm:rounded-[24px] sm:p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Related planning routes</h2>
          <p className="mt-2 hidden text-sm leading-7 text-cyan-50/84 sm:block">
            Keep decisions fast with route-based fallbacks built for same-night shifts, safer pivots, and better venue sequencing.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {discoverLinks.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1 text-xs text-cyan-50 transition hover:border-cyan-100/45"
              >
                {entry.label}
              </Link>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-2">
          <Link
            href={`/${city}`}
            className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/84"
          >
            Back to {cityName}
          </Link>
          <CityPanelButton
            city={city}
            entityKind="place"
            entityId={String(place.id)}
            className="rounded-full border border-cyan-200/26 bg-cyan-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100"
          >
            Open in city panel
          </CityPanelButton>
          <span className="hidden rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/52 sm:inline-flex">
            slug: {fallbackSlug}
          </span>
        </nav>
      </div>
    </main>
  );
}
