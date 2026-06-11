"use client";

import CityContributionStack from "@/components/city/CityContributionStack";
import CityHeroCard from "@/components/city/CityHeroCard";
import CitySeoTopicLinks from "@/components/city/CitySeoTopicLinks";

export default function CityTopCluster({
  city,
  cityName,
  placesChipLabel,
  eventsChipLabel,
  cityHero,
  cityHeroIntro,
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
        <>
          <CityHeroCard
            cityName={cityName}
            placesChipLabel={placesChipLabel}
            eventsChipLabel={eventsChipLabel}
            cityHero={cityHero}
            heroIntro={cityHeroIntro}
          />
          <CitySeoTopicLinks city={city} cityName={cityName} />
        </>
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
