"use client";

import CityQuickNavigation from "@/components/city/CityQuickNavigation";
import CitySignalSummaryBar from "@/components/city/CitySignalSummaryBar";

export default function CityNavigationCluster({
  cityPlacesCount,
  cityEventCount,
  cityServiceCount,
  activeCitySection,
  onGoHome,
  onGoMap,
  onGoEvents,
  onGoGuide,
  onGoServices,
  onGoVenues,
  onGoVenueType,
  venueJumpGroups,
  activeVenueFilter = "",
  onAddPlace,
  onAddEvent,
  onAddService,
  variant = "default",
}) {
  if (variant === "contribute") {
    return (
      <CityQuickNavigation
        onAddPlace={onAddPlace}
        onAddEvent={onAddEvent}
        onAddService={onAddService}
        variant="contribute"
      />
    );
  }

  if (variant === "rail") {
    return (
      <CityQuickNavigation
        onGoHome={onGoHome}
        onGoMap={onGoMap}
        onGoEvents={onGoEvents}
        onGoGuide={onGoGuide}
        onGoServices={onGoServices}
        onGoVenues={onGoVenues}
        onGoVenueType={onGoVenueType}
        venueJumpGroups={venueJumpGroups}
        activeSection={activeCitySection}
        activeVenueFilter={activeVenueFilter}
        onAddPlace={onAddPlace}
        onAddEvent={onAddEvent}
        onAddService={onAddService}
        variant="rail"
      />
    );
  }

  return (
    <>
      <CitySignalSummaryBar
        cityPlacesCount={cityPlacesCount}
        cityEventCount={cityEventCount}
        cityServiceCount={cityServiceCount}
        activeCitySection={activeCitySection}
      />

      <CityQuickNavigation
        onGoHome={onGoHome}
        onGoMap={onGoMap}
        onGoEvents={onGoEvents}
        onGoGuide={onGoGuide}
        onGoServices={onGoServices}
        onGoVenues={onGoVenues}
        onGoVenueType={onGoVenueType}
        venueJumpGroups={venueJumpGroups}
        activeSection={activeCitySection}
        activeVenueFilter={activeVenueFilter}
      />
    </>
  );
}
