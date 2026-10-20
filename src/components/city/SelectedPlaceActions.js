"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

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
  const { t } = useLocale();
  const isSaved = favorites.includes(String(selectedPlace.id));
  const canShowOnMap = Number.isFinite(Number(selectedPlace.lat)) && Number.isFinite(Number(selectedPlace.lng));
  const addToTripHref = `/favorites?trip_add_type=place&trip_add_id=${encodeURIComponent(String(selectedPlace.id))}&trip_add_city=${encodeURIComponent(String(selectedPlace.city || ""))}`;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => toggleFavorite(selectedPlace.id)}
        className={`qa-action rounded-full border px-3 py-2 text-xs font-semibold transition ${
          isSaved
            ? "border-[#e7c67f]/38 bg-[#e7c67f]/12 text-[#f2d997]"
            : "border-white/[0.12] text-white/68 hover:border-[#d7c0ff]/38 hover:text-[#e4d6ff]"
        }`}
        aria-label={isSaved ? t("city.removeFavorite", "Remove {place} from favorites").replace("{place}", selectedPlace.name) : t("city.saveFavorite", "Save {place} to favorites").replace("{place}", selectedPlace.name)}
        aria-pressed={isSaved}
      >
        {isSaved ? t("city.savedInAtlas", "Saved in atlas") : t("city.saveToAtlas", "Save to atlas")}
      </button>

      <a
        href={addToTripHref}
        className="qa-action inline-flex min-h-9 items-center justify-center rounded-full border border-white/[0.12] px-3 py-2 text-xs font-semibold text-white/68 transition hover:border-[#d7c0ff]/38 hover:text-[#e4d6ff]"
      >
        {t("city.addToTrip", "+ Add to trip")}
      </a>

      <button
        type="button"
        onClick={showPlaceOnMap}
        disabled={!canShowOnMap}
        className="qa-action qa-city-cta-secondary rounded-full border border-white/[0.12] px-3 py-2 text-xs font-semibold text-white/68 transition hover:border-[#d7c0ff]/38 hover:text-[#e4d6ff] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {t("city.showOnMap", "Show on map")}
      </button>

      <button
        type="button"
        onClick={() => handleReport({ targetType: "place", targetId: selectedPlace.id, title: selectedPlace.name })}
        className="qa-action rounded-full px-3 py-2 text-xs font-semibold text-white/46 transition hover:text-rose-100"
        aria-label={t("city.reportPlace", "Report place {place}").replace("{place}", selectedPlace.name)}
      >
        {t("city.reportIssue", "Report issue")}
      </button>

      {isAdmin ? (
        <button
          type="button"
          onClick={handleAdminDeletePlace}
          disabled={isDeletingPlaceAdmin}
          className="qa-action rounded-2xl border border-rose-200/20 bg-rose-200/[0.07] px-4 py-3 text-xs text-rose-100 hover:border-rose-200/38 disabled:opacity-60 sm:col-span-2"
          aria-label={`${t("city.deleteVenue", "Delete venue")} ${selectedPlace.name}`}
        >
          {isDeletingPlaceAdmin ? t("city.deleting", "Deleting...") : t("city.deleteVenue", "Delete venue")}
        </button>
      ) : null}
    </div>
  );
}
