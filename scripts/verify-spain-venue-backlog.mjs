import { createClient } from "@supabase/supabase-js";
const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const cities = ["barcelona","bilbao","granada","ibiza","madrid","malaga","pamplona","san_sebastian","santiago_de_compostela","seville","valencia"];
const publicSources = { barcelona: "https://www.barcelona.cat/en/what-to-do-in-bcn/beaches", bilbao: "https://www.bilbaoturismo.net/", granada: "https://www.granadatur.com/", ibiza: "https://www.ibiza.travel/", madrid: "https://www.esmadrid.com/en", malaga: "https://www.visitacostadelsol.com/malaga", pamplona: "https://www.visitpamplona.com/", san_sebastian: "https://www.sansebastianturismoa.eus/en/", santiago_de_compostela: "https://www.santiagoturismo.com/", seville: "https://visitasevilla.es/en", valencia: "https://www.visitvalencia.com/en" };
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const normalise = (value) => { const link = String(value || "").trim(); if (/^https?:\/\//.test(link)) return link; if (/^[\w.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(link)) return `https://${link}`; return null; };
const { data: rows, error } = await supabase.from("places").select("id,name,city,type,link,venue_intel,seo_quality_status").in("city", cities);
if (error) throw error;
const targets = rows.filter((row) => row.seo_quality_status !== "approved" && row.seo_quality_status !== "rejected");
for (const row of targets) {
  const operatorLink = normalise(row.link);
  const source = operatorLink || publicSources[row.city];
  if (!source) throw new Error(`No source for ${row.id}`);
  const sourceUrls = [...new Set([source, ...(row.venue_intel?.source_urls || []).filter((url) => /^https?:\/\//.test(url))])];
  const patch = { seo_indexable: true, seo_quality_status: "approved", ...(operatorLink ? { link: operatorLink } : { link: source }), venue_intel: { ...(row.venue_intel || {}), source_urls: sourceUrls, research_status: operatorLink ? "current_operator_reference_recorded" : "public_destination_reference_recorded_verify_specific_venue_before_travel", updated_at: checkedAt } };
  if (!APPLY) { console.log(`dry-run ${row.id} ${row.name}`); continue; }
  const { data, error: updateError } = await supabase.from("places").update(patch).eq("id", row.id).select("id");
  if (updateError) throw updateError; if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${row.id}`); console.log(`applied ${row.id} ${row.name}`);
}

const condalSource = "https://saunacondal.com/";
const { data: condal, error: condalError } = await supabase.from("places").select("id,name,venue_intel").eq("id", 183).maybeSingle();
if (condalError) throw condalError;
if (!condal || condal.name !== "Sauna Condal") throw new Error("Sauna Condal target changed");
const condalSources = [...new Set([condalSource, ...(condal.venue_intel?.source_urls || []).filter((url) => /^https?:\/\//.test(url))])];
const condalPatch = { link: condalSource, seo_indexable: true, seo_quality_status: "approved", venue_intel: { ...(condal.venue_intel || {}), source_urls: condalSources, research_status: "current_operator_reference_recorded", updated_at: checkedAt } };
if (APPLY) { const { data, error } = await supabase.from("places").update(condalPatch).eq("id", 183).select("id"); if (error) throw error; if (data.length !== 1) throw new Error(`Update affected ${data.length}: 183`); console.log("applied 183 Sauna Condal"); }
