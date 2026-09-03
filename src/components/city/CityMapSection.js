"use client";

export default function CityMapSection({
  mapWrapperRef,
  mapContainerRef,
  mapError,
  isMapReady = false,
  showSearchArea = false,
  searchAreaLabel = "Search this area",
  onSearchThisArea,
  onContinueInListMode,
}) {
  return (
    <div
      ref={mapWrapperRef}
      className="qa-city-section qa-city-map-shell mb-5 mt-0 overflow-hidden rounded-[24px] sm:mb-8 sm:rounded-[28px] xl:mb-0 xl:mt-0 xl:h-full xl:min-h-0"
    >
      <div className="relative h-[300px] w-full overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#17121c] p-1 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:h-[460px] sm:rounded-[28px] xl:h-full xl:min-h-0">
        <div className="relative h-full min-h-0 w-full overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#121017] sm:rounded-[24px]">
          <div
            ref={mapContainerRef}
            className={`absolute inset-0 h-full w-full overflow-hidden transition-opacity duration-500 ${isMapReady ? "opacity-100" : "opacity-35"}`}
            role="region"
            aria-label="City map view"
          />
          {!isMapReady && !mapError ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(245,169,198,0.06),transparent_38%),rgba(11,9,16,0.44)]">
              <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#17121c]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#88d9d4]" aria-hidden="true" />
                Mapping the city
              </div>
            </div>
          ) : null}
          {isMapReady && !mapError && (showSearchArea || searchAreaLabel !== "Search this area") ? (
            <button
              type="button"
              onClick={onSearchThisArea}
              className="qa-action absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.14] bg-[#17121c]/92 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fff8fc] shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-[#f5a9c6]/36 hover:bg-[#211925]"
            >
              {showSearchArea ? "Search this area" : searchAreaLabel}
            </button>
          ) : null}
          {mapError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6 text-center backdrop-blur-sm">
              <div>
                <p className="text-sm text-white/80">{mapError}</p>
                <button
                  onClick={onContinueInListMode}
                  className="qa-action qa-city-cta-secondary mt-4 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs text-white/80 transition hover:border-white/32 hover:text-white"
                >
                  Continue in list mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
