import { NextResponse } from "next/server";

function isAuthorized(request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  const authorization = String(request.headers.get("authorization") || "");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  return secret ? authorization === `Bearer ${secret}` || isVercelCron : isVercelCron;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const reminderSecret = String(process.env.CALENDAR_REMINDER_CRON_SECRET || "").trim();
  if (!supabaseUrl || !reminderSecret) {
    return NextResponse.json({ ok: false, error: "Reminder environment is incomplete" }, { status: 500 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-calendar-reminders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${reminderSecret}`, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "Reminder function unavailable" }, { status: 502 });
  }
}
