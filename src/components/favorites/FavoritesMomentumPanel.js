export default function FavoritesMomentumPanel({
  thisWeekAdds = 0,
  allCitiesCount = 0,
  recentSaves = [],
  onOpenSavedItem,
  timeAgo,
  momentumMilestones,
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_85%_14%,rgba(244,114,182,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.34)] max-[390px]:rounded-[18px] max-[390px]:p-2.5">
      <div className="pointer-events-none absolute -left-10 top-0 h-20 w-20 rounded-full bg-cyan-300/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-12 top-4 h-24 w-24 rounded-full bg-fuchsia-300/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80 max-[390px]:text-[10px]">Your signal</p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 max-[390px]:mt-2">
        <div className="rounded-2xl border border-cyan-200/14 bg-black/28 p-3 max-[390px]:rounded-xl max-[390px]:p-2.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/74">Added this week</p>
          <p className="mt-1.5 text-2xl font-semibold text-white max-[390px]:text-xl">{thisWeekAdds}</p>
        </div>
        <div className="rounded-2xl border border-fuchsia-200/14 bg-black/28 p-3 max-[390px]:rounded-xl max-[390px]:p-2.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/74">Cities touched</p>
          <p className="mt-1.5 text-2xl font-semibold text-white max-[390px]:text-xl">{allCitiesCount}</p>
        </div>
      </div>

      <div className="mt-2.5 rounded-2xl border border-white/12 bg-black/24 p-3 max-[390px]:rounded-xl max-[390px]:p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-200/75">Latest activity</p>
          <span className="text-[11px] text-white/58">Last {Math.min(recentSaves.length, 5)} saves</span>
        </div>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 max-[390px]:mt-2">
          {recentSaves.length > 0 ? (
            recentSaves.map((item) => (
              <button
                key={`momentum-activity-${item.type}-${item.id}`}
                type="button"
                onClick={() => onOpenSavedItem?.(item)}
                className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-left text-[11px] text-white/86 transition hover:-translate-y-[1px] hover:border-cyan-200/26 hover:bg-white/14 max-[390px]:gap-1.5 max-[390px]:px-2.5 max-[390px]:py-1 max-[390px]:text-[10px]"
              >
                <span className="truncate max-w-[160px] max-[390px]:max-w-[125px]">
                  {item.type === "place" ? "Place" : "Event"}: {item.name}
                </span>
                <span className="text-white/50">{timeAgo(item.date)}</span>
              </button>
            ))
          ) : (
            <p className="text-xs text-white/45">
              No recent saves yet. Save places or events to build momentum.
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 rounded-2xl border border-white/12 bg-black/24 p-3 max-[390px]:rounded-xl max-[390px]:p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-200/75">Momentum milestones</p>
          <span className="text-[11px] text-white/58">
            {momentumMilestones.completed}/{momentumMilestones.total}
          </span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-300 transition-[width] duration-500"
            style={{ width: `${Math.max(8, Math.round(momentumMilestones.overallProgress * 100))}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/58">
          {momentumMilestones.nextMilestone
            ? `Next: ${momentumMilestones.nextMilestone.label} (${Math.min(
                momentumMilestones.nextMilestone.current,
                momentumMilestones.nextMilestone.target
              )}/${momentumMilestones.nextMilestone.target})`
            : "All core milestones completed. Keep your signal active this week."}
        </p>
        <div className="mt-2.5 grid gap-2 max-[390px]:mt-2">
          {momentumMilestones.items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-3 py-2 text-xs transition max-[390px]:px-2.5 max-[390px]:py-1.5 max-[390px]:text-[11px] ${
                item.done
                  ? "border-cyan-200/30 bg-cyan-200/10 text-cyan-100"
                  : "border-white/10 bg-black/20 text-white/72"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{item.label}</span>
                <span className="text-[11px]">
                  {Math.min(item.current, item.target)}/{item.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
