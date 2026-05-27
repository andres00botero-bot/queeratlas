import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ALLOWED_TIERS = new Set(["P1", "P2", "P3"]);
const ALLOWED_STAGES = new Set([
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
  const args = { csv: "docs/templates/seo-ba4-kpi-tracker.csv" };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--csv" && argv[i + 1]) {
      args.csv = argv[i + 1];
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

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateRows(rows) {
  const errors = [];
  rows.forEach((row) => {
    const rowNum = row._rowNumber;
    if (!row.target_name) {
      errors.push(`row ${rowNum}: target_name is required`);
    }
    if (!ALLOWED_TIERS.has(row.target_tier || "")) {
      errors.push(`row ${rowNum}: target_tier must be one of P1/P2/P3`);
    }
    if (!ALLOWED_STAGES.has(String(row.stage || "").toLowerCase())) {
      errors.push(`row ${rowNum}: stage is invalid`);
    }
    if (!isValidHttpUrl(row.contact_url || "")) {
      errors.push(`row ${rowNum}: contact_url must be valid http/https URL`);
    }
    if (!isValidHttpUrl(row.primary_report_url || "")) {
      errors.push(`row ${rowNum}: primary_report_url must be valid http/https URL`);
    }
  });
  return errors;
}

export function validateBa4Csv(csvPathInput) {
  const csvPath = path.resolve(csvPathInput);
  if (!fs.existsSync(csvPath)) {
    return { ok: false, errors: [`CSV not found: ${csvPath}`], rows: 0, path: csvPath };
  }

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  if (!rows.length) {
    return { ok: false, errors: ["No rows found in CSV"], rows: 0, path: csvPath };
  }

  const errors = validateRows(rows);
  return { ok: errors.length === 0, errors, rows: rows.length, path: csvPath };
}

function main() {
  const args = parseArgs(process.argv);
  const result = validateBa4Csv(args.csv);
  if (!result.ok) {
    console.error(`[ba4-validate] FAILED (${result.errors.length} issues)`);
    result.errors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }
  console.log(`[ba4-validate] PASSED (${result.rows} rows) ${result.path}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
