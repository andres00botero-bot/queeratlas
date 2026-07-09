"use client";

import PlaceGuideCard from "@/components/city/PlaceGuideCard";

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

        const items = Array.isArray(group.items) ? group.items : [];

        return (
        <div
          ref={attachGroupRef}
          key={group.value}
          className={`qa-city-section qa-city-copy-left animate-cinematic-in mb-10 border border-white/16 bg-[linear-gradient(145deg,rgba(34,211,238,0.10),rgba(255,79,163,0.07),rgba(12,14,20,0.96))] p-5 shadow-[0_22px_64px_rgba(8,47,73,0.18)] sm:p-6 ${
            groupIndex % 2 === 0 ? "rounded-[30px]" : "rounded-[26px]"
          }`}
            style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
          >
            <div className="mb-7">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/48">Venue category</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">{group.label}</h2>
                <span className="inline-flex items-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-100/86">
                  {items.length} venues
                </span>
              </div>
              <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,#4de1ff,#ff7ac3,transparent)] opacity-60" />
            </div>

            <div>
              <div className="grid grid-cols-1 gap-4">
                {items.map((place, index) => (
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
          </div>
        );
      })}
    </>
  );
}
