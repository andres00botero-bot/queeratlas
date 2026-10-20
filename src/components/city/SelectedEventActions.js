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
    <div className="mt-7 flex flex-wrap gap-2 border-t border-white/[0.08] pt-5">
      <button
        onClick={() => toggleFavorite(favoriteKey)}
        className={`qa-action ${isSaved ? "qa-city-cta-primary" : "qa-city-cta-secondary"} rounded-full border px-4 py-2 text-xs font-semibold ${
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
        className="qa-action inline-flex min-h-9 items-center justify-center rounded-full border border-white/[0.12] px-4 py-2 text-xs font-semibold text-white/68 transition hover:border-[#e8a47c]/42 hover:text-[#f1ba98]"
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
        className="qa-action qa-city-cta-secondary rounded-full border border-white/10 px-4 py-2 text-xs text-white/68"
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
        className="qa-action qa-city-cta-tertiary w-full rounded-2xl border border-white/[0.09] bg-white/[0.025] py-3 text-sm text-white/56 hover:border-rose-200/24 hover:text-rose-100"
        aria-label={`Report event ${selectedEvent.name}`}
      >
        Report issue
      </button>
    </div>
  );
}
