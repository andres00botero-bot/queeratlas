"use client";

import SectionSkeleton from "@/components/city/SectionSkeleton";
import ServiceGuideCard from "@/components/city/ServiceGuideCard";

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
  return (
    <div
      ref={sectionRef}
      className="qa-city-section animate-cinematic-in mb-10 rounded-[30px] border border-emerald-200/12 bg-[linear-gradient(180deg,rgba(12,30,26,0.86),rgba(12,12,12,0.98))] p-6 shadow-[0_18px_52px_rgba(16,185,129,0.06)]"
      style={{ animationDelay: "270ms" }}
    >
      <h2 className="sticky top-[66px] z-10 -mx-2 mb-4 border-b border-emerald-200/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-[0.02em] text-emerald-100 backdrop-blur">
        Services
      </h2>
      <p className="mb-4 text-sm text-white/65">
        Private services curated for this city: massage, tours, concierge, and premium support lanes.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100/90">
          {servicesLoading ? "Services syncing" : `${cityServiceCount} listed`}
        </span>
        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72">
          {visibleServiceGroups.length} categories
        </span>
        <span className="rounded-full border border-cyan-200/18 bg-cyan-200/[0.09] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100/88">
          Member-owned
        </span>
      </div>

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
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-emerald-100/60">Loading local services</p>
          <SectionSkeleton tone="emerald" rows={2} />
        </div>
      )}

      {!servicesLoading && !hasAnyServices && (
        <div className="rounded-2xl border border-dashed border-emerald-200/20 bg-emerald-200/[0.04] px-4 py-8 text-sm text-emerald-100/75">
          No service signal yet for this city. Add trusted providers from Contribute to unlock this lane.
        </div>
      )}

      {visibleServiceGroups.map((group) => (
        <div key={`service-group-${group.value}`} className="mb-6 last:mb-0">
          <h3 className="mb-3 text-sm uppercase tracking-[0.16em] text-emerald-100/75">
            {serviceTypeLabels[group.value] || group.label}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {group.items.map((service, index) => (
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
