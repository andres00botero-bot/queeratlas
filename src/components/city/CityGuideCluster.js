"use client";

import QuickGuideSection from "@/components/city/QuickGuideSection";

export default function CityGuideCluster({
  guideSectionRef,
  cityName,
  config,
  placesLoading,
  placesLoadError,
  reloadPlaces,
}) {
  return (
    <QuickGuideSection
      sectionRef={guideSectionRef}
      cityName={cityName}
      config={config}
      placesLoading={placesLoading}
      placesLoadError={placesLoadError}
      reloadPlaces={reloadPlaces}
    />
  );
}
