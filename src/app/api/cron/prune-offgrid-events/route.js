import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

async function pruneExpiredEvents(supabase, table, todayIso) {
  const { data, error } = await supabase
    .from(table)
    .select("id,date,start_date,end_date");

  if (error) throw new Error(`Could not load ${table}: ${error.message || "unknown error"}`);

  const expiredIds = getExpiredEventIds(data, todayIso);
  if (expiredIds.length === 0) return 0;

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

