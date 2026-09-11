import { NextResponse } from "next/server";
import { syncGoogleSearchConsole } from "@/lib/googleSearchConsole/server";

function isAuthorized(request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  const authorization = String(request.headers.get("authorization") || "");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  return secret ? authorization === `Bearer ${secret}` || isVercelCron : isVercelCron;
}

export async function GET(request) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const result = await syncGoogleSearchConsole({ inspectLimit: 450 });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "sync-failed" }, { status: 500 });
  }
}
