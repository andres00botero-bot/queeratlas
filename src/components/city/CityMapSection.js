"use client";

export default function CityMapSection({
  mapWrapperRef,
  mapContainerRef,
  mapError,
  onContinueInListMode,
}) {
  return (
    <div
      ref={mapWrapperRef}
      className="qa-city-section mb-8 mt-0 rounded-[34px] xl:mb-0 xl:mt-0 xl:h-full"
    >
      <div className="relative h-[460px] w-full overflow-hidden rounded-[32px] border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.30)] xl:h-full">
        <div
          ref={mapContainerRef}
          className="h-full w-full"
          role="region"
          aria-label="City map view"
        />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center backdrop-blur-sm">
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
  );
}
