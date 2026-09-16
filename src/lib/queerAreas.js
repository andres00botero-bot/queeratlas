const BERLIN_QUEER_AREAS = [
  {
    id: "berlin-schoeneberg",
    name: "Schöneberg",
    type: "Historic queer district",
    bestFor: "First-time visits, long-standing venues and community history",
    summary:
      "Nollendorfplatz, Motzstraße and Fuggerstraße form Berlin's best-known historic queer district. It is a practical base for a walkable evening, cafés and community landmarks.",
    practicalNote:
      "Start around Nollendorfplatz, then move at street level rather than treating the shaded area as a strict boundary.",
    sourceLabel: "visitBerlin: Berlin's gay neighbourhoods",
    sourceUrl: "https://www.visitberlin.de/en/berlins-gay-neighbourhoods/map",
    color: "#f5a9c6",
    center: [13.3548, 52.4981],
    bounds: [
      [13.3448, 52.4918],
      [13.3657, 52.5036],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [13.3463, 52.4931],
        [13.3541, 52.4919],
        [13.3643, 52.4948],
        [13.3657, 52.5007],
        [13.3602, 52.5032],
        [13.3506, 52.5029],
        [13.3448, 52.4991],
        [13.3463, 52.4931],
      ]],
    },
  },
  {
    id: "berlin-kreuzberg-36",
    name: "Kreuzberg 36",
    type: "Queer culture area",
    bestFor: "Community venues, daytime culture and an alternative night out",
    summary:
      "The Kottbusser Tor side of Kreuzberg is an openly mixed, queer-friendly part of the city with community venues and a more alternative rhythm than Schöneberg.",
    practicalNote:
      "Use Kottbusser Tor as the anchor, then check each venue's current programme before travelling across the city.",
    sourceLabel: "visitBerlin: Kreuzberg 36 for LGBTQ+",
    sourceUrl: "https://www.visitberlin.de/en/berlins-gay-neighbourhoods/map",
    color: "#88d9d4",
    center: [13.4182, 52.4988],
    bounds: [
      [13.4055, 52.4892],
      [13.4302, 52.5052],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [13.4081, 52.4903],
        [13.4204, 52.4892],
        [13.4284, 52.4934],
        [13.4302, 52.5004],
        [13.4228, 52.5048],
        [13.4126, 52.5035],
        [13.4055, 52.4984],
        [13.4081, 52.4903],
      ]],
    },
  },
  {
    id: "berlin-mitte-queer-culture",
    name: "Mitte: Hackescher Markt to Rosenthaler Platz",
    type: "Queer culture & shopping area",
    bestFor: "Daytime exploring, bars and a central cultural stop",
    summary:
      "The stretch from Hackescher Markt toward Rosenthaler Platz is a central queer meeting area with shops, bars and an easy connection to the rest of Berlin.",
    practicalNote:
      "This is an orientation area for a stroll, not a claim that every venue or street inside it is queer-focused.",
    sourceLabel: "visitBerlin: Berlin's gay neighbourhoods",
    sourceUrl: "https://www.visitberlin.de/en/berlins-gay-neighbourhoods/map",
    color: "#c4b5fd",
    center: [13.402, 52.5294],
    bounds: [
      [13.3905, 52.5214],
      [13.4128, 52.5364],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [13.3932, 52.5224],
        [13.4056, 52.5218],
        [13.4128, 52.5261],
        [13.4112, 52.5339],
        [13.4038, 52.5360],
        [13.3944, 52.5346],
        [13.3905, 52.5284],
        [13.3932, 52.5224],
      ]],
    },
  },
];

const AREAS_BY_CITY = {
  berlin: BERLIN_QUEER_AREAS,
};

export function getQueerAreasForCity(city) {
  return AREAS_BY_CITY[String(city || "").trim().toLowerCase()] || [];
}

export function queerAreasFeatureCollection(areas = []) {
  return {
    type: "FeatureCollection",
    features: (Array.isArray(areas) ? areas : []).map((area) => ({
      id: area.id,
      type: "Feature",
      geometry: area.geometry,
      properties: {
        id: area.id,
        name: area.name,
        type: area.type,
        color: area.color,
      },
    })),
  };
}

export function queerAreaLabelsFeatureCollection(areas = []) {
  return {
    type: "FeatureCollection",
    features: (Array.isArray(areas) ? areas : []).map((area) => ({
      id: `${area.id}-label`,
      type: "Feature",
      geometry: { type: "Point", coordinates: area.center },
      properties: {
        id: area.id,
        name: area.name,
        color: area.color,
      },
    })),
  };
}
