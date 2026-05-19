"use client";

export default function PageControls({
  controlsRef,
  controlButtonsRef,
  buttons = [],
  activeId = "",
  onSelect,
  className = "",
}) {
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
    <section className={`rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,12,16,0.95),rgba(8,8,8,0.98))] p-3 shadow-[0_20px_54px_rgba(0,0,0,0.34)] ${className}`}>
      <div className="mb-3 border-b border-white/10 pb-2 sm:mb-3.5 sm:pb-2.5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white sm:tracking-[0.22em]">
          Page controls
        </p>
      </div>
      <div
        ref={controlsRef}
        className="flex min-h-[48px] items-center gap-2 overflow-x-auto px-0.5 [padding-left:max(0.125rem,env(safe-area-inset-left))] [padding-right:max(0.125rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[44px] sm:px-0"
      >
        {buttons.map((button, index) => {
          const isActive = activeId === button.id;
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
                  ? "border-cyan-100/70 bg-[linear-gradient(180deg,rgba(56,189,248,0.16),rgba(34,211,238,0.09))] text-cyan-50 -translate-y-[1px] ring-1 ring-cyan-300/32 inset-ring-1 inset-ring-cyan-100/58 shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
                  : "border-white/16 bg-white/6 text-white/80 hover:border-white/30 hover:text-white focus-visible:border-cyan-200/55 focus-visible:text-cyan-50 focus-visible:shadow-[0_0_0_1px_rgba(125,211,252,0.4)]"
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
