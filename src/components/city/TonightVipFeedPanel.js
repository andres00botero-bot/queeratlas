"use client";

import DateInput from "@/components/ui/DateInput";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import VipFeedStatusAlerts from "@/components/city/VipFeedStatusAlerts";
import { fallbackMemberAlias } from "@/features/city/vipFeature";

export default function TonightVipFeedPanel({
  privateEventsTableMissing,
  privateEventsError,
  privateEventsLoading,
  cityPrivateEvents,
  getPrivateEventStatus,
  user,
  privateEventInvites,
  privateInviteRequestsByEvent,
  pendingPrivateInviteCountByEvent,
  expandedPrivateHostEventId,
  setExpandedPrivateHostEventId,
  formatEndsIn,
  privateFeedNowTick,
  privateEventTypeLabels,
  formatDateTime,
  deletePrivateEvent,
  deletingPrivateEventId,
  isMember,
  isSubmittingPrivateInvite,
  requestPrivateInvite,
  privateInviteRequesterProfiles,
  formatDate,
  respondPrivateInviteRequest,
  isUpdatingPrivateInviteStatus,
  hostPrivateEventOpen,
  privateEventForm,
  setPrivateEventForm,
  privateEventStartPreview,
  privateEventExpiresPreview,
  submitPrivateEvent,
  isSubmittingPrivateEvent,
  privateEventTypes,
  todayIso,
  router,
}) {
  return (
    <div className="space-y-3">
      <VipFeedStatusAlerts
        privateEventsTableMissing={privateEventsTableMissing}
        privateEventsError={privateEventsError}
      />
      {privateEventsLoading ? (
        <div className="rounded-2xl border border-fuchsia-200/10 bg-fuchsia-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-fuchsia-100/60">Loading VIP feed</p>
          <SectionSkeleton tone="fuchsia" rows={2} />
        </div>
      ) : null}

      {!privateEventsLoading && cityPrivateEvents.map((item) => {
        const status = getPrivateEventStatus(item);
        const isHost = String(item.host_user_id || "") === String(user?.id || "");
        const inviteStatus = String(privateEventInvites[String(item.id)] || "");
        const canSeeExactLocation = isHost || inviteStatus === "accepted";
        const displayArea = canSeeExactLocation
          ? String(item.exact_location || item.approx_area || "TBA")
          : String(item.approx_area || "TBA");
        const requestRows = privateInviteRequestsByEvent[String(item.id)] || [];
        const pendingRequestsCount = pendingPrivateInviteCountByEvent[String(item.id)] || 0;
        const isExpandedHostCard = String(expandedPrivateHostEventId) === String(item.id);
        const endsInLabel = formatEndsIn(item.expires_at, privateFeedNowTick);
        const inviteLabelMap = {
          requested: "Invite requested",
          accepted: "Invite accepted",
          declined: "Invite declined",
          cancelled: "Invite cancelled",
        };

        return (
          <article key={String(item.id)} className="qa-cinematic-hover rounded-[22px] border border-fuchsia-200/18 bg-[linear-gradient(160deg,rgba(86,15,96,0.22),rgba(18,18,18,0.96))] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">
                Invite-only
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                status.key === "live"
                  ? "border-emerald-200/30 bg-emerald-200/14 text-emerald-100"
                  : "border-cyan-200/30 bg-cyan-200/14 text-cyan-100"
              }`}>
                {status.label}
              </span>
              <span className="rounded-full border border-white/15 bg-white/7 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80">
                {privateEventTypeLabels[String(item.event_type || "")] || "Private event"}
              </span>
              {endsInLabel ? (
                <span className="rounded-full border border-amber-200/24 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                  {endsInLabel}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-white/70">
              {canSeeExactLocation ? "Location" : "Area"}: {displayArea}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">
              Starts {formatDateTime(item.start_at)} · Ends {formatDateTime(item.expires_at)}
            </p>
            {item.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-white/64">{item.notes}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                Host: {String(item.host_alias || "Member").trim() || "Member"}
              </span>
              {isHost ? (
                <>
                  <span className="rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] text-cyan-100">
                    You host this
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedPrivateHostEventId((current) => (
                      String(current) === String(item.id) ? "" : String(item.id)
                    ))}
                    className={`qa-cinematic-hover rounded-full border px-3 py-1 text-[11px] transition ${
                      pendingRequestsCount > 0
                        ? "qa-attn-soft border-amber-200/40 bg-amber-200/14 text-amber-100 hover:border-amber-200/60"
                        : "border-cyan-200/26 bg-cyan-200/12 text-cyan-100 hover:border-cyan-200/45"
                    }`}
                  >
                    Requests ({requestRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePrivateEvent(item)}
                    disabled={deletingPrivateEventId === String(item.id)}
                    className="qa-cinematic-hover rounded-full border border-rose-200/28 bg-rose-200/12 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingPrivateEventId === String(item.id) ? "Deleting..." : "Delete event"}
                  </button>
                </>
              ) : inviteStatus ? (
                <>
                  <span className="rounded-full border border-violet-200/26 bg-violet-200/12 px-3 py-1 text-[11px] text-violet-100">
                    {inviteLabelMap[inviteStatus] || "Invite status"}
                  </span>
                  {inviteStatus === "accepted" && String(item.host_user_id || "").trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        const hostId = encodeURIComponent(String(item.host_user_id || "").trim());
                        const hostName = encodeURIComponent(String(item.host_alias || "Host").trim() || "Host");
                        router.push(`/messages?user=${hostId}&name=${hostName}&compose=1`);
                      }}
                      className="qa-cinematic-hover rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-200/45"
                    >
                      Contact host
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => requestPrivateInvite(item)}
                  disabled={!isMember || isSubmittingPrivateInvite || privateEventsTableMissing}
                  className="qa-cinematic-hover rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-3 py-1.5 text-[11px] text-fuchsia-100 transition hover:border-fuchsia-200/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Request invite
                </button>
              )}
            </div>
            {isHost && isExpandedHostCard ? (
              <div className="mt-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.06] p-3">
                {requestRows.length === 0 ? (
                  <p className="text-xs text-white/62">No invite requests yet.</p>
                ) : (
                  <div className="space-y-2">
                    {requestRows.map((request) => {
                      const requestStatus = String(request.status || "requested");
                      const requesterId = String(request.requester_user_id || "").trim();
                      const requesterAlias = String(privateInviteRequesterProfiles[requesterId] || "").trim()
                        || fallbackMemberAlias(requesterId);
                      const requesterInitial = requesterAlias.charAt(0).toUpperCase() || "M";
                      return (
                        <div key={String(request.id)} className="rounded-xl border border-white/12 bg-black/25 p-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/12 text-[11px] font-semibold text-cyan-100">
                                {requesterInitial}
                              </span>
                              <p className="text-xs text-white/75">
                                {requesterAlias} · {formatDate(request.created_at)}
                              </p>
                            </div>
                            <span className="rounded-full border border-white/16 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/80">
                              {requestStatus}
                            </span>
                          </div>
                          {request.message ? (
                            <p className="mt-1 text-xs text-white/65 line-clamp-2">{request.message}</p>
                          ) : null}
                          {requestStatus === "requested" ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => respondPrivateInviteRequest(request, "accepted")}
                                disabled={isUpdatingPrivateInviteStatus}
                                className="rounded-full border border-emerald-200/28 bg-emerald-200/12 px-2.5 py-1 text-[11px] text-emerald-100 transition hover:border-emerald-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => respondPrivateInviteRequest(request, "declined")}
                                disabled={isUpdatingPrivateInviteStatus}
                                className="rounded-full border border-rose-200/28 bg-rose-200/12 px-2.5 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </article>
        );
      })}

      {!privateEventsLoading && cityPrivateEvents.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(67,20,69,0.35),rgba(14,14,14,0.96))] px-5 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/70">VIP signal</p>
          <h3 className="mt-2 text-lg font-semibold text-white">No invite-only plans yet</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
            Be first to host a private afterparty, chill session, or invite-only gathering for tonight.
          </p>
        </div>
      ) : null}

      {hostPrivateEventOpen && isMember ? (
        <form onSubmit={submitPrivateEvent} className="rounded-[24px] border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(50,18,56,0.55),rgba(14,14,14,0.98))] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/70">Host a private plan</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={privateEventForm.title}
              onChange={(event) => setPrivateEventForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Title (e.g. Rooftop afterparty)"
              className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
              maxLength={120}
              required
            />
            <select
              value={privateEventForm.eventType}
              onChange={(event) => setPrivateEventForm((current) => ({ ...current, eventType: event.target.value }))}
              className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
            >
              {privateEventTypes.map((entry) => (
                <option key={entry.value} value={entry.value}>{entry.label}</option>
              ))}
            </select>
            <DateInput
              value={privateEventForm.startDate}
              onChange={(event) => setPrivateEventForm((current) => ({ ...current, startDate: event.target.value }))}
              className="w-full"
              tone="violet"
              required
              min={todayIso || undefined}
            />
            <div className="relative">
              <input
                type="time"
                value={privateEventForm.startTime}
                onChange={(event) => setPrivateEventForm((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/12 bg-black/30 p-3 pr-20 text-sm text-white outline-none focus:border-fuchsia-200/45"
                required
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-white/14 bg-white/8 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
                Time
              </span>
            </div>
            <input
              value={privateEventForm.approxArea}
              onChange={(event) => setPrivateEventForm((current) => ({ ...current, approxArea: event.target.value }))}
              placeholder="Approx area (not exact address)"
              className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
              maxLength={120}
              required
            />
            <input
              value={privateEventForm.exactLocation}
              onChange={(event) => setPrivateEventForm((current) => ({ ...current, exactLocation: event.target.value }))}
              placeholder="Exact location (visible only to accepted)"
              className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45 md:col-span-2"
              maxLength={180}
            />
          </div>
          <textarea
            value={privateEventForm.notes}
            onChange={(event) => setPrivateEventForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Optional notes"
            className="mt-3 min-h-[84px] w-full rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
            maxLength={320}
          />
          <p className="mt-2 text-[11px] text-white/55">
            Invite-only. Event auto-expires 24h after your selected start.
          </p>
          {privateEventStartPreview ? (
            <p className="mt-1 text-[11px] text-fuchsia-100/80">
              Starts {formatDateTime(privateEventStartPreview)} · Expires {formatDateTime(privateEventExpiresPreview)}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmittingPrivateEvent || privateEventsTableMissing}
            className="qa-cinematic-hover mt-3 rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-4 py-2 text-xs text-fuchsia-100 transition hover:border-fuchsia-200/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmittingPrivateEvent ? "Posting..." : "Post private event"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
