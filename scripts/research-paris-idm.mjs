import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const official = "https://idm-sauna.com/";
const reviews = "https://www.travelgay.com/venue/idm-sauna";
const currentReviews = "https://wanderlog.com/fr/place/details/2535736/idm-sauna";
const guide = "https://www.petitfute.com/v17231-17284-paris-75010/c1172-pense-fute-services/c1043-celibataires-club-de-rencontres/c204-agence-matrimoniale-club-de-rencontre/498183-idm-sauna.html";
const venue_intel = {
  queue_wait: "Arrive at the 12:00 opening—especially Thursday to Saturday—rather than treating IDM as a late-night walk-in. A visitor reports people still queuing from about 13:00 to 18:00 on a packed day, and a recent naturist-day review says to come early because it fills up. Admission cuts off at midnight Monday–Thursday and 00:20 Friday–Sunday.",
  best_nights: "Thursday, Friday or Saturday is the best choice if you want IDM's published naturist format; the second Friday of the month is the Black Out night. For a younger-leaning visit, Wednesday is the operator's under-25 day. Pick the theme rather than assuming every evening feels the same.",
  crowd_mix: "Expect a real cross-section rather than one narrow type: current reviews describe men roughly 25–50, mixed generations and many visitors alongside Paris regulars. Saturday daytime and night are specifically reported as drawing more young adults; holiday periods tend to add provincial and international guests.",
  dress_code: "Wear ordinary clothes to reception, then follow the evening's stated format inside. The Thursday–Saturday naturist sessions mean no towel around the waist; on other visits, do not assume that rule applies. IDM provides sauna, hammam, gym and play spaces across five levels, so bring only what you need for the part of the venue you will use.",
  staff_inclusivity: "The evidence is mixed, not a blanket safety claim. Recent reviews praise staff and a guard for calmly removing a threatening guest, while other 2025–26 reports describe abrupt reception or security treatment. If you need help, address the reception/security team directly; report any poor handling rather than relying on the venue's reputation.",
  source_urls: [official, reviews, currentReviews, guide],
  topic_evidence: {
    queue_wait: { status: "review_consensus", source_urls: [official, reviews, currentReviews], checked_at: "2026-09-30", source_excerpt: "Published admission cutoff plus first-person daytime queue and naturist-day crowd reports." },
    best_nights: { status: "verified", source_urls: [official, guide], checked_at: "2026-09-30", source_excerpt: "Operator schedule and guide list naturist and Black Out formats." },
    crowd_mix: { status: "review_consensus", source_urls: [reviews, currentReviews], checked_at: "2026-09-30", source_excerpt: "Recent reviews describe age range, visitors and Saturday mix." },
    dress_code: { status: "verified", source_urls: [official, guide], checked_at: "2026-09-30", source_excerpt: "Published naturist evenings and five-level facilities." },
    staff_inclusivity: { status: "review_consensus", source_urls: [currentReviews, reviews], checked_at: "2026-09-30", source_excerpt: "Contrasting 2025–26 visitor reports on staff and security." },
  },
  research_status: "venue_by_venue_current_operator_and_review_research",
  updated_at: "2026-09-30T20:20:00Z",
};
const { error } = await supabase.from("places").update({ venue_intel }).eq("id", 2215).eq("city", "paris");
if (error) throw error;
console.log("Updated IDM Sauna.");
