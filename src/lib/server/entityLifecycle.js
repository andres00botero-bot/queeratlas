import { cache } from "react";
import { supabase } from "../supabase.js";
import { normalizeLifecyclePath } from "../entityLifecyclePath.js";

const VALID_KINDS = new Set(["venue", "event", "service", "page"]);
const VALID_STATUSES = new Set(["redirected", "gone"]);

export { normalizeLifecyclePath };

export const getEntityLifecycle = cache(async (sourcePath = "") => {
  const normalizedPath = normalizeLifecyclePath(sourcePath);
  try {
    const { data, error } = await supabase
      .from("qa_entity_url_lifecycle")
      .select("source_path, destination_path, lifecycle_status, entity_kind, entity_name, reason, updated_at")
      .eq("source_path", normalizedPath)
      .maybeSingle();

    if (error || !data) return null;
    const lifecycleStatus = String(data.lifecycle_status || "").trim().toLowerCase();
    const entityKind = String(data.entity_kind || "page").trim().toLowerCase();
    if (!VALID_STATUSES.has(lifecycleStatus) || !VALID_KINDS.has(entityKind)) return null;

    const destinationPath = data.destination_path
      ? normalizeLifecyclePath(data.destination_path)
      : "";
    if (lifecycleStatus === "redirected" && (!destinationPath || destinationPath === normalizedPath)) {
      return null;
    }

    return {
      sourcePath: normalizedPath,
      destinationPath,
      lifecycleStatus,
      entityKind,
      entityName: String(data.entity_name || "").trim(),
      reason: String(data.reason || "").trim(),
      updatedAt: data.updated_at || null,
    };
  } catch {
    // The public site must still return its normal 404 if the lifecycle table is
    // unavailable or has not yet been migrated.
    return null;
  }
});
