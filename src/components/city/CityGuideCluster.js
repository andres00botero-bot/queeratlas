"use client";

import QuickGuideSection from "@/components/city/QuickGuideSection";

export default function CityGuideCluster({
  guideSectionRef,
  cityName,
  config,
  isAdmin,
  placesLoading,
  placesLoadError,
  reloadPlaces,
}) {
  return (
    <QuickGuideSection
      sectionRef={guideSectionRef}
      cityName={cityName}
      config={config}
      isAdmin={isAdmin}
      placesLoading={placesLoading}
      placesLoadError={placesLoadError}
      reloadPlaces={reloadPlaces}
    />
  );
}
