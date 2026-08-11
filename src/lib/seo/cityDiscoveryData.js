import "server-only";

import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";
import { fetchEventsData } from "@/features/events/eventDataApi";
import { fetchServicesQuery } from "@/lib/servicesDataApi";
import { cityGuideConfig } from "@/lib/cityGuides";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { buildEventPath, buildServicePath, buildVenuePath } from "@/lib/seo/entitySlug";

const TOPIC_RULES = {
  "queer-techno-clubs": {
    entityKinds: ["place"],
    preferredTypes: ["club"],
    fallbackTypes: ["club", "bar"],
    keywords: ["techno", "electronic", "house", "warehouse", "industrial"],
    keywordRequired: true,
    listTitle: "Techno and electronic club shortlist",
    exactLabel: "Electronic music match",
    relatedLabel: "Related club option",
  },
  "safest-queer-bars": {
    entityKinds: ["place"],
    preferredTypes: ["bar"],
    fallbackTypes: ["bar", "cafe", "hotel"],
    keywords: ["inclusive", "welcoming", "community", "safe"],
    safetyFocus: true,
    listTitle: "Safety-led bar shortlist",
    exactLabel: "Bar with stronger trust signals",
    relatedLabel: "Lower-friction alternative",
  },
  "lesbian-nightlife": {
    entityKinds: ["place", "event"],
    preferredTypes: ["bar", "club", "event"],
    fallbackTypes: ["bar", "club", "cafe", "event"],
    keywords: ["lesbian", "sapphic", "wlw", "women-led", "queer women", "dyke"],
    keywordRequired: true,
    listTitle: "Sapphic and women-led nightlife",
    exactLabel: "Sapphic or women-led signal",
    relatedLabel: "Broader queer nightlife option",
  },
  "queer-cafes": {
    entityKinds: ["place"],
    preferredTypes: ["cafe"],
    fallbackTypes: ["cafe", "bar"],
    keywords: ["coffee", "cafe", "daytime", "bookshop", "community"],
    listTitle: "Queer cafes and daytime social spots",
    exactLabel: "Cafe match",
    relatedLabel: "Daytime social alternative",
  },
  "events-tonight": {
    entityKinds: ["event"],
    preferredTypes: ["event"],
    fallbackTypes: ["event"],
    dateMode: "tonight",
    listTitle: "Tonight in the city",
    exactLabel: "Listed for today",
    relatedLabel: "Next upcoming event",
  },
  "queer-bars": {
    entityKinds: ["place"],
    preferredTypes: ["bar"],
    fallbackTypes: ["bar", "cafe", "club"],
    keywords: ["bar", "cocktail", "pub", "lounge"],
    listTitle: "Best-matched queer bars",
    exactLabel: "Bar match",
    relatedLabel: "Related social venue",
  },
  "queer-clubs": {
    entityKinds: ["place"],
    preferredTypes: ["club"],
    fallbackTypes: ["club", "bar"],
    keywords: ["club", "dance", "dj", "late-night", "nightclub"],
    listTitle: "Best-matched queer clubs",
    exactLabel: "Club match",
    relatedLabel: "Related nightlife option",
  },
  "queer-hotels": {
    entityKinds: ["place"],
    preferredTypes: ["hotel"],
    fallbackTypes: ["hotel"],
    keywords: ["hotel", "guesthouse", "resort", "hostel", "stay"],
    listTitle: "Queer-friendly stay shortlist",
    exactLabel: "Hotel match",
    relatedLabel: "Related stay option",
  },
  "queer-events-this-week": {
    entityKinds: ["event"],
    preferredTypes: ["event"],
    fallbackTypes: ["event"],
    dateMode: "week",
    listTitle: "Events in the next seven days",
    exactLabel: "This-week event",
    relatedLabel: "Next upcoming event",
  },
  "queer-safe-areas": {
    entityKinds: ["place"],
    preferredTypes: ["bar", "cafe", "hotel"],
    fallbackTypes: ["bar", "cafe", "hotel", "club"],
    keywords: ["inclusive", "welcoming", "community", "central"],
    safetyFocus: true,
    listTitle: "Useful anchors for lower-friction routes",
    exactLabel: "Stronger route anchor",
    relatedLabel: "Additional local option",
  },
  "queer-rooftop-bars": {
    entityKinds: ["place"],
    preferredTypes: ["bar", "hotel", "cafe"],
    fallbackTypes: ["bar", "hotel", "cafe"],
    keywords: ["rooftop", "roof terrace", "sky bar", "skyline", "terrace"],
    keywordRequired: true,
    listTitle: "Rooftops and elevated terraces",
    exactLabel: "Rooftop or terrace signal",
    relatedLabel: "Nearby bar alternative",
  },
  "gay-sauna-guide": {
    entityKinds: ["place"],
    preferredTypes: ["sauna"],
    fallbackTypes: ["sauna", "cruise_club"],
    keywords: ["sauna", "bathhouse", "steam", "spa"],
    listTitle: "Gay sauna shortlist",
    exactLabel: "Sauna match",
    relatedLabel: "Related men-focused venue",
  },
  "queer-friendly-coworking": {
    entityKinds: ["place", "service"],
    preferredTypes: ["coworking"],
    fallbackTypes: ["coworking", "cafe", "community_center", "other"],
    keywords: ["coworking", "co-working", "workspace", "work space", "laptop"],
    keywordRequired: true,
    listTitle: "Coworking and work-friendly leads",
    exactLabel: "Coworking signal",
    relatedLabel: "Daytime work alternative",
  },
  "underground-queer-nightlife": {
    entityKinds: ["place", "event"],
    preferredTypes: ["club", "cruise_club", "event"],
    fallbackTypes: ["club", "cruise_club", "bar", "event"],
    keywords: ["underground", "warehouse", "alternative", "techno", "industrial", "fetish"],
    keywordRequired: true,
    listTitle: "Underground and alternative nightlife",
    exactLabel: "Underground scene signal",
    relatedLabel: "Related late-night option",
  },
  "queer-travel-safety": {
    entityKinds: ["place", "service"],
    preferredTypes: ["hotel", "cafe", "bar", "community_center"],
    fallbackTypes: ["hotel", "cafe", "bar", "service", "other"],
    keywords: ["community", "inclusive", "support", "welcoming", "verified"],
    safetyFocus: true,
    listTitle: "Practical trust and support anchors",
    exactLabel: "Stronger trust signal",
    relatedLabel: "Additional practical option",
  },
  "drag-shows-tonight": {
    entityKinds: ["event", "place"],
    preferredTypes: ["event", "bar", "club"],
    fallbackTypes: ["event", "bar", "club"],
    keywords: ["drag", "cabaret", "queen", "king", "performance"],
    keywordRequired: true,
    dateMode: "tonight-preferred",
    listTitle: "Drag shows and performance rooms",
    exactLabel: "Drag signal",
    relatedLabel: "Related performance venue",
  },
};

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeType(entity = {}, kind = "place") {
  if (kind === "event") return "event";
  if (kind === "service" && !cleanText(entity?.type)) return "service";
  return cleanText(entity?.type).toLowerCase().replace(/[\s-]+/g, "_");
}

