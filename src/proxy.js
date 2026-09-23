import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, getPublishedLocales, isSupportedLocale, normalizeLocale } from "@/lib/i18n/locales";
import { defaultsToSpanishByCountry } from "@/lib/i18n/localeGeo";

const LOCALE_COOKIE = "qa_locale";
const LOCALE_PREFERENCE_COOKIE = "qa_locale_preference";
const PUBLISHED_LOCALE_CODES = new Set(getPublishedLocales().map((locale) => locale.code));

function isPublishedLocale(locale) {
  return PUBLISHED_LOCALE_CODES.has(normalizeLocale(locale));
}

function withLocaleHeader(request, locale, pathname = "/") {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-qa-locale", locale);
  requestHeaders.set("x-qa-pathname", pathname || "/");
  return requestHeaders;
}

function rememberLocale(response, locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

function isDocumentNavigation(request) {
  const destination = request.headers.get("sec-fetch-dest");
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  return destination === "document" || (!destination && acceptsHtml);
}

function isSearchCrawler(request) {
  return /(?:bot|crawler|spider|slurp|bingpreview)/i.test(request.headers.get("user-agent") || "");
}

function geoLocaleRedirect(request, pathname) {
  const localizedUrl = request.nextUrl.clone();
  localizedUrl.pathname = `/es${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(localizedUrl);
  // Do not let a location-dependent first-visit redirect be shared by caches.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const urlLocale = isSupportedLocale(segments[0]) ? normalizeLocale(segments[0]) : null;

  if (urlLocale && isPublishedLocale(urlLocale)) {
    const internalUrl = request.nextUrl.clone();
    internalUrl.pathname = `/${segments.slice(1).join("/")}` || "/";
    return rememberLocale(
      NextResponse.rewrite(internalUrl, {
        request: { headers: withLocaleHeader(request, urlLocale, internalUrl.pathname) },
      }),
      urlLocale
    );
  }

  const cookieLocaleValue = request.cookies.get(LOCALE_COOKIE)?.value;
  const cookieLocale = normalizeLocale(cookieLocaleValue);
  const hasSavedLocale = Boolean(cookieLocaleValue && isSupportedLocale(cookieLocaleValue) && isPublishedLocale(cookieLocale));
  const hasManualLocalePreference = request.cookies.get(LOCALE_PREFERENCE_COOKIE)?.value === "manual";

  // An explicit visitor choice always wins. Older English locale cookies did not
  // record their source, so they must not prevent country-based first-visit
  // localization for Spanish-speaking markets.
  if (hasSavedLocale && hasManualLocalePreference && cookieLocale !== DEFAULT_LOCALE) {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = `/${cookieLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(localizedUrl);
  }

  if (
    isDocumentNavigation(request) &&
    !isSearchCrawler(request) &&
    !hasManualLocalePreference &&
    defaultsToSpanishByCountry(request.headers.get("x-vercel-ip-country"))
  ) {
    return geoLocaleRedirect(request, pathname);
  }

  if (hasSavedLocale && cookieLocale !== DEFAULT_LOCALE) {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = `/${cookieLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(localizedUrl);
  }

  return NextResponse.next({
    request: { headers: withLocaleHeader(request, DEFAULT_LOCALE, pathname) },
  });
}

export const config = {
  matcher: ["/:path*"],
};
