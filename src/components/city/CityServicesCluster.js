"use client";

import CityServicesSection from "@/components/city/CityServicesSection";

export default function CityServicesCluster({
  servicesSectionRef,
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
    <CityServicesSection
      sectionRef={servicesSectionRef}
      servicesLoading={servicesLoading}
      cityServiceCount={cityServiceCount}
      visibleServiceGroups={visibleServiceGroups}
      servicesLoadError={servicesLoadError}
      fetchServices={fetchServices}
      hasAnyServices={hasAnyServices}
      openService={openService}
      setHoveredServiceId={setHoveredServiceId}
      serviceId={serviceId}
      serviceTypeLabels={serviceTypeLabels}
      serviceTypeStyles={serviceTypeStyles}
    />
  );
}
