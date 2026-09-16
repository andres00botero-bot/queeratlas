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

const SAN_FRANCISCO_QUEER_AREAS = [
  {
    id: "san-francisco-castro",
    name: "The Castro",
    type: "Historic queer district",
    bestFor: "First-time visits, queer history, bars and a walkable evening",
    summary:
      "The Castro is San Francisco's best-known LGBTQ+ hub, with the Castro Theatre, Rainbow Honor Walk, community history and a dense mix of venues around Castro and 18th streets.",
    practicalNote:
      "Start at Castro and Market, then explore on foot toward 18th Street. Check individual venue schedules before making a late-night plan.",
    sourceLabel: "SF Travel: Castro",
    sourceUrl: "https://www.sftravel.com/neighborhoods/castro",
    color: "#f5a9c6",
    center: [-122.4354, 37.7607],
    bounds: [
      [-122.445, 37.7516],
      [-122.424, 37.7695],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-122.443, 37.753],
        [-122.432, 37.7516],
        [-122.424, 37.7577],
        [-122.4258, 37.7666],
        [-122.4356, 37.7695],
        [-122.445, 37.7648],
        [-122.443, 37.753],
      ]],
    },
  },
  {
    id: "san-francisco-soma-leather",
    name: "SoMa: Leather & LGBTQ Cultural District",
    type: "Leather, nightlife & culture area",
    bestFor: "Leather history, queer nightlife, performance and Folsom-weekend energy",
    summary:
      "South of Market brings together the Leather & LGBTQ Cultural District, Eagle Plaza and a broad mix of established queer nightlife and performance spaces.",
    practicalNote:
      "Use Eagle Plaza and Folsom Street as anchors. The area is larger and more spread out than the Castro, so plan stops rather than treating it as one short bar crawl.",
    sourceLabel: "SF Travel: LGBTQ+ history from Castro to SoMa",
    sourceUrl: "https://www.sftravel.com/article/uncovering-san-franciscos-lgbtq-history-citys-most-popular-%E2%80%98hoods",
    color: "#88d9d4",
    center: [-122.411, 37.7715],
    bounds: [
      [-122.424, 37.7602],
      [-122.397, 37.7838],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-122.4218, 37.7625],
        [-122.4052, 37.7602],
        [-122.397, 37.7693],
        [-122.4005, 37.7806],
        [-122.4168, 37.7838],
        [-122.424, 37.7735],
        [-122.4218, 37.7625],
      ]],
    },
  },
  {
    id: "san-francisco-polk-gulch",
    name: "Polk Gulch",
    type: "Historic queer corridor",
    bestFor: "Early queer history, a relaxed drink and a different side of the city",
    summary:
      "Polk Street is San Francisco's original gay district and a meaningful historic stop beyond the better-known Castro and SoMa scenes.",
    practicalNote:
      "Treat Polk as a focused historic and local stop, then combine it with nearby Nob Hill or another planned neighborhood rather than expecting Castro-scale density.",
    sourceLabel: "SF Travel: LGBTQ+ history from Castro to SoMa",
    sourceUrl: "https://www.sftravel.com/article/uncovering-san-franciscos-lgbtq-history-citys-most-popular-%E2%80%98hoods",
    color: "#c4b5fd",
    center: [-122.4224, 37.7921],
    bounds: [
      [-122.431, 37.7842],
      [-122.414, 37.8014],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-122.4295, 37.7852],
        [-122.419, 37.7842],
        [-122.414, 37.791],
        [-122.417, 37.8002],
        [-122.4255, 37.8014],
        [-122.431, 37.7935],
        [-122.4295, 37.7852],
      ]],
    },
  },
];

