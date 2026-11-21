import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import HomePageClient from "@/components/home/HomePageClient";
import { fetchInitialHomeDataPayload } from "@/lib/homeDataApi";

import { AtlasCollections, HomeShortcuts } from "@/components/home/HomeCollections";

export const revalidate = 60;

export default async function HomePage() {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  let initialHomeData = null;

  try {
    initialHomeData = await fetchInitialHomeDataPayload();
  } catch {
    initialHomeData = null;
  }

  return (
    <HomePageClient
      initialHomeData={initialHomeData}
      shortcuts={<HomeShortcuts locale={locale} />}
      fieldGuide={<AtlasCollections locale={locale} />}
    />
  );
}
