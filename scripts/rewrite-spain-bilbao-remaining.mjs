import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const entries = [
  {
    id: 2275,
    source: "https://hoteltheartist.com/",
    description: "Opposite the Guggenheim, The Artist Grand Hotel of Art is the polished Bilbao base for travellers who want the museum district on their doorstep. The mood is five-star and design-led rather than scene-led: think a proper hotel stay, a rooftop or restaurant reservation, and an easy walk to the river. Its published equality policy makes it a reassuring choice for LGBTQIA+ guests who prefer discreet, high-service comfort.",
    intel: {
      crowd_mix: "Museum visitors, couples, business travellers and guests on a high-comfort city break. It is LGBTQIA+ welcoming, not a gay-only hotel.",
      dress_code: "There is no published dress code. Smart-casual works well for the rooftop and dining spaces; everyday city clothes are fine elsewhere.",
      queue_wait: "Hotel check-in is the main arrival point. For a particular dining or rooftop plan, book it separately rather than assuming walk-in space.",
      best_nights: "Best when your Bilbao plan revolves around the Guggenheim, the river walk and dinner nearby. Check the hotel directly for current restaurant, rooftop and wellness hours.",
      staff_inclusivity: "The hotel publishes an LGBTQIA+ equality and anti-discrimination commitment. Contact reception before arrival for any specific accessibility or stay requirements.",
    },
  },
  {
    id: 3458,
    source: "https://saunaego.com/",
    description: "Sauna Ego is Bilbao's dedicated gay men's sauna: an adult, men-only space for switching off, meeting people and using the venue's wellness facilities. It is not a nightclub, and the atmosphere can change a lot between a quiet weekday session and a busy weekend. The useful move is to check its own site on the day for opening times, admission conditions and any event-specific information before setting out.",
    intel: {
      crowd_mix: "An adult gay and bisexual male clientele, with a mix of local regulars and visitors. This is a men-only venue.",
      dress_code: "Bring normal arrival clothes; sauna and house rules apply once inside. Confirm current rules directly with the venue if you are unsure.",
      queue_wait: "No reliable wait-time policy is published. Arrive with time to check in, especially on a weekend or holiday evening.",
      best_nights: "Weekend sessions are usually the better bet for a more social atmosphere, but the venue's current timetable is the source of truth.",
      staff_inclusivity: "This is explicitly a gay men's venue. For questions about access, facilities or rules, contact Sauna Ego before visiting rather than relying on third-party listings.",
    },
  },
  {
    id: 3459,
    source: "https://zinegoak.com/",
    description: "Zinegoak is Bilbao's queer film and performing-arts festival organisation, not a conventional all-day café. Its year-round work connects LGBTQIA+ cinema, artists and public conversation; during the festival, the programme spreads across partner venues around the city. Add it when you want culture with a point of view—screenings, talks and professional or community activity—then use the official programme to see what is actually on during your visit.",
    intel: {
      crowd_mix: "Queer film audiences, artists, activists, students and allies, with local Basque and visiting festival-goers in the mix.",
      dress_code: "No published dress code. Wear whatever is comfortable for a screening, talk or public event.",
      queue_wait: "The office is not the same thing as a festival venue. Popular screenings and events can require advance tickets; check the listing for the host venue and entry terms.",
      best_nights: "The strongest visit is a programmed screening or talk during the festival period. Outside it, follow Zinegoak's channels for year-round events and collaborations.",
      staff_inclusivity: "Zinegoak's work is explicitly centred on lesbian, gay, bisexual, trans and other queer stories and communities. Accessibility and language arrangements vary by event, so check each listing.",
    },
  },
  {
    id: 3638,
    source: "https://www.bilbaoturismo.net/",
    description: "Bizitza is listed as a gay-friendly stop in Bilbao's old town: a casual place to pause over a drink before carrying on through Casco Viejo. The attraction is its location in the historic centre, where wandering, pintxos and late conversation do most of the work. Treat it as an easy social waypoint rather than a destination with a fixed queer programme, and confirm current opening hours locally before you make a special trip.",
    intel: {
      crowd_mix: "A mixed old-town crowd of locals and visitors; it is included as gay-friendly rather than as a dedicated LGBTQIA+ venue.",
      dress_code: "Casual city clothes fit the setting. No formal code is documented.",
      queue_wait: "No dependable wait-time information is published. Terrace and table availability can change quickly in the old town.",
      best_nights: "Useful for an early drink or a relaxed pause while exploring Casco Viejo. Check locally for current hours and any one-off programming.",
      staff_inclusivity: "The available destination listing supports its gay-friendly positioning, but does not publish a detailed inclusion or accessibility policy. Ask the venue directly for specific needs.",
    },
  },
  {
    id: 3639,
    source: "https://lasinsorga.com/",
    description: "La Sinsorga is one of Bilbao's more interesting queer-adjacent cultural addresses: a feminist, multi-use house with food and drink alongside books, conversation and programming. Come for something with more substance than a quick bar stop—an afternoon coffee, a bite, an event, or simply the chance to sit in a space built around feminist culture. Its programme is the point, so look at the venue's calendar before choosing a day.",
    intel: {
      crowd_mix: "A mixed feminist, queer, cultural and neighbourhood audience. It is community-minded rather than a men-only or nightlife-only venue.",
      dress_code: "No dress code is published. Everyday clothes, creative layers or whatever makes you feel at ease all fit.",
      queue_wait: "Entry to the space is usually straightforward; ticketed talks, performances and special food events may have their own booking rules.",
      best_nights: "Choose a date with a programme item that interests you, or visit in daytime for a slower food-and-conversation stop. Confirm current hours and events through La Sinsorga.",
      staff_inclusivity: "The venue presents itself through feminist cultural work. For access needs, language or a particular event's format, contact it directly before going.",
    },
  },
  {
    id: 3640,
    source: "https://www.facebook.com/p/Santubear-Cafe-bar-100063602622131/",
    description: "The Santu Bear is Bilbao's bear-oriented bar option: a small, sociable stop for men into a more relaxed, furry-and-friendly corner of queer nightlife. Think drinks, conversation and music rather than a giant club production. It is a good place to arrive without a performance, whether you are a bear, cub, admirer or simply appreciate a low-pressure bar—just check its current social page before heading over, as hours can shift.",
    intel: {
      crowd_mix: "A bear, cub and admirer crowd, alongside friends and visitors who respect the bar's community. It is a queer social bar, not a members-only club.",
      dress_code: "Relaxed and personal: jeans, a tee, a shirt or leather details all make sense. No formal code is published.",
      queue_wait: "There is no published queue policy. On busy nights, expect a compact bar rather than a large venue with lots of spare space.",
      best_nights: "Weekend evenings are the likeliest time for a social atmosphere. Check the venue's current posts for opening days and special activity.",
      staff_inclusivity: "Its public identity is bear-focused and queer-friendly. Message the venue in advance for up-to-date access information or any particular requirement.",
    },
  },
  {
    id: 3642,
    source: "https://www.latroupe.com/en/hostel-la-granja/hostel/",
    description: "Latroupe La Granja brings a sociable hostel rhythm to a historic central Bilbao building. It suits queer travellers who want a well-located bed, a mix of private and shared accommodation, and the possibility of meeting people without booking into a gay hotel. The house is about practical city access and a more communal pace; check the current room format, event calendar and accessibility details before booking.",
    intel: {
      crowd_mix: "International hostel guests, solo travellers, friends and couples. It is LGBTQIA+ friendly, but it is not a queer-only property.",
      dress_code: "Casual traveller clothes are the norm. There is no published dress code.",
      queue_wait: "Reception handles check-in; timing can be busier around standard arrival periods. Confirm the current check-in process with the property if you arrive late.",
      best_nights: "A good choice when you want central Bilbao and the option of hostel-style social contact. Check Latroupe's own calendar for any current in-house activities.",
      staff_inclusivity: "The property presents itself as LGBTQIA+ friendly. Ask the team directly about room suitability, step-free access and any other specific stay need before reserving.",
    },
  },
];

for (const entry of entries) {
  const { data: current, error: readError } = await supabase
    .from("places")
    .select("id, venue_intel")
    .eq("id", entry.id)
    .maybeSingle();
  if (readError || !current) throw readError || new Error(`Missing ${entry.id}`);

  const patch = {
    description: entry.description,
    link: entry.source,
    venue_intel: {
      ...(current.venue_intel || {}),
      ...entry.intel,
      source_urls: [entry.source],
      research_status: "current_operator_or_destination_reference_reviewed",
      updated_at: checkedAt,
    },
  };
  if (!APPLY) { console.log(`Would update ${entry.id}`); continue; }
  const { error: updateError } = await supabase.from("places").update(patch).eq("id", entry.id);
  if (updateError) throw updateError;
  console.log(`Updated ${entry.id}`);
}
