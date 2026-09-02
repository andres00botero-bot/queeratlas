import Link from "next/link";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import {
  buildEntitySlug,
  buildEventPath,
  eventMatchesSlug,
  normalizeCitySlug,
  parseEntitySlug,
} from "@/lib/seo/entitySlug";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { evaluateEventSeoQuality } from "@/lib/seo/entityIndexing";
import EntityPracticalIntel from "@/components/city/EntityPracticalIntel";
import CityPanelButton from "@/components/city/CityPanelButton";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";
import { ArrowLeft, MapPin } from "lucide-react";

export const revalidate = 300;

function toAbsoluteUrl(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.queeratlas.app";
  return `${String(baseUrl).replace(/\/+$/, "")}${path}`;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function buildEventDiscoverLinks({ city, cityName, vibeTags = [] }) {
  const hasElectronicSignal = vibeTags.some((tag) =>
    ["techno", "electronic", "underground", "industrial"].includes(String(tag || "").toLowerCase())
  );
  const nightlifeKey = hasElectronicSignal ? "queer-techno-clubs" : "queer-clubs";

  return [
    {
      href: `/${city}/discover/events-tonight`,
      label: `LGBTQ Events Tonight in ${cityName}`,
    },
    {
      href: `/${city}/discover/queer-events-this-week`,
      label: `Queer Events This Week in ${cityName}`,
    },
    {
      href: `/${city}/discover/${nightlifeKey}`,
      label: `Best Follow-up Nightlife Route in ${cityName}`,
    },
    {
      href: "/topics/events",
      label: "Compare Events Across Cities",
    },
  ];
}

const findEventByParams = cache(async (cityParam = "", slugParam = "") => {
  const city = normalizeCitySlug(cityParam);
  const slug = String(slugParam || "").trim();
  if (!city || !slug) return { city, event: null, coreConfig: null };

  const coreConfig = await getCityRegistryEntry(city);
  if (!coreConfig) return { city, event: null, coreConfig: null };

  const parsed = parseEntitySlug(slug);
  const isDatabaseId = Boolean(parsed.id && !parsed.id.startsWith("seed-"));
  let dbEvents = [];
  try {
    let query = supabase.from("events").select("*").eq("city", city);
    if (isDatabaseId) query = query.eq("id", parsed.id).limit(1);
    const { data } = await query;
    dbEvents = Array.isArray(data) ? data : [];
  } catch {
    dbEvents = [];
  }

  const merged = isDatabaseId ? dbEvents : await mergeSeedEventsAsync(dbEvents);
  const cityEvents = merged
    .map((row) => normalizeEventRange(row || {}))
    .filter((row) => normalizeCityKey(String(row?.city || "")) === city);

  const byId = parsed.id
    ? cityEvents.find((row) => String(row?.id || "") === parsed.id) || null
    : null;
  const bySlug = cityEvents.find((row) => eventMatchesSlug(row, slug)) || null;
  const event = byId || bySlug;

  return { city, event, coreConfig };
});

function buildEventJsonLd({ event, city, cityName }) {
  const canonicalPath = buildEventPath(city, event);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const normalizedEvent = normalizeEventRange(event);
  const maybeLat = Number(event?.lat);
  const maybeLng = Number(event?.lng);
  const hasGeo = Number.isFinite(maybeLat) && Number.isFinite(maybeLng);

  const payload = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${canonicalUrl}#event`,
    name: String(event?.name || ""),
    description:
      String(event?.description || "").trim() ||
      `${String(event?.name || "Event")} in ${cityName}.`,
    startDate: String(normalizedEvent.startDate || ""),
    endDate: String(normalizedEvent.endDate || normalizedEvent.startDate || ""),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
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
    location: {
      "@type": "Place",
      name: String(event?.location || cityName),
      address: String(event?.location || cityName),
    },
  };

  if (event?.link) {
    payload.sameAs = [String(event.link)];
  }

  if (hasGeo) {
    payload.location.geo = {
      "@type": "GeoCoordinates",
      latitude: maybeLat,
      longitude: maybeLng,
    };
  }

  return payload;
}

function buildEventDetailBreadcrumbJsonLd({ city, cityName, event, canonicalUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Cities", item: toAbsoluteUrl("/cities") },
      { "@type": "ListItem", position: 3, name: cityName, item: toAbsoluteUrl(`/${city}`) },
      { "@type": "ListItem", position: 4, name: "Events", item: toAbsoluteUrl("/events") },
      { "@type": "ListItem", position: 5, name: String(event?.name || "Event"), item: canonicalUrl },
    ],
  };
}

