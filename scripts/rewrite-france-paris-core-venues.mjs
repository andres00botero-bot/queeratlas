import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const reviewedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const updates = [
  [99, {
    description: "Cox is the Marais institution for a first drink that turns into an accidental whole evening. Its terrace and open frontage put the social part of the neighbourhood on display, while house DJs keep the inside moving after the pavement crowd thins. Come for happy hour if you want conversation; stay later if you want to feel the street's pulse without committing to a full club night.",
    hours: "Daily 17:00–02:00; happy hour until 22:00. Confirm holiday or special-event changes directly.",
    location: "15 rue des Archives, 75004 Paris, France",
    link: "https://cox.fr/",
    venue_intel: { crowd_mix: "A broad Marais mix of local regulars, after-work groups, visitors and late-night bar-hoppers; the terrace is especially social early on.", dress_code: "Relaxed but intentional city-night style fits. This is a terrace-and-bar room, not a hard-door fashion test.", queue_wait: "Walk-in is normal, though the small pavement/inside footprint gets compressed at peak happy hour and on warm evenings.", best_nights: "Early evening for conversation, then later sets when you want to keep the night moving without leaving the Marais.", staff_inclusivity: "A long-running gay bar in the Marais; contact the venue directly for current access needs.", source_urls: ["https://cox.fr/", "https://www.parismarais.paris/fr/styles-de-vie-du-marais/le-quartier-gay-du-marais/bars-clubs-gay-du-marais/cox.html"], research_status: "current_official_and_local_destination_sources", updated_at: reviewedAt },
  }],
  [100, {
    description: "Banana Café is a colourful, late-running Les Halles institution that starts as a bar and steadily turns into a dance-floor plan. House, afro-house and electro set the musical spine; themed nights and the famously long closing time make it useful when the Marais has already started winding down. Arrive for a low-cost early drink, then decide whether the particular night's crowd is your kind of chaos.",
    hours: "Daily from approximately 17:00 until 08:00; entry and programme vary by night, so check the current listing before travelling.",
    location: "13 rue de la Ferronnerie, 75001 Paris, France",
    link: "https://banana-cafe-paris.com/",
    venue_intel: { crowd_mix: "A mixed LGBTQIA+ and ally crowd, with a more dance-led room as the night grows; themed nights can alter the balance completely.", dress_code: "Come as yourself, but bring a layer you can dance in for hours rather than dressing for a fixed code.", queue_wait: "Walk-ins are possible, while groups, tables and ticketed nights benefit from booking or a current guest-list check.", best_nights: "The right night is the one with a theme or DJ that suits you; it is particularly useful as a very-late option.", staff_inclusivity: "Paris tourism lists Banana Café in the city's caring-venue network; check the current event's practical conditions directly.", source_urls: ["https://banana-cafe-paris.com/faq/?lang=fr", "https://parisjetaime.com/restaurant/banana-cafe-p684"], research_status: "current_official_and_destination_sources", updated_at: reviewedAt },
  }],
  [140, {
    description: "Raidd is the polished Marais bar where a drink can quickly become a programmed night: DJs, drag, theme parties and its long-running shower-show format all pull the room in after midnight. It is not a whisper-quiet neighbourhood pub, and that is the point. Start earlier for its terrace and happy hour; choose a named programme if you want the full late-night version rather than simply dropping in blind.",
    hours: "Sun–Thu 18:00–04:00; Fri–Sat 18:00–05:00. Daily happy hour until 22:00 (exceptions may apply).",
    location: "23 rue du Temple, 75004 Paris, France",
    link: "https://www.raiddbar.com/en/",
    venue_intel: { crowd_mix: "Marais regulars, visitors, drag fans and party groups; the room shifts from drinks-led early evening to a louder late-night crowd.", dress_code: "Smart, playful night-out style works, but there is no need to arrive in costume unless the current party calls for it.", queue_wait: "For a group table, the venue requires an online request at least 48 hours ahead; ordinary arrival is easier before the late programme.", best_nights: "A current drag, BFF, Safado or themed listing gives the clearest signal; the daily midnight show is the house's signature.", staff_inclusivity: "A dedicated gay-bar programme with current accessibility and booking details published by the venue; contact it directly for individual needs.", source_urls: ["https://www.raiddbar.com/en/", "https://raiddbar.com/fr/faq.html"], research_status: "current_official_source", updated_at: reviewedAt },
  }],
  [143, {
    description: "Le Dépôt is retained as a historical Paris nightlife reference, not a current recommendation. Recent 2026 specialist coverage says it closed during the Covid period and did not reopen. Do not plan a visit around it; use a current venue or party listing instead, since the point of a guide is to save a night rather than send someone to a shuttered door.",
    venue_intel: { crowd_mix: "Historical record only; no current guest mix is published.", dress_code: "Not applicable: the venue is not treated as an active destination.", queue_wait: "Do not travel there as a current venue; recent 2026 specialist coverage reports it did not reopen after Covid closure.", best_nights: "None. Choose a currently advertised Paris venue or party instead.", staff_inclusivity: "No current operating venue or service claim is made.", source_urls: ["https://www.misterbandb.com/gay-guide/france/paris/parties"], research_status: "current_specialist_source_reports_closed", closure_research_status: "reported_closed", updated_at: reviewedAt },
    seo_quality_status: "hold", seo_indexable: false,
  }],
];

for (const [id, patch] of updates) {
  const { data, error } = await supabase.from("places").select("venue_intel").eq("id", id).maybeSingle();
  if (error || !data) throw error || new Error(`Missing ${id}`);
  const next = { ...patch, venue_intel: { ...(data.venue_intel || {}), ...patch.venue_intel } };
  if (!APPLY) { console.log(`Would update ${id}`); continue; }
  const { error: updateError } = await supabase.from("places").update(next).eq("id", id);
  if (updateError) throw updateError;
  console.log(`Updated ${id}`);
}
