import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const sourceUrls = [
  "https://cox.fr/",
  "https://www.sortiraparis.com/en/where-to-eat-in-paris/bars-cafes/articles/345904-le-cox-the-lgbt-bar-in-the-marais-thats-turning-up-the-heat-in-paris",
  "https://www.tripadvisor.com/Attraction_Review-g187147-d267705-Reviews-Le_Cox-Paris_Ile_de_France.html",
  "https://www.petitfute.com/v17231-17299-paris-75004/c1169-s-amuser-sortir/c182-bar-cafe/498033-le-cox/tous-les-avis.html",
];

const venue_intel = {
  queue_wait: "Cox does not sell tickets or run a guest list. On an ordinary visit the door is usually immediate; arrive before 20:00 if you want to order and talk without the late-happy-hour crush around the small bar and pavement terrace.",
  best_nights: "Thursday is the best first-night choice: the 17:00–22:00 happy hour still feels social, while Friday tends to be the louder, more tightly packed continuation of the Marais crawl.",
  crowd_mix: "Locals use Cox as a regular Marais meeting point; visitors are very visible too, especially at the pavement edge. Recent travel coverage explicitly describes both, while reviews mention French, Scottish and English groups mixing around the bar.",
  dress_code: "There is no announced door code. In practice, reviews describe young professionals dressing down; think fitted everyday city clothes and shoes you can stand in, not a fetish look or a formal Paris dinner outfit.",
  staff_inclusivity: "Do not treat Cox as reliably all-gender-inclusive: 2024 review reports describe women and trans guests being asked to leave, while other recent reviews describe professional or friendly bar staff. If that affects your visit, ask at the door before ordering rather than relying on its LGBT label.",
  source_urls: sourceUrls,
  topic_evidence: {
    queue_wait: { status: "multi_source_summary", source_urls: [sourceUrls[0], sourceUrls[2]], checked_at: "2026-09-30", source_excerpt: "No guest list published; reviews describe a small, crowded bar with most guests spilling outside." },
    best_nights: { status: "source_summary", source_urls: [sourceUrls[0], sourceUrls[1]], checked_at: "2026-09-30", source_excerpt: "Daily happy hour to 22:00; current coverage identifies the late-evening terrace/DJ rhythm." },
    crowd_mix: { status: "multi_source_summary", source_urls: [sourceUrls[1], sourceUrls[2]], checked_at: "2026-09-30", source_excerpt: "Current coverage names locals and visitors; reviews identify mixed French and international groups." },
    dress_code: { status: "review_consensus", source_urls: [sourceUrls[2]], checked_at: "2026-09-30", source_excerpt: "Review describes young professionals dressing down; operator publishes no code." },
    staff_inclusivity: { status: "review_consensus", source_urls: [sourceUrls[2], sourceUrls[3]], checked_at: "2026-09-30", source_excerpt: "Recent reviews are mixed and include reports of exclusion of women/trans guests." },
  },
  research_status: "venue_by_venue_current_operator_and_review_research",
  updated_at: "2026-09-30T18:00:00Z",
};

const { error } = await supabase.from("places").update({ venue_intel }).eq("id", 99).eq("city", "paris");
if (error) throw error;
console.log("Updated Cox with venue-by-venue research.");
