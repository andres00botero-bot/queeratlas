"use client";

import { useState } from "react";
import { ChevronDown, ConciergeBell } from "lucide-react";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import ServiceGuideCard from "@/components/city/ServiceGuideCard";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CityServicesSection({
  sectionRef,
  servicesLoading,
  cityServiceCount,
  visibleServiceGroups,
  servicesLoadError,
  fetchServices,
  hasAnyServices,
  openService,
  setHoveredServiceId,
  serviceId,
  serviceTypeLabels,
  serviceTypeStyles,
}) {
  const { t } = useLocale();
  const [expandedGroupValue, setExpandedGroupValue] = useState("");

  const renderServiceCards = (group) => {
    const items = Array.isArray(group.items) ? group.items : [];

    return items.map((service, index) => (
      <ServiceGuideCard
        key={`service-${service.id}`}
        service={service}
        index={index}
        serviceId={serviceId}
        openService={openService}
        setHoveredServiceId={setHoveredServiceId}
        serviceTypeStyles={serviceTypeStyles}
        serviceTypeLabels={serviceTypeLabels}
      />
    ));
  };

  return (
    <div
      ref={sectionRef}
      className="qa-city-section qa-city-content-section qa-city-tone-services qa-city-copy-left qa-services-list-root animate-cinematic-in mb-10 rounded-[28px] border p-5 sm:p-6 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
      style={{ animationDelay: "270ms" }}
    >
      <div className="mb-7">
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-emerald-100/58">{t("city.localServices", "Local services")}</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">{t("city.servicesLower", "Services")}</h2>
          <span className="inline-flex items-center rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-100/86">
            {servicesLoading ? t("city.curatedServices", "Curated services") : t("city.listed", "{count} listed").replace("{count}", cityServiceCount)}
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,#34d399,#4de1ff,transparent)] opacity-60" />
      </div>
      <p className="mb-4 text-sm text-white/65">
        Private services curated for this city: massage, tours, concierge, and premium support lanes.
      </p>

      {servicesLoadError && (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          <p>{servicesLoadError}</p>
          <button
            onClick={fetchServices}
            className="qa-action qa-city-cta-tertiary mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
          >
            Retry
          </button>
        </div>
      )}

      {servicesLoading && (
        <div className="mb-4 rounded-2xl border border-emerald-200/10 bg-emerald-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-emerald-100/60">{t("city.localServiceGuide", "Local service guide")}</p>
          <SectionSkeleton tone="emerald" rows={2} />
        </div>
      )}

      {!servicesLoading && !hasAnyServices && (
        <div className="rounded-2xl border border-dashed border-emerald-200/20 bg-emerald-200/[0.04] px-4 py-8 text-sm text-emerald-100/75">
          {t("city.noServiceSignal", "No service signal yet for this city. Add trusted providers from Contribute to unlock this lane.")}
        </div>
      )}

      {!servicesLoading && hasAnyServices && (
        <>
          <div className="xl:hidden">
            <div className="mb-4 px-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/68">{t("city.servicesLower", "Services")}</p>
              <h3 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.02em] text-white">{t("city.chooseServiceCategory", "Choose a category")}</h3>
              <p className="mt-1 text-xs leading-5 text-white/52">{t("city.chooseServiceCategoryHint", "Open one category at a time to keep exploring simple.")}</p>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#181426] shadow-[0_18px_46px_rgba(5,6,18,0.22)]">
              {visibleServiceGroups.map((group, groupIndex) => {
                const items = Array.isArray(group.items) ? group.items : [];
                const isExpanded = expandedGroupValue === group.value;
                const panelId = `service-category-${group.value}`;
                const groupLabel = serviceTypeLabels[group.value] || group.label;

                return (
                  <div key={`service-group-${group.value}`} className={groupIndex > 0 ? "border-t border-white/[0.055]" : ""}>
                    <button
                      type="button"
                      onClick={() => setExpandedGroupValue((current) => (current === group.value ? "" : group.value))}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className={`qa-action flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition ${isExpanded ? "bg-[#20392f]" : "bg-transparent hover:bg-white/[0.045]"}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${isExpanded ? "bg-emerald-200/14 text-emerald-100" : "bg-white/[0.055] text-white/52"}`}>
                        <ConciergeBell className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">{groupLabel}</span>
                        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/46">{t("city.servicesCount", "{count} services").replace("{count}", items.length)}</span>
                      </span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isExpanded ? "bg-emerald-200 text-[#10261d]" : "bg-white/[0.055] text-white/58"}`}>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                      </span>
                    </button>

                    {isExpanded ? (
                      <div id={panelId} className="border-t border-white/[0.055] bg-black/10 p-3">
                        <div className="grid grid-cols-1 gap-3">{renderServiceCards(group)}</div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden xl:block">
            {visibleServiceGroups.map((group, groupIndex) => {
              const items = Array.isArray(group.items) ? group.items : [];

              return (
                <section
                  key={`service-group-${group.value}`}
                  className="qa-city-section qa-city-content-section qa-city-tone-services qa-city-copy-left animate-cinematic-in mb-10 rounded-[28px] border border-white/[0.07] bg-[#181426] p-5 shadow-[0_18px_46px_rgba(5,6,18,0.16)] sm:p-6"
                  style={{ animationDelay: `${300 + groupIndex * 40}ms` }}
                >
                  <div className="mb-7">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-emerald-100/70">{t("city.serviceCategory", "Service category")}</p>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">{serviceTypeLabels[group.value] || group.label}</h2>
                      <span className="inline-flex items-center rounded-full border border-emerald-200/15 bg-emerald-200/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-100/82">
                        {t("city.servicesCount", "{count} services").replace("{count}", items.length)}
                      </span>
                    </div>
                    <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,#34d399,#4de1ff,transparent)] opacity-60" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">{renderServiceCards(group)}</div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
