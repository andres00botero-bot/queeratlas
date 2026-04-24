function normalizeSlugPiece(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function cityPath(city, fallback = "/cities") {
  const slug = normalizeSlugPiece(city);
  return slug ? `/${slug}` : fallback;
}

export function citySelectionPath(city, { placeId = "", eventId = "", extraParams = null } = {}) {
  const basePath = cityPath(city);
  if (basePath === "/cities") return basePath;

  const params = new URLSearchParams();
  if (placeId) params.set("placeId", String(placeId));
  if (eventId) params.set("eventId", String(eventId));

  if (extraParams && typeof extraParams === "object") {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (!key || value == null || value === "") return;
      params.set(String(key), String(value));
    });
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
