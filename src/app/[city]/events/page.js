import { notFound, permanentRedirect } from "next/navigation";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export default async function CityEventsRedirectPage({ params }) {
  const resolvedParams = await params;
  const city = normalizeCityKey(resolvedParams?.city);

  if (!cityConfig[city]) {
    notFound();
  }

  permanentRedirect(`/${city}?section=events`);
}
