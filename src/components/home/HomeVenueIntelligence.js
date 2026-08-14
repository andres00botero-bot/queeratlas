import Link from "next/link";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { citySelectionPath } from "@/lib/cityRouting";
import { normalizeVenueIntel } from "@/lib/venueIntel";

function formatLabel(value = "") {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstUsefulSentence(value = "", limit = 165) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text;
  if (firstSentence.length <= limit) return firstSentence;
  const shortened = firstSentence.slice(0, limit + 1).replace(/\s+\S*$/, "").replace(/[,:;\s]+$/, "");
  return `${shortened}…`;
}

export default function HomeVenueIntelligence({ venue }) {
  const intelligence = normalizeVenueIntel(venue);
  const venueHref = citySelectionPath(venue?.city, { placeId: venue?.id });
  const proof = firstUsefulSentence(intelligence.queueWait || intelligence.bestNights || intelligence.crowdMix);

  if (!venue?.name || !proof) return null;

  return (
    <section className="mt-1">
      <div className="qa-atlas-section relative overflow-hidden rounded-[24px] border border-white/11 bg-[radial-gradient(circle_at_3%_25%,rgba(244,114,182,0.16),transparent_29%),radial-gradient(circle_at_94%_12%,rgba(34,211,238,0.14),transparent_27%),linear-gradient(135deg,rgba(17,13,29,0.98),rgba(6,11,21,0.99)_58%,rgba(7,9,16,0.99))] p-4 shadow-[0_24px_68px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-inset ring-fuchsia-100/[0.04] sm:p-5">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[0.72fr_1.3fr_auto] lg:items-center lg:gap-7">
          <div>
            <p className="qa-eyebrow flex items-center gap-2 !text-left text-[9px] font-semibold uppercase tracking-[0.22em] text-fuchsia-100/74">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-fuchsia-300 to-cyan-200 shadow-[0_0_12px_rgba(244,114,182,0.75)]" />
              Venue intelligence
            </p>
            <h2 className="qa-display mt-1.5 !text-left text-[1.65rem] font-semibold leading-none tracking-[-0.035em] text-white [hyphens:none] sm:text-[1.9rem]">
              Know before you go.
            </h2>
            <p className="mt-2 !text-left text-xs leading-5 text-white/56">
              Queue · best night · crowd · dress · inclusion
            </p>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_36px_rgba(0,0,0,0.16)]">
            <div className="pointer-events-none absolute inset-y-3 left-0 w-px bg-gradient-to-b from-fuchsia-200/15 via-cyan-200/55 to-transparent" />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="flex items-center gap-1.5 !text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-50/72">
                <MapPin size={11} aria-hidden="true" />
                {venue.name} · {formatLabel(venue.city)}
              </p>
              <span className="hidden text-white/20 sm:inline">|</span>
              <p className="flex items-center gap-1 !text-left text-[9px] uppercase tracking-[0.13em] text-fuchsia-100/46">
                <Sparkles size={10} aria-hidden="true" /> Real example
              </p>
            </div>
            <p className="mt-1.5 line-clamp-2 !text-left text-[13px] leading-5 text-white/86 [hyphens:none] sm:line-clamp-none">
              {proof}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
            <p className="rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 !text-left text-[9px] uppercase tracking-[0.13em] text-white/42">
              {intelligence.sourceUrls.length > 0 ? `${intelligence.sourceUrls.length} sources checked` : "Evidence checked"}
            </p>
            <Link
              href={venueHref}
              className="qa-action inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-100/32 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(217,70,239,0.12))] px-4 py-2 text-xs font-medium text-cyan-50/90 shadow-[0_10px_28px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:-translate-y-px hover:border-cyan-100/48 hover:text-white"
            >
              Explore intelligence
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
