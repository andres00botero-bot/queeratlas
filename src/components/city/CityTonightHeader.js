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
        <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/65">Events in {cityName}</p>
        <h2 className="mt-1 text-xl tracking-[0.02em] text-fuchsia-100">Events</h2>
        <p className="mt-1 text-xs text-white/62">
          Choose <span className="text-violet-100">Public</span> for official city events, or{" "}
          <span className="text-fuchsia-100">VIP / Invites</span> for private member plans.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex rounded-full border border-white/14 bg-black/40 p-1 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
          <button
            type="button"
            onClick={() => onSetTonightFeedTab("public")}
            className={`rounded-full px-3 py-1.5 transition ${
              tonightFeedTab === "public"
                ? "border border-cyan-200/50 bg-cyan-200/20 text-cyan-100 shadow-[0_8px_22px_rgba(34,211,238,0.18)]"
                : "text-white/68 hover:text-white"
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => onSetTonightFeedTab("vip")}
            className={`rounded-full px-3 py-1.5 transition ${
              tonightFeedTab === "vip"
                ? "border border-fuchsia-200/52 bg-fuchsia-200/22 text-fuchsia-100 shadow-[0_8px_22px_rgba(217,70,239,0.2)]"
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
              className="qa-cinematic-hover qa-action qa-action-strong rounded-full border border-fuchsia-200/40 bg-[linear-gradient(135deg,rgba(232,121,249,0.26),rgba(99,102,241,0.2),rgba(14,10,20,0.94))] px-4 py-2 text-xs font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/62"
            >
              Host private plan
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoinToHost}
              className="qa-cinematic-hover qa-action rounded-full border border-fuchsia-200/38 bg-fuchsia-200/18 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/56"
            >
              Join to host
            </button>
          )
        ) : isMember ? (
          <button
            type="button"
            onClick={onToggleHostTonight}
            className="qa-cinematic-hover qa-action qa-action-strong rounded-full border border-fuchsia-200/40 bg-[linear-gradient(135deg,rgba(232,121,249,0.26),rgba(99,102,241,0.2),rgba(14,10,20,0.94))] px-4 py-2 text-xs font-semibold text-fuchsia-50 transition hover:border-fuchsia-200/62"
          >
            {hostPrivateEventOpen ? "Close host form" : "Host tonight"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onJoinToHost}
            className="qa-cinematic-hover qa-action rounded-full border border-fuchsia-200/38 bg-fuchsia-200/18 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/56"
          >
            Join to host
          </button>
        )}
      </div>
    </div>
  );
}