function entitySearchText(entity = {}) {
  const intel = entity?.venue_intel || entity?.venueIntel || entity?.service_intel || entity?.event_intel || {};
  return [
    entity?.name,
    entity?.description,
    entity?.vibe,
    entity?.type,
    entity?.location,
    ...(Array.isArray(entity?.vibe_tags) ? entity.vibe_tags : []),
    ...(Array.isArray(entity?.vibeTags) ? entity.vibeTags : []),
    ...Object.values(intel || {}).filter((value) => typeof value === "string"),
  ]
    .map(cleanText)
    .join(" ")
    .toLowerCase();
}

function sourceCount(entity = {}) {
  const intel = entity?.venue_intel || entity?.venueIntel || entity?.service_intel || entity?.event_intel || {};
  const sources = intel?.source_urls || intel?.sourceUrls || [];
  return Array.isArray(sources) ? sources.filter(Boolean).length : 0;
}

function reviewSummary(entity = {}) {
  const rating = Number(entity?.avgRating ?? entity?.avg_rating ?? 0);
  const count = Number(entity?.reviewCount ?? entity?.review_count ?? 0);
  return {
    rating: Number.isFinite(rating) && rating > 0 ? rating : 0,
    count: Number.isFinite(count) && count > 0 ? Math.round(count) : 0,
  };
}

