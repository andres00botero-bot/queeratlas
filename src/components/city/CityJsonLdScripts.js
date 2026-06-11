"use client";

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityBreadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityPlacesItemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityEventsItemListJsonLd) }}
      />
      {cityFaqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cityFaqJsonLd) }}
        />
      ) : null}
    </>
  );
}
