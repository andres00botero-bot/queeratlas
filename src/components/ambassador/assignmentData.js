import { supabase } from "@/lib/supabase";
import { isPublishedEntity } from "@/lib/publicInventory";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";

export const assignmentColumns = "id,user_id,role,city,venue_id,status,starts_at,ends_at";

export function activeAssignment(assignment, now = Date.now()) {
  return assignment.status === "active" && !isVenueAccessRestricted(assignment.city)
    && (!assignment.starts_at || Date.parse(assignment.starts_at) <= now)
    && (!assignment.ends_at || Date.parse(assignment.ends_at) > now);
}

export function canEditEntity(assignment, kind, entity) {
  if (!activeAssignment(assignment) || !entity || !isPublishedEntity(entity) || entity.ambassador_protected) return false;
  if (entity.type === "cruising_area") return false;
  if (assignment.city !== entity.city) return false;
  if (assignment.role === "city") return true;
  const venueId = kind === "venue" ? entity.id : entity.ambassador_venue_id;
  return Boolean(venueId) && String(assignment.venue_id) === String(venueId);
}

export async function loadAssignments(userId) {
  const { data, error } = await supabase.from("qa_ambassador_assignments")
    .select(assignmentColumns).eq("user_id", userId).eq("status", "active").order("city");
  if (error) throw error;
  return (data || []).filter(item => activeAssignment(item));
}

export async function loadInventory(assignment, kind) {
  const table = kind === "event" ? "events" : "places";
  const pageSize = 250;
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from(table).select("*").eq("city", assignment.city);
    if (assignment.role === "venue") {
      query = query.eq(kind === "event" ? "ambassador_venue_id" : "id", assignment.venue_id);
    }
    const { data, error } = await query.order("id").range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data.filter(row => canEditEntity(assignment, kind, row)));
    if (data.length < pageSize) return rows.sort((a, b) => a.name.localeCompare(b.name));
  }
}
