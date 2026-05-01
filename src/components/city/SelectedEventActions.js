"use client";

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

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => toggleFavorite(favoriteKey)}
        className={`qa-cinematic-hover w-full rounded-2xl border px-4 py-3 text-sm ${
          isSaved
            ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
            : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
        }`}
        aria-label={isSaved ? `Remove ${selectedEvent.name} from favorites` : `Save ${selectedEvent.name} to favorites`}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved in atlas" : "Save to atlas"}
      </button>
      {selectedEvent.link && (
        <a
          href={selectedEvent.link}
          target="_blank"
          rel="noreferrer"
          className="qa-cinematic-hover block w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 text-center font-semibold text-black"
        >
          Open official link
        </a>
      )}

      <button
        onClick={showEventOnMap}
        className="qa-cinematic-hover w-full rounded-2xl border border-white/10 bg-white/5 py-3"
      >
        Show on map
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={handleAdminDeleteEvent}
          disabled={isDeletingEventAdmin}
          className="qa-cinematic-hover w-full rounded-2xl border border-rose-200/25 bg-rose-200/12 py-3 text-sm text-rose-100 hover:border-rose-200/45 disabled:opacity-60"
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
        className="qa-cinematic-hover w-full rounded-2xl border border-rose-200/20 bg-rose-200/8 py-3 text-sm text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
        aria-label={`Report event ${selectedEvent.name}`}
      >
        Report issue
      </button>
    </div>
  );
}
