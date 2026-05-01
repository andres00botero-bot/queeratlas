"use client";

export default function CityQuickNavigation({
  onGoEvents,
  onGoGuide,
  onGoServices,
  onGoVenues,
}) {
  const items = [
    {
      key: "events",
      onClick: onGoEvents,
      label: "Events",
      eyebrow: "Primary jump",
      className:
        "border-fuchsia-200/34 bg-[linear-gradient(135deg,rgba(232,121,249,0.24),rgba(99,102,241,0.20),rgba(12,10,18,0.94))] text-fuchsia-50 shadow-[0_14px_34px_rgba(217,70,239,0.2)] hover:border-fuchsia-200/55",
    },
    {
      key: "guide",
      onClick: onGoGuide,
      label: "Quick Guide",
      eyebrow: "Jump to",
      className:
        "border-cyan-200/24 bg-cyan-200/[0.08] text-cyan-100 hover:border-cyan-200/42",
    },
    {
      key: "services",
      onClick: onGoServices,
      label: "Services",
      eyebrow: "Jump to",
      className:
        "border-emerald-200/24 bg-emerald-200/[0.08] text-emerald-100 hover:border-emerald-200/42",
    },
    {
      key: "venues",
      onClick: onGoVenues,
      label: "Venues",
      eyebrow: "Jump to",
      className:
        "border-amber-200/24 bg-amber-200/[0.08] text-amber-100 hover:border-amber-200/42",
    },
  ];

  return (
    <div
      className="qa-city-panel-cq animate-cinematic-in mb-8 rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.26)]"
      style={{ animationDelay: "170ms" }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Quick Navigation</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`qa-cinematic-hover rounded-2xl border px-4 py-3 text-left text-sm transition ${item.className}`}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] opacity-80">{item.eyebrow}</p>
            <p className="mt-1 font-semibold">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
