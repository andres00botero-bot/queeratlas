import { SAFETY_INDEX_2026 } from "@/lib/seo/safetyIndex2026";

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const index = SAFETY_INDEX_2026;
  const headers = [
    "rank", "city", "country", "total_score", "legal_baseline_score", "rights_protection_score",
    "safety_context_score", "source_confidence_score", "venue_welcome_score", "route_readiness_score",
    "fallback_depth_score", "eligible_nightlife_places", "welcome_evidence_records", "route_ready_places",
    "country_profile_sources", "country_profile_confidence", "methodology_version", "snapshot_date",
  ];
  const rows = index.entries.map((entry) => [
    entry.rank, entry.city, entry.country, entry.score, entry.scores.legal, entry.scores.rights,
    entry.scores.safety, entry.scores.evidence, entry.scores.welcome, entry.scores.route,
    entry.scores.fallback, entry.places, entry.welcomeEvidence, entry.routeReadyPlaces,
    entry.sourceCount, entry.confidence, index.methodologyVersion, index.snapshotAt,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(`\uFEFF${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="queer-atlas-safety-readiness-index-2026.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
