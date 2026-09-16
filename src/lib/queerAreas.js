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

const NEW_YORK_QUEER_AREAS = [
  {
    id: "new-york-greenwich-village",
    name: "Greenwich Village & the West Village",
    type: "Historic LGBTQ+ district",
    bestFor: "Queer history, Stonewall, neighbourhood bars and a first NYC orientation",
    summary: "Greenwich Village remains one of New York's essential queer landmarks, centred around Christopher Street and the Stonewall National Monument.",
    practicalNote: "Start at Christopher Street, then explore west and south on foot. It is a history-rich area, so mix landmark visits with currently active listings.",
    sourceLabel: "NYC Tourism: Greenwich Village and Meatpacking District",
    sourceUrl: "https://www.business.nyctourism.com/press-media/press-releases/nyc-company-invites-visitors-to-see-manhattan-like-a-new-yorker",
    color: "#f5a9c6",
    center: [-74.003, 40.7337],
    bounds: [[-74.016, 40.725], [-73.99, 40.742]],
    geometry: { type: "Polygon", coordinates: [[[-74.014, 40.726], [-73.997, 40.725], [-73.99, 40.733], [-73.995, 40.741], [-74.007, 40.742], [-74.016, 40.735], [-74.014, 40.726]]] },
  },
  {
    id: "new-york-chelsea",
    name: "Chelsea",
    type: "Queer culture & nightlife area",
    bestFor: "Art, dining, bars and a west-side city route",
    summary: "Chelsea combines a long-standing queer presence with galleries, bars and an easy connection between the Village, Meatpacking District and Hudson River.",
    practicalNote: "Chelsea is broad. Use 8th Avenue and the High Line area as navigation anchors, then choose specific listings rather than expecting one compact strip.",
    sourceLabel: "NYC Tourism: Manhattan neighbourhood guide",
    sourceUrl: "https://www.business.nyctourism.com/press-media/press-releases/nyc-company-invites-visitors-to-see-manhattan-like-a-new-yorker",
    color: "#88d9d4",
    center: [-74.0038, 40.7463],
    bounds: [[-74.018, 40.735], [-73.987, 40.757]],
    geometry: { type: "Polygon", coordinates: [[[-74.016, 40.736], [-73.995, 40.735], [-73.987, 40.745], [-73.993, 40.756], [-74.008, 40.757], [-74.018, 40.748], [-74.016, 40.736]]] },
  },
  {
    id: "new-york-hells-kitchen",
    name: "Hell's Kitchen",
    type: "Midtown LGBTQ+ nightlife area",
    bestFor: "Bars, performance, late nights and a convenient Midtown base",
    summary: "Hell's Kitchen is a key Midtown LGBTQ+ nightlife area, useful for travellers who want a later social scene close to theatre and central transport.",
    practicalNote: "The area runs north–south along the west side of Midtown. Pick a venue first, especially on busy theatre nights, and plan your return trip before closing time.",
    sourceLabel: "NYC Tourism: Manhattan neighbourhood guide",
    sourceUrl: "https://www.business.nyctourism.com/press-media/press-releases/nyc-company-invites-visitors-to-see-manhattan-like-a-new-yorker",
    color: "#c4b5fd",
    center: [-73.9933, 40.7635],
    bounds: [[-74.008, 40.752], [-73.976, 40.776]],
    geometry: { type: "Polygon", coordinates: [[[-74.006, 40.753], [-73.984, 40.752], [-73.976, 40.763], [-73.982, 40.774], [-73.997, 40.776], [-74.008, 40.766], [-74.006, 40.753]]] },
  },
];

const MEXICO_CITY_QUEER_AREAS = [
  {
    id: "mexico-city-zona-rosa",
    name: "Zona Rosa",
    type: "Landmark LGBTQ+ district",
    bestFor: "Bars, clubs, queer shopping and a central first night",
    summary: "Zona Rosa is Mexico City's historic LGBTQ+ heart, with Amberes Street as a central nightlife anchor and a wider mix of bars, clubs and community life.",
    practicalNote: "Use Glorieta de Insurgentes and Amberes Street as starting points. Listings change quickly here, so confirm the current venue programme before heading out.",
    sourceLabel: "Mexico City Tourism: Zona Rosa nightlife for LGBT+ travellers",
    sourceUrl: "https://www.mexicocity.cdmx.gob.mx/venues/zona-rosa-lgbt/?lang=en",
    color: "#f5a9c6",
    center: [-99.1662, 19.4256],
    bounds: [[-99.176, 19.418], [-99.154, 19.4335]],
    geometry: { type: "Polygon", coordinates: [[[-99.174, 19.419], [-99.159, 19.418], [-99.154, 19.425], [-99.159, 19.432], [-99.17, 19.4335], [-99.176, 19.427], [-99.174, 19.419]]] },
  },
  {
    id: "mexico-city-republica-de-cuba",
    name: "República de Cuba corridor",
    type: "Historic queer nightlife corridor",
    bestFor: "Cabaret history, central nightlife and a more local-feeling route",
    summary: "The República de Cuba corridor in the Historic Centre is an important queer nightlife and cultural route, distinct from the Zona Rosa scene.",
    practicalNote: "This is a focused corridor, not a large district. Check current listings and travel plans carefully, particularly if moving between central neighbourhoods late at night.",
    sourceLabel: "Mexico City Tourism: Capital LGBTTTI guide",
    sourceUrl: "https://www.turismo.cdmx.gob.mx/storage/app/media/info_25/CAPITAL_LGBTTTI_2025.pdf",
    color: "#88d9d4",
    center: [-99.1375, 19.4395],
    bounds: [[-99.145, 19.433], [-99.13, 19.445]],
    geometry: { type: "Polygon", coordinates: [[[-99.143, 19.434], [-99.134, 19.433], [-99.13, 19.439], [-99.134, 19.444], [-99.141, 19.445], [-99.145, 19.44], [-99.143, 19.434]]] },
  },
];

