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
      className="qa-city-section animate-cinematic-in mb-10 rounded-[34px] border border-fuchsia-300/14 bg-[linear-gradient(180deg,rgba(38,20,44,0.84),rgba(10,10,10,0.98))] p-6 shadow-[0_18px_52px_rgba(217,70,239,0.08)]"
      style={{ animationDelay: "195ms" }}
    >
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
