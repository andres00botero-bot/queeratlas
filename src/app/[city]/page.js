import CityPageClient from "./CityPageClient";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { notFound, permanentRedirect } from "next/navigation";
import { cityPath } from "@/lib/cityRouting";

export const revalidate = 300;

export default async function CityPage({ params }) {
  const resolvedParams = await params;
  const requestedCity = String(resolvedParams?.city || "");
  const city = normalizeCityKey(resolvedParams?.city);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();
  if (requestedCity.includes("_")) permanentRedirect(cityPath(city));

  return (
    <>
      <CityPageClient />
    </>
  );
}
