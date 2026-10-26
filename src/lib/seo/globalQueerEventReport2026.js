import snapshot from "./globalQueerEventReport2026.json" with { type: "json" };
import { isVenueAccessRestricted } from "../venueAccessPolicy.js";

const entries = snapshot.entries
  .filter((entry) => !isVenueAccessRestricted(entry.city))
  .map((entry, index) => ({ ...entry, rank: index + 1 }));

export const GLOBAL_QUEER_EVENT_REPORT_2026 = Object.freeze({
  ...snapshot,
  scope: {
    ...snapshot.scope,
    indexedEvents: entries.reduce((sum, entry) => sum + entry.events, 0),
    atlasCitiesWithEvents: entries.length,
    routeReadyEvents: entries.reduce((sum, entry) => sum + entry.routeReadyEvents, 0),
    linkedEvents: entries.reduce((sum, entry) => sum + entry.linkedEvents, 0),
  },
  limitation: `${snapshot.limitation} Cities with protected venue access are excluded to avoid exposing local queer activity.`,
  entries,
});

export const GLOBAL_QUEER_EVENT_REPORT_2026_ENTRIES = GLOBAL_QUEER_EVENT_REPORT_2026.entries;