const MONTREAL_QUEER_AREAS = [
  {
    id: "montreal-village",
    name: "The Village",
    type: "Landmark LGBTQ+ neighbourhood",
    bestFor: "First-time visits, terraces, nightlife, drag and Pride-season energy",
    summary: "Montréal's Village is one of North America's largest LGBTQ+ neighbourhoods, anchored by Beaudry metro and Sainte-Catherine Street East.",
    practicalNote: "Use Beaudry as the geographic centre and Sainte-Catherine East as the main route. Summer pedestrianisation changes the street rhythm, so check seasonal access and events.",
    sourceLabel: "Tourisme Montréal: The Village",
    sourceUrl: "https://www.mtl.org/en/city/about-montreal/neighbourhoods/montreal-the-village",
    color: "#f5a9c6",
    center: [-73.5556, 45.5195],
    bounds: [[-73.575, 45.5105], [-73.536, 45.5275]],
    geometry: { type: "Polygon", coordinates: [[[-73.573, 45.511], [-73.547, 45.5105], [-73.536, 45.517], [-73.543, 45.5255], [-73.559, 45.5275], [-73.575, 45.52], [-73.573, 45.511]]] },
  },
  {
    id: "montreal-plateau-mont-royal",
    name: "Plateau-Mont-Royal",
    type: "Citywide queer culture area",
    bestFor: "Queer events, local streets and a broader cultural daytime-to-night route",
    summary: "Queer Montréal extends beyond the Village, including the Plateau-Mont-Royal's main thoroughfares and event-led community spaces.",
    practicalNote: "This is a dispersed cultural area rather than a formal gay district. Choose a current listing or event, then build your route around it.",
    sourceLabel: "Tourisme Montréal: Queer Montréal stretches city-wide",
    sourceUrl: "https://www.mtl.org/en/experience/queer-mtl-stretches-city-wide",
    color: "#88d9d4",
    center: [-73.5825, 45.527],
    bounds: [[-73.603, 45.514], [-73.559, 45.54]],
    geometry: { type: "Polygon", coordinates: [[[-73.6, 45.515], [-73.571, 45.514], [-73.559, 45.524], [-73.567, 45.537], [-73.586, 45.54], [-73.603, 45.53], [-73.6, 45.515]]] },
  },
];

const LOS_ANGELES_QUEER_AREAS = [
  {
    id: "los-angeles-rainbow-district",
    name: "West Hollywood: Rainbow District",
    type: "Landmark LGBTQ+ district",
    bestFor: "First-time visits, nightlife, drag, queer businesses and Pride energy",
    summary: "West Hollywood's Rainbow District is LA's clearest LGBTQ+ anchor: a walkable Santa Monica Boulevard stretch packed with queer nightlife, culture and community life.",
    practicalNote: "The core runs along Santa Monica Boulevard between La Cienega and Doheny. It is unusually walkable for LA; use the local shuttle or rideshare for wider city connections.",
    sourceLabel: "Visit West Hollywood: Rainbow District",
    sourceUrl: "https://www.visitwesthollywood.com/neighborhoods/rainbow-district/",
    color: "#f5a9c6",
    center: [-118.378, 34.0834],
    bounds: [[-118.39, 34.077], [-118.366, 34.0905]],
    geometry: { type: "Polygon", coordinates: [[[-118.389, 34.078], [-118.371, 34.077], [-118.366, 34.083], [-118.371, 34.089], [-118.383, 34.0905], [-118.39, 34.085], [-118.389, 34.078]]] },
  },
  {
    id: "los-angeles-silver-lake",
    name: "Silver Lake",
    type: "Historic queer culture area",
    bestFor: "Queer history, independent bars, daytime culture and a less polished LA route",
    summary: "Silver Lake is a historic LGBTQ+ haven with sites including the Black Cat and Mattachine Steps, plus a more neighbourhood-led queer social energy.",
    practicalNote: "Silver Lake is dispersed and car-oriented. Choose a confirmed venue or cultural stop, then build a deliberate route rather than relying on a short walkable strip.",
    sourceLabel: "Discover Los Angeles: LGBTQ+ history in LA",
    sourceUrl: "https://www.discoverlosangeles.com/things-to-do/discover-lgbtq-history-in-los-angeles",
    color: "#88d9d4",
    center: [-118.2675, 34.086],
    bounds: [[-118.286, 34.071], [-118.248, 34.101]],
    geometry: { type: "Polygon", coordinates: [[[-118.282, 34.073], [-118.258, 34.071], [-118.248, 34.084], [-118.255, 34.098], [-118.273, 34.101], [-118.286, 34.09], [-118.282, 34.073]]] },
  },
];

