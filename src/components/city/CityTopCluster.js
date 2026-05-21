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
  showHero = true,
  showContribution = true,
  showContributionActions = true,
}) {
  return (
    <>
      {showHero ? (
        <CityHeroCard
          cityName={cityName}
          placesChipLabel={placesChipLabel}
          eventsChipLabel={eventsChipLabel}
          cityHero={cityHero}
        />
      ) : null}

      {showContribution ? (
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
          showActions={showContributionActions}
        />
      ) : null}
    </>
  );
}
