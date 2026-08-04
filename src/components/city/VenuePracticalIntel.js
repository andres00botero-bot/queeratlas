import { getVenueIntelLabels, normalizeVenueIntel } from "@/lib/venueIntel";

const EMPTY_VALUES = {
  queueWait: "No reliable queue pattern yet",
  bestNights: "Best night not confirmed yet",
  crowdMix: "Not enough crowd signal yet",
  dressCode: "No practical dress-code notes yet",
  staffInclusivity: "Not enough community feedback yet",
};

function formatResearchDate(value = "") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSourceLabel(value = "", index = 0) {
  try {
    const hostname = new URL(value).hostname.replace(/^www\./i, "");
    return hostname || `Source ${index + 1}`;
  } catch {
    return `Source ${index + 1}`;
  }
}

const EVIDENCE_LABELS = {
  verified: "Source verified",
  verified_policy: "Policy verified",
  community_signal: "Community signal",
  profile_summary: "Venue profile",
  source_summary: "Source summary",
  multi_source_summary: "Multi-source summary",
  review_consensus: "Review consensus",
  not_published: "Not published by source",
  source_unavailable: "Source unavailable",
};

const HIDDEN_EVIDENCE_STATUSES = new Set(["not_published", "source_unavailable"]);

export default function VenuePracticalIntel({ place, compact = false }) {
  const intel = normalizeVenueIntel(place);
  const rating = Number(place?.avgRating ?? place?.avg_rating);
  const reviewCount = Number(place?.reviewCount ?? place?.review_count ?? 0);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const labels = getVenueIntelLabels(place?.type);
  const researchDate = formatResearchDate(intel.updatedAt);
  const fields = [
    { key: "queueWait", label: labels.queueWait, value: intel.queueWait, evidence: intel.topicEvidence.queueWait },
    { key: "bestNights", label: labels.bestNights, value: intel.bestNights, evidence: intel.topicEvidence.bestNights },
    { key: "crowdMix", label: labels.crowdMix, value: intel.crowdMix, evidence: intel.topicEvidence.crowdMix },
    { key: "dressCode", label: labels.dressCode, value: intel.dressCode, evidence: intel.topicEvidence.dressCode },
    { key: "staffInclusivity", label: labels.staffInclusivity, value: intel.staffInclusivity, evidence: intel.topicEvidence.staffInclusivity },
    {
      key: "communityRating",
      label: "Community rating",
      value: hasRating ? `${rating.toFixed(1)} / 5` : "Not rated yet",
      detail: reviewCount > 0 ? `${reviewCount} community review${reviewCount === 1 ? "" : "s"}` : "Be the first to rate this venue",
      isKnown: hasRating,
    },
  ];
  const Heading = compact ? "h3" : "h2";

  return (
    <section className={compact ? "mt-4" : "rounded-[20px] border border-fuchsia-200/16 bg-[linear-gradient(145deg,rgba(244,114,182,0.08),rgba(34,211,238,0.05),rgba(10,10,10,0.96))] p-4 sm:rounded-[24px] sm:p-6"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/68">Venue intelligence</p>
          <Heading className={`${compact ? "mt-1 text-base" : "mt-1 text-lg"} font-semibold text-white`}>Know before you go</Heading>
        </div>
        <span className="hidden rounded-full border border-cyan-100/18 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-50/72 sm:inline-flex">
          Community + editorial
        </span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {fields.map((field) => {
          const hidesUnsupportedText = HIDDEN_EVIDENCE_STATUSES.has(field.evidence?.status);
          const isKnown = field.isKnown ?? Boolean(field.value && !hidesUnsupportedText);
          const value = hidesUnsupportedText ? EMPTY_VALUES[field.key] : field.value || EMPTY_VALUES[field.key];
          return (
            <div
              key={field.key}
              className={`rounded-2xl border px-3.5 py-3 ${isKnown ? "border-white/14 bg-white/[0.065]" : "border-white/10 bg-black/20"}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/48">{field.label}</p>
              <p className={`mt-1.5 text-sm leading-5 ${isKnown ? "text-white/90" : "text-white/48"}`}>{value}</p>
              {field.detail ? <p className="mt-1 text-[11px] text-white/46">{field.detail}</p> : null}
              {field.evidence?.status && !hidesUnsupportedText ? (
                <div className="mt-2 hidden flex-wrap items-center gap-2 text-[10px] text-cyan-50/58 sm:flex">
                  <span className="rounded-full border border-cyan-100/14 bg-cyan-200/[0.05] px-2 py-0.5">
                    {EVIDENCE_LABELS[field.evidence.status] || "Evidence checked"}
                  </span>
                  {field.evidence.sourceUrls[0] ? (
                    <a
                      href={field.evidence.sourceUrls[0]}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline decoration-cyan-100/25 underline-offset-2 hover:text-cyan-50"
                    >
                      View topic source
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-3 hidden text-[11px] leading-5 text-white/46 sm:block">
        Patterns can change by event and season. Recent community reports should always outweigh old venue notes.
      </p>

      {intel.sourceUrls.length > 0 ? (
        <details className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3">
          <summary className="cursor-pointer text-xs font-medium text-cyan-50/76">
            Reference links ({intel.sourceUrls.length}){researchDate ? ` · Updated ${researchDate}` : ""}
          </summary>
          <ul className="mt-2 space-y-1.5">
            {intel.sourceUrls.map((sourceUrl, index) => (
              <li key={sourceUrl}>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="break-all text-xs text-cyan-100/72 underline decoration-cyan-100/25 underline-offset-2 transition hover:text-cyan-50"
                >
                  {getSourceLabel(sourceUrl, index)}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
