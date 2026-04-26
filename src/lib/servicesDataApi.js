import { supabase } from "./supabase";
import { isMissingVibeTagsColumnError } from "./vibeTaxonomy";

const DEFAULT_SERVICE_SELECT =
  "id, name, city, type, description, hours, link, location, lat, lng, price_tier, provider_name, contact, booking_link, image_urls, vibe, vibe_tags, source, lastChecked, verified, created_by";

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const text = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();
  return code === "42P01" || code === "PGRST205" || (text.includes("relation") && text.includes("does not exist"));
}

function extractMissingColumn(error) {
  if (!error) return "";
  const haystack = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`;
  const match = haystack.match(/column\s+["']?([a-zA-Z0-9_]+)["']?\s+does not exist/i);
  return String(match?.[1] || "").trim();
}

function removeSelectColumn(select, column) {
  const target = String(column || "").trim().toLowerCase();
  if (!target) return select;
  const pieces = String(select || "")
    .split(",")
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  const filtered = pieces.filter((entry) => String(entry).toLowerCase() !== target);
  return filtered.join(", ");
}

async function runSelect(client, select, options) {
  const query = client.from("services");
  return options ? query.select(select, options) : query.select(select);
}

function normalizeRows(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return safeRows.map((row) => ({
    ...row,
    image_urls: Array.isArray(row?.image_urls)
      ? row.image_urls.map((value) => String(value || "").trim()).filter(Boolean)
      : [],
    vibe_tags: Array.isArray(row?.vibe_tags) ? row.vibe_tags : [],
  }));
}

export async function fetchServicesQuery({
  client = supabase,
  select = DEFAULT_SERVICE_SELECT,
  options,
} = {}) {
  let workingSelect = String(select || DEFAULT_SERVICE_SELECT);
  let response = null;
  const droppedColumns = new Set();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    response = await runSelect(client, workingSelect, options);
    if (!response?.error) {
      return {
        data: normalizeRows(response?.data),
        error: null,
        count: response?.count ?? null,
        tableMissing: false,
        droppedColumns: [...droppedColumns],
      };
    }

    if (isMissingTableError(response.error)) {
      return {
        data: [],
        error: null,
        count: 0,
        tableMissing: true,
        droppedColumns: [...droppedColumns],
      };
    }

    const missingColumn = extractMissingColumn(response.error);
    if (missingColumn) {
      const nextSelect = removeSelectColumn(workingSelect, missingColumn);
      if (!nextSelect || nextSelect === workingSelect) break;
      droppedColumns.add(missingColumn);
      workingSelect = nextSelect;
      continue;
    }

    if (isMissingVibeTagsColumnError(response.error)) {
      const nextSelect = removeSelectColumn(workingSelect, "vibe_tags");
      if (!nextSelect || nextSelect === workingSelect) break;
      droppedColumns.add("vibe_tags");
      workingSelect = nextSelect;
      continue;
    }

    break;
  }

  return {
    data: normalizeRows(response?.data),
    error: response?.error ?? null,
    count: response?.count ?? null,
    tableMissing: false,
    droppedColumns: [...droppedColumns],
  };
}
