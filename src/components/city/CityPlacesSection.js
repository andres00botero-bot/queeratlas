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
        return (
          <div
            ref={attachGroupRef}
            key={group.value}
            className={`qa-city-section animate-cinematic-in mb-10 border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.24)] ${
              groupIndex % 2 === 0 ? "rounded-[34px]" : "rounded-[28px]"
            }`}
            style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
          >
            <h2 className="sticky top-0 z-20 -mx-2 mb-6 border-b border-white/8 bg-[#050505]/92 px-2 py-3 text-lg tracking-wide text-white/82 backdrop-blur">
              {group.label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.items.map((place, index) => (
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
                  formatDate={formatDate}
                  cityName={cityName}
                  safetySignal={safetySignalsByPlaceId[String(place.id)] || null}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
