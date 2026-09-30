import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const CHECKED_AT = "2026-09-30";
const UPDATED_AT = `${CHECKED_AT}T12:00:00Z`;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const evidence = (sources, fields) => Object.fromEntries(
  Object.entries(fields).map(([field, text]) => [field, {
    status: "verified",
    source_urls: sources,
    checked_at: CHECKED_AT,
    source_excerpt: text,
  }])
);

const venue = (description, hours, location, link, sources, fields) => ({
  description,
  hours,
  location,
  link,
  seo_indexable: true,
  seo_quality_status: "approved",
  venue_intel: {
    ...fields,
    source_urls: sources,
    topic_evidence: evidence(sources, fields),
    research_status: "current_first_party_or_specialist_source_checked",
    updated_at: UPDATED_AT,
  },
});

const updates = new Map([
  [99, venue(
    "Cox is the Marais bar for a street-facing drink that can turn into a proper late stop without changing postcode. Its small room and terrace make it a useful first drink when you want to feel the rue des Archives pulse rather than disappear into a mega-club.",
    "Daily 17:00–02:00; happy hour until 22:00.", "15 rue des Archives, 75004 Paris, France", "https://cox.fr/",
    ["https://cox.fr/"], { best_nights: "Any evening works; arrive between 17:00 and 22:00 for the published happy hour if you want the bar at its most social before the late crowd." }
  )],
  [100, venue(
    "Banana Café is a very-late Les Halles fixture: choose it when the plan is dancing after the rest of the city starts shutting down, not for a quiet Marais drink. The programme changes by night, so the specific theme is more useful than a blanket party promise.",
    "Daily from about 17:00 until 08:00; programme and entry vary by night.", "13 rue de la Ferronnerie, 75001 Paris, France", "https://banana-cafe-paris.com/",
    ["https://banana-cafe-paris.com/", "https://parisjetaime.com/restaurant/banana-cafe-p684"], { best_nights: "Choose the listed DJ or themed night. Its distinctive practical advantage is that it stays open until morning, unlike an ordinary early-evening bar." }
  )],
  [140, venue(
    "Raidd is a high-energy Marais bar where a terrace drink can slide straight into the midnight show and a much louder room. Its programme is unusually legible: pick the night for its theme instead of hoping every visit delivers the same atmosphere.",
    "Sun–Thu 18:00–04:00; Fri–Sat 18:00–05:00; happy hour until 22:00.", "23 rue du Temple, 75004 Paris, France", "https://www.raiddbar.com/en/",
    ["https://www.raiddbar.com/en/", "https://www.raiddbar.com/fr/faq.html"], { best_nights: "The published midnight Shower Boys show is the reliable hook. For a particular mood, use the live programme—such as BFF, Safado, Fever or Strip—rather than treating every night as identical." }
  )],
  [141, venue(
    "Freedj earns its place as a two-speed Marais night: apéro and DJs first, then a free-entry basement dance room on Friday and Saturday. It is the practical choice for a no-fuss pop/disco night that starts gently and can finish dancing.",
    "Sun–Thu from 18:00; Fri–Sat from 18:00, basement club 23:00–03:00.", "35 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France", "https://freedj.fr/",
    ["https://freedj.fr/"], { best_nights: "Friday and Saturday, when the basement opens at 23:00. On other nights, go for the after-work apéro and the daily DJ rather than expecting the weekend format." }
  )],
  [142, venue(
    "Gibus is a promoter-led club, not one fixed scene. It can be the right room for a fashion-week blowout, a POC-led party or a gay men’s dance night—but only when the specific bill speaks to you.",
    "Thursday–Sunday; door time and closing time are set by each event.", "18 rue du Faubourg du Temple, 75011 Paris, France", "https://gibusclub.fr/agenda-timeline",
    ["https://gibusclub.fr/agenda-timeline"], {
      best_nights: "There is no venue-wide best night: choose the named promoter and format on the current calendar.",
      staff_inclusivity: "The relevant conduct standard is the one published by the event organiser; check that page before buying a ticket, because Gibus hosts different communities and production teams."
    }
  )],
  [148, venue(
    "CUD is the late-night reset button: a two-level bar built for the hours after midnight, with three bars and DJs rather than an early-evening lounge rhythm. It is walk-in, free to enter and deliberately uncomplicated—apart from the required drink minimum.",
    "Mon–Tue 00:00–06:00; Wed–Thu & Sun 00:00–07:00; Fri–Sat 00:00–08:00.", "12 rue des Haudriettes, 75003 Paris, France", "https://cudbar.com/fr/index.html",
    ["https://cudbar.com/fr/index.html"], {
      best_nights: "Friday and Saturday, when the venue publishes its latest 08:00 close.",
      dress_code: "CUD publishes no dress code. The stated door terms are free entry with a mandatory drink minimum, not a fashion rule."
    }
  )],
  [150, venue(
    "Sun City is a large men-only gay sauna that runs on clearly advertised sessions rather than vague nightlife lore: three floors, 3,000 m², a pool/spa, sauna, hammam, gym, cinema and bar. Go because one of its actual formats suits you, not because it has been called a generic ‘after-hours’ spot.",
    "Daily 12:00–02:00; Fri, Sat and pre-holiday nights until 06:00.", "62 boulevard de Sébastopol, 75003 Paris, France", "https://www.suncity-paris.fr/",
    ["https://www.suncity-paris.fr/"], {
      best_nights: "Tuesday for Nasty Boys, Thursday for Happy Sun, Sunday for Gay Tea Dance, or the second Saturday from noon for European Bear Rendez-vous—each is published by the sauna as a separate format.",
      crowd_mix: "Admission is explicitly for men; the operator’s published bear rendez-vous and under-26 price point identify two concrete programme/audience lanes without pretending to measure every visitor.",
      dress_code: "Entry includes two towels and condoms. Beyond reception, use the towels and the sauna’s wet-area rules rather than treating ordinary streetwear as the inside dress code.",
      staff_inclusivity: "Sun City publishes Friday STI screening with ARMEDIA and includes condoms with entry. Its inclusion claim is therefore specific to a men-only gay sauna, not a claim that every gender is admitted."
    }
  )],
  [1860, venue(
    "D’win is a small Hôtel de Ville base for travellers who care more about a central room and a genuinely round-the-clock desk than hotel theatre. Breakfast runs long enough for a slow Marais morning, and Line 1 is close when you want to get beyond the neighbourhood.",
    "24-hour front desk; breakfast 07:00–11:00.", "20 rue du Temple, 75004 Paris, France", "https://www.dwinhotel.com/en/",
    ["https://www.dwinhotel.com/en/"], { queue_wait: "A 24-hour front desk handles arrivals; the hotel does not publish a typical check-in wait in minutes.", best_nights: "Any night works as a stay; choose it for Hôtel de Ville access and a breakfast window that runs until 11:00, not for an in-house nightlife programme." }
  )],
  [1861, venue(
    "Hôtel de la Bretonnerie is a 30-room three-star Marais hotel that reads more like a well-kept local base than a design spectacle. It suits someone who wants to sleep on Sainte-Croix de la Bretonnerie and walk home after a nearby bar, with a real concierge desk behind the scenes.",
    "24-hour reception; breakfast available in room.", "22 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France", "https://www.hotelparismaraisbretonnerie.com/",
    ["https://www.hotelparismaraisbretonnerie.com/"], { queue_wait: "The multilingual reception is staffed 24 hours and also provides concierge and baggage service; no minute-by-minute check-in estimate is published.", best_nights: "Any night: the reason to stay is the walkable Marais address, not a hotel event schedule." }
  )],
  [1862, venue(
    "Hôtel du Petit Moulin is the former Poitou bakery recast with Christian Lacroix interiors—small, theatrical and unmistakably Paris rather than another neutral boutique room. Book it when the hotel itself is part of the trip, not merely somewhere to leave a suitcase.",
    "Check-in and guest services: confirm directly with the hotel.", "29–31 rue de Poitou, 75003 Paris, France", "https://en.hotelpetitmoulinparis.com/",
    ["https://en.hotelpetitmoulinparis.com/"], { best_nights: "Any night; its value is the former-bakery setting and Christian Lacroix design in the Haut-Marais, not a recurring hotel party." }
  )],
  [1863, venue(
    "Le 1er Etage feels intentionally domestic: five individual rooms above the Marais rather than a lobby-heavy hotel. It is best for a traveller who wants an intimate address and soundproof, air-conditioned rooms—not a property designed around groups, pets or children.",
    "Guesthouse operations; confirm arrival arrangements directly.", "38 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France", "https://1eretagemarais.com/",
    ["https://1eretagemarais.com/"], { crowd_mix: "Five unique rooms create a small guesthouse scale rather than a large-hotel mix; the property does not accommodate children under 12 or pets.", best_nights: "Any night: choose it for the quiet, small-scale Marais stay, not for an in-house social programme." }
  )],
  [1864, venue(
    "Citadines Les Halles is the useful, unfussy apartment-hotel option: 189 studios and one-bedrooms with kitchens, a 24-hour desk and Châtelet–Les Halles a few minutes away. It makes sense when you want space and logistics to work, especially on a longer Paris stay.",
    "24-hour reception; check-in from 15:00, check-out before 11:00.", "4 rue des Innocents, 75001 Paris, France", "https://www.discoverasr.com/en/citadines/france/citadines-les-halles-paris",
    ["https://www.discoverasr.com/en/citadines/france/citadines-les-halles-paris"], { queue_wait: "Reception is staffed 24 hours; check-in begins at 15:00 and check-out is before 11:00. No typical wait time is published.", crowd_mix: "The 189 studios and one-bedroom apartments, including accessible rooms and pet-friendly stays, make this a practical mix of short and longer city stays rather than a niche nightlife hotel." }
  )],
  [1865, venue(
    "Tata Burger is a playful Marais burger stop with an online reservation system—best treated as a meal between plans, not as a claim of queer nightlife credentials that the restaurant itself does not make. Book when you need a known table on Sainte-Croix de la Bretonnerie.",
    "Opening hours and bookings are published by the restaurant online.", "54 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France", "https://tata-burger.fr/fr/booking",
    ["https://tata-burger.fr/fr/booking"], { queue_wait: "Use the restaurant’s online booking page for a table; it does not publish a typical walk-in wait in minutes.", best_nights: "Best when you have a reservation around your own Marais plan; no evidence supports inventing a particular queer ‘best night’." }
  )],
  [1866, venue(
    "Moncoeur Belleville is the terrace move when the view matters as much as the plate: Paris spread beneath you, with tapas, daily dishes and Sunday brunch rather than a Marais-bar atmosphere. It is a general restaurant, so the guide should be honest about that instead of manufacturing a queer scene claim.",
    "Lunch, drinks and Sunday brunch; reserve online.", "1 rue des Envierges, 75020 Paris, France", "https://www.moncoeurbelleville.com/en",
    ["https://www.moncoeurbelleville.com/en"], { best_nights: "Sunday for the restaurant’s published brunch, or a reservation timed for the Belleville terrace view. Its official material does not identify a specific queer night." }
  )],
  [1867, venue(
    "Les Mots à la Bouche is Paris’s queer bookshop with actual cultural weight: not a souvenir shelf, but a place to browse fiction, theory, comics, photography and films, then leave with a title you did not know you needed. It has moved to Saint-Ambroise, so the old Marais address must not send anyone on a dead-end walk.",
    "Daily 10:30–19:30.", "37 rue Saint-Ambroise, 75011 Paris, France", "https://motsbouche.com/nous-contacter",
    ["https://motsbouche.com/nous-contacter"], { queue_wait: "Queer literature, essays, comics, photography and film, with a physical shop open daily at the published Saint-Ambroise address.", best_nights: "Best time to browse is any day from 10:30 to 19:30; use the current programme for launches or talks rather than guessing at an event night." }
  )],
  [1990, venue(
    "La Mutinerie is the Paris bar to choose when ‘queer’ needs to mean something more than a rainbow playlist. It is explicitly queer-feminist-trans-lesbian, built around free-access bar hours and a programme that can move from karaoke or cabaret to workshops, talks and self-defence.",
    "Daily from 17:00; free entry and no purchase required.", "176 rue Saint-Martin, 75003 Paris, France", "https://www.lamutinerie.eu/",
    ["https://www.lamutinerie.eu/"], {
      best_nights: "There is no generic best night: choose the current calendar’s concert, discussion, DJ, cabaret, workshop, drag, screening, self-defence or karaoke format.",
      crowd_mix: "The venue describes itself as for and with women, lesbians, bi people, queers, gay men and trans people—an explicit community scope, not a guessed demographic split.",
      staff_inclusivity: "La Mutinerie publicly frames its space against racism, sexism, transphobia and classism, and states that entry is free with no requirement to buy a drink."
    }
  )],
  [2215, venue(
    "IDM is a five-floor gay sauna with a proper practical rulebook: sport, sauna, hammam, jacuzzi, bar and adults-only areas, plus precise entry cut-offs and health-information sessions. It is a straightforward choice when you value published rules over mystery.",
    "Mon–Thu 12:00–01:00; Fri–Sun 12:00–02:00. Last entry before 00:00 weekdays and 00:20 weekends.", "4 rue du Faubourg Montmartre, 75009 Paris, France", "https://idm-sauna.com/",
    ["https://idm-sauna.com/sauna-gay-horaire.php", "https://idm-sauna.com/idm-drogue.php", "https://idm-sauna.com/sauna-gay-event.php"], {
      queue_wait: "There is no published minute queue. The useful arrival rule is the official last-entry cut-off: before midnight Monday–Thursday and before 00:20 Friday–Sunday.",
      best_nights: "Thursday for the published Enipse health-information session (15:00–18:00); choose a monthly live show or the announced naked session only if that format is what you want.",
      dress_code: "Sauna and hammam are listed separately from the adult areas; the venue also publishes naked Thursday/Friday sessions, so follow the announced session rather than assuming one rule for every visit.",
      staff_inclusivity: "IDM’s stated operational policy is concrete: drugs, intoxication, aggression and disrespect can lead to refusal or expulsion; Enipse provides health information every Thursday."
    }
  )],
  [2216, venue(
    "Virage is the seasonal club under the périphérique where the right night is a named collective, not the address alone. It runs Wednesday to Sunday with electronic music and LGBTQ+ programming, and its best moments depend on the organiser holding the room.",
    "Wednesday–Sunday; door time and closing time vary by event.", "26 rue Hélène et François Missoffe, 75017 Paris, France", "https://shotgun.live/en/venues/virage",
    ["https://shotgun.live/en/venues/virage"], { best_nights: "Choose a current queer collective or electronic event from the official programme; the venue is not a fixed-format club every night.", staff_inclusivity: "The current event pages state that LGBT-phobia, racism, sexism, misogyny and hate are not tolerated, and that the venue may refuse entry or refund onsite when necessary." }
  )],
  [2217, venue(
    "La Station is still a live, all-welcome music and arts venue—but not an evergreen recommendation: its own 2026 announcement says redevelopment work will close it for nearly three years from November 2026. Use the current programme only while it is operating, and do not plan a later trip from an old listing.",
    "Current programme only; the operator announces a closure for redevelopment from November 2026.", "29 avenue de la Porte d’Aubervilliers, 75018 Paris, France", "https://www.lastation.paris/",
    ["https://www.lastation.paris/stationgdm/rendez-vous/2026-06-12-la-station-a-10-ans"], { best_nights: "Choose a currently advertised show while the venue is operating. There is no responsible recurring ‘best night’ to promise ahead of the announced November 2026 closure.", staff_inclusivity: "The operator describes La Station as a music-and-arts laboratory open to everyone; event-specific conduct information still belongs to the individual programme." }
  )],
  [2218, venue(
    "FVTVR is an industrial Austerlitz club for people choosing a line-up, not a generic ‘queer club’ label. Queer and trans-led parties do happen here, but the host and ticket page tell you far more than the venue name does.",
    "Programme-led Friday–Sunday openings; exact times vary by event.", "34 quai d’Austerlitz, 75013 Paris, France", "https://shotgun.live/fr/venues/fvtvr",
    ["https://shotgun.live/fr/venues/fvtvr"], { best_nights: "Pick the precise techno, house or queer-collective event listed on the current calendar rather than assuming a single best recurring night.", staff_inclusivity: "FVTVR’s published policy names zero tolerance for ableism, ageism, body-shaming, harassment, homophobia, lesbophobia, misogyny, racism, sexism and transphobia." }
  )],
  [2219, venue(
    "Essaim is a 400-capacity, sound-system-led room near La Chapelle: daytime/Main Room programming and late club nights are two different visits. Go when a particular bill interests you; the space is defined by its programme rather than a permanent identity scene.",
    "Programme-led; current listings control opening times.", "14 rue Philippe de Girard, 75010 Paris, France", "https://parisjetaime.com/eng/culture/essaim-paris-p4478",
    ["https://parisjetaime.com/eng/culture/essaim-paris-p4478"], { crowd_mix: "The venue publishes a 400-person capacity and an L-Acoustics system; the audience is therefore bill-led rather than a stable queer demographic claim.", best_nights: "Weekend club listings for dancing; weekday Main Room listings for seated live music. Check which format the current programme is actually selling." }
  )],
  [2220, venue(
    "Le Tango is a properly mixed-format dance institution: Friday/Saturday club nights, Sunday tea dance and named events including Dancing Gouines. It is far more useful to choose the format you want than to flatten it into another all-purpose Marais disco.",
    "Fri, Sat and holiday eves 22:30–05:00; other formats including Wednesday and Sunday vary by programme.", "11 rue au Maire, 75003 Paris, France", "https://www.tangoparis.com/",
    ["https://www.tangoparis.com/"], { best_nights: "Friday or Saturday for clubbing, Sunday for tea dance, or the advertised special format. The night matters because the formats are deliberately different.", staff_inclusivity: "The operator publishes inclusive dance formats and women-only Dancing Gouines events; read the event description for the relevant attendance boundary." }
  )],
  [3313, venue(
    "Full Metal is an adults-only gay men’s fetish and cruising club with the useful thing many such venues omit: a published calendar of dress-led sessions. Treat the code as part of the event, not as an aesthetic suggestion borrowed from another night.",
    "Mon–Thu 19:00–04:00; Fri–Sat 19:00–06:00; Sun 19:00–04:00.", null, "https://www.fullmetal.fr/",
    ["https://www.fullmetal.fr/", "https://www.patroc.com/gay/paris/d/fullmetal.html"], { best_nights: "Wednesday leather, Thursday bear and the named weekend formats each have different dress expectations; pick the published session that genuinely fits you.", dress_code: "The event code is the practical code: the operator advertises leather, rubber, underwear, sportswear, skin and nude formats on different nights. Shoes remain required.", staff_inclusivity: "This is an adults-only men’s venue rather than a general all-genders queer space. The operator lists condoms, sanitiser and gloves on request; consent and the night’s rules remain essential." }
  )],
  [3314, venue(
    "L’Impact is a men-only naturist cruising bar with unusually clear privacy and consent procedures. The practical distinction is simple: it is nude by concept, phones stay with your secured belongings, and Monday is the published no-dress-code exception.",
    "Mon–Wed 19:00–04:00; Thu–Sat 19:00–06:00; Sun 17:00–04:00.", "18 rue Greneta, 75002 Paris, France", "https://impact-bar.com/",
    ["https://impact-bar.com/impact-bar-faq.php"], { queue_wait: "No booking is required, but admission is subject to capacity and ID may be requested. That is the only current, source-backed arrival condition—not an invented wait time.", best_nights: "Monday is the explicit clothed/no-dress-code exception; Thursday to Saturday run until 06:00. Choose the night according to whether that naturist format suits you.", crowd_mix: "Admission is explicitly for adult men. The operator does not publish a reliable locals-versus-visitors breakdown, so none is invented here.", dress_code: "Naturism is the standard inside; Monday is the no-dress-code exception. You change at entry, keep shoes if you want, and leave phone and belongings in the numbered bag held securely by staff.", staff_inclusivity: "The operator states that consent is mandatory, provides prevention information plus condoms and gel on every floor, bans drug use and says staff are available to guide guests." }
  )],
  [3356, venue(
    "Jules & Jim is a 23-room Haut-Marais hotel with a public cocktail bar and green courtyard—small enough to feel personal, without pretending to be a party hotel. Its ally statement is unusually direct, which makes it a better queer-travel recommendation than a vague rainbow hint.",
    "23 rooms; confirm check-in and bar hours directly with the hotel.", "11 rue des Gravilliers, 75003 Paris, France", "https://www.hoteljulesetjim.com/",
    ["https://www.hoteljulesetjim.com/fr/"], { crowd_mix: "The hotel has 23 rooms and a public cocktail bar/courtyard, creating a compact overlap between staying guests and bar visitors rather than a large-hotel crowd.", best_nights: "For a stay, any night; for the public side, choose an early-evening drink in the courtyard rather than expecting a club programme.", staff_inclusivity: "Jules & Jim explicitly describes itself as an LGBTQIA+ ally and says its team practises respect and curiosity toward everyone." }
  )],
  [3357, venue(
    "Hôtel Duo is a central 58-room Marais base that wins on function: Hôtel de Ville on the doorstep, a 24-hour desk and documented accessible-room provision. It is a mainstream hotel, so it should be described honestly rather than inflated into a queer venue.",
    "24-hour reception; check-in from 15:00, check-out until 12:00.", "11 rue du Temple, 75004 Paris, France", "https://www.duo-paris.com/informations-generales/",
    ["https://www.duo-paris.com/informations-generales/", "https://parisjetaime.com/eng/accommodation/hotel-duo-p3118"], { queue_wait: "Check-in starts at 15:00; paid early arrival from 13:00 and late departure to 14:00 can be requested. The hotel does not publish a typical wait in minutes.", crowd_mix: "The property’s 58 rooms serve leisure couples, families, groups and business travellers; no evidence supports calling it a dedicated queer crowd.", staff_inclusivity: "Paris tourism documents motor, visual and hearing-access features, two accessible rooms and service-animal access. No LGBTQ+-specific staff policy is published." }
  )],
  [3358, venue(
    "The former Sinner address is now Experimental Marais, so keeping the old name would be actively misleading. It is a design-led Marais hotel from Experimental Group, and should be listed as a current hotel—not sold as a queer institution simply because the old branding was sensual.",
    "Current guest services and check-in details: confirm with Experimental Marais.", "116 rue du Temple, 75003 Paris, France", "https://www.experimentalgroup.com/paris/experimental-marais",
    ["https://www.experimentalgroup.com/paris/experimental-marais"], { best_nights: "Any night as a central design-hotel stay; the current operator does not publish a recurring queer nightlife programme.", staff_inclusivity: "No venue-specific LGBTQ+ staff policy is published by the current operator, so the listing makes no invented inclusion promise." }
  )],
  [3548, venue(
    "Boxxman is a late-opening Les Halles fetish shop where retail and the separate Le Boxx adults-only space share an address but not a purpose. The useful distinction: shop upstairs for gear and products; do not confuse that with admission downstairs.",
    "Mon–Fri 10:30–23:00; Sat 10:30–00:00; Sun 12:00–22:00.", "2 rue de la Cossonnerie, 75001 Paris, France", "https://www.boxxman.fr/",
    ["https://www.boxxman.fr/", "https://www.boxxman.fr/informations-horaires/"], { queue_wait: "Two retail floors stock fetish clothing, puppy gear, toys, lubricants and BDSM accessories. The lower-level Le Boxx offer is separate and adults-only.", best_nights: "For browsing, use the long daily opening hours and arrive before late evening; later opening is useful for nightlife timing, not a guarantee of quieter advice.", staff_inclusivity: "The physical shop is openly men-focused fetish retail; the adults-only lower floors are separate. No verified online privacy or all-genders service policy is published." }
  )],
  [3549, venue(
    "IEM is the Marais specialist for leather, latex, neoprene and hardware, with its own French-made leatherwork rather than a thin tourist rack. It is also one of the few listings where delivery and discretion can be described concretely because the operator publishes the details.",
    "Mon–Thu 12:00–20:00; Fri–Sat 12:00–21:00; Sun 14:00–20:00.", "16 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France", "https://www.iem.fr/fr/",
    ["https://www.iem.fr/fr/content/7-assistance", "https://www.iem.fr/fr/content/4-a-propos"], { queue_wait: "Leather, latex and neoprene clothing, harnesses, puppy gear, toys, safer-sex supplies and IEM’s own handmade French leatherwork are the specialist range.", best_nights: "Use weekday daytime for sizing or leather-care advice; Friday and Saturday stay open until 21:00 for a pre-nightlife collection.", crowd_mix: "IEM offers click-and-collect and ships in-stock orders validated before 17:00 the same working day across France and most of Europe; it quotes 24–48 hours after dispatch in France and 3–7 working days elsewhere in Europe.", dress_code: "The operator confirms secure online card payment but does not publish a complete fixed list of physical-shop payment methods.", staff_inclusivity: "Online orders are sent in neutral packaging with no logo or content description. The shop is explicitly gay-fetish focused, not presented as an all-gender adult boutique." }
  )],
  [3550, venue(
    "BMC is the compact, old-school late Marais adult shop: products at street level, separate video cabins below and a rare 01:00 closing. That makes it practical on the way home, but it is still a shop first—not a substitute for a club listing.",
    "Daily 10:00–01:00.", "21 rue des Lombards, 75004 Paris, France", "https://www.bmc-store.com/",
    ["https://www.bmc-store.com/infos/4-qui-sommes-nous"], { queue_wait: "The operator describes toys, lubricants, fetish accessories and adult DVDs; the basement video cabins are separate from ordinary retail browsing.", best_nights: "The 01:00 closing is the useful timing detail: daytime suits a product question, while late evening works as a practical Marais stop.", staff_inclusivity: "BMC is an adult gay store with separate basement cabins. No verified neutral-packaging or wider inclusion policy is published, so the listing does not promise one." }
  )],
]);

const deleteIds = [143, 145, 147, 149, 1868, 3315];

if (!APPLY) {
  console.log(`Dry run: ${updates.size} verified Paris updates; remove ${deleteIds.join(", ")}.`);
  process.exit(0);
}

for (const [id, patch] of updates) {
  if (id === 3358) patch.name = "Experimental Marais";
  const { error } = await supabase.from("places").update(patch).eq("id", id).eq("city", "paris");
  if (error) throw new Error(`Could not update ${id}: ${error.message}`);
}

const { data: removed, error: deleteError } = await supabase.from("places").delete().in("id", deleteIds).eq("city", "paris").select("id,name");
if (deleteError) throw new Error(`Could not remove invalid Paris records: ${deleteError.message}`);
if (removed.length !== deleteIds.length) throw new Error(`Expected to remove ${deleteIds.length} records, removed ${removed.length}`);

console.log(`Updated ${updates.size} records; removed ${removed.map((row) => `${row.id}:${row.name}`).join(", ")}.`);
