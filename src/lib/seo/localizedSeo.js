import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
import { getSearchReadyLocales } from "@/lib/i18n/localeSeoRollout";

function cleanPath(path = "/") {
  const value = String(path || "/").split("?")[0].split("#")[0];
  if (value === "/" || !value) return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

export function localePath(path = "/", locale = DEFAULT_LOCALE) {
  const normalizedPath = cleanPath(path);
  const language = normalizeLocale(locale);
  return language === DEFAULT_LOCALE
    ? normalizedPath
    : normalizedPath === "/" ? `/${language}` : `/${language}${normalizedPath}`;
}

const OPEN_GRAPH_LOCALES = Object.freeze({
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
});

/** Return the Open Graph locale for one of Queer Atlas's published locales. */
export function openGraphLocale(locale = DEFAULT_LOCALE) {
  return OPEN_GRAPH_LOCALES[normalizeLocale(locale)] || OPEN_GRAPH_LOCALES[DEFAULT_LOCALE];
}

/** Select reviewed metadata copy while retaining English as the safe fallback. */
export function localizedCopy(locale = DEFAULT_LOCALE, copy = {}) {
  const language = normalizeLocale(locale);
  return copy[language] || copy[DEFAULT_LOCALE] || {};
}

export function localizedAlternates(path = "/", locale = DEFAULT_LOCALE) {
  const normalizedPath = cleanPath(path);
  const searchReadyLocales = new Set(getSearchReadyLocales());
  const languages = { "x-default": normalizedPath };
  for (const language of ["en", "es", "fr", "de"]) {
    if (searchReadyLocales.has(language)) languages[language] = localePath(normalizedPath, language);
  }
  return {
    canonical: localePath(normalizedPath, locale),
    languages,
  };
}

export function localizedOpenGraphUrl(path = "/", locale = DEFAULT_LOCALE) {
  return localePath(path, locale);
}
