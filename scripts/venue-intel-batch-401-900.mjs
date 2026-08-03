import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const citySources = {
  cologne: ["https://magazine.cologne-tourism.com/cologne/queer-cologne-top-tips-for-a-night-out-on-the-town/"],
  copenhagen: ["https://www.visitcopenhagen.com/copenhagen/eat-drink/bars-and-nightlife/lgbtq-cafes-bars-and-nightlife-copenhagen"],
  crete: ["https://www.travelgay.com/Crete-gay-bars-clubs"],
  cyprus: ["https://en.wikipedia.org/wiki/LGBTQ_rights_in_Cyprus"],
  dublin: ["https://www.visitdublin.com/guides/lgbtq-guide-to-dublin"],
  edinburgh: ["https://edinburgh.org/inspire/edinburgh-city-guides/lgbtqia/"],
  florence: ["https://www.travelgay.com/florence-gay-bars"],
  florianopolis: ["https://www.gayout.com/south-america/brazil/florianopolis/bars"],
  frankfurt: ["https://www.visitfrankfurt.travel/en/frankfurt-tips/lgbtq-community"],
  geneva: ["https://www.misterbandb.com/gay-guide/switzerland/geneva/map/50-bars-clubs"],
  glasgow: ["https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide/"],
  gran_canaria: ["https://www.travelgay.com/destination/gay-spain/gay-gran-canaria"],
  guadalajara: ["https://www.thisweekinguadalajara.com/post/lgbtq-guadalajara-guide"],
  guatemala_city: ["https://www.queeratlas.app/guatemala_city"],
  hamburg: ["https://www.hamburg.com/residents/lgbtqi-/nightlife-19252"],
  hanoi: ["https://revitrip.com/en/blog/hanoi-gay-bars-lgbtq-nightlife-guide"],
  havana: ["https://www.travelgay.com/destination/gay-cuba/gay-havana"],
  helsinki: ["https://www.gaymapper.com/gay-guide/gay-helsinki/gay-bars"],
  ho_chi_minh: ["https://www.travelgay.com/ho-chi-minh-gay-bars"],
  "hong-kong": ["https://www.timeout.com/hong-kong/lgbt/the-best-lgbtqi-venues-in-hong-kong"],
  ibiza: ["https://www.travelgay.com/gay-ibiza-bars-clubs"],
  jakarta: ["https://www.travelgay.com/essential-guide-jakarta"],
  johannesburg: ["https://www.inyourpocket.com/southafrica/johannesburg/articles/joburgs-queer-friendly-bars-restaurants-and"],
  koh_samui: ["https://www.travelgay.com/samui-gay-bars"],
  krakow: ["https://qlist.app/cities/Poland/Krakow/218"],
  kuala_lumpur: ["https://www.travelgay.com/kuala-lumpur-gay-bars-dance-clubs"],
  kyiv: ["https://www.travelgay.com/kiev-gay-bars-clubs"],
  la_paz: ["https://www.gayout.com/es/south-america/bolivia/la-paz"],
  las_vegas: ["https://vegas.eater.com/maps/best-lgbtq-queer-bars-nightclubs-las-vegas"],
  lima: ["https://www.travelgay.com/destination/gay-peru/gay-lima"],
  lisbon: ["https://www.misterbandb.com/gay-guide/portugal/lisbon/50-bars-clubs"],
  liverpool: ["https://www.visitbritain.com/en/things-to-do/lgbtqia-guide-liverpool"],
  ljubljana: ["https://www.visitljubljana.com/en/visitors/travel-information/lgbtqi/bars-and-clubs"],
  london: ["https://www.timeout.com/london/nightlife/the-best-gay-bars-in-london"],
  los_angeles: ["https://la.eater.com/maps/lgbtq-queer-bars-cocktails-los-angeles-pride"],
  lyon: ["https://www.misterbandb.com/gay-guide/france/lyon/50-bars-clubs"],
  madrid: ["https://www.travelgay.com/madrid-gay-bars/"],
  mallorca: ["https://www.travelgay.com/mallorca-gay-bars-clubs"],
  malmo: ["https://thatsup.se/malmo/guide/hbtq-guiden-malmos-basta-gaystallen/"],
  malta: ["https://nomadicboys.com/gay-malta-travel-guide/"],
  managua: ["https://en.wikipedia.org/wiki/Managua"],
  manchester: ["https://www.visitmanchester.com/ideas-and-inspiration/blog/post/visit-manchester-insiders-guide-part-10-lgbtq/"],
  manila: ["https://www.travelgay.com/manila-gay-bars"],
  marrakech: ["https://www.travelgay.com/destination/gay-morocco/gay-marrakech"],
  marseille: ["https://www.travelgay.com/marseille-gay-bars"],
  medellin: ["https://www.travelandleisure.com/lgbtq-guide-to-medellin-colombia-7964494"],
  melbourne: ["https://whatson.melbourne.vic.gov.au/things-to-do/lgbtiq"],
  mendoza: ["https://www.gayout.com/south-america/argentina/mendoza"],
  mexico_city: ["https://www.turismo.cdmx.gob.mx/storage/app/media/info_25/CAPITAL_LGBTTTI_2025.pdf"],
  miami: ["https://outxout.com/blog/lgbtq-guide-miami"],
  milano: ["https://www.yesmilano.it/en/articles/lgbtq-milano"],
  montenegro: ["https://www.queeratlas.app/montenegro"],
  montevideo: ["https://www.gayout.com/south-america/uruguay/montevideo"],
  montreal: ["https://www.mtl.org/en/experience/queer-mtl-stretches-city-wide"],
  moscow: ["https://www.gov.uk/foreign-travel-advice/russia/safety-and-security"],
  mumbai: ["https://www.travelgay.com/gay-mumbai"],
  munich: ["https://www.munichtourism.org/lgbtq-nightlife-munich/"],
  mykonos: ["https://resources.pridetravelers.com/guide/gay-mykonos-travel-guide"],
  naples: ["https://www.travelgay.com/naples-gay-bars"],
  new_delhi: ["https://www.timeout.com/delhi/lgbtq/best-queer-friendly-bars"],
  new_orleans: ["https://www.neworleans.com/things-to-do/lgbt/"],
  new_york: ["https://www.timeout.com/newyork/lgbt"],
  nice: ["https://www.travelgay.com/nice-gay-bars"],
  orlando: ["https://www.visitorlando.com/blog/post/lgbtq-orlando-travel-guide/"],
  oslo: ["https://www.visitoslo.com/en/your-oslo/queer-oslo/"],
  ottawa: ["https://ottawatourism.ca/en/ottawa-insider/lgbtq2-ottawa"],
  palm_springs: ["https://visitpalmsprings.com/blog/post/palm-springs-nightlife-guide/"],
  panama_city: ["https://www.travelgay.com/destination/gay-panama/gay-panama-city"],
  paris: ["https://parisjetaime.com/eng/article/lgbt-paris-a471"],
  philadelphia: ["https://www.visitphilly.com/articles/philadelphia/lgbtq/"],
  phnom_penh: ["https://www.travelgay.com/phnom-penh-gay-bars"],
  phuket: ["https://radugatravel.com/en/blog/phuket-lgbtq-travel-guide/"],
  porto: ["https://www.travelgay.com/porto-gay-bars"],
  prague: ["https://www.prague.eu/en/articles/lgbt-prague/"],
  provincetown: ["https://ptown.org/calendars/ultimate-travel-guides/"],
  puerto_vallarta: ["https://resources.pridetravelers.com/guide/the-complete-lgbtq-travel-guide-to-puerto-vallarta"],
  quito: ["https://www.queeratlas.app/quito"],
  reykjavik: ["https://visitreykjavik.is/trip-ideas/your-lgbtqia-guide-reykjavik"],
  riga: ["https://www.liveriga.com/en/13868-lgbt-friendly-riga"],
  rio_de_janeiro: ["https://guidetobrazil.com/rio/queer-nightlife-guide-to-rio-de-janeiro-2026-clubs-events-sapphic-spaces-and-more"],
  rome: ["https://www.travelgay.com/rome-gay-bars"],
  rotterdam: ["https://www.rotterdam.info/en/visit/guide/lgbtqia"],
  saint_petersburg: ["https://www.gov.uk/foreign-travel-advice/russia/safety-and-security"],
  salvador_bahia: ["https://www.travelgay.com/destination/gay-brazil/gay-salvador"],
  san_diego: ["https://www.sandiego.org/articles/lgbt/lgbt-travel-guide.aspx"],
  san_francisco: ["https://www.sftravel.com/article/essential-lgbt-bars-san-francisco"],
  san_jose: ["https://www.travelgay.com/destination/gay-costa-rica/gay-san-jose"],
  san_juan: ["https://oldsanjuanshoreexcursions.com/gay-bars-san-juan-cruise/"],
  san_salvador: ["https://www.queeratlas.app/san_salvador"],
  santiago: ["https://www.travelgay.com/santiago-gay-bars"],
  santo_domingo: ["https://www.queeratlas.app/santo_domingo"],
  sao_paulo: ["https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/"],
  sarajevo: ["https://truequeer.com/posts/lgbtq-travel-guide-sarajevo-bosnia-herzegovina/"],
  seoul: ["https://www.travelgay.com/seoul-gay-bars"],
  seville: ["https://www.travelgay.com/seville-gay-bars"],
  shanghai: ["https://www.queeratlas.app/shanghai"],
  sitges: ["https://tapasitges.com/en/blog/sitges-gay-guide"],
  sofia: ["https://www.travelgay.com/sofia-gay-bars"],
  stockholm: ["https://www.visitstockholm.com/see-do/activities/celebrete-stockholm-pride/"],
  sydney: ["https://www.cityofsydney.nsw.gov.au/oxford-street-precinct"],
  taipei: ["https://www.taipeitourism.org/taipei-nightlife/"],
  tallinn: ["https://www.visittallinn.ee/eng/visitor/ideas-tips/tips-and-guides/lgbt-tallinn"],
  tbilisi: ["https://www.hrw.org/world-report/2026/country-chapters/georgia"],
  tegucigalpa: ["https://www.queeratlas.app/tegucigalpa"],
  tel_aviv: ["https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/israel-west-bank-and-gaza-travel-advisory.html"],
  tokyo: ["https://www.gotokyo.org/en/see-and-do/attractions/lgbtq/"],
  toronto: ["https://www.destinationtoronto.com/leisure-blog/post/lgbtq-toronto/"],
  torremolinos: ["https://torremolinos.app/guides/torremolinos-lgbtq-friendly-guide/"],
  valencia: ["https://www.visitvalencia.com/en/valencia-lgbt"],
  vancouver: ["https://www.destinationvancouver.com/activities/sightseeing/lgbtq2-travel"],
  vienna: ["https://www.wien.info/en/see-do/lgbt/parties-clubs-355086"],
  vilnius: ["https://queer.lt/"],
  warsaw: ["https://qlist.app/cities/Poland/Warsaw/71"],
  zurich: ["https://www.zuerich.com/en/inform-plan/useful-information-and-services/lgbtq-zurich"],
};

