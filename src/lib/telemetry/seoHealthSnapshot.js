import { cityCoreConfig } from "@/lib/cityCore";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

function scoreFromStatus(status) {
  if (status === "pass") return 100;
  if (status === "warn") return 70;
  return 30;
}

async function fetchLiveHtml(baseUrl, path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(new URL(path, baseUrl), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "text/html" },
    });
    if (!response.ok) {
      return { ok: false, status: response.status, html: "" };
    }
    return { ok: true, status: response.status, html: await response.text() };
  } catch {
    return { ok: false, status: 0, html: "" };
  } finally {
    clearTimeout(timeout);
  }
}

function summarizeStatus(checks = []) {
  const counts = checks.reduce(
    (acc, check) => {
      if (check.status === "pass") acc.pass += 1;
      else if (check.status === "warn") acc.warn += 1;
      else acc.fail += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 }
  );

  const statusSummary = counts.fail > 0 ? "fail" : counts.warn > 0 ? "warn" : "pass";
  return { statusSummary, ...counts };
}

function normalizeComparableUrl(value) {
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    return String(value || "").replace(/\/+$/, "");
  }
}

async function buildCanonicalCoverageCheck(baseUrl) {
  const paths = [
    "/",
    "/cities",
    "/events",
    "/now",
    "/gay-guide",
    "/queer-guide",
    "/hbtq-guide",
    "/berlin",
    "/topics",
    "/reports",
  ];

  const missing = [];
  for (const path of paths) {
    const result = await fetchLiveHtml(baseUrl, path);
    if (!result.ok) {
      missing.push(`${path}:http-${result.status || "unavailable"}`);
      continue;
    }
    const canonical = result.html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    )?.[1];
    if (!canonical) {
      missing.push(`${path}:missing-canonical`);
      continue;
    }
    const expected = new URL(path, baseUrl).toString();
    if (normalizeComparableUrl(canonical) !== normalizeComparableUrl(expected)) {
      missing.push(`${path}:canonical=${canonical}`);
    }
  }

  const unavailable = missing.some((entry) => entry.includes("http-unavailable"));
  const status = missing.length === 0 ? "pass" : unavailable ? "warn" : "fail";
  return {
    checkKey: "canonical_present_indexable_routes",
    status,
    score: scoreFromStatus(status),
    evidence: {
      checkedPaths: paths.length,
      missing,
    },
    recommendation:
      missing.length === 0
        ? "Canonical tags match the live indexable route URLs."
        : "Inspect live canonical output on the affected routes.",
  };
}

async function buildIndexableHeadingsCheck(baseUrl) {
  const [home, city] = await Promise.all([
    fetchLiveHtml(baseUrl, "/"),
    fetchLiveHtml(baseUrl, "/berlin"),
  ]);
  const homeHasH1 = home.ok && /<h1[\s>]/i.test(home.html);
  const cityHasH1 = city.ok && /<h1[\s>]/i.test(city.html);
  const status = homeHasH1 && cityHasH1
    ? "pass"
    : !home.ok || !city.ok
      ? "warn"
      : "fail";

  return {
    checkKey: "indexable_content_headings",
    status,
    score: scoreFromStatus(status),
    evidence: {
      homeHasH1,
      cityHasH1,
      homeStatus: home.status,
      cityStatus: city.status,
    },
    recommendation:
      status === "pass"
        ? "Live home and city HTML expose H1 heading anchors."
        : "Ensure live home and city HTML expose a stable H1 heading.",
  };
}

function buildRobotsCheck(baseUrl) {
  const config = robots();
  const allowRoot = Array.isArray(config?.rules)
    ? config.rules.some((rule) => String(rule?.allow || "") === "/")
    : false;
  const sitemapUrl = String(config?.sitemap || "");
  const hasSitemap = sitemapUrl.includes("/sitemap.xml");
  const status = allowRoot && hasSitemap ? "pass" : "fail";

  return {
    checkKey: "robots_sitemap_present",
    status,
    score: scoreFromStatus(status),
    evidence: {
      allowRoot,
      sitemapUrl,
      host: String(config?.host || ""),
      expectedBase: baseUrl,
    },
    recommendation:
      status === "pass"
        ? "Robots includes root allow and sitemap pointer."
        : "Robots must explicitly allow root and include canonical sitemap URL.",
  };
}

async function countLiveSitemapRoutes(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/xml,text/xml" },
    });
    if (!response.ok) return null;
    const xml = await response.text();
    const matches = xml.match(/<loc>/g);
    return Array.isArray(matches) ? matches.length : 0;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function buildSitemapCoverageCheck(baseUrl) {
  const generatedEntries = sitemap();
  const generatedCount = Array.isArray(generatedEntries) ? generatedEntries.length : 0;
  const liveCount = await countLiveSitemapRoutes(baseUrl);

  const status =
    generatedCount === 0
      ? "fail"
      : liveCount === null
        ? "warn"
        : liveCount === generatedCount
          ? "pass"
          : "fail";

  return {
    checkKey: "sitemap_route_coverage",
    status,
    score: scoreFromStatus(status),
    evidence: {
      generatedCount,
      liveCount,
      countsMatch: liveCount !== null && liveCount === generatedCount,
    },
    recommendation:
      status === "pass"
        ? "Live sitemap count matches the generated indexable route inventory."
        : liveCount === null
          ? "Live sitemap could not be reached; verify deployment access and retry."
          : "Live sitemap count differs from the generated route inventory; redeploy and inspect sitemap output.",
  };
}