function eventDateState(entity = {}, todayIso = "") {
  const normalized = normalizeEventRange(entity);
  const start = cleanText(normalized.startDate || normalized.date);
  const end = cleanText(normalized.endDate || start);
  const weekEnd = new Date(`${todayIso}T12:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const weekEndIso = weekEnd.toISOString().slice(0, 10);
  return {
    ...normalized,
    start,
    end,
    activeToday: Boolean(start && start <= todayIso && (end || start) >= todayIso),
    activeThisWeek: Boolean(start && start <= weekEndIso && (end || start) >= todayIso),
    upcoming: Boolean(start && (end || start) >= todayIso),
  };
}

function scoreCandidate(candidate, rule, todayIso) {
  const { entity, kind } = candidate;
  const type = normalizeType(entity, kind);
  const searchText = entitySearchText(entity);
  const keywordHits = (rule.keywords || []).filter((keyword) => searchText.includes(keyword));
  const preferredType = rule.preferredTypes.includes(type);
  const fallbackType = rule.fallbackTypes.includes(type);
  const reviews = reviewSummary(entity);
  const sources = sourceCount(entity);
  const descriptionLength = cleanText(entity?.description).length;
  const hasOfficialLink = Boolean(cleanText(entity?.link || entity?.booking_link || entity?.bookingLink));
  const dateState = kind === "event" ? eventDateState(entity, todayIso) : null;

  let exact = preferredType && (!rule.keywordRequired || keywordHits.length > 0);
  if (rule.dateMode === "tonight") exact = Boolean(dateState?.activeToday);
  if (rule.dateMode === "week") exact = Boolean(dateState?.activeThisWeek);
  if (rule.dateMode === "tonight-preferred" && kind === "event") {
    exact = keywordHits.length > 0 && Boolean(dateState?.activeToday);
  }

  let score = preferredType ? 70 : fallbackType ? 28 : 0;
  score += Math.min(keywordHits.length * 16, 48);
  score += hasOfficialLink ? 8 : 0;
  score += Math.min(descriptionLength / 45, 8);
  score += Math.min(sources * 3, 9);
  score += Math.min(reviews.rating * 2, 10);
  score += Math.min(Math.log2(reviews.count + 1) * 2, 12);

  if (rule.safetyFocus) {
    score += reviews.count > 0 ? 10 : 0;
    score += sources > 0 ? 8 : 0;
    score += searchText.includes("inclus") || searchText.includes("welcom") ? 8 : 0;
  }

  if (dateState) {
    if (!dateState.upcoming) score -= 100;
    if (dateState.activeToday) score += 50;
    else if (dateState.activeThisWeek) score += 24;
  }

  return {
    ...candidate,
    type,
    exact,
    score,
    keywordHits,
    reviews,
    sources,
    dateState,
    hasOfficialLink,
  };
}

function formatTypeLabel(type = "", kind = "place") {
  if (kind === "event") return "Event";
  if (kind === "service") return "Service";
  return cleanText(type).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Place";
}

function buildReason(candidate) {
  const pieces = [formatTypeLabel(candidate.type, candidate.kind)];
  const location = cleanText(candidate.entity?.location);
  if (location) pieces.push(location);
  if (candidate.reviews.rating > 0) {
    pieces.push(`${candidate.reviews.rating.toFixed(1)} community rating${candidate.reviews.count ? ` · ${candidate.reviews.count} reviews` : ""}`);
  } else if (candidate.sources > 0) {
    pieces.push(`${candidate.sources} saved source${candidate.sources === 1 ? "" : "s"}`);
  } else if (candidate.hasOfficialLink) {
    pieces.push("official link available");
  }
  return pieces.join(" · ");
}

function candidateHref(city, candidate) {
  if (candidate.kind === "event") return buildEventPath(city, candidate.entity);
  if (candidate.kind === "service") return buildServicePath(city, candidate.entity);
  return buildVenuePath(city, candidate.entity);
}

function selectResults({ city, topic, places, events, services, todayIso }) {
  const rule = TOPIC_RULES[topic];
  if (!rule) return { rule: null, results: [], exactCount: 0, fallbackUsed: false };

  const pool = [
    ...(rule.entityKinds.includes("place") ? places.map((entity) => ({ entity, kind: "place" })) : []),
    ...(rule.entityKinds.includes("event") ? events.map((entity) => ({ entity, kind: "event" })) : []),
    ...(rule.entityKinds.includes("service") ? services.map((entity) => ({ entity, kind: "service" })) : []),
  ];

  const scored = pool
    .map((candidate) => scoreCandidate(candidate, rule, todayIso))
    .filter((candidate) => candidate.score > 0 && (!candidate.dateState || candidate.dateState.upcoming))
    .sort((a, b) => b.score - a.score || cleanText(a.entity?.name).localeCompare(cleanText(b.entity?.name)));

  const exact = scored.filter((candidate) => candidate.exact);
  const related = scored.filter((candidate) => !candidate.exact);
  const selected = [...exact.slice(0, 8), ...related.slice(0, Math.max(0, 8 - exact.length))].slice(0, 8);

  return {
    rule,
    exactCount: exact.length,
    fallbackUsed: exact.length < selected.length,
    results: selected.map((candidate, index) => ({
      id: `${candidate.kind}:${candidate.entity?.id || cleanText(candidate.entity?.name)}:${index}`,
      name: cleanText(candidate.entity?.name) || "Unnamed listing",
      kind: candidate.kind,
      type: candidate.type,
      href: candidateHref(city, candidate),
      officialUrl: cleanText(candidate.entity?.link || candidate.entity?.booking_link || candidate.entity?.bookingLink),
      description: cleanText(candidate.entity?.description),
      location: cleanText(candidate.entity?.location),
      reason: buildReason(candidate),
      matchLabel: candidate.exact ? rule.exactLabel : rule.relatedLabel,
      exact: candidate.exact,
      rating: candidate.reviews.rating,
      reviewCount: candidate.reviews.count,
      startDate: candidate.dateState?.start || "",
      endDate: candidate.dateState?.end || "",
    })),
  };
}

function getGuideText(city, title) {
  const guide = Array.isArray(cityGuideConfig[city]) ? cityGuideConfig[city] : [];
  return cleanText(guide.find((entry) => cleanText(entry?.title).toLowerCase() === title.toLowerCase())?.text);
}

function firstSentence(value = "") {
  const text = cleanText(value);
  if (!text) return "";
  const match = text.match(/^(.+?[.!?])(?:\s|$)/);
  return cleanText(match?.[1] || text);
}

function buildNarrative({ city, cityName, topic, results, exactCount }) {
  const nightlife = firstSentence(getGuideText(city, "Nightlife"));
  const districts = firstSentence(getGuideText(city, "Districts"));
  const safety = firstSentence(getGuideText(city, "Safety"));
  const about = firstSentence(getGuideText(city, "About"));
  const names = results.slice(0, 3).map((entry) => entry.name);
  const shortlist = names.length > 0 ? names.join(names.length > 1 ? ", " : "") : "the current local listings";

  const copyByTopic = {
    "queer-techno-clubs": `${nightlife || about} The current electronic shortlist starts with ${shortlist}. Exact techno signals are prioritised over general club popularity, so broader nightlife options are labelled rather than passed off as dedicated techno rooms.`,
    "safest-queer-bars": `${safety || about} This edit begins with ${shortlist} and weighs community reviews, saved sources, official links, and practical route fit. “Safety-led” is a comparison aid, never a guarantee about an individual night.`,
    "lesbian-nightlife": `${about} In ${cityName}, permanent sapphic venues and recurring women-led nights do not always share the same address. This shortlist starts with ${shortlist}; explicit lesbian or sapphic signals rank first, while broader queer options remain clearly marked.`,
    "queer-cafes": `${districts || about} The daytime shortlist begins with ${shortlist}, favouring places that work for coffee, conversation, and a low-pressure first connection to ${cityName}'s queer life.`,
    "events-tonight": `${nightlife || about} Today’s exact listings appear first. If the calendar is quiet, the page moves to the next confirmed dates instead of inventing a “tonight” programme. The current shortlist begins with ${shortlist}.`,
    "queer-bars": `${nightlife || about} The current Atlas bar edit begins with ${shortlist}. The order favours true bar listings, useful location information, community review signal, and enough detail to make a real choice.`,
    "queer-clubs": `${nightlife || about} For a club-focused night in ${cityName}, the current shortlist begins with ${shortlist}. Dedicated club listings rank before general bars, and official links are surfaced so the final programme and door policy can be checked.`,
    "queer-hotels": `${districts || about} A good stay should make the rest of ${cityName} easier. The current hotel shortlist starts with ${shortlist}, with location, official booking information, and nightlife access carrying more weight than rainbow branding alone.`,
    "queer-events-this-week": `${about} This page reads the next seven days as a real calendar window. Confirmed events such as ${shortlist} appear before later options, with direct event pages for dates, venue details, and official links.`,
    "queer-safe-areas": `${safety || districts} Rather than declaring an entire neighbourhood universally safe, this route uses ${shortlist} as practical local anchors and keeps the city guide's movement context visible.`,
    "queer-rooftop-bars": `${districts || about} Rooftop and terrace claims are matched from the actual listing text. The current ${cityName} edit begins with ${shortlist}; if exact elevated venues are scarce, ordinary bars are shown only as nearby alternatives.`,
    "gay-sauna-guide": `${safety || about} The sauna edit begins with ${shortlist}. Dedicated sauna listings rank first, while cruise venues are separated as related options because facilities, entry rules, and expectations are not interchangeable.`,
    "queer-friendly-coworking": `${about} The current workday search begins with ${shortlist}. Only listings with a coworking or workspace signal count as exact matches; cafes and community spaces are useful fallbacks, not invented coworking venues.`,
    "underground-queer-nightlife": `${nightlife || about} Underground in ${cityName} is read through programme, music, and venue language rather than aesthetics alone. The current edit starts with ${shortlist}, with exact scene signals placed ahead of general late-night rooms.`,
    "queer-travel-safety": `${safety || about} The practical shortlist begins with ${shortlist}, combining community or support relevance with source, review, and location signals. It complements the city safety read; it does not replace current local advice.`,
    "drag-shows-tonight": `${nightlife || about} Drag listings with a current date rank first, followed by venues whose descriptions explicitly mention drag or cabaret. The current edit begins with ${shortlist}, and related performance rooms are labelled honestly.`,
  };

  return {
    intro: copyByTopic[topic] || `${about} The current ${cityName} shortlist begins with ${shortlist}.`,
    districtRead: getGuideText(city, "Districts"),
    safetyRead: getGuideText(city, "Safety"),
    exactCount,
  };
}

export async function loadCityDiscoveryData(city = "", topic = "") {
  const cityKey = normalizeCityKey(city);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [placesResponse, eventsResponse, servicesResponse] = await Promise.all([
    fetchPlacesQueryWithFallback({ filters: { city: cityKey }, mergeSeed: true }),
    fetchEventsData(),
    fetchServicesQuery(),
  ]);

  const belongsToCity = (entity) => normalizeCityKey(entity?.city || "") === cityKey;
  const places = (Array.isArray(placesResponse?.data) ? placesResponse.data : []).filter(belongsToCity);
  const events = (Array.isArray(eventsResponse?.data) ? eventsResponse.data : []).filter(belongsToCity);
  const services = (Array.isArray(servicesResponse?.data) ? servicesResponse.data : []).filter(belongsToCity);
  const selection = selectResults({ city: cityKey, topic, places, events, services, todayIso });

  return {
    ...selection,
    todayIso,
    counts: {
      places: places.length,
      events: events.filter((event) => eventDateState(event, todayIso).upcoming).length,
      services: services.length,
    },
    buildNarrative: (cityName) => buildNarrative({
      city: cityKey,
      cityName,
      topic,
      results: selection.results,
      exactCount: selection.exactCount,
    }),
  };
}