const TORONTO_QUEER_AREAS = [
  {
    id: "toronto-church-wellesley",
    name: "Church-Wellesley Village",
    type: "Landmark 2SLGBTQ+ village",
    bestFor: "First-time visits, community history, drag, clubs and Pride-season energy",
    summary: "Church-Wellesley Village is Toronto's central 2SLGBTQ+ district, with year-round community life, nightlife, events and the city's deepest queer history.",
    practicalNote: "Use Church and Wellesley as the centre. The Village is compact and transit-connected, making it a strong base for a first Toronto queer itinerary.",
    sourceLabel: "Destination Toronto: Church-Wellesley Village",
    sourceUrl: "https://www.destinationtoronto.com/neighbourhoods/city-centre/church-wellesley-village/",
    color: "#f5a9c6",
    center: [-79.3815, 43.6651],
    bounds: [[-79.391, 43.655], [-79.37, 43.674]],
    geometry: { type: "Polygon", coordinates: [[[-79.389, 43.656], [-79.375, 43.655], [-79.37, 43.664], [-79.375, 43.672], [-79.384, 43.674], [-79.391, 43.666], [-79.389, 43.656]]] },
  },
  {
    id: "toronto-queer-west",
    name: "Queer West",
    type: "West-end queer culture area",
    bestFor: "Independent culture, Queen Street energy and a broader west-side route",
    summary: "Toronto's Queen Street West corridor, from Trinity Bellwoods toward Roncesvalles, is known as Queer West and expands the city's queer geography beyond the Village.",
    practicalNote: "This is a long corridor rather than one compact district. Pick a neighbourhood stop or event first, then use transit or rideshare between the western stretches.",
    sourceLabel: "Destination Toronto: 2SLGBTQ+ itinerary",
    sourceUrl: "https://www.destinationtoronto.com/travel-trade/tools-resources/itineraries/2slgbtq/",
    color: "#88d9d4",
    center: [-79.425, 43.6415],
    bounds: [[-79.468, 43.631], [-79.388, 43.65]],
    geometry: { type: "Polygon", coordinates: [[[-79.465, 43.632], [-79.404, 43.631], [-79.388, 43.64], [-79.4, 43.648], [-79.445, 43.65], [-79.468, 43.641], [-79.465, 43.632]]] },
  },
];

const BOGOTA_QUEER_AREAS = [
  {
    id: "bogota-chapinero",
    name: "Chapinero",
    type: "Landmark LGBTQ+ district",
    bestFor: "Large-scale nightlife, bars, clubs and a clear first orientation",
    summary: "Chapinero is Bogotá's central LGBTQ+ district, with a dense concentration of bars, clubs and community spaces and a major role in the city's queer nightlife.",
    practicalNote: "Choose a specific venue and use trusted transport for late travel. Chapinero is large, so do not treat the whole district as one walkable nightlife strip.",
    sourceLabel: "Bogotá.gov.co: LGBTIQ+ Pride guide",
    sourceUrl: "https://bogota.gov.co/en/international/celebrate-pride-month-bogota-top-places-events-june",
    color: "#f5a9c6",
    center: [-74.0635, 4.655],
    bounds: [[-74.083, 4.628], [-74.043, 4.68]],
    geometry: { type: "Polygon", coordinates: [[[-74.08, 4.63], [-74.053, 4.628], [-74.043, 4.649], [-74.05, 4.673], [-74.068, 4.68], [-74.083, 4.658], [-74.08, 4.63]]] },
  },
  {
    id: "bogota-la-playa",
    name: "La Playa Creative & Diverse District",
    type: "Queer culture and nightlife area",
    bestFor: "Culture, community events and the Theatron orbit",
    summary: "La Playa is a designated creative and diverse district in Chapinero, linking cultural spaces, Parque de los Hippies and one of Bogotá's major LGBTQ+ nightlife anchors.",
    practicalNote: "This is a focused part of wider Chapinero. It works best around a confirmed event, with a clear ride plan for the end of the night.",
    sourceLabel: "Bogotá.gov.co: La Playa Creative & Diverse District",
    sourceUrl: "https://bogota.gov.co/en/node/207244",
    color: "#88d9d4",
    center: [-74.0667, 4.6475],
    bounds: [[-74.075, 4.641], [-74.057, 4.654]],
    geometry: { type: "Polygon", coordinates: [[[-74.073, 4.642], [-74.061, 4.641], [-74.057, 4.647], [-74.061, 4.653], [-74.069, 4.654], [-74.075, 4.649], [-74.073, 4.642]]] },
  },
];

const SAO_PAULO_QUEER_AREAS = [{
  id: "sao-paulo-frei-caneca", name: "Frei Caneca & Consolação", type: "Queer nightlife corridor", bestFor: "Bars, nightlife, shopping and a central starting point",
  summary: "Frei Caneca and nearby Consolação are a practical central anchor for São Paulo's queer nightlife and social scene.", practicalNote: "São Paulo is vast: choose a confirmed venue and use rideshare for late journeys rather than treating the corridor as a complete night out.",
  sourceLabel: "Brazil Ministry of Tourism: LGBT+ Turismo Expo in São Paulo", sourceUrl: "https://www.gov.br/turismo/pt-br/assuntos/noticias/ministro-do-turismo-visita-a-5a-lgbt-turismo-expo-2026", color: "#f5a9c6", center: [-46.652, -23.554], bounds: [[-46.665, -23.566], [-46.639, -23.543]],
  geometry: { type: "Polygon", coordinates: [[[-46.663,-23.564],[-46.645,-23.566],[-46.639,-23.555],[-46.646,-23.544],[-46.658,-23.543],[-46.665,-23.553],[-46.663,-23.564]]] },
}];

const BUENOS_AIRES_QUEER_AREAS = [
  { id: "buenos-aires-palermo", name: "Palermo", type: "Queer nightlife & culture area", bestFor: "Bars, dining, nightlife and a flexible all-evening route", summary: "Palermo is a broad cultural and nightlife area that works well as part of Buenos Aires' citywide LGBTQ+ scene.", practicalNote: "Choose a confirmed venue or event first: Palermo is expansive and the best route varies greatly by night.", sourceLabel: "Visit Buenos Aires LGBT", sourceUrl: "https://visitbuenosaires.lgbt/en/", color: "#f5a9c6", center: [-58.425, -34.582], bounds: [[-58.447,-34.595],[-58.402,-34.566]], geometry:{type:"Polygon",coordinates:[[[-58.445,-34.593],[-58.414,-34.595],[-58.402,-34.583],[-58.41,-34.569],[-58.431,-34.566],[-58.447,-34.579],[-58.445,-34.593]]]} },
  { id: "buenos-aires-san-telmo", name: "San Telmo", type: "Historic queer culture area", bestFor: "Bohemian culture, historic streets and a more local night", summary: "San Telmo adds a historic, bohemian cultural layer to Buenos Aires' wider LGBTQ+ city experience.", practicalNote: "Use it as a culture-and-dinner route or an event-led night, rather than assuming a compact gay district.", sourceLabel: "Buenos Aires Tourism: San Telmo", sourceUrl: "https://turismo.buenosaires.gob.ar/es/barrios/san-telmo", color: "#88d9d4", center: [-58.373, -34.621], bounds: [[-58.386,-34.632],[-58.36,-34.61]], geometry:{type:"Polygon",coordinates:[[[-58.384,-34.63],[-58.366,-34.632],[-58.36,-34.62],[-58.366,-34.611],[-58.379,-34.61],[-58.386,-34.62],[-58.384,-34.63]]] } },
];

