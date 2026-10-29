import NowPageClient from "./NowPageClient";
import { getPublishedNews } from "@/lib/publicNewsData";

export const revalidate = 60;

export default async function NowPage({ initialSection = "mixed", initialDataQuery = {} }) {
  const { items } = await getPublishedNews();
  return <NowPageClient initialSection={initialSection} initialDataQuery={initialDataQuery} initialNews={items} />;
}
