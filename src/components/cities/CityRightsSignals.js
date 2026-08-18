"use client";

import { ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";
import { getQariTier } from "@/lib/qari";

const FALLBACK_TIERS = {
  open: { label: "Lower-risk context", color: "#3b82f6" },
  steady: { label: "Generally lower risk", color: "#22c55e" },
  watch: { label: "Context matters", color: "#facc15" },
  caution: { label: "Use caution", color: "#fb923c" },
  restricted: { label: "High caution", color: "#ef4444" },
  unknown: { label: "Not yet verified", color: "#64748b" },
};

const DETAIL_ROWS = [
  { key: "sameSexRelations", label: "Same-sex relations" },
  { key: "unions", label: "Marriage / partnership" },
  { key: "genderRecognition", label: "Legal gender recognition" },
  { key: "antiDiscrimination", label: "Anti-discrimination law" },
];

const AXES = [
  {
    key: "legalRisk",
    label: "Legal",
    detail: "Laws, rights and restrictions",
    weight: "35%",
  },
  {
    key: "socialRisk",
    label: "Social reality",
    detail: "Public climate and reported harm",
    weight: "40%",
  },
  {
    key: "digitalRisk",
    label: "Digital & enforcement",
    detail: "Apps, devices, police and censorship",
    weight: "25%",
  },
];

function confidenceLabel(value = "") {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return "High confidence";
  if (normalized === "low") return "Limited confidence";
  return "Medium confidence";
}

function reviewedLabel(value) {
  if (!value) return "Review date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Review date pending";
  return `Reviewed ${new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date)}`;
}

function AxisRow({ axis, value, color }) {
  return (
    <div className="grid gap-2 border-b border-white/8 py-3 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white/88">{axis.label}</p>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">{axis.weight}</span>
        </div>
        <p className="mt-0.5 text-xs leading-5 text-white/48">{axis.detail}</p>
      </div>
      <div className="flex items-center gap-3 sm:min-w-36">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 sm:w-20">
          <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
        <span className="w-12 text-right text-sm font-semibold tabular-nums text-white">{value}/100</span>
      </div>
    </div>
  );
}

function SourceLink({ source }) {
  const href = String(source?.url || "").trim();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
    >
      {source.label || source.axis || "Source"}
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

export default function CityRightsSignals({
  snapshot,
  qariProfile = null,
  country = "",
  riskTier = "",
  expanded = false,
  onToggle,
}) {
  if (!snapshot && !qariProfile) return null;

  const score = Number.isFinite(qariProfile?.score) ? qariProfile.score : null;
  const qariTier = getQariTier(score);
  const fallbackTier = FALLBACK_TIERS[riskTier] || FALLBACK_TIERS.unknown;
  const tone = score === null ? fallbackTier : qariTier;
  const summary = qariProfile?.summary || snapshot?.whatThisMeans || "This destination is awaiting a full QARI review.";
  const panelId = `qari-details-${String(country || "destination").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border bg-[linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.022))] shadow-[0_18px_58px_rgba(0,0,0,0.24)]"
      style={{ borderColor: `${tone.color}42` }}
    >
      <div
        className="pointer-events-none absolute -right-14 -top-20 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: `${tone.color}20` }}
      />

      <div className="relative flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-black/25"
            style={{ color: tone.color, borderColor: `${tone.color}55` }}
          >
            <ShieldCheck size={20} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">Queer Atlas Risk Index</p>
              <p className="text-sm font-semibold text-white">
                {score === null ? "QARI pending" : `QARI ${score}/100`}
              </p>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: tone.color, borderColor: `${tone.color}50`, backgroundColor: `${tone.color}16` }}
              >
                {tone.label}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 max-w-4xl text-xs leading-5 text-white/58">{summary}</p>
          </div>
        </div>

        <div className="ml-12 flex shrink-0 items-center justify-between gap-3 sm:ml-0 sm:border-l sm:border-white/8 sm:pl-4">
          <div className="text-[10px] leading-4 text-white/38">
            <p>{confidenceLabel(qariProfile?.confidence || snapshot?.confidence)}</p>
            <p className="hidden sm:block">{reviewedLabel(qariProfile?.reviewedAt || snapshot?.updatedAt)}</p>
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={onToggle}
            className="qa-action inline-flex min-h-9 items-center gap-2 rounded-full border border-white/14 bg-white/[0.065] px-3.5 text-xs font-semibold text-white/78 transition hover:border-white/28 hover:bg-white/10 hover:text-white sm:min-h-10"
          >
            {expanded ? "Close" : "Safety details"}
            <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div id={panelId} className="relative border-t border-white/10 bg-black/18 px-4 py-4 sm:px-5">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">How this score is built</p>
                  <p className="mt-1 text-sm leading-6 text-white/64">Higher numbers mean greater traveller exposure.</p>
                </div>
                <p className="text-[10px] text-white/34">Method v{qariProfile?.methodologyVersion || "1.0"}</p>
              </div>

              {qariProfile ? (
                <div className="mt-2">
                  {AXES.map((axis) => (
                    <AxisRow key={axis.key} axis={axis} value={qariProfile[axis.key]} color={tone.color} />
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-amber-200/16 bg-amber-200/[0.06] p-3 text-sm leading-6 text-amber-50/72">
                  A numerical QARI score has not been source-verified for {country || "this destination"} yet. The existing legal context remains visible below without inventing a number.
                </div>
              )}
            </div>

            <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">Legal snapshot</p>
              <div className="mt-2 divide-y divide-white/8">
                {DETAIL_ROWS.map((row) => (
                  <div key={row.key} className="flex items-start justify-between gap-4 py-2.5">
                    <p className="text-xs text-white/52">{row.label}</p>
                    <p className="max-w-[55%] text-right text-xs font-medium leading-5 text-white/82">
                      {snapshot?.details?.[row.key] || "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[11px] leading-5 text-white/40">
              QARI is a planning signal, not a promise of safety. Risk can change by neighbourhood, identity, time and current events.
            </p>
            <div className="flex flex-wrap gap-2">
              {(qariProfile?.sources || []).map((source, index) => (
                <SourceLink key={`${source.url}-${index}`} source={source} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
