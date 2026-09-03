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
  const addToTripHref = `/favorites?trip_add_type=place&trip_add_id=${encodeURIComponent(String(selectedPlace.id))}&trip_add_city=${encodeURIComponent(String(selectedPlace.city || ""))}`;

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => toggleFavorite(selectedPlace.id)}
        className={`qa-action qa-action-strong rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          isSaved
            ? "border-[#f5a9c6]/42 bg-[#f5a9c6]/16 text-[#ffd8e7] shadow-[0_12px_30px_rgba(245,169,198,0.12)]"
            : "border-[#f5a9c6]/28 bg-[#f5a9c6]/10 text-[#ffd8e7] hover:border-[#f5a9c6]/48 hover:bg-[#f5a9c6]/14"
        }`}
        aria-label={isSaved ? `Remove ${selectedPlace.name} from favorites` : `Save ${selectedPlace.name} to favorites`}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved in atlas" : "Save to atlas"}
      </button>

      <a
        href={addToTripHref}
        className="qa-action flex min-h-11 items-center justify-center rounded-2xl border border-[#b7a0f7]/28 bg-[#b7a0f7]/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#ded5fb] transition hover:border-[#b7a0f7]/46 hover:bg-[#b7a0f7]/15"
      >
        + Add to trip
      </a>

      <button
        type="button"
        onClick={showPlaceOnMap}
        disabled={!canShowOnMap}
        className="qa-action qa-city-cta-secondary rounded-2xl border border-[#88d9d4]/20 bg-[#88d9d4]/[0.07] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#bcebe7] transition hover:border-[#88d9d4]/38 hover:bg-[#88d9d4]/10 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Show on map
      </button>

      <button
        type="button"
        onClick={() => handleReport({ targetType: "place", targetId: selectedPlace.id, title: selectedPlace.name })}
        className="qa-action rounded-2xl border border-white/[0.09] bg-white/[0.035] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/58 transition hover:border-rose-100/24 hover:text-rose-100"
        aria-label={`Report place ${selectedPlace.name}`}
      >
        Report issue
      </button>

      {isAdmin ? (
        <button
          type="button"
          onClick={handleAdminDeletePlace}
          disabled={isDeletingPlaceAdmin}
          className="qa-action rounded-2xl border border-rose-200/20 bg-rose-200/[0.07] px-4 py-3 text-xs text-rose-100 hover:border-rose-200/38 disabled:opacity-60 sm:col-span-2"
          aria-label={`Delete venue ${selectedPlace.name}`}
        >
          {isDeletingPlaceAdmin ? "Deleting..." : "Delete venue"}
        </button>
      ) : null}
    </div>
  );
}
