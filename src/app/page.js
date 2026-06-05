import HomePageClient from "@/components/home/HomePageClient";
import { fetchInitialHomeDataPayload } from "@/lib/homeDataApi";

export const revalidate = 60;

export default async function HomePage() {
  let initialHomeData = null;

  try {
    initialHomeData = await fetchInitialHomeDataPayload();
  } catch {
    initialHomeData = null;
  }

  return <HomePageClient initialHomeData={initialHomeData} />;
}
