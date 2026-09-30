import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    id: 68, name: "RICK'S",
    venue_intel: {
      queue_wait: "Rick's is usually a walk-in before 01:00. From 01:30 on Friday or Saturday, the small pre-club room can mean a 10–20 minute wait at the door or bar; go around midnight if you want the music and the room without being pressed into the crowd.",
      best_nights: "Thursday is the easy local warm-up. Friday and Saturday, 00:30–02:00, are the real Rick's hours: DJs, chart pop and a packed Chueca pre-club crowd, with enough time left to continue elsewhere before its 06:00 close.",
      crowd_mix: "Expect gay men across ages, visiting friends, couples on a bar crawl and solo travellers using it as their first Chueca room. The Casablanca/Moroccan décor, pool table and foosball give it a playful pub character before the DJ energy takes over.",
      dress_code: "Think late-night bar rather than exclusive club: fitted jeans, a good shirt or tee, trainers or boots all work. Bring the layer you want for later because Rick's is a pre-club launchpad, not a place to turn up in an elaborate costume.",
      staff_inclusivity: "Rick's is one of Chueca's long-running gay-night institutions and the room is built around a broad, sociable mix rather than a narrow scene. It does not present a detailed anti-transphobia policy; if a boundary or safety issue arises, speak to the bar team immediately rather than trying to manage it alone.",
      source_urls: ["https://chuecadiversa.es/en/guide/ricks/", "https://thegaypassport.com/venue/ricks/", "https://mytripnavi.com/gay/madrid.pdf"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 88, name: "Baranoa",
    venue_intel: {
      queue_wait: "Baranoa fills fast because Pelayo 31 is tiny. On Friday and Saturday after 22:30, expect 15–25 minutes to get through the door and another few minutes for a cocktail; arrive at 19:30–20:30 if you want a place to stand without guarding it all night.",
      best_nights: "Friday and Saturday, 20:00–22:00, deliver the best balance of tropical cocktails, salsa/reggaetón and room to move. Monday is surprisingly social after 21:00; Thursday is good when you want a night out without the full Saturday crush.",
      crowd_mix: "Baranoa pulls a young, mixed Chueca crowd: gay men, queer friends, local groups and visitors who want Latin and Spanish hits rather than a drag show. You come for the big margaritas, reggaetón, dancing and the unmistakably Caribbean bar energy.",
      dress_code: "Wear colourful, easy-to-dance-in bar clothes—jeans or shorts with a sharp top, trainers or boots, and enough confidence for a warm, packed room. This is a tropical cocktail bar; leather-uniform seriousness belongs elsewhere in Chueca.",
      staff_inclusivity: "The bar is visibly LGBTQ+ facing and its staff set a warm, high-energy tone behind the counter. The room can get densely packed, so keep your belongings close and flag problems early to the bartenders. It has no detailed published anti-transphobia protocol, which makes ordinary staff attentiveness especially important on packed nights.",
      source_urls: ["https://www.gomadridpride.com/en/listings/baranoa-bar/", "https://www.privateaser.es/local/50795-baranoa-bar", "https://www.patroc.com/gay/madrid/d/lakama-baranoa.html"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 368, name: "Fulanita de Tal",
    venue_intel: {
      queue_wait: "Fulanita's 80-person pub is easy at opening, then starts to pinch from 23:00 on Friday and Saturday. Allow 10–20 minutes at the door on a DJ, concert or Pride-adjacent date; come at 22:00 if you want the bar before it becomes a full women-led dance room.",
      best_nights: "Thursday at 22:00 is the smart first visit: enough buzz to hear the DJs, enough space to meet people. Friday and Saturday after 23:30 are for dancing; choose a listed Fulanita en Vivo concert when you want the venue at its most distinctive rather than merely busy.",
      crowd_mix: "Queer women are the centre of gravity—lesbians, bi women, trans and non-binary guests—alongside partners, friends and respectful allies. Live singers, resident DJs and a programme where most performers are women give the place more purpose than a generic 'girls' night'.",
      dress_code: "Wear whatever makes you feel good dancing in Chueca: denim, boots, trainers, a bright top, a date-night look or a full going-out outfit all land well. Nobody needs to dress to a masculine gay-bar template; the room is playful, social and led by its own crowd.",
      staff_inclusivity: "Fulanita has spent two decades building a women-centred LGBTQIQ+ space while opening its door to everyone who respects it. Its programming actively gives women performers the stage and ties nightlife to gender equality. That is a real inclusion signal, not just rainbow décor; protect the atmosphere by involving staff early if someone ignores boundaries.",
      source_urls: ["https://fulanitadetal.com/nuestros-locales/", "https://www.esmadrid.com/noche/fulanita-de-tal", "https://fulanitafest.com/"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 369, name: "LL Bar",
    venue_intel: {
      queue_wait: "LL has a door queue rather than a reservation list. Arrive at 22:00–22:15 for a normal 5–10 minute entry and drink before the show; Friday, Saturday and a popular queen's night can take 20–30 minutes from 23:00. Saturday tardeo at 19:00 is the easiest way in.",
      best_nights: "Any night works because there is a drag show every evening, but Saturday tardeo—doors 19:00, show 19:30–21:30—is the friendliest first visit. For the classic late room, come at 22:30 on Friday or Saturday and check the monthly cast before choosing your night.",
      crowd_mix: "The audience is a joyful mix of drag devotees, birthday groups, queer locals, first-time visitors, Spanish pop sing-along crews and anyone who wants a performance rather than just a drink. The venue has helped launch generations of Chueca queens, so the stage is the centre of attention.",
      dress_code: "LL genuinely lets you show up as yourself: casual jeans, glitter, drag-inspired looks and Saturday-afternoon clothes all fit. There is no VIP look to crack; make your outfit comfortable enough for standing, singing and dancing through a show.",
      staff_inclusivity: "LL makes an unusually direct promise that every kind of person belongs there, and backs it with a daily drag programme that celebrates visible queer expression. Staff manage paid entry with a drink included, not a selective list. That open-door stance is strong, although the site does not spell out a separate transphobia-reporting procedure.",
      source_urls: ["https://www.llshowbar.com/", "https://www.llshowbar.com/en/our-story"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 370, name: "Black & White Club",
    venue_intel: {
      queue_wait: "Black & White is easiest before midnight. Friday and Saturday, when the room runs until 06:00, plan for 15–25 minutes at the entrance from 00:30 onward; a weekday arrival at 23:15 is usually a faster 5–10 minute door-and-coat-check.",
      best_nights: "Friday or Saturday from 01:00 to 03:00 is the proper club version: commercial pop, the stage, LEDs and a fuller dance floor. Sunday–Thursday at 23:30 is better when you want the show's energy without the weekend compression. Check the nightly bill if a particular drag performer matters to you.",
      crowd_mix: "You find a broad LGBTQ+ dance crowd, drag-show fans, groups celebrating in Chueca and visitors wanting an unpretentious commercial-pop club. The room is more stage-and-hits than underground techno; people come to sing, watch and dance rather than perform cool detachment.",
      dress_code: "Go for club-ready rather than formal: clean trainers or boots, jeans, a fitted tee or shirt, sparkle if that is your mood. Black & White is a place to move under lights and stay late, so choose something breathable and danceable over a stiff dressed-up look.",
      staff_inclusivity: "The club's identity is rooted in LGBTQ+ nightlife, daily performances and an all-night mixed dance floor. It welcomes the broad Chueca scene rather than operating a men-only door. It does not publish a detailed anti-transphobia policy, so tell security or the bar immediately if anyone makes the space feel unsafe.",
      source_urls: ["https://www.esmadrid.com/chueca-noche", "https://www.worldrainbowhotels.com/wp-content/uploads/2022/02/Out-About-Westin-Palace-2024.pdf", "https://www.instagram.com/black.and.whitemadrid/"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z",
    },
  },
];

for (const update of updates) {
  if (!APPLY) { console.log(`Would update ${update.id}: ${update.name}`); continue; }
  const { data, error } = await client.from("places").select("venue_intel").eq("id", update.id).single();
  if (error) throw error;
  const { error: updateError } = await client.from("places").update({ venue_intel: { ...(data.venue_intel || {}), ...update.venue_intel } }).eq("id", update.id);
  if (updateError) throw updateError;
  console.log(`Updated ${update.id}: ${update.name}`);
}
