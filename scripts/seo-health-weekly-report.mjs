import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_OUT = "reports/seo-health-weekly-latest.md";
const WINDOW_DAYS = 7;

function parseArgs(argv) {
  const args = {
    out: DEFAULT_OUT,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (part === "--json") {
      args.json = true;
    }
  }

  return args;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function toIsoDate(input) {
  return new Date(input).toISOString().slice(0, 10);
}

function statusPriority(status) {
  if (status === "fail") return 3;
  if (status === "warn") return 2;
  return 1;
}

function formatStatusEmoji(status) {
  if (status === "fail") return "🔴 fail";
  if (status === "warn") return "🟠 warn";
  return "🟢 pass";
}

async function fetchSnapshotHistory(client, fromIso) {
  const { data, error } = await client
    .from("qa_seo_health_snapshots")
    .select("id,status_summary,checks_passed,checks_warn,checks_failed,created_at")
    .gte("created_at", `${fromIso}T00:00:00.000Z`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return { ok: false, reason: error.message, rows: [] };
  }

  return { ok: true, rows: Array.isArray(data) ? data : [] };
}

async function fetchSnapshotChecks(client, snapshotIds) {
  if (!snapshotIds.length) return { ok: true, rows: [] };
  const { data, error } = await client
    .from("qa_seo_health_snapshot_checks")
    .select("snapshot_id,check_key,status,score")
    .in("snapshot_id", snapshotIds)
    .order("check_key", { ascending: true });

  if (error) {
    return { ok: false, reason: error.message, rows: [] };
  }

  return { ok: true, rows: Array.isArray(data) ? data : [] };
}

async function fetchCwvDaily(client, fromIso) {
  const { data, error } = await client
    .from("qa_seo_web_vitals_daily")
    .select("day,route,metric_name,p75")
    .gte("day", fromIso)
    .order("day", { ascending: false })
    .limit(10000);

  if (error) {
    return { ok: false, reason: error.message, rows: [] };
  }

  return { ok: true, rows: Array.isArray(data) ? data : [] };
}

async function fetchCrawlerDaily(client, fromIso) {
  const { data, error } = await client
    .from("qa_seo_crawler_hits_daily")
    .select("day,crawler_key,path,hits")
    .gte("day", fromIso)
    .order("day", { ascending: false })
    .limit(10000);

  if (error) {
    return { ok: false, reason: error.message, rows: [] };
  }

  return { ok: true, rows: Array.isArray(data) ? data : [] };
}

function summarizeChecks(checkRows = []) {
  const byCheck = new Map();
  for (const row of checkRows) {
    const key = String(row.check_key || "unknown_check");
    if (!byCheck.has(key)) {
      byCheck.set(key, {
        checkKey: key,
        pass: 0,
        warn: 0,
        fail: 0,
        worstStatus: "pass",
        minScore: 100,
      });
    }
    const current = byCheck.get(key);
    const status = String(row.status || "warn");
    if (status === "pass") current.pass += 1;
    else if (status === "fail") current.fail += 1;
    else current.warn += 1;
    if (statusPriority(status) > statusPriority(current.worstStatus)) {
      current.worstStatus = status;
    }
    const score = Number(row.score ?? 0);
    if (Number.isFinite(score)) {
      current.minScore = Math.min(current.minScore, score);
    }
  }

  return [...byCheck.values()].sort((a, b) => {
    const pri = statusPriority(b.worstStatus) - statusPriority(a.worstStatus);
    if (pri !== 0) return pri;
    return a.minScore - b.minScore;
  });
}

function summarizeCwv(cwvRows = []) {
  const byRoute = new Map();
  for (const row of cwvRows) {
    const route = String(row.route || "/");
    if (!byRoute.has(route)) {
      byRoute.set(route, { route, lcpPoorDays: 0, inpPoorDays: 0, clsPoorDays: 0, poorSignals: 0 });
    }
    const current = byRoute.get(route);
    const metric = String(row.metric_name || "").toUpperCase();
    const value = Number(row.p75 ?? 0);
    if (metric === "LCP" && value > 2500) {
      current.lcpPoorDays += 1;
      current.poorSignals += 1;
    }
    if (metric === "INP" && value > 200) {
      current.inpPoorDays += 1;
      current.poorSignals += 1;
    }
    if (metric === "CLS" && value > 0.1) {
      current.clsPoorDays += 1;
      current.poorSignals += 1;
    }
  }

  const routes = [...byRoute.values()].sort((a, b) => b.poorSignals - a.poorSignals);
  const impactedRoutes = routes.filter((route) => route.poorSignals > 0);
  return {
    totalRoutes: routes.length,
    impactedRoutesCount: impactedRoutes.length,
    topImpacted: impactedRoutes.slice(0, 10),
  };
}

function summarizeCrawler(crawlerRows = []) {
  const totalHits = crawlerRows.reduce((sum, row) => sum + Number(row.hits || 0), 0);
  const uniqueCrawlers = new Set(crawlerRows.map((row) => String(row.crawler_key || "")).filter(Boolean)).size;
  const uniquePaths = new Set(crawlerRows.map((row) => String(row.path || "")).filter(Boolean)).size;

  return { totalHits, uniqueCrawlers, uniquePaths };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# SEO Weekly Health Report");
  lines.push("");
  lines.push(`- Generated at: \`${report.generatedAt}\``);
  lines.push(`- Window start (UTC date): \`${report.windowFrom}\``);
  lines.push(`- Overall status: **${formatStatusEmoji(report.overallStatus)}**`);
  lines.push("");
  lines.push("## Snapshot Trend (7d)");
  if (!report.snapshot.ok) {
    lines.push(`- Snapshot data unavailable: ${report.snapshot.reason}`);
  } else if (report.snapshot.rows.length === 0) {
    lines.push("- No snapshots recorded in the last 7 days.");
  } else {
    lines.push("| Created at | Status | Pass | Warn | Fail |");
    lines.push("|---|---|---:|---:|---:|");
    for (const row of report.snapshot.rows) {
      lines.push(
        `| ${row.created_at} | ${row.status_summary} | ${row.checks_passed} | ${row.checks_warn} | ${row.checks_failed} |`
      );
    }
  }
  lines.push("");
  lines.push("## Check Risk Board");
  if (!report.checks.ok) {
    lines.push(`- Check data unavailable: ${report.checks.reason}`);
  } else if (report.checks.summary.length === 0) {
    lines.push("- No check rows available.");
  } else {
    lines.push("| Check key | Worst status | Pass | Warn | Fail | Min score |");
    lines.push("|---|---|---:|---:|---:|---:|");
    for (const row of report.checks.summary.slice(0, 12)) {
      lines.push(
        `| ${row.checkKey} | ${row.worstStatus} | ${row.pass} | ${row.warn} | ${row.fail} | ${row.minScore} |`
      );
    }
  }
  lines.push("");
  lines.push("## CWV Route Risk");
  if (!report.cwv.ok) {
    lines.push(`- CWV data unavailable: ${report.cwv.reason}`);
  } else {
    lines.push(`- Routes measured: \`${report.cwv.summary.totalRoutes}\``);
    lines.push(`- Impacted routes: \`${report.cwv.summary.impactedRoutesCount}\``);
    if (report.cwv.summary.topImpacted.length > 0) {
      lines.push("| Route | Poor signals | LCP poor days | INP poor days | CLS poor days |");
      lines.push("|---|---:|---:|---:|---:|");
      for (const row of report.cwv.summary.topImpacted) {
        lines.push(
          `| ${row.route} | ${row.poorSignals} | ${row.lcpPoorDays} | ${row.inpPoorDays} | ${row.clsPoorDays} |`
        );
      }
    } else {
      lines.push("- No CWV route thresholds exceeded in this window.");
    }
  }
  lines.push("");
  lines.push("## Crawler Activity (7d)");
  if (!report.crawler.ok) {
    lines.push(`- Crawler data unavailable: ${report.crawler.reason}`);
  } else {
    lines.push(`- Total hits: \`${report.crawler.summary.totalHits}\``);
    lines.push(`- Unique crawlers: \`${report.crawler.summary.uniqueCrawlers}\``);
    lines.push(`- Unique paths crawled: \`${report.crawler.summary.uniquePaths}\``);
  }
  lines.push("");
  lines.push("## Actions Next");
  lines.push("1. Resolve all `fail` checks first.");
  lines.push("2. Reduce CWV impacted routes by fixing top 3 routes.");
  lines.push("3. If crawler hits are low, improve internal link surfacing and re-check sitemap discoverability.");
  lines.push("");

  return lines.join("\n");
}

function deriveOverallStatus(snapshotRows, checkSummary, cwvSummary, crawlerSummary) {
  let status = "pass";

  if (!snapshotRows.length) status = "warn";

  for (const row of snapshotRows) {
    const rowStatus = String(row.status_summary || "warn");
    if (statusPriority(rowStatus) > statusPriority(status)) {
      status = rowStatus;
    }
  }

  if (checkSummary.some((row) => row.worstStatus === "fail")) status = "fail";
  if (status !== "fail" && cwvSummary.impactedRoutesCount > 0) status = "warn";
  if (status === "pass" && crawlerSummary.totalHits === 0) status = "warn";

  return status;
}

async function main() {
  const args = parseArgs(process.argv);
  const client = getSupabaseClient();
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - WINDOW_DAYS);
  const windowFrom = toIsoDate(from);

  if (!client) {
    const fallback = {
      generatedAt: now.toISOString(),
      windowFrom,
      overallStatus: "warn",
      reason: "missing-supabase-env",
    };
    if (args.json) {
      console.log(JSON.stringify(fallback, null, 2));
    } else {
      console.log("[seo-health-weekly-report] skipped: missing Supabase env vars.");
      console.log(
        "[seo-health-weekly-report] required: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or compatible key)."
      );
    }
    process.exit(0);
  }

  const snapshot = await fetchSnapshotHistory(client, windowFrom);
  const snapshotIds = snapshot.ok ? snapshot.rows.map((row) => row.id).filter(Boolean) : [];
  const checks = await fetchSnapshotChecks(client, snapshotIds);
  const cwv = await fetchCwvDaily(client, windowFrom);
  const crawler = await fetchCrawlerDaily(client, windowFrom);

  const checksSummary = checks.ok ? summarizeChecks(checks.rows) : [];
  const cwvSummary = cwv.ok ? summarizeCwv(cwv.rows) : { totalRoutes: 0, impactedRoutesCount: 0, topImpacted: [] };
  const crawlerSummary = crawler.ok
    ? summarizeCrawler(crawler.rows)
    : { totalHits: 0, uniqueCrawlers: 0, uniquePaths: 0 };

  const report = {
    generatedAt: now.toISOString(),
    windowFrom,
    overallStatus: deriveOverallStatus(snapshot.ok ? snapshot.rows : [], checksSummary, cwvSummary, crawlerSummary),
    snapshot,
    checks: { ...checks, summary: checksSummary },
    cwv: { ...cwv, summary: cwvSummary },
    crawler: { ...crawler, summary: crawlerSummary },
  };

  const outputPath = path.resolve(args.out);
  const markdown = buildMarkdown(report);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf8");

  console.log(`[seo-health-weekly-report] wrote ${outputPath}`);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`[seo-health-weekly-report] overall_status=${report.overallStatus}`);
  }
}

main().catch((error) => {
  console.error(`[seo-health-weekly-report] failed: ${error?.message || "unknown-error"}`);
  process.exit(1);
});
