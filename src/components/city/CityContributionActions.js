"use client";

export default function CityContributionActions({
  addMode,
  addEventMode,
  addServiceMode,
  onToggleAddPlace,
  onToggleAddEvent,
  onToggleAddService,
}) {
  return (
    <div className="animate-cinematic-in mb-4 flex flex-wrap gap-2" style={{ animationDelay: "70ms" }}>
      <button
        onClick={onToggleAddPlace}
        className={`qa-action qa-action-strong rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
          addMode
            ? "qa-city-cta-tertiary border-red-300/60 bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.18)]"
            : "qa-city-cta-primary border-emerald-100/70 bg-gradient-to-r from-emerald-300 to-teal-200 text-black shadow-[0_16px_44px_rgba(45,212,191,0.22)]"
        }`}
        aria-pressed={addMode}
        aria-label={addMode ? "Cancel add place form" : "Open add place form"}
      >
        {addMode ? "Cancel adding" : "+ Add place"}
      </button>

      <button
        onClick={onToggleAddEvent}
        className={`qa-action qa-action-strong rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
          addEventMode
            ? "qa-city-cta-tertiary border-red-300/60 bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.18)]"
            : "qa-city-cta-primary border-violet-100/70 bg-gradient-to-r from-violet-300 to-fuchsia-200 text-black shadow-[0_16px_44px_rgba(192,132,252,0.22)]"
        }`}
        aria-pressed={addEventMode}
        aria-label={addEventMode ? "Cancel add event form" : "Open add event form"}
      >
        {addEventMode ? "Cancel event" : "+ Add event"}
      </button>

      <button
        onClick={onToggleAddService}
        className={`qa-action qa-action-strong rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
          addServiceMode
            ? "qa-city-cta-tertiary border-red-300/60 bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.18)]"
            : "qa-city-cta-primary border-sky-100/70 bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-200 text-black shadow-[0_16px_44px_rgba(56,189,248,0.22)] hover:brightness-105"
        }`}
        aria-pressed={addServiceMode}
        aria-label={addServiceMode ? "Cancel add service form" : "Open add service form"}
      >
        {addServiceMode ? "Cancel service" : "+ Add service"}
      </button>
    </div>
  );
}