const BARCELONA_QUEER_AREAS = [{
  id: "barcelona-gaixample", name: "Gaixample", type: "Landmark LGBTQ+ district", bestFor: "First-time visits, bars, clubs, shopping and a walkable central night", summary: "Gaixample is Barcelona's central LGBTQ+ area in Eixample, with a concentrated mix of bars, venues and businesses.", practicalNote: "Use Casanova, Aragó and Diputació as practical anchors; it is compact enough to explore on foot.", sourceLabel: "Turisme de Barcelona: Gaixample", sourceUrl: "https://bid.barcelonaturisme.com/wv3/es/page/393/gaixample.html", color: "#f5a9c6", center: [2.155,41.385], bounds: [[2.14,41.376],[2.171,41.394]], geometry:{type:"Polygon",coordinates:[[[2.142,41.377],[2.165,41.376],[2.171,41.384],[2.166,41.392],[2.148,41.394],[2.14,41.386],[2.142,41.377]]]}
}];

const GRAN_CANARIA_QUEER_AREAS = [
  {
    id: "gran-canaria-yumbo-playa-del-ingles",
    name: "Yumbo & Playa del Inglés",
    type: "Queer resort nightlife hub",
    bestFor: "Year-round nightlife, bars, clubs and a first Gran Canaria base",
    summary: "Yumbo Centre in Playa del Inglés is Gran Canaria's most established queer nightlife anchor, within the wider Maspalomas resort area.",
    practicalNote: "Use Yumbo as the evening anchor. The shade is an orientation area, not a claim that every nearby street or beach is a queer venue.",
    sourceLabel: "Gran Canaria Tourism: Gay-friendly leisure",
    sourceUrl: "https://www.grancanaria.com/turismo/en/gay-friendly/leisure/?MP=250-3327",
    color: "#f5a9c6",
    center: [-15.5757, 27.758],
    bounds: [[-15.59, 27.747], [-15.56, 27.77]],
    geometry: { type: "Polygon", coordinates: [[[-15.588, 27.748], [-15.568, 27.747], [-15.56, 27.756], [-15.566, 27.767], [-15.579, 27.77], [-15.59, 27.761], [-15.588, 27.748]]] },
  },
];

const VIENNA_QUEER_AREAS = [
  {
    id: "vienna-naschmarkt-fourth-sixth",
    name: "Naschmarkt & the 4th/6th districts",
    type: "Queer nightlife & community area",
    bestFor: "Bars, cafés, a central evening and community-led events",
    summary: "Vienna's LGBTQIA+ scene is citywide, with a lively concentration around Naschmarkt and the adjoining fourth and sixth districts.",
    practicalNote: "This is a useful scene anchor rather than a formal gay district. Confirm a venue or event before travelling across the city.",
    sourceLabel: "Vienna Pride: travel information",
    sourceUrl: "https://viennapride.at/en/travel-info/",
    color: "#88d9d4",
    center: [16.356, 48.198],
    bounds: [[16.342, 48.191], [16.37, 48.205]],
    geometry: { type: "Polygon", coordinates: [[[16.344, 48.192], [16.362, 48.191], [16.37, 48.197], [16.366, 48.203], [16.352, 48.205], [16.342, 48.199], [16.344, 48.192]]] },
  },
];

const PRAGUE_QUEER_AREAS = [
  {
    id: "prague-vinohrady",
    name: "Vinohrady",
    type: "Queer nightlife & venue area",
    bestFor: "Bars, cafés, clubs and an easy central route",
    summary: "Prague's queer scene is venue- and event-led, with Vinohrady a practical anchor for LGBTQIA+ nightlife and community listings.",
    practicalNote: "This is an orientation area, not an official gay district. Check current venue programmes before making a late-night plan.",
    sourceLabel: "Prague City Tourism: Q Prague",
    sourceUrl: "https://prague.eu/en/q-prague/",
    color: "#c4b5fd",
    center: [14.438, 50.08],
    bounds: [[14.416, 50.065], [14.46, 50.094]],
    geometry: { type: "Polygon", coordinates: [[[14.418, 50.067], [14.447, 50.065], [14.46, 50.077], [14.454, 50.09], [14.434, 50.094], [14.416, 50.082], [14.418, 50.067]]] },
  },
];

