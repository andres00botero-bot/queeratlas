"use client";

export default function SavedEventsPanel({
  isAtlasLoading = false,
  savedEvents = [],
  formatDate,
  onOpenEvent,
  onQuickCheckin,
  onRemoveFavorite,
  onBrowseEvents,
  renderSkeleton,
}) {
  return (
    <section className="rounded-[34px] border border-violet-200/10 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.12),transparent_28%),linear-gradient(180deg,rgba(26,18,46,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
            Saved events
          </h2>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-violet-200/70">
            Time-based queer signal
          </p>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Upcoming moments you saved, organized for timing and quick navigation.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isAtlasLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`event-skeleton-${index}`}>{renderSkeleton?.()}</div>
          ))
        ) : savedEvents.length > 0 ? (
          savedEvents.map((event) => (
            <div
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenEvent?.(event)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  onOpenEvent?.(event);
                }
              }}
              className="animate-rise-in cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-[2px] hover:border-violet-200/18 hover:shadow-[0_24px_70px_rgba(0,0,0,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    {event.city}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{event.name}</h3>
                </div>
                <div className="rounded-full border border-violet-200/10 bg-violet-200/[0.06] px-3 py-1 text-xs text-white/60">
                  {formatDate?.(event.date)}
                </div>
              </div>

              <p className="mt-3 text-sm text-violet-100/72">
                Community event
              </p>

              {event.description && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/46">
                  {event.description}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-2 text-xs text-white/52">
                <span>{event.link ? "External link available" : "Open on map"}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(itemEvent) => {
                      itemEvent.stopPropagation();
                      onQuickCheckin?.(event);
                    }}
                    className="rounded-full border border-cyan-200/18 bg-cyan-200/[0.10] px-3 py-1 text-[11px] text-cyan-100/90 transition hover:border-cyan-200/30"
                  >
                    Check in
                  </button>
                  <button
                    type="button"
                    onClick={(itemEvent) => {
                      itemEvent.stopPropagation();
                      onRemoveFavorite?.(`event-${event.id}`, event.name);
                    }}
                    className="rounded-full border border-violet-200/14 bg-violet-200/[0.08] px-3 py-1 text-[11px] text-violet-100/90 transition hover:border-violet-200/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/48 md:col-span-2 xl:col-span-3">
            <p>No saved events yet.</p>
            <button
              type="button"
              onClick={onBrowseEvents}
              className="mt-3 rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200/40"
            >
              Browse events
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
