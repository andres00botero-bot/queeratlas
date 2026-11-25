import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestContext } from "@/lib/telemetry/serverSupabase";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";
import { cityPath } from "@/lib/cityRouting";

export async function POST(request) {
  const context = await getAuthenticatedRequestContext(request);
  if (!context) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const event = body?.entityType === "event";
  if ((!event && body?.entityType !== "venue") || !/^\d+$/.test(String(body?.entityId)) ||
      !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(body?.assignmentId || "")) {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }
  const { client, user } = context;
  const [grantResult, entityResult] = await Promise.all([
    client.from("qa_ambassador_assignments").select("city,venue_id,role,starts_at,ends_at")
      .eq("id", body.assignmentId).eq("user_id", user.id).eq("status", "active").maybeSingle(),
    client.from(event ? "events" : "places").select(event ? "id,city,name,ambassador_venue_id" : "id,city,name")
      .eq("id", body.entityId).maybeSingle(),
  ]);
  if (grantResult.error || entityResult.error) return NextResponse.json({ error: "lookup-failed" }, { status: 503 });
  const grant = grantResult.data;
  const entity = entityResult.data;
  const now = Date.now();
  if (!grant || !entity || grant.city !== entity.city || Date.parse(grant.starts_at) > now ||
      (grant.ends_at && Date.parse(grant.ends_at) <= now) ||
      (grant.role !== "city" && String(grant.venue_id) !== String(event ? entity.ambassador_venue_id : entity.id))) {
    return NextResponse.json({ error: "out-of-scope" }, { status: 403 });
  }
  const base = cityPath(entity.city);
  revalidatePath(base);
  revalidatePath(event ? buildEventPath(entity.city, entity) : buildVenuePath(entity.city, entity));
  revalidatePath(base + (event ? "/events" : "/directory"));
  if (event) revalidatePath("/events/calendar");
  return NextResponse.json({ ok: true });
}