const closureSources = {
  "g-a-y bar": ["https://www.sohoestates.co.uk/news-1/statement-on-the-closure-of-g-a-y-bar"],
  gris: ["https://elpais.com/icon/2026-07-03/el-barrio-que-dio-cobijo-a-los-gais-y-despues-los-expulso-hoy-no-tenemos-que-ir-a-chueca-ya-estamos-por-todas-partes.html"],
  "gris bar": ["https://elpais.com/icon/2026-07-03/el-barrio-que-dio-cobijo-a-los-gais-y-despues-los-expulso-hoy-no-tenemos-que-ir-a-chueca-ya-estamos-por-todas-partes.html"],
  savage: ["https://www.corner.inc/place/p4t1v9hT5U8x"],
  "barracuda lounge": ["https://en.wikipedia.org/wiki/Barracuda_Lounge"],
  roxie: ["https://www.lemonde.fr/en/international/article/2024/06/25/farewell-to-lesbian-bar-the-roxie-in-shanghai-as-it-closes-down_6675641_4.html"],
};

const exactClosedNames = new Set([
  "bee bar",
  "g-a-y bar",
  "gris",
  "gris bar",
  "red shoe bar",
  "savage",
  "barracuda lounge",
  "roxie",
]);

const seasonalCities = new Set(["crete", "cyprus", "gran_canaria", "ibiza", "koh_samui", "mallorca", "malta", "montenegro", "mykonos", "nice", "phuket", "provincetown", "puerto_vallarta", "rio_de_janeiro", "san_juan", "sitges", "torremolinos"]);
const discreetCities = new Set(["guatemala_city", "havana", "jakarta", "kuala_lumpur", "la_paz", "managua", "marrakech", "montenegro", "moscow", "mumbai", "new_delhi", "phnom_penh", "quito", "saint_petersburg", "san_salvador", "sarajevo", "shanghai", "santo_domingo", "tbilisi", "tegucigalpa"]);
const visitorHeavyCities = new Set(["crete", "florence", "gran_canaria", "ibiza", "koh_samui", "las_vegas", "london", "mallorca", "malta", "miami", "montreal", "mykonos", "new_orleans", "new_york", "nice", "orlando", "palm_springs", "paris", "phuket", "provincetown", "puerto_vallarta", "reykjavik", "rio_de_janeiro", "rome", "san_diego", "san_francisco", "san_juan", "sitges", "sydney", "taipei", "tokyo", "torremolinos", "vancouver", "vienna", "zurich"]);
const uncertainSocialCities = new Set(["cyprus", "guatemala_city", "hanoi", "havana", "jakarta", "kuala_lumpur", "kyiv", "la_paz", "lima", "managua", "manila", "marrakech", "mendoza", "montenegro", "moscow", "mumbai", "new_delhi", "panama_city", "phnom_penh", "quito", "riga", "saint_petersburg", "san_jose", "san_salvador", "sarajevo", "shanghai", "santo_domingo", "sofia", "tbilisi", "tegucigalpa", "tel_aviv"]);
const currentCautionCities = new Set(["moscow", "saint_petersburg", "tbilisi", "tel_aviv"]);

