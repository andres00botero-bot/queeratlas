import fs from "node:fs";
import path from "node:path";
import { validateBa4Csv } from "./seo-ba4-validate.mjs";

const STAGES = new Set([
  "candidate",
  "ready_to_pitch",
  "sent",
  "followup_1",
  "followup_2",
  "replied",
  "published",
  "closed_lost",
]);

function parseArgs(argv) {
  const args = {
    csv: "docs/templates/seo-ba4-kpi-tracker.csv",
    out: "reports/seo-ba4-sla-queue-latest.md",
    top: 25,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--csv" && argv[i + 1]) {
      args.csv = argv[i + 1];
      i += 1;
    } else if (part === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (part === "--top" && argv[i + 1]) {
      args.top = Number(argv[i + 1]) || 25;
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
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      current = "";
      if (row.some((col) => col.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((col) => col.length > 0)) rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cols, idx) => {
    const item = { _rowNumber: idx + 2 };
    headers.forEach((header, colIdx) => {
      item[header] = (cols[colIdx] ?? "").trim();
    });
    return item;
  });
}

function safeDate(value) {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t);
}

function daysSince(date, now) {
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.floor((now.getTime() - date.getTime()) / dayMs);
}

function normalizeStage(stage) {
  const s = String(stage || "").toLowerCase().trim();
  return STAGES.has(s) ? s : "candidate";
}

function latestRowsByTarget(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.target_name || `row-${row._rowNumber}`;
    const touch = [
      safeDate(row.published_at),
      safeDate(row.replied_at),
      safeDate(row.followup_2_at),
      safeDate(row.followup_1_at),
      safeDate(row.sent_at),
    ]
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    const current = map.get(key);
    if (!current || (touch && (!current.touch || touch > current.touch))) {
      map.set(key, { row, touch: touch || null });
    }
  }
  return [...map.values()].map((entry) => entry.row);
}

function buildQueue(rows) {
  const now = new Date();
  const queue = [];
  const targets = latestRowsByTarget(rows);

  for (const row of targets) {
    const stage = normalizeStage(row.stage);
    const sentAt = safeDate(row.sent_at);
    const f1At = safeDate(row.followup_1_at);
    const f2At = safeDate(row.followup_2_at);
    const repliedAt = safeDate(row.replied_at);
    const publishedAt = safeDate(row.published_at);

    if (stage === "published" || stage === "closed_lost") continue;

    let actionType = "";
    let due = false;
    let daysOverdue = 0;

    if (stage === "sent" && sentAt && !f1At) {
      const elapsed = daysSince(sentAt, now);
      if (elapsed >= 3) {
        actionType = "send_followup_1";
        due = true;
        daysOverdue = Math.max(0, elapsed - 3);
      }
    } else if (stage === "followup_1" && f1At && !f2At && !repliedAt) {
      const elapsed = daysSince(f1At, now);
      if (elapsed >= 5) {
        actionType = "send_followup_2";
        due = true;
        daysOverdue = Math.max(0, elapsed - 5);
      }
    } else if (stage === "replied" && repliedAt && !publishedAt) {
      const elapsed = daysSince(repliedAt, now);
      if (elapsed >= 1) {
        actionType = "reply_to_target";
        due = true;
        daysOverdue = Math.max(0, elapsed - 1);
      }
    } else if (stage === "candidate" || stage === "ready_to_pitch") {
      actionType = "prepare_and_send";
      due = true;
      daysOverdue = 0;
    } else if (stage === "followup_2" && !repliedAt) {
      actionType = "final_decision_or_close";
      due = true;
      daysOverdue = 0;
    }

    if (!due || !actionType) continue;

    const tierWeight = row.target_tier === "P1" ? 30 : row.target_tier === "P2" ? 20 : 10;
    const overdueWeight = Math.min(20, daysOverdue * 2);
    const score = tierWeight + overdueWeight;

    queue.push({
      target: row.target_name,
      tier: row.target_tier || "P3",
      owner: row.owner || "",
      stage,
      actionType,
      daysOverdue,
      score,
      contactUrl: row.contact_url || "",
      primaryReportUrl: row.primary_report_url || "",
    });
  }

  return queue.sort((a, b) => b.score - a.score);
}

function asCsv(items) {
  const headers = ["rank", "target", "tier", "stage", "action_type", "days_overdue", "priority_score", "owner"];
  const lines = [headers.join(",")];
  items.forEach((item, idx) => {
    lines.push(
      [idx + 1, item.target, item.tier, item.stage, item.actionType, item.daysOverdue, item.score, item.owner]
        .map((v) => String(v).replaceAll(",", " "))
        .join(",")
    );
  });
  return lines.join("\n");
}

function asMarkdown(items, sourceCsv) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# BA4 SLA Action Queue (${today})`);
  lines.push("");
  lines.push(`Source CSV: \`${sourceCsv}\``);
  lines.push("");
  lines.push("| Rank | Target | Tier | Stage | Action | Days Overdue | Priority | Owner |");
  lines.push("|---|---|---|---|---|---:|---:|---|");
  if (!items.length) {
    lines.push("| - | - | - | - | No due actions right now | 0 | 0 | - |");
  } else {
    items.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.target} | ${item.tier} | ${item.stage} | ${item.actionType} | ${item.daysOverdue} | ${item.score} | ${item.owner || "-"} |`
      );
    });
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const csvPath = path.resolve(args.csv);
  const valid = validateBa4Csv(csvPath);
  if (!valid.ok) {
    console.error("[ba4-sla-queue] validation failed");
    valid.errors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(text);
  const queue = buildQueue(rows).slice(0, Math.max(1, args.top));

  console.log(asCsv(queue));

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, asMarkdown(queue, args.csv), "utf8");
  console.log(`[ba4-sla-queue] wrote ${outPath}`);
}

main();
