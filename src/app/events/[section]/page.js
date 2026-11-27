import { serializeJsonLd } from "@/lib/jsonLd";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import EventsPageClient from "../EventsPageClient";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { fetchPublicEventData } from "@/lib/publicEventData";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localePath, localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export function generateStaticParams() {
  return Object.keys(EVENT_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const { section } = await params;
  const config = EVENT_SECTIONS[section];
  if (!config) return {};
  const canonical = `/events/${section}`;

  return {
    title: config.title,
    description: config.description,
    alternates: localizedAlternates(canonical, locale),
    robots: { index: config.index, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: localizedOpenGraphUrl(canonical, locale),
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
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const { section } = await params;
  const config = EVENT_SECTIONS[section];
  if (!config) notFound();

  const url = `${QA_SITE_URL}${localePath(`/events/${section}`, locale)}`;
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
          { "@type": "ListItem", position: 1, name: "Home", item: `${QA_SITE_URL}${localePath("/", locale)}` },
          { "@type": "ListItem", position: 2, name: "Events", item: `${QA_SITE_URL}${localePath("/events/calendar", locale)}` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <EventsPageClient
        initialSection={config.sectionId}
        initialEvents={initialEventData?.events}
        initialGlobalEvents={initialEventData?.globalEvents}
      />
    </>
  );
}
