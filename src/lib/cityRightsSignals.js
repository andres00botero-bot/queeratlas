const LEVEL_META = {
  good: {
    label: "Strong",
    className: "border-emerald-200/25 bg-emerald-300/12 text-emerald-100/92",
  },
  mixed: {
    label: "Evolving",
    className: "border-amber-200/28 bg-amber-300/12 text-amber-100/90",
  },
  risk: {
    label: "Limited",
    className: "border-rose-200/28 bg-rose-300/12 text-rose-100/90",
  },
  unknown: {
    label: "Unknown",
    className: "border-white/18 bg-white/10 text-white/78",
  },
};

const RELATION_STATUS_LABELS = {
  legal: "Legal",
  criminalized: "Criminalized",
  restricted: "Restricted",
  unknown: "Unknown",
};

const UNION_STATUS_LABELS = {
  marriage: "Marriage recognized",
  civil_union_or_partnership: "Civil union / partnership",
  no_protection: "No legal recognition",
  unknown: "Unknown",
};

const GENDER_RECOGNITION_LABELS = {
  available: "Available",
  restricted: "Restricted",
  impossible: "Not available",
  unknown: "Unknown",
};

const ANTI_DISCRIMINATION_LABELS = {
  full_coverage: "Full coverage",
  partial_coverage: "Partial coverage",
  limited_or_none: "Limited / none",
  unknown: "Unknown",
};

