#!/usr/bin/env node

/**
 * Geocode fixed Lisbon venue list via Mapbox (same provider as app contribute flow)
 * and print copy/paste-ready SQL tuples with verified lat/lng.
 */

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  console.error("ERROR: NEXT_PUBLIC_MAPBOX_TOKEN is missing.");
  process.exit(1);
}

const venues = [
  { name: "Bar 106", city: "lisbon", address: "Rua de São Marçal 106, 1200-422 Lisbon, Portugal" },
  { name: "Construction", city: "lisbon", address: "Rua Cecilio de Sousa 84, 1200-102 Lisbon, Portugal" },
  { name: "Construction Bar", city: "lisbon", address: "Rua da Rosa 157/159, 1200-383 Lisbon, Portugal" },
  { name: "Espaço 40e1", city: "lisbon", address: "Rua da Barroca 41, 1200-106 Lisbon, Portugal" },
  { name: "Friends Bairro Alto", city: "lisbon", address: "Travessa da Água da Flor 17, 1200-339 Lisbon, Portugal" },
  { name: "Posh Club", city: "lisbon", address: "Rua de São Bento 157, 1200-817 Lisbon, Portugal" },
  { name: "Purex", city: "lisbon", address: "Rua das Salgadeiras 28, 1200 Lisbon, Portugal" },
  { name: "SaunApolo 56", city: "lisbon", address: "Rua Luciano Cordeiro 56 A, 1150-216 Lisbon, Portugal" },
  { name: "Side Bar", city: "lisbon", address: "Rua da Barroca 33, 1200-047 Lisbon, Portugal" },
  { name: "Woof X", city: "lisbon", address: "Rua Manuel Bernardes 2B, 1200 Lisbon, Portugal" },
];

function sqlEscape(value) {
  return String(value).replaceAll("'", "''");
}

async function geocode(address, city) {
  const query = `${address} ${city}`.trim();
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${encodeURIComponent(token)}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const feature = data?.features?.[0];
  if (!feature?.center || feature.center.length < 2) {
    return null;
  }

  const [lng, lat] = feature.center;
  return {
    lat,
    lng,
    match: feature.place_name || null,
  };
}

async function run() {
  const rows = [];
  const failures = [];

  for (const venue of venues) {
    try {
      const geo = await geocode(venue.address, "Lisbon");
      if (!geo) {
        failures.push({ ...venue, reason: "NO_GEOCODE_RESULT" });
      } else {
        rows.push({
          ...venue,
          lat: geo.lat,
          lng: geo.lng,
          match: geo.match,
        });
      }
    } catch (error) {
      failures.push({
        ...venue,
        reason: error?.message || "UNKNOWN_ERROR",
      });
    }
  }

  console.log("=== GEOCODE RESULTS ===");
  for (const row of rows) {
    console.log(
      `${row.name}\t${row.lat}\t${row.lng}\t${row.match}`
    );
  }

  if (failures.length > 0) {
    console.log("\n=== FAILURES ===");
    for (const failure of failures) {
      console.log(`${failure.name}\t${failure.reason}`);
    }
  }

  console.log("\n=== SQL VALUES TUPLES (name, city, location, lat, lng) ===");
  for (const row of rows) {
    console.log(
      `('${sqlEscape(row.name)}','${sqlEscape(row.city)}','${sqlEscape(row.address)}',${Number(row.lat).toFixed(6)},${Number(row.lng).toFixed(6)})`
    );
  }

  if (failures.length > 0) {
    process.exitCode = 2;
  }
}

run();
