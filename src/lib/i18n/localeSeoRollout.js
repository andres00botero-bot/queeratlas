import { normalizeLocale } from "./locales.js";

// A language can be available to visitors before it is ready to compete in
// organic search. German stays out of search until every indexable route has
// a reviewed German primary content experience, not merely translated chrome.
const SEARCH_READY_LOCALES = new Set(["en", "es", "de"]);

export function isLocaleSearchReady(locale) {
  return SEARCH_READY_LOCALES.has(normalizeLocale(locale));
}

export function getSearchReadyLocales() {
  return [...SEARCH_READY_LOCALES];
}
