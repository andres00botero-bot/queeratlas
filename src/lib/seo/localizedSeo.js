import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";

function cleanPath(path = "/") {
  const value = String(path || "/").split("?")[0].split("#")[0];
  if (value === "/" || !value) return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

export function localePath(path = "/", locale = DEFAULT_LOCALE) {
  const normalizedPath = cleanPath(path);
  return normalizeLocale(locale) === "es"
    ? normalizedPath === "/" ? "/es" : `/es${normalizedPath}`
    : normalizedPath;
}

export function localizedAlternates(path = "/", locale = DEFAULT_LOCALE) {
  const normalizedPath = cleanPath(path);
  return {
    canonical: localePath(normalizedPath, locale),
    languages: {
      en: normalizedPath,
      es: localePath(normalizedPath, "es"),
      "x-default": normalizedPath,
    },
  };
}

export function localizedOpenGraphUrl(path = "/", locale = DEFAULT_LOCALE) {
  return localePath(path, locale);
}
