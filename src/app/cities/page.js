import CitiesPageClient from "./CitiesPageClient";
import { getAtlasInventory } from "@/lib/atlasMetrics";

export const revalidate = 300;

export default async function CitiesPage() {
  const { cities, metrics } = await getAtlasInventory();
  return <CitiesPageClient initialCities={cities} initialMetrics={metrics} />;
}
