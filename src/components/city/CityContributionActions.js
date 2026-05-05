"use client";

export default function CityContributionActions({
  addMode,
  addEventMode,
  addServiceMode,
  onToggleAddPlace,
  onToggleAddEvent,
  onToggleAddService,
}) {
  const baseButton =
    "qa-action qa-cinematic-hover relative isolate inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[0.01em] transition duration-300";

  const toneStyles = {
    place: {
      idle: "border-cyan-200/24 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] text-white/88 shadow-[0_18px_44px_rgba(56,189,248,0.1)] hover:border-cyan-200/42",
      active:
        "border-cyan-200/52 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(30,41,59,0.9),rgba(10,10,10,1))] text-cyan-50 shadow-[0_22px_58px_rgba(56,189,248,0.2)]",
      accent: "from-cyan-300 to-sky-300",
    },
    event: {
      idle: "border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] text-white/88 shadow-[0_18px_44px_rgba(217,70,239,0.1)] hover:border-fuchsia-200/42",
      active:
        "border-fuchsia-200/52 bg-[linear-gradient(135deg,rgba(232,121,249,0.26),rgba(46,16,73,0.82),rgba(10,10,10,1))] text-fuchsia-50 shadow-[0_22px_58px_rgba(217,70,239,0.2)]",
      accent: "from-fuchsia-300 to-violet-300",
    },
    service: {
      idle: "border-emerald-200/24 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] text-white/88 shadow-[0_18px_44px_rgba(45,212,191,0.1)] hover:border-emerald-200/42",
      active:
        "border-emerald-200/52 bg-[linear-gradient(135deg,rgba(52,211,153,0.24),rgba(18,52,59,0.86),rgba(10,10,10,1))] text-emerald-50 shadow-[0_22px_58px_rgba(45,212,191,0.2)]",
      accent: "from-emerald-300 to-teal-300",
    },
  };

  const renderButton = ({ active, onClick, ariaLabelOpen, ariaLabelClose, labelIdle, labelActive, tone }) => {
    const toneStyle = toneStyles[tone];
    return (
      <button
        onClick={onClick}
        className={`${baseButton} ${active ? toneStyle.active : toneStyle.idle}`}
        aria-pressed={active}
        aria-label={active ? ariaLabelClose : ariaLabelOpen}
      >
        <span className={`h-1.5 w-7 rounded-full bg-gradient-to-r transition-all duration-300 ${toneStyle.accent} ${active ? "w-10" : ""}`} />
        <span>{active ? labelActive : labelIdle}</span>
      </button>
    );
  };

  return (
    <div className="animate-cinematic-in mb-4 flex flex-wrap items-center gap-2" style={{ animationDelay: "70ms" }}>
      {renderButton({
        active: addMode,
        onClick: onToggleAddPlace,
        ariaLabelOpen: "Open add place form",
        ariaLabelClose: "Cancel add place form",
        labelIdle: "+ Add place",
        labelActive: "Cancel adding",
        tone: "place",
      })}
      {renderButton({
        active: addEventMode,
        onClick: onToggleAddEvent,
        ariaLabelOpen: "Open add event form",
        ariaLabelClose: "Cancel add event form",
        labelIdle: "+ Add event",
        labelActive: "Cancel event",
        tone: "event",
      })}
      {renderButton({
        active: addServiceMode,
        onClick: onToggleAddService,
        ariaLabelOpen: "Open add service form",
        ariaLabelClose: "Cancel add service form",
        labelIdle: "+ Add service",
        labelActive: "Cancel service",
        tone: "service",
      })}
    </div>
  );
}
