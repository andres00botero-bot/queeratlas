import { buildEventPath } from "@/lib/seo/entitySlug";
import { toLocalePath } from "@/lib/i18n/localeRouting";

export function eventListingHref(event, locale) {
  const path = event.isGlobal
    ? `/events/off-grid?offgridEventId=global-${encodeURIComponent(event.id)}`
    : buildEventPath(event.city, event);
  return toLocalePath(path, locale);
}