const COPENHAGEN_QUEER_AREAS = [
  {
    id: "copenhagen-studiestraede",
    name: "Studiestræde & central Copenhagen",
    type: "Queer nightlife corridor",
    bestFor: "Historic LGBTQ+ bars, drag, clubs and a compact central night",
    summary: "Studiestræde is a practical central queer nightlife corridor, with several established LGBTQ+ venues close together in Copenhagen's inner city.",
    practicalNote: "This is a venue-led corridor, not a fixed boundary. Start on Studiestræde, then use live listings to decide where the evening continues.",
    sourceLabel: "VisitCopenhagen: LGBTQ+ venues on Studiestræde",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/masken-bar-gdk655853",
    color: "#f5a9c6",
    center: [12.5692, 55.676],
    bounds: [[12.56, 55.67], [12.579, 55.6815]],
    geometry: { type: "Polygon", coordinates: [[[12.561, 55.671], [12.575, 55.67], [12.579, 55.675], [12.575, 55.681], [12.564, 55.6815], [12.56, 55.676], [12.561, 55.671]]] },
  },
  {
    id: "copenhagen-christiania-bossehuset",
    name: "Christiania & Bøssehuset",
    type: "Queer culture & event area",
    bestFor: "Community culture, performances, exhibitions and events",
    summary: "Bøssehuset in Christiania is an LGBTQ+ cultural meeting place for performances, exhibitions, talks and parties.",
    practicalNote: "Use this as a cultural destination rather than a nightlife district, and check the programme before going.",
    sourceLabel: "VisitCopenhagen: Bøssehuset",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/bossehuset-gdk494171",
    color: "#88d9d4",
    center: [12.6, 55.673],
    bounds: [[12.585, 55.662], [12.617, 55.683]],
    geometry: { type: "Polygon", coordinates: [[[12.587, 55.663], [12.608, 55.662], [12.617, 55.671], [12.611, 55.681], [12.594, 55.683], [12.585, 55.674], [12.587, 55.663]]] },
  },
];

const COLOGNE_QUEER_AREAS = [
  {
    id: "cologne-schaafenstrasse",
    name: "Schaafenstraße & Rudolfplatz",
    type: "Landmark LGBTQIA+ nightlife corridor",
    bestFor: "Dense bar-hopping, clubs, saunas and an easy first Cologne night",
    summary: "Schaafenstraße is Cologne's compact LGBTQIA+ nightlife hotspot, with a high concentration of bars and party venues close to Rudolfplatz.",
    practicalNote: "The core street is short and walkable. Use Rudolfplatz as the transit anchor, then confirm individual venue hours before a late night.",
    sourceLabel: "Cologne Tourist Board: Schaafenstraße",
    sourceUrl: "https://willkommen.koelntourismus.de/en/poi/schaafenstrasse",
    color: "#f5a9c6",
    center: [6.9403, 50.9397],
    bounds: [[6.931, 50.9345], [6.949, 50.9445]],
    geometry: { type: "Polygon", coordinates: [[[6.932, 50.935], [6.944, 50.9345], [6.949, 50.939], [6.945, 50.9438], [6.936, 50.9445], [6.931, 50.9402], [6.932, 50.935]]] },
  },
];

const HAMBURG_QUEER_AREAS = [
  {
    id: "hamburg-st-georg-lange-reihe",
    name: "St. Georg & Lange Reihe",
    type: "Historic queer neighbourhood",
    bestFor: "Bars, restaurants, community life and a central neighbourhood route",
    summary: "St. Georg, especially around Lange Reihe, is Hamburg's best-known long-standing queer neighbourhood and a practical central scene anchor.",
    practicalNote: "The area is close to Hauptbahnhof and works well on foot. It is a lived-in diverse neighbourhood, so use venue listings rather than treating every street as nightlife.",
    sourceLabel: "Hamburg.de: St. Georg",
    sourceUrl: "https://www.hamburg.de/leben-in-hamburg/bezirke-hamburg/stadtteile-bezirk-hamburg-mitte/st-georg-373908",
    color: "#f5a9c6",
    center: [10.012, 53.5575],
    bounds: [[9.996, 53.548], [10.028, 53.566]],
    geometry: { type: "Polygon", coordinates: [[[9.998, 53.549], [10.02, 53.548], [10.028, 53.555], [10.023, 53.563], [10.009, 53.566], [9.996, 53.558], [9.998, 53.549]]] },
  },
  {
    id: "hamburg-st-pauli",
    name: "St. Pauli",
    type: "Queer nightlife & culture area",
    bestFor: "Late nights, clubs, queer events and a more alternative city route",
    summary: "St. Pauli is a major part of Hamburg's broader LGBTQIA+ nightlife and cultural scene, with a more event-led character than St. Georg.",
    practicalNote: "This is a broad entertainment area, not a compact gay district. Choose a current venue or event first and plan travel home before the night ends.",
    sourceLabel: "Hamburg Tourism: LGBTQIA+ hotspots",
    sourceUrl: "https://www.hamburg-tourism.de/das-ist-hamburg/hamburg-fuer/lgbtq/html.api",
    color: "#88d9d4",
    center: [9.964, 53.55],
    bounds: [[9.947, 53.538], [9.981, 53.56]],
    geometry: { type: "Polygon", coordinates: [[[9.949, 53.539], [9.973, 53.538], [9.981, 53.547], [9.976, 53.557], [9.959, 53.56], [9.947, 53.551], [9.949, 53.539]]] },
  },
];

const FRANKFURT_QUEER_AREAS = [
  {
    id: "frankfurt-bermuda-triangle-alte-gasse",
    name: "Bermuda Triangle & Alte Gasse",
    type: "Queer nightlife & community hub",
    bestFor: "Central bars, community resources and a compact city-centre route",
    summary: "Frankfurt's LGBTQ+ community is anchored by the city-centre Bermuda Triangle, with Alte Gasse a key meeting and support-point corridor.",
    practicalNote: "Use Konstablerwache and Alte Gasse as navigation anchors. The scene is venue- and event-led, so check current programming before setting out.",
    sourceLabel: "Visit Frankfurt: LGBTQ+ community",
    sourceUrl: "https://www.visitfrankfurt.travel/en/frankfurt-tips/lgbtq-community",
    color: "#c4b5fd",
    center: [8.6909, 50.1157],
    bounds: [[8.681, 50.11], [8.701, 50.121]],
    geometry: { type: "Polygon", coordinates: [[[8.682, 50.111], [8.696, 50.11], [8.701, 50.115], [8.696, 50.1205], [8.686, 50.121], [8.681, 50.116], [8.682, 50.111]]] },
  },
];

