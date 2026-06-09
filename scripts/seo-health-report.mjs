import { createClient } from "@supabase/supabase-js";

const DEFAULT_MAX_SNAPSHOT_AGE_HOURS = 48;

function parseArgs(argv) {
  const args = {
    maxSnapshotAgeHours: DEFAULT_MAX_SNAPSHOT_AGE_HOURS,
    strict: false,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--max-snapshot-age-hours" && argv[i + 1]) {
      args.maxSnapshotAgeHours = Number(argv[i + 1]) || DEFAULT_MAX_SNAPSHOT_AGE_HOURS;
      i += 1;
    } else if (part === "--strict") {
      args.strict = true;
    } else if (part === "--json") {
      args.json = true;
    }
  }

  return args;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return { url, key };
}

function getSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hoursSince(isoDate) {
  const ts = Date.parse(String(isoDate || ""));
  if (Number.isNaN(ts)) return null;
  return (Date.now() - ts) / (1000 * 60 * 60);
}

function daysSinceIsoDate(isoDate) {
  const ts = Date.parse(`${String(isoDate || "")}T00:00:00.000Z`);
  if (Number.isNaN(ts)) return null;
  return Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
}

function statusPriority(status) {
  if (status === "fail") return 3;
  if (status === "warn") return 2;
  return 1;
}

function summarizeChecks(checks = []) {
  const counters = { pass: 0, warn: 0, fail: 0 };
  for (const check of checks) {
    const status = String(check.status || "warn");
    if (status === "pass") counters.pass += 1;
    else if (status === "fail") counters.fail += 1;
    else counters.warn += 1;
  }
  return counters;
}

