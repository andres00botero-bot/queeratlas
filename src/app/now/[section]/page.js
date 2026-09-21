import { notFound } from "next/navigation";
import { headers } from "next/headers";
import NowPage from "../page";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

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
  data: {
    sectionId: "data",
    title: "Global Queer Safety & Culture Index 2026 | Queer Atlas",
    name: "Global Queer Safety & Culture Index",
    description: "Explore the Global Queer Safety & Culture Index 2026: a transparent city comparison of LGBTQ safety, inclusion, community infrastructure, nightlife, and culture.",
  },
  voices: {
    sectionId: "voices",
    title: "Queer Voices, Member Stories & Local Guides | Queer Atlas",
    name: "Voices from the Atlas",
    description: "Read moderated member stories, practical local guides, field reports, and lived queer perspectives from destinations around the world.",
  },
};

const SPANISH_SECTION_METADATA = {
  news: { title: "Noticias queer | Viajes, cultura y comunidad LGBTQ", name: "Noticias de Queer Atlas", description: "Sigue las historias actuales de viajes queer, vida nocturna, cultura, derechos y comunidad seleccionadas por Queer Atlas." },
  rankings: { title: "Clasificaciones de ciudades queer | Índice de seguridad y vida nocturna 2026", name: "Clasificaciones de Queer Atlas", description: "Explora clasificaciones de ciudades queer basadas en evidencia, incluidos los índices de seguridad y vida nocturna, con métodos y fuentes transparentes." },
  data: { title: "Índice global de seguridad y cultura queer 2026 | Queer Atlas", name: "Índice global de seguridad y cultura queer", description: "Explora el Índice global de seguridad y cultura queer 2026: una comparación transparente entre ciudades sobre seguridad LGBTQ, inclusión, comunidad, vida nocturna y cultura." },
  voices: { title: "Voces queer, historias de miembros y guías locales | Queer Atlas", name: "Voces del Atlas", description: "Lee historias moderadas de miembros, guías locales prácticas, informes de campo y perspectivas queer vividas de destinos de todo el mundo." },
};

function sectionMetadata(section, locale) {
  const base = NOW_SECTIONS[section];
  return locale === "es" ? { ...base, ...SPANISH_SECTION_METADATA[section] } : base;
}

export function generateStaticParams() {
  return Object.keys(NOW_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-qa-locale"));
  const config = sectionMetadata(section, locale);
  if (!config) return {};
  const canonical = `/now/${section}`;

  return {
    title: config.title,
    description: config.description,
    alternates: localizedAlternates(canonical, locale),
    robots: { index: true, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: localizedOpenGraphUrl(canonical, locale),
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
  };
}

export default async function NowSectionPage({ params, searchParams }) {
  const { section } = await params;
  const query = await searchParams;
  const requestHeaders = await headers();
  const config = sectionMetadata(section, normalizeLocale(requestHeaders.get("x-qa-locale")));
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
      <NowPage
        initialSection={config.sectionId}
        initialDataQuery={section === "data" ? {
          q: typeof query?.q === "string" ? query.q : "",
          country: typeof query?.country === "string" ? query.country : "all",
          metric: typeof query?.metric === "string" ? query.metric : "overall",
          coverage: typeof query?.coverage === "string" ? query.coverage : "all",
          sort: typeof query?.sort === "string" ? query.sort : "overall",
          view: typeof query?.view === "string" ? query.view : "table",
        } : {}}
      />
    </>
  );
}