const COUNTRY_RIGHTS_SNAPSHOTS = {
  Spain: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Strong legal baseline and broad protections. Use normal nightlife awareness in busy zones.",
  },
  Germany: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "High legal clarity with broad rights. Safety usually depends on area, time, and crowd context.",
  },
  Netherlands: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Consistently strong legal and social baseline with generally stable day-to-night safety.",
  },
  Denmark: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal framework and protections with generally predictable on-the-ground conditions.",
  },
  Sweden: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal framework and broad protections. Local nightlife caution still applies.",
  },
  Norway: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "High legal and rights clarity with a stable public baseline in most city contexts.",
  },
  Finland: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal recognition and protections with mostly low-friction daily movement.",
  },
  Belgium: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Strong legal protections with generally good safety, though nightlife density can change conditions fast.",
  },
  Austria: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Solid legal position and protections. Safety is usually manageable with area-aware planning.",
  },
  Switzerland: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal framework and relatively stable local conditions across major city routes.",
  },
  France: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is solid, with practical protections varying by context and city area.",
  },
  Portugal: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Strong legal and rights baseline with safety mostly influenced by nightlife density.",
  },
  Italy: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal conditions are stable for relationships, while practical protections vary by region.",
  },
  "United Kingdom": {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline remains established, but current policy context is moving and region-specific.",
  },
  Ireland: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal and rights environment with generally stable social conditions.",
  },
  "Czech Republic": {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is workable, with protections improving but still uneven in practice.",
  },
  Poland: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists, while practical protections and climate can vary significantly by context.",
  },
  Hungary: {
    legal: "good",
    rights: "risk",
    safety: "risk",
    whatThisMeans:
      "Legal baseline on relationships remains, but rights climate is currently restrictive for public expression.",
  },
  Greece: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline improved recently. Practical protection can still differ by local context.",
  },
  Albania: {
    legal: "good",
    rights: "risk",
    safety: "mixed",
    whatThisMeans:
      "Same-sex relations are legal and anti-discrimination law covers sexual orientation and gender identity, but Albania has no same-sex marriage, partnership or family-law recognition. Tirana has visible Pride and community organizations, while everyday comfort and public visibility remain context-dependent.",
    details: {
      sameSexRelations: "Legal",
      unions: "No legal recognition",
      genderRecognition: "Restricted",
      antiDiscrimination: "Full coverage",
    },
    sources: {
      legal: "https://rainbowmap.ilga-europe.org/",
      rights: "https://www.equaldex.com/region/albania",
      safety: "https://www.aleancalgbt.org/",
    },
    confidence: "high",
    updatedAt: "2026-06-16",
  },
  Cyprus: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Same-sex relationships are legal and civil unions are recognized, while family rights and everyday social comfort remain uneven outside the main urban and resort areas.",
  },
  Slovenia: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Same-sex marriage and joint adoption are recognized. Ljubljana has visible community infrastructure, while ordinary late-night caution and awareness of occasional harassment still matter.",
  },
  Estonia: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Strong legal momentum with generally workable safety patterns in major city zones.",
  },
  Romania: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists, while practical protections and comfort can vary by district and time.",
  },
  Bulgaria: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists, but practical protections can be inconsistent in day-to-night routes.",
  },
  Croatia: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is present with mixed protection depth and area-sensitive local experience.",
  },
  "Bosnia and Herzegovina": {
    legal: "good",
    rights: "risk",
    safety: "mixed",
    whatThisMeans:
      "Same-sex relations are legal and anti-discrimination law includes sexual orientation, gender identity and sex characteristics, but same-sex couples still have no marriage, partnership or family-law recognition. Sarajevo has visible Pride and community infrastructure, while public comfort and late-night safety remain context-dependent.",
    details: {
      sameSexRelations: "Legal",
      unions: "No legal recognition",
      genderRecognition: "Restricted",
      antiDiscrimination: "Full coverage",
    },
    sources: {
      legal: "https://rainbowmap.ilga-europe.org/",
      rights: "https://rainbowmap.ilga-europe.org/",
      safety: "https://soc.ba/",
    },
    confidence: "high",
    updatedAt: "2026-06-16",
  },
  Montenegro: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Same-sex relations are legal and same-sex life partnerships are recognized, but marriage equality and full family-rights parity are not in place. Anti-discrimination law covers sexual orientation and gender identity, while everyday comfort is strongest in tourist zones and community-led spaces.",
    details: {
      sameSexRelations: "Legal",
      unions: "Civil union / partnership",
      genderRecognition: "Restricted",
      antiDiscrimination: "Full coverage",
    },
    sources: {
      legal: "https://rainbowmap.ilga-europe.org/",
      rights: "https://www.equaldex.com/region/montenegro",
      safety: "https://queermontenegro.org/",
    },
    confidence: "high",
    updatedAt: "2026-06-16",
  },
  Serbia: {
    legal: "good",
    rights: "risk",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists with tighter public-rights climate and context-sensitive safety patterns.",
  },
  Turkey: {
    legal: "good",
    rights: "risk",
    safety: "risk",
    whatThisMeans:
      "Legal baseline on relations exists, but rights protections and public climate are currently constrained.",
  },
  Israel: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Strong community presence with mixed legal pathways and area-dependent safety context.",
  },
  Japan: {
    legal: "good",
    rights: "mixed",
    safety: "good",
    whatThisMeans:
      "Relationship legality is stable, with protections evolving and strong city-level safety patterns.",
  },
  Thailand: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Social visibility is strong in many cities, while formal protections continue to evolve.",
  },
  "South Korea": {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists with mixed rights depth and neighborhood-dependent safety comfort.",
  },
  Taiwan: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal and rights framework with generally stable city-level safety conditions.",
  },
  China: {
    legal: "good",
    rights: "risk",
    safety: "mixed",
    whatThisMeans:
      "Relationship legality exists, but rights protections are limited and local conditions can shift quickly.",
  },
  India: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is established, while rights protections and practical comfort vary by area and time.",
  },
  Philippines: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Community visibility is strong, while rights protections remain uneven in policy and practice.",
  },
  Mexico: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is strong nationally, with practical safety varying by city zone and timing.",
  },
  Brazil: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Strong legal baseline with practical safety varying by district, transport route, and nightlife timing.",
  },
  Argentina: {
    legal: "good",
    rights: "good",
    safety: "mixed",
    whatThisMeans:
      "Strong rights framework with safety mostly shaped by neighborhood and late-hour context.",
  },
  Chile: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline is solid, with practical protections and safety comfort varying by area.",
  },
  Colombia: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Strong legal position with local safety patterns that can change sharply by zone and time.",
  },
  Peru: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists, with practical protections still uneven and locally context-sensitive.",
  },
  Uruguay: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal and rights framework with relatively stable local conditions.",
  },
  Paraguay: {
    legal: "good",
    rights: "risk",
    safety: "mixed",
    whatThisMeans:
      "Relationship legality exists, while rights protections remain limited and context-dependent.",
  },
  Venezuela: {
    legal: "good",
    rights: "risk",
    safety: "risk",
    whatThisMeans:
      "Legal baseline on relationships exists, with constrained rights environment and elevated local uncertainty.",
  },
  Cuba: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal context has improved, while practical protections and local consistency still vary.",
  },
  Canada: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal and policy protections with generally stable urban safety conditions.",
  },
  "United States": {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Legal baseline exists nationally, but rights and safety context can vary significantly by state and city.",
  },
  Australia: {
    legal: "good",
    rights: "good",
    safety: "good",
    whatThisMeans:
      "Strong legal and rights baseline with mostly stable city-level safety patterns.",
  },
  "South Africa": {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Strong constitutional baseline with practical safety comfort varying by district and time.",
  },
};