function buildEventDetailWebPageJsonLd({ cityName, canonicalUrl, eventJsonLdId }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `Event detail: ${cityName}`,
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    mainEntity: {
      "@id": eventJsonLdId,
    },
  };
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const { city, event, coreConfig } = await findEventByParams(
    resolved?.city,
    resolved?.slug
  );

  if (!event || !coreConfig) {
    return {
      title: "Event Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildEventPath(city, event);
  const normalizedEvent = normalizeEventRange(event);
  const title = `${event.name} (${cityName}) | Queer Atlas Event Guide`;
  const description =
    String(event?.description || "").trim() ||
    `${event.name} in ${cityName}: date, location, vibe and safer queer nightlife context.`;
  const quality = evaluateEventSeoQuality(event);

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
    other: {
      "event:start_date": String(normalizedEvent.startDate || ""),
      "event:end_date": String(normalizedEvent.endDate || normalizedEvent.startDate || ""),
    },
  };
}

export default async function CityEventDetailPage({ params }) {
  const resolved = await params;
  const { city, event, coreConfig } = await findEventByParams(
    resolved?.city,
    resolved?.slug
  );

  if (!event || !coreConfig) {
    notFound();
  }

  const cityName = cityNameFromConfig(coreConfig, city);
  const normalizedEvent = normalizeEventRange(event);
  const canonicalPath = buildEventPath(city, event);
  const canonicalSlug = canonicalPath.split("/").filter(Boolean).at(-1) || "";
  if (canonicalSlug !== String(resolved?.slug || "").trim()) {
    permanentRedirect(canonicalPath);
  }
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const eventJsonLd = buildEventJsonLd({ event, city, cityName });
  const breadcrumbJsonLd = buildEventDetailBreadcrumbJsonLd({
    city,
    cityName,
    event,
    canonicalUrl,
  });
  const webPageJsonLd = buildEventDetailWebPageJsonLd({
    cityName,
    canonicalUrl,
    eventJsonLdId: eventJsonLd["@id"],
  });
  const vibeTags = normalizeTags(event?.vibe_tags).slice(0, 6);
  const fallbackSlug = buildEntitySlug(event.name, event.id);
  const discoverLinks = buildEventDiscoverLinks({ city, cityName, vibeTags });
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
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
        <nav className="sticky top-2 z-40 flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-white/14 bg-[#090a0ee8] px-2.5 shadow-[0_14px_38px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:static sm:hidden">
          <Link href={`/${city}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-white/88">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {cityName}
          </Link>
          <CityPanelButton city={city} entityKind="event" entityId={String(event.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 text-xs font-semibold text-fuchsia-50">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            City panel
          </CityPanelButton>
        </nav>
        <header className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/78">
            Event Detail
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            {event.name}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {cityName} event intelligence with schedule context, vibe signal, and safer routing.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              Start: {normalizedEvent.startDate || "TBA"}
            </span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              End: {normalizedEvent.endDate || normalizedEvent.startDate || "TBA"}
            </span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">
              Vibe: {String(event?.vibe || "community event")}
            </span>
          </div>
          <CityPanelButton
            city={city}
            entityKind="event"
            entityId={String(event.id)}
            className="qa-event-panel-cta mt-5 flex w-full items-center justify-center rounded-2xl px-5 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white sm:text-base"
          >
            Open in city panel
          </CityPanelButton>
        </header>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="qa-copy-justify mt-3 text-sm leading-7 text-white/82">
            {String(event?.description || "").trim() ||
              `${event.name} is part of ${cityName}'s live queer event network.`}
          </p>
          {vibeTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-fuchsia-200/22 bg-fuchsia-200/12 px-3 py-1 text-xs uppercase tracking-[0.1em] text-fuchsia-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Practical details</h2>
          <div className="mt-3 space-y-2 text-sm text-white/82">
            <p>
              <span className="text-white/55">Address:</span>{" "}
              {String(event?.location || cityName)}
            </p>
            <p>
              <span className="text-white/55">Canonical:</span>{" "}
              <a
                href={canonicalUrl}
                className="text-cyan-100 underline decoration-cyan-200/45 underline-offset-2"
              >
                {canonicalUrl}
              </a>
            </p>
          </div>
          {event?.link ? (
            <OfficialExternalLink
              href={String(event.link)}
              kind="event"
              className="mt-6 sm:max-w-sm"
            />
          ) : null}
        </section>

        <EntityPracticalIntel entity={event} kind="event" compact={false} />

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Plan your next move</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            Use related city routes to keep momentum if plans shift, queues grow, or you want a stronger post-event sequence.
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
            entityKind="event"
            entityId={String(event.id)}
            className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100"
          >
            Open in city panel
          </CityPanelButton>
          <span className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/52">
            slug: {fallbackSlug}
          </span>
        </nav>
      </div>
    </main>
  );
}
