import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) throw new Error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const pageSize = 1000;
const rows = [];

for (let from = 0; ; from += pageSize) {
  const { data, error } = await supabase
    .from("qa_page_visits")
    .select("visit_date,route,city,visitor_id,last_seen_at,created_at")
    .order("visit_date", { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) throw error;
  rows.push(...(data || []));
  if ((data || []).length < pageSize) break;
}

const today = new Date().toISOString().slice(0, 10);
const since = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - (days - 1));
  return date.toISOString().slice(0, 10);
};
const summarize = (days) => {
  const selected = rows.filter((row) => String(row.visit_date || "") >= since(days));
  return {
    uniqueRouteVisits: selected.length,
    identifiedBrowsers: new Set(selected.map((row) => row.visitor_id).filter(Boolean)).size,
  };
};

console.log(JSON.stringify({
  model: "legacy-v1",
  rows: rows.length,
  firstDate: rows[0]?.visit_date || null,
  lastDate: rows.at(-1)?.visit_date || null,
  today: summarize(1),
  last7Days: summarize(7),
  last30Days: summarize(30),
  limitations: [
    "One row represents one browser + route + UTC day, not one pageview.",
    "Repeat views of the same route on the same day are not counted.",
    "Sessions, referrers, campaigns, devices and geography are not recorded.",
    `Audit generated ${today}.`,
  ],
}, null, 2));
