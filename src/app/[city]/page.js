import CityPageClient from "./CityPageClient";
import CityIndexableContent from "@/components/city/CityIndexableContent";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { cityNameFromConfig } from "@/features/city/checkinFeature";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { supabase } from "@/lib/supabase";
import { isUpcomingPublishedEvent, isPublishedEntity } from "@/lib/publicInventory";
import { evaluateEventSeoQuality, evaluateVenueSeoQuality } from "@/lib/seo/entityIndexing";
import { notFound, permanentRedirect } from "next/navigation";
import { cityPath } from "@/lib/cityRouting";

export const revalidate = 300;

async function loadCitySearchPreview(city) {
  try {
    const [placesResult, eventsResult] = await Promise.all([
      fetchPlacesForAtlas({ filters: { city } }),
      supabase.from("events").select("*").eq("city", city).order("date", { ascending: true }).limit(24),
    ]);

    return {
      venues: (placesResult?.data || [])
        .filter((venue) => isPublishedEntity(venue) && evaluateVenueSeoQuality(venue).indexable)
        .slice(0, 12),
      events: (eventsResult?.data || [])
        .filter((event) => isUpcomingPublishedEvent(event) && evaluateEventSeoQuality(event).indexable)
        .slice(0, 12),
    };
  } catch {
    // The interactive guide remains available if the SEO preview cannot load.
    return { venues: [], events: [] };
  }
}

export default async function CityPage({ params }) {
  const resolvedParams = await params;
  const requestedCity = String(resolvedParams?.city || "");
  const city = normalizeCityKey(resolvedParams?.city);
  const config = await getCityRegistryEntry(city);
  if (!config) notFound();
  if (requestedCity.includes("_")) permanentRedirect(cityPath(city));
  const preview = await loadCitySearchPreview(city);

  return (
    <>
      <CityPageClient />
      <CityIndexableContent
        city={city}
        cityName={cityNameFromConfig(config, city)}
        guide={Array.isArray(config?.guide) ? config.guide.slice(0, 3) : []}
        venues={preview.venues}
        events={preview.events}
      />
    </>
  );
}
