import { listSeoReports } from "./seo/reportsIndex.js";
import { listTopicHubs } from "./seo/topicHubs.js";

const TOPIC_GUIDE_COPY = {
  nightlife: {
    title: "Queer nightlife guides",
    summary: "Find bars, clubs, saunas and after-dark routes across the cities with the strongest current coverage.",
  },
  safety: {
    title: "Queer travel safety guides",
    summary: "Practical destination context, lower-friction routes and support options without pretending any trip is risk-free.",
  },
  events: {
    title: "Queer events guides",
    summary: "Move from tonight to the week ahead with current event routes across major queer cities.",
  },
  cafes: {
    title: "Queer cafés and daytime guides",
    summary: "Cafés, bookshops, work-friendly spaces and calmer places to begin a day in the city.",
  },
  community: {
    title: "Lesbian and sapphic nightlife guides",
    summary: "Women-led, sapphic and broader community nightlife routes with clearer social context.",
  },
};

export function getSearchGuides() {
  return [
    ...listSeoReports().map((report) => ({
      ...report,
      id: `report-${report.slug}`,
      href: `/reports/${report.slug}`,
      kind: "Editorial report",
      type: "guide",
    })),
    ...listTopicHubs().map((hub) => ({
      id: `topic-${hub.key}`,
      slug: hub.key,
      title: TOPIC_GUIDE_COPY[hub.key]?.title || hub.title,
      summary: TOPIC_GUIDE_COPY[hub.key]?.summary || hub.description,
      intent: hub.key,
      keyphrases: hub.clusterKeys,
      href: `/topics/${hub.key}`,
      kind: "Topic guide",
      type: "guide",
    })),
  ];
}