const MADRID_QUEER_AREAS = [
  {
    id: "madrid-chueca",
    name: "Chueca",
    type: "Landmark LGBTQ+ district",
    bestFor: "First-time visits, bars, terraces, shopping and late nights",
    summary:
      "Chueca is Madrid's practical and symbolic LGBTQ+ centre, built around Plaza de Chueca, Plaza de Pedro Zerolo and the nearby streets of Hortaleza and Fuencarral.",
    practicalNote:
      "Start at Plaza de Chueca, then explore outward on foot. Madrid nights start late, so confirm venue hours and leave room for the evening to build.",
    sourceLabel: "Tourism Madrid: Chueca",
    sourceUrl: "https://www.esmadrid.com/en/madrid-neighbourhoods/chueca",
    color: "#f5a9c6",
    center: [-3.7009, 40.4224],
    bounds: [
      [-3.7108, 40.4167],
      [-3.6934, 40.4283],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-3.7093, 40.4178],
        [-3.6994, 40.4167],
        [-3.6934, 40.4207],
        [-3.6955, 40.4269],
        [-3.7033, 40.4283],
        [-3.7108, 40.424],
        [-3.7093, 40.4178],
      ]],
    },
  },
  {
    id: "madrid-lavapies",
    name: "Lavapiés",
    type: "Alternative queer culture area",
    bestFor: "Alternative culture, community-led nights and a less concentrated scene",
    summary:
      "Lavapiés is an alternative cultural area with a recognised gay and lesbian scene, offering a different rhythm to Chueca's more concentrated LGBTQ+ core.",
    practicalNote:
      "Think of Lavapiés as a complementary cultural stop rather than a second Chueca. Check individual events and venues before crossing the city for the night.",
    sourceLabel: "Tourism Madrid: a beacon of tolerance and diversity",
    sourceUrl: "https://www.esmadrid.com/en/madrid-beacon-of-tolerance-diversity",
    color: "#88d9d4",
    center: [-3.7019, 40.4089],
    bounds: [
      [-3.7116, 40.4027],
      [-3.6935, 40.4156],
    ],
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-3.7096, 40.4035],
        [-3.6993, 40.4027],
        [-3.6935, 40.4077],
        [-3.6954, 40.4144],
        [-3.7041, 40.4156],
        [-3.7116, 40.4108],
        [-3.7096, 40.4035],
      ]],
    },
  },
];

const LONDON_QUEER_AREAS = [
  {
    id: "london-soho",
    name: "Soho",
    type: "Historic LGBTQ+ hub",
    bestFor: "First-time visits, classic pubs, drag and central nightlife",
    summary: "Soho is London's established LGBTQ+ hub, with a dense, walkable mix of long-running pubs, bars, cabaret and late-night venues.",
    practicalNote: "Use Old Compton Street and Wardour Street as anchors. It gets busy quickly, especially on weekends, so arrive with enough time to find your preferred room.",
    sourceLabel: "Visit London: Soho and Chinatown guide",
    sourceUrl: "https://www.visitlondon.com/things-to-do/london-areas/soho",
    color: "#f5a9c6",
    center: [-0.1328, 51.5132],
    bounds: [[-0.145, 51.507], [-0.119, 51.5194]],
    geometry: { type: "Polygon", coordinates: [[[-0.143, 51.508], [-0.125, 51.507], [-0.119, 51.513], [-0.124, 51.5186], [-0.137, 51.5194], [-0.145, 51.514], [-0.143, 51.508]]] },
  },
  {
    id: "london-vauxhall",
    name: "Vauxhall",
    type: "Queer clubbing area",
    bestFor: "Late club nights, performance and south-London energy",
    summary: "Vauxhall is one of London's enduring queer nightlife destinations, known for its party scene and a different pace from central Soho.",
    practicalNote: "Plan travel home before the night gets late. The venues are more spread out than Soho, so treat the area as a planned destination rather than a short bar crawl.",
    sourceLabel: "VisitBritain: LGBTQIA+ guide to London",
    sourceUrl: "https://www.visitbritain.com/en/things-to-do/lgbtqia-guide-london",
    color: "#88d9d4",
    center: [-0.1233, 51.4855],
    bounds: [[-0.134, 51.476], [-0.111, 51.493]],
    geometry: { type: "Polygon", coordinates: [[[-0.132, 51.477], [-0.117, 51.476], [-0.111, 51.483], [-0.115, 51.491], [-0.126, 51.493], [-0.134, 51.486], [-0.132, 51.477]]] },
  },
  {
    id: "london-east-end",
    name: "East London: Dalston & Shoreditch",
    type: "Contemporary queer nightlife area",
    bestFor: "Independent spaces, queer DJs and a later, more alternative night",
    summary: "The East End adds the more contemporary, alternative side of London's queer nightlife, with Dalston and Shoreditch acting as useful route anchors.",
    practicalNote: "The scene is distributed, so choose a venue or event first and build your route around it instead of expecting one continuous district.",
    sourceLabel: "VisitBritain: LGBTQIA+ guide to London",
    sourceUrl: "https://www.visitbritain.com/en/things-to-do/lgbtqia-guide-london",
    color: "#c4b5fd",
    center: [-0.0782, 51.5461],
    bounds: [[-0.101, 51.5305], [-0.052, 51.5615]],
    geometry: { type: "Polygon", coordinates: [[[-0.098, 51.532], [-0.068, 51.5305], [-0.052, 51.542], [-0.059, 51.556], [-0.08, 51.5615], [-0.101, 51.55], [-0.098, 51.532]]] },
  },
];

