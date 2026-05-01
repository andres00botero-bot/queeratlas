import FavoritesCardSkeleton from "@/components/favorites/FavoritesCardSkeleton";
import { getMemberTitleMeta } from "@/lib/communityRanking";

export default function FavoritesPeopleSignalPanel({
  networkWarning = "",
  onRefresh,
  followingProfiles = [],
  suggestedMembers = [],
  followingFeedItems = [],
  followingIdSet = new Set(),
  networkLoading = false,
  onMessageMember,
  onToggleFollow,
  onSaveFromFeed,
}) {
  return (
    <section className="mb-6 rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_28%),linear-gradient(180deg,rgba(16,18,20,0.94),rgba(10,10,10,0.99))] p-4 shadow-[0_34px_94px_rgba(0,0,0,0.48)] sm:rounded-[32px] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">People signal</p>
          <h2 className="qa-title mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">
            Trusted members network
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Follow trusted members and pull signal from what they save.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="qa-action qa-action-strong rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
        >
          Refresh
        </button>
      </div>

      {networkWarning && (
        <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs text-amber-100/90">
          {networkWarning}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 shadow-[0_16px_44px_rgba(0,0,0,0.30)]">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Following now</p>
          <div className="mt-3 max-h-[240px] space-y-2 overflow-y-auto pr-1 sm:max-h-[300px]">
            {followingProfiles.length > 0 ? (
              followingProfiles.map((profile) => {
                const titleMeta = getMemberTitleMeta(profile.title || "");
                return (
                  <article
                    key={`following-profile-${profile.userId}`}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{profile.displayName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {profile.title ? (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}>
                              <span>{titleMeta.icon}</span>
                              {titleMeta.label}
                            </span>
                          ) : null}
                          {profile.rank ? (
                            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                              #{profile.rank}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs text-white/60">{profile.cityCount || 0} cities - {profile.score || 0} pts</p>
                        {profile.latestItemName ? (
                          <p className="mt-1 truncate text-[11px] text-cyan-100/72">
                            Latest: {profile.latestItemName}
                            {profile.latestItemCity ? ` - ${profile.latestItemCity}` : ""}
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] text-white/45">No recent shared save yet.</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onMessageMember?.(profile)}
                        className="qa-action rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-[1px] hover:border-cyan-200/44"
                      >
                        Message
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                Follow members to build your trusted inner circle.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 shadow-[0_16px_44px_rgba(0,0,0,0.30)]">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Members to follow</p>
          <div className="mt-3 max-h-[240px] space-y-2 overflow-y-auto pr-1 sm:max-h-[300px]">
            {networkLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <FavoritesCardSkeleton key={`member-skeleton-${index}`} />
              ))
            ) : suggestedMembers.length > 0 ? (
              suggestedMembers.map((member) => {
                const memberId = String(member.user_id || "");
                const isFollowing = followingIdSet.has(memberId);
                const titleMeta = getMemberTitleMeta(member.title || "");
                return (
                  <div
                    key={`member-suggest-${memberId}`}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {member.display_name || "Member"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {member.title ? (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}>
                              <span>{titleMeta.icon}</span>
                              {titleMeta.label}
                            </span>
                          ) : null}
                          {member.rank ? (
                            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                              #{member.rank}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleFollow?.(memberId)}
                        className={`qa-action qa-action-strong rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                          isFollowing
                            ? "border-fuchsia-200/30 bg-fuchsia-200/12 text-fuchsia-100"
                            : "border-cyan-200/25 bg-cyan-200/10 text-cyan-100 hover:border-cyan-200/40"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                No member signal yet. As community grows, top contributors appear here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 shadow-[0_16px_44px_rgba(0,0,0,0.30)]">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Saved by people you follow</p>
          <div className="mt-3 max-h-[240px] space-y-2 overflow-y-auto pr-1 sm:max-h-[300px]">
            {followingFeedItems.length > 0 ? (
              followingFeedItems.map((item, index) => (
                <div
                  key={`following-feed-${item.favoriteId}-${index}`}
                  className="rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {item.city || "City"} - {item.kind}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        Saved by {item.sourceName}
                        {item.sourceTitle ? ` - ${item.sourceTitle}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSaveFromFeed?.(item)}
                      className="qa-action rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-[1px] hover:border-cyan-200/44"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                Follow members to unlock trusted favorites feed.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
