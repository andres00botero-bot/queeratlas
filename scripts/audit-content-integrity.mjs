import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;
const TABLES = ["places", "events", "global_events", "services"];
const MOJIBAKE_PATTERN = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\u00e2\u20ac[\u0090-\u00bf]|\u00e2\u20ac|\u00f0\u0178|\ufffd|&#(?:x[0-9a-f]+|\d+);)/u;
const BROKEN_FRAGMENT_PATTERN = /\b[\p{L}\p{N}]+\.(?:is|are|was|were|has|have)\b/iu;

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function inspectValue(value, path = "") {
  if (typeof value === "string") {
    const issues = [];
    if (MOJIBAKE_PATTERN.test(value)) issues.push("encoding");
    if (!/^https?:\/\//iu.test(value) && BROKEN_FRAGMENT_PATTERN.test(value)) issues.push("fragment");
    return issues.map((kind) => ({ kind, path, value }));
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => inspectValue(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      inspectValue(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

async function fetchTable(client, table) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      if (/does not exist|schema cache/iu.test(error.message || "")) return [];
      throw new Error(`${table}: ${error.message}`);
    }
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

const client = getClient();
const findings = [];

for (const table of TABLES) {
  const rows = await fetchTable(client, table);
  for (const row of rows) {
    for (const issue of inspectValue(row)) {
      findings.push({
        table,
        id: row.id ?? "?",
        name: row.name ?? "",
        city: row.city ?? "",
        ...issue,
      });
    }
  }
}

if (findings.length) {
  console.error(`[content-integrity] ${findings.length} issue(s) found:`);
  for (const item of findings) {
    const normalized = item.value.replace(/\s+/gu, " ");
    const pattern = item.kind === "encoding" ? MOJIBAKE_PATTERN : BROKEN_FRAGMENT_PATTERN;
    const issueAt = Math.max(0, normalized.search(pattern));
    const excerpt = normalized.slice(Math.max(0, issueAt - 72), issueAt + 108);
    console.error(
      `- ${item.kind}: ${item.table}#${item.id} ${item.city}/${item.name} ${item.path}: ${excerpt}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("[content-integrity] PASS: no mojibake or broken sentence joins in public entity data.");
}
