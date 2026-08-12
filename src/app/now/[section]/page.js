import { notFound } from "next/navigation";
import NowPage from "../page";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

const NOW_SECTIONS = {
  news: {
    sectionId: "mixed",
    title: "Queer News Feed | LGBTQ Travel, Culture & Community",
    name: "Queer Atlas News Feed",
    description: "Follow current queer travel, nightlife, culture, rights, and community stories selected by Queer Atlas.",
  },
  rankings: {
    sectionId: "rankings",
    title: "Queer City Rankings | Safety & Nightlife Index 2026",
    name: "Queer Atlas Rankings",
    description: "Explore evidence-based queer city rankings, including the Queer Safety Index and Nightlife Index, with transparent methods and sources.",
  },
  voices: {
    sectionId: "voices",
    title: "Queer Voices | Community Stories & Local Perspectives",
    name: "Queer Voices",
    description: "Read community-led queer stories, local perspectives, and lived experiences from destinations around the world.",
  },
  "happening-soon": {
    sectionId: "happening",
    title: "Queer Events Happening Soon | Queer Atlas",
    name: "Queer Events Happening Soon",
    description: "Discover upcoming LGBTQ events and queer community happenings across Queer Atlas destinations.",
  },
};

export function generateStaticParams() {
  return Object.keys(NOW_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  const config = NOW_SECTIONS[section];
  if (!config) return {};
  const canonical = `/now/${section}`;

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
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

export default async function NowSectionPage({ params }) {
  const { section } = await params;
  const config = NOW_SECTIONS[section];
  if (!config) notFound();

  const url = `${QA_SITE_URL}/now/${section}`;
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
          { "@type": "ListItem", position: 2, name: "Now", item: `${QA_SITE_URL}/now/news` },
          { "@type": "ListItem", position: 3, name: config.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NowPage initialSection={config.sectionId} />
    </>
  );
}
