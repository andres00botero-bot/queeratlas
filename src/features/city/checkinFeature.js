export function humanizeCitySlug(value = "") {
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeCityKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

export function cityNameFromConfig(config, citySlug) {
  const titleName = String(config?.title || "").replace(/^Queer\s+/i, "").trim();
  return titleName || humanizeCitySlug(citySlug) || "this city";
}
