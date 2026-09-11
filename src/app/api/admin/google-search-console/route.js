import { NextResponse } from "next/server";
import { getGoogleSearchConsoleStatus, syncGoogleSearchConsole } from "@/lib/googleSearchConsole/server";
import { hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, status: await getGoogleSearchConsoleStatus() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "status-failed" }, { status: 500 });
  }
}
export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const result = await syncGoogleSearchConsole({ inspectLimit: body?.inspectLimit || 0 });
    return NextResponse.json({ ok: true, result, status: await getGoogleSearchConsoleStatus() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "sync-failed" }, { status: 500 });
  }
}
