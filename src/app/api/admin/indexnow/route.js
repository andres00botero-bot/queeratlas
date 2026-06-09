import { NextResponse } from "next/server";
import {
  buildIndexNowPayload,
  filterIndexNowUrls,
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
} from "@/lib/seo/indexNow";
import {
  getTelemetryServiceClient,
  hasAuthorizedSeoAdminRequest,
} from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

const DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const BODY_LIMIT_BYTES = 64 * 1024;
const memorySubmissions = new Map();

function isMissingTableError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function sanitizeSource(value = "") {
  return String(value || "admin")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 64) || "admin";
}

function pruneMemorySubmissions(now = Date.now()) {
  for (const [url, timestamp] of memorySubmissions.entries()) {
    if (now - timestamp >= DEDUPE_WINDOW_MS) memorySubmissions.delete(url);
  }
}

async function findRecentlySubmittedUrls(supabase, urls, cutoffIso) {
  const { data, error } = await supabase
    .from("qa_indexnow_submissions")
    .select("url")
    .in("url", urls)
    .eq("accepted", true)
    .gte("submitted_at", cutoffIso);

  if (error) return { urls: new Set(), error };
  return { urls: new Set((data || []).map((row) => row.url)), error: null };
}

async function logSubmissions(supabase, urls, {
  source,
  statusCode,
  accepted,
  responseExcerpt,
}) {
  if (urls.length === 0) return null;
  const { error } = await supabase.from("qa_indexnow_submissions").insert(
    urls.map((url) => ({
      url,
      source,
      status_code: statusCode,
      accepted,
      response_excerpt: responseExcerpt,
    }))
  );
  return error || null;
}

async function readRecentSubmissions(supabase) {
  const { data, error } = await supabase
    .from("qa_indexnow_submissions")
    .select("url,source,status_code,accepted,response_excerpt,submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(50);
  return { data: Array.isArray(data) ? data : [], error };
}

export async function GET(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const response = {
    ok: true,
    configured: true,
    keyLocation: INDEXNOW_KEY_LOCATION,
    recent: [],
    loggingReady: false,
  };

  try {
    const result = await readRecentSubmissions(getTelemetryServiceClient());
    if (!result.error) {
      response.recent = result.data;
      response.loggingReady = true;
    } else if (!isMissingTableError(result.error)) {
      return NextResponse.json(
        { ok: false, error: result.error.message || "query-failed" },
        { status: 500 }
      );
    }
  } catch {
    // Configuration status is still useful before the optional log table is deployed.
  }

  return NextResponse.json(response);
}

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > BODY_LIMIT_BYTES) {
    return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const { accepted: allowedUrls, rejected } = filterIndexNowUrls(body?.urls, 100);
  if (allowedUrls.length === 0) {
    return NextResponse.json(
      { ok: false, error: "no-allowed-urls", rejected },
      { status: 400 }
    );
  }

  const now = Date.now();
  const cutoffIso = new Date(now - DEDUPE_WINDOW_MS).toISOString();
  pruneMemorySubmissions(now);
  const recentUrls = new Set(
    allowedUrls.filter((url) => {
      const timestamp = memorySubmissions.get(url);
      return timestamp && now - timestamp < DEDUPE_WINDOW_MS;
    })
  );

  let supabase = null;
  let loggingReady = false;
  try {
    supabase = getTelemetryServiceClient();
    const persisted = await findRecentlySubmittedUrls(supabase, allowedUrls, cutoffIso);
    if (!persisted.error) {
      loggingReady = true;
      persisted.urls.forEach((url) => recentUrls.add(url));
    }
  } catch {
    supabase = null;
  }

  const urlsToSubmit = allowedUrls.filter((url) => !recentUrls.has(url));
  if (urlsToSubmit.length === 0) {
    return NextResponse.json({
      ok: true,
      submitted: [],
      skippedRecent: [...recentUrls],
      rejected,
      loggingReady,
    });
  }

  const payload = buildIndexNowPayload(INDEXNOW_KEY, urlsToSubmit);
  const endpoint = String(process.env.INDEXNOW_ENDPOINT || INDEXNOW_ENDPOINT).trim();
  const source = sanitizeSource(body?.source);
  let indexNowResponse;
  let responseText = "";

  try {
    indexNowResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    responseText = (await indexNowResponse.text()).slice(0, 500);
  } catch (error) {
    if (supabase) {
      await logSubmissions(supabase, urlsToSubmit, {
        source,
        statusCode: null,
        accepted: false,
        responseExcerpt: String(error?.message || "request-failed").slice(0, 500),
      });
    }
    return NextResponse.json(
      { ok: false, error: "indexnow-request-failed", submitted: [] },
      { status: 502 }
    );
  }

  const accepted = indexNowResponse.status === 200 || indexNowResponse.status === 202;
  if (accepted) {
    urlsToSubmit.forEach((url) => memorySubmissions.set(url, now));
  }

  if (supabase) {
    const logError = await logSubmissions(supabase, urlsToSubmit, {
      source,
      statusCode: indexNowResponse.status,
      accepted,
      responseExcerpt: responseText,
    });
    if (!logError) loggingReady = true;
  }

  return NextResponse.json(
    {
      ok: accepted,
      submitted: accepted ? urlsToSubmit : [],
      skippedRecent: [...recentUrls],
      rejected,
      statusCode: indexNowResponse.status,
      loggingReady,
    },
    { status: accepted ? 200 : 502 }
  );
}
