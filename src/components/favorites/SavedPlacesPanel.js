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
    <section className="qa-premium-card mb-6 rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(244,114,182,0.06),transparent_26%),linear-gradient(180deg,rgba(18,18,20,0.92),rgba(10,10,10,0.99))] p-4 shadow-[0_36px_108px_rgba(0,0,0,0.50)] sm:rounded-[32px] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="qa-title mt-1 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">
            Saved places
          </h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">
            Places with gravity
          </p>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Your core saved venues, ready to open fast when you plan your next move.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
              className="qa-premium-card animate-rise-in cursor-pointer rounded-[22px] border border-white/12 bg-[radial-gradient(circle_at_14%_10%,rgba(56,189,248,0.07),transparent_32%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-3.5 shadow-[0_20px_56px_rgba(0,0,0,0.34)] transition duration-300 hover:-translate-y-[2px] hover:border-cyan-200/24 hover:shadow-[0_28px_76px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 sm:rounded-[24px] sm:p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    {place.city}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{place.name}</h3>
                </div>
                <div className="rounded-full border border-white/14 bg-white/[0.07] px-3 py-1 text-xs text-white/70">
                  Rating {place.avgRating?.toFixed(1) || "-"}
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
                    className="qa-action qa-action-strong rounded-full border border-cyan-200/22 bg-cyan-200/[0.14] px-3 py-1 text-[11px] text-cyan-100/90 transition hover:-translate-y-[1px] hover:border-cyan-200/34"
                  >
                    Check in
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveFavorite?.(place.id, place.name);
                    }}
                    className="qa-action rounded-full border border-white/16 bg-white/[0.10] px-3 py-1 text-[11px] text-white/85 transition hover:-translate-y-[1px] hover:border-white/34"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 px-5 py-8 text-sm text-white/48 md:col-span-2 xl:col-span-3">
            <p>No saved places yet.</p>
            <button
              type="button"
              onClick={onExploreCities}
            className="qa-action qa-action-strong mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-[1px] hover:border-cyan-200/40"
            >
              Explore cities
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
