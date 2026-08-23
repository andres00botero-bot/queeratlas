const SCHEMA_TYPE_BY_VENUE_TYPE = Object.freeze({
  bar: "BarOrPub",
  cafe: "CafeOrCoffeeShop",
  cinema: "MovieTheater",
  club: "NightClub",
  cruise_club: "AdultEntertainment",
  cruising_area: "Place",
  gallery: "ArtGallery",
  hotel: "Hotel",
  restaurant: "Restaurant",
  sauna: "HealthClub",
});

export function schemaTypeForVenue(placeType = "") {
  const normalizedType = String(placeType || "").trim().toLowerCase();
  return SCHEMA_TYPE_BY_VENUE_TYPE[normalizedType] || "LocalBusiness";
}

export function supportsVenueAggregateRating(placeType = "") {
  return schemaTypeForVenue(placeType) !== "Place";
}

