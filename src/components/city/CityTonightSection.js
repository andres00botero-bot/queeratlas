"use client";

import CityTonightHeader from "@/components/city/CityTonightHeader";
import TonightPublicFeedPanel from "@/components/city/TonightPublicFeedPanel";
import TonightVipFeedPanel from "@/components/city/TonightVipFeedPanel";

export default function CityTonightSection({
  sectionRef,
  city,
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
      className="qa-city-section qa-city-content-section qa-city-tone-events qa-city-copy-left animate-cinematic-in relative mb-10 overflow-hidden rounded-[28px] border p-5 sm:p-6"
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
          city={city}
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
