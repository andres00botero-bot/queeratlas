import HomePageClient from "@/components/home/HomePageClient";
import { fetchHomeDataPayload } from "@/lib/homeDataApi";

export const revalidate = 60;

export default async function HomePage() {
  let initialHomeData = null;

  try {
    initialHomeData = await fetchHomeDataPayload();
  } catch {
    initialHomeData = null;
  }

  return <HomePageClient initialHomeData={initialHomeData} />;
}
