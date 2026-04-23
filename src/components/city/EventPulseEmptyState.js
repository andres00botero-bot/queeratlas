"use client";

export default function EventPulseEmptyState({
  isMember = false,
  onPublishFirstEvent,
  onJoinToPublish,
  secondaryActionLabel = "",
  onSecondaryAction,
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-violet-200/22 bg-[linear-gradient(160deg,rgba(76,29,149,0.16),rgba(18,18,18,0.96))] px-5 py-8 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Event signal</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Event pulse is warming up</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
        This city&apos;s event lane is being refreshed. Check back soon, or add the first trusted event to kickstart
        the pulse.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {secondaryActionLabel ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="qa-cinematic-hover rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/80 hover:border-white/30 hover:text-white"
          >
            {secondaryActionLabel}
          </button>
        ) : null}
        {isMember ? (
          <button
            type="button"
            onClick={onPublishFirstEvent}
            className="qa-cinematic-hover rounded-full border border-violet-200/28 bg-violet-200/12 px-4 py-2 text-xs text-violet-100 hover:border-violet-200/46"
          >
            Publish first event
          </button>
        ) : (
          <button
            type="button"
            onClick={onJoinToPublish}
            className="qa-cinematic-hover rounded-full border border-violet-200/28 bg-violet-200/12 px-4 py-2 text-xs text-violet-100 hover:border-violet-200/46"
          >
            Join to publish
          </button>
        )}
      </div>
    </div>
  );
}
