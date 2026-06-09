import { NextResponse } from "next/server";
import { getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";
import {
  isTrustedSameOriginRequest,
  sanitizeWebVitalPayload,
} from "@/lib/telemetry/validation";

export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_PER_IP = 180;
const MAX_BODY_BYTES = 8192;
const requestRateWindow = new Map();

function shouldCaptureSeoTelemetry() {
  return process.env.QA_SEO_TELEMETRY === "1";
}

function getClientIp(request) {
  const forwarded = String(request.headers.get("x-forwarded-for") || "");
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const current = requestRateWindow.get(ip);
  if (!current || now - current.startMs > RATE_WINDOW_MS) {
    requestRateWindow.set(ip, { startMs: now, count: 1 });
    return false;
  }
  current.count += 1;
  if (current.count > RATE_MAX_PER_IP) {
    return true;
  }
  return false;
}

export async function POST(request) {
  if (!shouldCaptureSeoTelemetry()) {
    return NextResponse.json({ ok: true, captured: false }, { status: 200 });
  }

  if (!isTrustedSameOriginRequest(request)) {
    return NextResponse.json({ ok: false, error: "untrusted-origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
  }

  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
    }
    const body = JSON.parse(rawBody);
    const sanitized = sanitizeWebVitalPayload(body, request.nextUrl.origin);
    if (!sanitized.ok) {
      return NextResponse.json({ ok: false, error: sanitized.error }, { status: 400 });
    }
    const payload = sanitized.payload;

    const supabase = getTelemetryServiceClient();
    const { data, error } = await supabase.rpc("qa_record_web_vital", {
      p_metric_id: payload.id,
      p_metric_name: payload.name,
      p_metric_value: payload.value,
      p_metric_rating: payload.rating,
      p_route: payload.route,
      p_href: payload.href,
      p_recorded_at: payload.ts,
      p_source: "web",
    });

    if (error) {
      console.error("[seo-web-vitals:error]", error.message || error);
      return NextResponse.json({ ok: false, error: "db-write-failed" }, { status: 500 });
    }

    console.info(
      "[seo-web-vitals]",
      JSON.stringify({
        name: payload.name,
        rating: payload.rating,
        route: payload.route,
        rowId: data || null,
      })
    );
    return NextResponse.json({ ok: true, captured: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    telemetryEnabled: shouldCaptureSeoTelemetry(),
    mode: "aggregate",
  });
}
