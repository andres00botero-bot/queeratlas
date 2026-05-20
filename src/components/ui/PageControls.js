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
    <section className={`rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,12,16,0.95),rgba(8,8,8,0.98))] p-3 shadow-[0_20px_54px_rgba(0,0,0,0.34)] ${isFavoritesDesktopLuxe ? "sm:border-white/16 sm:bg-[linear-gradient(180deg,rgba(12,13,16,0.97),rgba(8,9,11,0.99))] sm:p-3.5 sm:shadow-[0_18px_44px_rgba(0,0,0,0.32)]" : ""} ${className}`}>
      <div className="mb-3 border-b border-white/10 pb-2 sm:mb-3.5 sm:pb-2.5">
        <p className={`text-sm font-semibold uppercase tracking-[0.2em] text-white sm:tracking-[0.22em] ${isFavoritesDesktopLuxe ? "sm:text-[12px] sm:font-medium sm:tracking-[0.26em] sm:text-white/86" : ""}`}>
          Page controls
        </p>
      </div>
      <div
        ref={controlsRef}
        className="flex min-h-[48px] items-center gap-2 overflow-x-auto px-0.5 [padding-left:max(0.125rem,env(safe-area-inset-left))] [padding-right:max(0.125rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[44px] sm:px-0"
      >
        {buttons.map((button, index) => {
          const isActive = activeId === button.id;
          const activeTheme = activeButtonThemeById?.[button.id] || {};
          const activeClassName = String(activeTheme.className || "").trim();
          const useCustomActiveTheme = Boolean(activeClassName);
          const activeBaseClass = useCustomActiveTheme
            ? "border-white/45 bg-white/10 text-white"
            : "border-cyan-100/70 bg-[linear-gradient(180deg,rgba(56,189,248,0.16),rgba(34,211,238,0.09))] text-cyan-50 -translate-y-[1px] ring-1 ring-cyan-300/32 inset-ring-1 inset-ring-cyan-100/58 shadow-[0_6px_16px_rgba(0,0,0,0.2)]";
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
              className={`shrink-0 rounded-full border px-3.5 py-3 text-xs uppercase tracking-[0.11em] outline-none transition-[box-shadow,transform,background-color,border-color,color] duration-150 ease-out sm:px-3.5 sm:py-2.5 sm:tracking-[0.12em] ${
                isActive
                  ? `${activeBaseClass} ${isFavoritesDesktopLuxe && !useCustomActiveTheme ? "sm:border-white/55 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] sm:text-white sm:ring-1 sm:ring-white/38 sm:inset-ring-1 sm:inset-ring-white/46 sm:shadow-[0_2px_10px_rgba(0,0,0,0.25)]" : ""} ${activeClassName}`
                  : `border-white/16 bg-white/6 text-white/80 hover:border-white/30 hover:text-white focus-visible:border-cyan-200/55 focus-visible:text-cyan-50 focus-visible:shadow-[0_0_0_1px_rgba(125,211,252,0.4)] ${isFavoritesDesktopLuxe ? "sm:border-white/14 sm:bg-white/[0.03] sm:text-white/72 sm:hover:border-white/26 sm:hover:bg-white/[0.045] sm:hover:text-white/90 sm:focus-visible:border-white/36 sm:focus-visible:text-white sm:focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.25)]" : ""}`
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
