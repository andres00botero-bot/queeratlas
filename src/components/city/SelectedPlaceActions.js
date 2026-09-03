"use client";

export default function SelectedPlaceActions({
  selectedPlace,
  showPlaceOnMap,
  handleReport,
  toggleFavorite,
  favorites,
  isAdmin,
  handleAdminDeletePlace,
  isDeletingPlaceAdmin,
}) {
  const isSaved = favorites.includes(String(selectedPlace.id));
  const canShowOnMap = Number.isFinite(Number(selectedPlace.lat)) && Number.isFinite(Number(selectedPlace.lng));

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={showPlaceOnMap}
        disabled={!canShowOnMap}
        className="qa-action qa-city-cta-secondary rounded-2xl border border-cyan-100/22 bg-cyan-300/[0.08] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-50 transition hover:border-cyan-100/40 hover:bg-cyan-300/[0.12] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Show on map
      </button>
      <button
        onClick={() =>
          handleReport({
            targetType: "place",
            targetId: selectedPlace.id,
            title: selectedPlace.name,
          })
        }
        className="qa-action rounded-2xl border border-rose-100/24 bg-rose-300/[0.09] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-rose-50 transition hover:border-rose-100/42 hover:bg-rose-300/[0.13]"
        aria-label={`Report place ${selectedPlace.name}`}
      >
        Report issue
      </button>
      <button
        onClick={() => toggleFavorite(selectedPlace.id)}
        className={`qa-action qa-action-strong rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          isSaved
            ? "border-pink-100/42 bg-[linear-gradient(135deg,rgba(244,114,182,0.24),rgba(168,85,247,0.16))] text-pink-50 shadow-[0_12px_30px_rgba(244,114,182,0.16)]"
            : "border-amber-100/32 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(255,255,255,0.07))] text-amber-50 hover:border-amber-100/52"
        }`}
        aria-label={isSaved ? `Remove ${selectedPlace.name} from favorites` : `Save ${selectedPlace.name} to favorites`}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved in atlas" : "Save to atlas"}
      </button>
      <a
        href={`/favorites?trip_add_type=place&trip_add_id=${encodeURIComponent(String(selectedPlace.id))}&trip_add_city=${encodeURIComponent(String(selectedPlace.city || ""))}`}
        className="qa-action flex min-h-11 items-center justify-center rounded-2xl border border-fuchsia-200/28 bg-fuchsia-200/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/46 hover:bg-fuchsia-200/15 sm:col-span-2"
      >
        + Add to trip
      </a>
      {isAdmin && (
        <button
          type="button"
          onClick={handleAdminDeletePlace}
          disabled={isDeletingPlaceAdmin}
          className="qa-action rounded-2xl border border-rose-200/25 bg-rose-200/12 px-4 py-3 text-xs text-rose-100 hover:border-rose-200/45 disabled:opacity-60 sm:col-span-2"
          aria-label={`Delete venue ${selectedPlace.name}`}
        >
          {isDeletingPlaceAdmin ? "Deleting..." : "Delete venue"}
        </button>
      )}
    </div>
  );
}
