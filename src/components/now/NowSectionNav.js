"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function NowSectionNav({ sections, activeId, className = "" }) {
  const { t } = useLocale();
  return (
    <nav
      aria-label={t("now.sections", "Now sections")}
      className={`qa-news-scrollrail flex gap-5 overflow-x-auto border-b border-white/10 px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7 ${className}`}
    >
      {sections.map((section) => {
        const isCurrent = section.id === activeId;
        return (
          <Link
            key={`now-section-${section.id}`}
            href={section.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`relative inline-flex min-h-11 shrink-0 items-center py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 sm:text-xs ${
              isCurrent ? "text-[#f7f4ee]" : "text-white/42 hover:text-white/76"
            }`}
          >
            {section.id === "mixed" ? t("now.news", "News") : section.label}
            {isCurrent ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-[9px] left-0 h-px w-full bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-transparent"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
