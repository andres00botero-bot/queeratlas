"use client";

import CityPlacesSection from "@/components/city/CityPlacesSection";

export default function CityPlacesCluster({
  placesLoading,
  hasAnyPlaces,
  onReadGuide,
  canPublish,
  onPublishFirstVenue,
  onJoinToPublish,
  visiblePlaceGroups,
  placesSectionRef,
  setVenueGroupRef,
  isFocusMode,
  selectedPlaceId,
  hoveredPlaceId,
  openPlace,
  setHoveredPlaceId,
  toggleFavorite,
  favorites,
  typeStyles,
  typeLabels,
  qualityMap,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
  cityName,
  safetySignalsByPlaceId,
}) {
  return (
    <CityPlacesSection
      placesLoading={placesLoading}
      hasAnyPlaces={hasAnyPlaces}
      onReadGuide={onReadGuide}
      canPublish={canPublish}
      onPublishFirstVenue={onPublishFirstVenue}
      onJoinToPublish={onJoinToPublish}
      visiblePlaceGroups={visiblePlaceGroups}
      firstGroupRef={placesSectionRef}
      setPlaceGroupRef={setVenueGroupRef}
      isFocusMode={isFocusMode}
      selectedPlaceId={selectedPlaceId}
      hoveredPlaceId={hoveredPlaceId}
      openPlace={openPlace}
      setHoveredPlaceId={setHoveredPlaceId}
      toggleFavorite={toggleFavorite}
      favorites={favorites}
      typeStyles={typeStyles}
      typeLabels={typeLabels}
      qualityMap={qualityMap}
      refreshEntityQuality={refreshEntityQuality}
      canRefreshQuality={canRefreshQuality}
      formatDate={formatDate}
      cityName={cityName}
      safetySignalsByPlaceId={safetySignalsByPlaceId}
    />
  );
}
