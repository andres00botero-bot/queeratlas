"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronDown, HeartHandshake, Map, MapPin } from "lucide-react";

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
  const isPhoneVariant = variant === "phone";
  const isDesktopVariant = variant === "desktop";

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
      key: "home",
      onClick: onGoHome,
      label: "Home",
      eyebrow: "City overview",
      Icon: BookOpen,
      className:
        "border-[#f5a9c6]/20 bg-[#f5a9c6]/[0.075] text-[#ffd2e3] hover:border-[#f5a9c6]/42 hover:bg-[#f5a9c6]/[0.12]",
    },
    {
      key: "map",
      onClick: onGoMap,
      label: "Map",
      eyebrow: "Explore nearby",
      Icon: Map,
      className:
        "border-[#88d9d4]/20 bg-[#88d9d4]/[0.075] text-[#bcebe7] hover:border-[#88d9d4]/42 hover:bg-[#88d9d4]/[0.12]",
    },
    {
      key: "events",
      onClick: onGoEvents,
      label: "Events",
      eyebrow: "Tonight and soon",
      Icon: CalendarDays,
      className:
        "border-[#b7a0f7]/20 bg-[#b7a0f7]/[0.075] text-[#d8cdfb] hover:border-[#b7a0f7]/42 hover:bg-[#b7a0f7]/[0.12]",
    },
    {
      key: "guide",
      onClick: onGoGuide,
      label: "Guide",
      eyebrow: "City basics",
      Icon: BookOpen,
      className:
        "border-[#f5a9c6]/20 bg-[#f5a9c6]/[0.075] text-[#ffd2e3] hover:border-[#f5a9c6]/42 hover:bg-[#f5a9c6]/[0.12]",
    },
    {
      key: "services",
      onClick: onGoServices,
      label: "Services",
      eyebrow: "Local support",
      Icon: HeartHandshake,
      className:
        "border-[#88d9d4]/20 bg-[#88d9d4]/[0.055] text-[#bcebe7] hover:border-[#88d9d4]/42 hover:bg-[#88d9d4]/[0.10]",
    },
    {
      key: "venues",
      onClick: () => {
        setShowVenuePicker((current) => !current);
      },
      label: "Venues",
      eyebrow: "Bars and places",
      Icon: MapPin,
      className:
        "border-white/[0.11] bg-white/[0.045] text-white/86 hover:border-[#f5a9c6]/36 hover:bg-[#f5a9c6]/[0.08]",
    },
  ];
  const visibleItems = isPhoneVariant
    ? [items[3], items[2], items[4], items[5]]
    : isDesktopVariant
      ? [items[0], items[3], items[2], items[4], items[5]]
      : items.slice(1);

  const venueMenuItems = [
    { key: "club", label: "Clubs", value: "club" },
    { key: "bar", label: "Bars", value: "bar" },
    { key: "sauna", label: "Saunas", value: "sauna" },
    { key: "cruise_club", label: "Cruise clubs", value: "cruise_club" },
    { key: "cruising_area", label: "Cruise areas", value: "cruising_area" },
    { key: "cafe_restaurant", label: "Cafes and restaurants", value: "cafe_restaurant" },
    { key: "hotel", label: "Hotels", value: "hotel" },
    { key: "store", label: "Stores", value: "store" },
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
        className="qa-city-panel-cq rounded-[24px] border border-white/18 bg-[linear-gradient(145deg,rgba(255,79,163,0.16),rgba(34,211,238,0.12),rgba(15,18,24,0.92))] p-3.5 shadow-[0_18px_52px_rgba(91,33,182,0.18)] backdrop-blur"
      >
        <div className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/64">Contribute</div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onAddPlace}
            className="qa-action w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 py-2.5 text-left text-[13px] text-white/82 transition hover:border-cyan-100/32 hover:bg-white/[0.08] hover:text-white"
          >
            + Add place
          </button>
          <button
            type="button"
            onClick={onAddEvent}
            className="qa-action w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 py-2.5 text-left text-[13px] text-white/82 transition hover:border-fuchsia-100/32 hover:bg-white/[0.08] hover:text-white"
          >
            + Add event
          </button>
          <button
            type="button"
            onClick={onAddService}
            className="qa-action w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 py-2.5 text-left text-[13px] text-white/82 transition hover:border-emerald-100/32 hover:bg-white/[0.08] hover:text-white"
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
        className="qa-city-panel-cq relative overflow-hidden rounded-[26px] border border-white/18 bg-[linear-gradient(150deg,rgba(255,79,163,0.14),rgba(34,211,238,0.10),rgba(13,15,22,0.95))] p-3.5 shadow-[0_24px_64px_rgba(91,33,182,0.22)] backdrop-blur"
      >
        <div className="relative mb-3 px-2 py-1">
          <span className="inline-flex rounded-full border border-amber-100/30 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(244,114,182,0.12),rgba(255,255,255,0.08))] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.22em] text-amber-50 shadow-[0_12px_30px_rgba(251,191,36,0.12)]">
            City Menu
          </span>
        </div>
        <div className="mb-2 h-px w-full bg-[linear-gradient(90deg,transparent,#ff7ac3,#4de1ff,transparent)] opacity-70" />
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
                className={`qa-action relative w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "border-cyan-100/52 bg-cyan-200/[0.18] text-white shadow-[0_10px_28px_rgba(34,211,238,0.18)]"
                    : "border-white/14 bg-white/[0.055] text-white/82 hover:border-white/30 hover:bg-white/[0.10]"
                }`}
              >
                {isActive ? (
                  <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-cyan-200" />
                ) : null}
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
          <div className="mt-3 rounded-xl border border-white/12 bg-black/22 p-2.5">
            <div className="mb-2 px-1 text-[10px] uppercase tracking-[0.16em] text-white/56">Venue Types</div>
            <div className="space-y-1.5">
              {venueMenuItems.map((item) => {
                const isActive = isVenueTypeActive(item.value);
                return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onGoVenueType?.(item.value);
                    setShowVenuePicker(false);
                  }}
                  aria-pressed={isActive}
                  className={`qa-action w-full rounded-lg border px-3 py-2 text-left text-[13px] transition ${
                    isActive
                      ? "border-cyan-200/48 bg-cyan-200/14 text-cyan-50"
                      : "border-white/10 bg-white/[0.03] text-white/78 hover:border-white/24 hover:bg-white/[0.07] hover:text-white"
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
      className={`qa-city-panel-cq animate-cinematic-in z-30 sm:top-3 sm:mb-8 sm:rounded-[24px] sm:border sm:border-white/[0.10] sm:bg-[#17121c]/92 sm:p-4 sm:shadow-[0_18px_52px_rgba(0,0,0,0.24)] sm:backdrop-blur ${
        isPhoneVariant ? "relative mb-0 mt-[-0.25rem]" : "sticky top-2 mb-4 rounded-[20px] border border-white/[0.10] bg-[#17121c]/92 p-2.5 shadow-[0_18px_52px_rgba(0,0,0,0.24)] backdrop-blur"
      }`}
      style={{ animationDelay: "170ms" }}
    >
      <div className={`items-center justify-between gap-2 ${isPhoneVariant ? "hidden" : "flex"}`}>
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/72 sm:text-[11px] sm:tracking-[0.18em]">Explore this city</p>
        <p className="hidden rounded-full border border-white/14 bg-white/[0.08] px-2 py-1 text-[11px] text-white/72 sm:block">
          Current: {activeSection || "overview"}
        </p>
      </div>
      <div className={`grid gap-1.5 sm:mt-3 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5 ${isPhoneVariant ? "grid-cols-4" : "mt-2 grid-cols-5"}`}>
        {visibleItems.map((item) => {
          const Icon = item.Icon;
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
            onMouseEnter={
              item.key === "venues"
                ? () => {
                    setShowVenuePicker(true);
                  }
                : undefined
            }
            className={`qa-cinematic-hover flex min-h-[3.5rem] min-w-0 flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center text-xs transition sm:min-h-[5.1rem] sm:items-stretch sm:rounded-2xl sm:px-4 sm:py-3 sm:text-left sm:text-sm ${item.className} ${
              isActive
                ? "ring-1 ring-[#f5a9c6]/45 shadow-[0_10px_28px_rgba(245,169,198,0.10)]"
                : ""
            }`}
          >
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] opacity-72">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{item.eyebrow}</span>
            </p>
            <p className="mt-1 flex max-w-full items-center justify-center gap-1 font-semibold sm:mt-2 sm:justify-between sm:gap-2">
              <span className="truncate text-white">{item.label}</span>
              {item.key === "venues" ? (
                <ChevronDown
                  className={`h-3.5 w-3.5 transition ${showVenuePicker ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              ) : null}
            </p>
          </button>
          );
        })}
      </div>

      {showVenuePicker && venueGroups.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-white/18 bg-white/[0.08] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/70">Venue types</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              key="venue-jump-all"
              type="button"
              onClick={() => {
                onGoVenues?.();
                setShowVenuePicker(false);
              }}
              className="qa-action rounded-full border border-white/18 bg-white/[0.07] px-3 py-1.5 text-[11px] text-white/82 transition hover:border-white/34 hover:bg-white/[0.11]"
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
                  setShowVenuePicker(false);
                }}
                aria-pressed={isActive}
                className={`qa-action rounded-full border px-3 py-1.5 text-[11px] transition ${
                  isActive
                    ? "border-amber-200/52 bg-amber-200/16 text-amber-50"
                    : "border-white/14 bg-white/[0.045] text-white/72 hover:border-amber-200/34 hover:bg-amber-200/[0.08] hover:text-amber-50"
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

