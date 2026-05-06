"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DateInput from "@/components/ui/DateInput";
import { getEntityQuality, getQualityStatus } from "@/lib/quality";
import { resolveVibeTagsForEntity } from "@/lib/vibeDisplay";
import { STANDARD_VIBE_TAGS, normalizeVibeTag, normalizeVibeTags } from "@/lib/vibeTaxonomy";

const MAX_PLANNER_VIBE_TAGS = 3;

const BUDGETS = [
  { value: "low", label: "Low" },
  { value: "balanced", label: "Balanced" },
  { value: "treat", label: "Treat" },
];

const HORIZONS = [
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "Weekend" },
  { value: "three_days", label: "3 Days" },
];

const DAY_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function parseIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeEventDateValue(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
}

function getEventRange(event = {}) {
  const startDate = normalizeEventDateValue(event.startDate || event.start_date || event.date);
  const endDateRaw = normalizeEventDateValue(event.endDate || event.end_date || event.date);
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;
  return { startDate, endDate: endDate || startDate };
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseTimeToMinutes(value = "") {
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

function expandDaySpec(daySpec = "") {
  const normalized = normalize(daySpec).replace(/\./g, "");
  if (!normalized) return [];
  if (normalized === "daily") return [0, 1, 2, 3, 4, 5, 6];

  if (normalized.includes("-")) {
    const [fromRaw, toRaw] = normalized.split("-");
    const from = DAY_INDEX[fromRaw?.slice(0, 3)];
    const to = DAY_INDEX[toRaw?.slice(0, 3)];
    if (from === undefined || to === undefined) return [];

    const result = [from];
    let cursor = from;
    while (cursor !== to) {
      cursor = (cursor + 1) % 7;
      if (result.includes(cursor)) break;
      result.push(cursor);
    }
    return result;
  }

  const single = DAY_INDEX[normalized.slice(0, 3)];
  return single === undefined ? [] : [single];
}

function parseHoursSegments(hoursText = "") {
  const raw = String(hoursText || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return [];
  if (/open\s*24\s*hours\s*daily|24\/7|daily\s*24\s*hours/i.test(raw)) {
    return [{ days: [0, 1, 2, 3, 4, 5, 6], open: 0, close: 24 * 60, isClosed: false }];
  }

  const chunks = raw
    .split(";")
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(Boolean);

  return chunks.flatMap((chunk) => {
    const closedMatch = chunk.match(/^(daily|[A-Za-z]{3}(?:-[A-Za-z]{3})?)\s+(closed|event-only)$/i);
    if (closedMatch) {
      return [{ days: expandDaySpec(closedMatch[1]), isClosed: true }];
    }

    const timedMatch = chunk.match(
      /^(daily|[A-Za-z]{3}(?:-[A-Za-z]{3})?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/i
    );
    if (timedMatch) {
      const open = parseTimeToMinutes(timedMatch[2]);
      const close = parseTimeToMinutes(timedMatch[3]);
      if (open === null || close === null) return [];
      return [{ days: expandDaySpec(timedMatch[1]), open, close, isClosed: false }];
    }

    const allDayTimedMatch = chunk.match(
      /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(daily)?$/i
    );
    if (allDayTimedMatch) {
      const open = parseTimeToMinutes(allDayTimedMatch[1]);
      const close = parseTimeToMinutes(allDayTimedMatch[2]);
      if (open === null || close === null) return [];
      return [{ days: [0, 1, 2, 3, 4, 5, 6], open, close, isClosed: false }];
    }

    return [];
  });
}

function isPlaceOpenAt(place, date, timeLabel) {
  const segments = parseHoursSegments(place?.hours || "");
  if (segments.length === 0) return true;

  const dow = date.getDay();
  const targetMinutes = parseTimeToMinutes(timeLabel);
  if (targetMinutes === null) return true;

  const daySegments = segments.filter((segment) => segment.days?.includes(dow));
  if (daySegments.length === 0) return false;

  const hasOpenSegment = daySegments.some((segment) => !segment.isClosed);
  if (!hasOpenSegment) return false;

  return daySegments.some((segment) => {
    if (segment.isClosed) return false;
    if (segment.open === 0 && segment.close === 24 * 60) return true;
    if (segment.close > segment.open) {
      return targetMinutes >= segment.open && targetMinutes <= segment.close;
    }
    return targetMinutes >= segment.open || targetMinutes <= segment.close;
  });
}

function filterPlacesOpenAt(pool, date, timeLabel) {
  const openPool = pool.filter((place) => isPlaceOpenAt(place, date, timeLabel));
  return openPool.length > 0 ? openPool : pool;
}

function isEventInWindow(event, startDate, endDate) {
  const range = getEventRange(event);
  if (!range.startDate) return false;
  const eventStart = parseIsoDate(range.startDate);
  const eventEnd = parseIsoDate(range.endDate || range.startDate);
  if (!eventStart || !eventEnd) return false;
  return eventStart.getTime() <= endDate.getTime() && eventEnd.getTime() >= startDate.getTime();
}

function isSameDay(event, targetDate) {
  const range = getEventRange(event);
  if (!range.startDate) return false;
  const targetIso = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
  return targetIso >= range.startDate && targetIso <= (range.endDate || range.startDate);
}

function dayLabel(index, horizon) {
  if (horizon === "tonight") return "Tonight";
  return `Day ${index + 1}`;
}

function formatIsoDateLabel(isoDate) {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return String(isoDate || "");
  return parsed.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

function formatEventRangeLabel(event) {
  const range = getEventRange(event);
  if (!range.startDate) return "";
  if (!range.endDate || range.endDate === range.startDate) {
    return formatIsoDateLabel(range.startDate);
  }
  return `${formatIsoDateLabel(range.startDate)} - ${formatIsoDateLabel(range.endDate)}`;
}

function chooseFromPool(
  pool,
  usedIds,
  fallback = null,
  preferredFavoriteIds = null,
  itemPrefix = "",
  scoreFn = null
) {
  const available = pool.filter((item) => !usedIds.has(`${itemPrefix}${item.id}`));
  if (available.length === 0) return fallback;

  if (scoreFn) {
    const scored = available.map((item) => {
      let score = Number(scoreFn(item) || 0);
      if (preferredFavoriteIds && preferredFavoriteIds.size > 0) {
        const prefKey = `${itemPrefix}${item.id}`;
        if (preferredFavoriteIds.has(prefKey)) score += 6;
      }
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topScore = scored[0]?.score;
    const top = scored.filter((entry) => entry.score === topScore);
    return top[Math.floor(Math.random() * top.length)]?.item || fallback;
  }

  if (preferredFavoriteIds && preferredFavoriteIds.size > 0) {
    const preferred = available.filter((item) => preferredFavoriteIds.has(`${itemPrefix}${item.id}`));
    if (preferred.length > 0) return preferred[Math.floor(Math.random() * preferred.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function chooseEventFromPool(eventsPool, usedIds, preferredFavoriteIds = null, scoreFn = null) {
  return chooseFromPool(eventsPool, usedIds, null, preferredFavoriteIds, "event-", scoreFn);
}

function mapStop(item, stopType, slotLabel, time, reason) {
  if (!item) return null;
  return {
    key: `${stopType}-${item.id}-${slotLabel}-${time}`,
    id: item.id,
    itemType: stopType,
    name: item.name,
    city: item.city,
    slotLabel,
    time,
    reason,
    description: item.description || "",
    trustScore: null,
    trustReason: "",
  };
}

function getTrustedCount(itemType, itemId, trustedFavoriteStats = {}) {
  if (!itemId) return 0;
  const key = itemType === "event" ? `event-${itemId}` : String(itemId);
  return Number(trustedFavoriteStats?.[key] || 0);
}

function computeTrustMeta({
  item,
  itemType,
  timeLabel,
  date,
  trustedFavoriteStats,
  qualityMap,
}) {
  if (!item) return { score: 0, reason: "No trust signal available." };

  const trustedCount = getTrustedCount(itemType, item.id, trustedFavoriteStats);
  const quality = getEntityQuality({
    targetType: itemType,
    targetId: item.id,
    entity: item,
    map: qualityMap,
  });
  const qualityStatus = getQualityStatus(quality);

  let score = 42;
  const reason = [];

  if (trustedCount > 0) {
    score += Math.min(34, trustedCount * 12);
    reason.push(`saved by ${trustedCount} trusted member${trustedCount > 1 ? "s" : ""}`);
  }

  if (qualityStatus.tone === "verified") {
    score += 18;
    reason.push("verified quality");
  } else if (qualityStatus.tone === "stale") {
    score -= 8;
    reason.push("needs refresh");
  }

  if (itemType === "place") {
    if (isPlaceOpenAt(item, date, timeLabel)) {
      score += 12;
      reason.push(`open at ${timeLabel}`);
    } else {
      score -= 6;
      reason.push(`opening unclear at ${timeLabel}`);
    }
  }

  if (itemType === "event" && isSameDay(item, date)) {
    score += 14;
    reason.push("date-matched event");
  }

  return {
    score: Math.max(20, Math.min(99, Math.round(score))),
    reason: reason.length > 0 ? reason.join(" | ") : "Balanced trust signal.",
  };
}

function computeBudgetAdjustment({ itemType, venueType, budget, slotLabel }) {
  const normalizedType = normalize(venueType);
  const normalizedSlot = normalize(slotLabel);

  if (budget === "low") {
    if (normalizedType === "hotel") return -6;
    if (normalizedType === "restaurant") return normalizedSlot.includes("recovery") ? 2 : -2;
    if (itemType === "event") return -2;
    if (["cafe", "bar"].includes(normalizedType)) return 4;
    return 0;
  }

  if (budget === "treat") {
    if (itemType === "event") return 2;
    if (["hotel", "restaurant", "club"].includes(normalizedType)) return 4;
    if (normalizedType === "cafe") return -1;
    return 0;
  }

  return 0;
}

function computeEnergyAdjustment({ itemType, venueType, energy, slotLabel, timeLabel }) {
  const normalizedType = normalize(venueType);
  const normalizedSlot = normalize(slotLabel);
  const targetMinutes = parseTimeToMinutes(timeLabel) ?? 0;
  const isLate = targetMinutes >= 60;
  const isPeakSlot = normalizedSlot.includes("peak");

  if (energy <= 35) {
    if (itemType === "event" && (isLate || isPeakSlot)) return -4;
    if (["club", "cruise_club"].includes(normalizedType)) return -7;
    if (normalizedType === "sauna") return -3;
    if (["cafe", "bar", "restaurant"].includes(normalizedType)) return 5;
    return 0;
  }

  if (energy >= 75) {
    if (itemType === "event" && (isLate || isPeakSlot)) return 5;
    if (["club", "cruise_club"].includes(normalizedType)) return 7;
    if (normalizedType === "sauna") return 2;
    if (normalizedType === "cafe" && isLate) return -3;
    return 0;
  }

  return 0;
}

function getEntityVibeTags(entity) {
  return resolveVibeTagsForEntity(entity, {
    max: MAX_PLANNER_VIBE_TAGS,
    includeTypeFallback: true,
    includeMixedFallback: true,
  });
}

function isAfterpartyEntity(entity) {
  const tags = getEntityVibeTags(entity);
  if (tags.includes("after")) return true;

  const type = normalize(entity?.type);
  if (type === "afterparty" || type === "after") return true;

  const name = normalize(entity?.name);
  return /after[\s-]*party|after[\s-]*hours/.test(name);
}

function computeVibeAdjustment({ item, selectedVibeTags }) {
  const targetTags = normalizeVibeTags(selectedVibeTags, { max: MAX_PLANNER_VIBE_TAGS });
  if (targetTags.length === 0) return 0;

  const itemTags = getEntityVibeTags(item);
  if (itemTags.length === 0) return -2;

  const targetSet = new Set(targetTags);
  const overlap = itemTags.filter((tag) => targetSet.has(tag));
  if (overlap.length > 0) {
    const primaryBoost = targetSet.has(itemTags[0]) ? 2 : 0;
    return 6 + overlap.length * 4 + primaryBoost;
  }

  if (targetSet.has("mixed")) return 1;
  return -5;
}

function computePlannerScore({
  item,
  itemType,
  timeLabel,
  date,
  slotLabel,
  trustedFavoriteStats,
  qualityMap,
  budget,
  energy,
  selectedVibeTags,
}) {
  const trust = computeTrustMeta({
    item,
    itemType,
    timeLabel,
    date,
    trustedFavoriteStats,
    qualityMap,
  });
  const budgetAdjustment = computeBudgetAdjustment({
    itemType,
    venueType: item?.type,
    budget,
    slotLabel,
  });
  const energyAdjustment = computeEnergyAdjustment({
    itemType,
    venueType: item?.type,
    energy,
    slotLabel,
    timeLabel,
  });
  const vibeAdjustment = computeVibeAdjustment({
    item,
    selectedVibeTags,
  });

  return trust.score + budgetAdjustment + energyAdjustment + vibeAdjustment;
}

function createTrustedStop({
  item,
  stopType,
  slotLabel,
  time,
  reason,
  date,
  trustedFavoriteStats,
  qualityMap,
}) {
  const base = mapStop(item, stopType, slotLabel, time, reason);
  if (!base) return null;
  const trust = computeTrustMeta({
    item,
    itemType: stopType,
    timeLabel: time,
    date,
    trustedFavoriteStats,
    qualityMap,
  });
  return {
    ...base,
    trustScore: trust.score,
    trustReason: trust.reason,
  };
}

function buildItinerary({
  city,
  places,
  events,
  vibeTags = [],
  horizon,
  soloSafe,
  budget,
  energy,
  planDate,
  preferredFavoriteIds = null,
  trustedFavoriteStats = {},
  qualityMap = {},
}) {
  const placeRows = places.filter((row) => normalize(row.city) === normalize(city));
  const nonHotelPlaces = placeRows.filter((row) => normalize(row.type) !== "hotel");
  const daysCount = horizon === "tonight" ? 1 : horizon === "weekend" ? 2 : 3;
  const startDate = startOfDay(parseIsoDate(planDate) || new Date());
  const endDate = endOfDay(addDays(startDate, daysCount - 1));
  const selectedTags = normalizeVibeTags(vibeTags, { max: MAX_PLANNER_VIBE_TAGS });

  const eventRows = events.filter(
    (row) =>
      normalize(row.city) === normalize(city) &&
      isEventInWindow(row, startDate, endDate)
  );

  const cafes = nonHotelPlaces.filter((p) => p.type === "cafe");
  const bars = nonHotelPlaces.filter((p) => p.type === "bar");
  const clubs = nonHotelPlaces.filter((p) => p.type === "club");
  const saunas = nonHotelPlaces.filter((p) => ["sauna", "cruise_club"].includes(normalize(p.type)));
  const socialPlaces = nonHotelPlaces.filter((p) => {
    const tags = getEntityVibeTags(p);
    return (
      ["cafe", "bar", "restaurant"].includes(normalize(p.type)) ||
      tags.includes("social") ||
      tags.includes("cozy") ||
      tags.includes("chill")
    );
  });
  const afterPlaces = nonHotelPlaces.filter((p) => {
    const tags = getEntityVibeTags(p);
    return (
      tags.includes("after") ||
      tags.includes("electronic") ||
      tags.includes("techno") ||
      ["bar", "club"].includes(normalize(p.type))
    );
  });
  const relaxPlaces = nonHotelPlaces.filter((p) => {
    const tags = getEntityVibeTags(p);
    return tags.includes("relax") || ["sauna", "cruise_club", "spa"].includes(normalize(p.type));
  });

  const scoreCandidate = (candidate, itemType, timeLabel, slotLabel, date) =>
    computePlannerScore({
      item: candidate,
      itemType,
      timeLabel,
      date,
      slotLabel,
      trustedFavoriteStats,
      qualityMap,
      budget,
      energy,
      selectedVibeTags: selectedTags,
    });

  const used = new Set();

  const pickPlace = (pool, date, timeLabel, slotLabel) =>
    chooseFromPool(
      filterPlacesOpenAt(pool, date, timeLabel),
      used,
      null,
      preferredFavoriteIds,
      "place-",
      (candidate) => scoreCandidate(candidate, "place", timeLabel, slotLabel, date)
    );

  return Array.from({ length: daysCount }).map((_, dayIndex) => {
    const currentDate = addDays(startDate, dayIndex);
    const dayEvents = eventRows.filter((event) => isSameDay(event, currentDate));
    const isLastDay = dayIndex === daysCount - 1;
    const isSunday = currentDate.getDay() === 0;
    const stops = [];

    if (isLastDay && isSunday) {
      const sundayCafe = pickPlace(cafes.length > 0 ? cafes : socialPlaces, currentDate, "11:00", "Sunday reset");
      if (sundayCafe) used.add(`place-${sundayCafe.id}`);

      const sundayAfterpartyEvents = dayEvents.filter((event) => isAfterpartyEntity(event));
      const sundayAfterEvent = chooseEventFromPool(
        sundayAfterpartyEvents.length > 0 ? sundayAfterpartyEvents : dayEvents,
        used,
        preferredFavoriteIds,
        (candidate) => scoreCandidate(candidate, "event", "17:30", "Sunday afterparty", currentDate)
      );
      if (sundayAfterEvent) used.add(`event-${sundayAfterEvent.id}`);
      const sundayAfterPlace =
        sundayAfterEvent ||
        pickPlace(afterPlaces.length > 0 ? afterPlaces : [...bars, ...clubs], currentDate, "17:30", "Sunday afterparty");
      if (!sundayAfterEvent && sundayAfterPlace) used.add(`place-${sundayAfterPlace.id}`);

      const sundayWindDown = pickPlace(
        saunas.length > 0 ? [...saunas, ...relaxPlaces] : relaxPlaces,
        currentDate,
        "21:30",
        "Wind-down"
      );
      if (sundayWindDown) used.add(`place-${sundayWindDown.id}`);

      stops.push(
        createTrustedStop({
          item: sundayCafe,
          stopType: "place",
          slotLabel: "Sunday reset",
          time: "11:00",
          reason: "Start soft with coffee and local orientation.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        }),
        createTrustedStop({
          item: sundayAfterPlace,
          stopType: sundayAfterEvent ? "event" : "place",
          slotLabel: "Sunday afterparty",
          time: "17:30",
          reason: sundayAfterEvent
            ? "Afterparty-style Sunday event selected in the active window."
            : "Afterparty-oriented venue before wind-down.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        }),
        createTrustedStop({
          item: sundayWindDown,
          stopType: "place",
          slotLabel: "Wind-down",
          time: "21:30",
          reason: "Finish with sauna or relax-focused recovery.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        })
      );
    } else {
      const firstTime = dayIndex === 0 ? "17:00" : "12:00";
      const firstSlot = dayIndex === 0 ? "Arrival cafe" : "Day-start cafe";
      const cafeStart = pickPlace(cafes.length > 0 ? cafes : socialPlaces, currentDate, firstTime, firstSlot);
      if (cafeStart) used.add(`place-${cafeStart.id}`);

      const barWarmup = pickPlace(bars.length > 0 ? bars : socialPlaces, currentDate, "20:00", "Bar warmup");
      if (barWarmup) used.add(`place-${barWarmup.id}`);

      const nightSignalEvent = chooseEventFromPool(
        dayEvents,
        used,
        preferredFavoriteIds,
        (candidate) => scoreCandidate(candidate, "event", "22:30", "Night signal", currentDate)
      );
      if (nightSignalEvent) used.add(`event-${nightSignalEvent.id}`);
      const secondBar = nightSignalEvent
        ? null
        : pickPlace([...bars, ...afterPlaces], currentDate, "22:30", "Night signal");
      if (secondBar) used.add(`place-${secondBar.id}`);

      const peakEvent = chooseEventFromPool(
        dayEvents,
        used,
        preferredFavoriteIds,
        (candidate) => scoreCandidate(candidate, "event", "01:00", "Club peak", currentDate)
      );
      if (peakEvent) used.add(`event-${peakEvent.id}`);
      const clubPeak = peakEvent
        ? null
        : pickPlace(clubs.length > 0 ? clubs : afterPlaces, currentDate, "01:00", "Club peak");
      if (clubPeak) used.add(`place-${clubPeak.id}`);

      stops.push(
        createTrustedStop({
          item: cafeStart,
          stopType: "place",
          slotLabel: firstSlot,
          time: firstTime,
          reason: "Start early with a low-friction social anchor.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        }),
        createTrustedStop({
          item: barWarmup,
          stopType: "place",
          slotLabel: "Bar warmup",
          time: "20:00",
          reason: "Build momentum through local bars.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        }),
        createTrustedStop({
          item: nightSignalEvent || secondBar,
          stopType: nightSignalEvent ? "event" : "place",
          slotLabel: "Night signal",
          time: "22:30",
          reason: nightSignalEvent
            ? "Event anchor in tonight's active window."
            : "Second bar pass before peak club pressure.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        }),
        createTrustedStop({
          item: peakEvent || clubPeak,
          stopType: peakEvent ? "event" : "place",
          slotLabel: "Club peak",
          time: "01:00",
          reason: peakEvent
            ? "Peak event timing matched for this night."
            : "Main club stop to close the night arc.",
          date: currentDate,
          trustedFavoriteStats,
          qualityMap,
        })
      );
    }

    return {
      dayKey: `${city}-${dayIndex}`,
      dayLabel: dayLabel(dayIndex, horizon),
      stops: stops.filter(Boolean),
    };
  });
}

function buildHotelSuggestions({
  city,
  places,
  selectedVibeTags = [],
  planDate,
  trustedFavoriteStats = {},
  qualityMap = {},
}) {
  const cityHotels = places.filter(
    (row) => normalize(row.city) === normalize(city) && normalize(row.type) === "hotel"
  );
  if (cityHotels.length === 0) return [];

  const baseDate = startOfDay(parseIsoDate(planDate) || new Date());

  return cityHotels
    .map((hotel) => {
      const score = computePlannerScore({
        item: hotel,
        itemType: "place",
        timeLabel: "16:00",
        date: baseDate,
        slotLabel: "Stay base",
        trustedFavoriteStats,
        qualityMap,
        budget: "balanced",
        energy: 60,
        selectedVibeTags,
      });
      return { ...hotel, plannerScore: score };
    })
    .sort((a, b) => b.plannerScore - a.plannerScore)
    .slice(0, 3);
}

export default function TripPlannerV2({
  plannerCities = [],
  places = [],
  events = [],
  trustedFavoriteIds = [],
  trustedFavoriteStats = {},
  onOpenStop,
  onSavePlan,
}) {
  const [planTitle, setPlanTitle] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [city, setCity] = useState(plannerCities[0] || "");
  const [note, setNote] = useState("");
  const [horizon, setHorizon] = useState("three_days");
  const [selectedVibeTags, setSelectedVibeTags] = useState(["mixed"]);
  const [budget, setBudget] = useState("balanced");
  const [energy, setEnergy] = useState(70);
  const [soloSafe, setSoloSafe] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [locks, setLocks] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const plannerTopRef = useRef(null);
  const itinerarySectionRef = useRef(null);
  const shouldScrollToItineraryRef = useRef(false);
  const qualityMap = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("qa_quality_meta") || "{}");
    } catch {
      return {};
    }
  }, []);
  const trustedFavoritesSet = useMemo(
    () => new Set((trustedFavoriteIds || []).map((item) => String(item))),
    [trustedFavoriteIds]
  );
  const selectedVibeTagSet = useMemo(
    () => new Set(normalizeVibeTags(selectedVibeTags, { max: MAX_PLANNER_VIBE_TAGS })),
    [selectedVibeTags]
  );
  const selectedVibeLabels = useMemo(
    () =>
      STANDARD_VIBE_TAGS
        .filter((tag) => selectedVibeTagSet.has(tag.key))
        .map((tag) => tag.label),
    [selectedVibeTagSet]
  );
  const lockedStopsCount = useMemo(
    () => Object.values(locks).filter(Boolean).length,
    [locks]
  );
  const matchedWindowEvents = useMemo(() => {
    const parsedStart = parseIsoDate(planDate);
    if (!city || !parsedStart) return [];
    const daysCount = horizon === "tonight" ? 1 : horizon === "weekend" ? 2 : 3;
    const start = startOfDay(parsedStart);
    const end = endOfDay(addDays(start, daysCount - 1));
    return events
      .filter(
        (eventRow) =>
          normalize(eventRow.city) === normalize(city) &&
          isEventInWindow(eventRow, start, end)
      )
      .sort((a, b) => {
        const aStart = getEventRange(a).startDate || "";
        const bStart = getEventRange(b).startDate || "";
        return aStart.localeCompare(bStart);
      });
  }, [city, planDate, horizon, events]);
  const highlightedWindowEvent = useMemo(() => {
    if (matchedWindowEvents.length === 0) return null;
    const priority = matchedWindowEvents.find((eventRow) =>
      /pride|orgullo|fiert|rainbow|csd/i.test(String(eventRow.name || ""))
    );
    return priority || matchedWindowEvents[0];
  }, [matchedWindowEvents]);
  const hotelSuggestions = useMemo(
    () =>
      buildHotelSuggestions({
        city,
        places,
        selectedVibeTags,
        planDate,
        trustedFavoriteStats,
        qualityMap,
      }),
    [city, places, selectedVibeTags, planDate, trustedFavoriteStats, qualityMap]
  );

  const canBuild = Boolean(city);

  const cityPlacesCount = useMemo(
    () => places.filter((p) => normalize(p.city) === normalize(city)).length,
    [city, places]
  );

  const cityEventsCount = useMemo(
    () => events.filter((e) => normalize(e.city) === normalize(city)).length,
    [city, events]
  );

  const generate = () => {
    if (!canBuild) return;
    shouldScrollToItineraryRef.current = true;
    const next = buildItinerary({
      city,
      places,
      events,
      vibeTags: selectedVibeTags,
      horizon,
      soloSafe,
      budget,
      energy,
      planDate,
      preferredFavoriteIds: trustedFavoritesSet,
      trustedFavoriteStats,
      qualityMap,
    });
    setItinerary(next);
    setLocks({});
  };

  useEffect(() => {
    if (!shouldScrollToItineraryRef.current) return;
    if (!itinerarySectionRef.current || itinerary.length === 0) return;
    itinerarySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    shouldScrollToItineraryRef.current = false;
  }, [itinerary]);

  const shuffleUnlocked = () => {
    if (!itinerary.length) return;
    const fresh = buildItinerary({
      city,
      places,
      events,
      vibeTags: selectedVibeTags,
      horizon,
      soloSafe,
      budget,
      energy,
      planDate,
      preferredFavoriteIds: trustedFavoritesSet,
      trustedFavoriteStats,
      qualityMap,
    });
    const merged = itinerary.map((day, dayIdx) => {
      const freshDay = fresh[dayIdx] || { ...day, stops: [] };
      const nextStops = freshDay.stops.map((stop, stopIdx) => {
        const lockKey = `${dayIdx}-${stopIdx}`;
        if (locks[lockKey] && day.stops[stopIdx]) return day.stops[stopIdx];
        return stop;
      });
      return { ...freshDay, stops: nextStops };
    });
    setItinerary(merged);
  };

  const toggleLock = (dayIdx, stopIdx) => {
    const key = `${dayIdx}-${stopIdx}`;
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const energyLabel = energy < 35 ? "Low pulse" : energy < 70 ? "Balanced" : "Peak hunt";

  const toggleVibeTag = (rawTag) => {
    const tag = normalizeVibeTag(rawTag);
    if (!tag) return;

    setSelectedVibeTags((current) => {
      const normalizedCurrent = normalizeVibeTags(current, { max: MAX_PLANNER_VIBE_TAGS });
      if (normalizedCurrent.includes(tag)) {
        return normalizedCurrent.filter((entry) => entry !== tag);
      }

      if (normalizedCurrent.length >= MAX_PLANNER_VIBE_TAGS) {
        return [...normalizedCurrent.slice(1), tag];
      }
      return [...normalizedCurrent, tag];
    });
  };

  const handleSave = async () => {
    if (!onSavePlan || itinerary.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await onSavePlan({
        planTitle,
        city,
        horizon,
        vibe: selectedVibeTags[0] || "mixed",
        vibeTags: selectedVibeTags,
        budget,
        energy,
        soloSafe,
        note,
        planDate,
        itinerary,
      });
      if (saved) {
        setItinerary([]);
        setLocks({});
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={plannerTopRef}
      className="mb-5 rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(165deg,rgba(12,18,26,0.96),rgba(8,8,10,0.99))] p-4 shadow-[0_22px_56px_rgba(0,0,0,0.38)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/72">Planner controls</p>
          <p className="mt-1 text-xs text-white/60">Pick city, horizon, and vibe tags. Build in one tap.</p>
        </div>
        <div className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1 text-[11px] text-cyan-100/90">
          {cityPlacesCount} places | {cityEventsCount} events
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] text-white/55">City</p>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              >
                {plannerCities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] text-white/55">Horizon</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {HORIZONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setHorizon(item.value)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      horizon === item.value
                        ? "border-cyan-200/40 bg-cyan-200/16 text-cyan-100"
                        : "border-white/12 bg-white/6 text-white/70 hover:border-white/22"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-cyan-200/16 bg-cyan-200/[0.05] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] text-cyan-100/80">Vibe tags (up to 3)</p>
              <p className="text-[10px] text-cyan-100/65">{selectedVibeLabels.length}/3 selected</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STANDARD_VIBE_TAGS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleVibeTag(item.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    selectedVibeTagSet.has(item.key)
                      ? "border-cyan-200/46 bg-cyan-200/18 text-cyan-50"
                      : "border-white/12 bg-white/6 text-white/70 hover:border-white/22"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/58">
              {selectedVibeLabels.length > 0
                ? `Selected: ${selectedVibeLabels.join(" | ")}`
                : "No vibe filter selected. Planner keeps a balanced mix."}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] text-white/55">Actions</p>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={!canBuild}
              className="rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-105 disabled:opacity-60"
            >
              Build itinerary
            </button>
            <button
              type="button"
              onClick={shuffleUnlocked}
              disabled={itinerary.length === 0}
              className="rounded-full border border-white/14 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:border-white/24 disabled:opacity-60"
            >
              Shuffle unlocked
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={itinerary.length === 0 || isSaving}
              className="rounded-full border border-emerald-200/30 bg-emerald-200/12 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-200/48 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save plan"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold transition ${
              showAdvanced
                ? "border-white/18 bg-white/8 text-white/80 hover:border-white/30"
                : "border-cyan-200/48 bg-gradient-to-r from-cyan-300/28 via-sky-300/22 to-fuchsia-300/26 text-cyan-50 shadow-[0_10px_28px_rgba(56,189,248,0.2)] hover:brightness-110"
            }`}
          >
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                showAdvanced
                  ? "bg-white/10 text-white/70"
                  : "bg-cyan-100/20 text-cyan-50"
              }`}
            >
              Pro
            </span>
            {showAdvanced ? "Hide advanced controls" : "Show advanced controls"}
          </button>
          {!showAdvanced && (
            <p className="mt-1 text-center text-[10px] text-cyan-100/78">
              Budget, energy, solo-safe och plan notes
            </p>
          )}
          {trustedFavoritesSet.size > 0 && (
            <p className="mt-2 text-[11px] text-cyan-100/72">Trusted network signal active.</p>
          )}
        </section>
      </div>

      {planDate && matchedWindowEvents.length > 0 && (
        <div className="mt-3 rounded-2xl border border-fuchsia-200/52 bg-gradient-to-r from-fuchsia-300/22 via-pink-300/14 to-violet-300/22 px-3 py-3 text-fuchsia-50 shadow-[0_14px_32px_rgba(217,70,239,0.2)] animate-pulse">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-200 animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Dates Match Live Events</p>
          </div>
          <p className="mt-1 text-[13px] text-fuchsia-50/92">
            {matchedWindowEvents.length} event{matchedWindowEvents.length > 1 ? "s" : ""} in {city} during your trip window.
          </p>

          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {matchedWindowEvents.slice(0, 4).map((eventItem) => (
              <div
                key={`window-event-${eventItem.id}`}
                className={`rounded-xl border px-3 py-2 ${
                  highlightedWindowEvent?.id === eventItem.id
                    ? "border-fuchsia-100/52 bg-fuchsia-100/16"
                    : "border-white/18 bg-black/20"
                }`}
              >
                <p className="text-base font-semibold leading-tight text-white">{eventItem.name}</p>
                {formatEventRangeLabel(eventItem) && (
                  <p className="mt-1 text-[12px] text-fuchsia-100/88">{formatEventRangeLabel(eventItem)}</p>
                )}
              </div>
            ))}
          </div>

          {matchedWindowEvents.length > 4 && (
            <p className="mt-2 text-[11px] text-fuchsia-100/82">
              +{matchedWindowEvents.length - 4} more matching events in this date range.
            </p>
          )}
        </div>
      )}

      {showAdvanced && (
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 md:col-span-2 xl:col-span-2">
            <p className="text-[11px] text-white/55">Plan title</p>
            <input
              value={planTitle}
              onChange={(event) => setPlanTitle(event.target.value)}
              placeholder="ex. Berlin peak weekend"
              className="mt-1 w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] text-white/55">Start date (optional)</p>
            <div className="mt-1">
              <DateInput
                value={planDate}
                onChange={(event) => setPlanDate(event.target.value)}
                name="trip-plan-date"
                id="trip-plan-date"
                tone="violet"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] text-white/55">Budget</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {BUDGETS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setBudget(item.value)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    budget === item.value
                      ? "border-amber-200/40 bg-amber-200/16 text-amber-100"
                      : "border-white/12 bg-white/6 text-white/70 hover:border-white/22"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 md:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-white/55">Energy</p>
              <p className="text-[11px] text-white/62">{energyLabel}</p>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <label className="mt-2 inline-flex items-center gap-2 text-[12px] text-white/78">
              <input
                type="checkbox"
                checked={soloSafe}
                onChange={(event) => setSoloSafe(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/30"
              />
              Solo-safe mode
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 md:col-span-2 xl:col-span-2">
            <button
              type="button"
              onClick={() => setShowNotes((current) => !current)}
              className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-white/75 transition hover:border-white/22"
            >
              {showNotes ? "Hide notes" : "Add notes"}
            </button>
            {showNotes && (
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add intent, pacing, or must-hit stops."
                className="mt-2 h-20 w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
            )}
          </div>
        </div>
      )}

      {hotelSuggestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-cyan-200/14 bg-cyan-200/[0.04] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-cyan-100">Suggested hotels</p>
            <span className="text-[10px] text-cyan-100/70">Picked before itinerary flow</span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {hotelSuggestions.map((hotel) => (
              <article key={`hotel-${hotel.id}`} className="rounded-xl border border-white/10 bg-black/25 p-2.5">
                <p className="truncate text-sm font-medium text-white">{hotel.name}</p>
                <p className="mt-1 text-[11px] text-white/62 capitalize">{hotel.city} stay base</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-2 py-0.5 text-[10px] text-cyan-50">
                    Score {hotel.plannerScore}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenStop?.({
                        id: hotel.id,
                        name: hotel.name,
                        city: hotel.city,
                        itemType: "place",
                        slotLabel: "Suggested hotel",
                        time: "16:00",
                        reason: "Recommended stay base before itinerary flow.",
                      })
                    }
                    className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-2.5 py-1 text-[10px] text-cyan-100 transition hover:border-cyan-200/40"
                  >
                    Open
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {itinerary.length > 0 && (
        <div ref={itinerarySectionRef} className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200/14 bg-cyan-200/[0.05] px-3 py-2">
            <p className="text-xs font-semibold text-cyan-100">Itinerary ready</p>
            <p className="text-[11px] text-white/68">
              {lockedStopsCount} locked stop{lockedStopsCount === 1 ? "" : "s"} | tap Open for details
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {itinerary.map((day, dayIdx) => (
              <article key={day.dayKey} className="rounded-2xl border border-cyan-200/14 bg-cyan-200/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-cyan-100">{day.dayLabel}</p>
                  <span className="rounded-full border border-white/14 bg-white/6 px-2 py-0.5 text-[10px] text-white/75">
                    {day.stops.length} stops
                  </span>
                </div>
                <div className="space-y-2">
                  {day.stops.length === 0 && (
                    <p className="text-xs text-white/58">No matched stops. Try other vibe tags or city.</p>
                  )}
                  {day.stops.map((stop, stopIdx) => {
                    const lockKey = `${dayIdx}-${stopIdx}`;
                    const isLocked = Boolean(locks[lockKey]);
                    return (
                      <div key={stop.key} className="rounded-xl border border-white/10 bg-black/25 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-2 py-0.5 text-[10px] text-cyan-50">
                                {stop.time}
                              </span>
                              <span className="text-[11px] text-white/62">{stop.slotLabel}</span>
                            </div>
                            <p className="mt-1 truncate text-sm font-medium text-white">{stop.name}</p>
                            <p className="mt-1 text-xs text-white/58">{stop.reason}</p>
                            {typeof stop.trustScore === "number" && (
                              <p className="mt-1 text-[11px] text-cyan-100/78">
                                Trust {stop.trustScore} | {stop.trustReason || "network + quality + timing"}
                              </p>
                            )}
                            {String(stop.trustReason || "").includes("opening unclear") && (
                              <p className="mt-1 text-[10px] text-amber-100/82">Check opening hours before you go.</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleLock(dayIdx, stopIdx)}
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] transition ${
                              isLocked
                                ? "border-amber-200/38 bg-amber-200/20 text-amber-100"
                                : "border-white/12 bg-white/6 text-white/72 hover:border-white/24"
                            }`}
                          >
                            {isLocked ? "Locked" : "Lock"}
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-white/50 capitalize">
                            {stop.itemType === "event" ? "Event stop" : "Venue stop"}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenStop?.(stop)}
                            className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-2.5 py-1 text-[10px] text-cyan-100 transition hover:border-cyan-200/40"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-white/10 bg-black/20 p-2.5">
            <button
              type="button"
              onClick={shuffleUnlocked}
              disabled={itinerary.length === 0}
              className="rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-[11px] text-white/80 transition hover:border-white/24 disabled:opacity-60"
            >
              Shuffle unlocked
            </button>
            <button
              type="button"
              onClick={() => plannerTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1.5 text-[11px] text-cyan-100 transition hover:border-cyan-200/40"
            >
              Back to controls
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={itinerary.length === 0 || isSaving}
              className="rounded-full border border-emerald-200/34 bg-emerald-200/14 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 transition hover:border-emerald-200/54 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