const PARIS_QUEER_AREAS = [
  {
    id: "paris-le-marais",
    name: "Le Marais",
    type: "Landmark LGBTQ+ district",
    bestFor: "First-time visits, queer history, bars, culture and an easy central walk",
    summary: "Le Marais is Paris's historic LGBTQIA+ heart, spanning the 3rd and 4th arrondissements with a high concentration of venues, culture and community life.",
    practicalNote: "Use Hôtel de Ville, Saint-Paul and Rue des Archives as route anchors. The district is easy to explore on foot, but check each venue's current programme before a late night.",
    sourceLabel: "Paris je t'aime: Le Marais, Paris's gay district",
    sourceUrl: "https://parisjetaime.com/eng/article/the-marais-paris-gay-a654",
    color: "#f5a9c6",
    center: [2.3606, 48.8598],
    bounds: [[2.344, 48.851], [2.378, 48.8695]],
    geometry: { type: "Polygon", coordinates: [[[2.347, 48.852], [2.368, 48.851], [2.378, 48.858], [2.373, 48.867], [2.353, 48.8695], [2.344, 48.861], [2.347, 48.852]]] },
  },
  {
    id: "paris-sopi-pigalle",
    name: "Pigalle & SoPi",
    type: "Inclusive nightlife area",
    bestFor: "Cabaret, inclusive bars and creative late-night energy",
    summary: "Pigalle and South Pigalle are part of Paris's expanding queer geography, with inclusive bars, cabaret and community-run events popular with younger creative crowds.",
    practicalNote: "This is an event-led area rather than a fixed gay district. Check what is on before travelling and use Pigalle station as a practical meeting point.",
    sourceLabel: "Paris je t'aime: Le Marais and new LGBT neighbourhoods",
    sourceUrl: "https://parisjetaime.com/eng/article/the-marais-paris-gay-a654",
    color: "#88d9d4",
    center: [2.3372, 48.8808],
    bounds: [[2.322, 48.872], [2.354, 48.8905]],
    geometry: { type: "Polygon", coordinates: [[[2.324, 48.873], [2.345, 48.872], [2.354, 48.879], [2.349, 48.888], [2.33, 48.8905], [2.322, 48.882], [2.324, 48.873]]] },
  },
  {
    id: "paris-belleville-eleventh",
    name: "Belleville & the 11th",
    type: "Independent queer culture area",
    bestFor: "Queer collectives, neighbourhood bars and independent culture",
    summary: "Belleville and the 11th arrondissement are part of the newer Paris queer landscape, with independent cultural venues, collectives and neighbourhood-led bars.",
    practicalNote: "The area is broad, so use a confirmed event or venue as the destination. It works best as a deliberately chosen night rather than an improvised detour from the Marais.",
    sourceLabel: "Paris je t'aime: Le Marais and new LGBT neighbourhoods",
    sourceUrl: "https://parisjetaime.com/eng/article/the-marais-paris-gay-a654",
    color: "#c4b5fd",
    center: [2.389, 48.8705],
    bounds: [[2.367, 48.853], [2.414, 48.888]],
    geometry: { type: "Polygon", coordinates: [[[2.37, 48.855], [2.4, 48.853], [2.414, 48.866], [2.406, 48.883], [2.384, 48.888], [2.367, 48.875], [2.37, 48.855]]] },
  },
];

const AREAS_BY_CITY = {
  berlin: BERLIN_QUEER_AREAS,
  san_francisco: SAN_FRANCISCO_QUEER_AREAS,
  madrid: MADRID_QUEER_AREAS,
  london: LONDON_QUEER_AREAS,
  paris: PARIS_QUEER_AREAS,
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
