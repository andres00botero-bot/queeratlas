import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, getPublishedLocales, isSupportedLocale, normalizeLocale } from "@/lib/i18n/locales";

const LOCALE_COOKIE = "qa_locale";
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

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  if (cookieLocale !== DEFAULT_LOCALE && isPublishedLocale(cookieLocale)) {
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
