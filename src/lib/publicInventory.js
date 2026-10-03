import { isEventStatusDiscoverable } from "@/features/events/eventStatus";
import { resolveEventEndDate } from "@/lib/seo/entityIndexing";

const NON_PUBLIC_STATUSES = new Set(["draft", "hold", "rejected", "blocked", "not_published"]);

function text(value = "") {
  return String(value || "").trim();
}

function hasPublicStatus(entity = {}) {
  const status = text(entity?.seo_quality_status || entity?.status).toLowerCase();
  return !NON_PUBLIC_STATUSES.has(status) && entity?.seo_indexable !== false;
}

export function isPublishedEntity(entity = {}) {
  return Boolean(text(entity?.id) && text(entity?.name) && text(entity?.city) && hasPublicStatus(entity));
}

export function isUpcomingPublishedEvent(event = {}, todayIso = new Date().toISOString().slice(0, 10)) {
  const endDate = resolveEventEndDate(event);
  return (
    isPublishedEntity(event) &&
    isEventStatusDiscoverable(event, { hasDate: /^\d{4}-\d{2}-\d{2}$/.test(endDate) }) &&
    /^\d{4}-\d{2}-\d{2}$/.test(endDate) &&
    endDate >= todayIso
  );
}

export function uniquePublishedEntities(rows = []) {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : []).filter((entity) => {
    if (!isPublishedEntity(entity)) return false;
    const key = [text(entity.city).toLowerCase(), text(entity.name).toLowerCase(), text(entity.type).toLowerCase()]
      .join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
