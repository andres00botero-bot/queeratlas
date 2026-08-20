import { cityCoreConfig as cityConfig } from "./cityCore.js";

const COUNTRY_TIME_ZONES = Object.freeze({
  Albania: "Europe/Tirane",
  Argentina: "America/Argentina/Buenos_Aires",
  Austria: "Europe/Vienna",
  Belgium: "Europe/Brussels",
  Brazil: "America/Sao_Paulo",
  Bulgaria: "Europe/Sofia",
  Chile: "America/Santiago",
  Colombia: "America/Bogota",
  Croatia: "Europe/Zagreb",
  Cyprus: "Asia/Nicosia",
  Czechia: "Europe/Prague",
  Denmark: "Europe/Copenhagen",
  Ecuador: "America/Guayaquil",
  Egypt: "Africa/Cairo",
  Estonia: "Europe/Tallinn",
  Finland: "Europe/Helsinki",
  France: "Europe/Paris",
  Georgia: "Asia/Tbilisi",
  Germany: "Europe/Berlin",
  Greece: "Europe/Athens",
  Guatemala: "America/Guatemala",
  Hungary: "Europe/Budapest",
  Iceland: "Atlantic/Reykjavik",
  Ireland: "Europe/Dublin",
  Israel: "Asia/Jerusalem",
  Italy: "Europe/Rome",
  Japan: "Asia/Tokyo",
  Latvia: "Europe/Riga",
  Lebanon: "Asia/Beirut",
  Lithuania: "Europe/Vilnius",
  Luxembourg: "Europe/Luxembourg",
  Malta: "Europe/Malta",
  Mexico: "America/Mexico_City",
  Montenegro: "Europe/Podgorica",
  Namibia: "Africa/Windhoek",
  Netherlands: "Europe/Amsterdam",
  Norway: "Europe/Oslo",
  Panama: "America/Panama",
  Peru: "America/Lima",
  Poland: "Europe/Warsaw",
  Portugal: "Europe/Lisbon",
  Romania: "Europe/Bucharest",
  Serbia: "Europe/Belgrade",
  Slovakia: "Europe/Bratislava",
  Slovenia: "Europe/Ljubljana",
  Spain: "Europe/Madrid",
  Sweden: "Europe/Stockholm",
  Switzerland: "Europe/Zurich",
  Thailand: "Asia/Bangkok",
  Turkey: "Europe/Istanbul",
  "United Kingdom": "Europe/London",
  Uruguay: "America/Montevideo",
});

const CITY_TIME_ZONES = Object.freeze({
  adelaide: "Australia/Adelaide",
  atlanta: "America/New_York",
  austin: "America/Chicago",
  auckland: "Pacific/Auckland",
  brisbane: "Australia/Brisbane",
  boston: "America/New_York",
  buenos_aires: "America/Argentina/Buenos_Aires",
  calgary: "America/Edmonton",
  cape_town: "Africa/Johannesburg",
  chicago: "America/Chicago",
  denver: "America/Denver",
  detroit: "America/Detroit",
  dallas: "America/Chicago",
  fireisland: "America/New_York",
  florianopolis: "America/Sao_Paulo",
  honolulu: "Pacific/Honolulu",
  johannesburg: "Africa/Johannesburg",
  las_vegas: "America/Los_Angeles",
  los_angeles: "America/Los_Angeles",
  manaus: "America/Manaus",
  melbourne: "Australia/Melbourne",
  miami: "America/New_York",
  montreal: "America/Toronto",
  mumbai: "Asia/Kolkata",
  new_york: "America/New_York",
  new_orleans: "America/Chicago",
  orlando: "America/New_York",
  ottawa: "America/Toronto",
  palm_springs: "America/Los_Angeles",
  perth: "Australia/Perth",
  phoenix: "America/Phoenix",
  philadelphia: "America/New_York",
  provincetown: "America/New_York",
  rio_de_janeiro: "America/Sao_Paulo",
  salvador: "America/Bahia",
  salvador_bahia: "America/Bahia",
  san_diego: "America/Los_Angeles",
  san_francisco: "America/Los_Angeles",
  sao_paulo: "America/Sao_Paulo",
  seoul: "Asia/Seoul",
  seattle: "America/Los_Angeles",
  sydney: "Australia/Sydney",
  toronto: "America/Toronto",
  vancouver: "America/Vancouver",
  washington_dc: "America/New_York",
});

function isValidTimeZone(value = "") {
  const timeZone = String(value || "").trim();
  if (!timeZone || timeZone.length > 80) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function cityKeyForName(cityName = "") {
  const target = String(cityName || "").trim().toLowerCase();
  if (!target) return "";
  return (
    Object.entries(cityConfig).find(([, city]) =>
      String(city?.title || "").replace(/^Queer\s+/i, "").trim().toLowerCase() === target
    )?.[0] || ""
  );
}

export function resolveSearchTimeZone({ detectedCity = "", clientTimeZone = "UTC" } = {}) {
  const cityKey = cityKeyForName(detectedCity);
  const city = cityKey ? cityConfig[cityKey] : null;
  const resolved = CITY_TIME_ZONES[cityKey] || COUNTRY_TIME_ZONES[String(city?.country || "").trim()];
  if (isValidTimeZone(resolved)) return resolved;
  if (isValidTimeZone(clientTimeZone)) return clientTimeZone;
  return "UTC";
}
