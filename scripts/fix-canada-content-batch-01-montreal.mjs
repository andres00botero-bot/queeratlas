import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    id: 3280,
    name: "Aigle Noir",
    city: "montreal",
    patch: {
      description: "Aigle Noir is the Village’s leather-bar pulse without the costume-party stiffness: a long-running, low-lit room for bears, leather regulars, friends on a bar crawl and anyone who wants their drink with a little more edge. Start on the terrace or at the bar, then let the mood get darker and more social as the night gathers speed.",
      vibe: "Village leather bar with terrace energy",
      hours: "Daily 08:00–03:00; verify holiday and event changes directly with the bar.",
      link: "https://www.aiglenoir.ca/",
      location: "1315 Rue Sainte-Catherine Est, Montréal, QC H2L 2H4, Canada",
      venue_intel: {
        queue_wait: "It operates as a walk-in bar rather than a ticketed club. Daytime and early evening are easier for a drink; expect the fuller room on late weekends and during any announced DJ or fetish-adjacent event.",
        best_nights: "Use the bar’s own social channel for the current DJ or theme-night calendar. Friday and Saturday late hours are the reliable choice for a denser, more flirt-forward room.",
        crowd_mix: "Gay men, leather and bear regulars, mature Village locals, visiting queer travellers and friends stopping in from Sainte-Catherine all share the room. It is gay-bar specific, not a members-only fetish club.",
        dress_code: "No standing dress code is published. Denim, boots, tees and leather all make sense here; wear gear only when the posted event explicitly calls for it.",
        staff_inclusivity: "The venue identifies itself as a Montréal gay bar and publishes direct contact details, but does not publish a detailed trans-inclusion, accessibility or incident-policy statement. Ask staff directly if a particular access or safety need matters to your visit.",
        source_urls: ["https://www.aiglenoir.ca/", "https://www.aiglenoir.ca/menu/"],
        research_status: "current_operator_channel_and_current_local_listing_verified",
        updated_at: checkedAt,
      },
    },
  },
  {
    id: 1885,
    name: "Le Saloon Bistro Bar",
    city: "montreal",
    patch: {
      description: "Le Saloon is where a Gay Village dinner can turn into a whole evening without trying too hard. It is a proper bistro first—comforting plates, cocktails and a terrace made for watching Sainte-Catherine perform—then a livelier social stop as happy hour and weekend tables fill. Come for food if you are hungry; stay because the room has that unforced Montréal glow.",
      vibe: "Gay Village bistro with terrace people-watching",
      hours: "Mon–Wed 17:00–23:00; Thu–Sat 17:00–00:00; Sun 17:00–23:00. Kitchen closes one hour before the restaurant; confirm holidays directly.",
      link: "https://lesaloon.ca/",
      venue_intel: {
        queue_wait: "Book dinner or arrive before the happy-hour rush, especially Thursday through Saturday. The terrace and prime dinner tables are the first to go in warmer weather; this is seated bistro traffic, not a nightclub queue.",
        best_nights: "Thursday to Saturday pair the strongest dinner-and-cocktail energy with the Village outside. Earlier weekdays are better when you want the same address with more space for conversation.",
        crowd_mix: "Village residents, queer couples and friend groups, dinner dates, happy-hour regulars and visitors mix in a notably social but not exclusively queer room.",
        dress_code: "Relaxed smart casual is perfect. You can arrive in a good tee and sneakers or make a night of it; no formal dress code is published.",
        staff_inclusivity: "It is a longstanding Gay Village business and is promoted in Montréal’s Village dining coverage. That supports queer familiarity, but the restaurant does not publish a detailed inclusion or accessibility policy; contact it directly for specific needs.",
        source_urls: ["https://lesaloon.ca/", "https://www.restomontreal.ca/resto/le-saloon-bistro-bar-montreal/1875/en/", "https://www.mtl.org/en/experience/where-eat-montreal-village"],
        research_status: "current_local_listing_and_destination_coverage_verified",
        updated_at: checkedAt,
      },
    },
  },
  {
    id: 2060,
    name: "Salon Daomé",
    city: "montreal",
    patch: {
      description: "Salon Daomé is Montréal nightlife for people who follow selectors, not bottle service. This intimate Saint-Laurent room keeps the focus on the booth, the sound and the dancers who came to actually move—more late-night living room than megaclub, with a distinctly local electronic-music heartbeat. It is queer-friendly in the way good underground rooms often are, but it is not a dedicated queer venue.",
      vibe: "Intimate selector-led Montréal dance room",
      hours: "Thu–Sat 22:30–03:00; closed Sun–Wed. Check the current programme before travelling.",
      link: "https://le-salon-daome.tickit.ca/",
      venue_intel: {
        queue_wait: "The room is small and programme-led. Get there near doors for a popular local or visiting selector; once a busy night settles in, the wait is less predictable than at a large club.",
        best_nights: "Choose the specific DJ, collective or party rather than a generic night. Thursday can feel more local and exploratory; Friday and Saturday usually bring the fuller dance-floor payoff.",
        crowd_mix: "House and techno regulars, DJs, music workers, Plateau and Mile End creatives, international electronic-music visitors and queer-friendly dance-floor people make up a mixed scene—not a guaranteed LGBTQ+-majority room.",
        dress_code: "There is no published code. Comfortable, expressive club clothes and shoes you can dance in fit better than formal bottle-service styling.",
        staff_inclusivity: "Salon Daomé publicly presents an open music-and-nightlife programme, but it does not publish a formal LGBTQ+ inclusion, accessibility or safeguarding policy. Treat its queer-friendly reputation as social context, not a substitute for venue-specific guarantees.",
        source_urls: ["https://le-salon-daome.tickit.ca/", "https://boulevardsaintlaurent.com/en/repertoire/le-salon-daome"],
        research_status: "current_operator_channel_and_local_destination_verified",
        updated_at: checkedAt,
      },
    },
  },
];

for (const update of updates) {
  const { data: row, error } = await supabase.from("places").select("id,name,city,venue_intel").eq("id", update.id).maybeSingle();
  if (error) throw error;
  if (!row || row.name !== update.name || row.city !== update.city) throw new Error(`Target changed: ${update.id}`);
  const patch = {
    ...update.patch,
    seo_indexable: true,
    seo_quality_status: "approved",
    venue_intel: { ...(row.venue_intel || {}), ...update.patch.venue_intel },
  };
  if (!APPLY) {
    console.log(JSON.stringify({ mode: "dry-run", id: update.id, name: update.name }, null, 2));
    continue;
  }
  const { data, error: updateError } = await supabase.from("places").update(patch).eq("id", update.id).eq("city", update.city).select("id");
  if (updateError) throw updateError;
  if (data.length !== 1) throw new Error(`Update affected ${data.length} rows: ${update.id}`);
  console.log(JSON.stringify({ mode: "applied", id: update.id, name: update.name }, null, 2));
}
