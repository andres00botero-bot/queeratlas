"use client";

export default function SelectedPlaceActions({
  selectedPlace,
  handleReport,
  toggleFavorite,
  favorites,
  isAdmin,
  handleAdminDeletePlace,
  isDeletingPlaceAdmin,
}) {
  const isSaved = favorites.includes(String(selectedPlace.id));

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() =>
          handleReport({
            targetType: "place",
            targetId: selectedPlace.id,
            title: selectedPlace.name,
          })
        }
        className="qa-action qa-city-cta-tertiary rounded-full border border-rose-200/20 bg-rose-200/8 px-4 py-2.5 text-xs text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
        aria-label={`Report place ${selectedPlace.name}`}
      >
        Report issue
      </button>
      <button
        onClick={() => toggleFavorite(selectedPlace.id)}
        className={`qa-action qa-action-strong ${isSaved ? "qa-city-cta-primary" : "qa-city-cta-secondary"} rounded-full border px-4 py-2.5 text-xs ${
          isSaved
            ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
            : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
        }`}
        aria-label={isSaved ? `Remove ${selectedPlace.name} from favorites` : `Save ${selectedPlace.name} to favorites`}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved in atlas" : "Save to atlas"}
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={handleAdminDeletePlace}
          disabled={isDeletingPlaceAdmin}
          className="qa-action qa-city-cta-tertiary rounded-full border border-rose-200/25 bg-rose-200/12 px-4 py-2.5 text-xs text-rose-100 hover:border-rose-200/45 disabled:opacity-60"
          aria-label={`Delete venue ${selectedPlace.name}`}
        >
          {isDeletingPlaceAdmin ? "Deleting..." : "Delete venue"}
        </button>
      )}
    </div>
  );
}