async function fetchLatestSnapshot(client) {
  const { data, error } = await client
    .from("qa_seo_health_snapshots")
    .select("id,status_summary,checks_passed,checks_warn,checks_failed,snapshot_meta,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`snapshot query failed: ${error.message}`);
  if (!data) return { latest: null, checks: [] };

  const { data: checksData, error: checksError } = await client
    .from("qa_seo_health_snapshot_checks")
    .select("check_key,status,score,evidence,recommendation,created_at")
    .eq("snapshot_id", data.id)
    .order("check_key", { ascending: true });

  if (checksError) throw new Error(`snapshot checks query failed: ${checksError.message}`);
  return { latest: data, checks: Array.isArray(checksData) ? checksData : [] };
}

async function fetchCwvSummary(client) {
  const { data, error } = await client
    .from("qa_seo_web_vitals_daily")
    .select("day,route,metric_name,p75")
    .order("day", { ascending: false })
    .limit(5000);

  if (error) return { ok: false, reason: error.message };
  const rows = Array.isArray(data) ? data : [];
  const latestDay = rows.length ? String(rows[0].day || "") : "";
  const dayRows = rows.filter((row) => String(row.day || "") === latestDay);
  const byRoute = new Map();

  for (const row of dayRows) {
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

  const routeRows = [...byRoute.values()];
  const failingRoutes = routeRows.filter(
    (row) =>
      (row.lcp !== null && row.lcp > 2500) ||
      (row.inp !== null && row.inp > 200) ||
      (row.cls !== null && row.cls > 0.1)
  );

  return {
    ok: true,
    latestDay,
    latestDayAgeDays: daysSinceIsoDate(latestDay),
    routesMeasured: routeRows.length,
    failingRoutesCount: failingRoutes.length,
    failingRoutes: failingRoutes.slice(0, 10).map((row) => row.route),
  };
}

async function fetchCrawlerSummary(client) {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 7);
  const fromIso = from.toISOString().slice(0, 10);

  const { data, error } = await client
    .from("qa_seo_crawler_hits_daily")
    .select("day,crawler_key,path,hits")
    .gte("day", fromIso)
    .order("day", { ascending: false })
    .limit(5000);

  if (error) return { ok: false, reason: error.message, windowFrom: fromIso };
  const rows = Array.isArray(data) ? data : [];
  const totalHits = rows.reduce((sum, row) => sum + Number(row.hits || 0), 0);
  const uniqueCrawlers = new Set(rows.map((row) => String(row.crawler_key || "")).filter(Boolean)).size;
  const uniquePaths = new Set(rows.map((row) => String(row.path || "")).filter(Boolean)).size;

  return {
    ok: true,
    windowFrom: fromIso,
    totalHits,
    uniqueCrawlers,
    uniquePaths,
  };
}

function deriveOverallStatus({ latest, checks, cwv, crawler, maxSnapshotAgeHours }) {
  let status = "pass";

  if (!latest) return "warn";

  const ageHours = hoursSince(latest.created_at);
  if (ageHours !== null && ageHours > maxSnapshotAgeHours) {
    status = "warn";
  }

  for (const check of checks) {
    const checkStatus = String(check.status || "warn");
    if (statusPriority(checkStatus) > statusPriority(status)) {
      status = checkStatus;
    }
  }

  if (cwv.ok && cwv.routesMeasured > 0 && cwv.failingRoutesCount > 0 && status !== "fail") {
    status = "warn";
  }

  if (crawler.ok && crawler.totalHits === 0 && status === "pass") {
    status = "warn";
  }

  return status;
}

function printTextReport(report) {
  console.log("SEO Health Report");
  console.log("=================");
  console.log(`overall_status: ${report.overallStatus}`);
  console.log(`generated_at: ${new Date().toISOString()}`);
  console.log("");

  if (!report.snapshot.latest) {
    console.log("snapshot: missing");
  } else {
    const latest = report.snapshot.latest;
    const ageHours = hoursSince(latest.created_at);
    console.log(`snapshot_id: ${latest.id}`);
    console.log(`snapshot_created_at: ${latest.created_at}`);
    console.log(`snapshot_age_hours: ${ageHours === null ? "n/a" : ageHours.toFixed(2)}`);
    console.log(`snapshot_status_summary: ${latest.status_summary}`);
    console.log(
      `snapshot_counts: pass=${latest.checks_passed} warn=${latest.checks_warn} fail=${latest.checks_failed}`
    );
  }

  const checksSummary = summarizeChecks(report.snapshot.checks);
  console.log("");
  console.log(`checks_summary: pass=${checksSummary.pass} warn=${checksSummary.warn} fail=${checksSummary.fail}`);

  const topSignals = [...report.snapshot.checks]
    .sort((a, b) => {
      const delta = statusPriority(String(b.status || "warn")) - statusPriority(String(a.status || "warn"));
      if (delta !== 0) return delta;
      return String(a.check_key || "").localeCompare(String(b.check_key || ""));
    })
    .slice(0, 8);

  if (topSignals.length > 0) {
    console.log("top_checks:");
    for (const item of topSignals) {
      const score = Number(item.score || 0);
      console.log(`- ${item.check_key}: ${item.status} (score=${score})`);
    }
  }

  console.log("");
  if (report.cwv.ok) {
    console.log(
      `cwv: day=${report.cwv.latestDay || "n/a"} routes=${report.cwv.routesMeasured} failing_routes=${report.cwv.failingRoutesCount}`
    );
    if (report.cwv.failingRoutes.length > 0) {
      console.log(`cwv_failing_route_examples: ${report.cwv.failingRoutes.join(", ")}`);
    }
  } else {
    console.log(`cwv: unavailable (${report.cwv.reason})`);
  }

  if (report.crawler.ok) {
    console.log(
      `crawler_7d: from=${report.crawler.windowFrom} hits=${report.crawler.totalHits} crawlers=${report.crawler.uniqueCrawlers} paths=${report.crawler.uniquePaths}`
    );
  } else {
    console.log(`crawler_7d: unavailable (${report.crawler.reason})`);
  }

  if (report.warnings.length > 0) {
    console.log("");
    console.log("warnings:");
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const client = getSupabaseClient();
  if (!client) {
    console.log("[seo-health-report] skipped: missing Supabase env vars.");
    console.log(
      "[seo-health-report] required: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(0);
  }

  const snapshot = await fetchLatestSnapshot(client);
  const cwv = await fetchCwvSummary(client);
  const crawler = await fetchCrawlerSummary(client);

  const warnings = [];
  if (!snapshot.latest) {
    warnings.push("No SEO health snapshot found. Create one via /api/admin/seo-health-snapshot.");
  } else {
    const ageHours = hoursSince(snapshot.latest.created_at);
    if (ageHours !== null && ageHours > args.maxSnapshotAgeHours) {
      warnings.push(
        `Latest snapshot is stale (${ageHours.toFixed(1)}h > ${args.maxSnapshotAgeHours}h threshold).`
      );
    }
  }

  if (cwv.ok && cwv.routesMeasured === 0) {
    warnings.push("CWV telemetry has zero measured routes on latest day.");
  } else if (cwv.ok && cwv.latestDayAgeDays !== null && cwv.latestDayAgeDays > 2) {
    warnings.push(`CWV telemetry is stale (${cwv.latestDayAgeDays} days old).`);
  }

  if (crawler.ok && crawler.totalHits === 0) {
    warnings.push("Crawler activity is zero in the last 7 days.");
  }

  const report = {
    overallStatus: deriveOverallStatus({
      latest: snapshot.latest,
      checks: snapshot.checks,
      cwv,
      crawler,
      maxSnapshotAgeHours: args.maxSnapshotAgeHours,
    }),
    snapshot,
    cwv,
    crawler,
    warnings,
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }

  if (args.strict && report.overallStatus === "fail") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[seo-health-report] failed: ${error?.message || "unknown-error"}`);
  process.exit(1);
});
