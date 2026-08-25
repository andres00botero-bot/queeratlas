export function normalizeRegistrySlug(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeRegistryCity(row) {
  if (!row?.slug) return null;
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  return {
    key: normalizeRegistrySlug(row.slug),
    center: [longitude, latitude],
    title: String(row.title || `Queer ${row.name || ""}`).trim(),
    name: String(row.name || "").trim(),
    country: String(row.country || "").trim(),
    countryCode: String(row.country_code || "").trim(),
    timezone: String(row.timezone || "").trim(),
    vibe: String(row.vibe || "").trim(),
    localMood: String(row.local_mood || "").trim(),
    queerStatus: String(row.queer_status || "").trim(),
    crowd: String(row.crowd_profile || "").trim(),
    introduction: String(row.introduction || "").trim(),
    guide: Array.isArray(row.guide_items) ? row.guide_items : [],
    guideResearch: {
      checkedAt: String(row.guide_checked_at || "").trim(),
      sources: Array.isArray(row.guide_sources) ? row.guide_sources : [],
    },
    safetyContext: String(row.safety_context || "").trim(),
    qariDestinationKey: String(row.qari_destination_key || "").trim(),
    qariScore: Number(row.qari_score),
    qariSummary: String(row.qari_summary || "").trim(),
    qariConfidence: String(row.qari_confidence || "").trim(),
    mapConfirmed: Boolean(row.map_confirmed),
    status: String(row.status || "draft"),
    verifiedPlaceCount: Number(row.verified_place_count || 0),
    seoIndexable: Boolean(row.seo_indexable),
    seoRequirements: row.seo_requirements || {},
    dynamic: true,
  };
}