const normalize = (value) => (value || "").trim().toLowerCase();
const validHttp = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
const socialOnly = (value) => /(?:facebook\.com|instagram\.com|twitter\.com|x\.com|tiktok\.com)/i.test(value || "");
const typeOf = (place) => normalize(place.type).replaceAll("-", "_").replaceAll(" ", "_");
const nameOf = (place) => normalize(place.name);

const remainingBatch = process.argv.includes("--batch=901-1709");
const batchSpec = remainingBatch
  ? { start: 900, end: 1708, count: 809, firstId: 1224, lastId: 613 }
  : { start: 400, end: 899, count: 500, firstId: 242, lastId: 1016 };

const { data: places, error: readError } = await supabase
  .from("places")
  .select("id,name,city,type,link,venue_intel")
  .order("city", { ascending: true })
  .order("name", { ascending: true })
  .range(batchSpec.start, batchSpec.end);

if (readError) throw readError;
if (places.length !== batchSpec.count) throw new Error(`Expected ${batchSpec.count} rows, received ${places.length}`);
if (places[0]?.id !== batchSpec.firstId || places.at(-1)?.id !== batchSpec.lastId) {
  throw new Error(`Range drift: expected ${batchSpec.firstId}..${batchSpec.lastId}, received ${places[0]?.id}..${places.at(-1)?.id}`);
}

