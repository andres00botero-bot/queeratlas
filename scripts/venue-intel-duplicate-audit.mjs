import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const rows = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("places")
    .select("id,name,city,type,venue_intel")
    .order("id", { ascending: true })
    .range(start, start + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}

function skeleton(row, field) {
  return String(row.venue_intel?.[field] || "")
    .toLowerCase()
    .replaceAll(String(row.name || "").toLowerCase(), "{venue}")
    .replaceAll(String(row.city || "").toLowerCase().replaceAll("_", " "), "{city}")
    .replace(/\b\d+(?:[.:–-]\d+)*\b/g, "{n}")
    .replace(/[^a-z{}]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateStats(keyFor) {
  return Object.fromEntries(fields.map((field) => {
    const groups = new Map();
    for (const row of rows) {
      const key = keyFor(row, field);
      if (!key) continue;
      const group = groups.get(key) || [];
      group.push(row);
      groups.set(key, group);
    }
    const duplicates = [...groups.entries()].filter(([, group]) => group.length > 1).sort((a, b) => b[1].length - a[1].length);
    return [field, {
      duplicate_groups: duplicates.length,
      affected_rows: new Set(duplicates.flatMap(([, group]) => group.map((row) => row.id))).size,
      largest_group: duplicates[0]?.[1].length || 0,
      examples: duplicates.slice(0, 3).map(([text, group]) => ({ count: group.length, text, venues: group.slice(0, 5).map((row) => row.name) })),
    }];
  }));
}

console.log(JSON.stringify({
  total: rows.length,
  exact: duplicateStats((row, field) => String(row.venue_intel?.[field] || "").trim()),
  structural: duplicateStats(skeleton),
}, null, 2));
