import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    csv: "docs/templates/seo-ba4-kpi-tracker.csv",
    top: 10,
    out: "",
    weeklyReportOut: "",
    weekId: "",
    owner: "unassigned",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--csv" && argv[i + 1]) {
      args.csv = argv[i + 1];
      i += 1;
    } else if (part === "--top" && argv[i + 1]) {
      args.top = Number(argv[i + 1]) || 10;
      i += 1;
    } else if (part === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (part === "--weekly-report-out" && argv[i + 1]) {
      args.weeklyReportOut = argv[i + 1];
      i += 1;
    } else if (part === "--week-id" && argv[i + 1]) {
      args.weekId = argv[i + 1];
      i += 1;
    } else if (part === "--owner" && argv[i + 1]) {
      args.owner = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      current = "";
      if (row.some((col) => col.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((col) => col.length > 0)) {
      rows.push(row);
    }
  }

  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cols) => {
    const item = {};
    headers.forEach((header, idx) => {
      item[header] = (cols[idx] ?? "").trim();
    });
    return item;
  });
}

function safeDate(value) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time);
}

function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.floor((a.getTime() - b.getTime()) / MS);
}

function normalizeStage(stage) {
  return String(stage || "").toLowerCase().trim();
}

function hasSent(row) {
  return Boolean(row.sent_at) || ["sent", "followup_1", "followup_2", "replied", "published", "closed_lost"].includes(normalizeStage(row.stage));
}

function tierWeight(tier) {
  if (tier === "P1") return 30;
  if (tier === "P2") return 20;
  return 10;
}

function stageUrgency(stage, row, now) {
  const sentAt = safeDate(row.sent_at);
  const f1At = safeDate(row.followup_1_at);
  const f2At = safeDate(row.followup_2_at);
  const repliedAt = safeDate(row.replied_at);
  const publishedAt = safeDate(row.published_at);
  const state = normalizeStage(stage);

  if (state === "published" || state === "closed_lost") return 0;
  if (state === "candidate") return 8;
  if (state === "ready_to_pitch") return 15;
  if (state === "replied" && !publishedAt) return 22;

  if (state === "sent" && sentAt && !f1At) {
    return daysBetween(now, sentAt) >= 3 ? 26 : 12;
  }
  if (state === "followup_1" && f1At && !f2At) {
    return daysBetween(now, f1At) >= 5 ? 24 : 10;
  }
  if (state === "followup_2" && f2At && !repliedAt && !publishedAt) {
    return 16;
  }

  return 6;
}

function lastTouch(row) {
  const dates = [
    safeDate(row.published_at),
    safeDate(row.replied_at),
    safeDate(row.followup_2_at),
    safeDate(row.followup_1_at),
    safeDate(row.sent_at),
  ].filter(Boolean);
  return dates.length ? dates.sort((a, b) => b - a)[0] : null;
}

