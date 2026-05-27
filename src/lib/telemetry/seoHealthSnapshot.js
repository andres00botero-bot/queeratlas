import { existsSync, readFileSync } from "node:fs";
import { cityCoreConfig } from "@/lib/cityCore";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

function scoreFromStatus(status) {
  if (status === "pass") return 100;
  if (status === "warn") return 70;
  return 30;
}

function safeRead(relativePath) {
  if (!existsSync(relativePath)) return null;
  try {
    return readFileSync(relativePath, "utf8");
  } catch {
    return null;
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

function buildCanonicalCoverageCheck() {
  const files = [
    "src/app/layout.js",
    "src/app/cities/layout.js",
    "src/app/events/layout.js",
    "src/app/now/layout.js",
    "src/app/search/layout.js",
    "src/app/gay-guide/page.js",
    "src/app/queer-guide/page.js",
    "src/app/hbtq-guide/page.js",
    "src/app/[city]/layout.js",
  ];

  const missing = [];
  for (const file of files) {
    const source = safeRead(file);
    if (!source) {
      missing.push(`${file}:missing-file`);
      continue;
    }
    const hasCanonical = /alternates:\s*{[\s\S]*canonical/.test(source);
    if (!hasCanonical) {
      missing.push(`${file}:missing-canonical`);
    }
  }

  const status = missing.length === 0 ? "pass" : "fail";
  return {
    checkKey: "canonical_present_indexable_routes",
    status,
    score: scoreFromStatus(status),
    evidence: {
      checkedFiles: files.length,
      missing,
    },
    recommendation:
      missing.length === 0
        ? "Canonical definitions exist across indexable route metadata."
        : "Add missing canonical metadata on affected route layout/page files.",
  };
}

function buildIndexableHeadingsCheck() {
  const homeClient = safeRead("src/components/home/HomePageClient.js");
  const cityHero = safeRead("src/components/city/CityHeroCard.js");
  const homeHasH1 = Boolean(homeClient && /<h1[\s>]/i.test(homeClient));
  const cityHasH1 = Boolean(cityHero && /<h1[\s>]/i.test(cityHero));
  const status = homeHasH1 && cityHasH1 ? "pass" : "warn";

  return {
    checkKey: "indexable_content_headings",
    status,
    score: scoreFromStatus(status),
    evidence: {
      homeHasH1,
      cityHasH1,
    },
    recommendation:
      status === "pass"
        ? "Primary indexable routes expose H1 heading anchors."
        : "Ensure both home and city entry content expose a stable H1 heading.",
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
  const staticExpected = 10; // from src/app/sitemap.js staticRoutes
  const cityExpected = Object.keys(cityCoreConfig).length;
  const expectedTotal = staticExpected + cityExpected;
  const generatedCount = Array.isArray(generatedEntries) ? generatedEntries.length : 0;
  const liveCount = await countLiveSitemapRoutes(baseUrl);

  let status = "pass";
  if (generatedCount < expectedTotal) {
    status = "fail";
  } else if (liveCount !== null && liveCount < expectedTotal) {
    status = "warn";
  }

  return {
    checkKey: "sitemap_route_coverage",
    status,
    score: scoreFromStatus(status),
    evidence: {
      expectedTotal,
      generatedCount,
      liveCount,
      staticExpected,
      cityExpected,
    },
    recommendation:
      status === "pass"
        ? "Sitemap coverage aligns with indexed static + city route inventory."
        : "Rebuild sitemap coverage for all indexed static routes and city slugs.",
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

  const failingRoutes = mapped.rows.filter(
    (row) =>
      (row.lcp !== null && row.lcp > 2500) ||
      (row.inp !== null && row.inp > 200) ||
      (row.cls !== null && row.cls > 0.1)
  );

  const ratio = failingRoutes.length / mapped.rows.length;
  const status = ratio === 0 ? "pass" : ratio <= 0.25 ? "warn" : "fail";

  return {
    checkKey: "cwv_lcp_inp_cls_thresholds",
    status,
    score: scoreFromStatus(status),
    evidence: {
      latestDay: mapped.latestDay,
      routesMeasured: mapped.rows.length,
      failingRoutes: failingRoutes.slice(0, 12).map((row) => row.route),
      failingRatio: Number(ratio.toFixed(3)),
      thresholds: { lcpP75Ms: 2500, inpP75Ms: 200, clsP75: 0.1 },
    },
    recommendation:
      status === "pass"
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
        ? "Crawler telemetry shows recent bot activity."
        : "No crawler hits in the last 7 days; verify crawl access and discoverability.",
  };
}

export async function buildSeoHealthSnapshot({ supabase, baseUrl }) {
  const checks = [];
  checks.push(await buildSitemapCoverageCheck(baseUrl));
  checks.push(buildCanonicalCoverageCheck());
  checks.push(buildRobotsCheck(baseUrl));
  checks.push(buildIndexableHeadingsCheck());
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
