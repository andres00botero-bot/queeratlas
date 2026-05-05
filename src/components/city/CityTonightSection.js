"use client";

import CityTonightHeader from "@/components/city/CityTonightHeader";
import TonightPublicFeedPanel from "@/components/city/TonightPublicFeedPanel";
import TonightVipFeedPanel from "@/components/city/TonightVipFeedPanel";

export default function CityTonightSection({
  sectionRef,
  cityName,
  tonightFeedTab,
  setTonightFeedTab,
  isMember,
  hostPrivateEventOpen,
  setHostPrivateEventOpen,
  redirectToJoin,
  eventsLoadError,
  fetchEvents,
  eventsLoading,
  featuredEvent,
  openEvent,
  setHoveredEventId,
  hoveredEventId,
  isFocusMode,
  selectedEvent,
  formatEventDateLabel,
  remainingEvents,
  openEventContribution,
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
  isSubmittingPrivateInvite,
  requestPrivateInvite,
  privateInviteRequesterProfiles,
  formatDate,
  respondPrivateInviteRequest,
  isUpdatingPrivateInviteStatus,
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
    <div
      ref={sectionRef}
      className="qa-city-section animate-cinematic-in relative mb-10 overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 shadow-[0_24px_82px_rgba(0,0,0,0.34)]"
      style={{ animationDelay: "195ms" }}
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-fuchsia-300/8 blur-3xl" />
      <CityTonightHeader
        cityName={cityName}
        tonightFeedTab={tonightFeedTab}
        isMember={isMember}
        hostPrivateEventOpen={hostPrivateEventOpen}
        onSetTonightFeedTab={setTonightFeedTab}
        onHostPrivatePlanFromPublic={() => {
          setTonightFeedTab("vip");
          setHostPrivateEventOpen(true);
        }}
        onJoinToHost={redirectToJoin}
        onToggleHostTonight={() => setHostPrivateEventOpen((current) => !current)}
      />

      {tonightFeedTab === "public" ? (
        <TonightPublicFeedPanel
          eventsLoadError={eventsLoadError}
          fetchEvents={fetchEvents}
          eventsLoading={eventsLoading}
          featuredEvent={featuredEvent}
          openEvent={openEvent}
          setHoveredEventId={setHoveredEventId}
          hoveredEventId={hoveredEventId}
          isFocusMode={isFocusMode}
          selectedEvent={selectedEvent}
          formatEventDateLabel={formatEventDateLabel}
          cityName={cityName}
          remainingEvents={remainingEvents}
          isMember={isMember}
          openEventContribution={openEventContribution}
          redirectToJoin={redirectToJoin}
        />
      ) : (
        <TonightVipFeedPanel
          privateEventsTableMissing={privateEventsTableMissing}
          privateEventsError={privateEventsError}
          privateEventsLoading={privateEventsLoading}
          cityPrivateEvents={cityPrivateEvents}
          getPrivateEventStatus={getPrivateEventStatus}
          user={user}
          privateEventInvites={privateEventInvites}
          privateInviteRequestsByEvent={privateInviteRequestsByEvent}
          pendingPrivateInviteCountByEvent={pendingPrivateInviteCountByEvent}
          expandedPrivateHostEventId={expandedPrivateHostEventId}
          setExpandedPrivateHostEventId={setExpandedPrivateHostEventId}
          formatEndsIn={formatEndsIn}
          privateFeedNowTick={privateFeedNowTick}
          privateEventTypeLabels={privateEventTypeLabels}
          formatDateTime={formatDateTime}
          deletePrivateEvent={deletePrivateEvent}
          deletingPrivateEventId={deletingPrivateEventId}
          isMember={isMember}
          isSubmittingPrivateInvite={isSubmittingPrivateInvite}
          requestPrivateInvite={requestPrivateInvite}
          privateInviteRequesterProfiles={privateInviteRequesterProfiles}
          formatDate={formatDate}
          respondPrivateInviteRequest={respondPrivateInviteRequest}
          isUpdatingPrivateInviteStatus={isUpdatingPrivateInviteStatus}
          hostPrivateEventOpen={hostPrivateEventOpen}
          privateEventForm={privateEventForm}
          setPrivateEventForm={setPrivateEventForm}
          privateEventStartPreview={privateEventStartPreview}
          privateEventExpiresPreview={privateEventExpiresPreview}
          submitPrivateEvent={submitPrivateEvent}
          isSubmittingPrivateEvent={isSubmittingPrivateEvent}
          privateEventTypes={privateEventTypes}
          todayIso={todayIso}
          router={router}
        />
      )}
    </div>
  );
}
