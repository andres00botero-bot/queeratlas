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

export function localizedAlternates(path = "/", locale = DEFAULT_LOCALE) {
  const normalizedPath = cleanPath(path);
  const searchReadyLocales = new Set(getSearchReadyLocales());
  const languages = {
    en: normalizedPath,
    es: localePath(normalizedPath, "es"),
    "x-default": normalizedPath,
  };
  if (searchReadyLocales.has("de")) languages.de = localePath(normalizedPath, "de");
  return {
    canonical: localePath(normalizedPath, locale),
    languages,
  };
}

export function localizedOpenGraphUrl(path = "/", locale = DEFAULT_LOCALE) {
  return localePath(path, locale);
}
