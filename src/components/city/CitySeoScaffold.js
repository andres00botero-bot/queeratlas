"use client";

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
    <CityJsonLdScripts
      cityBreadcrumbJsonLd={cityBreadcrumbJsonLd}
      cityPlacesItemListJsonLd={cityPlacesItemListJsonLd}
      cityEventsItemListJsonLd={cityEventsItemListJsonLd}
      cityFaqJsonLd={cityFaqJsonLd}
    />
  );
}
