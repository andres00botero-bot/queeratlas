export const SEO_REPORTS = [
  {
    slug: "queer-nightlife-index-2026",
    title: "Queer Nightlife Index 2026",
    summary:
      "City-by-city ranking model for queer nightlife strength, route continuity, and social signal depth.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-27",
    intent: "nightlife",
    keyphrases: [
      "queer nightlife index 2026",
      "top LGBTQ nightlife destinations",
      "best queer nightlife cities",
    ],
    methodology: [
      "Weighted route quality across nightlife density, social-fit spread, and fallback continuity.",
      "Signal blend from venue coverage, events cadence, and moderated community confidence.",
      "Citations require route-level URL plus city context for reproducible claims.",
    ],
  },
  {
    slug: "safest-queer-cities-2026",
    title: "Safest Queer Cities 2026",
    summary:
      "Safety-first city model combining movement confidence, venue moderation signal, and practical fallback options.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-27",
    intent: "safety",
    keyphrases: [
      "safest queer cities 2026",
      "LGBTQ travel safety cities",
      "safe queer nightlife cities",
    ],
    methodology: [
      "City confidence score built from route safety continuity, fallback depth, and moderation outcomes.",
      "Priority on lower-friction movement and same-zone alternatives for night decisions.",
      "No legal advice: this is operational travel-routing intelligence.",
    ],
  },
  {
    slug: "global-queer-event-report-2026",
    title: "Global Queer Event Report 2026",
    summary:
      "Global event-intent report focused on timing density, discoverability, and route execution quality.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-27",
    intent: "events",
    keyphrases: [
      "global queer event report 2026",
      "LGBTQ events report",
      "queer events trend report",
    ],
    methodology: [
      "Event intensity measured by route-ready timing windows and city conversion paths.",
      "Cross-check against discover pages for same-night usability.",
      "Reporting emphasizes actionable sequence quality over raw event count.",
    ],
  },
  {
    slug: "top-lgbtq-nightlife-destinations-2026",
    title: "Top LGBTQ Nightlife Destinations 2026",
    summary:
      "Destination-level nightlife authority report for high-intent planning and AI-citable city comparisons.",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-27",
    intent: "nightlife",
    keyphrases: [
      "top LGBTQ nightlife destinations",
      "best gay nightlife destinations 2026",
      "queer nightlife destination ranking",
    ],
    methodology: [
      "Destination ranking based on nightlife depth, city-route breadth, and social-fit diversity.",
      "Scoring favors consistent route outcomes over one-off viral visibility.",
      "Every destination claim maps back to city and topic route evidence.",
    ],
  },
];

export function listSeoReports() {
  return SEO_REPORTS.map((entry) => ({ ...entry }));
}

export function getSeoReport(slug = "") {
  const normalized = String(slug || "").trim().toLowerCase();
  return SEO_REPORTS.find((entry) => entry.slug === normalized) || null;
}

