"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { getEntityAddressLabel } from "@/features/city/adminDrawerFeature";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ServiceGuideCard({
  service,
  index,
  serviceId,
  openService,
  setHoveredServiceId,
  serviceTypeLabels,
}) {
  const { t } = useLocale();
  const isSelected = String(serviceId) === String(service.id);
  const typeLabel = serviceTypeLabels[service.type] || t("city.service", "Service");
  const location = getEntityAddressLabel(service) || String(service.city || "").trim() || t("city.localService", "Local service");

  return (
    <div
      onClick={() => openService(service)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${t("city.openService", "Open service")}: ${service.name}`}
      onMouseEnter={() => setHoveredServiceId(String(service.id))}
      onMouseLeave={() => setHoveredServiceId(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openService(service);
        }
      }}
      className="qa-cinematic-hover qa-city-card qa-city-content-card qa-venue-list-card group relative cursor-pointer py-4 pl-0 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7c0ff]/70 focus-visible:ring-inset sm:py-5"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="hidden w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums tracking-[0.14em] text-[#d7c0ff]/58 sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-[16px] font-semibold leading-6 tracking-[-0.012em] text-[#f7f2f7] sm:text-[17px]">
            {service.name}
          </h3>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[12px] leading-5 text-[#bdb3c2]">
            <span className="shrink-0">{typeLabel}</span>
            <span className="text-white/42">·</span>
            <MapPin className="h-3 w-3 shrink-0 text-[#d7c0ff]/70" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        </div>
        <ChevronRight className={`h-5 w-5 shrink-0 transition ${isSelected ? "text-[#e7c67f]" : "text-white/32 group-hover:translate-x-0.5 group-hover:text-[#d7c0ff]"}`} aria-hidden="true" />
      </div>
    </div>
  );
}
