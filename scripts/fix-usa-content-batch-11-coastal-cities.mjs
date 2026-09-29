import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const target = { id: 1067, name: "Moby Dick", city: "san_francisco", link: "https://www.facebook.com/MobyDickBar/" };
const { data: row, error } = await supabase.from("places").select("id,name,city,venue_intel").eq("id", target.id).maybeSingle();
if (error) throw error;
if (!row || row.name !== target.name || row.city !== target.city) throw new Error(`Target changed: ${target.id}`);
const sources = [...new Set([target.link, ...(row.venue_intel?.source_urls || []), "https://castromerchants.com/bars", "https://thecastro.com/the-neighborhood/"])];
const patch = {
  link: target.link,
  seo_indexable: true,
  seo_quality_status: "approved",
  venue_intel: {
    ...(row.venue_intel || {}),
    source_urls: sources,
    research_status: "current_operator_channel_and_current_local_destination_verified",
    updated_at: "2026-09-29T00:00:00Z",
  },
};
if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", city: target.city, updates: 1 }, null, 2));
} else {
  const { data, error: updateError } = await supabase.from("places").update(patch).eq("id", target.id).eq("city", target.city).select("id");
  if (updateError) throw updateError;
  if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${target.id}`);
  console.log(JSON.stringify({ mode: "applied", updates: data.length }, null, 2));
}
