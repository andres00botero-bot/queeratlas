"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CityQuickNavigation({
  onGoHome,
  onGoMap,
  onGoEvents,
  onGoGuide,
  onGoServices,
  onGoVenues,
  onGoVenueType,
  venueJumpGroups = [],
  activeSection = "",
  activeVenueFilter = "",
  onAddPlace,
  onAddEvent,
  onAddService,
  variant = "default",
}) {
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  const venueGroups = useMemo(
    () =>
      (Array.isArray(venueJumpGroups) ? venueJumpGroups : [])
        .filter((group) => String(group?.value || "").trim())
        .map((group) => ({
          value: String(group.value),
          label: String(group.label || group.value),
          count: Number(group.count || 0),
        })),
    [venueJumpGroups]
  );

  const items = [
    {
      key: "map",
      onClick: onGoMap,
      label: "Map",
      eyebrow: "Primary jump",
      className:
        "border-cyan-200/34 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(59,130,246,0.20),rgba(12,10,18,0.94))] text-cyan-50 shadow-[0_14px_34px_rgba(34,211,238,0.18)] hover:border-cyan-200/55",
    },
    {
      key: "events",
      onClick: onGoEvents,
      label: "Tonight",
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
      onClick: () => {
        setShowVenuePicker((current) => !current);
      },
      label: "Venues",
      eyebrow: "Jump to",
      className:
        "border-amber-200/24 bg-amber-200/[0.08] text-amber-100 hover:border-amber-200/42",
    },
  ];

  const venueMenuItems = [
    { key: "club", label: "Clubs", value: "club" },
    { key: "bar", label: "Bars", value: "bar" },
    { key: "sauna", label: "Saunas", value: "sauna" },
    { key: "cruise_club", label: "Cruise clubs", value: "cruise_club" },
    { key: "cruising_area", label: "Cruise areas", value: "cruising_area" },
    { key: "cafe_restaurant", label: "Cafes and restaurants", value: "cafe_restaurant" },
    { key: "hotel", label: "Hotels", value: "hotel" },
  ];
  const isVenueTypeActive = (value) => {
    const current = String(activeVenueFilter || "").trim();
    const target = String(value || "").trim();
    if (!current || !target) return false;
    if (current === target) return true;
    if (target === "cafe_restaurant") {
      return current === "cafe" || current === "restaurant";
    }
    return false;
  };

  if (variant === "contribute") {
    return (
      <div
        aria-label="Contribute actions"
        className="qa-city-panel-cq rounded-[24px] border border-fuchsia-300/20 bg-[linear-gradient(160deg,rgba(217,70,239,0.10),rgba(10,10,16,0.9))] p-3 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur"
      >
        <div className="mb-2 px-1 text-[10px] uppercase tracking-[0.16em] text-fuchsia-100/85">Contribute</div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onAddPlace}
            className="qa-action w-full rounded-lg border border-white/14 bg-white/[0.03] px-3 py-2 text-left text-[13px] text-white/84 transition hover:border-white/28 hover:bg-white/[0.07] hover:text-white"
          >
            + Add place
          </button>
          <button
            type="button"
            onClick={onAddEvent}
            className="qa-action w-full rounded-lg border border-white/14 bg-white/[0.03] px-3 py-2 text-left text-[13px] text-white/84 transition hover:border-white/28 hover:bg-white/[0.07] hover:text-white"
          >
            + Add event
          </button>
          <button
            type="button"
            onClick={onAddService}
            className="qa-action w-full rounded-lg border border-white/14 bg-white/[0.03] px-3 py-2 text-left text-[13px] text-white/84 transition hover:border-white/28 hover:bg-white/[0.07] hover:text-white"
          >
            + Add service
          </button>
        </div>
      </div>
    );
  }

  if (variant === "rail") {
    const railItems = [
      { key: "home", label: "Home", onClick: onGoHome },
      { key: "guide", label: "Guide", onClick: onGoGuide },
      { key: "events", label: "Events", onClick: onGoEvents },
      { key: "services", label: "Services", onClick: onGoServices },
      {
        key: "venues",
        label: "Venues",
        onClick: () => {
          setShowVenuePicker((current) => !current);
        },
      },
    ];

    return (
      <nav
        aria-label="City sections"
        className="qa-city-panel-cq rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur"
      >
        <div className="mb-2 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">City Menu</div>
        <div className="space-y-2">
          {railItems.map((item) => {
            const isActive =
              activeSection === item.key || (activeSection === "venues" && item.key === "venues");
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (item.key !== "venues") {
                    setShowVenuePicker(false);
                  }
                  item.onClick?.();
                }}
                className={`qa-action w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "border-fuchsia-300/55 bg-[linear-gradient(135deg,rgba(217,70,239,0.24),rgba(99,102,241,0.24),rgba(12,10,18,0.95))] text-white shadow-[0_12px_28px_rgba(168,85,247,0.24)]"
                    : "border-white/14 bg-white/[0.03] text-white/82 hover:border-white/28 hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                  {item.key === "venues" ? (
                    <ChevronDown
                      className={`h-4 w-4 transition ${showVenuePicker ? "rotate-180" : "rotate-0"}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        {showVenuePicker ? (
          <div className="mt-3 rounded-xl border border-amber-200/22 bg-[linear-gradient(160deg,rgba(251,191,36,0.11),rgba(10,10,16,0.9))] p-2.5">
            <div className="mb-2 px-1 text-[10px] uppercase tracking-[0.16em] text-amber-100/80">Venue Types</div>
            <div className="space-y-1.5">
              {venueMenuItems.map((item) => {
                const isActive = isVenueTypeActive(item.value);
                return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onGoVenueType?.(item.value);
                  }}
                  aria-pressed={isActive}
                  className={`qa-action w-full rounded-lg border px-3 py-2 text-left text-[13px] transition ${
                    isActive
                      ? "border-amber-200/55 bg-amber-200/18 text-amber-50 shadow-[0_8px_22px_rgba(251,191,36,0.2)]"
                      : "border-white/14 bg-white/[0.03] text-white/82 hover:border-white/28 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
                );
              })}
            </div>
          </div>
        ) : null}

      </nav>
    );
  }

  return (
    <div
      className="qa-city-panel-cq animate-cinematic-in sticky top-3 z-30 mb-8 rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur"
      style={{ animationDelay: "170ms" }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Quick Navigation</p>
        <p className="text-[11px] text-white/62">You are here: {activeSection || "overview"}</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (item.key !== "venues") {
                setShowVenuePicker(false);
              }
              item.onClick?.();
            }}
            onMouseEnter={
              item.key === "venues"
                ? () => {
                    setShowVenuePicker(true);
                  }
                : undefined
            }
            className={`qa-cinematic-hover rounded-2xl border px-4 py-3 text-left text-sm transition ${item.className} ${
              activeSection === item.key || (activeSection === "venues" && item.key === "venues")
                ? "ring-1 ring-white/45"
                : ""
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] opacity-80">{item.eyebrow}</p>
            <p className="mt-1 flex items-center justify-between gap-2 font-semibold">
              <span>{item.label}</span>
              {item.key === "venues" ? (
                <ChevronDown
                  className={`h-3.5 w-3.5 transition ${showVenuePicker ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              ) : null}
            </p>
          </button>
        ))}
      </div>

      {showVenuePicker && venueGroups.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-amber-200/24 bg-[linear-gradient(140deg,rgba(251,191,36,0.13),rgba(12,10,9,0.9))] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-amber-100/75">Jump to venue vibe</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              key="venue-jump-all"
              type="button"
              onClick={() => {
                onGoVenues?.();
                setShowVenuePicker(false);
              }}
              className="qa-action rounded-full border border-white/30 bg-white/14 px-3 py-1.5 text-[11px] text-white transition hover:border-white/55 hover:bg-white/20"
            >
              All venues
            </button>
            {venueGroups.map((group) => {
              const isActive = isVenueTypeActive(group.value);
              return (
              <button
                key={`venue-jump-${group.value}`}
                type="button"
                onClick={() => {
                  onGoVenueType?.(group.value);
                }}
                aria-pressed={isActive}
                className={`qa-action rounded-full border px-3 py-1.5 text-[11px] transition ${
                  isActive
                    ? "border-amber-200/60 bg-amber-200/20 text-amber-50 shadow-[0_8px_20px_rgba(251,191,36,0.18)]"
                    : "border-amber-200/30 bg-amber-200/12 text-amber-100 hover:border-amber-200/55 hover:bg-amber-200/18"
                }`}
              >
                {group.label}
                {group.count > 0 ? ` • ${group.count}` : ""}
              </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

