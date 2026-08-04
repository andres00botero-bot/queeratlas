import Link from "next/link";
import { notFound } from "next/navigation";
import EntityPracticalIntel from "@/components/city/EntityPracticalIntel";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";
import { cityCoreConfig } from "@/lib/cityCore";
import { cityNameFromConfig } from "@/features/city/checkinFeature";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { evaluateServiceSeoQuality } from "@/lib/seo/entityIndexing";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import {
  buildServicePath,
  normalizeCitySlug,
  serviceMatchesSlug,
} from "@/lib/seo/entitySlug";

export const revalidate = 300;

function toAbsoluteUrl(path = "") {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://www.queeratlas.app";
  return `${String(baseUrl).replace(/\/+$/, "")}${path}`;
}

async function findServiceByParams(cityParam = "", slugParam = "") {
  const city = normalizeCitySlug(cityParam);
  const slug = String(slugParam || "").trim();
  const coreConfig = cityCoreConfig[city] || null;
  if (!city || !slug || !coreConfig) return { city, service: null, coreConfig };

  const { allServices } = await loadSeoEntityInventory();
  const service = allServices.find(
    (row) => normalizeCitySlug(row?.city) === city && serviceMatchesSlug(row, slug),
  ) || null;
  return { city, service, coreConfig };
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const { city, service, coreConfig } = await findServiceByParams(resolved?.city, resolved?.slug);

  if (!service || !coreConfig) {
    return {
      title: "Service Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildServicePath(city, service);
  const title = `${service.name} (${cityName}) | Queer Atlas Service Guide`;
  const description = String(service?.description || "").trim();
  const quality = evaluateServiceSeoQuality(service);

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: quality.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "article",
    },
  };
}

export default async function CityServiceDetailPage({ params }) {
  const resolved = await params;
  const { city, service, coreConfig } = await findServiceByParams(resolved?.city, resolved?.slug);
  if (!service || !coreConfig) notFound();

  const cityName = cityNameFromConfig(coreConfig, city);
  const canonicalPath = buildServicePath(city, service);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const officialUrl = String(service?.booking_link || service?.link || "").trim();
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalUrl}#service`,
    name: String(service.name || ""),
    description: String(service.description || ""),
    url: canonicalUrl,
    areaServed: {
      "@type": "City",
      name: cityName,
    },
    provider: {
      "@type": "Organization",
      name: String(service.provider_name || service.name || ""),
    },
    isPartOf: { "@id": QA_WEBSITE_ID },
    publisher: { "@id": QA_ORGANIZATION_ID },
    ...(officialUrl ? { sameAs: [officialUrl] } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Cities", item: toAbsoluteUrl("/cities") },
      { "@type": "ListItem", position: 3, name: cityName, item: toAbsoluteUrl(`/${city}`) },
      { "@type": "ListItem", position: 4, name: String(service.name || "Service"), item: canonicalUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-[#050505] px-3.5 py-4 text-white sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-4xl space-y-3.5 sm:space-y-6">
        <header className="rounded-[22px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100/78">Service detail</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{service.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">{cityName}</span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">{String(service.type || "service")}</span>
            {service.price_tier ? (
              <span className="rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-1 text-amber-100">
                {service.price_tier}
              </span>
            ) : null}
          </div>
        </header>

        <section className="rounded-[20px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[24px] sm:p-6">
          <h2 className="text-lg font-semibold">About this service</h2>
          <p className="mt-3 text-sm leading-7 text-white/82">{service.description}</p>
        </section>

        <section className="rounded-[20px] border border-white/12 bg-white/[0.03] p-4 sm:rounded-[24px] sm:p-6">
          <h2 className="text-lg font-semibold">Practical details</h2>
          <div className="mt-3 space-y-2 text-sm text-white/82">
            {service.provider_name ? <p><span className="text-white/55">Provider:</span> {service.provider_name}</p> : null}
            {service.location ? <p><span className="text-white/55">Area:</span> {service.location}</p> : null}
            {service.hours ? <p><span className="text-white/55">Availability:</span> {service.hours}</p> : null}
            {service.contact ? <p><span className="text-white/55">Contact:</span> {service.contact}</p> : null}
          </div>
          {officialUrl ? <OfficialExternalLink href={officialUrl} kind="service" className="mt-5 sm:max-w-sm" /> : null}
        </section>

        <EntityPracticalIntel entity={service} kind="service" compact={false} />

        <nav className="flex flex-wrap gap-2">
          <Link href={`/${city}`} className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/84">
            Back to {cityName}
          </Link>
          <Link href={`/${city}?serviceId=${encodeURIComponent(String(service.id))}`} className="rounded-full border border-emerald-200/26 bg-emerald-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-emerald-100">
            Open in city panel
          </Link>
        </nav>
      </div>
    </main>
  );
}
