"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const PLAN_VARIANTS = [
  {
    value: "safe",
    label: "Safe",
    summary: "Lower-friction picks with stronger comfort weighting.",
    preset: { vibeTags: ["social", "cozy", "mixed"], budget: "balanced", energy: 55, soloSafe: true },
  },
  {
    value: "social",
    label: "Social",
    summary: "Balanced social momentum across the night.",
    preset: { vibeTags: ["social", "mixed", "pop"], budget: "balanced", energy: 70, soloSafe: false },
  },
  {
    value: "peak",
    label: "Peak",
    summary: "High-energy night with late anchors.",
    preset: { vibeTags: ["electronic", "techno", "festival"], budget: "treat", energy: 90, soloSafe: false },
  },
  {
    value: "recovery",
    label: "Recovery",
    summary: "Softer pacing and calmer close.",
    preset: { vibeTags: ["chill", "relax", "cozy"], budget: "balanced", energy: 35, soloSafe: true },
  },
];

const PLANNER_STEP_CARD_CLASS =
  "group rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.22)] transition hover:border-cyan-200/22 hover:bg-white/[0.06]";
const PLANNER_SELECT_CLASS =
  "mt-2 w-full rounded-2xl border border-white/12 bg-[#11131a] px-3.5 py-3 text-sm font-medium text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(0,0,0,0.18)] transition hover:border-cyan-200/24 focus:border-cyan-200/48 focus:ring-2 focus:ring-cyan-200/16 [&_option]:bg-[#11131a] [&_option]:text-white";
const PLANNER_INPUT_CLASS =
  "mt-2 w-full rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition placeholder:text-white/34 focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/12";
const PLANNER_SECONDARY_BUTTON_CLASS =
  "rounded-full border border-white/14 bg-white/[0.065] px-4 py-2.5 text-sm font-medium text-white/78 transition hover:border-white/26 hover:bg-white/[0.095] disabled:cursor-not-allowed disabled:opacity-45";

const DAY_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const SOLO_SAFE_BLOCK_TAGS = new Set(["cruise", "fetish", "men_only"]);
const SOLO_SAFE_PREFERRED_TAGS = new Set(["social", "cozy", "mixed", "service", "cultural", "chill", "relax"]);
const DEFAULT_STOP_DURATION_MINUTES = 90;
const MIN_TRANSFER_BUFFER_MINUTES = 15;
const WALK_SPEED_KMPH = 4.8;

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

