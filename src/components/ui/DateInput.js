"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const day = previousMonthDays - i;
    const date = new Date(year, month - 1, day);
    cells.push({ date, isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, isCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (firstDay + daysInMonth) + 1;
    const date = new Date(year, month + 1, day);
    cells.push({ date, isCurrentMonth: false });
  }

  return cells;
}

export default function DateInput({
  value,
  onChange,
  className = "",
  required = false,
  disabled = false,
  min,
  max,
  id,
  name,
  tone = "cyan",
}) {
  const rootRef = useRef(null);
  const selectedDate = parseIsoDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [desktopAlign, setDesktopAlign] = useState("left");
  const [viewMonth, setViewMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const tones = {
    cyan: {
      wrapper: "border-cyan-300/20 bg-cyan-300/[0.04]",
      field: "border-cyan-200/28 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(8,47,73,0.42))] text-cyan-50 shadow-[0_10px_28px_rgba(34,211,238,0.22)] hover:border-cyan-100/45",
      panel: "border-cyan-300/24 bg-[linear-gradient(180deg,rgba(10,31,42,0.98),rgba(8,8,8,0.98))]",
      active: "border-cyan-200/40 bg-cyan-300/24 text-cyan-50 shadow-[0_8px_24px_rgba(34,211,238,0.24)]",
    },
    violet: {
      wrapper: "border-violet-300/20 bg-violet-300/[0.04]",
      field: "border-violet-200/28 bg-[linear-gradient(180deg,rgba(167,139,250,0.16),rgba(30,27,75,0.5))] text-violet-50 shadow-[0_10px_28px_rgba(139,92,246,0.22)] hover:border-violet-100/45",
      panel: "border-violet-300/24 bg-[linear-gradient(180deg,rgba(24,17,46,0.98),rgba(8,8,8,0.98))]",
      active: "border-violet-200/40 bg-violet-300/24 text-violet-50 shadow-[0_8px_24px_rgba(139,92,246,0.24)]",
    },
    rose: {
      wrapper: "border-rose-300/20 bg-rose-300/[0.04]",
      field: "border-rose-200/28 bg-[linear-gradient(180deg,rgba(251,113,133,0.16),rgba(76,5,25,0.5))] text-rose-50 shadow-[0_10px_28px_rgba(244,63,94,0.22)] hover:border-rose-100/45",
      panel: "border-rose-300/24 bg-[linear-gradient(180deg,rgba(48,15,25,0.98),rgba(8,8,8,0.98))]",
      active: "border-rose-200/40 bg-rose-300/24 text-rose-50 shadow-[0_8px_24px_rgba(244,63,94,0.24)]",
    },
    emerald: {
      wrapper: "border-emerald-300/20 bg-emerald-300/[0.04]",
      field: "border-emerald-200/28 bg-[linear-gradient(180deg,rgba(52,211,153,0.16),rgba(6,78,59,0.5))] text-emerald-50 shadow-[0_10px_28px_rgba(16,185,129,0.22)] hover:border-emerald-100/45",
      panel: "border-emerald-300/24 bg-[linear-gradient(180deg,rgba(8,40,31,0.98),rgba(8,8,8,0.98))]",
      active: "border-emerald-200/40 bg-emerald-300/24 text-emerald-50 shadow-[0_8px_24px_rgba(16,185,129,0.24)]",
    },
  };

  const toneStyles = tones[tone] || tones.cyan;
  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const desktopPanelAnchor = desktopAlign === "right" ? "sm:right-0 sm:left-auto" : "sm:left-0 sm:right-auto";

  useEffect(() => {
    if (!isOpen) return undefined;

    const onOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  const isDisabledDate = (date) => {
    const iso = toIsoDate(date);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
        name,
        id,
      },
    });
  };

  const calculateDesktopAlign = () => {
    if (typeof window === "undefined") return "left";
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return "left";
    const panelWidth = 352; // 22rem
    const viewportPadding = 16;
    if (rect.left + panelWidth > window.innerWidth - viewportPadding) {
      return "right";
    }
    return "left";
  };

  const selectDate = (date) => {
    const iso = toIsoDate(date);
    if (isDisabledDate(date)) return;
    emitChange(iso);
    setIsOpen(false);
  };

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Pick a date";

  return (
    <div ref={rootRef} className="group relative">
      <input type="hidden" id={id} name={name} value={value || ""} required={required} />
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setIsOpen((current) => {
            if (current) return false;
            const parsed = parseIsoDate(value);
            const nextMonth = parsed
              ? new Date(parsed.getFullYear(), parsed.getMonth(), 1)
              : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            setViewMonth(nextMonth);
            setDesktopAlign(calculateDesktopAlign());
            return true;
          });
        }}
        disabled={disabled}
        className={`relative z-20 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${toneStyles.wrapper} ${toneStyles.field} ${className} disabled:cursor-not-allowed disabled:opacity-60`}
        aria-label="Open calendar"
      >
        <span className={`text-sm ${value ? "text-white" : "text-white/58"}`}>{displayValue}</span>
        <span className="inline-flex items-center gap-1 rounded-xl border border-white/14 bg-white/8 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
          Date
        </span>
      </button>

      {isOpen && !disabled && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-[1px] sm:hidden"
          />
          <div
            className={`absolute inset-x-0 top-full z-[120] mt-2 max-h-[min(22rem,calc(100vh-9rem))] overflow-y-auto rounded-2xl border p-3 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur sm:inset-x-auto sm:mt-2 sm:max-h-none sm:w-[22rem] sm:max-w-[calc(100vw-2rem)] sm:overflow-visible ${desktopPanelAnchor} ${toneStyles.panel}`}
          >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="rounded-lg border border-white/12 bg-white/6 px-2.5 py-1 text-xs text-white/80 transition hover:border-white/24 hover:text-white"
            >
              Prev
            </button>
            <p className="text-sm font-semibold text-white">
              {viewMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="rounded-lg border border-white/12 bg-white/6 px-2.5 py-1 text-xs text-white/80 transition hover:border-white/24 hover:text-white"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] uppercase tracking-[0.14em] text-white/45">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const iso = toIsoDate(date);
              const isToday = iso === toIsoDate(new Date());
              const isSelected = value === iso;
              const disabledDate = isDisabledDate(date);

              return (
                <button
                  key={`${iso}-${isCurrentMonth ? "c" : "o"}`}
                  type="button"
                  disabled={disabledDate}
                  onClick={() => selectDate(date)}
                  className={`h-8 rounded-lg border text-xs transition ${
                    isSelected
                      ? toneStyles.active
                      : isCurrentMonth
                        ? "border-white/10 bg-white/5 text-white hover:border-white/24"
                        : "border-white/6 bg-white/[0.03] text-white/35"
                  } ${disabledDate ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  {date.getDate()}
                  {isToday && !isSelected ? <span className="sr-only"> today</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => emitChange("")}
              className="rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/24 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/24 hover:text-white"
            >
              Done
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
