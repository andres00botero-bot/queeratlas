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
  venueAccessRestricted = false,
  onRequestRestrictedVenueAccess,
}) {
  const { t } = useLocale();
  const [expandedGroupValue, setExpandedGroupValue] = useState("");

  if (venueAccessRestricted) {
    return (
      <section
        ref={firstGroupRef}
        aria-label={t("city.venues", "Venues")}
        className="qa-city-section qa-city-content-section qa-city-tone-venues mb-8 rounded-[28px] border border-amber-100/16 bg-[linear-gradient(145deg,rgba(245,169,198,0.10),rgba(24,20,38,0.94))] p-5 shadow-[0_18px_46px_rgba(5,6,18,0.16)] sm:p-6"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/72">Community protection</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">Venue details are protected</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
          Venue names, addresses, maps and opening details are not shown publicly for this city.
        </p>
        <button
          type="button"
          onClick={onRequestRestrictedVenueAccess}
          className="qa-action mt-5 inline-flex min-h-11 items-center rounded-full border border-amber-100/30 bg-amber-100/[0.10] px-4 text-sm font-semibold text-amber-50 transition hover:border-amber-100/55 hover:bg-amber-100/[0.16]"
        >
          Why are venue details protected?
        </button>
      </section>
    );
  }

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

        <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#181426] shadow-[0_18px_46px_rgba(5,6,18,0.22)]">
          {visiblePlaceGroups.map((group, groupIndex) => {
            const items = Array.isArray(group.items) ? group.items : [];
            const isExpanded = expandedGroupValue === group.value;
            const panelId = `venue-category-${group.value}`;

            return (
              <div
                key={group.value}
                ref={(node) => setPlaceGroupRef?.(group.value, node)}
                className={groupIndex > 0 ? "border-t border-white/[0.055]" : ""}
              >
                <button
                  type="button"
                  onClick={() => setExpandedGroupValue((current) => (current === group.value ? "" : group.value))}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  className={`qa-action flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isExpanded
                      ? "bg-[#27203c]"
                      : "bg-transparent hover:bg-white/[0.045]"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${isExpanded ? "bg-[#d7c0ff]/14 text-[#e4d6ff]" : "bg-white/[0.055] text-white/52"}`}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">{group.label}</span>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/46">{t("city.venuesCount", "{count} venues").replace("{count}", items.length)}</span>
                  </span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isExpanded ? "bg-[#d7c0ff] text-[#211b33]" : "bg-white/[0.055] text-white/58"}`}>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </span>
                </button>

                {isExpanded ? (
                  <div id={panelId} className="border-t border-white/[0.055] bg-black/10 p-3">
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
          className="qa-city-section qa-city-content-section qa-city-tone-venues qa-city-copy-left qa-venue-list animate-cinematic-in mb-10 rounded-[28px] border border-white/[0.07] bg-[#181426] p-5 shadow-[0_18px_46px_rgba(5,6,18,0.16)] sm:p-6"
            style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
          >
            <div className="mb-7">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#d7c0ff]/70">{t("city.venueCategory", "Venue category")}</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">{group.label}</h2>
                <span className="inline-flex items-center rounded-full bg-[#d7c0ff]/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#e4d6ff]">
                  {t("city.venuesCount", "{count} venues").replace("{count}", items.length)}
                </span>
              </div>
              <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,rgba(215,192,255,0.8),rgba(215,192,255,0.16),transparent)]" />
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
