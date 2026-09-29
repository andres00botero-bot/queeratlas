import { createClient } from "@supabase/supabase-js";
const APPLY = process.argv.includes("--apply");
const cities = ["barcelona","bilbao","granada","ibiza","madrid","malaga","pamplona","san_sebastian","santiago_de_compostela","seville","valencia"];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const replacements = [
  [/\ban absolute\b/gi, "a"], [/\bthe ultimate\b/gi, "a strong"], [/\bthe unquestioned\b/gi, "a"], [/\bhyper-([\w-]+)\b/gi, "$1"], [/\bmasterclass in\b/gi, "example of"], [/\btotal dream\b/gi, "welcoming spot"], [/\bflawless\b/gi, "easy"], [/\bbreathtaking\b/gi, "distinctive"], [/\bglittering\b/gi, "bright"], [/\bfiercely\b/gi, "clearly"], [/\biconic\b/gi, "well-known"], [/\bserves pure\b/gi, "brings"], [/\bhoney,?\s*/gi, ""], [/\bdarlings,?\s*/gi, ""], [/\bdolls!\s*/gi, ""], [/\bcompletely\s+(?=\w)/gi, ""], [/\babsolutely\s+(?=\w)/gi, ""], [/\bbeautifully\s+(?=\w)/gi, ""], [/\bdeeply\s+(?=\w)/gi, ""], [/\bhighly\s+(?=\w)/gi, ""], [/\bjust\s+(?=\w)/gi, ""]
];
const clean = (value) => replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value || "")).replace(/\s{2,}/g, " ").replace(/\s+([,.!?:])/g, "$1").trim();
const { data: rows, error } = await supabase.from("places").select("id,name,city,description,venue_intel").in("city", cities).neq("seo_quality_status", "rejected");
if (error) throw error;
for (const row of rows) {
  const intel = Object.fromEntries(Object.entries(row.venue_intel || {}).map(([key, value]) => [key, typeof value === "string" ? clean(value) : value]));
  const description = clean(row.description);
  if (!APPLY) { console.log(`dry-run ${row.id} ${row.name}`); continue; }
  const { data, error: updateError } = await supabase.from("places").update({ description, venue_intel: intel }).eq("id", row.id).select("id");
  if (updateError) throw updateError;
  if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${row.id}`);
}
