import { notFound, redirect } from "next/navigation";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export default async function CityDirectoryPage({ params }) {
  const city = normalizeCityKey((await params).city);
  if (!await getCityRegistryEntry(city)) notFound();
  redirect(`/${city}`);
}
