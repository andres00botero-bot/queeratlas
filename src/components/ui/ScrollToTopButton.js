"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";

const SHOW_AFTER_PX = 480;

function getScrollContainers() {
  return Array.from(document.querySelectorAll("[data-scroll-to-top-container]"));
}

export default function ScrollToTopButton() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const deepestScroll = Math.max(
        window.scrollY || document.documentElement.scrollTop || 0,
        ...getScrollContainers().map((container) => container.scrollTop)
      );
      setIsVisible(deepestScroll > SHOW_AFTER_PX);
    };

    const containers = getScrollContainers();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    containers.forEach((container) => container.addEventListener("scroll", updateVisibility, { passive: true }));
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
      containers.forEach((container) => container.removeEventListener("scroll", updateVisibility));
    };
  }, [pathname]);

  const scrollToTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
    getScrollContainers().forEach((container) => container.scrollTo({ top: 0, behavior }));
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("global.backToTop", "Back to top")}
      className={`qa-scroll-to-top group fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] right-[calc(0.9rem+env(safe-area-inset-right,0px))] z-[80] inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-full border border-white/22 bg-[radial-gradient(circle_at_18%_18%,rgba(165,243,252,0.23),transparent_34%),radial-gradient(circle_at_90%_112%,rgba(244,114,182,0.28),transparent_52%),linear-gradient(135deg,rgba(9,17,31,0.96),rgba(20,16,38,0.98))] px-2.5 py-2 text-xs font-bold tracking-[0.01em] text-white shadow-[0_16px_40px_rgba(2,6,23,0.52),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_0_28px_rgba(34,211,238,0.14)] backdrop-blur-2xl transition-[opacity,transform,visibility,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-cyan-100/70 hover:shadow-[0_20px_46px_rgba(2,6,23,0.62),0_0_0_1px_rgba(255,255,255,0.16)_inset,0_0_36px_rgba(34,211,238,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:bottom-[calc(7.25rem+env(safe-area-inset-bottom,0px))] md:right-[calc(1.25rem+env(safe-area-inset-right,0px))] ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0 invisible"
      }`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-px h-px bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-80" />
      <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-100/40 bg-[linear-gradient(145deg,rgba(207,250,254,0.28),rgba(217,70,239,0.20))] text-cyan-50 shadow-[0_4px_14px_rgba(34,211,238,0.24),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <ArrowUp size={15} strokeWidth={2.7} aria-hidden="true" />
      </span>
      <span className="relative pr-1.5">{t("global.backToTop", "Back to top")}</span>
    </button>
  );
}