const CITY_RIGHTS_OVERRIDES = {
  budapest: {
    rights: "risk",
    safety: "risk",
    whatThisMeans:
      "Community life exists, but public-rights and event climate currently require extra caution.",
  },
  warsaw: {
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "City conditions can be welcoming in strong community zones, but vary across contexts.",
  },
  tel_aviv: {
    legal: "good",
    rights: "mixed",
    safety: "mixed",
    whatThisMeans:
      "Large queer community presence with practical conditions varying by area and current context.",
  },
};

function resolveLevel(value) {
  if (value === "good" || value === "mixed" || value === "risk") return value;
  return "unknown";
}

function toSignalRow(id, value) {
  const level = resolveLevel(value);
  return {
    id,
    level,
    label: LEVEL_META[level].label,
    className: LEVEL_META[level].className,
  };
}

export function buildRightsSnapshotFromProfile(profile = {}) {
  if (!profile || typeof profile !== "object") return null;

  const legal = toSignalRow("legal", profile.legal_level);
  const rights = toSignalRow("rights", profile.rights_level);
  const safety = toSignalRow("safety", profile.safety_level);
  const whatThisMeans = String(profile.what_this_means || "").trim();
  const confidence = String(profile.confidence || "low").trim().toLowerCase() || "low";
  const updatedAt = profile.updated_at || null;

  return {
    updatedAt,
    confidence,
    whatThisMeans:
      whatThisMeans ||
      "Rights context is being verified from legal and community sources.",
    details: {
      sameSexRelations:
        RELATION_STATUS_LABELS[String(profile.same_sex_relations_status || "unknown")] || "Unknown",
      unions: UNION_STATUS_LABELS[String(profile.union_status || "unknown")] || "Unknown",
      genderRecognition:
        GENDER_RECOGNITION_LABELS[String(profile.legal_gender_recognition_status || "unknown")] || "Unknown",
      antiDiscrimination:
        ANTI_DISCRIMINATION_LABELS[String(profile.anti_discrimination_status || "unknown")] || "Unknown",
    },
    sources: {
      legal: String(profile.source_legal_url || "").trim(),
      rights: String(profile.source_rights_url || "").trim(),
      safety: String(profile.source_safety_url || "").trim(),
    },
    legal,
    rights,
    safety,
  };
}

export function getCityRightsSignals({ cityKey, country }) {
  const countrySnapshot = COUNTRY_RIGHTS_SNAPSHOTS[country] || {};
  const cityOverride = CITY_RIGHTS_OVERRIDES[cityKey] || {};
  const legal = cityOverride.legal || countrySnapshot.legal || "unknown";
  const rights = cityOverride.rights || countrySnapshot.rights || "unknown";
  const safety = cityOverride.safety || countrySnapshot.safety || "unknown";
  const whatThisMeans =
    cityOverride.whatThisMeans ||
    countrySnapshot.whatThisMeans ||
    "Rights context is still being verified for this city. Use local updates and community guidance.";

  const relationStatusByLegal = {
    good: "Legal",
    mixed: "Legal",
    risk: "Restricted",
    unknown: "Unknown",
  };
  const unionStatusByRights = {
    good: "Marriage recognized",
    mixed: "Civil union / partnership",
    risk: "No legal recognition",
    unknown: "Unknown",
  };
  const genderStatusByRights = {
    good: "Available",
    mixed: "Restricted",
    risk: "Restricted",
    unknown: "Unknown",
  };
  const antiDiscriminationByRights = {
    good: "Full coverage",
    mixed: "Partial coverage",
    risk: "Limited / none",
    unknown: "Unknown",
  };

  return {
    updatedAt: countrySnapshot.updatedAt || "2026-05-04",
    confidence: countrySnapshot.confidence || (countrySnapshot.legal ? "medium" : "low"),
    whatThisMeans,
    details: {
      sameSexRelations:
        countrySnapshot.details?.sameSexRelations || relationStatusByLegal[legal] || "Unknown",
      unions: countrySnapshot.details?.unions || unionStatusByRights[rights] || "Unknown",
      genderRecognition:
        countrySnapshot.details?.genderRecognition || genderStatusByRights[rights] || "Unknown",
      antiDiscrimination:
        countrySnapshot.details?.antiDiscrimination || antiDiscriminationByRights[rights] || "Unknown",
    },
    sources: {
      legal: countrySnapshot.sources?.legal || "https://ilga.org/ilga-world-maps/",
      rights: countrySnapshot.sources?.rights || "https://ilga.org/resources/ilga-world-database-resource/",
      safety: countrySnapshot.sources?.safety || "https://ilga.org/ilga-world-maps/",
    },
    legal: toSignalRow("legal", legal),
    rights: toSignalRow("rights", rights),
    safety: toSignalRow("safety", safety),
  };
}
