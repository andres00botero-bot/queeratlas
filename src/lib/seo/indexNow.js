import { cityCoreConfig } from "../cityCore.js";
import { listSeoReports } from "./reportsIndex.js";
import { isIndexableTopicHub, isTier1CityTopic } from "./indexingTier.js";

export const INDEXNOW_ORIGIN = "https://www.queeratlas.app";
export const INDEXNOW_HOST = "www.queeratlas.app";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY = "259be8ea0ee343c1b2d47469936b2fd9";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_KEY_LOCATION = `${INDEXNOW_ORIGIN}${INDEXNOW_KEY_PATH}`;

const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const SAFE_ENTITY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:--[a-zA-Z0-9-]+)?$/;
const STATIC_PATHS = new Set([
  "/",
  "/cities",
  "/events",
  "/now",
  "/gay-guide",
  "/queer-guide",
  "/hbtq-guide",
  "/topics",
  "/reports",
  "/terms",
  "/privacy",
  "/community-policy",
]);
const CITY_PATHS = new Set(Object.keys(cityCoreConfig));
const REPORT_PATHS = new Set(listSeoReports().map((report) => report.slug));

function normalizeCity(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_");
}

function slugify(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEntitySlug(entity = {}) {
  const nameSlug = slugify(entity?.name || entity?.title || "");
  const id = String(entity?.id || "").trim();
  if (!nameSlug) return "";
  return id ? `${nameSlug}--${id}` : nameSlug;
}

export function isValidIndexNowKey(value = "") {
  return INDEXNOW_KEY_PATTERN.test(String(value || "").trim());
}

export function normalizeIndexNowUrl(candidate = "") {
  const raw = String(candidate || "").trim();
  if (!raw) return "";

  let parsed;
  try {
    parsed = new URL(raw, INDEXNOW_ORIGIN);
  } catch {
    return "";
  }

  if (
    parsed.origin !== INDEXNOW_ORIGIN ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    return "";
  }

  const normalizedPath =
    parsed.pathname !== "/" ? parsed.pathname.replace(/\/+$/, "") : "/";
  parsed.pathname = normalizedPath || "/";
  return parsed.toString().replace(/\/$/, parsed.pathname === "/" ? "/" : "");
}

export function isAllowedIndexNowUrl(candidate = "") {
  const normalized = normalizeIndexNowUrl(candidate);
  if (!normalized) return false;

  const { pathname } = new URL(normalized);
  if (STATIC_PATHS.has(pathname)) return true;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    return CITY_PATHS.has(segments[0]);
  }
  if (segments.length === 2 && segments[0] === "topics") {
    return isIndexableTopicHub(segments[1]);
  }
  if (segments.length === 2 && segments[0] === "reports") {
    return REPORT_PATHS.has(segments[1]);
  }
  if (segments.length === 3 && segments[1] === "discover") {
    return CITY_PATHS.has(segments[0]) && isTier1CityTopic(segments[0], segments[2]);
  }
  if (
    segments.length === 3 &&
    CITY_PATHS.has(segments[0]) &&
    (segments[1] === "events" || segments[1] === "venues")
  ) {
    return SAFE_ENTITY_SLUG_PATTERN.test(segments[2]);
  }
  return false;
}

export function filterIndexNowUrls(candidates = [], limit = 100) {
  const accepted = [];
  const rejected = [];
  const seen = new Set();

  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    const normalized = normalizeIndexNowUrl(candidate);
    if (!normalized || !isAllowedIndexNowUrl(normalized)) {
      rejected.push(String(candidate || ""));
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (accepted.length < limit) accepted.push(normalized);
  }

  return { accepted, rejected };
}

export function buildPublishedEntityIndexNowUrls(entityType = "", entity = {}, submission = {}) {
  const type = String(entityType || "").trim().toLowerCase();
  const city = normalizeCity(entity?.city || submission?.city || submission?.payload?.city || "");
  const cityPath = CITY_PATHS.has(city) ? `/${city}` : "";
  const urls = [];

  if (type === "community_story") urls.push("/now");
  if (type === "event") urls.push("/events");
  if (cityPath) urls.push(cityPath);

  const entitySlug = buildEntitySlug(entity);
  if (cityPath && entitySlug && type === "event") {
    urls.push(`${cityPath}/events/${entitySlug}`);
  }
  if (cityPath && entitySlug && type === "place") {
    urls.push(`${cityPath}/venues/${entitySlug}`);
  }

  return filterIndexNowUrls(urls).accepted;
}

export function buildIndexNowPayload(key, urls = []) {
  const normalizedKey = String(key || "").trim();
  const { accepted } = filterIndexNowUrls(urls, 10000);
  if (!isValidIndexNowKey(normalizedKey) || accepted.length === 0) return null;

  return {
    host: INDEXNOW_HOST,
    key: normalizedKey,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: accepted,
  };
}
