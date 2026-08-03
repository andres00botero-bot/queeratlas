import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const allowedStatuses = new Set(["verified", "verified_policy", "community_signal", "not_published", "source_unavailable"]);
const rows = [];

for (let offset = 0; ; offset += 1000) {
  const { data, error } = await supabase.from("places").select("id,name,venue_intel").order("id").range(offset, offset + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}

const problems = [];
const statuses = Object.fromEntries(fields.map((field) => [field, {}]));
for (const row of rows) {
  for (const field of fields) {
    const text = String(row.venue_intel?.[field] || "").trim();
    const evidence = row.venue_intel?.topic_evidence?.[field];
    const status = String(evidence?.status || "");
    if (!text || text.length > 320) problems.push({ id: row.id, name: row.name, field, issue: !text ? "missing_text" : "over_length" });
    if (!allowedStatuses.has(status)) problems.push({ id: row.id, name: row.name, field, issue: "invalid_evidence_status", status });
    if (!evidence?.checked_at) problems.push({ id: row.id, name: row.name, field, issue: "missing_checked_at" });
    if (["verified", "verified_policy", "community_signal", "not_published"].includes(status) && !evidence?.source_urls?.length) {
      problems.push({ id: row.id, name: row.name, field, issue: "status_requires_source" });
    }
    statuses[field][status || "missing"] = (statuses[field][status || "missing"] || 0) + 1;
  }
}

console.log(JSON.stringify({ total_places: rows.length, topic_checks: rows.length * fields.length, problems: problems.length, statuses, sample_problems: problems.slice(0, 20) }, null, 2));
if (problems.length) process.exitCode = 1;
