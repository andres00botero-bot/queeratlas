import NowPageClient from "./NowPageClient";
import { getPublishedNews } from "@/lib/publicNewsData";

// News must be current in the initial HTML as well as after hydration. Keeping
// this route dynamic avoids serving a stale server snapshot to crawlers.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NowPage({ initialSection = "mixed", initialDataQuery = {} }) {
  const { items } = await getPublishedNews();
  return <NowPageClient initialSection={initialSection} initialDataQuery={initialDataQuery} initialNews={items} />;
}