function summarize(rows) {
  const now = new Date();
  const byTarget = new Map();

  for (const row of rows) {
    const key = row.target_name || "unknown-target";
    if (!byTarget.has(key)) {
      byTarget.set(key, {
        target: key,
        tier: row.target_tier || "P3",
        owner: row.owner || "",
        contact: row.contact_url || "",
        stage: row.stage || "candidate",
        primaryUrl: row.primary_report_url || "",
        supportUrl: row.supporting_city_or_topic_url || "",
        sent: 0,
        replied: 0,
        published: 0,
        cqsSum: 0,
        cqsCount: 0,
        maxUrgency: 0,
        lastTouchAt: null,
      });
    }

    const item = byTarget.get(key);
    if (hasSent(row)) item.sent += 1;
    if (row.replied_at || ["replied", "published"].includes(normalizeStage(row.stage))) item.replied += 1;
    if (row.published_at || normalizeStage(row.stage) === "published") item.published += 1;

    const cqs = Number(row.cqs || 0);
    if (!Number.isNaN(cqs) && cqs > 0) {
      item.cqsSum += cqs;
      item.cqsCount += 1;
    }

    const urgency = stageUrgency(row.stage, row, now);
    if (urgency > item.maxUrgency) item.maxUrgency = urgency;

    const touched = lastTouch(row);
    if (touched && (!item.lastTouchAt || touched > item.lastTouchAt)) {
      item.lastTouchAt = touched;
      item.stage = row.stage || item.stage;
      item.owner = row.owner || item.owner;
      item.contact = row.contact_url || item.contact;
      item.primaryUrl = row.primary_report_url || item.primaryUrl;
      item.supportUrl = row.supporting_city_or_topic_url || item.supportUrl;
      item.tier = row.target_tier || item.tier;
    }
  }

  return [...byTarget.values()].map((item) => {
    const responseRate = item.sent ? item.replied / item.sent : 0;
    const publishRate = item.sent ? item.published / item.sent : 0;
    const avgCqs = item.cqsCount ? item.cqsSum / item.cqsCount : 0;
    const rawDaysSinceTouch = item.lastTouchAt ? daysBetween(new Date(), item.lastTouchAt) : 999;
    const daysSinceTouch = Math.max(0, rawDaysSinceTouch);
    const staleBoost = Math.min(12, Math.max(0, daysSinceTouch));
    const score =
      tierWeight(item.tier) +
      responseRate * 22 +
      publishRate * 24 +
      (avgCqs / 100) * 14 +
      item.maxUrgency +
      staleBoost;

    return {
      ...item,
      responseRate,
      publishRate,
      avgCqs,
      daysSinceTouch,
      score: Number(score.toFixed(2)),
    };
  });
}

function formatTable(items) {
  const headers = ["rank", "target", "tier", "stage", "score", "resp_rate", "pub_rate", "avg_cqs", "days_since_touch"];
  const rows = items.map((item, idx) => ({
    rank: String(idx + 1),
    target: item.target,
    tier: item.tier,
    stage: item.stage,
    score: String(item.score),
    resp_rate: `${Math.round(item.responseRate * 100)}%`,
    pub_rate: `${Math.round(item.publishRate * 100)}%`,
    avg_cqs: String(Math.round(item.avgCqs)),
    days_since_touch: String(item.daysSinceTouch),
  }));

  return [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))].join("\n");
}

function buildMarkdown(items, sourceCsv) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# BA4 Weekly Priority Output (${today})`);
  lines.push("");
  lines.push(`Source CSV: \`${sourceCsv}\``);
  lines.push("");
  lines.push("| Rank | Target | Tier | Stage | Score | Resp Rate | Publish Rate | Avg CQS | Days Since Touch |");
  lines.push("|---|---|---|---|---:|---:|---:|---:|---:|");
  items.forEach((item, idx) => {
    lines.push(
      `| ${idx + 1} | ${item.target} | ${item.tier} | ${item.stage} | ${item.score} | ${Math.round(
        item.responseRate * 100
      )}% | ${Math.round(item.publishRate * 100)}% | ${Math.round(item.avgCqs)} | ${item.daysSinceTouch} |`
    );
  });
  lines.push("");
  return lines.join("\n");
}

function detectWeekId(rows, requestedWeekId) {
  if (requestedWeekId) return requestedWeekId;
  const weekIds = [...new Set(rows.map((row) => row.week_id).filter(Boolean))].sort();
  return weekIds.length ? weekIds[weekIds.length - 1] : "unknown-week";
}

function roundPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function buildWeeklyReport(rows, rankedItems, meta) {
  const today = new Date().toISOString().slice(0, 10);
  const weekRows = rows.filter((row) => row.week_id === meta.weekId);
  const sourceRows = weekRows.length ? weekRows : rows;

  const sent = sourceRows.filter((row) => hasSent(row)).length;
  const replied = sourceRows.filter((row) => row.replied_at || ["replied", "published"].includes(normalizeStage(row.stage))).length;
  const published = sourceRows.filter((row) => row.published_at || normalizeStage(row.stage) === "published").length;
  const p1Sent = sourceRows.filter((row) => row.target_tier === "P1" && hasSent(row)).length;
  const p1Published = sourceRows.filter(
    (row) => row.target_tier === "P1" && (row.published_at || normalizeStage(row.stage) === "published")
  ).length;
  const cqsValues = sourceRows.map((row) => Number(row.cqs || 0)).filter((num) => !Number.isNaN(num) && num > 0);
  const avgCqs = cqsValues.length ? Math.round(cqsValues.reduce((acc, value) => acc + value, 0) / cqsValues.length) : 0;

  const responseRate = sent ? replied / sent : 0;
  const publishRate = sent ? published / sent : 0;
  const p1PublishRate = p1Sent ? p1Published / p1Sent : 0;

  const wins = sourceRows
    .filter((row) => row.published_url && (row.published_at || normalizeStage(row.stage) === "published"))
    .slice(0, 3);
  const blockers = sourceRows.filter((row) => ["followup_2", "closed_lost"].includes(normalizeStage(row.stage))).slice(0, 2);

  const lines = [];
  lines.push("# BA4 Weekly Brand Authority Report");
  lines.push("");
  lines.push("## Week");
  lines.push(`- Week ID: \`${meta.weekId}\``);
  lines.push(`- Reporting Date: \`${today}\``);
  lines.push(`- Owner: \`${meta.owner}\``);
  lines.push("");
  lines.push("## KPI Snapshot");
  lines.push(`- Outreach Volume (sent): \`${sent}\``);
  lines.push(`- Response Rate: \`${roundPercent(responseRate)}\``);
  lines.push(`- Publish Rate: \`${roundPercent(publishRate)}\``);
  lines.push(`- P1 Publish Rate: \`${roundPercent(p1PublishRate)}\``);
  lines.push(`- Average CQS: \`${avgCqs}\``);
  lines.push("");
  lines.push("## Top 10 Priority Targets");
  lines.push("| Rank | Target | Tier | Stage | Score | Resp Rate | Publish Rate | Avg CQS |");
  lines.push("|---|---|---|---|---:|---:|---:|---:|");
  rankedItems.forEach((item, idx) => {
    lines.push(
      `| ${idx + 1} | ${item.target} | ${item.tier} | ${item.stage} | ${item.score} | ${roundPercent(item.responseRate)} | ${roundPercent(
        item.publishRate
      )} | ${Math.round(item.avgCqs)} |`
    );
  });
  lines.push("");
  lines.push("## Wins");
  if (wins.length) {
    wins.forEach((row, idx) => {
      lines.push(`${idx + 1}. ${row.target_name}: ${row.published_url}`);
    });
  } else {
    lines.push("1. No published links this cycle.");
  }
  lines.push("");
  lines.push("## Losses / Blockers");
  if (blockers.length) {
    blockers.forEach((row, idx) => {
      lines.push(`${idx + 1}. ${row.target_name}: stage=${normalizeStage(row.stage) || "unknown"} (${row.notes || "no notes"})`);
    });
  } else {
    lines.push("1. No blocker rows flagged in this cycle.");
  }
  lines.push("");
  lines.push("## Next Week Action Plan");
  lines.push("1. Prioritize top 3 ranked targets for same-day outreach.");
  lines.push("2. Execute follow-up SLA for all rows in sent/followup_1.");
  lines.push("3. Tighten template based on blocker reasons.");
  lines.push("");
  lines.push(`Source CSV: \`${meta.sourceCsv}\``);
  lines.push("");
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const csvPath = path.resolve(args.csv);
  if (!fs.existsSync(csvPath)) {
    console.error(`[ba4-priority] CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  if (!rows.length) {
    console.error("[ba4-priority] No rows found in CSV.");
    process.exit(1);
  }

  const prioritized = summarize(rows);
  const actionable = prioritized.filter((item) => !["published", "closed_lost"].includes(normalizeStage(item.stage)));
  const list = actionable.length ? actionable : prioritized;
  const ranked = list.sort((a, b) => b.score - a.score).slice(0, Math.max(1, args.top));

  console.log(formatTable(ranked));

  if (args.out) {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buildMarkdown(ranked, args.csv), "utf8");
    console.log(`[ba4-priority] wrote ${outPath}`);
  }

  if (args.weeklyReportOut) {
    const reportPath = path.resolve(args.weeklyReportOut);
    const weekId = detectWeekId(rows, args.weekId);
    const report = buildWeeklyReport(rows, ranked, { weekId, owner: args.owner, sourceCsv: args.csv });
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, "utf8");
    console.log(`[ba4-priority] wrote ${reportPath}`);
  }
}

main();