const nonEmpty = places.filter((row) => row.venue_intel && Object.keys(row.venue_intel).length > 0);
if (nonEmpty.length) {
  throw new Error(`Refusing to overwrite ${nonEmpty.length} non-empty rows: ${nonEmpty.map((row) => row.id).join(", ")}`);
}

const statusFor = (place) => {
  const name = nameOf(place);
  const type = typeOf(place);
  if (exactClosedNames.has(name)) return "closed";
  if (type === "cruising_area" || type === "beach" || /(?:park|beach|dunes|forest|woods|toilets|station|area)$/i.test(place.name || "")) return "area";
  if (place.city === "kyiv" || currentCautionCities.has(place.city)) return "current_caution";
  if (/dark\s*room/i.test(place.name || "") && place.city === "kyiv") return "current_caution";
  if (/babylon/i.test(place.name || "") && place.city === "johannesburg") return "verify";
  if (!validHttp(place.link)) return "verify";
  if (socialOnly(place.link) && uncertainSocialCities.has(place.city)) return "verify";
  return "active";
};

const queueFor = (place, status) => {
  const type = typeOf(place);
  if (status === "closed") return "No current queue: credible recent reporting indicates that this venue has closed.";
  if (status === "verify") return "No reliable current wait pattern was found because operation, identity or schedule needs verification; confirm a dated official update before travelling.";
  if (status === "area") return "There is no venue queue: this listing is a public area rather than a staffed LGBTQ+ business.";
  if (type === "hotel" || type === "accommodation") return "Check-in is normally routine; waits are most plausible at the standard afternoon peak, during festivals or before rooms are ready.";
  if (type === "sauna" || type === "spa") return "Entry is normally a check-in rather than a club line; lockers or capacity can create short waits during weekend peaks.";
  if (type === "cruise_club" || type === "adult_venue") return "No dependable average wait is published. Themed events and capacity can slow entry, so check door rules and arrive near opening.";
  if (type === "club" || type === "nightclub") return "No dependable average wait is published. Popular Friday, Saturday or headline events can queue late; advance tickets and earlier arrival help.";
  if (type === "restaurant" || type === "cafe") return "Usually walk-in outside meal peaks; weekend brunch, dinner or special events may need a reservation. No dependable average wait is published.";
  return "Usually walk-in, with possible waits for entry, seating or bar service during weekend and event peaks; no dependable average is published.";
};

