import { cityNameFromConfig } from "@/features/city/checkinFeature";

export const LIVE_VIBE_COOLDOWN_MS = 30 * 1000;

const CITY_HERO_COPY = {
  berlin: 'Hook: Raw and magnetic, Berlin rewards curiosity after dark. Queer status: Deeply alive and historically foundational, with strong visibility across scenes. Crowd: Club kids, leather, artists, trans community, and global nightlife pilgrims. "Not the loudest scene in Europe, but one of the deepest."',
  madrid: 'Hook: Warm, social, and addictive from terrace hour to sunrise. Queer status: Very visible and highly lived-in, especially in Chueca and nearby lanes. Crowd: Drag lovers, late-night flirts, stylish locals, and first-timers who quickly become regulars. "Come for one night, stay for the rhythm."',
  copenhagen: 'Hook: Clean design city with low-noise confidence. Queer status: Safe and progressive, with a smaller but reliable community pulse. Crowd: Creative locals, bike-city romantics, and quality-over-chaos travelers. "Soft volume, strong signal."',
  paris: 'Hook: Cinematic, sensual, and precise in its nightlife choices. Queer status: Le Marais remains highly active, with strong visibility and cultural depth. Crowd: Fashion minds, cocktail crowd, art-world drifters, and intentional daters. "Less noise, more seduction."',
  amsterdam: 'Hook: Canal-soft by day, playful and social by night. Queer status: Historically progressive and consistently welcoming across central zones. Crowd: Mixed global travelers, locals, party crews, and easy-entry social groups. "Freedom without friction."',
  london: 'Hook: Massive and layered, with a lane for every mood. Queer status: Highly active and diverse, from Soho heritage to East London edge. Crowd: Drag fans, kink scenes, queer creatives, finance gays, and everyone in between. "A thousand scenes in one city."',
  barcelona: 'Hook: Sun-soaked and flirt-first, built for movement. Queer status: Strong visibility around Eixample and beach-party circuits. Crowd: International summer crowd, locals with style, and party-forward travelers. "Heat, skin, and instant chemistry."',
  lisbon: 'Hook: Hilltop glow and soft-start nights that escalate late. Queer status: Increasingly visible and traveler-friendly with strong city energy. Crowd: Creative nomads, romantic weekenders, and terrace-to-club roamers. "Slow burn, high reward."',
  torremolinos: 'Hook: Full holiday mode with zero identity apology. Queer status: Very visible, especially near La Nogalera and beachfront routes. Crowd: Resort regulars, pride-week veterans, and beach-to-bar marathoners. "Sun by day, sparkle by night."',
  sitges: 'Hook: Compact queer fantasy by the sea. Queer status: Exceptionally visible in central nightlife and beach zones. Crowd: International regulars, couples, event-week crowds, and social bar-hoppers. "Tiny town, giant energy."',
  gran_canaria: 'Hook: Resort circuit built for freedom and stamina. Queer status: One of Europe\'s most visible queer holiday ecosystems. Crowd: Pool-party crews, resort loyalists, circuit travelers, and winter-escape regulars. "Where vacation becomes lifestyle."',
  cologne: 'Hook: Friendly, social, and built for community nights. Queer status: Strong and welcoming with major festival credibility. Crowd: Bears, club crews, karaoke lovers, and warm regulars. "Less attitude, more belonging."',
  brighton: 'Hook: Coastal queer capital with easy charm. Queer status: Highly visible and culturally embedded, especially in Kemptown. Crowd: Local creatives, drag crowd, queer couples, and London escapees. "Sea air, safe vibe, real community."',
  prague: 'Hook: Gothic beauty with an increasingly bold queer layer. Queer status: Smaller scene, but active and growing around key venues. Crowd: City-break travelers, nightlife seekers, and curation-first explorers. "Pick the right room and it clicks."',
  vienna: 'Hook: Elegant city breaks with curated nightlife moments. Queer status: Stable and welcoming, with selective but quality scene options. Crowd: Culture lovers, polished locals, and intimate social circles. "Grace first, chaos optional."',
  stockholm: 'Hook: Crisp, modern, and confidence-led. Queer status: Safe and progressive, with a focused event-driven nightlife scene. Crowd: Design-minded locals, music lovers, and weekend travelers. "Minimal drama, maximum ease."',
  manchester: 'Hook: Fast, loud, and emotionally direct. Queer status: Very active around Canal Street with strong legacy and nightlife depth. Crowd: Party groups, drag devotees, football gays, and friendly regulars. "No pretense, just pulse."',
  brussels: 'Hook: Compact European mix with multilingual energy. Queer status: Visible and social, with central scene lanes that stay active. Crowd: EU crowd, locals, art students, and crossover nightlife roamers. "Small map, big mix."',
  athens: 'Hook: Hot, textured, and gloriously imperfect. Queer status: Growing visibility with strong nightlife pull in key areas. Crowd: Local night owls, terrace lovers, queer creatives, and summer visitors. "Messy in the best way."',
  rome: 'Hook: Monumental backdrop, intimate queer flow. Queer status: Visible and active through selected venues and event nights. Crowd: Stylish locals, curious travelers, and late-start social groups. "History outside, desire inside."',
  milano: 'Hook: Sharp silhouettes and curated after-dark decisions. Queer status: Solid and modern, especially around Porta Venezia circuits. Crowd: Fashion crowd, design people, nightlife editors, and polished locals. "Dress good, move smart."',
  oslo: 'Hook: Calm city comfort with a quietly loyal scene. Queer status: Very safe and progressive with reliable venue anchors. Crowd: Community regulars, low-drama travelers, and quality-night seekers. "Small scene, clear heart."',
  dublin: 'Hook: Big social warmth packed into a compact city. Queer status: Welcoming and visible with strong drag and pub culture roots. Crowd: Friendly locals, students, weekenders, and singalong energy. "It starts as a pint, ends as a memory."',
  mykonos: 'Hook: Luxury sun, sunset drama, and nonstop temptation. Queer status: Extremely visible in high season with iconic gay travel pull. Crowd: Global circuit crowd, beach-club regulars, glam couples, and high-energy crews. "Come rested, leave legendary."',
  warsaw: 'Hook: Urban intensity with a rising queer confidence. Queer status: Growing and increasingly visible, especially in progressive circles. Crowd: Young locals, expats, party crews, and culture-forward travelers. "New energy, real momentum."',
  malta: 'Hook: Mediterranean escape with compact social routes. Queer status: Friendly and increasingly visible, with seasonal nightlife spikes. Crowd: Beach travelers, couples, weekend groups, and event-led visitors. "Small island, big release."',
  toronto: 'Hook: Big-city comfort with strong community backbone. Queer status: Highly visible and institutionally strong in the Village and beyond. Crowd: Drag fans, leather community, queer professionals, and global migrants. "Inclusive by design, wild by choice."',
  montreal: 'Hook: Bilingual nightlife with fearless performance culture. Queer status: Very alive in the Village with deep queer infrastructure. Crowd: Drag lovers, nightlife pros, terrace socialites, and art-school edge. "Camp, confidence, and late hours."',
  vancouver: 'Hook: Mountain-air calm meets Davie nightlife glow. Queer status: Welcoming and visible with a stable local community scene. Crowd: Outdoor queers, cocktail crowd, bears, and sunset terrace roamers. "Soft city, strong signal."',
  bangkok: 'Hook: Neon heat and nonstop movement. Queer status: Highly active with major nightlife density and broad LGBTQ visibility. Crowd: International party travelers, local regulars, drag fans, and late-night explorers. "You do not chase the night, you ride it."',
  phuket: 'Hook: Tropical party routes with beach-first freedom. Queer status: Visible and active around core nightlife strips and resorts. Crowd: Holiday groups, circuit visitors, couples, and bar-hopping travelers. "Saltwater by day, strobe light by night."',
  sydney: 'Hook: Harbour glamour with polished queer nightlife. Queer status: Strong and visible, especially around Oxford Street and seasonal events. Crowd: Locals with pace, beach-fit social circles, and global visitors. "Sunrise city, after-dark heart."',
  san_francisco: 'Hook: Legendary queer ground with modern tech-city edge. Queer status: Deeply rooted, highly visible, and culturally foundational. Crowd: Leather elders, startup gays, activists, artists, and neighborhood regulars. "History still dances here."',
  new_york: 'Hook: Maximum options, maximum identity range. Queer status: Intensely active across boroughs with global cultural influence. Crowd: Every subculture, every style, every schedule. "If it exists, it exists here."',
  buenos_aires: 'Hook: Seductive nights, deep emotions, and dance-floor tension. Queer status: Strong and socially alive with visible nightlife flow. Crowd: Local party culture, travelers, drag fans, and late-night romantics. "Drama, desire, and no early bedtime."',
  sao_paulo: 'Hook: Mega-city scale with serious queer horsepower. Queer status: Very active and globally relevant for parties and pride culture. Crowd: Circuit crowds, underground selectors, fashion energy, and local legends. "Big city, bigger appetite."',
  rio_de_janeiro: 'Hook: Beach confidence and nightlife sparkle under tropical heat. Queer status: Visible and lively, especially in key beach and party zones. Crowd: Beach crowd, party travelers, locals, and carnival-influenced nightlife lovers. "Body positive, sun powered."',
  mexico_city: 'Hook: Huge urban energy with layered queer neighborhoods. Queer status: Very alive and increasingly international across nightlife circuits. Crowd: Creative locals, expats, club kids, and culture-first travelers. "Chaos, culture, and connection."',
  puerto_vallarta: 'Hook: Seafront queer holiday machine with easy flow. Queer status: Exceptionally visible around Zona Romantica and beach strips. Crowd: Resort regulars, retirement glam, party groups, and weekend escapes. "Vacation mode, fully unlocked."',
  bogota: 'Hook: High-altitude city nights with sharp social energy. Queer status: Growing and active, with major nightlife anchors and community life. Crowd: Young locals, underground music lovers, and adventurous travelers. "Cool air, hot rooms."',
  medellin: 'Hook: Warm weather and nightlife that builds fast. Queer status: Increasingly visible with strong venue clusters and local momentum. Crowd: Stylish locals, digital nomads, party travelers, and terrace social circles. "Easy smile, late finish."',
  taipei: 'Hook: Tech-modern city with one of Asia\'s strongest queer signals. Queer status: Highly progressive and visible, especially around Ximen and pride culture. Crowd: Local regulars, queer youth, travelers, and nightlife explorers. "Safe, bright, and genuinely alive."',
  zurich: 'Hook: Precision city with surprisingly hot nightlife pockets. Queer status: Stable and welcoming with quality venues and clear social flow. Crowd: Finance polish, creative circles, and curated weekenders. "Clean lines, dirty little nights."',
  geneva: 'Hook: International calm with selective queer nightlife. Queer status: Smaller scene but reliable and socially welcoming. Crowd: Diplomat crowd, expats, local regulars, and elegant weekender energy. "Quiet city, quality signal."',
  tel_aviv: 'Hook: Beach city intensity with fearless queer expression. Queer status: Very visible and community-strong in nightlife and daytime life. Crowd: Locals, global travelers, party crews, and culture-mix social circles. "Heat, freedom, and zero half-measures."',
  los_angeles: 'Hook: Spread-out city, high-impact queer islands. Queer status: Strong and diverse across WeHo, Eastside, and event circuits. Crowd: Industry people, performers, fitness crowd, and after-hours regulars. "Choose your lane, own your night."',
  miami: 'Hook: Tropical glamour and nightlife built for excess. Queer status: Highly visible in key districts with strong event culture. Crowd: Beach bodies, nightlife tourists, local creators, and festival travelers. "Humidity, high heels, and high energy."',
  tokyo: 'Hook: Neon precision with deep nightlife density. Queer status: Strong and concentrated in key queer streets and bars. Crowd: Local regulars, international travelers, karaoke lovers, and style-forward night owls. "Tiny bars, massive personality."',
  palm_springs: 'Hook: Desert luxury and pool-party ease. Queer status: Extremely welcoming and deeply integrated into local culture. Crowd: Resort regulars, weekend groups, retirees, and festival crowds. "Sun, shade, and no judgment."',
  provincetown: 'Hook: Seaside queer pilgrimage with full summer magic. Queer status: Exceptionally visible and community-centered all season. Crowd: Bears, artists, drag lovers, couples, and returning regulars. "A small town where everyone can be loud."',
  cape_town: 'Hook: Epic landscapes with a growing queer city pulse. Queer status: Visible in key nightlife corridors and travel-friendly zones. Crowd: Local creatives, global travelers, beach lovers, and nightlife crews. "One city, five different moods."',
  seoul: 'Hook: High-speed city energy with rising queer nightlife. Queer status: Scene is concentrated but alive, with strong community pockets. Crowd: Local regulars, expats, students, and after-hours explorers. "Subtle by day, electric by night."',
  ibiza: 'Hook: Island hedonism where sunset becomes strategy. Queer status: Very visible in season with iconic party and beach circuits. Crowd: Global party travelers, DJs, style crowd, and holiday groups. "No casual nights here."',
  santiago: 'Hook: Urban Andes backdrop with increasingly bold queer flow. Queer status: Growing visibility and active nightlife in key neighborhoods. Crowd: Local creatives, social groups, and culture-forward travelers. "Rising city, rising signal."',
  lima: 'Hook: Coastal capital with a late-night social arc. Queer status: Active and growing, especially across curated nightlife lanes. Crowd: Local party circles, travelers, drag fans, and weekend explorers. "Understated start, strong finish."',
  quito: 'Hook: High-altitude city heat with late-night queer momentum. Queer status: Active and resilient, with visible nightlife lanes and a growing community pulse. Crowd: Local regulars, drag-night lovers, party travelers, and social bar hoppers. "Altitude by day, release by night."',
  bucharest: 'Hook: Grit, glamour, and late-night queer voltage in one city loop. Queer status: Compact but alive, with resilient community spaces and rising visibility. Crowd: Local regulars, alt-club lovers, drag-night travelers, and weekend social crews. "Smaller scene, sharper chemistry."',
  sofia: 'Hook: Balkan city edge with emerging queer confidence. Queer status: Smaller but resilient and increasingly visible community scene. Crowd: Local regulars, students, creatives, and intentional travelers. "Not huge, but absolutely real."',
  montevideo: 'Hook: Relaxed coastal capital with loyal nightlife pockets. Queer status: Visible and welcoming, especially around core social venues. Crowd: Local regulars, South American travelers, and low-drama bar hoppers. "Calm pace, strong connection."',
  hamburg: 'Hook: Port-city grit with polished nightlife options. Queer status: Active and welcoming, with strong bar and club routes. Crowd: Music lovers, locals, leather crowd, and weekend travelers. "Salt, steel, and after-dark glow."',
  munich: 'Hook: Classic city form with modern queer confidence. Queer status: Stable and visible, especially around event-led nightlife. Crowd: Locals, professionals, travelers, and social bar regulars. "Tradition outside, freedom inside."',
  frankfurt: 'Hook: Skyline speed and compact nightlife precision. Queer status: Solid and active with reliable scene anchors. Crowd: Finance crowd, locals, expats, and weekend city-break visitors. "Fast city, focused scene."',
  chicago: 'Hook: Big-room nightlife and neighborhood soul. Queer status: Strongly visible with deep history and active community lanes. Crowd: House music faithful, drag fans, leather scene, and social locals. "Windy city, heavy pull."',
  las_vegas: 'Hook: Spectacle-first nights and no-off-switch weekends. Queer status: Visible and event-heavy, especially around parties and festivals. Crowd: Weekend blowout crews, performers, travelers, and nightlife loyalists. "Go big or go home tired."',
  san_diego: 'Hook: Coastal chill with nightlife that still hits hard. Queer status: Welcoming and active, especially around Hillcrest circuits. Crowd: Beach crowd, military locals, students, and social weekenders. "Easy day, spicy night."',
  philadelphia: 'Hook: Historic city grit with loyal queer neighborhoods. Queer status: Strong and community-driven, especially in the Gayborhood. Crowd: Locals, artists, students, and nightlife regulars. "Real people, real scene."',
  new_orleans: 'Hook: Ritual nightlife city with queer flair built in. Queer status: Visible and culturally embedded in major social zones. Crowd: Drag lovers, party tourists, locals, and music-night wanderers. "Jazz, joy, and beautiful chaos."',
  orlando: 'Hook: Theme-park city by day, queer takeover by night. Queer status: Highly active during major event weekends and local circuit nights. Crowd: Festival travelers, local crews, and pool-party regulars. "Magic, but make it queer."',
  melbourne: 'Hook: Artsy city depth with smart nightlife curation. Queer status: Strong and progressive, with visible community and events. Crowd: Creatives, students, culture lovers, and late-bar roamers. "Coffee first, chaos later."',
  budapest: 'Hook: Grand city architecture with rising queer momentum. Queer status: Smaller but active scene with resilient community energy. Crowd: Travelers, local regulars, and event-night seekers. "Beautiful city, brave nights."',
  valencia: 'Hook: Mediterranean ease and warm nightlife flow. Queer status: Growing and increasingly visible with strong seasonal energy. Crowd: Beach lovers, local social circles, and weekend travelers. "Sunset city, social nights."',
  seville: 'Hook: Andalusian heat with intimate queer nightlife lanes. Queer status: Friendly and active in selected core zones. Crowd: Locals, visitors, dance lovers, and terrace-first groups. "Slow start, blazing finish."',
};

