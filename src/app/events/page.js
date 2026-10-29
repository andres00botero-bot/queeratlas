import EventsPageClient from "./EventsPageClient";
import { fetchPublicEventData } from "@/lib/publicEventData";

export const revalidate = 60;

export default async function EventsPage() {
  const initialEventData = await fetchPublicEventData();
  return <EventsPageClient initialEvents={initialEventData.events} initialGlobalEvents={initialEventData.globalEvents} />;
}