function formatMinutesToTimeLabel(totalMinutes) {
  const safeMinutes = Number.isFinite(Number(totalMinutes)) ? Number(totalMinutes) : 0;
  const normalized = ((Math.round(safeMinutes / 5) * 5) % (24 * 60) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseCoord(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric;
}

function resolveEntityCoordinates(entity) {
  const lat = parseCoord(entity?.lat ?? entity?.latitude);
  const lng = parseCoord(entity?.lng ?? entity?.longitude ?? entity?.lon);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(from, to) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function estimateTransferMinutes(fromEntity, toEntity) {
  const fromCoords = resolveEntityCoordinates(fromEntity);
  const toCoords = resolveEntityCoordinates(toEntity);
  if (!fromCoords || !toCoords) return 30;
  const distanceKm = haversineDistanceKm(fromCoords, toCoords);
  const travelMinutes = (distanceKm / WALK_SPEED_KMPH) * 60;
  return Math.max(12, Math.min(70, Math.round(travelMinutes)));
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

function resolveStartDate(planDate) {
  return startOfDay(parseIsoDate(planDate) || new Date());
}

function resolveDaysCount(horizon) {
  if (horizon === "tonight") return 1;
  if (horizon === "weekend") return 2;
  return 3;
}

function resolveStopDate(dayIndex, planDate) {
  return addDays(resolveStartDate(planDate), dayIndex);
}

function formatIcsTimestamp(date) {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  const hour = String(value.getUTCHours()).padStart(2, "0");
  const minute = String(value.getUTCMinutes()).padStart(2, "0");
  const second = String(value.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function toBase64Url(value) {
  if (!value) return "";
  const bytes = new TextEncoder().encode(String(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  if (!value) return "";
  const padded = `${String(value).replace(/-/g, "+").replace(/_/g, "/")}===`.slice(
    0,
    Math.ceil(String(value).length / 4) * 4
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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
    backupStop: null,
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

function isSoloSafeEntity(entity) {
  const tags = getEntityVibeTags(entity);
  return !tags.some((tag) => SOLO_SAFE_BLOCK_TAGS.has(tag));
}

function filterSoloSafePool(pool = [], soloSafe) {
  if (!soloSafe) return pool;
  const safePool = pool.filter((item) => isSoloSafeEntity(item));
  return safePool.length > 0 ? safePool : pool;
}

function filterSoloSafeEvents(pool = [], soloSafe) {
  if (!soloSafe) return pool;
  const safeEvents = pool.filter((item) => isSoloSafeEntity(item));
  return safeEvents.length > 0 ? safeEvents : pool;
}

function computeSoloSafeAdjustment({ item, itemType, soloSafe, slotLabel, timeLabel }) {
  if (!soloSafe || !item) return 0;

  const tags = getEntityVibeTags(item);
  if (tags.some((tag) => SOLO_SAFE_BLOCK_TAGS.has(tag))) return -28;

  let adjustment = 0;
  const preferredHits = tags.filter((tag) => SOLO_SAFE_PREFERRED_TAGS.has(tag)).length;
  if (preferredHits > 0) adjustment += 3 + preferredHits * 2;

  if (itemType === "place" && normalize(item?.type) === "hotel") adjustment += 2;
  if (itemType === "place" && normalize(item?.type) === "cafe") adjustment += 2;

  const targetMinutes = parseTimeToMinutes(timeLabel) ?? 0;
  const isVeryLate = targetMinutes >= 90;
  if (isVeryLate && normalize(slotLabel).includes("peak")) adjustment -= 3;

  return adjustment;
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
  soloSafe,
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
  const soloSafeAdjustment = computeSoloSafeAdjustment({
    item,
    itemType,
    soloSafe,
    slotLabel,
    timeLabel,
  });

  return trust.score + budgetAdjustment + energyAdjustment + vibeAdjustment + soloSafeAdjustment;
}

function createTrustedStop({
  item,
  stopType,
  slotLabel,
  time,
  reason,
  backupStop = null,
  date,
  trustedFavoriteStats,
  qualityMap,
  soloSafe,
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
    reason:
      trust.reason && String(trust.reason).trim().length > 0
        ? `${reason} Why: ${trust.reason}${soloSafe ? " | solo-safe weighted." : ""}`
        : reason,
    trustScore: trust.score,
    trustReason: trust.reason,
    backupStop,
  };
}

function resolveRepairPool(slotLabel, slotPools) {
  const slot = normalize(slotLabel);
  if (slot.includes("arrival") || slot.includes("day-start") || slot.includes("reset")) {
    return slotPools.cafes.length > 0 ? slotPools.cafes : slotPools.socialPlaces;
  }
  if (slot.includes("warmup")) {
    return slotPools.bars.length > 0 ? slotPools.bars : slotPools.socialPlaces;
  }
  if (slot.includes("night signal")) {
    return [...slotPools.bars, ...slotPools.afterPlaces];
  }
  if (slot.includes("peak")) {
    return slotPools.clubs.length > 0 ? slotPools.clubs : slotPools.afterPlaces;
  }
  if (slot.includes("afterparty")) {
    return slotPools.afterPlaces.length > 0 ? slotPools.afterPlaces : [...slotPools.bars, ...slotPools.clubs];
  }
  if (slot.includes("wind-down")) {
    return slotPools.saunas.length > 0 ? [...slotPools.saunas, ...slotPools.relaxPlaces] : slotPools.relaxPlaces;
  }
  return slotPools.nonHotelPlaces;
}

function applyFeasibilityPass({
  draftStops = [],
  date,
  usedIds,
  slotPools,
  scoreCandidate,
  soloSafe,
  preferredFavoriteIds,
  dayEvents = [],
}) {
  let previous = null;

  return draftStops.map((draft) => {
    if (!draft?.item) return draft;

    let targetTime = parseTimeToMinutes(draft.time);
    if (targetTime === null) return draft;

    if (previous?.item) {
      const transferMinutes = estimateTransferMinutes(previous.item, draft.item);
      const earliest = previous.timeMinutes + DEFAULT_STOP_DURATION_MINUTES + transferMinutes + MIN_TRANSFER_BUFFER_MINUTES;
      if (earliest > targetTime) {
        targetTime = earliest;
      }
    }

    const adjustedTime = formatMinutesToTimeLabel(targetTime);
    let nextDraft = { ...draft, time: adjustedTime };

    if (draft.stopType === "place" && !isPlaceOpenAt(draft.item, date, adjustedTime)) {
      const repairPool = filterPlacesOpenAt(
        filterSoloSafePool(resolveRepairPool(draft.slotLabel, slotPools), soloSafe),
        date,
        adjustedTime
      ).filter((candidate) => !usedIds.has(`place-${candidate.id}`));

      const repaired = chooseFromPool(
        repairPool,
        usedIds,
        null,
        preferredFavoriteIds,
        "place-",
        (candidate) => scoreCandidate(candidate, "place", adjustedTime, draft.slotLabel, date)
      );

      if (repaired) {
        nextDraft = {
          ...nextDraft,
          item: repaired,
          reason: `${draft.reason} Auto-repair: swapped to a venue open at ${adjustedTime}.`,
        };
      } else {
        nextDraft = {
          ...nextDraft,
          reason: `${draft.reason} Auto-repair attempted; verify opening hours before you go.`,
        };
      }
    }

    const excludeKeys = new Set([
      ...(Array.from(usedIds || [])),
      `${nextDraft.stopType === "event" ? "event-" : "place-"}${nextDraft.item?.id}`,
    ]);

    let backupStop = null;
    if (nextDraft.stopType === "event") {
      const candidateEvents = filterSoloSafeEvents(dayEvents, soloSafe).filter(
        (candidate) => !excludeKeys.has(`event-${candidate.id}`)
      );
      const backupEvent = chooseEventFromPool(
        candidateEvents,
        excludeKeys,
        preferredFavoriteIds,
        (candidate) => scoreCandidate(candidate, "event", adjustedTime, nextDraft.slotLabel, date)
      );
      if (backupEvent) {
        backupStop = {
          id: backupEvent.id,
          name: backupEvent.name,
          city: backupEvent.city,
          itemType: "event",
          slotLabel: nextDraft.slotLabel,
          time: adjustedTime,
        };
      }
    } else {
      const backupPool = filterPlacesOpenAt(
        filterSoloSafePool(resolveRepairPool(nextDraft.slotLabel, slotPools), soloSafe),
        date,
        adjustedTime
      ).filter((candidate) => !excludeKeys.has(`place-${candidate.id}`));
      const backupPlace = chooseFromPool(
        backupPool,
        excludeKeys,
        null,
        preferredFavoriteIds,
        "place-",
        (candidate) => scoreCandidate(candidate, "place", adjustedTime, nextDraft.slotLabel, date)
      );
      if (backupPlace) {
        backupStop = {
          id: backupPlace.id,
          name: backupPlace.name,
          city: backupPlace.city,
          itemType: "place",
          slotLabel: nextDraft.slotLabel,
          time: adjustedTime,
        };
      }
    }

    nextDraft = { ...nextDraft, backupStop };
    previous = { item: nextDraft.item, timeMinutes: targetTime };
    return nextDraft;
  });
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
      soloSafe,
    });

  const used = new Set();

  const pickPlace = (pool, date, timeLabel, slotLabel) =>
    chooseFromPool(
      filterPlacesOpenAt(filterSoloSafePool(pool, soloSafe), date, timeLabel),
      used,
      null,
      preferredFavoriteIds,
      "place-",
      (candidate) => scoreCandidate(candidate, "place", timeLabel, slotLabel, date)
    );

  const slotPools = {
    cafes,
    bars,
    clubs,
    saunas,
    socialPlaces,
    afterPlaces,
    relaxPlaces,
    nonHotelPlaces,
  };

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
        filterSoloSafeEvents(sundayAfterpartyEvents.length > 0 ? sundayAfterpartyEvents : dayEvents, soloSafe),
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

      const sundayDraftStops = [
        {
          item: sundayCafe,
          stopType: "place",
          slotLabel: "Sunday reset",
          time: "11:00",
          reason: "Start soft with coffee and local orientation.",
        },
        {
          item: sundayAfterPlace,
          stopType: sundayAfterEvent ? "event" : "place",
          slotLabel: "Sunday afterparty",
          time: "17:30",
          reason: sundayAfterEvent
            ? "Afterparty-style Sunday event selected in the active window."
            : "Afterparty-oriented venue before wind-down.",
        },
        {
          item: sundayWindDown,
          stopType: "place",
          slotLabel: "Wind-down",
          time: "21:30",
          reason: "Finish with sauna or relax-focused recovery.",
        },
      ];
      const sundayStops = applyFeasibilityPass({
        draftStops: sundayDraftStops.filter((entry) => entry.item),
        date: currentDate,
        usedIds: used,
        slotPools,
        scoreCandidate,
        soloSafe,
        preferredFavoriteIds,
        dayEvents,
      });
      sundayStops.forEach((entry) => {
        if (entry.stopType === "event") {
          used.add(`event-${entry.item.id}`);
        } else {
          used.add(`place-${entry.item.id}`);
        }
      });
      stops.push(
        ...sundayStops.map((entry) =>
          createTrustedStop({
            item: entry.item,
            stopType: entry.stopType,
            slotLabel: entry.slotLabel,
            time: entry.time,
            reason: entry.reason,
            backupStop: entry.backupStop,
            date: currentDate,
            trustedFavoriteStats,
            qualityMap,
            soloSafe,
          })
        )
      );
    } else {
      const firstTime = dayIndex === 0 ? "17:00" : "12:00";
      const firstSlot = dayIndex === 0 ? "Arrival cafe" : "Day-start cafe";
      const cafeStart = pickPlace(cafes.length > 0 ? cafes : socialPlaces, currentDate, firstTime, firstSlot);
      if (cafeStart) used.add(`place-${cafeStart.id}`);

      const barWarmup = pickPlace(bars.length > 0 ? bars : socialPlaces, currentDate, "20:00", "Bar warmup");
      if (barWarmup) used.add(`place-${barWarmup.id}`);

      const nightSignalEvent = chooseEventFromPool(
        filterSoloSafeEvents(dayEvents, soloSafe),
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
        filterSoloSafeEvents(dayEvents, soloSafe),
        used,
        preferredFavoriteIds,
        (candidate) => scoreCandidate(candidate, "event", "01:00", "Club peak", currentDate)
      );
      if (peakEvent) used.add(`event-${peakEvent.id}`);
      const clubPeak = peakEvent
        ? null
        : pickPlace(clubs.length > 0 ? clubs : afterPlaces, currentDate, "01:00", "Club peak");
      if (clubPeak) used.add(`place-${clubPeak.id}`);

      const nightDraftStops = [
        {
          item: cafeStart,
          stopType: "place",
          slotLabel: firstSlot,
          time: firstTime,
          reason: "Start early with a low-friction social anchor.",
        },
        {
          item: barWarmup,
          stopType: "place",
          slotLabel: "Bar warmup",
          time: "20:00",
          reason: "Build momentum through local bars.",
        },
        {
          item: nightSignalEvent || secondBar,
          stopType: nightSignalEvent ? "event" : "place",
          slotLabel: "Night signal",
          time: "22:30",
          reason: nightSignalEvent
            ? "Event anchor in tonight's active window."
            : "Second bar pass before peak club pressure.",
        },
        {
          item: peakEvent || clubPeak,
          stopType: peakEvent ? "event" : "place",
          slotLabel: "Club peak",
          time: "01:00",
          reason: peakEvent
            ? "Peak event timing matched for this night."
            : "Main club stop to close the night arc.",
        },
      ];
      const nightStops = applyFeasibilityPass({
        draftStops: nightDraftStops.filter((entry) => entry.item),
        date: currentDate,
        usedIds: used,
        slotPools,
        scoreCandidate,
        soloSafe,
        preferredFavoriteIds,
        dayEvents,
      });
      nightStops.forEach((entry) => {
        if (entry.stopType === "event") {
          used.add(`event-${entry.item.id}`);
        } else {
          used.add(`place-${entry.item.id}`);
        }
      });
      stops.push(
        ...nightStops.map((entry) =>
          createTrustedStop({
            item: entry.item,
            stopType: entry.stopType,
            slotLabel: entry.slotLabel,
            time: entry.time,
            reason: entry.reason,
            backupStop: entry.backupStop,
            date: currentDate,
            trustedFavoriteStats,
            qualityMap,
            soloSafe,
          })
        )
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
        soloSafe: false,
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
  hotelSuggestionsPortalId = "",
}) {
  const [planTitle, setPlanTitle] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [horizon, setHorizon] = useState("three_days");
  const [planVariant, setPlanVariant] = useState("social");
  const [selectedVibeTags, setSelectedVibeTags] = useState(["social", "mixed", "pop"]);
  const [budget, setBudget] = useState("balanced");
  const [energy, setEnergy] = useState(70);
  const [soloSafe, setSoloSafe] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [locks, setLocks] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [plannerNotice, setPlannerNotice] = useState("");
  const [hotelSuggestionsPortalTarget, setHotelSuggestionsPortalTarget] = useState(null);
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
  const selectedVariantMeta = useMemo(
    () => PLAN_VARIANTS.find((variant) => variant.value === planVariant) || PLAN_VARIANTS[1],
    [planVariant]
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

  useEffect(() => {
    queueMicrotask(() => {
      if (!hotelSuggestionsPortalId || typeof document === "undefined") {
        setHotelSuggestionsPortalTarget(null);
        return;
      }
      setHotelSuggestionsPortalTarget(document.getElementById(hotelSuggestionsPortalId));
    });
  }, [hotelSuggestionsPortalId]);

  const canBuild = Boolean(city);

  const applyVariantPreset = (variantValue) => {
    const variant = PLAN_VARIANTS.find((item) => item.value === variantValue);
    if (!variant) return;
    setPlanVariant(variant.value);
    setSelectedVibeTags(normalizeVibeTags(variant.preset.vibeTags, { max: MAX_PLANNER_VIBE_TAGS }));
    setBudget(variant.preset.budget);
    setEnergy(Number(variant.preset.energy));
    setSoloSafe(Boolean(variant.preset.soloSafe));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search || "");
    const seed = String(params.get("trip_seed") || "").trim();
    if (!seed) return;

    let cancelled = false;
    try {
      const parsed = JSON.parse(fromBase64Url(seed));
      const seededVariant = PLAN_VARIANTS.find((item) => item.value === parsed?.variant) || null;
      const seededVibeTags =
        Array.isArray(parsed?.vibeTags) && parsed.vibeTags.length > 0
          ? normalizeVibeTags(parsed.vibeTags, { max: MAX_PLANNER_VIBE_TAGS })
          : seededVariant?.preset.vibeTags;
      const seededBudget =
        parsed?.budget && BUDGETS.some((item) => item.value === parsed.budget)
          ? parsed.budget
          : seededVariant?.preset.budget;
      const seededEnergy = Number.isFinite(Number(parsed?.energy))
        ? Math.max(10, Math.min(100, Number(parsed.energy)))
        : seededVariant?.preset.energy;
      const seededSoloSafe =
        typeof parsed?.soloSafe === "boolean"
          ? parsed.soloSafe
          : seededVariant?.preset.soloSafe;

      queueMicrotask(() => {
        if (cancelled) return;
        if (parsed?.city && plannerCities.includes(parsed.city)) setCity(parsed.city);
        if (parsed?.horizon && HORIZONS.some((item) => item.value === parsed.horizon)) {
          setHorizon(parsed.horizon);
        }
        if (parsed?.planDate) setPlanDate(String(parsed.planDate));
        if (seededVariant) setPlanVariant(seededVariant.value);
        if (seededVibeTags) {
          setSelectedVibeTags(
            normalizeVibeTags(seededVibeTags, { max: MAX_PLANNER_VIBE_TAGS })
          );
        }
        if (seededBudget) setBudget(seededBudget);
        if (seededEnergy !== undefined) setEnergy(Number(seededEnergy));
        if (seededSoloSafe !== undefined) setSoloSafe(Boolean(seededSoloSafe));
        setPlannerNotice("Trip seed loaded. Build to generate this route.");
      });
    } catch {
      queueMicrotask(() => {
        if (!cancelled) {
          setPlannerNotice("Trip seed was invalid. Using default planner state.");
        }
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        variant: planVariant,
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

  const buildShareLink = () => {
    if (typeof window === "undefined") return "";
    const payload = {
      city,
      horizon,
      planDate,
      variant: planVariant,
      vibeTags: normalizeVibeTags(selectedVibeTags, { max: MAX_PLANNER_VIBE_TAGS }),
      budget,
      energy,
      soloSafe,
    };
    const url = new URL(window.location.href);
    url.searchParams.set("trip_seed", toBase64Url(JSON.stringify(payload)));
    return url.toString();
  };

  const copyShareLink = async () => {
    const link = buildShareLink();
    if (!link) return;
    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share({
          title: `QueerAtlas ${city} trip plan`,
          text: `Variant: ${selectedVariantMeta.label} | ${horizon.replaceAll("_", " ")}`,
          url: link,
        });
        setPlannerNotice("Plan link shared.");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setPlannerNotice("Plan link copied.");
    } catch {
      setPlannerNotice("Could not share this plan link.");
    }
  };

  const exportItineraryIcs = () => {
    if (itinerary.length === 0) return;
    const baseDate = resolveStartDate(planDate);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//QueerAtlas//Trip Planner//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    itinerary.forEach((day, dayIdx) => {
      const dayDate = addDays(baseDate, dayIdx);
      day.stops.forEach((stop, stopIdx) => {
        const minutes = parseTimeToMinutes(stop.time) ?? 18 * 60;
        const start = new Date(dayDate);
        start.setHours(0, 0, 0, 0);
        start.setMinutes(minutes);
        const end = new Date(start.getTime() + DEFAULT_STOP_DURATION_MINUTES * 60 * 1000);
        const uid = `${city}-${dayIdx}-${stopIdx}-${stop.id}@queeratlas.app`;
        const summary = `${stop.slotLabel}: ${stop.name}`;
        lines.push(
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${formatIcsTimestamp(new Date())}`,
          `DTSTART:${formatIcsTimestamp(start)}`,
          `DTEND:${formatIcsTimestamp(end)}`,
          `SUMMARY:${summary.replace(/\r?\n/g, " ")}`,
          `DESCRIPTION:${String(stop.reason || "").replace(/\r?\n/g, " ")}`,
          `LOCATION:${String(stop.city || city)}`,
          "END:VEVENT"
        );
      });
    });
    lines.push("END:VCALENDAR");

    const blob = new Blob([`${lines.join("\r\n")}\r\n`], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `queeratlas-${normalize(city || "trip")}-${horizon}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setPlannerNotice("Calendar export ready.");
  };

  const hotelSuggestionsPanel = hotelSuggestions.length > 0 ? (
    <div className={`${hotelSuggestionsPortalId ? "mb-4" : "mt-4"} rounded-[24px] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_34%),rgba(34,211,238,0.04)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-cyan-100">Suggested hotels</p>
          <p className="mt-1 text-[11px] text-white/50">Stay bases picked before the route flow.</p>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2.5 py-1 text-[10px] text-cyan-100/75">Optional</span>
      </div>
      <div className={`grid gap-2 ${hotelSuggestionsPortalId ? "grid-cols-1" : "md:grid-cols-3"}`}>
        {hotelSuggestions.map((hotel) => (
          <article key={`hotel-${hotel.id}`} className="rounded-2xl border border-white/10 bg-black/25 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
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
  ) : null;

  return (
    <div
      ref={plannerTopRef}
      className="overflow-hidden rounded-[30px] border border-cyan-200/16 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(244,114,182,0.10),transparent_30%),linear-gradient(165deg,rgba(14,18,27,0.96),rgba(8,8,10,0.99))] p-4 shadow-[0_28px_82px_rgba(0,0,0,0.42)] sm:p-5 xl:min-h-[48rem]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/72">Build your flow</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Start with three choices</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
            Pick a city, choose the vibe, set the trip window, then let the atlas build a route you can save or export.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <section className={PLANNER_STEP_CARD_CLASS}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/26 bg-cyan-200/12 text-xs font-semibold text-cyan-100">1</span>
            <div>
              <p className="text-sm font-semibold text-white">City</p>
              <p className="text-[11px] text-white/48">Where should the route happen?</p>
            </div>
          </div>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={PLANNER_SELECT_CLASS}
          >
            <option value="" disabled>
              Choose a city
            </option>
            {plannerCities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        <section className={PLANNER_STEP_CARD_CLASS}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 text-xs font-semibold text-fuchsia-100">2</span>
            <div>
              <p className="text-sm font-semibold text-white">Mood</p>
              <p className="text-[11px] text-white/48">Choose the kind of night.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_VARIANTS.map((variant) => (
              <button
                key={variant.value}
                type="button"
                onClick={() => applyVariantPreset(variant.value)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  planVariant === variant.value
                    ? "border-fuchsia-100/46 bg-fuchsia-200/18 text-fuchsia-50 shadow-[0_10px_26px_rgba(244,114,182,0.16)]"
                    : "border-white/12 bg-white/6 text-white/70 hover:border-white/22 hover:text-white"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] leading-5 text-white/62">{selectedVariantMeta.summary}</p>
        </section>

        <section className={PLANNER_STEP_CARD_CLASS}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/26 bg-amber-200/12 text-xs font-semibold text-amber-100">3</span>
            <div>
              <p className="text-sm font-semibold text-white">When</p>
              <p className="text-[11px] text-white/48">Set the length and date.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {HORIZONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setHorizon(item.value)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  horizon === item.value
                    ? "border-amber-100/42 bg-amber-200/16 text-amber-50 shadow-[0_10px_26px_rgba(251,191,36,0.13)]"
                    : "border-white/12 bg-white/6 text-white/70 hover:border-white/22 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <DateInput
              value={planDate}
              onChange={(event) => setPlanDate(event.target.value)}
              name="trip-plan-date"
              id="trip-plan-date"
              tone="violet"
            />
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/58">Next step</p>
            <p className="mt-1 text-sm text-white/72">Build the itinerary first. Save, share, and export appear once a route exists.</p>
          </div>
          {plannerNotice ? <p className="text-[11px] text-cyan-100/78">{plannerNotice}</p> : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={generate}
            disabled={!canBuild}
            className="rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(34,211,238,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1"
          >
            Build itinerary
          </button>
          <button
            type="button"
            onClick={shuffleUnlocked}
            disabled={itinerary.length === 0}
            className={PLANNER_SECONDARY_BUTTON_CLASS}
          >
            Shuffle unlocked
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={itinerary.length === 0 || isSaving}
            className="rounded-full border border-emerald-200/30 bg-emerald-200/12 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/48 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSaving ? "Saving..." : "Save plan"}
          </button>
          <button
            type="button"
            onClick={exportItineraryIcs}
            disabled={itinerary.length === 0}
            className="rounded-full border border-violet-200/30 bg-violet-200/12 px-4 py-2.5 text-sm font-medium text-violet-100 transition hover:border-violet-200/48 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Export calendar
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="rounded-full border border-cyan-200/30 bg-cyan-200/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/48"
          >
            Share link
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
            Fine-tune vibe tags, budget, energy, solo-safe, and notes.
          </p>
        )}
        {trustedFavoritesSet.size > 0 && (
          <p className="mt-2 text-[11px] text-cyan-100/72">Trusted network signal active.</p>
        )}
      </section>

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
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:col-span-2 xl:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">Plan title</p>
            <input
              value={planTitle}
              onChange={(event) => setPlanTitle(event.target.value)}
              placeholder="ex. Berlin peak weekend"
              className={PLANNER_INPUT_CLASS}
            />
          </div>

          <div className="rounded-[22px] border border-cyan-200/16 bg-cyan-200/[0.055] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:col-span-2 xl:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100/80">Vibe tags</p>
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

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">Budget</p>
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

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">Energy</p>
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

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:col-span-2 xl:col-span-2">
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
                className={`${PLANNER_INPUT_CLASS} h-24 resize-none`}
              />
            )}
          </div>
        </div>
      )}

      {hotelSuggestionsPortalId && hotelSuggestionsPortalTarget
        ? createPortal(hotelSuggestionsPanel, hotelSuggestionsPortalTarget)
        : null}
      {!hotelSuggestionsPortalId ? hotelSuggestionsPanel : null}

      {itinerary.length > 0 && (
        <div ref={itinerarySectionRef} className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[22px] border border-cyan-200/16 bg-cyan-200/[0.07] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div>
              <p className="text-xs font-semibold text-cyan-100">Route ready</p>
              <p className="mt-1 text-[11px] text-white/52">Review stops, pin favorites, then save the flow.</p>
            </div>
            <p className="text-[11px] text-white/68">
              {lockedStopsCount} pinned stop{lockedStopsCount === 1 ? "" : "s"} | tap Open details
            </p>
          </div>
          <div className="mb-3 rounded-[22px] border border-fuchsia-200/18 bg-fuchsia-200/[0.06] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-fuchsia-100/78">Story arc</p>
            <p className="mt-1 text-xs text-white/74">
              Warm-up {"->"} Build momentum {"->"} Peak energy {"->"} Recover with lower-friction landings.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {itinerary.map((day, dayIdx) => (
              <article
                key={day.dayKey}
                className="rounded-[24px] border border-cyan-200/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(160deg,rgba(15,21,28,0.62),rgba(9,9,11,0.78))] p-3.5 shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-cyan-100">{day.dayLabel}</p>
                  <span className="rounded-full border border-white/14 bg-white/6 px-2 py-0.5 text-[10px] text-white/75">
                    {day.stops.length} stops
                  </span>
                </div>
                <div className="space-y-2">
                  {day.stops.length === 0 && (
                    <p className="text-xs text-white/58">No matched stops yet. Try another mood or city.</p>
                  )}
                  {day.stops.map((stop, stopIdx) => {
                    const lockKey = `${dayIdx}-${stopIdx}`;
                    const isLocked = Boolean(locks[lockKey]);
                    const reasonParts = String(stop.reason || "").split(" Why: ");
                    const stopNarrative = reasonParts[0] || "";
                    const stopEvidence = reasonParts[1] || "";
                    return (
                      <div
                        key={stop.key}
                        className="rounded-[20px] border border-white/12 bg-[linear-gradient(165deg,rgba(25,24,31,0.94),rgba(10,10,12,0.98))] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-cyan-200/28 bg-cyan-200/14 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-cyan-50">
                                {stop.time}
                              </span>
                              <span className="text-[11px] text-white/62">{stop.slotLabel}</span>
                            </div>
                            <p className="mt-1 truncate text-[15px] font-semibold leading-tight text-white">{stop.name}</p>
                            <p className="mt-1 text-[12px] text-white/72">{stopNarrative}</p>
                            {stopEvidence ? (
                              <p className="mt-1 text-[11px] text-cyan-100/78">Why this stop: {stopEvidence}</p>
                            ) : null}
                            {typeof stop.trustScore === "number" && (
                              <p className="mt-1 text-[11px] text-cyan-100/78">
                                Confidence {stop.trustScore} | {stop.trustReason || "network + quality + timing"}
                              </p>
                            )}
                            {String(stop.trustReason || "").includes("opening unclear") && (
                              <p className="mt-1 text-[10px] text-amber-100/82">Opening hours may be uncertain. Check before going.</p>
                            )}
                            {stop.backupStop?.name ? (
                              <div className="mt-2 rounded-lg border border-white/14 bg-white/[0.06] px-2.5 py-2">
                                <p className="text-[10px] uppercase tracking-[0.1em] text-white/56">Backup option</p>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <p className="truncate text-[11px] text-white/82">{stop.backupStop.name}</p>
                                  <button
                                    type="button"
                                    onClick={() => onOpenStop?.(stop.backupStop)}
                                    className="rounded-full border border-white/16 bg-white/8 px-2 py-0.5 text-[10px] text-white/82 transition hover:border-white/30"
                                  >
                                    Open backup
                                  </button>
                                </div>
                              </div>
                            ) : null}
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
                            {isLocked ? "Pinned" : "Pin"}
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-white/56 capitalize">
                            {stop.itemType === "event" ? "Event anchor" : "Venue anchor"}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenStop?.(stop)}
                            className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-2.5 py-1 text-[10px] text-cyan-100 transition hover:border-cyan-200/40"
                          >
                            Open details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-white/12 bg-black/20 p-2.5">
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
              Back to planner
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

