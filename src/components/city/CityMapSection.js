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
      className="qa-city-section mb-8 mt-0 rounded-[30px] xl:mb-0 xl:mt-0 xl:h-full"
    >
      <div className="relative h-[460px] w-full rounded-[30px] bg-[linear-gradient(135deg,rgba(77,225,255,0.95),rgba(255,122,195,0.88),rgba(255,209,102,0.82))] p-[2px] shadow-[0_28px_82px_rgba(34,211,238,0.18),0_18px_62px_rgba(244,114,182,0.14)] xl:h-full">
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/18 bg-[#101018]">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            role="region"
            aria-label="City map view"
          />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/72 p-6 text-center backdrop-blur-sm">
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
