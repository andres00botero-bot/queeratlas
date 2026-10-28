import { normalizeLocale } from "./locales.js";

// Keep this list limited to languages whose published experience has completed
// editorial and technical review. It drives robots headers, hreflang and the
// sitemap from one source of truth.
const SEARCH_READY_LOCALES = new Set(["en", "es", "de", "fr"]);

export function isLocaleSearchReady(locale) {
  return SEARCH_READY_LOCALES.has(normalizeLocale(locale));
}

export function getSearchReadyLocales() {
  return [...SEARCH_READY_LOCALES];
}
