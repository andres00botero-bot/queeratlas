import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const updates = [
  {
    id: 345,
    source_urls: ["https://edentorremolinos.com/", "https://www.tripadvisor.co.uk/Restaurant_Review-g187440-d7002469-Reviews-Eden_Beach_Club-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html"],
    queue_wait: "For a walk-in sunbed, be outside before the 10:00 opening: the small unreserved row is taken quickly. Lunch tables and Balinese beds fill before midday in summer; without a booking, expect 15–30 minutes or a later sitting. Service moves at beach pace once the terrace is full.",
    best_nights: "Sunday from 14:00 to sunset is Eden’s sweet spot—DJ music, cocktails and a full adults-only beach crowd without the pressure of an indoor club. For the peaceful version, arrive weekday at 10:00, take breakfast, then stay through the first swim and lunch.",
    crowd_mix: "Eden is where Torremolinos’ beach crowd spends the day: queer couples, groups of friends, solo sunseekers, locals on a long lunch and visitors heading up to La Nogalera later. The mood is Mediterranean and social, with loungers, food and music sharing the same space.",
    dress_code: "Wear swimwear, sandals and a proper cover-up. You will be moving between sunbeds, the restaurant and the promenade, so a loose shirt, shorts, kaftan or easy dress is more useful than arriving dressed for a nightclub. Change into dry resort clothes for dinner after 18:00.",
    staff_inclusivity: "Eden is visibly LGTBQI+ and adults-only, with a mixed queer crowd rather than a men-only scene. The team is warm when they have time, but this is a busy beach operation: reserve what matters, state your needs clearly at arrival and sort out any seating problem immediately. That is the difference between a smooth Eden day and feeling overlooked."
  },
  {
    id: 350,
    source_urls: ["https://saunaapolo.com/", "https://www.gayout.com/es/europe/spain/torremolinos/saunas/apolo-sauna-torremolinos"],
    queue_wait: "Reception is usually quick, with a locker, towel, soap and flip-flops handed over at entry. Saturday from 17:00 to 19:00 is the point to allow 10–15 minutes; Tuesday also gets busier because of the reduced 18–25 entry. Arrive at 15:00 for the cleanest, least rushed start.",
    best_nights: "Saturday 17:00–21:00 is the most active regular session. Sunday is the long-play option: in July and August Apolo opens at 07:00, so late morning gives you a fuller crowd without waiting for evening. Tuesday works well for a younger mix.",
    crowd_mix: "Apolo brings together men across a wide age range: local regulars, holiday visitors, younger Tuesday guests and men who want a proper sauna rather than just a darkroom. The two-floor layout lets you move between steam, sauna, jacuzzi, bar, cabins and the play areas at your own pace.",
    dress_code: "Come in simple street clothes and leave the rest to reception. The entry kit covers the practical side; inside, use the supplied flip-flops, keep your towel with you in shared areas and follow the sauna’s hygiene and consent etiquette.",
    staff_inclusivity: "Apolo’s reception staff make first-time guests comfortable, including visitors who do not speak Spanish, and they give you the essentials without making a fuss. The sauna is adult, male and direct—but it is not a free-for-all: be clear about your boundaries and bring staff in early if another guest crosses them."
  },
  {
    id: 1050,
    source_urls: ["https://barkikotorremolinos.com/"],
    queue_wait: "Kiko is tiny, so the wait is for a stool or a place at the bar, never a nightclub rope. Arrive at 20:00 or before 21:30 for immediate service; on Friday and Saturday, a 10–15 minute wait at the bar is normal once Mark’s regulars settle in. Closed Monday.",
    best_nights: "Thursday to Sunday from 20:30 is when Kiko feels most like itself: disco, Motown, 80s, 90s and current pop, with people stopping after the beach or before La Nogalera. Choose a Sunday evening if you want the same warmth at a softer pace.",
    crowd_mix: "This is a real mixed local bar: gay and straight friends, expats, holidaymakers, long-time Torremolinos regulars, couples and solo visitors. You come here because you want to be recognised by the end of the night, not because you need a giant dance floor.",
    dress_code: "Kiko is forgiving: shorts, jeans, a tee, a casual shirt, boots or trainers all feel right. Wear what you would choose for a good pub night; leather and bolder looks are welcome in the area, but nobody is performing a dress code here.",
    staff_inclusivity: "Mark is the reason Kiko feels personal. He runs the bar, speaks fluent Spanish, knows the town and has hosted locals and visitors since 2019. LGBTQ+ guests, straight friends and solo travellers all get the same relaxed welcome; say hello at the bar and he will make the room feel less anonymous."
  },
  {
    id: 1053,
    source_urls: ["https://crewsbar.com/about", "https://www.tripadvisor.es/Attraction_Review-g187440-d33226789-Reviews-Crews-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html"],
    queue_wait: "There is no formal queue at Crews. Happy hour, 20:00–22:00, is the easiest time to arrive and get served; from 22:30 on Friday and Saturday the inside bar and terrace can take 10–15 minutes. Sunday starts at 16:00, making it the quickest day for a first visit.",
    best_nights: "Sunday 16:00–19:00 is Crews’ signature slot: the All or Nothing session is social, sunny and much less rushed than the late night. For the classic bar mood, go Friday or Saturday at 21:00, stay through happy hour and decide later whether to continue into La Nogalera.",
    crowd_mix: "Crews is a men-focused bar with bears, fetish-friendly regulars, couples and solo holiday visitors in the mix. The energy is flirtatious and masculine but sociable; it works as a place to talk and meet people, not just to pass through on the way to a cruise club.",
    dress_code: "Casual masculine barwear fits best: fitted tee, shorts or jeans, boots or trainers, with harness or fetish details when the night leans that way. Keep it suited to a public bar until a listed theme tells you otherwise.",
    staff_inclusivity: "David and Javi give Crews its character. They remember people, make solo visitors feel included and keep the bear/fetish crowd friendly rather than closed-off. It is an adult men’s space, so be straightforward about your boundaries; the staff are visible and easy to approach when you need them."
  }
];

for (const update of updates) {
  const { data, error } = await supabase.from("places").select("name, venue_intel").eq("id", update.id).single();
  if (error) throw error;
  if (!APPLY) { console.log(`Would update ${update.id}: ${data.name}`); continue; }
  const { error: updateError } = await supabase.from("places").update({ venue_intel: { ...data.venue_intel, ...update, research_status: "individually_researched_external_sources_batch_01", updated_at: "2026-09-30T00:00:00Z" } }).eq("id", update.id);
  if (updateError) throw updateError;
  console.log(`Updated ${update.id}: ${data.name}`);
}
