"use client";

import CompactLiveSignal from "@/components/city/CompactLiveSignal";

export default function SelectedEventLiveVibePanel({ LIVE_VIBE_OPTIONS, eventLiveVibeSignalKey, isSubmittingEventLiveVibe, eventLiveVibeSubmittingKey, eventLiveVibeJustSentKey, handleSubmitEventLiveVibe, isMember, eventLiveVibeSelectedOption }) {
  return <CompactLiveSignal context="event" activeSignalKey={eventLiveVibeSignalKey} submittingKey={eventLiveVibeSubmittingKey} justSentKey={eventLiveVibeJustSentKey} options={LIVE_VIBE_OPTIONS} onSubmit={handleSubmitEventLiveVibe} isSubmitting={isSubmittingEventLiveVibe} isMember={isMember} selectedOption={eventLiveVibeSelectedOption} />;
}