export function buildCityHeroText({ config, citySlug }) {
  const key = String(citySlug || "").toLowerCase();
  const direct = CITY_HERO_COPY[key];
  if (direct) return direct;

  const cityName = cityNameFromConfig(config, citySlug);
  return `Hook: ${cityName} has strong queer momentum. Queer status: Visible and evolving with active community routes. Crowd: Mixed locals and travelers shaping the night together. "${cityName} rewards intention."`;
}

export function parseCityHeroText(copy = "") {
  const text = String(copy || "");
  const extract = (label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=\\s*(Hook|Queer status|Crowd):|\\s*\"[^\"]+\"\\s*$|$)`, "i"));
    return match?.[1]?.trim() || "";
  };

  const taglineMatch = text.match(/"([^"]+)"\s*$/);

  return {
    hook: extract("Hook"),
    status: extract("Queer status"),
    crowd: extract("Crowd"),
    tagline: taglineMatch?.[1]?.trim() || "",
  };
}

export function polishGuideText(text, { sectionTitle = "", cityName = "this city", vibe = "" } = {}) {
  const clean = String(text || "").trim();
  if (!clean) return "";
  if (clean.length >= 340) return clean;

  const key = String(sectionTitle).toLowerCase();
  const additions = {
    about: `${cityName} rewards travelers who mix curiosity with intention: start with one iconic lane, then follow community signal into the rooms locals actually return to.`,
    districts: `The best version of ${cityName} is usually route-based, not random: pick one anchor zone, then move out in layers as the energy builds.`,
    safety: `Treat pacing as part of safety, especially on big nights: charged phone, clear route, and one trusted fallback always make the night better.`,
    nightlife: `Use a two-phase flow for stronger nights: social warm-up first, then commit to one room with real pull instead of chasing every option.`,
    cost: `Spend for position and vibe, save on everything else. In ${cityName}, location and timing usually matter more than flashy upgrades.`,
  };

  const generic = `${cityName} has ${vibe || "strong"} queer momentum, and the best experiences usually come from layered choices instead of rushed checklists.`;
  const addition = additions[key] || generic;
  return `${clean} ${addition}`;
}

export function polishVenueDescription(place, cityName = "this city", typeLabels = {}) {
  const existing = String(place?.description || "").trim();
  if (existing.length >= 240) return existing;

  const typeLabel = typeLabels[place?.type] || "venue";
  const vibeText = place?.vibe ? `${place.vibe}` : `distinct ${typeLabel.toLowerCase()} energy`;

  if (!existing) {
    return `${place?.name || "This venue"} is a community-facing ${typeLabel.toLowerCase()} in ${cityName} with ${vibeText}. It works best as a strong stop in your night route, especially when you want social momentum with local signal instead of generic tourist flow.`;
  }

  return `${existing} In ${cityName}, this spot stands out for ${vibeText} and works best when you use it as a deliberate part of your route, not just a random pass-through.`;
}

export function polishEventDescription(event, cityName = "this city") {
  const existing = String(event?.description || "").trim();
  if (existing.length >= 220) return existing;

  if (!existing) {
    return `${event?.name || "This event"} is part of ${cityName}'s live queer pulse and is best treated as a momentum anchor for your night: start social, arrive with intention, and let the crowd chemistry do the rest.`;
  }

  return `${existing} Expect a mixed crowd, strong community energy, and the kind of night that lands best when you arrive early enough to catch the room build.`;
}
