import { notFound } from "next/navigation";
import EventsPage from "../page";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

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
};

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventsPage initialSection={config.sectionId} />
    </>
  );
}
