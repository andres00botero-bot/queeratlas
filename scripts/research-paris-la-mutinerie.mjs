import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const official = "https://www.lamutinerie.eu/";
const charter = "https://www.lamutinerie.eu/charte";
const programme = "https://www.lamutinerie.eu/copie-de-programme";
const recentReview = "https://lacarte.menu/restaurants/paris-1/la-mutinerie-8";
const communityReports = "https://www.reddit.com/r/SocialParis/comments/1f6c291/sos_la_mutinerie/";

const venue_intel = {
  queue_wait:
    "For a listed 20:30 event, be on Rue Saint-Martin by 19:45: recent attendees describe popular Mutinerie events as packed, with entry handled first-come, first-served once a line forms. There is no published minute-by-minute wait, so do not treat a 20:30 start as a 20:30 arrival.",
  best_nights:
    "Friday is the best bet for the proper late bar night: community reports identify Friday and Saturday DJ-set nights as the moments when the door is filtered because the small room fills. For the venue at its most distinctly Mutinerie, choose the specific drag, stand-up, workshop or screening on its live programme rather than a random weekday.",
  crowd_mix:
    "This is not a generic Marais tourist bar. The collective defines the room as made by and for women, lesbians, bi people, queer people, gay men and trans people; regular programming also brings Paris-based activist and cultural collectives. Visitors are welcome, but a Friday/Saturday non-mixte event may prioritise the announced community at the door.",
  dress_code:
    "There is no published club dress code. Go in the clothes that let you stay for the event—an August 2025 trans visitor reports ordering comfortably in ordinary clothes, while costume, makeup and glitter belong to specific drag/lip-sync nights rather than being an entry requirement. Check the event listing before dressing for a theme.",
  staff_inclusivity:
    "The collective's charter tells anyone facing harassment or discomfort to speak to the bar or door team, names racism, sexism, transphobia and classism as conduct it opposes, and asks guests to respect non-mixte events. Visitor reports are not uniform: some trans guests describe feeling safe, while others report difficult or exclusionary door interactions. Treat the programme's access rule as decisive for that night and raise a problem directly with the team.",
  source_urls: [official, charter, programme, recentReview, communityReports],
  topic_evidence: {
    queue_wait: {
      status: "review_consensus",
      source_urls: [communityReports, official],
      checked_at: "2026-09-30",
      source_excerpt: "Recent attendee discussion: busy events, first-come entry; operator confirms free entry and event programme.",
    },
    best_nights: {
      status: "multi_source_summary",
      source_urls: [programme, communityReports],
      checked_at: "2026-09-30",
      source_excerpt: "Live programme plus attendee reports identifying Friday/Saturday DJ-set filtering.",
    },
    crowd_mix: {
      status: "verified_policy",
      source_urls: [official, communityReports],
      checked_at: "2026-09-30",
      source_excerpt: "The collective states who the venue is for; community reports describe non-mixte event access.",
    },
    dress_code: {
      status: "multi_source_summary",
      source_urls: [recentReview, programme],
      checked_at: "2026-09-30",
      source_excerpt: "2025 visitor report plus event-specific costume/makeup guidance.",
    },
    staff_inclusivity: {
      status: "multi_source_summary",
      source_urls: [charter, recentReview, communityReports],
      checked_at: "2026-09-30",
      source_excerpt: "Published escalation procedure, alongside differing recent visitor accounts.",
    },
  },
  research_status: "venue_by_venue_current_operator_and_review_research",
  updated_at: "2026-09-30T20:05:00Z",
};

const { error } = await supabase
  .from("places")
  .update({ venue_intel })
  .eq("id", 1990)
  .eq("city", "paris");

if (error) throw error;
console.log("Updated La Mutinerie.");