function mapDailyVitals(rows = []) {
  const latestDay = rows.length > 0 ? String(rows[0].day || "") : "";
  const todayRows = rows.filter((row) => String(row.day || "") === latestDay);
  const byRoute = new Map();

  for (const row of todayRows) {
    const route = String(row.route || "/");
    if (!byRoute.has(route)) {
      byRoute.set(route, { route, lcp: null, inp: null, cls: null });
    }
    const current = byRoute.get(route);
    const metric = String(row.metric_name || "").toUpperCase();
    const value = row.p75 === null || row.p75 === undefined ? null : Number(row.p75);
    if (metric === "LCP") current.lcp = value;
    if (metric === "INP") current.inp = value;
    if (metric === "CLS") current.cls = value;
  }

  return { latestDay, rows: [...byRoute.values()] };
}

async function buildCwvThresholdCheck(supabase) {
  const { data, error } = await supabase
    .from("qa_seo_web_vitals_daily")
    .select("day,route,metric_name,p75")
    .order("day", { ascending: false })
    .limit(5000);

  if (error) {
    const status = String(error?.code || "").toLowerCase() === "42p01" ? "warn" : "fail";
    return {
      checkKey: "cwv_lcp_inp_cls_thresholds",
      status,
      score: scoreFromStatus(status),
      evidence: {
        error: error?.message || "unknown-error",
      },
      recommendation:
        status === "warn"
          ? "Deploy A.2 telemetry SQL to enable persistent CWV trend checks."
          : "Fix telemetry query errors before relying on CWV snapshot gates.",
    };
  }

  const mapped = mapDailyVitals(data || []);
  if (mapped.rows.length === 0) {
    return {
      checkKey: "cwv_lcp_inp_cls_thresholds",
      status: "warn",
      score: scoreFromStatus("warn"),
      evidence: { latestDay: mapped.latestDay, routesMeasured: 0 },
      recommendation: "Collect telemetry samples on key routes before evaluating CWV thresholds.",
    };
  }

  const latestDayMs = Date.parse(`${mapped.latestDay}T00:00:00.000Z`);
  const ageDays = Number.isNaN(latestDayMs)
    ? null
    : Math.floor((Date.now() - latestDayMs) / (24 * 60 * 60 * 1000));
  const failingRoutes = mapped.rows.filter(
    (row) =>
      (row.lcp !== null && row.lcp > 2500) ||
      (row.inp !== null && row.inp > 200) ||
      (row.cls !== null && row.cls > 0.1)
  );

  const ratio = failingRoutes.length / mapped.rows.length;
  const thresholdsStatus = ratio === 0 ? "pass" : ratio <= 0.25 ? "warn" : "fail";
  const status = ageDays === null || ageDays > 2
    ? thresholdsStatus === "fail"
      ? "fail"
      : "warn"
    : thresholdsStatus;

  return {
    checkKey: "cwv_lcp_inp_cls_thresholds",
    status,
    score: scoreFromStatus(status),
    evidence: {
      latestDay: mapped.latestDay,
      latestDayAgeDays: ageDays,
      routesMeasured: mapped.rows.length,
      failingRoutes: failingRoutes.slice(0, 12).map((row) => row.route),
      failingRatio: Number(ratio.toFixed(3)),
      thresholds: { lcpP75Ms: 2500, inpP75Ms: 200, clsP75: 0.1 },
    },
    recommendation:
      ageDays !== null && ageDays > 2
        ? "CWV data is stale; collect fresh production samples on priority routes."
        : status === "pass"
        ? "CWV p75 thresholds are healthy across measured routes."
        : "Prioritize route-level performance fixes for pages exceeding LCP/INP/CLS thresholds.",
  };
}

async function buildCrawlerActivityCheck(supabase) {
  const fromDay = new Date();
  fromDay.setUTCDate(fromDay.getUTCDate() - 7);
  const fromIso = fromDay.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("qa_seo_crawler_hits_daily")
    .select("day,crawler_key,hits")
    .gte("day", fromIso)
    .order("day", { ascending: false })
    .limit(2000);

  if (error) {
    const status = String(error?.code || "").toLowerCase() === "42p01" ? "warn" : "fail";
    return {
      checkKey: "crawler_activity_7d",
      status,
      score: scoreFromStatus(status),
      evidence: { error: error?.message || "unknown-error" },
      recommendation:
        status === "warn"
          ? "Deploy A.2 telemetry SQL to enable crawler activity trend checks."
          : "Fix crawler telemetry query errors before relying on crawler trend gates.",
    };
  }

  const rows = Array.isArray(data) ? data : [];
  const totalHits = rows.reduce((sum, row) => sum + Number(row.hits || 0), 0);
  const uniqueCrawlers = [...new Set(rows.map((row) => String(row.crawler_key || "")))].filter(Boolean);
  const status = totalHits > 0 ? "pass" : "warn";

  return {
    checkKey: "crawler_activity_7d",
    status,
    score: scoreFromStatus(status),
    evidence: {
      windowFrom: fromIso,
      totalHits,
      uniqueCrawlers,
    },
    recommendation:
      status === "pass"
        ? "Crawler user-agent telemetry shows recent activity."
        : "No crawler user-agent hits in the last 7 days; verify crawl access and discoverability.",
  };
}

export async function buildSeoHealthSnapshot({ supabase, baseUrl }) {
  const checks = [];
  checks.push(await buildSitemapCoverageCheck(baseUrl));
  checks.push(await buildCanonicalCoverageCheck(baseUrl));
  checks.push(buildRobotsCheck(baseUrl));
  checks.push(await buildIndexableHeadingsCheck(baseUrl));
  checks.push(await buildCwvThresholdCheck(supabase));
  checks.push(await buildCrawlerActivityCheck(supabase));

  const summary = summarizeStatus(checks);
  return {
    checks,
    summary,
    meta: {
      baseUrl,
      generatedAt: new Date().toISOString(),
      cityCount: Object.keys(cityCoreConfig).length,
    },
  };
}
