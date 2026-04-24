"use client";

import { useMemo, useState } from "react";
import DateInput from "@/components/ui/DateInput";
import { getEntityQuality, getQualityStatus } from "@/lib/quality";

const VIBES = [
  { value: "soft", label: "Soft" },
  { value: "social", label: "Social" },
  { value: "wild", label: "Wild" },
  { value: "dark", label: "Dark" },
  { value: "mixed", label: "Mixed" },
];

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

function chooseFromPool(
  pool,
  usedIds,
  fallback = null,
  preferredFavoriteIds = null,
  itemPrefix = "",
  scoreFn = null,
  usedKeyPrefix = ""
) {
  const available = pool.filter((item) => !usedIds.has(`${usedKeyPrefix}${String(item.id)}`));
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
  return chooseFromPool(eventsPool, usedIds, null, preferredFavoriteIds, "event-", scoreFn, "event:");
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
    reason: reason.length > 0 ? reason.join(" · ") : "Balanced trust signal.",
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

  return trust.score + budgetAdjustment + energyAdjustment;
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

function pickRandomItem(pool = []) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

function chooseStopForSlot({
  slot,
  currentDate,
  dayEvents,
  used,
  allPlacesFallback,
  preferredFavoriteIds,
  trustedFavoriteStats,
  qualityMap,
  budget,
  energy,
}) {
  if (!slot) return null;

  if (slot.eventPreferred) {
    const pickedEvent = chooseEventFromPool(
      dayEvents,
      used,
      preferredFavoriteIds,
      (candidate) =>
        computePlannerScore({
          item: candidate,
          itemType: "event",
          timeLabel: slot.time,
          date: currentDate,
          slotLabel: slot.slotLabel,
          trustedFavoriteStats,
          qualityMap,
          budget,
          energy,
        }) + Number(slot.eventBoost || 12)
    );
    if (pickedEvent) {
      used.add(`event:${String(pickedEvent.id)}`);
      return createTrustedStop({
        item: pickedEvent,
        stopType: "event",
        slotLabel: slot.slotLabel,
        time: slot.time,
        reason: slot.eventReason || slot.reason,
        date: currentDate,
        trustedFavoriteStats,
        qualityMap,
      });
    }
  }

  const placePool = Array.isArray(slot.placePool) && slot.placePool.length > 0
    ? slot.placePool
    : allPlacesFallback;
  const openPool = filterPlacesOpenAt(placePool, currentDate, slot.time);
  const fallbackPlace = pickRandomItem(openPool.length > 0 ? openPool : placePool);
  const pickedPlace = chooseFromPool(
    openPool,
    used,
    fallbackPlace,
    preferredFavoriteIds,
    "",
    (candidate) =>
      computePlannerScore({
        item: candidate,
        itemType: "place",
        timeLabel: slot.time,
        date: currentDate,
        slotLabel: slot.slotLabel,
        trustedFavoriteStats,
        qualityMap,
        budget,
        energy,
      }),
    "place:"
  );
  if (!pickedPlace) return null;
  used.add(`place:${String(pickedPlace.id)}`);
  return createTrustedStop({
    item: pickedPlace,
    stopType: "place",
    slotLabel: slot.slotLabel,
    time: slot.time,
    reason: slot.reason,
    date: currentDate,
    trustedFavoriteStats,
    qualityMap,
  });
}

function buildItinerary({
  city,
  places,
  events,
  vibe,
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
  const daysCount = horizon === "tonight" ? 1 : horizon === "weekend" ? 2 : 3;
  const startDate = startOfDay(parseIsoDate(planDate) || new Date());
  const endDate = endOfDay(addDays(startDate, daysCount - 1));
  const eventRows = events.filter(
    (row) =>
      normalize(row.city) === normalize(city) &&
      isEventInWindow(row, startDate, endDate)
  );

  const cafes = placeRows.filter((p) => p.type === "cafe");
  const bars = placeRows.filter((p) => p.type === "bar");
  const clubs = placeRows.filter((p) => p.type === "club");
  const saunas = placeRows.filter((p) => p.type === "sauna");
  const hotels = placeRows.filter((p) => p.type === "hotel");
  const restaurants = placeRows.filter((p) => p.type === "restaurant");
  const cruiseClubs = placeRows.filter((p) => p.type === "cruise_club");
  const chill = placeRows.filter((p) => ["cafe", "bar", "hotel", "restaurant"].includes(p.type));
  const dark = placeRows.filter((p) => ["sauna", "cruise_club", "club"].includes(p.type));
  const safeLean = placeRows.filter((p) => ["cafe", "bar", "restaurant", "hotel"].includes(p.type));
  const allPlacesFallback = placeRows.length > 0 ? placeRows : places;

  const used = new Set();

  return Array.from({ length: daysCount }).map((_, dayIndex) => {
    const currentDate = addDays(startDate, dayIndex);
    const dayEvents = eventRows.filter((event) => isSameDay(event, currentDate));
    const stops = [];
    const isSunday = currentDate.getDay() === 0;
    const isArrival = dayIndex === 0 && daysCount > 1;
    const isTonightOnly = dayIndex === 0 && daysCount === 1;
    const isLastDay = dayIndex === daysCount - 1 && daysCount > 1;

    const socialWarmPool = soloSafe ? [...safeLean, ...cafes, ...bars] : [...bars, ...cafes, ...restaurants];
    const vibeNightPool =
      vibe === "soft"
        ? [...bars, ...cafes, ...restaurants]
        : vibe === "dark"
          ? [...clubs, ...cruiseClubs, ...saunas, ...bars]
          : [...clubs, ...bars, ...saunas];
    const sundayResetPool = vibe === "dark" ? [...saunas, ...bars, ...restaurants] : [...bars, ...saunas, ...cafes];

    const slots = [];
    if (isArrival) {
      slots.push(
        {
          slotLabel: "Hotel check-in",
          time: "15:00",
          placePool: hotels.length > 0 ? hotels : [...safeLean, ...chill],
          reason: "Start from a stable base before the city run begins.",
        },
        {
          slotLabel: "Early cafe",
          time: "17:30",
          placePool: [...cafes, ...restaurants, ...safeLean],
          reason: "Low-friction reset before evening signal.",
        },
        {
          slotLabel: "City event signal",
          time: "21:00",
          placePool: socialWarmPool,
          eventPreferred: true,
          eventBoost: 22,
          eventReason: "Live event prioritized for this day and city window.",
          reason: "Social momentum before peak hours.",
        }
      );
      if (energy >= 35) {
        slots.push({
          slotLabel: "Late-night core",
          time: "00:30",
          placePool: vibeNightPool,
          eventPreferred: dayEvents.length > 1,
          eventBoost: 16,
          eventReason: "Second live event captured when available.",
          reason: "High-fit late option based on your selected vibe.",
        });
      }
    } else if (isTonightOnly) {
      slots.push(
        {
          slotLabel: "Warmup",
          time: "20:30",
          placePool: socialWarmPool,
          reason: "Set baseline before the main night push.",
        },
        {
          slotLabel: "Night highlight",
          time: "23:30",
          placePool: vibeNightPool,
          eventPreferred: true,
          eventBoost: 24,
          eventReason: "Date-matched event prioritized as the main highlight.",
          reason: "Strong nightlife anchor for your selected vibe.",
        }
      );
      if (energy >= 45) {
        slots.push({
          slotLabel: "After-hours",
          time: "02:00",
          placePool: [...vibeNightPool, ...bars],
          reason: "Continue only where timing and energy still match.",
        });
      }
    } else if (isSunday) {
      slots.push(
        {
          slotLabel: "Sunday brunch",
          time: "11:00",
          placePool: [...cafes, ...restaurants, ...safeLean],
          reason: "Gentle weekend close with daytime social energy.",
        },
        {
          slotLabel: "Sunday reset",
          time: "15:30",
          placePool: sundayResetPool,
          reason: "Sunday mix of bar + sauna style reset.",
        },
        {
          slotLabel: "Sunday highlight",
          time: "21:30",
          placePool: energy < 45 ? [...bars, ...restaurants, ...saunas] : [...bars, ...saunas, ...clubs],
          eventPreferred: true,
          eventBoost: 20,
          eventReason: "Sunday event prioritized when available.",
          reason: "Close the day with the best-fit city signal.",
        }
      );
    } else {
      slots.push(
        {
          slotLabel: "Morning cafe",
          time: "10:30",
          placePool: [...cafes, ...hotels, ...restaurants],
          reason: "Day-start recovery and planning checkpoint.",
        },
        {
          slotLabel: "Golden hour",
          time: "18:00",
          placePool: [...bars, ...restaurants, ...cafes],
          reason: "Bridge daytime into nightlife smoothly.",
        },
        {
          slotLabel: "Prime signal",
          time: "22:30",
          placePool: vibeNightPool,
          eventPreferred: true,
          eventBoost: 22,
          eventReason: "Event-first prime-time pick for this date.",
          reason: "Main nightlife anchor driven by your vibe.",
        }
      );
      if (!isLastDay || energy >= 55) {
        slots.push({
          slotLabel: "Late drift",
          time: "01:30",
          placePool: energy < 40 ? [...bars, ...chill] : [...vibeNightPool, ...bars],
          reason: "Optional late continuation with lower friction.",
        });
      }
    }

    slots.forEach((slot) => {
      const stop = chooseStopForSlot({
        slot,
        currentDate,
        dayEvents,
        used,
        allPlacesFallback,
        preferredFavoriteIds,
        trustedFavoriteStats,
        qualityMap,
        budget,
        energy,
      });
      if (stop) stops.push(stop);
    });

    return {
      dayKey: `${city}-${dayIndex}`,
      dayLabel: dayLabel(dayIndex, horizon),
      stops: stops.filter(Boolean),
    };
  });
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
  const [vibe, setVibe] = useState("mixed");
  const [budget, setBudget] = useState("balanced");
  const [energy, setEnergy] = useState(70);
  const [soloSafe, setSoloSafe] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [locks, setLocks] = useState({});
  const [isSaving, setIsSaving] = useState(false);
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
    const next = buildItinerary({
      city,
      places,
      events,
      vibe,
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

  const shuffleUnlocked = () => {
    if (!itinerary.length) return;
    const fresh = buildItinerary({
      city,
      places,
      events,
      vibe,
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

  const handleSave = async () => {
    if (!onSavePlan || itinerary.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await onSavePlan({
        planTitle,
        city,
        horizon,
        vibe,
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
    <div className="mb-6 rounded-[28px] border border-fuchsia-200/16 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.16),transparent_30%),linear-gradient(180deg,rgba(28,14,36,0.95),rgba(10,10,10,0.98))] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/78">Trip planner</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Queer Atlas flow for queer nights</h3>
          {trustedFavoritesSet.size > 0 && (
            <p className="mt-1 text-xs text-fuchsia-100/72">
              Trusted signal active · planning with your network saves.
            </p>
          )}
          <p className="mt-1 text-[11px] text-white/55">
            Trust score blends network signal, quality status, and time-fit.
          </p>
        </div>
        <div className="rounded-full border border-fuchsia-200/16 bg-fuchsia-200/10 px-3 py-1 text-xs text-fuchsia-100">
          {cityPlacesCount} places · {cityEventsCount} events
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Plan title</p>
          <input
            value={planTitle}
            onChange={(event) => setPlanTitle(event.target.value)}
            placeholder="ex. Berlin peak weekend"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          />
          <div className="mt-3 rounded-xl border border-violet-200/18 bg-violet-300/[0.08] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-violet-100/80">
              Trip date (optional)
            </p>
            <p className="mt-1 text-xs text-violet-100/60">
              Pick your start date for this plan.
            </p>
            <div className="mt-2 max-w-sm">
              <DateInput
                value={planDate}
                onChange={(event) => setPlanDate(event.target.value)}
                name="trip-plan-date"
                id="trip-plan-date"
                tone="violet"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">City</p>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          >
            {plannerCities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Horizon</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HORIZONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setHorizon(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  horizon === item.value
                    ? "border-fuchsia-200/36 bg-fuchsia-200/16 text-fuchsia-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Vibe</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setVibe(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  vibe === item.value
                    ? "border-cyan-200/36 bg-cyan-200/16 text-cyan-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Budget</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUDGETS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setBudget(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  budget === item.value
                    ? "border-amber-200/36 bg-amber-200/16 text-amber-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Energy</p>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 text-xs text-white/60">{energyLabel}</p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-1">
          <label className="inline-flex items-center gap-2 text-sm text-white/78">
            <input
              type="checkbox"
              checked={soloSafe}
              onChange={(event) => setSoloSafe(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/30"
            />
            Solo-safe mode
          </label>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Optional notes</p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add your personal intent, people, pacing, or must-hit spots."
            className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!canBuild}
          className="rounded-full bg-gradient-to-r from-fuchsia-200 via-pink-200 to-cyan-200 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          Build itinerary
        </button>
        <button
          type="button"
          onClick={shuffleUnlocked}
          disabled={itinerary.length === 0}
          className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/75 disabled:opacity-60"
        >
          Shuffle unlocked
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={itinerary.length === 0 || isSaving}
          className="rounded-full border border-emerald-200/26 bg-emerald-200/12 px-4 py-2 text-sm text-emerald-100 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save plan"}
        </button>
      </div>

      {itinerary.length > 0 && (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {itinerary.map((day, dayIdx) => (
            <article key={day.dayKey} className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/56">{day.dayLabel}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/42">
                Energy curve: soft → peak → recover
              </p>
              <div className="mt-3 space-y-2">
                {day.stops.length === 0 && (
                  <p className="text-xs text-white/52">No matched stops. Try another vibe/city.</p>
                )}
                {day.stops.map((stop, stopIdx) => {
                  const lockKey = `${dayIdx}-${stopIdx}`;
                  const isLocked = Boolean(locks[lockKey]);
                  return (
                    <div key={stop.key} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                            {stop.time} · {stop.slotLabel}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">{stop.name}</p>
                          <p className="mt-1 text-xs text-white/55">{stop.reason}</p>
                          {typeof stop.trustScore === "number" && (
                            <p className="mt-1 text-[11px] text-cyan-100/75">
                              Trust {stop.trustScore} · {stop.trustReason || "network + quality + timing"}
                            </p>
                          )}
                          {String(stop.trustReason || "").includes("opening unclear") && (
                            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-amber-100/80">
                              Check opening hours before you go
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLock(dayIdx, stopIdx)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                            isLocked
                              ? "border-amber-200/35 bg-amber-200/18 text-amber-100"
                              : "border-white/12 bg-white/6 text-white/65"
                          }`}
                        >
                          {isLocked ? "Locked" : "Lock"}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-white/45 capitalize">{stop.itemType}</span>
                        <button
                          type="button"
                          onClick={() => onOpenStop?.(stop)}
                          className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100"
                        >
                          Open on map
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
