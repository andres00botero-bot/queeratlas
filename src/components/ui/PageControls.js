"use client";

export default function PageControls({
  controlsRef,
  controlButtonsRef,
  buttons = [],
  activeId = "",
  onSelect,
  className = "",
  variant = "default",
  activeButtonThemeById = {},
}) {
  const isFavoritesDesktopLuxe = variant === "favorites-desktop-luxe";
  const focusButtonById = (id) => {
    const node = controlButtonsRef?.current?.[id];
    if (!node || typeof node.focus !== "function") return;
    node.focus();
    if (typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handleArrowNavigation = (event, currentIndex) => {
    if (!Array.isArray(buttons) || buttons.length === 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextId = buttons[nextIndex]?.id;
    if (!nextId) return;
    if (typeof onSelect === "function") onSelect(nextId);
    focusButtonById(nextId);
  };

  return (
    <section className={`relative overflow-hidden rounded-[26px] border border-cyan-200/26 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.14),transparent_32%),linear-gradient(180deg,rgba(13,17,28,0.97),rgba(8,8,12,0.99))] p-3.5 shadow-[0_24px_72px_rgba(0,0,0,0.42),0_0_0_1px_rgba(244,114,182,0.08),0_18px_54px_rgba(34,211,238,0.08)] backdrop-blur-xl ${isFavoritesDesktopLuxe ? "sm:border-fuchsia-200/24 sm:bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.15),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(180deg,rgba(15,13,22,0.98),rgba(8,8,11,0.99))] sm:p-4 sm:shadow-[0_22px_64px_rgba(0,0,0,0.42),0_16px_46px_rgba(168,85,247,0.10)]" : ""} ${className}`}>
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-0 h-32 w-32 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-0 h-32 w-32 rounded-full bg-fuchsia-300/12 blur-3xl" />
      <div className="relative mb-3 border-b border-white/12 pb-2.5 sm:mb-3.5 sm:flex sm:items-end sm:justify-between sm:gap-3 sm:pb-3">
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
        className="relative flex min-h-[52px] items-center gap-2 overflow-x-auto rounded-[18px] border border-white/8 bg-black/18 p-1.5 [padding-left:max(0.375rem,env(safe-area-inset-left))] [padding-right:max(0.375rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[48px] sm:px-1.5"
      >
        {buttons.map((button, index) => {
          const isActive = activeId === button.id;
          const activeTheme = activeButtonThemeById?.[button.id] || {};
          const activeClassName = String(activeTheme.className || "").trim();
          const useCustomActiveTheme = Boolean(activeClassName);
          const activeBaseClass = useCustomActiveTheme
            ? "border-white/55 bg-white/14 text-white shadow-[0_10px_28px_rgba(0,0,0,0.26)]"
            : "border-cyan-100/70 bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(244,114,182,0.20),rgba(255,255,255,0.10))] text-white -translate-y-[1px] ring-1 ring-cyan-200/42 inset-ring-1 inset-ring-white/40 shadow-[0_12px_30px_rgba(34,211,238,0.16),0_8px_22px_rgba(244,114,182,0.12)]";
          return (
            <button
              key={button.id}
              ref={(node) => {
                controlButtonsRef.current[button.id] = node;
              }}
              type="button"
              onClick={() => onSelect(button.id)}
              onKeyDown={(event) => handleArrowNavigation(event, index)}
              aria-pressed={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.11em] outline-none transition-[box-shadow,transform,background-color,border-color,color] duration-150 ease-out sm:px-4 sm:py-2.5 sm:tracking-[0.12em] ${
                isActive
                  ? `${activeBaseClass} ${isFavoritesDesktopLuxe && !useCustomActiveTheme ? "sm:border-white/62 sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(168,85,247,0.16))] sm:text-white sm:ring-1 sm:ring-white/42 sm:inset-ring-1 sm:inset-ring-white/46 sm:shadow-[0_8px_22px_rgba(168,85,247,0.16)]" : ""} ${activeClassName}`
                  : `border-white/18 bg-white/8 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-[1px] hover:border-cyan-100/36 hover:bg-white/12 hover:text-white hover:shadow-[0_10px_24px_rgba(34,211,238,0.08)] focus-visible:border-cyan-200/60 focus-visible:text-cyan-50 focus-visible:shadow-[0_0_0_1px_rgba(125,211,252,0.42)] ${isFavoritesDesktopLuxe ? "sm:border-white/16 sm:bg-white/[0.045] sm:text-white/78 sm:hover:border-white/30 sm:hover:bg-white/[0.08] sm:hover:text-white sm:focus-visible:border-white/42 sm:focus-visible:text-white sm:focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.28)]" : ""}`
              }`}
              autoFocus={index === 0}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
