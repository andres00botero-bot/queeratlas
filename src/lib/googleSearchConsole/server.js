import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";
import { getEventSitemapEntries, getPageSitemapEntries, getServiceSitemapEntries, getVenueSitemapEntries } from "@/lib/seo/sitemapEntries";
import { mapSearchAnalyticsRows, summarizeSearchPerformance } from "@/lib/googleSearchConsole/shared";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const WEBMASTERS_API = "https://www.googleapis.com/webmasters/v3";
const URL_INSPECTION_API = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
let cachedAccessToken = null;

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getGscSiteUrl() {
  return String(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "sc-domain:queeratlas.app").trim();
}

export function getGscRedirectUri(request) {
  const origin = request.nextUrl.origin;
  if (["localhost", "127.0.0.1"].includes(request.nextUrl.hostname)) {
    return String(process.env.GOOGLE_SEARCH_CONSOLE_REDIRECT_URI || `${origin}/api/admin/google-search-console/callback`).trim();
  }
  return String(
    process.env.GOOGLE_SEARCH_CONSOLE_PRODUCTION_REDIRECT_URI ||
      "https://www.queeratlas.app/api/admin/google-search-console/callback"
  ).trim();
}

function tokenKey() {
  const secret = requiredEnv("GOOGLE_SEARCH_CONSOLE_TOKEN_ENCRYPTION_KEY");
  return createHash("sha256").update(`queeratlas:gsc:v1:${secret}`).digest();
}

export function encryptRefreshToken(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptRefreshToken(value) {
  const [version, ivValue, tagValue, ciphertextValue] = String(value || "").split(".");
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) throw new Error("Invalid stored Google token");
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createOauthState() {
  return randomBytes(32).toString("base64url");
}

export function safeStateEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

export function buildGoogleAuthorizationUrl({ redirectUri, state }) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", requiredEnv("GOOGLE_SEARCH_CONSOLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", READONLY_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

async function googleJson(url, options = {}) {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error_description || payload?.error?.message || payload?.error || `Google API returned ${response.status}`;
    throw new Error(String(message));
  }
  return payload;
}

