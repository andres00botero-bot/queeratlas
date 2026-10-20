import Link from "next/link";
import { notFound } from "next/navigation";
import CityEntityCrawlSection from "@/components/city/CityEntityCrawlSection";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export async function generateMetadata({ params }) {
  const city = normalizeCityKey((await params).city);
  const config = await getCityRegistryEntry(city);
  const name = String(config?.title || city).replace(/^Queer\s+/i, "").trim();
  return {
    title: `${name} listings directory | QueerAtlas`,
    alternates: { canonical: `/${city}/directory` },
    robots: { index: false, follow: true },
  };
}

export default async function CityDirectoryPage({ params }) {
  const city = normalizeCityKey((await params).city);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();
  const cityName = String(config.title || city).replace(/^Queer\s+/i, "").trim();
  return (
    <main className="min-h-screen bg-[#07090f] text-white">
      <header className="mx-auto max-w-6xl px-4 py-6">
        <Link href={`/${city}`} className="text-cyan-100 underline underline-offset-4">Back to {cityName}</Link>
        <h1 className="mt-4 text-2xl font-semibold">{cityName} directory</h1>
      </header>
      <CityEntityCrawlSection city={city} cityName={cityName} />
    </main>
  );
}
