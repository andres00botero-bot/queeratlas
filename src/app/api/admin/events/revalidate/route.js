import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";
import { PUBLIC_EVENTS_CACHE_TAG } from "@/lib/publicEventData";

export const dynamic = "force-dynamic";

function cityPath(value = "") {
  const city = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return city && city !== "global" ? `/${city}` : "";
}

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const path = cityPath(body?.city);
  const paths = ["/events/calendar", "/events/off-grid", "/events/happening-soon", "/sitemap-pages.xml", path].filter(Boolean);
  revalidateTag(PUBLIC_EVENTS_CACHE_TAG, "max");
  for (const item of paths) revalidatePath(item);

  return NextResponse.json({ ok: true, revalidated: paths });
}
