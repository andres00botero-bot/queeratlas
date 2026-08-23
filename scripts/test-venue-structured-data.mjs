import assert from "node:assert/strict";
import {
  schemaTypeForVenue,
  supportsVenueAggregateRating,
} from "../src/lib/seo/venueStructuredData.js";

const expectedTypes = {
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
};

for (const [venueType, schemaType] of Object.entries(expectedTypes)) {
  assert.equal(schemaTypeForVenue(venueType), schemaType);
}

assert.equal(schemaTypeForVenue("unknown"), "LocalBusiness");
assert.equal(supportsVenueAggregateRating("bar"), true);
assert.equal(supportsVenueAggregateRating("club"), true);
assert.equal(supportsVenueAggregateRating("cruising_area"), false);

console.log("Venue structured-data type mapping passed.");
