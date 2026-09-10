import CompassClient from "../compass/CompassClient";
import { COMPASS_TERMS } from "@/lib/compassTerms";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Queer Dictionary: LGBTQIA+ Terms & Pronouns",
  description:
    "Explore clear, caring explanations of LGBTQIA+ identities, pronouns, community language, FLINTA and more — with nuance, sources and practical guidance.",
  keywords: [keywordOwnership.compass.primary, ...keywordOwnership.compass.secondary],
  alternates: {
    canonical: "/dictionary",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Queer Dictionary | Queer Atlas",
    description:
      "Understand identities, pronouns and queer community language without judgement.",
    url: "https://www.queeratlas.app/dictionary",
    siteName: "Queer Atlas",
    images: [
      {
        url: "/queer-atlas-logo.png",
        width: 1024,
        height: 1024,
        alt: "Queer Dictionary by Queer Atlas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Dictionary | Queer Atlas",
    description:
      "Clear queer language, thoughtful context and practical ways to show respect.",
    images: ["/queer-atlas-logo.png"],
  },
};

export default function CompassPage() {
  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": "https://www.queeratlas.app/dictionary#term-set",
    name: "Queer Dictionary",
    description: "Queer Atlas definitions of LGBTQIA+ identities, language and community context.",
    url: "https://www.queeratlas.app/dictionary",
    inLanguage: "en",
    publisher: { "@id": "https://www.queeratlas.app/#organization" },
    dateModified: "2026-09-10",
    hasDefinedTerm: COMPASS_TERMS.map((term) => ({
      "@type": "DefinedTerm",
      name: term.name,
      description: term.summary,
      termCode: term.slug,
      url: `https://www.queeratlas.app/dictionary#term-${term.slug}`,
      inDefinedTermSet: { "@id": "https://www.queeratlas.app/dictionary#term-set" },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.queeratlas.app/dictionary#webpage",
    name: "Queer Dictionary: LGBTQIA+ Terms & Pronouns",
    description: metadata.description,
    url: "https://www.queeratlas.app/dictionary",
    inLanguage: "en",
    isPartOf: { "@id": "https://www.queeratlas.app/#website" },
    mainEntity: { "@id": "https://www.queeratlas.app/dictionary#term-set" },
    about: ["LGBTQIA+ terminology", "gender identity", "pronouns", "queer community language"],
    dateModified: "2026-09-10",
    breadcrumb: { "@id": "https://www.queeratlas.app/dictionary#breadcrumbs" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://www.queeratlas.app/dictionary#breadcrumbs",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.queeratlas.app/" },
      { "@type": "ListItem", position: 2, name: "Queer Dictionary", item: "https://www.queeratlas.app/dictionary" },
    ],
  };

  return (
    <>
      <script id="compass-defined-terms" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
      <script id="compass-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script id="compass-breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CompassClient />
    </>
  );
}