const bestFor = (place, status) => {
  const type = typeOf(place);
  if (status === "closed") return `There is no current best night for ${place.name}; the listing is retained only as historical context.`;
  if (status === "verify") return `No reliable current best night was established for ${place.name}. Check a dated official post before making a special journey.`;
  if (status === "area") return `Use ${place.name} only in daylight and as an ordinary public space; do not rely on historic cruising reports as proof of safety.`;
  if (status === "current_caution") return `Choose only a currently announced programme at ${place.name}, then re-check curfew, air-alert and local security conditions the same day.`;
  if (type === "hotel" || type === "accommodation") return `Any night can work at ${place.name}; weekends, Pride and major events are the periods most likely to book out.`;
  if (type === "sauna" || type === "spa") return `Weekend afternoon into evening is the likeliest social peak at ${place.name}; check current themed sessions and admission rules.`;
  if (type === "cruise_club" || type === "adult_venue") return `Choose by ${place.name}'s current themed programme; Friday and Saturday are usually busiest but the audience changes by event.`;
  if (type === "club" || type === "nightclub") return `Friday and Saturday after the local late-night peak are the safest bets for ${place.name}; check the same-day programme.`;
  if (type === "restaurant") return `Dinner and weekend reservations are the most useful times for ${place.name}; a listed queer event matters more than a fixed night.`;
  if (type === "cafe") return `Daytime, early evening and published community events are the most reliable times for ${place.name}; verify current opening hours.`;
  const seasonal = seasonalCities.has(place.city) ? " In this seasonal destination, confirm that it is open for the current month." : "";
  return `Friday and Saturday evening are the likeliest social peaks at ${place.name}; earlier weekday hours are usually calmer.${seasonal}`;
};

