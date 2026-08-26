const UNIVERSAL_TIME_ZONES = ["UTC"];

export function isValidTimeZone(value = "") {
  const timeZone = String(value || "").trim();
  if (!timeZone || timeZone.length > 80) return false;

  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getSupportedTimeZones() {
  const supported = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [];

  return [...new Set([...UNIVERSAL_TIME_ZONES, ...supported])]
    .filter(isValidTimeZone)
    .sort((left, right) => left.localeCompare(right, "en"));
}
