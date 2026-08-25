import { notFound, permanentRedirect } from "next/navigation";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export default async function CityEventsRedirectPage({ params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);

  if (!(await getCityRegistryEntry(city))) {
    notFound();
  }

  permanentRedirect(`/${city}?section=events`);
}