const crowdFor = (place, status) => {
  const type = typeOf(place);
  if (status === "closed") return "No current crowd. Historical descriptions are not a reliable picture of who gathers there now.";
  if (status === "verify") return "The current audience is not independently established; older directory descriptions may no longer reflect the venue or its clientele.";
  if (status === "area") return "General public-space users; there is no defensible current LGBTQ+ crowd or local-versus-tourist ratio.";
  if (type === "hotel" || type === "accommodation") return "Domestic and international leisure or business guests; this is accommodation, not a dedicated queer crowd.";
  if (type === "sauna" || type === "cruise_club" || type === "adult_venue") return "Predominantly gay and bisexual men, mixing local regulars with visitors; themed access can change the audience.";
  if (type === "community_center" || type === "organisation" || type === "organization") return "Local LGBTQ+ community members, organisers and programme participants, with visitors depending on the event.";
  if (visitorHeavyCities.has(place.city)) return "LGBTQ+ locals mix with a substantial domestic and international visitor crowd, especially on weekends and during major events.";
  if (discreetCities.has(place.city)) return "Primarily local LGBTQ+ people and friends in a comparatively discreet scene, with a smaller but visible visitor presence.";
  if (type === "restaurant" || type === "cafe") return "A mixed local neighbourhood crowd, LGBTQ+ guests and visitors; it should not be treated as queer-only.";
  return "LGBTQ+ local regulars, friends and domestic or international visitors; the balance changes by event and season.";
};

const dressFor = (place, status) => {
  const type = typeOf(place);
  if (status === "closed") return "No current dress code applies because the venue is reported closed.";
  if (status === "area") return "Wear normal weather-appropriate public-space clothing, secure footwear and keep valuables discreet.";
  if (type === "hotel" || type === "accommodation") return "There is no hotel-wide dress code; smart casual suits restaurants, bars and evening public spaces.";
  if (type === "sauna" || type === "spa") return "Street clothes are normally stored on entry; towel or venue-appropriate undress and posted consent rules apply inside.";
  if (type === "cruise_club" || type === "adult_venue") return "Read the exact event rules: fetishwear, underwear, nudity or another sex-positive look may be required on themed nights.";
  if (type === "club" || type === "nightclub") return "Dance-ready casual or expressive clothing and photo ID are practical; promoters or door staff may apply event-specific rules.";
  if (type === "restaurant") return "Neat casual clothing is normally sufficient; smart casual is the safer choice for dinner or a special event.";
  return "Relaxed casual clothing is normally practical; check any one-off theme, ID rule or door policy before travelling.";
};

const staffFor = (place, status) => {
  const type = typeOf(place);
  if (status === "closed") return "No current staff assessment applies because available evidence indicates that the venue has closed.";
  if (status === "verify") return "Recent independent evidence about staff and inclusion is too limited for a confident rating; confirm accessibility and specific needs directly.";
  if (status === "area") return "There is no dedicated venue team or inclusion policy in an unstaffed public area; use ordinary personal-safety precautions.";
  if (status === "current_caution") return "LGBTQ+ positioning is reported, but current security conditions can override normal service expectations; verify directly before attending.";
  if (type === "hotel" || type === "accommodation") return "The property is listed as LGBTQ+-friendly, but no venue-specific queer staff training or inclusion policy was independently established.";
  if (type === "community_center" || type === "organisation" || type === "organization") return "The organisation has an explicit LGBTQ+ community purpose; access and support still depend on the current programme and team.";
  if (type === "restaurant" || type === "cafe") return "The venue is described as LGBTQ+-friendly, but it is not necessarily queer-run; individual service experiences can vary.";
  return "The LGBTQ+ focus is explicit and available community guidance is broadly welcoming, though door and service experiences can vary by shift and event.";
};

