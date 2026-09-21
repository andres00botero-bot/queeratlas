import { DEFAULT_LOCALE, isSupportedLocale, normalizeLocale } from "./locales.js";

export function getLocaleFromPathname(pathname) {
  const segment = String(pathname || "").split("/").filter(Boolean)[0] || "";
  return isSupportedLocale(segment) ? normalizeLocale(segment) : null;
}

export function toLocalePath(pathname, locale) {
  const targetLocale = normalizeLocale(locale);
  const value = String(pathname || "/");
  const [pathWithQuery, hash = ""] = value.split("#", 2);
  const [path = "/", query = ""] = pathWithQuery.split("?", 2);
  const segments = path.split("/").filter(Boolean);

  if (isSupportedLocale(segments[0])) segments.shift();

  const localizedPath = `/${targetLocale}${segments.length ? `/${segments.join("/")}` : ""}`;
  return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function resolveRequestedLocale({ urlLocale, accountLocale, cookieLocale } = {}) {
  return normalizeLocale(urlLocale || accountLocale || cookieLocale || DEFAULT_LOCALE);
}
