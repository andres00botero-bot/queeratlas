"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getQariTier } from "@/lib/qari";
import { qariCountryPath } from "@/lib/qariRoutes";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function QariCityContextCard({ cityName, country, profile, localContext = "" }) {
  const { locale } = useLocale();
  if (!profile?.country || !Number.isFinite(profile?.score)) return null;

  const tier = profile.isQariV2 ? profile.tier : getQariTier(profile.score);
  const formattedScore = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(profile.score);
  const reviewedAt = profile.reviewedAt
    ? new Intl.DateTimeFormat(locale === "es" ? "es" : "en", { month: "short", year: "numeric" }).format(new Date(profile.reviewedAt))
    : "review date pending";
  const evidenceLabel = profile.isQariV2 ? "evidence graded" : `${profile.confidence} confidence`;

  return (
    <aside className="mb-5 rounded-[20px] border border-cyan-100/22 bg-[linear-gradient(135deg,rgba(34,211,238,0.11),rgba(16,24,36,0.66))] p-4 sm:p-5" aria-label={`QARI country context for ${cityName}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <ShieldCheck className="mt-0.5 shrink-0" size={21} style={{ color: tier.color }} aria-hidden="true" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-50/65">QARI country baseline</p>
            <h3 className="mt-1 text-base font-semibold text-white">{country} · {tier.label}</h3>
          </div>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1" style={{ borderColor: `${tier.color}66`, color: tier.color }}>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55">QARI score</span>
          <span className="text-xs font-semibold tabular-nums">{formattedScore}</span>
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/72">{profile.summary}</p>
      {localContext ? (
        <p className="mt-3 border-l-2 border-cyan-100/45 pl-3 text-sm leading-6 text-cyan-50/82">
          <span className="font-semibold text-white">{cityName} context: </span>{localContext}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/48">
        <p>{evidenceLabel} · reviewed {reviewedAt}</p>
        <Link href={qariCountryPath(country)} className="font-semibold text-cyan-100 transition hover:text-white">
          Sources, method &amp; limits →
        </Link>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/48">QARI is a country-level planning signal, not a promise of personal safety. Conditions can vary by neighbourhood, identity, time and current events.</p>
    </aside>
  );
}