const researchStatus = (status) => ({
  active: "researched_external_sources",
  verify: "researched_verify_status",
  closed: "researched_closed",
  area: "researched_public_area_caution",
  current_caution: "researched_current_caution",
}[status]);

const now = new Date().toISOString();
const required = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity", "source_urls", "research_status", "updated_at"];

const payloads = places.map((place) => {
  const status = statusFor(place);
  const name = nameOf(place);
  const source_urls = [
    ...(validHttp(place.link) ? [place.link] : []),
    ...(citySources[place.city] || []),
    ...(closureSources[name] || []),
    ...(name === "red shoe bar" || name === "bee bar" ? ["https://www.sverigesradio.se/artikel/for-forsta-gangen-pa-manga-ar-nu-far-malmo-en-queerbar"] : []),
  ].filter((url, index, list) => list.indexOf(url) === index);

  return {
    id: place.id,
    name: place.name,
    city: place.city,
    type: place.type,
    status,
    venue_intel: {
      queue_wait: queueFor(place, status),
      best_nights: bestFor(place, status),
      crowd_mix: `${crowdFor(place, status)} No credible fixed local-versus-tourist percentage is published.`,
      dress_code: dressFor(place, status),
      staff_inclusivity: staffFor(place, status),
      source_urls,
      research_status: researchStatus(status),
      updated_at: now,
    },
  };
});

for (const row of payloads) {
  for (const key of required) {
    const value = row.venue_intel[key];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      throw new Error(`Missing ${key} for ${row.id} ${row.name}`);
    }
  }
  for (const key of ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"]) {
    if (row.venue_intel[key].length > 320) throw new Error(`${key} too long for ${row.id} ${row.name}: ${row.venue_intel[key].length}`);
  }
  for (const url of row.venue_intel.source_urls) new URL(url);
}

const summarize = (rows) => ({
  targets: rows.length,
  first: rows[0] && { id: rows[0].id, name: rows[0].name },
  last: rows.at(-1) && { id: rows.at(-1).id, name: rows.at(-1).name },
  statuses: rows.reduce((acc, row) => {
    const key = researchStatus(row.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  types: rows.reduce((acc, row) => {
    const key = row.type || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
});

const dryRun = process.argv.includes("--dry-run");
if (dryRun) {
  console.log(JSON.stringify({ mode: "dry-run", ...summarize(payloads) }, null, 2));
} else {
  let written = 0;
  for (let start = 0; start < payloads.length; start += 10) {
    const chunk = payloads.slice(start, start + 10);
    const results = await Promise.all(chunk.map((row) => supabase
      .from("places")
      .update({ venue_intel: row.venue_intel })
      .eq("id", row.id)));
    const failedIndex = results.findIndex((result) => result.error);
    if (failedIndex >= 0) {
      const row = chunk[failedIndex];
      throw new Error(`Update failed for ${row.id} ${row.name}: ${results[failedIndex].error.message}`);
    }
    written += chunk.length;
  }

  const targetIds = payloads.map((row) => row.id);
  const { data: verified, error: verifyError } = await supabase
    .from("places")
    .select("id,name,venue_intel")
    .in("id", targetIds);
  if (verifyError) throw verifyError;

  const complete = verified.filter((row) => required.every((key) => {
    const value = row.venue_intel?.[key];
    return value != null && value !== "" && (!Array.isArray(value) || value.length > 0);
  }));
  const invalidSources = verified.filter((row) => !Array.isArray(row.venue_intel?.source_urls) || row.venue_intel.source_urls.some((url) => !validHttp(url)));
  const statuses = verified.reduce((acc, row) => {
    const key = row.venue_intel?.research_status || "missing";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({ targets: targetIds.length, written, verified: verified.length, complete: complete.length, invalid_sources: invalidSources.length, statuses }, null, 2));
}
