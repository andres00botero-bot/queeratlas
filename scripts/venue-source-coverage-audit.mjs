import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const rows = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("places")
    .select("id,name,city,type,link,venue_intel")
    .order("id", { ascending: true })
    .range(start, start + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}

const domainCounts = new Map();
let withPrimary = 0;
let withSources = 0;
let withTwoSources = 0;
let onlySocialOrDirectory = 0;
for (const row of rows) {
  const urls = Array.isArray(row.venue_intel?.source_urls) ? row.venue_intel.source_urls : [];
  if (/^https?:\/\//i.test(row.link || "")) withPrimary += 1;
  if (urls.length) withSources += 1;
  if (urls.length >= 2) withTwoSources += 1;
  const domains = urls.map((url) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "invalid"; }
  });
  if (domains.length && domains.every((domain) => /facebook|instagram|twitter|x\.com|travelgay|gayout|gaycities|misterbandb|wikipedia/i.test(domain))) onlySocialOrDirectory += 1;
  for (const domain of domains) domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
}

console.log(JSON.stringify({
  total: rows.length,
  with_primary_link: withPrimary,
  with_source_urls: withSources,
  with_two_or_more_sources: withTwoSources,
  only_social_or_directory_sources: onlySocialOrDirectory,
  top_domains: [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([domain, count]) => ({ domain, count })),
}, null, 2));
