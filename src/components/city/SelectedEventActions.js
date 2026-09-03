"use client";

import { normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";

export default function SelectedEventActions({
  selectedEvent,
  favorites,
  toggleFavorite,
  showEventOnMap,
  isAdmin,
  isDeletingEventAdmin,
  handleAdminDeleteEvent,
  handleReport,
}) {
  const favoriteKey = `event-${selectedEvent.id}`;
  const isSaved = favorites.includes(favoriteKey);
  const eventLinkUrl = normalizeExternalUrl(selectedEvent?.link || "");
  const ticketUrl = normalizeExternalUrl(selectedEvent?.ticket_url || selectedEvent?.ticketUrl || "");

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => toggleFavorite(favoriteKey)}
        className={`qa-action qa-action-strong ${isSaved ? "qa-city-cta-primary" : "qa-city-cta-secondary"} w-full rounded-2xl border px-4 py-3 text-sm ${
          isSaved
            ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
            : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
        }`}
        aria-label={isSaved ? `Remove ${selectedEvent.name} from favorites` : `Save ${selectedEvent.name} to favorites`}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved in atlas" : "Save to atlas"}
      </button>
      <a
        href={`/favorites?trip_add_type=event&trip_add_id=${encodeURIComponent(String(selectedEvent.id))}&trip_add_city=${encodeURIComponent(String(selectedEvent.city || ""))}`}
        className="qa-action flex min-h-12 w-full items-center justify-center rounded-2xl border border-fuchsia-200/28 bg-fuchsia-200/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/46 hover:bg-fuchsia-200/15"
      >
        + Add to trip
      </a>
      {eventLinkUrl && (
        <OfficialExternalLink
          href={eventLinkUrl}
          kind="event"
          className="!mt-5 mb-3"
        />
      )}
      {ticketUrl && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="qa-action qa-action-strong block w-full rounded-2xl border border-emerald-200/35 bg-emerald-200/14 py-3 text-center font-semibold text-emerald-100 transition hover:border-emerald-200/55 hover:bg-emerald-200/20"
        >
          Get tickets
        </a>
      )}

      <button
        onClick={showEventOnMap}
        className="qa-action qa-city-cta-secondary w-full rounded-2xl border border-white/10 bg-white/5 py-3"
      >
        Show on map
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={handleAdminDeleteEvent}
          disabled={isDeletingEventAdmin}
          className="qa-action qa-city-cta-tertiary w-full rounded-2xl border border-rose-200/25 bg-rose-200/12 py-3 text-sm text-rose-100 hover:border-rose-200/45 disabled:opacity-60"
          aria-label={`Delete event ${selectedEvent.name}`}
        >
          {isDeletingEventAdmin ? "Deleting..." : "Delete event"}
        </button>
      )}
      <button
        onClick={() =>
          handleReport({
            targetType: "event",
            targetId: selectedEvent.id,
            title: selectedEvent.name,
          })
        }
        className="qa-action qa-city-cta-tertiary w-full rounded-2xl border border-rose-200/20 bg-rose-200/8 py-3 text-sm text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
        aria-label={`Report event ${selectedEvent.name}`}
      >
        Report issue
      </button>
    </div>
  );
}