export async function exchangeAuthorizationCode({ code, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: requiredEnv("GOOGLE_SEARCH_CONSOLE_CLIENT_ID"),
    client_secret: requiredEnv("GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET"),
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  return googleJson(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: requiredEnv("GOOGLE_SEARCH_CONSOLE_CLIENT_ID"),
    client_secret: requiredEnv("GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET"),
    grant_type: "refresh_token",
  });
  return googleJson(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

async function getAccessToken(connection) {
  if (
    cachedAccessToken?.siteUrl === connection.site_url &&
    cachedAccessToken?.value &&
    Number(cachedAccessToken.expiresAt || 0) > Date.now() + 60_000
  ) {
    return cachedAccessToken.value;
  }
  const refreshToken = decryptRefreshToken(connection.refresh_token_ciphertext);
  const token = await refreshAccessToken(refreshToken);
  cachedAccessToken = {
    siteUrl: connection.site_url,
    value: String(token.access_token || ""),
    expiresAt: Date.now() + Math.max(60, Number(token.expires_in || 3600)) * 1000,
  };
  if (!cachedAccessToken.value) throw new Error("Google did not return an access token");
  return cachedAccessToken.value;
}

export async function saveGoogleConnection({ tokenPayload, connectedBy = null }) {
  const refreshToken = String(tokenPayload?.refresh_token || "").trim();
  if (!refreshToken) throw new Error("Google did not return a refresh token. Reconnect and approve access again.");
  const supabase = getTelemetryServiceClient();
  const siteUrl = getGscSiteUrl();
  const { error } = await supabase.from("qa_gsc_connections").upsert({
    site_url: siteUrl,
    refresh_token_ciphertext: encryptRefreshToken(refreshToken),
    granted_scope: String(tokenPayload?.scope || READONLY_SCOPE),
    token_type: String(tokenPayload?.token_type || "Bearer"),
    connected_by: connectedBy,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_error: "",
  }, { onConflict: "site_url" });
  if (error) throw new Error(error.message || "Could not store Google connection");
}

export async function loadGoogleConnection() {
  const supabase = getTelemetryServiceClient();
  const { data, error } = await supabase
    .from("qa_gsc_connections")
    .select("site_url,refresh_token_ciphertext,granted_scope,connected_at,updated_at,last_synced_at,last_error,last_summary")
    .eq("site_url", getGscSiteUrl())
    .maybeSingle();
  if (error) throw new Error(error.message || "Could not load Google connection");
  return data || null;
}

async function authorizedGoogleRequest(connection, url, options = {}) {
  const accessToken = await getAccessToken(connection);
  return googleJson(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function searchAnalytics(connection, body) {
  const site = encodeURIComponent(connection.site_url);
  return authorizedGoogleRequest(connection, `${WEBMASTERS_API}/sites/${site}/searchAnalytics/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function replacePerformanceRows(supabase, { siteUrl, startDate, endDate, pageRows, queryPageRows }) {
  const { error: deleteError } = await supabase
    .from("qa_gsc_search_performance")
    .delete()
    .eq("site_url", siteUrl)
    .eq("period_start", startDate)
    .eq("period_end", endDate);
  if (deleteError) throw new Error(deleteError.message || "Could not replace Search Console performance rows");

  const rows = [
    ...pageRows.map((row) => ({ ...row, query: "", source_type: "page" })),
    ...queryPageRows.map((row) => ({ ...row, source_type: "query_page" })),
  ].map((row) => ({
    site_url: siteUrl,
    period_start: startDate,
    period_end: endDate,
    source_type: row.source_type,
    query: String(row.query || ""),
    page: String(row.page || ""),
    country: String(row.country || ""),
    device: String(row.device || ""),
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
    synced_at: new Date().toISOString(),
  }));

  for (let index = 0; index < rows.length; index += 500) {
    const { error } = await supabase.from("qa_gsc_search_performance").insert(rows.slice(index, index + 500));
    if (error) throw new Error(error.message || "Could not store Search Console performance rows");
  }
}

async function syncSitemaps(supabase, connection) {
  const site = encodeURIComponent(connection.site_url);
  const payload = await authorizedGoogleRequest(connection, `${WEBMASTERS_API}/sites/${site}/sitemaps`);
  const rows = (Array.isArray(payload?.sitemap) ? payload.sitemap : []).map((item) => ({
    site_url: connection.site_url,
    path: String(item.path || ""),
    last_submitted: item.lastSubmitted || null,
    last_downloaded: item.lastDownloaded || null,
    is_pending: Boolean(item.isPending),
    is_sitemaps_index: Boolean(item.isSitemapsIndex),
    warnings: Number(item.warnings || 0),
    errors: Number(item.errors || 0),
    contents: Array.isArray(item.contents) ? item.contents : [],
    synced_at: new Date().toISOString(),
  })).filter((row) => row.path);
  if (rows.length > 0) {
    const { error } = await supabase.from("qa_gsc_sitemaps").upsert(rows, { onConflict: "site_url,path" });
    if (error) throw new Error(error.message || "Could not store Google sitemap status");
  }
  return rows;
}

async function sitemapUrls() {
  const groups = await Promise.all([
    getPageSitemapEntries(),
    getVenueSitemapEntries(),
    getEventSitemapEntries(),
    getServiceSitemapEntries(),
  ]);
  return [...new Set(groups.flat().map((entry) => String(entry?.url || "")).filter(Boolean))];
}

async function inspectOne(connection, url) {
  const payload = await authorizedGoogleRequest(connection, URL_INSPECTION_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: connection.site_url, languageCode: "en-US" }),
  });
  const status = payload?.inspectionResult?.indexStatusResult || {};
  return {
    url,
    site_url: connection.site_url,
    verdict: String(status.verdict || ""),
    coverage_state: String(status.coverageState || ""),
    robots_txt_state: String(status.robotsTxtState || ""),
    indexing_state: String(status.indexingState || ""),
    page_fetch_state: String(status.pageFetchState || ""),
    google_canonical: String(status.googleCanonical || ""),
    user_canonical: String(status.userCanonical || ""),
    crawled_as: String(status.crawledAs || ""),
    last_crawl_time: status.lastCrawlTime || null,
    referring_urls: Array.isArray(status.referringUrls) ? status.referringUrls : [],
    sitemaps: Array.isArray(status.sitemap) ? status.sitemap : [],
    inspected_at: new Date().toISOString(),
  };
}

async function inspectNextUrls(supabase, connection, requestedLimit) {
  const limit = Math.max(0, Math.min(500, Number(requestedLimit || 0)));
  if (!limit) return { inspected: 0, failed: 0 };
  const urls = await sitemapUrls();
  const { data: existing, error } = await supabase
    .from("qa_gsc_url_inspections")
    .select("url,inspected_at")
    .eq("site_url", connection.site_url)
    .order("inspected_at", { ascending: true })
    .limit(5000);
  if (error) throw new Error(error.message || "Could not load URL inspection queue");
  const byUrl = new Map((existing || []).map((row) => [row.url, row.inspected_at]));
  const targets = [...urls]
    .sort((a, b) => String(byUrl.get(a) || "").localeCompare(String(byUrl.get(b) || "")))
    .slice(0, limit);
  let inspected = 0;
  let failed = 0;
  for (let index = 0; index < targets.length; index += 5) {
    const results = await Promise.allSettled(targets.slice(index, index + 5).map((url) => inspectOne(connection, url)));
    const rows = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    failed += results.length - rows.length;
    if (rows.length > 0) {
      const { error: upsertError } = await supabase.from("qa_gsc_url_inspections").upsert(rows, { onConflict: "url" });
      if (upsertError) throw new Error(upsertError.message || "Could not store URL inspections");
      inspected += rows.length;
    }
  }
  return { inspected, failed, inventory: urls.length };
}

export async function syncGoogleSearchConsole({ inspectLimit = 0 } = {}) {
  const connection = await loadGoogleConnection();
  if (!connection) return { skipped: true, reason: "not-connected" };
  const supabase = getTelemetryServiceClient();
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);
  try {
    const [totalPayload, pagePayload, queryPagePayload, sitemapRows] = await Promise.all([
      searchAnalytics(connection, { startDate, endDate, type: "web", dataState: "final" }),
      searchAnalytics(connection, { startDate, endDate, dimensions: ["page"], type: "web", dataState: "final", rowLimit: 25000 }),
      searchAnalytics(connection, { startDate, endDate, dimensions: ["query", "page"], type: "web", dataState: "final", rowLimit: 25000 }),
      syncSitemaps(supabase, connection),
    ]);
    const pageRows = mapSearchAnalyticsRows(pagePayload?.rows || [], ["page"]);
    const queryPageRows = mapSearchAnalyticsRows(queryPagePayload?.rows || [], ["query", "page"]);
    const summary = {
      ...summarizeSearchPerformance({ totalRow: totalPayload?.rows?.[0] || null, pageRows, queryPageRows }),
      period: { startDate, endDate },
      sitemaps: sitemapRows,
    };
    await replacePerformanceRows(supabase, { siteUrl: connection.site_url, startDate, endDate, pageRows, queryPageRows });
    const inspections = await inspectNextUrls(supabase, connection, inspectLimit);
    const syncedAt = new Date().toISOString();
    const { error } = await supabase.from("qa_gsc_connections").update({
      last_synced_at: syncedAt,
      updated_at: syncedAt,
      last_error: "",
      last_summary: { ...summary, inspections },
    }).eq("site_url", connection.site_url);
    if (error) throw new Error(error.message || "Could not update Google sync status");
    return { skipped: false, syncedAt, summary, inspections };
  } catch (error) {
    await supabase.from("qa_gsc_connections").update({
      last_error: String(error?.message || "Google Search Console sync failed").slice(0, 2000),
      updated_at: new Date().toISOString(),
    }).eq("site_url", connection.site_url);
    throw error;
  }
}

export async function getGoogleSearchConsoleStatus() {
  const connection = await loadGoogleConnection();
  if (!connection) return { connected: false, siteUrl: getGscSiteUrl() };
  const supabase = getTelemetryServiceClient();
  const [{ count: inspected }, { count: indexed }, { data: coverageRows }, { data: sitemapRows }] = await Promise.all([
    supabase.from("qa_gsc_url_inspections").select("url", { count: "exact", head: true }).eq("site_url", connection.site_url),
    supabase.from("qa_gsc_url_inspections").select("url", { count: "exact", head: true }).eq("site_url", connection.site_url).eq("verdict", "PASS"),
    supabase.from("qa_gsc_url_inspections").select("coverage_state").eq("site_url", connection.site_url).limit(5000),
    supabase.from("qa_gsc_sitemaps").select("path,last_submitted,last_downloaded,is_pending,warnings,errors,contents,synced_at").eq("site_url", connection.site_url).order("path"),
  ]);
  const coverage = (coverageRows || []).reduce((result, row) => {
    const key = String(row.coverage_state || "Unknown");
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
  return {
    connected: true,
    siteUrl: connection.site_url,
    scope: connection.granted_scope,
    connectedAt: connection.connected_at,
    lastSyncedAt: connection.last_synced_at,
    lastError: connection.last_error,
    summary: connection.last_summary || {},
    inspections: { inspected: Number(inspected || 0), indexed: Number(indexed || 0), coverage },
    sitemaps: sitemapRows || [],
  };
}
