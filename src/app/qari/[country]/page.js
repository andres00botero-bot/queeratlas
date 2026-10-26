import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { QARI_PUBLIC_PROFILES } from "@/lib/qariPublicProfiles";
import { getQariProfileBySlug, qariCountryPath, qariCountrySlug } from "@/lib/qariRoutes";
import { listCityRegistry } from "@/lib/server/cityRegistry";
import { localePath, localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";
import { normalizeLocale } from "@/lib/i18n/locales";
import { QA_ORGANIZATION_ID, QA_SITE_URL } from "@/lib/seo/entityAuthority";

const AXES = [
  ["Legal risk", "legalRisk", "35%", "Laws, rights and restrictions"],
  ["Social reality", "socialRisk", "40%", "Public climate and documented lived conditions"],
  ["Digital & enforcement", "digitalRisk", "25%", "Apps, devices, censorship and enforcement context"],
];
const V2_AXES = [
  ["Legal conditions", "legal", "Laws, formal restrictions and statutory penalties"],
  ["State repression", "stateRepression", "Documented actions by police, prosecutors, courts or other authorities"],
  ["Digital exposure", "digitalExposure", "LGBTIQ+-specific digital targeting, surveillance and restrictions"],
  ["Social & civil reality", "socialCivil", "Violence, reporting, protection and civil-society conditions"],
];

export const revalidate = 600;

export function generateStaticParams() {
  return QARI_PUBLIC_PROFILES.map((profile) => ({ country: qariCountrySlug(profile.country) }));
}

export async function generateMetadata({ params }) {
  const { country } = await params;
  const profile = getQariProfileBySlug(country);
  if (!profile) return { title: "QARI profile not found", robots: { index: false, follow: false } };
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const isSpanish = locale === "es";
  const canonical = qariCountryPath(profile.country);
  const title = isSpanish ? `QARI ${profile.country}: contexto de riesgo LGBTQ+` : `QARI ${profile.country}: LGBTQ+ Travel Risk Context`;
  const description = isSpanish
    ? `QARI para ${profile.country}: señal transparente de riesgo legal, realidad social y contexto digital para planificar viajes LGBTQ+.`
    : `QARI for ${profile.country}: a transparent LGBTQ+ travel-planning signal for legal, social, digital and enforcement exposure.`;
  return {
    title,
    description,
    keywords: [`${profile.country} LGBTQ travel`, `${profile.country} queer travel safety`, "QARI", "Queer Atlas Risk Index"],
    alternates: localizedAlternates(canonical, locale),
    openGraph: { title, description, url: localizedOpenGraphUrl(canonical, locale), type: "article", siteName: "Queer Atlas" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function QariCountryPage({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const { country } = await params;
  const profile = getQariProfileBySlug(country);
  if (!profile) notFound();
  const isQariV2 = Boolean(profile.isQariV2);
  const cities = (await listCityRegistry({ indexableOnly: true })).filter((city) => city.country.toLowerCase() === profile.country.toLowerCase());
  const canonical = qariCountryPath(profile.country);
  const canonicalUrl = `${QA_SITE_URL}${localePath(canonical, locale)}`;
  const faq = [
    { question: `What does QARI say about ${profile.country}?`, answer: isQariV2 ? `QARI 2.0 records a ${profile.tier.label.toLowerCase()} country-level risk profile. Its headline is set by the highest verified dimension, not an average.` : `QARI records a ${profile.tier.label.toLowerCase()} country-level baseline of ${profile.score} out of 100. Higher numbers mean greater documented exposure, not a personal-safety verdict.` },
    { question: isQariV2 ? "How is this profile built?" : "How is this score built?", answer: isQariV2 ? "QARI 2.0 evaluates legal conditions, state repression, digital exposure, and social and civil reality separately. Evidence grades and sources are visible for every rule that sets the profile." : "The published score combines legal risk (35%), social reality (40%), and digital and enforcement risk (25%). A documented risk floor can raise, but never lower, the result." },
    { question: "Can this score describe every city or traveller?", answer: "No. National averages can conceal local variation. Use the linked city guides and current local or official advice alongside this baseline." },
  ];
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${canonicalUrl}#dataset`,
    name: `QARI country profile: ${profile.country}`,
    description: profile.summary,
    url: canonicalUrl,
    creator: { "@id": QA_ORGANIZATION_ID },
    publisher: { "@id": QA_ORGANIZATION_ID },
    dateModified: profile.reviewedAt,
    measurementTechnique: `QARI v${profile.methodologyVersion}${isQariV2 ? " non-compensatory evidence-graded profile" : ""}`,
    spatialCoverage: profile.country,
    variableMeasured: (isQariV2 ? V2_AXES : AXES).map(([name, key, weightOrDescription, legacyDescription]) => ({ "@type": "PropertyValue", name, value: isQariV2 ? profile.dimensions?.[key]?.level : profile[key], unitText: isQariV2 ? `${profile.dimensions?.[key]?.availability || "unknown"} evidence availability` : `risk score / 100; weight ${weightOrDescription}`, description: isQariV2 ? weightOrDescription : legacyDescription })),
    isAccessibleForFree: true,
  };
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,rgba(34,211,238,0.15),transparent_30%),radial-gradient(circle_at_10%_8%,rgba(251,191,36,0.11),transparent_30%),#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/qari" className="inline-flex min-h-11 items-center text-xs font-semibold text-cyan-100 transition hover:text-white">← All QARI country profiles</Link>
        <section className="rounded-[34px] border border-cyan-100/22 bg-[linear-gradient(135deg,rgba(13,48,66,0.94),rgba(29,25,64,0.94))] p-6 shadow-[0_28px_90px_rgba(5,15,28,0.4)] sm:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/72">QARI country baseline · method v{profile.methodologyVersion}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{profile.country}</h1><p className="mt-3 text-lg font-semibold" style={{ color: profile.tier.color }}>{profile.tier.label}</p></div><p className="text-2xl font-semibold tracking-[-0.04em]" style={{ color: profile.tier.color }}>{isQariV2 ? "Risk level" : <>{profile.score}<span className="text-lg text-white/52">/100</span></>}</p></div>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">{profile.summary}</p>
          <p className="mt-4 text-xs leading-5 text-white/50">{isQariV2 ? "The highest verified dimension sets this level. This is a planning signal, not a promise of safety." : "Higher numbers mean greater documented traveller exposure. This is a planning signal, not a promise of safety."}</p>
        </section>

        <section className="rounded-[30px] border border-white/12 bg-white/[0.03] p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/62">{isQariV2 ? "Risk dimensions" : "Score components"}</p>{isQariV2 ? <><p className="mt-2 max-w-3xl text-sm leading-7 text-white/63">The headline level is determined by the highest verified dimension. Lower risks in other dimensions do not offset critical exposure.</p><div className="mt-5 grid gap-4 md:grid-cols-2">{V2_AXES.map(([label, key, description]) => { const dimension = profile.dimensions?.[key]; return <article key={key} className="rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-semibold text-white">{label}</h2><span className="text-xs font-semibold" style={{ color: profile.tier.color }}>{dimension?.level || "Unknown"}</span></div><p className="mt-2 text-xs text-white/48">{description}</p><p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-white/38">{dimension?.availability || "unknown"} evidence · {(dimension?.triggeredRules || []).join(", ") || "No qualifying rule"}</p></article>; })}</div></> : <div className="mt-5 grid gap-4 md:grid-cols-3">{AXES.map(([label, key, weight, description]) => (<article key={key} className="rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-semibold text-white">{label}</h2><span className="text-xs font-semibold" style={{ color: profile.tier.color }}>{profile[key]}/100</span></div><p className="mt-2 text-xs text-white/48">{weight} of total · {description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${profile[key]}%`, backgroundColor: profile.tier.color }} /></div></article>))}</div>}</section>

        <section className="rounded-[30px] border border-white/12 bg-white/[0.03] p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/62">Sources and review</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/62"><p>{isQariV2 ? "Evidence-graded" : `${profile.confidence} confidence`}</p><p>Reviewed {profile.reviewedAt}</p>{isQariV2 ? <p>Next review {profile.nextReviewAt}</p> : <p>{profile.reviewedBy || "Queer Atlas editorial desk"}</p>}</div><div className="mt-5 flex flex-wrap gap-2">{profile.sources.map((source) => (<a key={`${source.axis}-${source.url}`} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-100/20 bg-cyan-100/[0.06] px-3 py-1.5 text-xs text-cyan-50/80 transition hover:border-cyan-100/45 hover:text-white">{source.label} <span className="text-white/42">· {source.axis}</span></a>))}</div></section>

        <section className="rounded-[30px] border border-white/12 bg-white/[0.03] p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/62">Atlas city guides</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Local context can change the plan.</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-white/63">QARI remains a country baseline. These guides add local route and community context; they do not overwrite national legal or enforcement conditions.</p>{cities.length > 0 ? <div className="mt-5 flex flex-wrap gap-2">{cities.map((city) => <Link key={city.key} href={`/${city.key}`} className="rounded-full border border-white/14 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-cyan-100/35 hover:text-cyan-50">{city.name || city.title.replace(/^Queer\s+/i, "")}</Link>)}</div> : <p className="mt-4 text-sm text-white/50">A local Atlas guide is not published yet.</p>}</section>

        <section className="rounded-[30px] border border-amber-100/18 bg-amber-100/[0.055] p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">Questions and limits</p><div className="mt-4 space-y-3">{faq.map((item) => <article key={item.question}><h2 className="text-sm font-semibold text-amber-50">{item.question}</h2><p className="mt-1 text-sm leading-6 text-amber-50/72">{item.answer}</p></article>)}</div></section>
      </div>
    </main>
  );
}