const BRIGHTON_QUEER_AREAS = [
  {
    id: "brighton-kemptown-st-james-street",
    name: "Kemptown & St James's Street",
    type: "Landmark LGBTQIA+ quarter",
    bestFor: "Bars, clubs, independent shops, seafront stays and Pride energy",
    summary: "Kemptown is the bustling heart of Brighton's LGBTQIA+ community, with St James's Street providing a compact, walkable nightlife and community corridor.",
    practicalNote: "Start around St James's Street and Old Steine, then continue on foot. Check individual venue programmes, especially around Pride and other major weekends.",
    sourceLabel: "Visit Brighton: LGBTQIA+ and Kemptown",
    sourceUrl: "https://www.visitbrighton.com/plan-your-visit/about-the-area/lgbtqia",
    color: "#f5a9c6",
    center: [-0.1298, 50.821],
    bounds: [[-0.146, 50.813], [-0.113, 50.829]],
    geometry: { type: "Polygon", coordinates: [[[-0.144, 50.814], [-0.12, 50.813], [-0.113, 50.82], [-0.119, 50.827], [-0.134, 50.829], [-0.146, 50.822], [-0.144, 50.814]]] },
  },
];

const WARSAW_QUEER_AREAS = [
  {
    id: "warsaw-srodmiescie-queer-culture",
    name: "Śródmieście queer culture circuit",
    type: "Queer culture & event area",
    bestFor: "Drag, ballroom, independent culture and event-led evenings",
    summary: "Warsaw's queer life is spread across the city, with a strong concentration of LGBTQ+ nightlife, drag, ballroom and cultural venues in central Śródmieście.",
    practicalNote: "This is an event-led orientation area, not a formal gay district. Choose a current listing first and check its own accessibility and safer-space guidance.",
    sourceLabel: "City of Warsaw: safer spaces map",
    sourceUrl: "https://um.warszawa.pl/documents/46187514/93088346/EN_map%2Bwarsaw%2Bsafer%2Bspaces.pdf/be19371f-e372-d774-4e82-7e6810879544?t=1741252671234",
    color: "#c4b5fd",
    center: [21.0125, 52.229],
    bounds: [[20.985, 52.215], [21.04, 52.245]],
    geometry: { type: "Polygon", coordinates: [[[20.988, 52.216], [21.027, 52.215], [21.04, 52.227], [21.032, 52.241], [21.005, 52.245], [20.985, 52.233], [20.988, 52.216]]] },
  },
];

const ATHENS_QUEER_AREAS = [
  {
    id: "athens-gazi-kerameikos",
    name: "Gazi & Kerameikos",
    type: "Landmark LGBTQ+ nightlife area",
    bestFor: "Clubs, late nights, queer culture and an alternative Athens route",
    summary: "Gazi is Athens' central LGBTQ+ clubbing area, combining queer-friendly nightlife with post-industrial culture around Kerameikos and Technopolis.",
    practicalNote: "Use Kerameikos metro and the main square as anchors. It is a nightlife area with different rhythms by day and night, so confirm venue programming before going.",
    sourceLabel: "This is Athens: LGBT+ hotspots",
    sourceUrl: "https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs",
    color: "#f5a9c6",
    center: [23.345, 37.9795],
    bounds: [[23.328, 37.969], [23.362, 37.989]],
    geometry: { type: "Polygon", coordinates: [[[23.33, 37.97], [23.354, 37.969], [23.362, 37.977], [23.357, 37.987], [23.342, 37.989], [23.328, 37.98], [23.33, 37.97]]] },
  },
];

const HONG_KONG_QUEER_AREAS = [
  {
    id: "hong-kong-central-sheung-wan",
    name: "Central, SoHo & Sheung Wan",
    type: "Queer nightlife & venue area",
    bestFor: "Bars, clubs, dining and an accessible Hong Kong Island night",
    summary: "Hong Kong's queer nightlife is venue-led, with Central, SoHo and nearby Sheung Wan providing a practical cluster for bars, clubs and late-night socialising.",
    practicalNote: "This is not an official gay district. Start around SoHo or Hollywood Road, then use current listings to choose the next stop and confirm opening hours.",
    sourceLabel: "Hong Kong Tourism Board: SoHo",
    sourceUrl: "https://www.discoverhongkong.com/eng/place-to-go/travel.guide-soho.html",
    color: "#88d9d4",
    center: [114.1515, 22.2835],
    bounds: [[114.136, 22.274], [114.166, 22.291]],
    geometry: { type: "Polygon", coordinates: [[[114.138, 22.275], [114.158, 22.274], [114.166, 22.281], [114.161, 22.289], [114.148, 22.291], [114.136, 22.284], [114.138, 22.275]]] },
  },
];

const ROME_QUEER_AREAS = [
  {
    id: "rome-gay-street-laterano",
    name: "Gay Street: Via di San Giovanni in Laterano",
    type: "Official LGBTQ+ meeting street",
    bestFor: "Central evening drinks, queer history, drag and a Colosseum-side route",
    summary: "Via di San Giovanni in Laterano is Rome's officially named Gay Street: a short pedestrian-friendly LGBTQ+ meeting corridor between the Colosseum and Lateran.",
    practicalNote: "The core is compact and works best as an evening stop. Check live listings before relying on a particular bar, show or late-night programme.",
    sourceLabel: "Visit Lazio: Rome's Gay Street",
    sourceUrl: "https://www.visitlazio.com/en/the-gay-street-of-rome/",
    color: "#f5a9c6",
    center: [12.5015, 41.8875],
    bounds: [[12.491, 41.881], [12.512, 41.894]],
    geometry: { type: "Polygon", coordinates: [[[12.492, 41.882], [12.506, 41.881], [12.512, 41.887], [12.507, 41.893], [12.497, 41.894], [12.491, 41.888], [12.492, 41.882]]] },
  },
];

