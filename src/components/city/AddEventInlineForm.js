"use client";

import DateInput from "@/components/ui/DateInput";
import VibeTagPicker from "@/components/ui/VibeTagPicker";

export default function AddEventInlineForm({
  addEventFormRef,
  eventName,
  setEventName,
  eventDescription,
  setEventDescription,
  eventVibeTags,
  setEventVibeTags,
  eventVibe,
  setEventVibe,
  eventLink,
  setEventLink,
  eventAddress,
  setEventAddress,
  eventStartDate,
  setEventStartDate,
  eventEndDate,
  setEventEndDate,
  onSaveEvent,
}) {
  return (
    <div ref={addEventFormRef} className="mb-6 space-y-3 rounded-[28px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(28,19,56,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(139,92,246,0.08)]">
      <input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="Event name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <textarea value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} placeholder="Description (what is this event?)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <VibeTagPicker
        value={eventVibeTags}
        onChange={setEventVibeTags}
        tone="violet"
        title="Event vibe tags"
        hint="Choose up to 3 tags for search and trip planner."
      />
      <input
        value={eventVibe}
        onChange={(event) => setEventVibe(event.target.value)}
        placeholder="Legacy vibe label (optional)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none"
      />
      <input value={eventLink} onChange={(event) => setEventLink(event.target.value)} placeholder="Event link (Instagram, RA, etc)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <input value={eventAddress} onChange={(event) => setEventAddress(event.target.value)} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
          <DateInput value={eventStartDate} onChange={(event) => setEventStartDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" tone="violet" />
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
          <DateInput value={eventEndDate} onChange={(event) => setEventEndDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" tone="violet" />
        </div>
      </div>
      <p className="text-[11px] text-white/50">Leave &quot;To&quot; empty for single-day events.</p>
      <button onClick={onSaveEvent} className="w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 font-semibold text-black">
        Save event
      </button>
    </div>
  );
}
