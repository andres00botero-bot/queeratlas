import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  getPublishedLocales,
  normalizeLocale,
} from "../src/lib/i18n/locales.js";
import {
  getLocaleFromPathname,
  resolveRequestedLocale,
  toLocalePath,
} from "../src/lib/i18n/localeRouting.js";
import { getMessage } from "../src/lib/i18n/messages.js";
import { defaultsToSpanishByCountry } from "../src/lib/i18n/localeGeo.js";

assert.equal(DEFAULT_LOCALE, "en");
assert.deepEqual(getPublishedLocales().map((locale) => locale.code), ["en", "es"]);
assert.equal(getPublishedLocales().every((locale) => locale.published), true);
assert.equal(normalizeLocale("es-ES"), "es");
assert.equal(normalizeLocale("unknown"), "en");
assert.equal(getLocaleFromPathname("/es/madrid"), "es");
assert.equal(getLocaleFromPathname("/madrid"), null);
assert.equal(toLocalePath("/madrid?placeId=123#map", "es"), "/es/madrid?placeId=123#map");
assert.equal(toLocalePath("/en/madrid", "fr"), "/fr/madrid");
assert.equal(resolveRequestedLocale({ urlLocale: "de", accountLocale: "es" }), "de");
assert.equal(resolveRequestedLocale({ accountLocale: "es", cookieLocale: "fr" }), "es");
assert.equal(getMessage("en", "global.events"), "Events");
assert.equal(getMessage("en", "auth.signIn"), "Sign in");
assert.equal(getMessage("en", "auth.passwordsDoNotMatch"), "Passwords do not match.");
assert.equal(getMessage("en", "pwa.install"), "Yes, install");
assert.equal(getMessage("es", "global.events"), "Eventos");
assert.equal(getMessage("es", "auth.signIn"), "Iniciar sesión");
assert.equal(getMessage("es", "pwa.install"), "Sí, instalar");
assert.equal(getMessage("es", "city.liveCityGuide"), "Guía de ciudad en directo");
assert.equal(getMessage("es", "city.exploreOnMap"), "Explorar en el mapa");
assert.equal(getMessage("es", "city.servicesLower"), "servicios");
assert.equal(getMessage("es", "city.cityOverview"), "Resumen de la ciudad");
assert.equal(getMessage("en", "home.joinFree"), "Join free");
assert.equal(defaultsToSpanishByCountry("ES"), true);
assert.equal(defaultsToSpanishByCountry("mx"), true);
assert.equal(defaultsToSpanishByCountry("SE"), false);
assert.equal(defaultsToSpanishByCountry("US"), false);

console.log("i18n foundation test passed.");
