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
  const expected = secret ? `Bearer ${secret}` : "";
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (secret) return authHeader === expected;
  return isVercelCron;
}

function toTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const todayIso = toTodayIso();

    const { data, error } = await supabase
      .from("global_events")
      .select("id,date,start_date,end_date");

    if (error) {
      return NextResponse.json({ ok: false, error: error.message || "Could not load events." }, { status: 500 });
    }

    const expiredIds = (Array.isArray(data) ? data : [])
      .filter((row) => {
        const endDate =
          String(row?.end_date || "").trim() ||
          String(row?.start_date || "").trim() ||
          String(row?.date || "").trim();
        return Boolean(endDate) && endDate < todayIso;
      })
      .map((row) => String(row?.id || "").trim())
      .filter(Boolean);

    if (expiredIds.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, todayIso });
    }

    const { error: deleteError } = await supabase
      .from("global_events")
      .delete()
      .in("id", expiredIds);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: deleteError.message || "Delete failed.", matched: expiredIds.length, todayIso },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      deleted: expiredIds.length,
      todayIso,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unexpected cron error." },
      { status: 500 }
    );
  }
}

