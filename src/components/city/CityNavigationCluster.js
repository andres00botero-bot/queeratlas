"use client";

import CityQuickNavigation from "@/components/city/CityQuickNavigation";
import CitySignalSummaryBar from "@/components/city/CitySignalSummaryBar";

export default function CityNavigationCluster({
  cityPlacesCount,
  cityEventCount,
  cityServiceCount,
  activeCitySection,
  onGoMap,
  onGoEvents,
  onGoGuide,
  onGoServices,
  onGoVenues,
  onGoVenueType,
  venueJumpGroups,
}) {
  return (
    <>
      <CitySignalSummaryBar
        cityPlacesCount={cityPlacesCount}
        cityEventCount={cityEventCount}
        cityServiceCount={cityServiceCount}
        activeCitySection={activeCitySection}
      />

      <CityQuickNavigation
        onGoMap={onGoMap}
        onGoEvents={onGoEvents}
        onGoGuide={onGoGuide}
        onGoServices={onGoServices}
        onGoVenues={onGoVenues}
        onGoVenueType={onGoVenueType}
        venueJumpGroups={venueJumpGroups}
        activeSection={activeCitySection}
      />
    </>
  );
}
