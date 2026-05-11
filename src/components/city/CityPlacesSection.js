"use client";

import { useMemo, useState } from "react";
import PlaceGuideCard from "@/components/city/PlaceGuideCard";

const DEFAULT_VISIBLE = 6;

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
  const [expandedGroups, setExpandedGroups] = useState({});

  const totalVenues = useMemo(
    () => visiblePlaceGroups.reduce((sum, group) => sum + (Array.isArray(group.items) ? group.items.length : 0), 0),
    [visiblePlaceGroups]
  );

  return (
    <>
      {!placesLoading && !hasAnyPlaces && (
        <div className="qa-city-section mb-10 rounded-[30px] border border-dashed border-emerald-200/22 bg-[linear-gradient(150deg,rgba(6,78,59,0.20),rgba(17,17,17,0.96))] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Venue signal</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Venue map is taking shape</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
            We&apos;re curating trusted drops for this city. Explore the guide lane now, or add a venue locals can rely on.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onReadGuide}
              className="qa-action qa-city-cta-secondary rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/82 hover:border-white/30 hover:text-white"
            >
              Read guide lane
            </button>
            {canPublish ? (
              <button
                type="button"
                onClick={onPublishFirstVenue}
                className="qa-action qa-action-strong qa-city-cta-primary rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
              >
                Publish first venue
              </button>
            ) : (
              <button
                type="button"
                onClick={onJoinToPublish}
                className="qa-action qa-action-strong qa-city-cta-primary rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
              >
                Join to publish
              </button>
            )}
          </div>
        </div>
      )}

      {hasAnyPlaces ? (
        <div className="qa-city-section mb-6 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/52">Venues</p>
          <p className="mt-1 text-xs text-white/66">
            {totalVenues} total venues. Open each section for full list.
          </p>
        </div>
      ) : null}

      {visiblePlaceGroups.map((group, groupIndex) => {
        const attachGroupRef = (node) => {
          if (groupIndex === 0 && firstGroupRef) {
            if (typeof firstGroupRef === "function") {
              firstGroupRef(node);
            } else {
              firstGroupRef.current = node;
            }
          }
          if (typeof setPlaceGroupRef === "function") {
            setPlaceGroupRef(group.value, node);
          }
        };

        const expanded = Boolean(expandedGroups[group.value]);
        const items = Array.isArray(group.items) ? group.items : [];
        const visibleItems = expanded ? items : items.slice(0, DEFAULT_VISIBLE);

        return (
          <div
            ref={attachGroupRef}
            key={group.value}
            className={`qa-city-section animate-cinematic-in mb-10 border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.24)] ${
              groupIndex % 2 === 0 ? "rounded-[34px]" : "rounded-[28px]"
            }`}
            style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
          >
            <div className="sticky top-[66px] z-20 -mx-2 mb-6 border-b border-white/8 bg-[#050505]/92 px-2 py-3 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg tracking-wide text-white/82">{group.label}</h2>
                <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] text-white/72">
                  {items.length} venues
                </span>
              </div>
            </div>

            <div className={`${expanded ? "max-h-[980px] overflow-y-auto pr-1" : ""}`}>
              <div className="grid gap-4 md:grid-cols-2">
                {visibleItems.map((place, index) => (
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
                ))}
              </div>
            </div>

            {items.length > DEFAULT_VISIBLE ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.value]: !expanded }))}
                  className="rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/82 transition hover:border-white/30 hover:text-white"
                >
                  {expanded ? "Show less" : `Show all (${items.length})`}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
