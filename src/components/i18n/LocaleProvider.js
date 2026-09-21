"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  t: (key, fallback) => fallback || key,
});

function getByPath(source, path) {
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((value, segment) => (value && typeof value === "object" ? value[segment] : undefined), source);
}

export default function LocaleProvider({ children, locale = DEFAULT_LOCALE, messages = {} }) {
  const value = useMemo(
    () => ({
      locale,
      t: (key, fallback) => {
        const value = getByPath(messages, key);
        return typeof value === "string" || typeof value === "number" ? value : (fallback || key);
      },
    }),
    [locale, messages]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
