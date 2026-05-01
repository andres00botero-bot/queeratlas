"use client";

export default function CityContributionActions({
  addMode,
  addEventMode,
  onToggleAddPlace,
  onToggleAddEvent,
  onAddService,
}) {
  return (
    <div className="animate-cinematic-in mb-4 flex flex-wrap gap-2" style={{ animationDelay: "70ms" }}>
      <button
        onClick={onToggleAddPlace}
        className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
          addMode
            ? "bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.16)]"
            : "bg-gradient-to-r from-emerald-300 to-teal-200 text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)]"
        }`}
        aria-pressed={addMode}
        aria-label={addMode ? "Cancel add place form" : "Open add place form"}
      >
        {addMode ? "Cancel adding" : "+ Add place"}
      </button>

      <button
        onClick={onToggleAddEvent}
        className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
          addEventMode
            ? "bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.16)]"
            : "bg-gradient-to-r from-violet-300 to-fuchsia-200 text-black shadow-[0_14px_40px_rgba(192,132,252,0.16)]"
        }`}
        aria-pressed={addEventMode}
        aria-label={addEventMode ? "Cancel add event form" : "Open add event form"}
      >
        {addEventMode ? "Cancel event" : "+ Add event"}
      </button>

      <button
        onClick={onAddService}
        className="rounded-full border border-pink-100/60 bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200 px-5 py-2.5 text-sm font-medium text-black transition hover:brightness-105"
        aria-label="Open add service form"
      >
        + Add service
      </button>
    </div>
  );
}