const MILANO_QUEER_AREAS = [
  {
    id: "milano-porta-venezia",
    name: "Porta Venezia",
    type: "Landmark LGBTQIA+ district",
    bestFor: "Queer nightlife, community culture, design, dining and Pride energy",
    summary: "Porta Venezia is Milan's rainbow district, centred on a lively mix of LGBTQIA+ culture, nightlife and community around Corso Buenos Aires and Via Lecco.",
    practicalNote: "Use Porta Venezia station and Via Lecco as practical anchors. It is walkable, but confirm individual venues and events before building a late-night route.",
    sourceLabel: "VisitMilano: Porta Venezia",
    sourceUrl: "https://visitmilano.org/eng/sightseeing/must-see-cool-districts/porta-venezia/",
    color: "#f5a9c6",
    center: [9.207, 45.477],
    bounds: [[9.193, 45.468], [9.222, 45.486]],
    geometry: { type: "Polygon", coordinates: [[[9.195, 45.469], [9.215, 45.468], [9.222, 45.475], [9.217, 45.483], [9.203, 45.486], [9.193, 45.478], [9.195, 45.469]]] },
  },
];

const AMSTERDAM_QUEER_AREAS = [
  {
    id: "amsterdam-reguliersdwarsstraat",
    name: "Reguliersdwarsstraat",
    type: "Landmark LGBTQI+ street",
    bestFor: "Bars, clubs, cocktails and a high-energy central night",
    summary: "Reguliersdwarsstraat is Amsterdam's de facto gay street and one of the city's most established LGBTQI+ nightlife concentrations.",
    practicalNote: "The core is compact, close to Rembrandtplein and easy to explore on foot. Check the individual venue programme before choosing a late stop.",
    sourceLabel: "I amsterdam: LGBTQI+ neighbourhoods",
    sourceUrl: "https://www.iamsterdam.com/en/whats-on/lgbtqi-areas-of-amsterdam",
    color: "#f5a9c6",
    center: [4.8932, 52.3658],
    bounds: [[4.885, 52.361], [4.902, 52.37]],
    geometry: { type: "Polygon", coordinates: [[[4.886, 52.362], [4.898, 52.361], [4.902, 52.365], [4.898, 52.369], [4.89, 52.37], [4.885, 52.366], [4.886, 52.362]]] },
  },
  {
    id: "amsterdam-zeedijk-warmoesstraat",
    name: "Zeedijk & Warmoesstraat",
    type: "Historic LGBTQI+ nightlife hub",
    bestFor: "Historic venues, bars, Old Centre exploring and late-night options",
    summary: "The Zeedijk and Warmoesstraat area remains one of Amsterdam's concentrated hubs for LGBTQI+-friendly shops and nightlife.",
    practicalNote: "This sits within the busy Old Centre. Use a specific listing as the destination, then move on foot rather than treating the shaded area as a strict boundary.",
    sourceLabel: "I amsterdam: LGBTQI+ neighbourhoods",
    sourceUrl: "https://www.iamsterdam.com/en/whats-on/lgbtqi-areas-of-amsterdam",
    color: "#88d9d4",
    center: [4.899, 52.374],
    bounds: [[4.89, 52.369], [4.908, 52.379]],
    geometry: { type: "Polygon", coordinates: [[[4.891, 52.37], [4.904, 52.369], [4.908, 52.374], [4.903, 52.378], [4.895, 52.379], [4.89, 52.375], [4.891, 52.37]]] },
  },
];

const LISBON_QUEER_AREAS = [
  {
    id: "lisbon-principe-real-bairro-alto",
    name: "Príncipe Real & Bairro Alto",
    type: "Queer nightlife & culture area",
    bestFor: "Bars, late-night energy, viewpoints and a central evening route",
    summary: "Príncipe Real and Bairro Alto form Lisbon's best-known queer-friendly nightlife area, blending a relaxed daytime neighbourhood feel with bars and clubs after dark.",
    practicalNote: "The streets are steep and the scene is dispersed. Start in Príncipe Real or Bairro Alto, choose a confirmed venue, and leave time for walking between stops.",
    sourceLabel: "Lisbon Portugal Tourism: Príncipe Real",
    sourceUrl: "https://www.lisbonportugaltourism.com/guide/principe-real.html",
    color: "#c4b5fd",
    center: [-9.151, 38.715],
    bounds: [[-9.164, 38.706], [-9.14, 38.723]],
    geometry: { type: "Polygon", coordinates: [[[-9.162, 38.707], [-9.145, 38.706], [-9.14, 38.714], [-9.145, 38.722], [-9.156, 38.723], [-9.164, 38.716], [-9.162, 38.707]]] },
  },
];

const GLASGOW_QUEER_AREAS = [
  {
    id: "glasgow-merchant-city",
    name: "Merchant City",
    type: "Landmark LGBTQ+ district",
    bestFor: "Bars, drag, cabaret, dining and a walkable city-centre night",
    summary: "Merchant City is Glasgow's LGBTQ+ district, bringing together established gay bars, performance venues and the city's dense central nightlife.",
    practicalNote: "The core is compact and walkable. Start near Virginia Street and Candleriggs, then check current stage shows and bar hours before your visit.",
    sourceLabel: "Visit Glasgow: LGBTQ+ guide",
    sourceUrl: "https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide/",
    color: "#f5a9c6",
    center: [-4.244, 55.858],
    bounds: [[-4.254, 55.851], [-4.234, 55.865]],
    geometry: { type: "Polygon", coordinates: [[[-4.252, 55.852], [-4.239, 55.851], [-4.234, 55.857], [-4.239, 55.864], [-4.249, 55.865], [-4.254, 55.859], [-4.252, 55.852]]] },
  },
];

