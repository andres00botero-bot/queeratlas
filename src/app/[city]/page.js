import CityPageClient from "./CityPageClient";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function CityPage({ params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();

  return (
    <>
      <CityPageClient />
    </>
  );
}
