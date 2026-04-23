"use client";

export default function VipFeedStatusAlerts({
  privateEventsTableMissing = false,
  privateEventsError = "",
}) {
  return (
    <>
      {privateEventsTableMissing ? (
        <div className="rounded-2xl border border-amber-300/24 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          VIP invites are not activated in DB yet. Run <code>supabase/vip-invites-v1.sql</code> first.
        </div>
      ) : null}
      {privateEventsError ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          {privateEventsError}
        </div>
      ) : null}
    </>
  );
}
