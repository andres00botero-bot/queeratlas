import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCoreConfig } from "@/lib/cityCore";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { getCityClusterTopic, listCityClusterTopics } from "@/lib/seo/cityClusters";

export const revalidate = 600;

function toAbsoluteUrl(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.queeratlas.app";
  return `${String(baseUrl).replace(/\/+$/, "")}${path}`;
}

function buildCanonicalPath(city = "", topic = "") {
  return `/${city}/discover/${topic}`;
}

function buildClusterJsonLd({ city, cityName, topic, topicConfig }) {
  const canonicalPath = buildCanonicalPath(city, topic);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const related = [
    `/${city}`,
    `/${city}/events`,
    "/events",
    "/now",
  ].map((path) => toAbsoluteUrl(path));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#cluster`,
    name: `${topicConfig.title} ${cityName}`,
    url: canonicalUrl,
    about: topicConfig.keyphrases.map((phrase) => `${phrase} ${cityName}`),
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    relatedLink: related,
  };
}

function buildBreadcrumbJsonLd({ city, cityName, topic, topicConfig }) {
  const canonicalPath = buildCanonicalPath(city, topic);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: toAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cities",
        item: toAbsoluteUrl("/cities"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: toAbsoluteUrl(`/${city}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${topicConfig.title} in ${cityName}`,
        item: toAbsoluteUrl(canonicalPath),
      },
    ],
  };
}

