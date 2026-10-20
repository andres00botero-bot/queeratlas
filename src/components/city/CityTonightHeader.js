"use client";

export default function CityTonightHeader({
  cityName,
  tonightFeedTab,
  isMember,
  hostPrivateEventOpen,
  onSetTonightFeedTab,
  onHostPrivatePlanFromPublic,
  onJoinToHost,
  onToggleHostTonight,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#e8a47c]/78">Events in {cityName}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.01em] text-white">Events</h2>
        <p className="mt-1 text-sm leading-6 text-white/58">
          Public listings and member plans for the city.
        </p>
        <p className="mt-2 text-xs text-[#e8a47c]/78">Invite-only plans share an area first; the exact location is shared only after acceptance.</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex rounded-full border border-white/14 bg-black/34 p-1 text-xs shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
          <button
            type="button"
            onClick={() => onSetTonightFeedTab("public")}
            className={`qa-action qa-city-card rounded-full px-3 py-1.5 transition ${
              tonightFeedTab === "public"
                ? "bg-[#e8a47c] text-[#211b33]"
                : "text-white/68 hover:text-white"
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => onSetTonightFeedTab("vip")}
            className={`qa-action qa-city-card rounded-full px-3 py-1.5 transition ${
              tonightFeedTab === "vip"
                ? "bg-[#d79acd] text-[#261728]"
                : "text-white/68 hover:text-white"
            }`}
          >
            VIP / Invites
          </button>
        </div>

        {tonightFeedTab === "public" ? (
          isMember ? (
            <button
              type="button"
              onClick={onHostPrivatePlanFromPublic}
              className="qa-cinematic-hover qa-action qa-action-strong qa-city-cta-primary rounded-full bg-[#e8a47c] px-4 py-2 text-xs font-semibold text-[#211b33] transition hover:bg-[#f1ba98]"
            >
              Host a private plan
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoinToHost}
              className="qa-cinematic-hover qa-action qa-city-cta-secondary rounded-full border border-white/24 bg-white/8 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40"
            >
              Join to host
            </button>
          )
        ) : isMember ? (
          <button
            type="button"
            onClick={onToggleHostTonight}
            className="qa-cinematic-hover qa-action qa-action-strong qa-city-cta-primary rounded-full bg-[#e8a47c] px-4 py-2 text-xs font-semibold text-[#211b33] transition hover:bg-[#f1ba98]"
          >
            {hostPrivateEventOpen ? "Close host form" : "Host tonight"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onJoinToHost}
            className="qa-cinematic-hover qa-action qa-city-cta-secondary rounded-full border border-white/24 bg-white/8 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40"
          >
            Join to host
          </button>
        )}
      </div>
    </div>
  );
}
