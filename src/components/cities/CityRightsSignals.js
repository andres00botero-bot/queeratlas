"use client";

import { ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";
import { getQariTier, QARI_MAP_PALETTE } from "@/lib/qari";
import { useLocale } from "@/components/i18n/LocaleProvider";

const FALLBACK_TIERS = QARI_MAP_PALETTE;

function confidenceLabel(value = "", t) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return t("qari.highConfidence", "High confidence");
  if (normalized === "low") return t("qari.limitedConfidence", "Limited confidence");
  return t("qari.mediumConfidence", "Medium confidence");
}

function reviewedLabel(value, locale, t) {
  if (!value) return t("qari.reviewPending", "Review date pending");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("qari.reviewPending", "Review date pending");
  const dateText = new Intl.DateTimeFormat(locale === "es" ? "es" : "en", { month: "short", year: "numeric" }).format(date);
  return t("qari.reviewed", "Reviewed {date}").replace("{date}", dateText);
}

function tierLabel(tier, t) {
  const labels = {
    lower: "qari.lowerRisk",
    lowerContext: "qari.lowerContext",
    moderate: "qari.moderate",
    high: "qari.highRisk",
    extreme: "qari.extremeHighRisk",
    unknown: "qari.pending",
  };
  return t(labels[tier?.key] || "qari.pending", tier?.label || "Pending");
}

function fallbackTierKey(riskTier) {
  return {
    open: "lower",
    steady: "lowerContext",
    watch: "moderate",
    caution: "high",
    restricted: "extreme",
  }[riskTier] || "unknown";
}