const ATLANTA_QUEER_AREAS = [
  {
    id: "atlanta-midtown-piedmont-tenth",
    name: "Midtown: Piedmont & 10th",
    type: "Landmark LGBTQ+ city hub",
    bestFor: "Bars, culture, Pride history, Piedmont Park and a first Atlanta base",
    summary: "Midtown is the core of Atlanta's LGBTQ+ life, with the Piedmont Avenue and 10th Street intersection serving as a visible community landmark.",
    practicalNote: "Use Piedmont Park, the rainbow crosswalk and Midtown MARTA as anchors. Choose specific venues from current listings; the scene extends beyond one short block.",
    sourceLabel: "Discover Atlanta: LGBTQ+ guide to Midtown",
    sourceUrl: "https://discoveratlanta.com/stories/things-to-do/a-travelers-lgbtq-guide-to-midtown-atlanta/",
    color: "#88d9d4",
    center: [-84.3635, 33.781],
    bounds: [[-84.383, 33.769], [-84.345, 33.794]],
    geometry: { type: "Polygon", coordinates: [[[-84.381, 33.77], [-84.355, 33.769], [-84.345, 33.779], [-84.351, 33.79], [-84.369, 33.794], [-84.383, 33.784], [-84.381, 33.77]]] },
  },
];

const CHICAGO_QUEER_AREAS = [
  {
    id: "chicago-northalsted",
    name: "Northalsted (Boystown)",
    type: "Official LGBTQ+ neighbourhood",
    bestFor: "Drag, clubs, LGBTQ+ history, Pride and a high-energy weekend",
    summary: "Northalsted is Chicago's landmark LGBTQ+ neighbourhood and the United States' oldest officially recognised gay neighbourhood, centred on North Halsted Street.",
    practicalNote: "Use Halsted between Belmont and Grace as the anchor. The Legacy Walk and rainbow pylons make it easy to navigate on foot; check individual show times before going.",
    sourceLabel: "Choose Chicago: Northalsted",
    sourceUrl: "https://www.choosechicago.com/neighborhoods/boystown/",
    color: "#f5a9c6",
    center: [-87.649, 41.9405],
    bounds: [[-87.663, 41.927], [-87.635, 41.953]],
    geometry: { type: "Polygon", coordinates: [[[-87.661, 41.928], [-87.642, 41.927], [-87.635, 41.938], [-87.641, 41.949], [-87.654, 41.953], [-87.663, 41.942], [-87.661, 41.928]]] },
  },
  {
    id: "chicago-andersonville",
    name: "Andersonville",
    type: "Neighbourhood queer community area",
    bestFor: "Independent shops, dining, a calmer social route and community culture",
    summary: "Andersonville is a north-side neighbourhood with one of Chicago's largest LGBTQ+ populations and a welcoming, community-led scene along Clark Street.",
    practicalNote: "This is a broader neighbourhood rather than a club strip. Use Clark Street as the route anchor and check current events for the strongest queer focus.",
    sourceLabel: "Choose Chicago: LGBTQ+ neighbourhood guide",
    sourceUrl: "https://www.choosechicago.com/articles/lgbtq-plus/the-ultimate-lgbtq-chicago-guide/",
    color: "#c4b5fd",
    center: [-87.669, 41.98],
    bounds: [[-87.682, 41.968], [-87.657, 41.993]],
    geometry: { type: "Polygon", coordinates: [[[-87.68, 41.969], [-87.663, 41.968], [-87.657, 41.979], [-87.663, 41.99], [-87.675, 41.993], [-87.682, 41.983], [-87.68, 41.969]]] },
  },
];

const AREAS_BY_CITY = {
  berlin: BERLIN_QUEER_AREAS,
  san_francisco: SAN_FRANCISCO_QUEER_AREAS,
  madrid: MADRID_QUEER_AREAS,
  london: LONDON_QUEER_AREAS,
  paris: PARIS_QUEER_AREAS,
  new_york: NEW_YORK_QUEER_AREAS,
  mexico_city: MEXICO_CITY_QUEER_AREAS,
  montreal: MONTREAL_QUEER_AREAS,
  los_angeles: LOS_ANGELES_QUEER_AREAS,
  toronto: TORONTO_QUEER_AREAS,
  bogota: BOGOTA_QUEER_AREAS,
  sao_paulo: SAO_PAULO_QUEER_AREAS,
  buenos_aires: BUENOS_AIRES_QUEER_AREAS,
  barcelona: BARCELONA_QUEER_AREAS,
  gran_canaria: GRAN_CANARIA_QUEER_AREAS,
  vienna: VIENNA_QUEER_AREAS,
  prague: PRAGUE_QUEER_AREAS,
  copenhagen: COPENHAGEN_QUEER_AREAS,
  cologne: COLOGNE_QUEER_AREAS,
  hamburg: HAMBURG_QUEER_AREAS,
  frankfurt: FRANKFURT_QUEER_AREAS,
  brighton: BRIGHTON_QUEER_AREAS,
  warsaw: WARSAW_QUEER_AREAS,
  athens: ATHENS_QUEER_AREAS,
  hong_kong: HONG_KONG_QUEER_AREAS,
  rome: ROME_QUEER_AREAS,
  milano: MILANO_QUEER_AREAS,
  amsterdam: AMSTERDAM_QUEER_AREAS,
  lisbon: LISBON_QUEER_AREAS,
  glasgow: GLASGOW_QUEER_AREAS,
  atlanta: ATLANTA_QUEER_AREAS,
  chicago: CHICAGO_QUEER_AREAS,
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
