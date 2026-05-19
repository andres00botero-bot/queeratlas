"use client";

import CityContributionStack from "@/components/city/CityContributionStack";
import CityHeroCard from "@/components/city/CityHeroCard";

export default function CityTopCluster({
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  addMode,
  addEventMode,
  addServiceMode,
  onToggleAddPlace,
  onToggleAddEvent,
  onToggleAddService,
  placeFormProps,
  eventFormProps,
  serviceFormProps,
}) {
  return (
    <>
      <CityHeroCard
        cityName={cityName}
        placesChipLabel={placesChipLabel}
        eventsChipLabel={eventsChipLabel}
        cityHero={cityHero}
      />

      <CityContributionStack
        addMode={addMode}
        addEventMode={addEventMode}
        addServiceMode={addServiceMode}
        onToggleAddPlace={onToggleAddPlace}
        onToggleAddEvent={onToggleAddEvent}
        onToggleAddService={onToggleAddService}
        placeFormProps={placeFormProps}
        eventFormProps={eventFormProps}
        serviceFormProps={serviceFormProps}
      />
    </>
  );
}
