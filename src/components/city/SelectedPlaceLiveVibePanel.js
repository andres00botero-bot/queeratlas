"use client";

import CompactLiveSignal from "@/components/city/CompactLiveSignal";

export default function SelectedPlaceLiveVibePanel({ liveVibeSummary, liveVibeUpdatedLabel, liveVibeTableMissing, handleSubmitLiveVibe, isSubmittingLiveVibe, liveVibeMyActiveSignalKey, liveVibeSubmittingKey, liveVibeJustSentKey, LIVE_VIBE_OPTIONS, isMember, liveVibeSelectedOption, isLoadingLiveVibe, liveVibeError, liveVibeCooldownRemainingSec }) {
  return <CompactLiveSignal context="venue" summary={liveVibeSummary} updatedLabel={liveVibeUpdatedLabel} activeSignalKey={liveVibeMyActiveSignalKey} submittingKey={liveVibeSubmittingKey} justSentKey={liveVibeJustSentKey} options={LIVE_VIBE_OPTIONS} onSubmit={handleSubmitLiveVibe} isSubmitting={isSubmittingLiveVibe} isMember={isMember} selectedOption={liveVibeSelectedOption} isLoading={isLoadingLiveVibe} error={liveVibeError} isUnavailable={liveVibeTableMissing} cooldownRemainingSec={liveVibeCooldownRemainingSec} />;
}
