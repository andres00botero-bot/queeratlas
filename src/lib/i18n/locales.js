export const DEFAULT_LOCALE = "en";

export const LOCALES = [
  { code: "en", name: "English", nativeName: "English", published: true },
  { code: "es", name: "Spanish", nativeName: "Español", published: true },
  { code: "fr", name: "French", nativeName: "Français", published: false },
  { code: "de", name: "German", nativeName: "Deutsch", published: false },
];

const LOCALE_CODES = new Set(LOCALES.map((locale) => locale.code));

export function isSupportedLocale(value) {
  return LOCALE_CODES.has(String(value || "").toLowerCase());
}

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  const language = String(value || "").trim().toLowerCase().split("-")[0];
  return isSupportedLocale(language) ? language : fallback;
}

export function getPublishedLocales() {
  return LOCALES.filter((locale) => locale.published);
}
