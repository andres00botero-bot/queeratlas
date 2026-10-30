"use client";
import { serializeJsonLd } from "@/lib/jsonLd";

export default function CityJsonLdScripts({
  cityBreadcrumbJsonLd,
  cityPlacesItemListJsonLd,
  cityEventsItemListJsonLd,
  cityFaqJsonLd,
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(cityBreadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(cityPlacesItemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(cityEventsItemListJsonLd) }}
      />
      {cityFaqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(cityFaqJsonLd) }}
        />
      ) : null}
    </>
  );
}
