"use client";

export default function CityJsonLdScripts({
  cityBreadcrumbJsonLd,
  cityPlacesItemListJsonLd,
  cityEventsItemListJsonLd,
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
    </>
  );
}
