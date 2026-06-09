import { NextResponse } from "next/server";
import { buildSeoHealthSnapshot } from "@/lib/telemetry/seoHealthSnapshot";
import {
  getTelemetryServiceClient,
  hasAuthorizedSeoAdminRequest,
} from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

function getBaseUrl(request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
}

async function fetchLatestSnapshot(supabase) {
  const { data: snapshots, error } = await supabase
    .from("qa_seo_health_snapshots")
    .select("id,status_summary,checks_passed,checks_warn,checks_failed,snapshot_meta,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { error, latest: null, history: [] };
  }

  const history = Array.isArray(snapshots) ? snapshots : [];
  const latest = history[0] || null;
  if (!latest) {
    return { error: null, latest: null, history };
  }

  const { data: checks, error: checksError } = await supabase
    .from("qa_seo_health_snapshot_checks")
    .select("check_key,status,score,evidence,recommendation,created_at")
    .eq("snapshot_id", latest.id)
    .order("check_key", { ascending: true });

  if (checksError) {
    return { error: checksError, latest, history };
  }

  return {
    error: null,
    latest: {
      ...latest,
      checks: Array.isArray(checks) ? checks : [],
    },
    history,
  };
}

async function persistSnapshot(supabase, snapshot) {
  const { checks = [], summary = {}, meta = {} } = snapshot;
  const { data: inserted, error: insertError } = await supabase
    .from("qa_seo_health_snapshots")
    .insert({
      status_summary: summary.statusSummary || "warn",
      checks_passed: Number(summary.pass || 0),
      checks_warn: Number(summary.warn || 0),
      checks_failed: Number(summary.fail || 0),
      snapshot_meta: meta,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError, snapshotId: null };
  const snapshotId = inserted?.id || null;
  if (!snapshotId) return { error: new Error("missing-snapshot-id"), snapshotId: null };

  const payload = checks.map((check) => ({
    snapshot_id: snapshotId,
    check_key: String(check.checkKey || "").slice(0, 128),
    status: String(check.status || "warn"),
    score: Number(check.score || 0),
    evidence: check.evidence || {},
    recommendation: String(check.recommendation || "").slice(0, 2000),
  }));

  if (payload.length > 0) {
    const { error: checksError } = await supabase
      .from("qa_seo_health_snapshot_checks")
      .insert(payload);
    if (checksError) {
      await supabase.from("qa_seo_health_snapshots").delete().eq("id", snapshotId);
      return { error: checksError, snapshotId: null };
    }
  }

  return { error: null, snapshotId };
}

export async function GET(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getTelemetryServiceClient();
    const result = await fetchLatestSnapshot(supabase);
    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error.message || "query-failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, latest: result.latest, history: result.history });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "unexpected-error" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getTelemetryServiceClient();
    const baseUrl = getBaseUrl(request);
    const snapshot = await buildSeoHealthSnapshot({ supabase, baseUrl });
    const persisted = await persistSnapshot(supabase, snapshot);
    if (persisted.error) {
      return NextResponse.json({ ok: false, error: persisted.error.message || "persist-failed" }, { status: 500 });
    }

    const latest = await fetchLatestSnapshot(supabase);
    if (latest.error) {
      return NextResponse.json({
        ok: true,
        snapshotId: persisted.snapshotId,
        snapshot,
        warning: latest.error.message || "latest-fetch-failed",
      });
    }

    return NextResponse.json({
      ok: true,
      snapshotId: persisted.snapshotId,
      latest: latest.latest,
      history: latest.history,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "unexpected-error" }, { status: 500 });
  }
}
