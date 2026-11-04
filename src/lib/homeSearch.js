// Keep homepage suggestions small and compatible with its existing save actions.
export async function fetchHomeSearch(query, { signal, fetcher = fetch, timeZone = "UTC" } = {}) {
  const params = new URLSearchParams({ q: query.trim().slice(0, 120), mode: "suggestions", tz: timeZone });
  const response = await fetcher(`/api/search?${params}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Search is temporarily unavailable.");
  const payload = await response.json();
  if (!Array.isArray(payload?.results?.all)) throw new Error("Invalid search response.");
  return {
    results: payload.results.all.filter(item => ["city", "place", "event"].includes(item.type)).slice(0, 12),
    partialData: Boolean(payload.meta?.partialData),
  };
}