function buildRelatedTopicsItemListJsonLd({ city, cityName, relatedTopics = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Related ${cityName} queer topic guides`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: relatedTopics.length,
    itemListElement: relatedTopics.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(buildCanonicalPath(city, entry.key)),
      name: `${entry.title} in ${cityName}`,
    })),
  };
}

function buildIntentBlueprint({ cityName, topicConfig }) {
  const intent = String(topicConfig?.intent || "").trim().toLowerCase();
  const defaults = {
    headerLine: `This page is tuned for high-intent local search in ${cityName}, with practical decision points that reduce guesswork and improve safer queer city navigation.`,
    solvingPoints: [
      `Faster route planning for ${topicConfig.intent} intent in ${cityName}.`,
      "Safer decision support with alternatives when the first stop is not a fit.",
      "Clear bridge from discovery to real-world movement with less friction.",
    ],
    frameworkTitle: "Decision framework",
    frameworkSteps: [
      "Set your first stop by social comfort, not hype.",
      "Add one backup option in a nearby area before leaving.",
      "Use events and venue timing to avoid dead transitions.",
    ],
    faqDecisionText: `${topicConfig.summary} This guide is structured for decision-making, not just listing venues.`,
    faqSameNightText: `Yes. The guide is built for high-intent planning with clear links to city, events, and related topic paths in ${cityName}.`,
  };

  const byIntent = {
    nightlife: {
      headerLine: `Use this nightlife cluster to sequence warm-up bars, peak-hour clubs, and late exits in ${cityName} without losing momentum.`,
      frameworkTitle: "Nightlife sequencing framework",
      frameworkSteps: [
        "Start low-friction (social bar or lounge) before peak venues.",
        "Schedule your main stop around crowd surge windows.",
        "Set one after-hours fallback to keep route continuity.",
      ],
      faqDecisionText: `Unlike generic nightlife lists, this cluster helps you choose order, timing, and fallback options for ${cityName} nightlife flow.`,
    },
    safety: {
      headerLine: `Use this safety cluster to compare neighborhood confidence, venue risk profile, and lower-friction movement in ${cityName}.`,
      solvingPoints: [
        `Faster safety-first route planning for ${cityName}.`,
        "Backup choices when a venue or area feels wrong in real time.",
        "Clearer movement logic across safer queer-friendly zones.",
      ],
      frameworkTitle: "Safety-first framework",
      frameworkSteps: [
        "Start in high-confidence zones with reliable late transport.",
        "Prefer venues with clearer social moderation and exit options.",
        "Keep one same-neighborhood backup to reduce exposure.",
      ],
      faqDecisionText: `This is not only a venue list: it is a safety-routing layer for ${cityName} with practical alternatives and lower-risk sequencing.`,
    },
    events: {
      headerLine: `Use this events cluster to turn date-based search intent into same-night route decisions in ${cityName}.`,
      frameworkTitle: "Event-night framework",
      frameworkSteps: [
        "Anchor your plan to one high-signal event window.",
        "Add a pre-event and post-event venue within short transit range.",
        "Keep one backup event path in case of sell-out or queue pressure.",
      ],
      faqDecisionText: `Instead of static listings, this cluster maps event timing, route continuity, and alternatives for ${cityName}.`,
      faqSameNightText: `Yes. It is built for same-night use: choose your event anchor, then move through linked city routes in ${cityName}.`,
    },
    community: {
      headerLine: `Use this community cluster to find stronger social-fit entries in ${cityName}, especially for lesbian and sapphic nightlife discovery.`,
      frameworkTitle: "Community-fit framework",
      frameworkSteps: [
        "Choose spaces with clearer identity fit for your group.",
        "Sequence from soft social entry to higher-energy rooms.",
        "Keep one quieter backup for regrouping and reset.",
      ],
      faqDecisionText: `This guide prioritizes community-fit and social comfort, not only popularity signals, for better decisions in ${cityName}.`,
    },
    daylife: {
      headerLine: `Use this daylife cluster for cafes, hotels, and low-pressure social starts that strengthen your night plan in ${cityName}.`,
      frameworkTitle: "Day-to-night framework",
      frameworkSteps: [
        "Start with a daytime anchor close to your evening zone.",
        "Use that base to shortlist two nightlife options by vibe.",
        "Confirm transit and opening windows before the shift to night.",
      ],
      faqDecisionText: `This guide links daytime anchors with nightlife outcomes, helping you plan better transitions in ${cityName}.`,
    },
  };

  return {
    ...defaults,
    ...(byIntent[intent] || {}),
  };
}

function buildFaqJsonLd({ cityName, topicConfig }) {
  const questionBase = topicConfig?.title || "Queer city guide";
  const blueprint = buildIntentBlueprint({ cityName, topicConfig });
  const intent = String(topicConfig?.intent || "").trim().toLowerCase();
  const intentFaqs = {
    nightlife: [
      {
        "@type": "Question",
        name: `What is the best order for a queer nightlife route in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Start with a social warm-up venue, move to one peak-energy stop, then keep one late fallback in the same area to reduce friction in ${cityName}.`,
        },
      },
      {
        "@type": "Question",
        name: `How many venues should I plan for one nightlife session in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "For most nights, 2 to 3 core stops plus one backup performs better than long venue lists.",
        },
      },
    ],
    safety: [
      {
        "@type": "Question",
        name: `How does this guide improve queer safety decisions in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "It prioritizes lower-friction movement, neighborhood confidence, and practical backup options when first choices feel wrong.",
        },
      },
      {
        "@type": "Question",
        name: `What should I check first for safer routing in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Check area confidence, late transport reliability, and one same-neighborhood alternative before moving.",
        },
      },
    ],
    events: [
      {
        "@type": "Question",
        name: `How do I use event intent with city routes in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose one anchor event window, then attach a pre-event and post-event stop to avoid timing gaps.",
        },
      },
      {
        "@type": "Question",
        name: `What is the fallback method if an event sells out in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Keep one same-night alternative route open in advance, ideally in the same zone to preserve momentum.",
        },
      },
    ],
    community: [
      {
        "@type": "Question",
        name: `Who is this community route useful for in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is built for people prioritizing social fit, including lesbian and sapphic nightlife discovery with lower guesswork.",
        },
      },
      {
        "@type": "Question",
        name: `How should I choose between community-led options in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pick spaces by identity fit first, then sequence by energy and distance instead of popularity alone.",
        },
      },
    ],
    daylife: [
      {
        "@type": "Question",
        name: `Why does daytime planning matter for queer nightlife outcomes in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Daytime anchors like cafes and hotels improve transition quality, reduce stress, and strengthen night route decisions.",
        },
      },
      {
        "@type": "Question",
        name: `How do I convert a daylife plan into a night route in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use your daytime zone to shortlist two evening options by vibe, then confirm opening times before moving.",
        },
      },
    ],
  };
  const extraFaqs = intentFaqs[intent] || [];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does ${questionBase} in ${cityName} help with?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${questionBase} in ${cityName} helps you plan faster with practical route context, safer fallbacks, and local signal clarity.`,
        },
      },
      {
        "@type": "Question",
        name: `How is this ${cityName} guide different from a generic nightlife list?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: blueprint.faqDecisionText,
        },
      },
      {
        "@type": "Question",
        name: `Can I use this guide for same-night planning in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: blueprint.faqSameNightText,
        },
      },
      {
        "@type": "Question",
        name: `What should I do after opening this ${cityName} cluster page?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Open one related route, confirm same-night timing, and keep one fallback option before committing your movement plan in ${cityName}.`,
        },
      },
      ...extraFaqs,
    ],
  };
}

function buildClusterMetaCopy({ topicConfig, cityName }) {
  const intent = String(topicConfig?.intent || "").trim().toLowerCase();
  const intentHooks = {
    nightlife: "Techno, bars, and late-night flow",
    safety: "Safer picks and route context",
    community: "Sapphic social signal and nightlife",
    daylife: "Daytime cafes and social starts",
    events: "Tonight pulse and event routes",
  };
  const intentLines = {
    nightlife: `Map stronger nightlife sequencing in ${cityName}, from low-friction starts to peak energy stops.`,
    safety: `Compare safer neighborhood options, fallback route choices, and confidence signals before you move.`,
    community: `Find community-led entries with better social fit and less guesswork for lesbian and sapphic nightlife.`,
    daylife: `Use calmer daytime anchors for meetups, pre-night planning, and social momentum.`,
    events: `Track high-intent tonight planning with faster event choices and practical backup options.`,
  };
  const hook = intentHooks[intent] || "Queer route planning signal";
  const line = intentLines[intent] || `Plan with clearer local context, stronger signal quality, and lower decision friction in ${cityName}.`;

  const title = `${topicConfig.title} in ${cityName} (2026) | ${hook} | Queer Atlas`;
  const description = `${topicConfig.summary} ${line}`;

  return { title, description };
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = cityCoreConfig[city] || null;
  const topicConfig = getCityClusterTopic(topic);

  if (!config || !topicConfig) {
    return {
      title: "Cluster Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const cityName = cityNameFromConfig(config, city);
  const canonical = buildCanonicalPath(city, topic);
  const canonicalUrl = toAbsoluteUrl(canonical);
  const ownership = getCityKeywordOwnership(cityName);
  const { title, description } = buildClusterMetaCopy({ topicConfig, cityName });

  return {
    title,
    description,
    keywords: [
      ...topicConfig.keyphrases.map((phrase) => `${phrase} ${cityName}`),
      `queer guide ${cityName}`,
      `LGBTQ guide ${cityName}`,
      `${topicConfig.title.toLowerCase()} ${cityName}`,
      ownership.primary,
      ...ownership.secondary.slice(0, 4),
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "Queer Atlas",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityClusterTopicPage({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = cityCoreConfig[city] || null;
  const topicConfig = getCityClusterTopic(topic);

  if (!config || !topicConfig) {
    notFound();
  }

  const cityName = cityNameFromConfig(config, city);
  const canonicalPath = buildCanonicalPath(city, topic);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const relatedTopics = listCityClusterTopics().filter((entry) => entry.key !== topic).slice(0, 4);
  const clusterJsonLd = buildClusterJsonLd({ city, cityName, topic, topicConfig });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({ city, cityName, topic, topicConfig });
  const relatedTopicsItemListJsonLd = buildRelatedTopicsItemListJsonLd({ city, cityName, relatedTopics });
  const faqJsonLd = buildFaqJsonLd({ cityName, topicConfig });
  const intentBlueprint = buildIntentBlueprint({ cityName, topicConfig });
  const graphJsonLd = [clusterJsonLd, breadcrumbJsonLd, relatedTopicsItemListJsonLd, faqJsonLd];

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">City Cluster Guide</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{topicConfig.title} in {cityName}</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {topicConfig.summary} {intentBlueprint.headerLine}
          </p>
        </header>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">What this cluster solves</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/82">
            {intentBlueprint.solvingPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">{intentBlueprint.frameworkTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/82">
            {intentBlueprint.frameworkSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Related cluster pages</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedTopics.map((entry) => (
              <Link
                key={entry.key}
                href={buildCanonicalPath(city, entry.key)}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {entry.title} in {cityName}
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
            href={`/${city}?section=events`}
            className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100"
          >
            Open Events in City
          </Link>
          <span className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/52">
            canonical: {canonicalUrl}
          </span>
        </nav>
      </div>
    </main>
  );
}
