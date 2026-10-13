import { notFound } from "next/navigation";
import Link from "next/link";
import EventsPage from "../page";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { fetchPublicEventData } from "@/lib/publicEventData";
import { buildEventPath } from "@/lib/seo/entitySlug";

export const revalidate = 60;

const EVENT_SECTIONS = {
  calendar: {
    sectionId: "calendar",
    title: "Queer Events Calendar | LGBTQ Events Worldwide",
    name: "Queer Events Calendar",
    description: "Browse LGBTQ events, queer nightlife, Pride dates, and community happenings by date and destination.",
    index: true,
  },
  "off-grid": {
    sectionId: "offgrid",
    title: "Off-grid Queer Events | Community & Underground Listings",
    name: "Off-grid Queer Events",
    description: "Discover independent, underground, and community-led queer events beyond the mainstream calendar.",
    index: true,
  },
  search: {
    sectionId: "search",
    title: "Search Queer Events | Queer Atlas",
    name: "Search Queer Events",
    description: "Search the Queer Atlas event calendar by date, city, or vibe.",
    index: false,
  },
  "happening-soon": {
    sectionId: "happening",
    title: "Queer Events Happening Soon | Queer Atlas",
    name: "Queer Events Happening Soon",
    description: "Discover LGBTQ events happening tonight, this weekend, and over the next 30 days across Queer Atlas destinations.",
    index: true,
  },
};

function formatEventDate(event = {}) {
  const start = String(event?.startDate || event?.start_date || event?.date || "").slice(0, 10);
  const end = String(event?.endDate || event?.end_date || start).slice(0, 10);
  if (!start) return "Date TBA";
  if (!end || end === start) return start;
  return `${start} – ${end}`;
}

function eventHref(event = {}) {
  if (event?.isGlobal) return `/events/off-grid?offgridEventId=global-${encodeURIComponent(String(event.id || ""))}`;
  return buildEventPath(event.city, event);
}

function EventHighlights({ section, eventData }) {
  const allEvents = section === "offgrid"
    ? eventData?.globalEvents || []
    : [...(eventData?.events || []), ...(eventData?.globalEvents || [])];
  const highlights = allEvents.slice(0, 12);
  if (highlights.length === 0) return null;

  return (
    <section className="qa-page bg-[#050608] px-4 pb-12 text-white sm:px-6" aria-labelledby="upcoming-event-highlights">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">Current public listings</p>
        <h2 id="upcoming-event-highlights" className="mt-2 text-2xl font-semibold">Upcoming queer events</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((event) => (
            <li key={`${event.isGlobal ? "global" : "city"}-${event.id}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <Link href={eventHref(event)} className="font-medium text-white hover:text-cyan-100">
                {event.name}
              </Link>
              <p className="mt-2 text-sm text-white/65">{formatEventDate(event)} · {event.isGlobal ? "Global" : String(event.city || "")}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function generateStaticParams() {
  return Object.keys(EVENT_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  const config = EVENT_SECTIONS[section];
  if (!config) return {};
  const canonical = `/events/${section}`;

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical },
    robots: { index: config.index, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
  };
}

export default async function EventSectionPage({ params }) {
  const { section } = await params;
  const config = EVENT_SECTIONS[section];
  if (!config) notFound();

  const url = `${QA_SITE_URL}/events/${section}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: config.name,
        description: config.description,
        isPartOf: { "@id": QA_WEBSITE_ID },
        publisher: { "@id": QA_ORGANIZATION_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: QA_SITE_URL },
          { "@type": "ListItem", position: 2, name: "Events", item: `${QA_SITE_URL}/events/calendar` },
          { "@type": "ListItem", position: 3, name: config.name, item: url },
        ],
      },
    ],
  };

  let initialEventData = null;
  try {
    initialEventData = await fetchPublicEventData();
  } catch {
    // The client keeps its existing live-data fallback if the server source is temporarily unavailable.
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventsPage
        initialSection={config.sectionId}
        initialEvents={initialEventData?.events}
        initialGlobalEvents={initialEventData?.globalEvents}
      />
      {config.sectionId !== "search" ? <EventHighlights section={config.sectionId} eventData={initialEventData} /> : null}
    </>
  );
}
