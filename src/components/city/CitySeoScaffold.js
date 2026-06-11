"use client";

import CityCrawlLinks from "@/components/city/CityCrawlLinks";
import CityJsonLdScripts from "@/components/city/CityJsonLdScripts";

export default function CitySeoScaffold({
  city,
  cityName,
  cityBreadcrumbJsonLd,
  cityPlacesItemListJsonLd,
  cityEventsItemListJsonLd,
  cityFaqJsonLd,
}) {
  return (
    <>
      <CityCrawlLinks city={city} cityName={cityName} />
      <CityJsonLdScripts
        cityBreadcrumbJsonLd={cityBreadcrumbJsonLd}
        cityPlacesItemListJsonLd={cityPlacesItemListJsonLd}
        cityEventsItemListJsonLd={cityEventsItemListJsonLd}
        cityFaqJsonLd={cityFaqJsonLd}
      />
    </>
  );
}
