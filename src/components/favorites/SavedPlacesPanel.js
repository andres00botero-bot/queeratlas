"use client";

import VibeTagChips from "@/components/ui/VibeTagChips";

export default function SavedPlacesPanel({
  isAtlasLoading = false,
  savedPlaces = [],
  onOpenPlace,
  onQuickCheckin,
  onRemoveFavorite,
  onExploreCities,
  renderSkeleton,
}) {
  return (
    <section className="mb-8 rounded-[34px] border border-rose-200/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,rgba(30,16,24,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
            Saved places
          </h2>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-rose-200/70">
            Places with gravity
          </p>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Your core saved venues, ready to open fast when you plan your next move.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isAtlasLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`place-skeleton-${index}`}>{renderSkeleton?.()}</div>
          ))
        ) : savedPlaces.length > 0 ? (
          savedPlaces.map((place) => (
            <div
              key={place.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenPlace?.(place)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  onOpenPlace?.(place);
                }
              }}
              className="animate-rise-in cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-[2px] hover:border-rose-200/18 hover:shadow-[0_24px_70px_rgba(0,0,0,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/45"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    {place.city}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{place.name}</h3>
                </div>
                <div className="rounded-full border border-rose-200/10 bg-rose-200/[0.06] px-3 py-1 text-xs text-white/60">
                  ★ {place.avgRating?.toFixed(1) || "-"}
                </div>
              </div>

              <VibeTagChips
                entity={place}
                tone="rose"
                className="mt-3"
                includeTypeFallback
                includeMixedFallback
              />

              {place.description && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/46">
                  {place.description}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-2 text-xs text-white/52">
                <span>{place.reviewCount || 0} reviews</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onQuickCheckin?.(place);
                    }}
                    className="rounded-full border border-cyan-200/18 bg-cyan-200/[0.10] px-3 py-1 text-[11px] text-cyan-100/90 transition hover:border-cyan-200/30"
                  >
                    Check in
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveFavorite?.(place.id, place.name);
                    }}
                    className="rounded-full border border-rose-200/14 bg-rose-200/[0.08] px-3 py-1 text-[11px] text-rose-100/90 transition hover:border-rose-200/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/48 md:col-span-2 xl:col-span-3">
            <p>No saved places yet.</p>
            <button
              type="button"
              onClick={onExploreCities}
              className="mt-3 rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
            >
              Explore cities
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
