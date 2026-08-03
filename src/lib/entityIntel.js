const EVENT_FIELDS = [
  ["entry_wait", "entryWait"],
  ["best_arrival", "bestArrival"],
  ["crowd_mix", "crowdMix"],
  ["dress_code", "dressCode"],
  ["host_inclusivity", "hostInclusivity"],
];

const SERVICE_FIELDS = [
  ["booking_lead_time", "bookingLeadTime"],
  ["best_time", "bestTime"],
  ["client_mix", "clientMix"],
  ["preparation", "preparation"],
  ["provider_inclusivity", "providerInclusivity"],
];

function cleanText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 320);
}

function normalizeIntel(value, nestedKey, fields) {
  const nested = value?.[nestedKey];
  const source = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : value || {};
  const result = {};
  for (const [snakeKey, camelKey] of fields) {
    result[camelKey] = cleanText(source?.[snakeKey] ?? source?.[camelKey]);
  }
  result.updatedAt = cleanText(source?.updated_at ?? source?.updatedAt);
  return result;
}

function buildPayload(value, nestedKey, fields) {
  const normalized = normalizeIntel(value, nestedKey, fields);
  const result = {};
  for (const [snakeKey, camelKey] of fields) {
    if (normalized[camelKey]) result[snakeKey] = normalized[camelKey];
  }
  return result;
}

export function normalizeEventIntel(value = {}) {
  return normalizeIntel(buildEventIntelFallback(value), "event_intel", EVENT_FIELDS);
}

export function buildEventIntelPayload(value = {}) {
  const complete = buildEventIntelFallback(value);
  return {
    ...buildPayload(complete, "event_intel", EVENT_FIELDS),
    ...(complete.source_urls?.length ? { source_urls: complete.source_urls } : {}),
    research_status: complete.research_status,
    updated_at: complete.updated_at,
  };
}

export function hasEventIntel(value = {}) {
  const normalized = normalizeEventIntel(value);
  return EVENT_FIELDS.some(([, camelKey]) => Boolean(normalized[camelKey]));
}

export function normalizeServiceIntel(value = {}) {
  return normalizeIntel(buildServiceIntelFallback(value), "service_intel", SERVICE_FIELDS);
}

export function buildServiceIntelPayload(value = {}) {
  const complete = buildServiceIntelFallback(value);
  return {
    ...buildPayload(complete, "service_intel", SERVICE_FIELDS),
    ...(complete.source_urls?.length ? { source_urls: complete.source_urls } : {}),
    research_status: complete.research_status,
    updated_at: complete.updated_at,
  };
}

export function hasServiceIntel(value = {}) {
  const normalized = normalizeServiceIntel(value);
  return SERVICE_FIELDS.some(([, camelKey]) => Boolean(normalized[camelKey]));
}

export function getServiceIntelLabels(type = "") {
  const normalizedType = String(type || "").trim().toLowerCase();
  const common = {
    bookingLeadTime: "Booking lead time",
    bestTime: "Best time",
    clientMix: "Who it suits",
    preparation: "What to prepare",
    providerInclusivity: "Provider inclusion",
  };

  const variants = {
    tour: { bestTime: "Best departure", clientMix: "Group mix", preparation: "What to bring", providerInclusivity: "Guide inclusion" },
    massage: { bestTime: "Best appointment", clientMix: "Client mix", preparation: "What to prepare or wear" },
    wellness: { bestTime: "Best appointment", clientMix: "Client mix", preparation: "What to prepare or wear" },
    gay_store: { bookingLeadTime: "Typical wait", bestTime: "Best time to visit", clientMix: "Customer mix", preparation: "What to know before visiting", providerInclusivity: "Staff inclusion" },
    escort: { bestTime: "Best booking window", clientMix: "Client fit", preparation: "What to discuss beforehand" },
    styling: { bestTime: "Best appointment", clientMix: "Client mix", preparation: "What to bring", providerInclusivity: "Stylist inclusion" },
    concierge: { bestTime: "Best contact time", clientMix: "Client mix", preparation: "What to prepare", providerInclusivity: "Concierge inclusion" },
    transport: { bestTime: "Best pickup window", preparation: "What to prepare", providerInclusivity: "Driver inclusion" },
  };

  return { ...common, ...(variants[normalizedType] || {}) };
}
import { buildEventIntelFallback, buildServiceIntelFallback } from "./intelFallbacks";
