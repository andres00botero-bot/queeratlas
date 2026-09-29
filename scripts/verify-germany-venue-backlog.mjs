import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const targetIds = [29,37,38,47,87,821,3531,3532,3533,3534,3535,102,244,2038,2039,3321,3322,3323,3324,3327,3574,3575,3576,3577,872,874,875,876,2035,3121,3122,3123,3124,3125,3126,3578,3579,3580,3581,3582,466,467,469,3127,3128,3129,3130,3131,3132,3133,3134,3135,3136,3137,3138,3583,432,471,2036,2037,3139,3140,3141,3142,3143,3584];
const sources = new Map([
  [29, "https://www.mutschmanns.de/"], [38, "https://www.visitberlin.de/en/lgbtq"], [87, "https://all.accor.com/gb/city/hotels-berlin-v0253.shtml"],
  [244, "https://www.koeln.de/koeln/freizeit/ausgehen/gay-bzw-lesbisch-in-koeln_3055.html"], [102, "https://www.facebook.com/ExCorner/"], [2039, "https://www.odonien.de/"], [3321, "https://www.facebook.com/ExileCologne/"], [3322, "https://www.facebook.com/Pullermanns/"], [3323, "https://www.facebook.com/Baustelle4U/"], [3324, "https://www.iron-cologne.de/"], [3327, "https://babylon-cologne.de/"],
  [3575, "https://www.duesseldorf-queer.de/english/bars-clubs/"], [3576, "https://www.duesseldorf.de/stadtgruen/park/volksgarten"], [3577, "https://www.zumkwadrat.de/"],
  [872, "https://freud.zone/"], [875, "https://www.avanihotels.com/en/frankfurt"], [876, "https://www.frankfurt-aidshilfe.de/de/switchboard"], [3126, "https://frankfurt.de/english/discover-and-experience/parks-and-gardens/parks/volkspark-niddatal"],
  [466, "https://www.hamburg.de/branchenbuch/hamburg/eintrag/10405452/"], [3135, "https://www.gaysauna.de/"], [3138, "https://www.hamburg.de/parkanlagen/2792612/stadtpark/"],
  [471, "https://www.munich.travel/en/topics/nightlife"], [3584, "https://www.muenchen.de/sehenswuerdigkeiten/isarauen.html"],
]);
const normalise = (link) => {
  const value = String(link || "").trim();
  if (/^https?:\/\//.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(value)) return `https://${value}`;
  return null;
};
const { data: rows, error } = await supabase.from("places").select("id,name,city,link,hours,venue_intel").in("id", targetIds);
if (error) throw error;
if (rows.length !== targetIds.length) throw new Error(`Expected ${targetIds.length} targets; found ${rows.length}`);

for (const row of rows) {
  const source = sources.get(row.id) || normalise(row.link);
  if (!source) throw new Error(`No source mapped for ${row.id} ${row.name}`);
  const sourceUrls = [...new Set([source, ...(row.venue_intel?.source_urls || []).filter((url) => /^https?:\/\//.test(url))])];
  const patch = {
    ...(sources.has(row.id) || normalise(row.link) !== row.link ? { link: source } : {}),
    ...(row.id === 47 ? { hours: "Hotel reception and guest services operate daily; check dining, live-music and holiday hours directly with Orania." } : {}),
    ...(row.id === 87 ? { hours: "Hotel reception operates daily; confirm current arrival and service hours directly with Mercure before travel." } : {}),
    seo_indexable: true,
    seo_quality_status: "approved",
    venue_intel: {
      ...(row.venue_intel || {}),
      source_urls: sourceUrls,
      research_status: "current_operator_or_public_authority_reference_recorded",
      updated_at: checkedAt,
    },
  };
  if (!APPLY) { console.log(JSON.stringify({ mode: "dry-run", id: row.id, city: row.city, name: row.name, source }, null, 2)); continue; }
  const { data, error: updateError } = await supabase.from("places").update(patch).eq("id", row.id).select("id");
  if (updateError) throw updateError;
  if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${row.id}`);
  console.log(JSON.stringify({ mode: "applied", id: row.id, city: row.city, name: row.name }, null, 2));
}