function statusLabel(value, t) {
  const labels = {
    legal: "qari.statusLegal",
    criminalized: "qari.statusCriminalized",
    restricted: "qari.statusRestricted",
    unknown: "qari.unknown",
    "marriage recognized": "qari.statusMarriageRecognized",
    "civil union / partnership": "qari.statusCivilUnion",
    "no legal recognition": "qari.statusNoLegalRecognition",
    available: "qari.statusAvailable",
    "not available": "qari.statusNotAvailable",
    "full coverage": "qari.statusFullCoverage",
    "partial coverage": "qari.statusPartialCoverage",
    "limited / none": "qari.statusLimitedNone",
  };
  const normalized = String(value || "").trim().toLowerCase();
  return labels[normalized] ? t(labels[normalized], value) : value;
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

function SourceLink({ source, t }) {
  const href = String(source?.url || "").trim();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/22 hover:text-white"
    >
      {source.label || source.axis || t("qari.source", "Source")}
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
  const { locale, t } = useLocale();
  if (!snapshot && !qariProfile) return null;
  const detailRows = [
    { key: "sameSexRelations", label: t("qari.sameSexRelations", "Same-sex relations") },
    { key: "unions", label: t("qari.unions", "Marriage / partnership") },
    { key: "genderRecognition", label: t("qari.genderRecognition", "Legal gender recognition") },
    { key: "antiDiscrimination", label: t("qari.antiDiscrimination", "Anti-discrimination law") },
  ];
  const axes = [
    { key: "legalRisk", label: t("qari.legal", "Legal"), detail: t("qari.legalDetail", "Laws, rights and restrictions"), weight: "35%" },
    { key: "socialRisk", label: t("qari.socialReality", "Social reality"), detail: t("qari.socialDetail", "Public climate and reported harm"), weight: "40%" },
    { key: "digitalRisk", label: t("qari.digitalEnforcement", "Digital & enforcement"), detail: t("qari.digitalDetail", "Apps, devices, police and censorship"), weight: "25%" },
  ];

  const score = Number.isFinite(qariProfile?.score) ? qariProfile.score : null;
  const qariTier = getQariTier(score);
  const fallbackTier = FALLBACK_TIERS[riskTier] || FALLBACK_TIERS.unknown;
  const tone = score === null ? fallbackTier : qariTier;
  const summary = qariProfile?.summary || snapshot?.whatThisMeans || t("qari.awaitingReview", "This destination is awaiting a full QARI review.");
  const panelId = `qari-details-${String(country || "destination").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div
      className="relative border-y border-white/[0.09]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-px"
        style={{ backgroundColor: `${tone.color}B8` }}
      />

      <div className="relative flex flex-col gap-3 py-4 pl-4 pr-1 sm:flex-row sm:items-center sm:gap-5 sm:py-4 sm:pl-5">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center"
            style={{ color: tone.color }}
          >
            <ShieldCheck size={22} strokeWidth={1.65} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{t("qari.safetySignal", "QARI safety signal")}</p>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: tone.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.color }} aria-hidden="true" />
                {tierLabel(score === null ? { key: fallbackTierKey(riskTier), ...tone } : qariTier, t)}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 max-w-3xl text-xs leading-5 text-white/56 sm:line-clamp-1">{summary}</p>
          </div>
        </div>

        <div className="ml-[3.125rem] flex shrink-0 items-center justify-between gap-4 sm:ml-0 sm:border-l sm:border-white/[0.08] sm:pl-5">
          <div className="flex items-baseline gap-1.5 sm:block sm:min-w-20 sm:text-right">
            <p className="text-lg font-semibold tabular-nums leading-none text-white">
              {score === null ? "—" : score}
              {score !== null ? <span className="text-[10px] font-medium text-white/34">/100</span> : null}
            </p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white/34">{t("qari.riskIndex", "Risk index")}</p>
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={onToggle}
            className="qa-action inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-3.5 text-xs font-semibold text-white/72 transition hover:border-white/24 hover:bg-white/[0.08] hover:text-white sm:min-h-10"
          >
            {expanded ? t("qari.close", "Close") : t("qari.safetyDetails", "Safety details")}
            <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div id={panelId} className="relative border-t border-white/[0.08] py-5 pl-4 pr-1 sm:pl-5">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0">
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">{t("qari.howBuilt", "How this score is built")}</p>
                  <p className="mt-1 text-sm leading-6 text-white/64">{t("qari.higherExposure", "Higher numbers mean greater traveller exposure.")}</p>
                </div>
                <p className="text-[10px] text-white/34">{t("qari.method", "Method")} v{qariProfile?.methodologyVersion || "1.0"}</p>
              </div>

              {qariProfile ? (
                <div className="mt-2">
                  {axes.map((axis) => (
                    <AxisRow key={axis.key} axis={axis} value={qariProfile[axis.key]} color={tone.color} />
                  ))}
                </div>
              ) : (
                <div className="mt-3 border-l border-amber-200/35 pl-3 text-sm leading-6 text-amber-50/72">
                  {t("qari.unverifiedScore", "A numerical QARI score has not been source-verified for {country} yet. The existing legal context remains visible below without inventing a number.").replace("{country}", country || t("qari.thisDestination", "this destination"))}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.08] pt-5 lg:ml-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">{t("qari.legalSnapshot", "Legal snapshot")}</p>
              <div className="mt-2 divide-y divide-white/8">
                {detailRows.map((row) => (
                  <div key={row.key} className="flex items-start justify-between gap-4 py-2.5">
                    <p className="text-xs text-white/52">{row.label}</p>
                    <p className="max-w-[55%] text-right text-xs font-medium leading-5 text-white/82">
                      {statusLabel(snapshot?.details?.[row.key] || t("qari.unknown", "Unknown"), t)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl text-[10px] leading-5 text-white/38">
              <p>{confidenceLabel(qariProfile?.confidence || snapshot?.confidence, t)} · {reviewedLabel(qariProfile?.reviewedAt || snapshot?.updatedAt, locale, t)}</p>
              <p>
              {t("qari.disclaimer", "QARI is a planning signal, not a promise of safety. Risk can change by neighbourhood, identity, time and current events.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(qariProfile?.sources || []).map((source, index) => (
                <SourceLink key={`${source.url}-${index}`} source={source} t={t} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
