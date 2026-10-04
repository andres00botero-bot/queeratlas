import Link from "next/link";
import { headers } from "next/headers";
import { QARI_COUNTRY_PROFILES } from "@/lib/qariCountryProfiles2026";
import { qariCountryPath } from "@/lib/qariRoutes";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";
import { normalizeLocale } from "@/lib/i18n/locales";
import { QA_ORGANIZATION_ID, QA_SITE_URL } from "@/lib/seo/entityAuthority";

const AXES = [
  ["Legal risk", "35%", "legalRisk"],
  ["Social reality", "40%", "socialRisk"],
  ["Digital & enforcement", "25%", "digitalRisk"],
];

export async function generateMetadata() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  const title = isSpanish ? "QARI: índice de riesgo queer por país" : "QARI: Queer Atlas Risk Index by Country";
  const description = isSpanish
    ? "Explora el índice transparente de Queer Atlas sobre riesgo legal, realidad social y riesgo digital para planificar viajes LGBTQ+."
    : "Explore Queer Atlas's transparent country-level LGBTQ+ travel signal for legal, social, digital and enforcement exposure.";
  return {
    title,
    description,
    keywords: ["QARI", "Queer Atlas Risk Index", "LGBTQ travel risk", "queer travel safety context"],
    alternates: localizedAlternates("/qari", locale),
    openGraph: { title, description, url: localizedOpenGraphUrl("/qari", locale), type: "website", siteName: "Queer Atlas" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function QariIndexPage() {
  const profiles = [...QARI_COUNTRY_PROFILES].sort((a, b) => a.country.localeCompare(b.country));
  const latestReview = profiles.reduce((latest, profile) => latest > profile.reviewedAt ? latest : profile.reviewedAt, "");
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${QA_SITE_URL}/qari#dataset`,
    name: "Queer Atlas Risk Index (QARI)",
    description: "Country-level LGBTQ+ travel-planning baselines combining legal risk, social reality, and digital and enforcement risk.",
    url: `${QA_SITE_URL}/qari`,
    creator: { "@id": QA_ORGANIZATION_ID },
    publisher: { "@id": QA_ORGANIZATION_ID },
    dateModified: latestReview,
    measurementTechnique: "QARI v1.0–v1.1 weighted risk model with documented risk floors",
    variableMeasured: AXES.map(([name, weight]) => ({ "@type": "PropertyValue", name, value: weight })),
    spatialCoverage: `${profiles.length} countries and territories represented by Queer Atlas destinations`,
    isAccessibleForFree: true,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_8%_12%,rgba(167,139,250,0.16),transparent_31%),#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[34px] border border-cyan-100/20 bg-[linear-gradient(135deg,rgba(14,45,63,0.94),rgba(31,27,66,0.92))] p-6 shadow-[0_28px_90px_rgba(5,15,28,0.4)] sm:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70">Queer Atlas trust layer</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">QARI: context before a trip becomes a risk.</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/72">The Queer Atlas Risk Index is a country-level travel-planning baseline. It combines documented legal risk, social reality, and digital and enforcement exposure. A higher score means greater documented exposure — never a verdict on people, places, or personal safety.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {AXES.map(([label, weight, key]) => (
              <article key={key} className="rounded-2xl border border-white/12 bg-black/15 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/48">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-50">{weight}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cities" className="rounded-full border border-cyan-100/30 bg-cyan-100/10 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-100/18">Open QARI map</Link>
            <a href="#method" className="rounded-full border border-white/16 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.1]">How QARI works</a>
          </div>
        </section>

        <section id="method" className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-white/12 bg-white/[0.035] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/62">Method</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">One baseline, three visible inputs.</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">QARI uses a fixed weighted formula and applies a documented floor where severe legal or enforcement conditions would otherwise be understated. Each published profile includes source links for legal, social and digital evidence.</p>
          </article>
          <aside className="rounded-[28px] border border-amber-100/18 bg-amber-100/[0.055] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">Limit</p>
            <p className="mt-2 text-sm leading-7 text-amber-50/78">Country data cannot predict a neighbourhood, a border interaction, an individual identity, or a changing event. Check current local and official guidance before travel.</p>
          </aside>
        </section>

        <section aria-labelledby="qari-countries-heading" className="rounded-[30px] border border-white/12 bg-white/[0.025] p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/58">Published profiles</p><h2 id="qari-countries-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{profiles.length} country and territory baselines</h2></div><p className="text-xs text-white/46">Select a country for sources, methodology and related city guides.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link key={profile.destinationKey} href={qariCountryPath(profile.country)} className="group rounded-[20px] border border-white/10 bg-black/15 p-4 transition hover:-translate-y-0.5 hover:border-cyan-100/35 hover:bg-cyan-100/[0.055]">
                <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-white group-hover:text-cyan-50">{profile.country}</h3><span className="text-sm font-semibold tabular-nums" style={{ color: profile.tier.color }}>{profile.score}/100</span></div>
                <p className="mt-1 text-xs font-medium" style={{ color: profile.tier.color }}>{profile.tier.label}</p>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/57">{profile.summary}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-white/38">{profile.confidence} confidence · v{profile.methodologyVersion}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
