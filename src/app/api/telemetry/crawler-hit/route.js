import { NextResponse } from "next/server";
import { classifyCrawlerUserAgent } from "@/lib/telemetry/crawlerSignals";
import {
  getTelemetryServiceClient,
  hasValidTelemetryKey,
} from "@/lib/telemetry/serverSupabase";
import { sanitizeTelemetryPath } from "@/lib/telemetry/validation";

export const dynamic = "force-dynamic";

function shouldCaptureSeoTelemetry() {
  return process.env.QA_SEO_TELEMETRY === "1";
}

export async function POST(request) {
  if (!shouldCaptureSeoTelemetry()) {
    return NextResponse.json({ ok: true, captured: false }, { status: 200 });
  }

  if (!hasValidTelemetryKey(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userAgent = String(body?.userAgent || "");
    const classifier = classifyCrawlerUserAgent(userAgent);
    if (!classifier) {
      return NextResponse.json({ ok: true, captured: false, reason: "not-crawler" }, { status: 200 });
    }

    const path = sanitizeTelemetryPath(body?.path || "/");
    const seenAt = new Date().toISOString();

    const supabase = getTelemetryServiceClient();
    const { error } = await supabase.rpc("qa_record_crawler_hit", {
      p_crawler_key: classifier.key,
      p_path: path,
      p_seen_at: seenAt,
    });

    if (error) {
      console.error("[seo-crawler-hit:error]", error.message || error);
      return NextResponse.json({ ok: false, error: "db-write-failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, captured: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
}
