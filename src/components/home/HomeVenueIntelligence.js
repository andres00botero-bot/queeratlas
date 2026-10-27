import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { citySelectionPath } from "@/lib/cityRouting";
import { normalizeVenueIntel } from "@/lib/venueIntel";
import { useLocale } from "@/components/i18n/LocaleProvider";

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

const EVIDENCE_ACTION_CLASS = "flex h-12 w-full sm:h-16 items-center justify-between gap-3 rounded-xl border border-[#80D4C4]/70 bg-[#80D4C4] px-4 text-sm font-semibold leading-5 text-[#0B1220] transition-colors hover:border-[#A4E6D8] hover:bg-[#A4E6D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]";

const QARI_COLORS = ["#3b82f6", "#22c55e", "#facc15", "#fb923c", "#ef4444"];

export default function HomeVenueIntelligence({ venue, onOpen, onContextOpen }) {
  const { t } = useLocale();
  const INDEX_LINKS = [
    { href: "/reports/queer-nightlife-index-2026", label: t("home.nightlife", "Nightlife") },
    { href: "/reports/global-queer-event-report-2026", label: t("home.events", "Events") },
    { href: "/reports/safest-queer-cities-2026", label: t("home.safety", "Safety") },
  ];
  const intelligence = normalizeVenueIntel(venue);
  const venueHref = citySelectionPath(venue?.city, { placeId: venue?.id });
  const proof = firstUsefulSentence(intelligence.queueWait || intelligence.bestNights || intelligence.crowdMix);
  const hasVenueExample = Boolean(venue?.name && proof);

  return (
    <section id="venue-intelligence" data-home-section="venue_intelligence" className="mt-1 scroll-mt-5 rounded-[24px] bg-[#0B1220] px-3 py-3 sm:px-6 sm:py-7">
      <div className="relative py-1 sm:py-5 lg:pb-7 lg:pt-2">
        <header className="relative z-10 border-b border-[#2B3949] pb-3 sm:pb-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#80D4C4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#80D4C4]" aria-hidden="true" />
              {t("home.trustHeading", "How Queer Atlas builds trust")}
            </p>
            <h2 className="qa-display mt-2 text-[1.45rem] sm:mt-3 font-semibold leading-tight tracking-[-0.035em] text-[#F5F1E8] sm:text-[2.15rem]">
              {t("home.trustTitle", "Evidence at every scale.")}
            </h2>
          </div>
        </header>

        <div className="relative z-10 mt-3 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-3">
          <article className="group flex min-w-0 flex-col rounded-[20px] border border-[#2B3949] bg-[#141E2C] p-4 transition-colors hover:border-[#52736F] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B9AAF0]">01 · {t("home.venueLevel", "Venue level")}</p>
              <span className="flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#67D4F1]/25 bg-[#67D4F1]/[0.12] text-[#67D4F1]" aria-hidden="true"><MapPin size={20} /></span>
            </div>
            <h3 className="mt-2 text-lg sm:mt-5 sm:text-xl font-semibold tracking-[-0.02em] text-[#F5F1E8]">{t("home.venueIntelligence", "Venue Intelligence")}</h3>
            <p className="mt-3 hidden text-sm leading-6 text-[#BCC7D2] sm:block">
              {t("home.venueIntelligenceDescription", "Queue patterns, best nights, crowd, practical dress code and inclusion—distilled from trusted sources, reviews and local knowledge.")}
            </p>
            <p className="mt-2 text-sm leading-5 text-[#BCC7D2] sm:hidden">{t("home.venueIntelligenceShort", "Practical venue tips, backed by sources.")}</p>

            <div className="mt-5 hidden sm:block border-l-2 border-[#80D4C4] pl-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold leading-5 text-[#80D4C4]">
                <Sparkles size={14} aria-hidden="true" />
                {hasVenueExample ? `${venue.name} · ${formatLabel(venue.city)}` : t("home.insideVenueProfile", "Inside a venue profile")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#F5F1E8]">
                {hasVenueExample ? proof : t("home.venueFallback", "See practical, source-backed context before choosing where to go.")}
              </p>
            </div>

            <div className="mt-auto flex items-start pt-3 sm:pt-6">
              <Link
                href={hasVenueExample ? venueHref : "/cities"}
                onClick={onOpen}
                className={EVIDENCE_ACTION_CLASS}
              >
                <span>{hasVenueExample ? t("home.viewVenueEvidence", "View venue evidence") : t("home.exploreVenueEvidence", "Explore venue evidence")}</span>
                <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="group flex min-w-0 flex-col rounded-[20px] border border-[#2B3949] bg-[#141E2C] p-4 transition-colors hover:border-[#52736F] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B9AAF0]">02 · {t("home.countryContext", "Country context")}</p>
              <span className="flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#80D4C4]/25 bg-[#80D4C4]/[0.12] text-[#80D4C4]" aria-hidden="true"><ShieldCheck size={20} /></span>
            </div>
            <div className="mt-2 flex items-center justify-between sm:mt-5 gap-3">
              <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] text-[#F5F1E8]">
                <span className="text-[#F5F1E8] sm:hidden">QARI</span>
                <span className="hidden sm:inline">{t("home.whatIsQari", "What is QARI?")}</span>
              </h3>
              <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                {QARI_COLORS.map((color) => (
                  <span key={color} className="h-2 w-2 rounded-full" style={{ backgroundColor: color, color }} />
                ))}
              </span>
            </div>
            <p className="mt-3 hidden text-sm leading-6 text-[#BCC7D2] sm:block">
              {t("home.qariDescription", "QARI measures country-level queer travel risk. Higher scores mean greater documented exposure; the highest verified dimension sets the risk level.")}
            </p>
            <p className="mt-2 text-sm leading-5 text-[#BCC7D2] sm:hidden">{t("home.qariShort", "Country-level queer travel risk, scored 0–100.")}</p>

            <div className="my-5 hidden border-l-2 border-[#80D4C4] pl-4 sm:block">
              <p className="text-xs font-semibold leading-5 text-[#80D4C4]">
                {t("home.qariDimensionsTitle", "Four evidence-graded risk dimensions")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#F5F1E8]">
                {t("home.qariDimensionsList", "Legal conditions · State repression · Digital exposure · Social & civil reality")}
              </p>
            </div>


            <div className="mt-auto flex items-start pt-3 sm:pt-6">
            <Link
              href="/qari"
              onClick={() => onContextOpen?.("/qari")}
              className={EVIDENCE_ACTION_CLASS}
            >
              <span>{t("home.exploreQariMap", "Explore the QARI world map")}</span><ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
            </Link>
            </div>
          </article>

          <article className="group flex min-w-0 flex-col rounded-[20px] border border-[#2B3949] bg-[#141E2C] p-4 transition-colors hover:border-[#52736F] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B9AAF0]">03 · {t("home.globalResearch", "Global research")}</p>
              <span className="flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#B9AAF0]/25 bg-[#B9AAF0]/[0.12] text-[#B9AAF0]" aria-hidden="true"><ChartNoAxesCombined size={20} /></span>
            </div>
            <div className="mt-2 flex flex-wrap items-center sm:mt-5 gap-3">
              <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] text-[#F5F1E8]">Queer Atlas Indexes</h3>
              <span className="hidden text-xs font-semibold text-[#D8BE8A] sm:inline">Flagship 2026</span>
            </div>
            <p className="mt-3 hidden text-sm leading-6 text-[#BCC7D2] sm:block">
              {t("home.globalIndexesDescription", "Compare cities and destinations through transparent, source-backed global research.")}
            </p>
            <p className="mt-2 text-sm leading-5 text-[#BCC7D2] sm:hidden">{t("home.globalIndexesShort", "Compare destinations through research.")}</p>

            <Link
              href="/reports/global-queer-safety-culture-index-methodology"
              onClick={() => onContextOpen?.("/reports/global-queer-safety-culture-index-methodology")}
              className="my-5 hidden sm:block border-l-2 border-[#D8BE8A] pl-4 transition-colors hover:bg-[#D8BE8A]/[0.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-6 text-[#D8BE8A]">Global Queer Safety &amp; Culture Index 2026</span>
                <ArrowUpRight size={16} className="mt-1 shrink-0 text-[#D8BE8A]" aria-hidden="true" />
              </span>
              <span className="mt-2 block text-xs leading-5 text-[#BCC7D2]">{t("home.legalProtection", "Legal protection 50% · Lived acceptance 50%")}</span>
            </Link>

            <nav aria-label={t("home.moreIndexes", "More Queer Atlas indexes")} className="mb-6 hidden sm:flex flex-wrap gap-x-4 gap-y-2">
              {INDEX_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onContextOpen?.(item.href)}
                  className="inline-flex min-h-11 items-center text-xs font-medium text-[#BCC7D2] underline decoration-[#52736F] underline-offset-4 transition-colors hover:text-[#80D4C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex items-start pt-3 sm:pt-6">
            <Link
              href="/now/data"
              onClick={() => onContextOpen?.("/now/data")}
              className={EVIDENCE_ACTION_CLASS}
            >
              <span>{t("home.allIndexes", "View all indexes & reports")}</span>
              <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
            </Link>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
}
