"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export default function PageControls({
  controlsRef,
  controlButtonsRef,
  buttons = [],
  activeId = "",
  onSelect,
  className = "",
  variant = "default",
  activeButtonThemeById = {},
  ariaLabel = "Page sections",
  mobileLayout = "scroll",
  mobileLabelsById = {},
  mobilePrimaryIds = [],
  mobileCompact = false,
}) {
  const isFavoritesDesktopLuxe = variant === "favorites-desktop-luxe";
  const isEventsCompact = variant === "events-compact";
  const isCommunityLuxe = variant === "community-luxe";
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const moreMenuId = useId();
  const hasMobileMore = mobileCompact && mobilePrimaryIds.length > 0 && buttons.some((button) => !mobilePrimaryIds.includes(button.id));
  const mobileMoreItems = hasMobileMore ? buttons.filter((button) => !mobilePrimaryIds.includes(button.id)) : [];
  const isMobileMoreActive = mobileMoreItems.some((button) => button.id === activeId);
  const rootClassName = isCommunityLuxe
    ? "relative overflow-hidden rounded-[20px] border border-white/[0.10] bg-[rgba(8,10,15,0.88)] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl sm:rounded-[24px] sm:p-2"
    : isEventsCompact
    ? "relative z-40 overflow-visible sm:z-auto"
    : mobileCompact
    ? "relative z-40 overflow-visible rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(19,23,32,0.94),rgba(9,10,15,0.97))] p-1.5 shadow-[0_14px_38px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:z-auto sm:overflow-hidden sm:rounded-[26px] sm:border-cyan-200/26 sm:bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.14),transparent_32%),linear-gradient(180deg,rgba(13,17,28,0.97),rgba(8,8,12,0.99))] sm:p-3.5 sm:shadow-[0_24px_72px_rgba(0,0,0,0.42),0_0_0_1px_rgba(244,114,182,0.08),0_18px_54px_rgba(34,211,238,0.08)]"
    : "relative overflow-hidden rounded-[20px] border border-cyan-200/26 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.14),transparent_32%),linear-gradient(180deg,rgba(13,17,28,0.97),rgba(8,8,12,0.99))] p-2 shadow-[0_24px_72px_rgba(0,0,0,0.42),0_0_0_1px_rgba(244,114,182,0.08),0_18px_54px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:rounded-[26px] sm:p-3.5";
  const railClassName = isCommunityLuxe
    ? "relative flex min-h-12 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1.5"
    : isEventsCompact
    ? "relative flex min-h-11 items-center gap-1.5 overflow-x-auto bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2.5"
    : mobileCompact
    ? "relative flex min-h-12 items-center gap-1 overflow-x-auto rounded-[14px] bg-transparent p-0 [padding-left:max(0rem,env(safe-area-inset-left))] [padding-right:max(0rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[48px] sm:gap-2 sm:rounded-[18px] sm:border sm:border-white/8 sm:bg-black/18 sm:px-1.5 sm:py-1"
    : "relative flex min-h-[48px] items-center gap-1.5 overflow-x-auto rounded-[16px] border border-white/8 bg-black/18 p-1 [padding-left:max(0.25rem,env(safe-area-inset-left))] [padding-right:max(0.25rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[48px] sm:gap-2 sm:rounded-[18px] sm:px-1.5";

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const closeOnOutsidePress = (event) => {
      if (!moreMenuRef.current?.contains(event.target)) setIsMoreOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMoreOpen]);

  const focusButtonById = (id) => {
    const node = controlButtonsRef?.current?.[id];
    if (!node || typeof node.focus !== "function") return;
    node.focus();
    const scroller = controlsRef?.current;
    if (scroller && typeof scroller.scrollTo === "function") {
      const nextLeft = node.offsetLeft - (scroller.clientWidth - node.clientWidth) / 2;
      scroller.scrollTo({ left: Math.max(0, nextLeft), behavior: "smooth" });
    }
  };

  const handleArrowNavigation = (event, currentIndex) => {
    if (!Array.isArray(buttons) || buttons.length === 0) return;
    const visibleButtons = buttons.filter((button) => {
      const node = controlButtonsRef?.current?.[button.id];
      return node && node.getClientRects().length > 0;
    });
    if (visibleButtons.length === 0) return;
    const currentId = buttons[currentIndex]?.id;
    const visibleIndex = Math.max(0, visibleButtons.findIndex((button) => button.id === currentId));

    let nextIndex = visibleIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (visibleIndex + 1) % visibleButtons.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (visibleIndex - 1 + visibleButtons.length) % visibleButtons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleButtons.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextButton = visibleButtons[nextIndex];
    const nextId = nextButton?.id;
    if (!nextId) return;
    focusButtonById(nextId);
  };

  return (
    <section
      ref={moreMenuRef}
      aria-label={ariaLabel}
      className={`${rootClassName} ${isFavoritesDesktopLuxe ? "sm:border-fuchsia-200/24 sm:bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.15),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(180deg,rgba(15,13,22,0.98),rgba(8,8,11,0.99))] sm:p-4 sm:shadow-[0_22px_64px_rgba(0,0,0,0.42),0_16px_46px_rgba(168,85,247,0.10)]" : ""} ${className}`}
    >
      <div className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent ${mobileCompact ? "hidden sm:block" : ""} ${isCommunityLuxe ? "!hidden" : ""}`} />
      <div className={`pointer-events-none absolute -left-16 top-0 h-32 w-32 rounded-full bg-cyan-300/12 blur-3xl ${mobileCompact ? "hidden sm:block" : ""} ${isCommunityLuxe ? "!hidden" : ""}`} />
      <div className={`pointer-events-none absolute -right-16 top-0 h-32 w-32 rounded-full bg-fuchsia-300/12 blur-3xl ${mobileCompact ? "hidden sm:block" : ""} ${isCommunityLuxe ? "!hidden" : ""}`} />
      <div className={`relative mb-3 hidden border-b border-white/12 pb-2.5 sm:mb-3.5 sm:items-end sm:justify-between sm:gap-3 sm:pb-3 ${isEventsCompact || isCommunityLuxe ? "sm:hidden" : "sm:flex"}`}>
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] text-white sm:tracking-[0.2em] ${isFavoritesDesktopLuxe ? "sm:text-[12px] sm:font-semibold sm:tracking-[0.22em] sm:text-white" : ""}`}>
            Page controls
          </p>
          <p className="mt-1 text-[11px] font-medium text-cyan-100/62 sm:text-xs">
            Tap a section to jump
          </p>
        </div>
        <span className="mt-2 hidden rounded-full border border-white/14 bg-white/7 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/56 sm:inline-flex">
          View switcher
        </span>
      </div>
      <div
        ref={controlsRef}
        role="toolbar"
        aria-label={ariaLabel}
        className={railClassName}
      >
        {buttons.map((button, index) => {
          const isActive = activeId === button.id;
          const isMobileMoreItem = hasMobileMore && !mobilePrimaryIds.includes(button.id);
          const activeTheme = activeButtonThemeById?.[button.id] || {};
          const activeClassName = String(activeTheme.className || "").trim();
          const useCustomActiveTheme = Boolean(activeClassName);
          const activeBaseClass = isEventsCompact
            ? "border-cyan-200 bg-transparent text-white shadow-none"
            : useCustomActiveTheme
            ? "border-white/42 bg-white/14 text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)] sm:border-white/55 sm:shadow-[0_10px_28px_rgba(0,0,0,0.26)]"
            : mobileCompact
              ? "border-cyan-100/48 bg-cyan-100/[0.13] text-white shadow-[inset_0_-2px_0_rgba(103,232,249,0.72),0_7px_18px_rgba(0,0,0,0.2)] sm:-translate-y-[1px] sm:border-cyan-100/70 sm:bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(244,114,182,0.20),rgba(255,255,255,0.10))] sm:ring-1 sm:ring-cyan-200/42 sm:inset-ring-1 sm:inset-ring-white/40 sm:shadow-[0_12px_30px_rgba(34,211,238,0.16),0_8px_22px_rgba(244,114,182,0.12)]"
              : "border-cyan-100/70 bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(244,114,182,0.20),rgba(255,255,255,0.10))] text-white -translate-y-[1px] ring-1 ring-cyan-200/42 inset-ring-1 inset-ring-white/40 shadow-[0_12px_30px_rgba(34,211,238,0.16),0_8px_22px_rgba(244,114,182,0.12)]";
          const mobileButtonLayoutClass = isCommunityLuxe
            ? "shrink-0 rounded-[15px] border px-4 py-2.5 text-[12px] font-semibold tracking-[-0.01em] sm:min-w-[8rem] sm:flex-1 sm:rounded-[18px] sm:px-5 sm:text-xs"
            : isEventsCompact
            ? `${mobileLayout === "fit" ? "min-w-0 flex-1" : "shrink-0"} inline-flex min-h-10 items-center justify-center border-b-2 border-x-0 border-t-0 px-1.5 text-[11px] font-semibold tracking-[-0.01em] sm:min-h-11 sm:px-4 sm:text-xs sm:uppercase sm:tracking-[0.12em]`
            : mobileCompact
            ? `${mobileLayout === "fit" || hasMobileMore ? "min-w-0 flex-1" : "shrink-0"} ${isMobileMoreItem ? "hidden sm:inline-flex" : "inline-flex"} min-h-12 items-center justify-center rounded-[13px] border px-2 text-[12px] font-semibold tracking-[-0.01em] sm:shrink-0 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-xs sm:uppercase sm:tracking-[0.12em]`
            : "shrink-0 rounded-full border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] sm:px-4 sm:text-xs sm:tracking-[0.12em]";
          const controlProps = {
            ref: (node) => {
              controlButtonsRef.current[button.id] = node;
            },
            onKeyDown: (event) => handleArrowNavigation(event, index),
            "aria-current": isActive ? "page" : undefined,
            className: `${mobileButtonLayoutClass} outline-none transition-[box-shadow,transform,background-color,border-color,color] duration-150 ease-out ${
              isActive
                ? `${activeBaseClass} ${isFavoritesDesktopLuxe && !useCustomActiveTheme ? "sm:border-white/62 sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(168,85,247,0.16))] sm:text-white sm:ring-1 sm:ring-white/42 sm:inset-ring-1 sm:inset-ring-white/46 sm:shadow-[0_8px_22px_rgba(168,85,247,0.16)]" : ""} ${activeClassName}`
                : isCommunityLuxe
                  ? "border-transparent bg-transparent text-white/46 hover:border-white/[0.09] hover:bg-white/[0.045] hover:text-white/78 focus-visible:border-white/24 focus-visible:text-white"
                : isEventsCompact
                  ? "border-transparent bg-transparent text-white/48 shadow-none hover:border-white/22 hover:text-white/82 focus-visible:border-cyan-200/60 focus-visible:text-cyan-50"
                  : `border-white/18 bg-white/8 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-[1px] hover:border-cyan-100/36 hover:bg-white/12 hover:text-white hover:shadow-[0_10px_24px_rgba(34,211,238,0.08)] focus-visible:border-cyan-200/60 focus-visible:text-cyan-50 focus-visible:shadow-[0_0_0_1px_rgba(125,211,252,0.42)] ${isFavoritesDesktopLuxe ? "sm:border-white/16 sm:bg-white/[0.045] sm:text-white/78 sm:hover:border-white/30 sm:hover:bg-white/[0.08] sm:hover:text-white sm:focus-visible:border-white/42 sm:focus-visible:text-white sm:focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.28)]" : ""}`
            }`,
          };

          if (button.href) {
            return (
              <Link
                key={button.id}
                href={button.href}
                {...controlProps}
                onClick={() => onSelect?.(button.id)}
              >
                <span className="sm:hidden">{mobileLabelsById?.[button.id] || button.label}</span>
                <span className="hidden sm:inline">{button.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={button.id}
              {...controlProps}
              type="button"
              onClick={() => onSelect(button.id)}
              aria-pressed={isActive}
            >
              <span className="sm:hidden">{mobileLabelsById?.[button.id] || button.label}</span>
              <span className="hidden sm:inline">{button.label}</span>
            </button>
          );
        })}

        {hasMobileMore ? (
          <div className="relative min-w-0 flex-1 sm:hidden">
            <button
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls={moreMenuId}
              onClick={() => setIsMoreOpen((current) => !current)}
              className={`inline-flex min-h-12 w-full items-center justify-center rounded-[13px] border px-2 text-[12px] font-semibold tracking-[-0.01em] outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-200/50 ${
                isMobileMoreActive
                  ? "border-cyan-100/48 bg-cyan-100/[0.13] text-white shadow-[inset_0_-2px_0_rgba(103,232,249,0.72)]"
                  : "border-white/12 bg-white/[0.045] text-white/76"
              }`}
            >
              More <span className={`ml-1 text-[10px] transition ${isMoreOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
            </button>

          </div>
        ) : null}
      </div>

      {hasMobileMore && isMoreOpen ? (
        <nav id={moreMenuId} aria-label={`More ${ariaLabel}`} className="absolute right-1.5 top-full z-[80] mt-2 w-[13.5rem] overflow-hidden rounded-[18px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,22,31,0.99),rgba(8,9,14,0.99))] p-1.5 shadow-[0_22px_64px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:hidden">
          {mobileMoreItems.map((button) => {
            const itemClassName = `flex min-h-11 w-full items-center rounded-[13px] px-3 text-left text-[12px] font-medium transition ${activeId === button.id ? "bg-cyan-100/[0.12] text-cyan-50" : "text-white/76 hover:bg-white/[0.07] hover:text-white"}`;
            if (button.href) {
              return (
                <Link key={`mobile-more-${button.id}`} href={button.href} aria-current={activeId === button.id ? "page" : undefined} onClick={() => { onSelect?.(button.id); setIsMoreOpen(false); }} className={itemClassName}>
                  {mobileLabelsById?.[button.id] || button.label}
                </Link>
              );
            }
            return (
              <button key={`mobile-more-${button.id}`} type="button" onClick={() => { onSelect?.(button.id); setIsMoreOpen(false); }} className={itemClassName}>
                {mobileLabelsById?.[button.id] || button.label}
              </button>
            );
          })}
        </nav>
      ) : null}
    </section>
  );
}
