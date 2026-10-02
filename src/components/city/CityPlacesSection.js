"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import PlaceGuideCard from "@/components/city/PlaceGuideCard";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CityPlacesSection({
  placesLoading,
  hasAnyPlaces,
  onReadGuide,
  canPublish,
  onPublishFirstVenue,
  onJoinToPublish,
  visiblePlaceGroups,
  firstGroupRef,
  setPlaceGroupRef,
  isFocusMode,
  selectedPlaceId,
  hoveredPlaceId,
  openPlace,
  setHoveredPlaceId,
  toggleFavorite,
  favorites,
  typeStyles,
  typeLabels,
  qualityMap,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
  cityName,
  safetySignalsByPlaceId,
}) {
  const { t } = useLocale();
  const [expandedGroupValue, setExpandedGroupValue] = useState("");

  const renderPlaceCards = (group) => {
    const items = Array.isArray(group.items) ? group.items : [];

    return items.map((place, index) => (
      <PlaceGuideCard
        key={place.id}
        place={place}
        index={index}
        groupLabel={group.label}
        isFocusMode={isFocusMode}
        selectedPlaceId={selectedPlaceId}
        hoveredPlaceId={hoveredPlaceId}
        openPlace={openPlace}
        setHoveredPlaceId={setHoveredPlaceId}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
        typeStyles={typeStyles}
        typeLabels={typeLabels}
        qualityMap={qualityMap}
        refreshEntityQuality={refreshEntityQuality}
        canRefreshQuality={canRefreshQuality}
        formatDate={formatDate}
        cityName={cityName}
        safetySignal={safetySignalsByPlaceId[String(place.id)] || null}
      />
    ));
  };

  return (
    <>
      {!placesLoading && !hasAnyPlaces && (
        <div className="qa-city-section qa-city-content-section qa-city-tone-venues mb-10 rounded-[28px] border border-dashed p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{t("city.venueSignal", "Venue signal")}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{t("city.venueMapTakingShape", "Venue map is taking shape")}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
            {t("city.venueMapDescription", "We’re curating trusted drops for this city. Explore the guide lane now, or add a venue locals can rely on.")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onReadGuide}
              className="qa-action qa-city-cta-secondary rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/82 hover:border-white/30 hover:text-white"
            >
              {t("city.readGuideLane", "Read guide lane")}
            </button>
            {canPublish ? (
              <button
                type="button"
                onClick={onPublishFirstVenue}
                className="qa-action qa-action-strong qa-city-cta-primary rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
              >
                {t("city.publishFirstVenue", "Publish first venue")}
              </button>
            ) : (
              <button
                type="button"
                onClick={onJoinToPublish}
                className="qa-action qa-action-strong qa-city-cta-primary rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
              >
                {t("city.joinToPublish", "Join to publish")}
              </button>
            )}
          </div>
        </div>
      )}

      <section
        ref={firstGroupRef}
        aria-label={t("city.venues", "Venues")}
        className="qa-city-section qa-city-content-section qa-city-tone-venues qa-city-copy-left mb-8 rounded-[28px] border p-3.5 xl:hidden"
      >
        <div className="px-1.5 pb-3 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/68">{t("city.venues", "Venues")}</p>
          <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.02em] text-white">{t("city.chooseVenueCategory", "Choose a category")}</h2>
          <p className="mt-1 text-xs leading-5 text-white/52">{t("city.chooseVenueCategoryHint", "Open one category at a time to keep exploring simple.")}</p>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#0d0b12]/68 shadow-[0_18px_46px_rgba(0,0,0,0.18)]">
          {visiblePlaceGroups.map((group, groupIndex) => {
            const items = Array.isArray(group.items) ? group.items : [];
            const isExpanded = expandedGroupValue === group.value;
            const panelId = `venue-category-${group.value}`;

            return (
              <div
                key={group.value}
                ref={(node) => setPlaceGroupRef?.(group.value, node)}
                className={groupIndex > 0 ? "border-t border-white/[0.08]" : ""}
              >
                <button
                  type="button"
                  onClick={() => setExpandedGroupValue((current) => (current === group.value ? "" : group.value))}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  className={`qa-action flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isExpanded
                      ? "bg-[linear-gradient(100deg,rgba(34,211,238,0.13),rgba(245,169,198,0.10),rgba(255,255,255,0.04))]"
                      : "bg-white/[0.018] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${isExpanded ? "border-cyan-100/36 bg-cyan-200/12 text-cyan-50" : "border-white/12 bg-white/[0.045] text-white/56"}`}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">{group.label}</span>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/46">{t("city.venuesCount", "{count} venues").replace("{count}", items.length)}</span>
                  </span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${isExpanded ? "border-cyan-100/36 bg-cyan-200/14 text-cyan-50" : "border-white/12 bg-white/[0.04] text-white/58"}`}>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </span>
                </button>

                {isExpanded ? (
                  <div id={panelId} className="border-t border-white/[0.08] bg-black/16 p-3">
                    <div className="grid grid-cols-1 gap-3">{renderPlaceCards(group)}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="hidden xl:block">
      {visiblePlaceGroups.map((group, groupIndex) => {
        const attachGroupRef = (node) => {
          if (typeof setPlaceGroupRef === "function") {
            setPlaceGroupRef(group.value, node);
          }
        };

        const items = Array.isArray(group.items) ? group.items : [];

        return (
        <div
          ref={attachGroupRef}
          key={group.value}
          className="qa-city-section qa-city-content-section qa-city-tone-venues qa-city-copy-left animate-cinematic-in mb-10 rounded-[28px] border p-5 sm:p-6"
            style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
          >
            <div className="mb-7">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/48">{t("city.venueCategory", "Venue category")}</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">{group.label}</h2>
                <span className="inline-flex items-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-100/86">
                  {t("city.venuesCount", "{count} venues").replace("{count}", items.length)}
                </span>
              </div>
              <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,#4de1ff,#ff7ac3,transparent)] opacity-60" />
            </div>

            <div>
              <div className="grid grid-cols-1 gap-4">{renderPlaceCards(group)}</div>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}
