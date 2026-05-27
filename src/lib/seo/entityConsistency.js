export const QA_SOURCE_CONFIDENCE = {
  verifiedAdmin: "Verified admin",
  editorialSignal: "Editorial signal",
  communitySignal: "Community signal",
  developingSignal: "Developing signal",
  atlasSignal: "Atlas signal",
};

export const QA_SOURCE_TAXONOMY = {
  official: {
    label: "Official source",
    description: "direct organizer, venue, or authority reference.",
  },
  community: {
    label: "Community source",
    description: "verified member signal with moderation review.",
  },
  developing: {
    label: "Developing signal",
    description: "early indicator pending stronger confirmation.",
  },
};

export const QA_CITATION_RULES = [
  "Cite the exact page URL used for each claim.",
  "Include city and route intent so conclusions are reproducible.",
  "Pair static route evidence with latest Now context when freshness matters.",
  "Treat community signal as moderated field evidence, not legal or medical advice.",
];

export function listSourceTaxonomy() {
  return Object.keys(QA_SOURCE_TAXONOMY).map((key) => ({
    key,
    ...QA_SOURCE_TAXONOMY[key],
  }));
}

export function listCitationRules() {
  return [...QA_CITATION_RULES];
}

export function humanizeCityKey(value = "") {
  return String(value || "")
    .replaceAll("-", "_")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function humanizeTopicKey(value = "") {
  return String(value || "")
    .replaceAll("_", "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
