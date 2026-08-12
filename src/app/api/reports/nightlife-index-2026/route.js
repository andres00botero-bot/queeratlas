import { NIGHTLIFE_INDEX_2026 } from "@/lib/seo/nightlifeIndex2026";

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const index = NIGHTLIFE_INDEX_2026;
  const headers = [
    "rank",
    "city",
    "country",
    "total_score",
    "nightlife_depth_score",
    "scene_diversity_score",
    "event_momentum_score",
    "venue_intelligence_score",
    "route_readiness_score",
    "community_evidence_score",
    "eligible_nightlife_places",
    "indexed_2026_events",
    "eligible_community_reviews",
    "methodology_version",
    "snapshot_date",
  ];
  const rows = index.entries.map((entry) => [
    entry.rank,
    entry.city,
    entry.country,
    entry.score,
    entry.scores.depth,
    entry.scores.diversity,
    entry.scores.events,
    entry.scores.intelligence,
    entry.scores.route,
    entry.scores.community,
    entry.places,
    entry.events,
    entry.reviews,
    index.methodologyVersion,
    index.snapshotAt,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="queer-atlas-nightlife-index-2026.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
