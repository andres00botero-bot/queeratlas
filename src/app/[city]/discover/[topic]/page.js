import Link from "next/link";
import CityPanelButton from "@/components/city/CityPanelButton";
import { notFound } from "next/navigation";
import EditorialDisclosure from "@/components/editorial/EditorialDisclosure";
import CityDiscoveryResults from "@/components/city/CityDiscoveryResults";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { getPublishedEditorialRecord } from "@/lib/editorialData";
import { buildEditorialAuthorJsonLd, EDITORIAL_TEAM, GUIDE_EDITORIAL_META } from "@/lib/editorialTrust";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { getCityClusterTopic, listCityClusterTopics } from "@/lib/seo/cityClusters";
import {
  loadCityDiscoveryData,
} from "@/lib/seo/cityDiscoveryData";
import { evaluateCityDiscoveryIndexability } from "@/lib/seo/cityDiscoveryQuality";

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

function buildClusterJsonLd({ city, cityName, topic, topicConfig, editorial }) {
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
    author: buildEditorialAuthorJsonLd(editorial.author),
    ...(editorial.reviewer ? { reviewedBy: buildEditorialAuthorJsonLd(editorial.reviewer) } : {}),
    ...(editorial.sources.length > 0 ? { citation: editorial.sources.map((source) => source.url) } : {}),
    datePublished: editorial.publishedAt,
    dateModified: editorial.updatedAt,
    publishingPrinciples: toAbsoluteUrl("/editorial-policy"),
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

function buildDiscoveryResultsItemListJsonLd({ cityName, topicConfig, results = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${topicConfig.title} in ${cityName}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: results.length,
    itemListElement: results.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(entry.href),
      name: entry.name,
      item: {
        "@type": entry.kind === "event" ? "Event" : entry.kind === "service" ? "ProfessionalService" : "LocalBusiness",
        name: entry.name,
        url: toAbsoluteUrl(entry.href),
        ...(entry.location ? { address: entry.location } : {}),
        ...(entry.description ? { description: entry.description } : {}),
        ...(entry.kind === "event" && entry.startDate ? { startDate: entry.startDate } : {}),
        ...(entry.kind === "event" && entry.endDate ? { endDate: entry.endDate } : {}),
      },
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

function buildFaqEntries({ cityName, topicConfig, discovery, narrative }) {
  const questionBase = topicConfig?.title || "Queer city guide";
  const names = (discovery?.results || []).slice(0, 3).map((entry) => entry.name);
  const shortlist = names.length > 0 ? names.join(", ") : "No exact local listing is published yet";
  const exactCount = Number(discovery?.exactCount || 0);
  const districtAnswer = String(narrative?.districtRead || "").trim();
  const safetyAnswer = String(narrative?.safetyRead || "").trim();

  return [
    {
      question: `Which ${questionBase.toLowerCase()} are currently shortlisted in ${cityName}?`,
      answer: `${shortlist}. The page currently contains ${exactCount} exact topic match${exactCount === 1 ? "" : "es"}; related alternatives are labelled separately.`,
    },
    {
      question: `Where should I start this route in ${cityName}?`,
      answer: districtAnswer || `Start with the highest-ranked exact match, then keep the next listing in the same part of ${cityName} as a practical fallback.`,
    },
    {
      question: `What should I check before using this ${cityName} list?`,
      answer: safetyAnswer || `Confirm current opening times, official event information, entry policy, accessibility, and the route home before going.`,
    },
    {
      question: `How are the ${cityName} results ordered?`,
      answer: `Exact category fit comes first. Queer Atlas then considers listing detail, official links, saved sources, community review signal, date relevance for events, and practical location information. A high position is an editorial shortlist, not a guarantee of safety or personal fit.`,
    },
  ];
}

function buildFaqJsonLd({ faqEntries = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

function buildClusterMetaCopy({ topicConfig, cityName }) {
  const intent = String(topicConfig?.intent || "").trim().toLowerCase();
  const intentLines = {
    nightlife: `Map stronger nightlife sequencing in ${cityName}, from low-friction starts to peak energy stops.`,
    safety: `Compare safer neighborhood options, fallback route choices, and confidence signals before you move.`,
    community: `Find community-led entries with better social fit and less guesswork for lesbian and sapphic nightlife.`,
    daylife: `Use calmer daytime anchors for meetups, pre-night planning, and social momentum.`,
    events: `Track high-intent tonight planning with faster event choices and practical backup options.`,
  };
  const line = intentLines[intent] || `Plan with clearer local context, stronger signal quality, and lower decision friction in ${cityName}.`;

  const title = `${topicConfig.title} in ${cityName} (2026) | Queer Atlas`;
  const description = `${topicConfig.summary} ${line}`;

  return { title, description };
}

function shouldIndexCityTopicPage({ topicConfig, cityName, relatedTopicCount }) {
  const summaryLength = String(topicConfig?.summary || "").trim().length;
  const keyphraseCount = Array.isArray(topicConfig?.keyphrases) ? topicConfig.keyphrases.length : 0;
  const cityNameLength = String(cityName || "").trim().length;
  return summaryLength >= 80 && keyphraseCount >= 3 && relatedTopicCount >= 2 && cityNameLength >= 2;
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = await getCityRegistryEntry(city);
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
  const relatedTopicCount = listCityClusterTopics().filter((entry) => entry.key !== topic).length;
  const discovery = await loadCityDiscoveryData(city, topic);
  const copyReady = shouldIndexCityTopicPage({ topicConfig, cityName, relatedTopicCount });
  const contentQuality = evaluateCityDiscoveryIndexability({ topic, discovery });
  const shouldIndex = config.seoIndexable !== false && copyReady && contentQuality.indexable;

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
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function CityClusterTopicPage({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = await getCityRegistryEntry(city);
  const topicConfig = getCityClusterTopic(topic);

  if (!config || !topicConfig) {
    notFound();
  }

  const cityName = cityNameFromConfig(config, city);
  const relatedTopics = listCityClusterTopics().filter((entry) => entry.key !== topic).slice(0, 4);
  const researchScope = `This route applies the ${topicConfig.intent} discovery framework to ${cityName} using Queer Atlas city configuration, topic taxonomy, and linked place and event routes. It is a planning framework, not a claim that every linked operation was independently checked on the same day.`;
  const [editorial, discovery] = await Promise.all([
    getPublishedEditorialRecord(`city-discovery:${city}:${topic}`, {
      ...GUIDE_EDITORIAL_META.cityDiscovery,
      researchScope,
      author: EDITORIAL_TEAM,
    }),
    loadCityDiscoveryData(city, topic),
  ]);
  const narrative = discovery.buildNarrative(cityName);
  const clusterJsonLd = buildClusterJsonLd({ city, cityName, topic, topicConfig, editorial });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({ city, cityName, topic, topicConfig });
  const relatedTopicsItemListJsonLd = buildRelatedTopicsItemListJsonLd({ city, cityName, relatedTopics });
  const discoveryResultsJsonLd = buildDiscoveryResultsItemListJsonLd({ cityName, topicConfig, results: discovery.results });
  const faqEntries = buildFaqEntries({ cityName, topicConfig, discovery, narrative });
  const faqJsonLd = buildFaqJsonLd({ faqEntries });
  const intentBlueprint = buildIntentBlueprint({ cityName, topicConfig });
  const localProofPoints = [
    `${discovery.exactCount} exact ${topicConfig.title.toLowerCase()} match${discovery.exactCount === 1 ? "" : "es"} currently published for ${cityName}.`,
    `${discovery.counts.places} places, ${discovery.counts.events} upcoming events, and ${discovery.counts.services} services checked in the local Atlas dataset.`,
    discovery.results.length === 0
      ? "No specialist result is invented when the current local dataset has no verified match."
      : discovery.fallbackUsed
        ? "Related alternatives are visible but clearly separated from exact category matches."
        : "Every displayed result matches the primary category used by this edit.",
  ];
  const graphJsonLd = [clusterJsonLd, breadcrumbJsonLd, relatedTopicsItemListJsonLd, discoveryResultsJsonLd, faqJsonLd];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_92%_8%,rgba(244,114,182,0.10),transparent_30%),linear-gradient(180deg,#05070d_0%,#07070b_48%,#030305_100%)] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(244,114,182,0.16),transparent_30%),linear-gradient(160deg,rgba(18,24,38,0.96),rgba(8,9,15,0.99))] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.40)] sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-fuchsia-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/78">Discover path</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{topicConfig.title} in {cityName}</h1>
            <p className="mt-3 text-sm leading-7 text-white/82">
              {narrative.intro}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href={`/${city}`}
                className="rounded-2xl border border-white/16 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-[1px] hover:border-white/32 hover:bg-white/[0.10]"
              >
                Open {cityName} guide
              </Link>
              <CityPanelButton
                city={city}
                section="events"
                className="rounded-2xl border border-fuchsia-100/34 bg-gradient-to-r from-fuchsia-400/22 via-rose-300/16 to-cyan-300/12 px-4 py-3 text-sm font-bold text-fuchsia-50 shadow-[0_0_28px_rgba(244,114,182,0.14)] transition hover:-translate-y-[1px] hover:border-fuchsia-100/54 hover:shadow-[0_0_36px_rgba(244,114,182,0.22)]"
              >
                Open city events
              </CityPanelButton>
              <Link
                href="/cities"
                className="rounded-2xl border border-cyan-100/42 bg-gradient-to-r from-cyan-300/24 via-sky-300/18 to-fuchsia-300/18 px-4 py-3 text-sm font-bold text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.16)] transition hover:-translate-y-[1px] hover:border-cyan-100/62 hover:shadow-[0_0_38px_rgba(34,211,238,0.24)]"
              >
                Explore all cities
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-lime-100/40 bg-gradient-to-r from-lime-300/22 via-emerald-300/16 to-cyan-300/16 px-4 py-3 text-sm font-bold text-lime-50 shadow-[0_0_28px_rgba(190,242,100,0.13)] transition hover:-translate-y-[1px] hover:border-lime-100/58 hover:shadow-[0_0_38px_rgba(190,242,100,0.21)]"
              >
                Start from homepage
              </Link>
            </div>
          </div>
        </header>

        <EditorialDisclosure
          author={editorial.author}
          reviewer={editorial.reviewer}
          publishedAt={editorial.publishedAt}
          updatedAt={editorial.updatedAt}
          researchScope={editorial.researchScope}
          changeLog={editorial.changeLog}
          sources={editorial.sources}
        />

        <CityDiscoveryResults
          city={city}
          cityName={cityName}
          discovery={discovery}
          narrative={narrative}
        />

        <section className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <h2 className="text-lg font-semibold">What this local edit contains</h2>
          <ul className="mt-3 grid gap-3 text-sm leading-7 text-white/82 sm:grid-cols-3">
            {localProofPoints.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-black/22 p-3">{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(34,211,238,0.07),rgba(255,255,255,0.025))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.20)]">
          <h2 className="text-lg font-semibold">{intentBlueprint.frameworkTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/82">
            {intentBlueprint.frameworkSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(244,114,182,0.065),rgba(255,255,255,0.025))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.20)]">
          <h2 className="text-lg font-semibold">Related cluster pages</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedTopics.map((entry) => (
              <Link
                key={entry.key}
                href={buildCanonicalPath(city, entry.key)}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-[1px] hover:border-cyan-200/34 hover:bg-white/[0.06] hover:text-white"
              >
                {entry.title} in {cityName}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-4">
            {faqEntries.map((entry) => (
              <article key={entry.question} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">{entry.question}</h3>
                <p className="mt-1 text-sm leading-7 text-white/80">{entry.answer}</p>
              </article>
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
            section="events"
            className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100"
          >
            Open Events in City
          </CityPanelButton>
        </nav>
      </div>
    </main>
  );
}
