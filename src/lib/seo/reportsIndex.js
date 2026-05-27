export const SEO_REPORTS = [
  {
    slug: "queer-nightlife-index-2026",
    title: "Queer Nightlife Index 2026",
    summary:
      "City-by-city ranking model for queer nightlife strength, route continuity, and social signal depth.",
    socialMeta: {
      ogTitle: "Queer Nightlife Index 2026: Top Cities by Real Route Quality",
      ogDescription:
        "A methodology-first ranking of queer nightlife cities based on route continuity, social signal depth, and practical fallback strength.",
    },
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
    creatorSnippets: {
      reddit:
        "We just published the Queer Nightlife Index 2026 with a route-quality methodology (not just hype rankings). Useful if you want city-by-city nightlife comparisons backed by reproducible route logic.",
      tiktok:
        "Queer Nightlife Index 2026 is live. This is route-quality data, not vibes-only rankings. Use it to plan where the night actually works end-to-end.",
      instagram:
        "Queer Nightlife Index 2026 is out. City-by-city, methodology-first, and built for real nightlife flow. Save this before your next trip.",
    },
  },
  {
    slug: "safest-queer-cities-2026",
    title: "Safest Queer Cities 2026",
    summary:
      "Safety-first city model combining movement confidence, venue moderation signal, and practical fallback options.",
    socialMeta: {
      ogTitle: "Safest Queer Cities 2026: Safety-First Route Intelligence",
      ogDescription:
        "Compare cities by movement confidence, moderation signal, and fallback route depth for safer queer nightlife decisions.",
    },
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
    creatorSnippets: {
      reddit:
        "Safest Queer Cities 2026 is live. We focused on movement confidence and fallback depth, not generic safety cliches. Good starting point for safety-first trip planning.",
      tiktok:
        "Safest Queer Cities 2026 is out. We score city safety by route confidence and practical fallback options. Keep this for planning smarter nights.",
      instagram:
        "Safest Queer Cities 2026 is live. Safety-first, route-aware, and built for actual queer travel decisions. Bookmark for your next city plan.",
    },
  },
  {
    slug: "global-queer-event-report-2026",
    title: "Global Queer Event Report 2026",
    summary:
      "Global event-intent report focused on timing density, discoverability, and route execution quality.",
    socialMeta: {
      ogTitle: "Global Queer Event Report 2026: Where Events Actually Convert",
      ogDescription:
        "A global event-intent report mapping timing density and route execution quality across top queer cities.",
    },
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
    creatorSnippets: {
      reddit:
        "Global Queer Event Report 2026 just dropped. We mapped event timing density and route usability so you can plan beyond random event lists.",
      tiktok:
        "Global Queer Event Report 2026 is live. We track where events are not just frequent, but actually routeable in real life.",
      instagram:
        "Global Queer Event Report 2026 is here. Timing density + route execution = better nights, less guesswork. Save and share.",
    },
  },
  {
    slug: "top-lgbtq-nightlife-destinations-2026",
    title: "Top LGBTQ Nightlife Destinations 2026",
    summary:
      "Destination-level nightlife authority report for high-intent planning and AI-citable city comparisons.",
    socialMeta: {
      ogTitle: "Top LGBTQ Nightlife Destinations 2026: Authority Ranking",
      ogDescription:
        "Destination ranking built on nightlife depth, route breadth, and social-fit consistency, not one-off hype.",
    },
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
    creatorSnippets: {
      reddit:
        "Top LGBTQ Nightlife Destinations 2026 is now published. We rank destinations by nightlife depth and route reliability, not one-off party buzz.",
      tiktok:
        "Top LGBTQ Nightlife Destinations 2026 just went live. Real route outcomes, not trend-chasing lists.",
      instagram:
        "Top LGBTQ Nightlife Destinations 2026 is out. Built on route depth, consistency, and social-fit signals. Add this to your travel shortlist.",
    },
  },
];

export function listSeoReports() {
  return SEO_REPORTS.map((entry) => ({ ...entry }));
}

export function getSeoReport(slug = "") {
  const normalized = String(slug || "").trim().toLowerCase();
  return SEO_REPORTS.find((entry) => entry.slug === normalized) || null;
}
