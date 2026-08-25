import "server-only";

import { cityCoreConfig } from "@/lib/cityCore";
import { normalizeRegistryCity, normalizeRegistrySlug } from "@/lib/cityRegistryShared";
import { getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";

const STATIC_ROWS = Object.entries(cityCoreConfig).map(([key, value]) => ({
  key,
  ...value,
  name: String(value.title || key).replace(/^Queer\s+/i, "").trim(),
  seoIndexable: true,
  status: "published",
  dynamic: false,
}));

function isMissingRegistry(error) {
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return error?.code === "42P01" || text.includes("qa_cities") && text.includes("does not exist");
}

async function loadDynamicRows() {
  try {
    const client = getTelemetryServiceClient();
    const { data, error } = await client.from("qa_cities").select("*").eq("status", "published");
    if (error) {
      if (isMissingRegistry(error)) return [];
      throw error;
    }
    return (data || []).map(normalizeRegistryCity).filter(Boolean);
  } catch (error) {
    if (isMissingRegistry(error) || String(error?.message || "").includes("SUPABASE_SERVICE_ROLE_KEY")) return [];
    throw error;
  }
}

export async function listCityRegistry({ indexableOnly = false } = {}) {
  const dynamicRows = await loadDynamicRows();
  const merged = new Map(STATIC_ROWS.map((row) => [row.key, row]));
  dynamicRows.forEach((row) => merged.set(row.key, row));
  const rows = Array.from(merged.values());
  return indexableOnly ? rows.filter((row) => row.seoIndexable) : rows;
}

export async function getCityRegistryEntry(value) {
  const slug = normalizeRegistrySlug(value);
  if (!slug) return null;
  const staticRow = STATIC_ROWS.find((row) => row.key === slug);
  if (staticRow) return staticRow;
  const rows = await loadDynamicRows();
  return rows.find((row) => row.key === slug) || null;
}
