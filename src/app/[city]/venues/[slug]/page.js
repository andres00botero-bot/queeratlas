import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCoreConfig } from "@/lib/cityCore";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import {
  buildEntitySlug,
  buildVenuePath,
  normalizeCitySlug,
  parseEntitySlug,
  placeMatchesSlug,
} from "@/lib/seo/entitySlug";

export const revalidate = 300;

function resolveCityValue(input = "") {
  return normalizeCitySlug(input);
}

async function findVenueByParams(cityParam = "", slugParam = "") {
  const city = resolveCityValue(cityParam);
  const slug = String(slugParam || "").trim();
  if (!city || !slug) return { city, place: null };

  const coreConfig = cityCoreConfig[city] || null;
  if (!coreConfig) return { city, place: null };

  const { data: allPlaces } = await fetchPlacesForAtlas();
  const cityPlaces = (Array.isArray(allPlaces) ? allPlaces : []).filter(
    (row) => normalizeCityKey(String(row?.city || "")) === city
  );

  const parsed = parseEntitySlug(slug);
  const byId = parsed.id
    ? cityPlaces.find((row) => String(row?.id || "") === parsed.id) || null
    : null;
  const bySlug = cityPlaces.find((row) => placeMatchesSlug(row, slug)) || null;
  const place = byId || bySlug;

  return { city, place, coreConfig };
}

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

  const payload = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${canonicalUrl}#place`,
    name: String(place?.name || ""),
    description: String(place?.description || "").trim() || `${String(place?.name || "")} in ${cityName}.`,
    url: canonicalUrl,
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

  if (reviewCount > 0 && ratingValue > 0) {
    payload.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
    };
  }

  return payload;
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

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
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

  if (!place || !coreConfig) {
    notFound();
  }

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildVenuePath(city, place);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const placeJsonLd = buildPlaceJsonLd({ place, city, cityName });
  const fallbackSlug = buildEntitySlug(place.name, place.id);
  const discoverLinks = buildVenueDiscoverLinks({
    city,
    cityName,
    placeType: place?.type,
  });

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Venue Detail</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{place.name}</h1>
          <p className="mt-2 text-sm text-white/70">
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
        </header>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">About this venue</h2>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {String(place?.description || "").trim() || `${place.name} is part of ${cityName}'s live queer nightlife network.`}
          </p>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Practical details</h2>
          <div className="mt-3 space-y-2 text-sm text-white/82">
            <p>
              <span className="text-white/55">Address:</span> {String(place?.location || cityName)}
            </p>
            <p>
              <span className="text-white/55">Hours:</span>{" "}
              {String(place?.hours || "").trim() || "Hours vary by night; verify before going."}
            </p>
            {place?.link ? (
              <p>
                <span className="text-white/55">Official link:</span>{" "}
                <a
                  href={String(place.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-100 underline decoration-cyan-200/45 underline-offset-2"
                >
                  {String(place.link)}
                </a>
              </p>
            ) : null}
            <p>
              <span className="text-white/55">Canonical:</span>{" "}
              <a href={canonicalUrl} className="text-cyan-100 underline decoration-cyan-200/45 underline-offset-2">
                {canonicalUrl}
              </a>
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Related planning routes</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
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
          <Link
            href={`/${city}?placeId=${encodeURIComponent(String(place.id))}`}
            className="rounded-full border border-cyan-200/26 bg-cyan-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100"
          >
            Open in city panel
          </Link>
          <span className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/52">
            slug: {fallbackSlug}
          </span>
        </nav>
      </div>
    </main>
  );
}
