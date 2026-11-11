import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function buildExpiredEventSourcePath(event = {}) {
  const city = String(event?.city || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const name = String(event?.name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const id = String(event?.id || "").trim();
  if (!city || !name || !id) return null;
  return `/${city}/events/${name}--${id}`;
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing for cron prune.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function isAuthorized(request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  const authHeader = String(request.headers.get("authorization") || "");
  return Boolean(secret) && authHeader === `Bearer ${secret}`;
}

function toTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getExpiredEventIds(rows, todayIso) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => {
      const endDate =
        String(row?.end_date || "").trim() ||
        String(row?.start_date || "").trim() ||
        String(row?.date || "").trim();
      return Boolean(endDate) && endDate < todayIso;
    })
    .map((row) => String(row?.id || "").trim())
    .filter(Boolean);
}

function buildExpiredCityEventLifecycleRows(rows, expiredIds) {
  const expiredIdSet = new Set(expiredIds);
  return rows
    .filter((row) => expiredIdSet.has(String(row?.id || "").trim()))
    .map((row) => {
      const sourcePath = buildExpiredEventSourcePath(row);
      if (!sourcePath) return null;
      const destinationPath = sourcePath.slice(0, sourcePath.lastIndexOf("/"));
      return {
        source_path: sourcePath,
        destination_path: destinationPath,
        lifecycle_status: "redirected",
        entity_kind: "event",
        entity_id: String(row.id),
        entity_name: String(row?.name || "").trim(),
        reason: "Event date passed; redirect to the current city events listing.",
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

async function archiveExpiredCityEventUrls(supabase, rows, expiredIds) {
  const lifecycleRows = buildExpiredCityEventLifecycleRows(rows, expiredIds);
  if (lifecycleRows.length === 0) return;

  const { error } = await supabase
    .from("qa_entity_url_lifecycle")
    .upsert(lifecycleRows, { onConflict: "source_path" });
  if (error) {
    throw new Error(`Could not archive expired event URLs: ${error.message || "unknown error"}`);
  }
}

async function pruneExpiredEvents(supabase, table, todayIso) {
  const { data, error } = await supabase
    .from(table)
    .select("id,name,city,date,start_date,end_date");

  if (error) throw new Error(`Could not load ${table}: ${error.message || "unknown error"}`);

  const expiredIds = getExpiredEventIds(data, todayIso);
  if (expiredIds.length === 0) return 0;

  if (table === "events") {
    await archiveExpiredCityEventUrls(supabase, data, expiredIds);
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .in("id", expiredIds);

  if (deleteError) throw new Error(`Could not delete expired ${table}: ${deleteError.message || "unknown error"}`);
  return expiredIds.length;
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const todayIso = toTodayIso();

    const [globalEventsDeleted, cityEventsDeleted] = await Promise.all([
      pruneExpiredEvents(supabase, "global_events", todayIso),
      pruneExpiredEvents(supabase, "events", todayIso),
    ]);

    return NextResponse.json({
      ok: true,
      deleted: globalEventsDeleted + cityEventsDeleted,
      globalEventsDeleted,
      cityEventsDeleted,
      todayIso,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unexpected cron error." },
      { status: 500 }
    );
  }
}

