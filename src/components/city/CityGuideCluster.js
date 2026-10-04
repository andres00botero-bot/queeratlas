"use client";

import QuickGuideSection from "@/components/city/QuickGuideSection";
import QariCityContextCard from "@/components/city/QariCityContextCard";

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
    <div>
      <QariCityContextCard
        cityName={cityName}
        country={config?.country}
        profile={config?.qariProfile}
        localContext={config?.safetyContext}
      />
      <QuickGuideSection
        sectionRef={guideSectionRef}
        cityName={cityName}
        config={config}
        isAdmin={isAdmin}
        placesLoading={placesLoading}
        placesLoadError={placesLoadError}
        reloadPlaces={reloadPlaces}
      />
    </div>
  );
}
