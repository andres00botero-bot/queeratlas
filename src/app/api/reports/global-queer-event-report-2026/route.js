import { GLOBAL_QUEER_EVENT_REPORT_2026 } from "@/lib/seo/globalQueerEventReport2026";

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const report = GLOBAL_QUEER_EVENT_REPORT_2026;
  const headers = ["rank", "city", "country", "indexed_2026_events", "active_months", "linked_events", "route_ready_events", "route_ready_share", "first_event_date", "last_event_date", "methodology_version", "snapshot_date"];
  const rows = report.entries.map((entry) => [entry.rank, entry.cityName, entry.country, entry.events, entry.activeMonths, entry.linkedEvents, entry.routeReadyEvents, entry.routeReadyShare, entry.firstEventDate, entry.lastEventDate, report.methodologyVersion, report.snapshotAt.slice(0, 10)]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(`\uFEFF${csv}\r\n`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="queer-atlas-global-event-report-2026.csv"', "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } });
}
