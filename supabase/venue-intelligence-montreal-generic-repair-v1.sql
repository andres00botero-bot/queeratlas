-- Queer Atlas Venue Intelligence: Montreal generic-copy repair.
-- Research rechecked 2026-08-30. Replaces generic text for exactly 30 records,
-- corrects current addresses/hours and deindexes one duplicate plus one misclassified pool.

begin;

with researched(id, profile) as (
  values
  (518, $qa${
    "queue_wait": "Sky is a multi-space complex rather than one predictable queue. Friday/Saturday club traffic and Pride dates build latest; arrive earlier for the terrace or dining areas and check the current event before assuming every floor is open.",
    "best_nights": "Choose from the published DJ or show schedule: different rooms cover pop, urban music and club programming. Warm-weather terrace sessions use the rooftop pool and spa; a regular weekend does not guarantee every advertised room is operating.",
    "crowd_mix": "Gay men of varied ages remain the historic centre, joined by broader LGBTQ+ groups, visitors and friends. The rooftop is social and mixed earlier; late dance floors skew younger and more nightlife-focused.",
    "dress_code": "Everyday terrace clothing, swim-ready layers and expressive clubwear all make sense in different parts of the building. No universal fetish or formal code is published; bring secure footwear and dress for the named event.",
    "staff_inclusivity": "Sky was founded for Montreal’s gay community and documents partnerships with Divers/Cité, Action Séro Zéro and Gai Écoute. Those ties are concrete community history; current concerns should still go directly to floor security or management.",
    "source_urls": ["https://www.complexesky.ca/en", "https://www.complexesky.ca/en/a-propos-de-nous", "https://www.complexesky.ca/en/sky-club-terrasse"]
  }$qa$::jsonb),
  (519, $qa${
    "queue_wait": "Unity opens Thursday–Saturday at 21:30. Friday/Saturday after midnight and major Pride bookings create the strongest door pressure; bring ID, arrive before the headline set and use the current Sainte-Catherine entrance.",
    "best_nights": "Thursday is the easier introduction; Friday and Saturday activate the two rooms, VIP area and rooftop most fully. Pick the listed local or international DJ because music and audience shift with the production.",
    "crowd_mix": "LGBTQ+ locals, gay men, students, visitors and respectful friends form a deliberately varied club crowd. The official positioning is inclusive rather than men-only, with the rooftop providing a less compressed social zone.",
    "dress_code": "Relaxed dancewear, trainers and expressive queer club looks fit the unpretentious brief. No strict costume is published. Dress for several floors and a rooftop, and check the promoter before assuming ordinary weekend rules.",
    "staff_inclusivity": "Unity publishes strict zero tolerance for harassment and tells guests to notify staff immediately about unwanted attention, contact or behaviour. This creates a clear reporting route to bar, floor or security staff in every room.",
    "source_urls": ["https://clubunity.com/", "https://www.unity.club/"]
  }$qa$::jsonb),
  (520, $qa${
    "queue_wait": "Mado is a ticketed cabaret with a compact performance room. Buy the dated show when offered and arrive before curtain for seating; Friday/Saturday editions and Pride programming sell and fill faster than an ordinary bar visit.",
    "best_nights": "Use the live calendar: Mado reçoit anchors Friday and Saturday, while Full Gisèle and rotating casts give other nights distinct hosts. Choose the performer and language mix rather than treating every evening as identical drag.",
    "crowd_mix": "Drag regulars, gay men, queer groups, birthday parties, tourists and local performers share a lively, mixed-gender audience. Weekend headline shows attract the broadest visitor crowd; recurring weekday casts feel more local.",
    "dress_code": "There is no published selector wardrobe. Smart-casual, colourful queer nightlife clothes and full drag-night glamour all work. Keep sightlines and close cabaret seating in mind rather than dressing for a techno floor.",
    "staff_inclusivity": "Mado is an operating LGBTQ+ performance institution built around employed drag artists and named hosts. Audience or access problems have identifiable escalation points: the host, floor team, box office and venue management.",
    "source_urls": ["https://www.mado.qc.ca/", "https://www.cabaretmado.com/", "https://www.mado.qc.ca/calendrier"]
  }$qa$::jsonb),
  (521, $qa${
    "queue_wait": "Renard takes no reservations. The terrace and happy hour create seat pressure before the late crowd, while Thursday–Saturday closing at 03:00 brings standing-room traffic. Use 1272 Sainte-Catherine, directly opposite Beaudry métro.",
    "best_nights": "Monday–Wednesday suit cocktails and conversation; Thursday/Friday run later and Saturday begins at 13:00 before turning into a fuller party. Choose Motel Motel next door only when a dense DJ-led room is the actual goal.",
    "crowd_mix": "Village regulars, LGBTQ+ locals, dates, hospitality workers and visitors form the eclectic audience the venue describes. Earlier terrace hours are broad and conversational; the late shift becomes younger and more dance-adjacent.",
    "dress_code": "Polished casual, work-to-drinks clothes and expressive nightlife looks fit the design-led bar. There is no evidenced fashion gate. Dress for terrace weather and close standing space rather than inventing a formal cocktail code.",
    "staff_inclusivity": "Renard explicitly identifies a diverse staff and describes both rooms as label-free spaces where everyone can find a place. For a service or safety problem, use the visible bar lead; the operator publishes phone and email contact.",
    "source_urls": ["https://bar-renard.com/", "https://bar-renard.com/pageen"]
  }$qa$::jsonb),
  (522, $qa${
    "queue_wait": "Cocktail opens daily at 14:00 and is generally walk-in. Thursday–Sunday drag and the karaoke that follows compress the room around showtime; arrive before the 21:00 performance if an accessible route or useful sightline matters.",
    "best_nights": "Thursday–Sunday are drag-led, Monday showcases emerging talent, and Tuesday/Wednesday start karaoke around 22:00. Choose the format: an early drink, a seated show and post-show karaoke produce very different visits.",
    "crowd_mix": "Drag fans, gay men, mixed LGBTQ+ groups, performers, tourists and karaoke regulars share a broad Village cabaret-bar audience. New-talent Monday is especially connected to Montreal’s developing performer community.",
    "dress_code": "Everyday barwear, date-night polish, performer glamour and karaoke camp are all appropriate. No strict code is published. Keep bags compact and choose footwear that works for a crowded room and late singing.",
    "staff_inclusivity": "The venue provides wheelchair-accessible entry for ticketed shows and employs recurring drag hosts across five programme nights. Ask the floor team for the accessible route or report audience conduct to the host or manager during the show.",
    "source_urls": ["https://www.barlecocktail.com/", "https://lepointdevente.com/billets/5i3260919001", "https://quoifaireenfamille.com/en/listing/bar/bar-le-cocktail/"]
  }$qa$::jsonb),
  (523, $qa${
    "queue_wait": "Aigle Noir opens daily and functions as a walk-in neighbourhood bar. The after-work 5 à 7 is easier for conversation; fetish gatherings, DJ dates and weekend late hours produce the real crowd pressure rather than a formal ticket line.",
    "best_nights": "The daily DJ-supported 5 à 7 is the dependable social window. Use the current calendar for leather, bear or community nights; weekend late hours are busier, but an event-specific gathering offers a clearer connection point.",
    "crowd_mix": "Gay men, leather and fetish communities, bears, older Village regulars and visitors form the core. Earlier terrace hours are more conversational; named community events bring the strongest shared identity.",
    "dress_code": "Denim, leather, boots, gear and ordinary masculine barwear all fit, but the venue publishes no permanent gear requirement. Follow a named fetish event if one specifies kit; otherwise comfortable bar clothing is valid.",
    "staff_inclusivity": "Aigle Noir serves an identifiable gay-male leather/fetish constituency and keeps staff visible at the bar and DJ-led social hours. That is specific community service, not evidence of an all-identities policy; report consent issues immediately.",
    "source_urls": ["https://www.aiglenoir.ca/", "https://www.fugues.com/wp-content/uploads/2025/11/Fugues_Dec2025Jan2026.pdf"]
  }$qa$::jsonb),
  (524, $qa${
    "queue_wait": "Oasis operates 24/7, but room availability and reception processing can tighten on weekend evenings and promotions. Current 2026 reviews report renovation disruption and uneven front-desk service, so confirm the room category before paying.",
    "best_nights": "Friday/Saturday and holiday spillover bring more circulation; weekday daytime is quieter. Renovations materially affect the current experience, so a fresh same-day call is more useful than an old claim about a guaranteed 5 à 7 peak.",
    "crowd_mix": "Adult gay and bisexual men, local regulars and visitors use a traditional sexual bathhouse rather than a wellness spa. The mix varies sharply by hour and promotion; no source supports promising one age or body type.",
    "dress_code": "Towel or nudity is standard beyond the locker area; secure clothes and valuables at reception. Bring shower sandals and personal safer-sex supplies. Photography and public-street exposure are never implied by the sexual setting.",
    "staff_inclusivity": "This is a men-focused sexual venue, not an all-community facility. Recent reviews specifically conflict on cleanliness, pricing and reception conduct; inspect the assigned room and raise a problem before using it or request cancellation terms.",
    "source_urls": ["https://www.facebook.com/saunaloasis", "https://reviews.birdeye.com/oasis-170116417308880", "https://www.fugues.com/wp-content/uploads/2025/10/Fugues_NOV2025.pdf"]
  }$qa$::jsonb),
  (525, $qa${
    "queue_wait": "GI Joe is open 24 hours. Reception assigns lockers or rooms; weekend nights and major events increase availability pressure. A 24-hour room includes in-and-out access, while short categories do not, so confirm before payment.",
    "best_nights": "Use a dated event such as CumUnion for the strongest shared purpose; ordinary weekend nights bring more circulation. Daytime rooftop use is seasonal and social, while late floors are more explicitly sexual.",
    "crowd_mix": "Gay and bisexual men, locals, international visitors and event-specific fetish or cruising guests circulate across four floors. The 14,000-square-foot layout separates conversation, spa use and play rather than creating one uniform crowd.",
    "dress_code": "Towel or nudity is standard after changing; event nights may invite gear. Use secure footwear around wet areas and store phones with clothes where required. Select locker, single, double, sling, dungeon or luxury room deliberately.",
    "staff_inclusivity": "GI Joe clearly publishes its men-focused purpose, room inventory and service rules, giving reception concrete responsibility for access and accommodation issues. It does not claim a mixed-gender mandate; ask directly about trans-men admission before travel.",
    "source_urls": ["https://saunagijoe.com/a-propos", "https://saunagijoe.com/services", "https://saunagijoe.com/acceuil"]
  }$qa$::jsonb),
  (1059, $qa${
    "queue_wait": "District is a reservable bar-restaurant rather than a selective club. Friday/Saturday You Are the DJ and midnight traffic fill seats; reserve or arrive before the programme if table service matters. It opens daily at 15:00.",
    "best_nights": "Friday and Saturday let guests control the video soundtrack from a library exceeding 100,000 songs. Earlier weekdays are better for cocktails, food and conversation; choose a listed community event when meeting people is the priority.",
    "crowd_mix": "Gay men, mixed LGBTQ+ groups, Village regulars, tourists and dinner-to-drinks parties share a polished but social room. User-controlled music makes the weekend audience participatory rather than focused on one DJ subculture.",
    "dress_code": "Casual-to-polished barwear works; no dress gate is published. Dress for table seating that may become standing and dancing later. A charged phone is useful because song requests run through the mobile interface.",
    "staff_inclusivity": "The venue gives guests a direct role through accessible mobile song requests and takes reservations for lower-friction seating. It operates inside the Gay Village but publishes no specialist trans policy; service issues belong with the floor manager.",
    "source_urls": ["https://www.districtvideolounge.com/en", "https://www.districtvideolounge.com/"]
  }$qa$::jsonb),
  (1060, $qa${
    "queue_wait": "Normandie is open daily 14:00–03:00 and normally walk-in. Its 75-seat, 125-capacity terrace and karaoke stage fill on summer weekends; reserve a group or arrive before singing begins when a table is important.",
    "best_nights": "Karaoke is the defining format throughout the week. Earlier 5 à 7 hours favour inexpensive drinks and regulars; later weekend sessions create the fullest sing-along. Check the current host rather than relying on an archived Sunday name.",
    "crowd_mix": "Long-time gay Village regulars, karaoke singers, tourists, mixed-age LGBTQ+ groups and friends form the broad crowd the tavern itself describes. The terrace is especially mixed; late stage turns reward confident regular performers.",
    "dress_code": "Everyday tavern clothes, casual date looks and karaoke-stage sparkle all fit. There is no formal or fetish code. Dress for a rustic, loud room and summer terrace rather than a polished nightclub threshold.",
    "staff_inclusivity": "Normandie has served the Village since 1981 and presents an unusually mixed daily clientele around public karaoke. No current source verifies the database’s former ‘trans safe space’ claim, so use the bar lead or karaoke host as the concrete reporting route.",
    "source_urls": ["https://taverne-normandie.ca/", "https://taverne-normandie.ca/contact/", "https://www.mtl.org/en/experience/bars-village-and-beyond"]
  }$qa$::jsonb),
  (1061, $qa${
    "queue_wait": "Stereo is ticket-led and major headliners can mean 20–60+ minutes outside. Buy early, bring physical ID and arrive before the main set. The after-hours room has no fixed closing time and normally opens after midnight.",
    "best_nights": "Choose the DJ and marathon length: house, techno and queer-led bookings can produce very different rooms. Friday/Saturday are not automatically open without a listing; occasional extended-liquor events also change the usual alcohol-free format.",
    "crowd_mix": "House and techno devotees, gay men, queer dancers, international club pilgrims and straight music heads share a music-first after-hours crowd. Specific promoters can make a night much more explicitly LGBTQ+ than the building alone.",
    "dress_code": "No formal dress code: comfortable sportswear, trainers and sweat-ready layers are the informed choice for a sprung floor and long set. Phones and photography are restricted on the dance floor; leave heels and performative VIP styling behind.",
    "staff_inclusivity": "Stereo’s practical safeguards are a zero-tolerance stance, floor security and a strict no-photo culture. It has deep queer history but serves mixed events; report harassment or GHB concerns immediately rather than relying on an unwritten safe-space label.",
    "source_urls": ["https://www.stereonightclub.net/", "https://ville.montreal.qc.ca/documents/Adi_Public/CE/CE_ODJ_ADOPTE_ORDI_2026-05-20_09h00_FR.pdf", "https://www.reddit.com/r/StereoMontreal/comments/1otzds9/"]
  }$qa$::jsonb),
  (1062, $qa${
    "queue_wait": "This is a duplicate record for Le Stud at 1812 Sainte-Catherine E. Do not use it to estimate a second venue or separate queue. The active bar and its arrival guidance are represented by canonical place ID 1652.",
    "best_nights": "No independent best night belongs to this duplicate. Consult ID 1652 for current daily 14:00–03:00 hours, Monday/Tuesday karaoke and event-specific use of the venue’s three to five bar sections.",
    "crowd_mix": "This row has no separate audience. It duplicates the same gay-men-centred leather and bear institution operating as Le Stud; keeping two crowd profiles would falsely inflate Montréal’s venue count.",
    "dress_code": "There is no separate door or outfit rule for this record. Use the canonical Le Stud listing for casual barwear, leather, gear and event-specific expectations at the real 1812 Sainte-Catherine address.",
    "staff_inclusivity": "No second staff team exists here. Inclusion evidence and the men-loving-men focus belong to canonical ID 1652; deindexing this duplicate is more honest than manufacturing another staff assessment.",
    "source_urls": ["https://www.lestudmontreal.ca/", "https://www.lestudmontreal.ca/evenements0"]
  }$qa$::jsonb),
  (1432, $qa${
    "queue_wait": "Stock uses a paid adult-entertainment door and separate spaces inside the same building as Unity. Thursday–Sunday late hours and headline shows bring the strongest arrival pressure; confirm current opening time before buying a table or private dance.",
    "best_nights": "Pick a dated stage or shower show for the full club product; an earlier Stock & Soda visit is more cocktail-led. Thursday–Sunday operate, but current sources conflict between 15:00 and 20:00 starts, so verify the specific room.",
    "crowd_mix": "Gay men, male-strip audiences, tourists, couples and mixed groups form an adult-entertainment crowd rather than Unity’s dance-club audience upstairs. Performers and private-dance customers shape the room more than a DJ subculture.",
    "dress_code": "Smart-casual or ordinary gay-bar clothing is sufficient; no fetish requirement is published. Carry a payment method and decide spending boundaries before entry, especially if considering private dances or tipped stage interaction.",
    "staff_inclusivity": "The venue markets respectful treatment of performers and a diverse adult audience, but recent 2026 feedback includes a serious complaint about pressure around private-dance payment. Agree prices first and escalate immediately to management if consent or charges are unclear.",
    "source_urls": ["https://stockbarmontreal.com/en", "https://stockbarmontreal.com/fr", "https://restaurantguru.com/Stock-Bar-Montreal"]
  }$qa$::jsonb),
  (1433, $qa${
    "queue_wait": "Belmont is event-led: buy the ticket from the individual listing before reserving a table. Concerts and promoter nights use different doors and start times; arriving near doors is safer than relying on the obsolete fixed Wed/Fri/Sat schedule.",
    "best_nights": "There is no universal queer night. The live calendar ranges from 90s/2000s parties to hip-hop concerts and touring acts. Choose a promoter with an explicit LGBTQ+ audience if queer concentration matters.",
    "crowd_mix": "The crowd follows the booking: concert fans, students, hip-hop audiences, nostalgia dancers or queer-party guests may occupy the same 4483 Saint-Laurent room on different dates. The venue itself is mainstream, not a permanent gay club.",
    "dress_code": "Follow the ticketed production. Casual concert clothes and trainers work for most nights; a themed promoter may request something else. Keep bags small for a compact standing floor and do not infer a queer dress code from the Atlas listing.",
    "staff_inclusivity": "Belmont provides venue staff, ticketing and table management, but publishes no queer-specific welfare policy. Inclusion therefore depends partly on the named promoter; identify both promoter staff and house security before the floor becomes crowded.",
    "source_urls": ["https://www.lebelmont.ca/", "https://www.instagram.com/lebelmont.mtl/"]
  }$qa$::jsonb),
  (1434, $qa${
    "queue_wait": "This 950-room mainstream hotel checks in after 16:00, so Central Station arrivals and afternoon turnover create reception pressure. Mobile planning and luggage storage help; reserve a Fairmont Gold or accessible category explicitly if needed.",
    "best_nights": "Stay for direct Central Station access, downtown luxury, Moment Spa and the hotel’s restaurants—not an in-house queer nightlife programme. Pride, Grand Prix and festival weekends require earlier booking and bring the busiest lobby.",
    "crowd_mix": "Business travellers, rail passengers, families, luxury tourists and event delegates form a large mainstream audience. LGBTQ+ guests are visible during Pride partnerships, but this is not queer-owned or a community guesthouse.",
    "dress_code": "Travel clothes are valid at reception; smart-casual suits restaurants and Gold lounge. No identity-coded dress applies. External nightlife maintains its own ID and outfit rules, and a hotel booking gives no club access.",
    "staff_inclusivity": "The property’s 2026 Pride Ride actively raises funds for Interligne, Québec’s LGBTQ+ support service, providing current local inclusion evidence. For chosen-name or access needs, contact the 24-hour hotel team before arrival and place them on the booking.",
    "source_urls": ["https://www.fairmont.com/en/hotels/montreal/fairmont-the-queen-elizabeth.html", "https://ca.linkedin.com/company/fairmont-the-queen-elizabeth"]
  }$qa$::jsonb),
  (1435, $qa${
    "queue_wait": "William Gray is a mainstream boutique hotel with check-in from 16:00 and checkout at noon. Old Montréal weekends and rooftop season concentrate the desk and valet; request an accessible room, not merely an accessible room type, before arrival.",
    "best_nights": "Book for Old Montréal, the spa, Maggie Oakes and seasonal rooftops rather than queer programming. Weeknights reduce rooftop and wedding pressure; summer weekends suit atmosphere but increase visitors and street noise.",
    "crowd_mix": "Luxury leisure guests, couples, wedding parties, restaurant visitors and business travellers form a mainstream upscale mix. The property does not evidence queer ownership or a recurring LGBTQ+ community programme.",
    "dress_code": "No dress rule applies at check-in. Smart-casual is useful for the restaurant or rooftop, while ordinary travel clothing is fine elsewhere. External queer venues set separate admission rules.",
    "staff_inclusivity": "Accessible Alcove and Deluxe rooms are published and guest-services contact is direct, but no current source supports the old ‘highly progressive diverse staff’ claim. Put pronouns, bed setup and mobility requests in writing with reservations.",
    "source_urls": ["https://hotelwilliamgray.com/ask-us-anything/", "https://hotelwilliamgray.com/rooms/alcove/", "https://hotelwilliamgray.com/rooms/deluxe/"]
  }$qa$::jsonb),
  (1436, $qa${
    "queue_wait": "BBV is a small family-run guesthouse without continuous reception. Check-in is normally after 14:00; send the agreed arrival time and update delays so an owner is present. Pride and festival dates add minimum stays and stricter terms.",
    "best_nights": "Choose BBV for breakfast-table connection, two terraces and immediate Village access, not hotel events. A longer stay makes the owners’ local guidance useful; Pride should be booked early under its special rate and cancellation conditions.",
    "crowd_mix": "Gay and LGBTQ+ travellers, couples and independent visitors share a small owner-present house rather than an anonymous hotel. Breakfast from 08:00 creates the clearest guest contact; the resident dog is relevant for allergies or comfort.",
    "dress_code": "No dress code applies. Ordinary travel and breakfast clothes are right; nightlife outfits can stay in the room. Pack with a residential B&B in mind and ask about room access if stairs or shared facilities affect you.",
    "staff_inclusivity": "Owners Philippe and Nicolas and team members Darren and Sylvain identify themselves and offer first-hand Village guidance. That owner-led queer context is concrete; dietary needs, chosen names and arrival support can be discussed directly before stay.",
    "source_urls": ["https://bbv.qc.ca/"]
  }$qa$::jsonb),
  (1438, $qa${
    "queue_wait": "This record is not a managed cruising venue. It appears to refer to the public Piscine Maisonneuve at 4350 rue de Rouen, which is free, seasonal and first-come-first-served. Family swim capacity—not sexual access—governs entry.",
    "best_nights": "Use the municipal summer timetable for public swimming, generally daytime through 19:00. There is no evidence-based cruising schedule, night programme or consent infrastructure; the pool is out of season after August 23, 2026.",
    "crowd_mix": "Families, children, lane swimmers, neighbourhood residents and summer visitors use a municipal outdoor pool. Queer residents may attend like anyone else, but the facility itself has no documented gay or cruising audience.",
    "dress_code": "Proper swimwear and municipal pool rules apply. This is not a fetish, nude or sexual space. Bring only practical valuables and follow lifeguard instructions, first-come capacity and public-behaviour standards.",
    "staff_inclusivity": "Municipal lifeguards supervise public aquatic safety, not sexual encounters. No inclusion rating can convert this family facility into a queer venue; the accurate action is to reject and deindex the misclassified record.",
    "source_urls": ["https://montreal.ca/lieux/piscine-maisonneuve-du-parc-francine-leger", "https://montreal.ca/en/places/parc-francine-leger-outdoor-swimming-pool"]
  }$qa$::jsonb),
  (1652, $qa${
    "queue_wait": "Le Stud is open every day 14:00–03:00 and is normally walk-in. Weekend DJs and large community events activate three to five bars and create the busiest entry; early 5 à 7 hours are much easier for conversation.",
    "best_nights": "Monday and Tuesday karaoke are the clearest recurring formats. Use the live calendar for leather, bear, BLUF or dance events; daytime happy hour serves a different social purpose from the late multi-bar club.",
    "crowd_mix": "Gay men are explicitly centred, especially bears, leather community members, daddies, cubs and long-time Village regulars. The venue says everyone is welcome, but its men-loving-men identity remains the useful expectation.",
    "dress_code": "Casual masculine barwear, denim, leather and fetish gear all fit; karaoke does not require kit. Check named events for stronger codes. Dress for a bar that can expand into several dance and social sections.",
    "staff_inclusivity": "Le Stud clearly states its gay-men focus while also publishing that everyone may enjoy the venue. That boundary is more useful than an all-audience claim; bartenders and event staff are the immediate route for consent or service concerns.",
    "source_urls": ["https://www.lestudmontreal.ca/", "https://www.lestudmontreal.ca/evenements0"]
  }$qa$::jsonb),
  (1653, $qa${
    "queue_wait": "Le Date opens daily at 13:00. Summer karaoke begins around 20:00 Thursday–Saturday and 21:00 Sunday–Wednesday; arrive before that if you want a table or an early place in the singing rotation.",
    "best_nights": "Thursday–Saturday start karaoke earlier and build the fullest performance crowd. Sunday–Wednesday suit regulars and more turns at the microphone. Pride’s Karaoslay is a separate festival production, not the normal room.",
    "crowd_mix": "Serious karaoke regulars, gay men, mixed LGBTQ+ groups, tourists and supportive non-singers share a performance-focused Village bar. The public stage rewards confident singers but also turns strangers into an active audience.",
    "dress_code": "Everyday barwear and stage-ready sparkle are equally valid. No formal code is published. Choose clothes you can sing and sit in; a charged phone is useful if you want the venue’s recorded performance feature.",
    "staff_inclusivity": "Le Date’s named manager/DJ and Pride-stage partnership connect staff to the local queer programme rather than a generic badge. Song-order, audience-conduct or access problems should go to the host or bar manager before your turn.",
    "source_urls": ["https://www.instagram.com/datekaraoke/", "https://www.bars10.com/CA/Montreal/1597843250484538/Date-karaoke-Bar", "https://www.themain.com/place/le-date"]
  }$qa$::jsonb),
  (1654, $qa${
    "queue_wait": "Le Weiser is a reservable sports pub, not a club door. Major Canadiens, football and Olympic broadcasts create table pressure; reserve for the named game. Use 1309 Sainte-Catherine and verify daily hours because the official page omits them.",
    "best_nights": "Choose the actual broadcast: giant screens can carry several sports, while pool and interactive games support quieter dates. A major Montréal match creates the shared crowd; an ordinary night may have no programmed event.",
    "crowd_mix": "Queer sports fans, Village regulars, mixed LGBTQ+ friend groups and mainstream game viewers share an intentionally broad pub audience. The room is sport-led without requiring the culture of a traditional straight sports bar.",
    "dress_code": "Team jerseys, casual pub clothes and ordinary queer streetwear all fit. No dress code is published. Wear the colours you support, but treat rival fans and identities respectfully in a close viewing room.",
    "staff_inclusivity": "The venue’s current message is ‘United by sport, proud to be us’ and it locates that mission explicitly in the Gay Village with a diverse clientele. The official source does not verify the old ‘certified trans safespace’ claim; use the floor lead for issues.",
    "source_urls": ["https://www.leweiser.com/en", "https://www.mtl.org/en/experience/bars-village-and-beyond"]
  }$qa$::jsonb),
  (1655, $qa${
    "queue_wait": "Motel Motel is the small DJ room attached to Renard at 1276 Sainte-Catherine. Capacity, not a velvet-rope ritual, is the constraint; arrive before the late peak and use Renard’s no-reservation policy unless a promoter states otherwise.",
    "best_nights": "Use the current DJ announcement. The operator describes a dense, music-led late room rather than a fixed genre guarantee; Thursday–Saturday closing at 03:00 offers the most likely club energy, while other days track Renard.",
    "crowd_mix": "Queer Village dancers, local DJ followers, Renard regulars and visitors fill an intimate, label-free room. The crowd is younger and more music-focused than the adjoining cocktail bar but not permanently one techno subculture.",
    "dress_code": "Compact dancewear, trainers and expressive nightlife layers fit the raw little room. No fetish or fashion rule is published. Keep bags minimal because density and movement, not a formal door, define the experience.",
    "staff_inclusivity": "Motel Motel shares an operator that explicitly describes a diverse team and two label-free spaces where everyone can find a place. Bar and DJ staff are close in the small layout; report unwanted conduct immediately rather than waiting until exit.",
    "source_urls": ["https://bar-renard.com/", "https://bar-renard.com/pageen", "https://www.instagram.com/motel_motel_/"]
  }$qa$::jsonb),
  (1656, $qa${
    "queue_wait": "Maison Des Jardins has reception 08:00–17:00; after 17:00 uses instructions emailed five days before arrival. Confirm receipt rather than expecting a night desk. The adults-only rooms cap at two and some bathrooms are shared.",
    "best_nights": "Stay for a quiet Village base, breakfast in the garden and an outdoor hot tub—not nightlife inside the house. Summer and Pride reward early booking; breakfast runs 08:00–10:00 and dietary changes should be requested beforehand.",
    "crowd_mix": "Adult couples and independent visitors share a small host-present B&B with communal breakfast and garden space. LGBTQ+ travellers benefit from the Village location, while the property explicitly describes itself as welcoming everyone.",
    "dress_code": "No dress code applies. Ordinary travel, breakfast and hot-tub clothing are right; bring swimwear and a cover-up for the shared garden. Check whether the chosen room has a private or shared bathroom before packing.",
    "staff_inclusivity": "Host Robert Fréchette is publicly identified, and the property states ‘for everyone’ while documenting vegetarian, gluten-free and dairy-free breakfast adaptation. Chosen-name, dietary and arrival needs can therefore be addressed directly to a named host.",
    "source_urls": ["https://www.maison-desjardins.ca/en", "https://www.maison-desjardins.ca/fr/a-proximite-maison-desjardins", "https://www.maison-desjardins.ca/en/rooms-maison-desjardins"]
  }$qa$::jsonb),
  (1657, $qa${
    "queue_wait": "La Loggia is an adults-only B&B, not a 24-hour hotel desk. Advise arrival time, bring photo ID and settle the balance at check-in. A two-night minimum applies May–October and three nights around major summer events.",
    "best_nights": "Choose it for a quiet Gay Village guesthouse and garden rather than organised nightlife. Longer summer stays fit the minimum-night policy; weekdays reduce festival pressure and make local advice easier to use.",
    "crowd_mix": "Adult couples, solo travellers and arts-oriented visitors share a very small non-smoking guesthouse. LGBTQ+ travellers are directly served by its Gay Village positioning, but the room mix is determined by bookings rather than a public bar crowd.",
    "dress_code": "No dress rule applies. Travel clothes and quiet-house layers are sufficient. Smoking is limited to the back garden, pets are not accepted and shared-bath rooms should be selected knowingly.",
    "staff_inclusivity": "The operator markets directly to gay travellers and provides personal pre-arrival contact, but publishes no broad all-identities training policy. Put chosen name, twin-bed setup or access needs in the written confirmation rather than assuming them.",
    "source_urls": ["https://www.laloggia.ca/main.cfm?TB_iframe=true&height=500&keepThis=true&l=en&p=01_110&width=800", "https://www.booking.com/hotel/ca/la-loggia-art-b-amp-b.en-gb.html"]
  }$qa$::jsonb),
  (1658, $qa${
    "queue_wait": "HOTEL10 is a mainstream boutique hotel with check-in from 16:00 and checkout at noon. Festival-weekend turnover can slow the desk; the tourism authority marks the property not accessible, so verify mobility needs before a non-refundable booking.",
    "best_nights": "Use it for Saint-Laurent, Quartier des spectacles and a design-hotel base, not recurring queer programming. Pride and festival dates improve location value but increase rates and lobby pressure; weekdays are calmer.",
    "crowd_mix": "Business guests, festival visitors, couples, pet owners and nightlife travellers form a mainstream hotel audience. LGBTQ+ guests are ordinary customers, but current sources do not establish queer ownership or a permanent community programme.",
    "dress_code": "No dress code applies at reception or in guest areas. Smart-casual suits the restaurant and events; normal travel clothes are fine. Nearby clubs and Pride parties set their own admission rules.",
    "staff_inclusivity": "Personalised service and pet provisions are documented, but the former Pride-ally copy is not enough to promise queer-specialist handling. More importantly, Tourisme Montréal marks the property not accessible; confirm names and access requirements in writing.",
    "source_urls": ["https://www.hotel10montreal.com/", "https://www.mtl.org/en/accommodations/hotel10-montreal"]
  }$qa$::jsonb),
  (1659, $qa${
    "queue_wait": "Hyatt Place has 24-hour reception, check-in from 15:00 and checkout at noon. Afternoon turnover is the predictable wait; it is cashless and indoor parking has a 1.70 m height limit, so bring a card and confirm vehicle fit.",
    "best_nights": "Choose it for direct Berri-UQAM métro access, Village proximity, a 09:00–22:00 indoor pool and dry sauna—not hotel nightlife. Pride weekends sell early; weekdays make the large downtown property calmer.",
    "crowd_mix": "International tourists, families, business travellers, groups and Pride visitors use a mainstream chain hotel. Its Village-edge location is useful for LGBTQ+ guests without making the lobby a queer community venue.",
    "dress_code": "No hotel dress code applies. Travel clothing, swimwear in the pool area and normal gym clothes are sufficient. External bars and clubs control their own ID, age and outfit policies.",
    "staff_inclusivity": "The property offers accessible rooms and accessible public areas, while Hyatt documents long-running LGBTQ+ workplace equality and Pride activity. Put chosen name, partner details and the exact accessible feature required on the reservation.",
    "source_urls": ["https://www.hyatt.com/hyatt-place/en-US/yulzm-hyatt-place-montreal-downtown/faqs", "https://newsroom.hyatt.com/news-releases?asPDF=1&item=124120"]
  }$qa$::jsonb),
  (1660, $qa${
    "queue_wait": "M Montréal checks in from 15:00 with a physical ID and card; 490 beds make afternoon turnover substantial. Bottom bunks are first-come, first-served, and only registered guests enter dorms or private rooms.",
    "best_nights": "Choose the daily social format: Tuesday games, Wednesday karaoke/Latin dance, Thursday drinking games, Friday pub crawl and weekend walks. The rooftop runs 08:00–22:00, with hot tubs normally available after 10:00.",
    "crowd_mix": "International backpackers, students, solo travellers, groups and private-room guests create a young mainstream hostel mix. LGBTQ+ visitors benefit from the Village location, but the property is not a dedicated queer hostel.",
    "dress_code": "No special look is needed. Bring casual social clothes, swimwear for the rooftop, a layer for walking tours and secure footwear for pub crawls. Only registered guests may enter sleeping areas.",
    "staff_inclusivity": "The 24-hour desk, women-only dorm option, registered-guest rule and public M Bar give concrete support and boundaries. No source supports the old claim that the hostel is intrinsically trans-led; record chosen name and room needs with reception.",
    "source_urls": ["https://www.m-montreal.com/en-gb/contact-/faq", "https://www.mtl.org/en/accommodations/m-montreal", "https://www.hostelworld.com/fr/auberges-de-jeunesse/p/49955/m-montreal/"]
  }$qa$::jsonb),
  (1887, $qa${
    "queue_wait": "La Graine Brûlée is a daily 07:00–23:00 café. Laptop and lunch traffic affect table availability more than a queue; arrive outside midday or evening study peaks if you need a workstation, terrace seat or longer stay.",
    "best_nights": "Daytime suits coffee, food and laptop work; early evening keeps the Village people-watching without bar volume. This is not a recurring queer-event venue, so check social channels for a dated activation rather than assuming a party.",
    "crowd_mix": "Students, remote workers, neighbourhood regulars, tourists and LGBTQ+ Village visitors share a colourful mainstream café. The address supplies queer context, but no current source establishes queer ownership or an identity-exclusive audience.",
    "dress_code": "Everyday café clothes, workwear and expressive street style all fit. There is no dress code. Bring headphones and a charged device for work, and treat the terrace as a public café rather than a nightlife floor.",
    "staff_inclusivity": "The café is a visible all-day gathering point in the Village, with vegan-friendly café service and long hours, but it publishes no specialist inclusion policy. Ask the counter team about ingredients, seating or a service concern rather than relying on décor.",
    "source_urls": ["https://ouimanon.com/pages/contact", "https://www.restomontreal.ca/resto/la-graine-brulee-montreal/11164/en/"]
  }$qa$::jsonb),
  (1888, $qa${
    "queue_wait": "Reine Garçon is a small walk-in neighbourhood café. Morning regulars, weekend brunch and occasional ticketed events tighten seating; weekday opening is 07:30 and weekends 08:00, with current closing around 17:00–18:00.",
    "best_nights": "Morning and lunch are best for coffee and conversation; use a dated concert or community event when programming matters. A September 2026 fundraiser confirms event use, but the café is not a nightly performance venue.",
    "crowd_mix": "Queer women, neighbourhood families, artists, students, remote workers and local regulars share a community café. Independent directories identify queer-women ownership; the children’s area and solidarity work broaden the daily audience.",
    "dress_code": "Everyday neighbourhood clothes are right; there is no fashion gate. Bring a laptop for the Wi-Fi or weather layers for outdoor seating. Ticketed evening events may run beyond normal café hours.",
    "staff_inclusivity": "The queer-women-owned café participates in L’Oranger’s 2026 solidarity network, offering free bathroom, Wi-Fi, phone charging, food warming and water access to people experiencing homelessness. That is concrete inclusive service.",
    "source_urls": ["https://www.instagram.com/cafereinegarcon/", "https://pleinmilieu.qc.ca/wp-content/uploads/2026/04/pm-loranger-usagers-2026-map-web.pdf", "https://thepointofsale.com/venues/cafe-reine-garcon"]
  }$qa$::jsonb),
  (1889, $qa${
    "queue_wait": "Titanic is a weekday lunch café open roughly 10:30–16:00/16:30. The practical wait is the midday counter and limited table turnover in its lower-level room; arrive before 12:00 or after 14:00 for a calmer meal.",
    "best_nights": "There are no nights: the café closes in late afternoon and is closed Saturday/Sunday. Choose a weekday lunch for sandwiches, soups and Old Montréal atmosphere; do not route visitors here as evening queer programming.",
    "crowd_mix": "Old Montréal office workers, local creatives, tourists and lunch regulars form a mainstream daytime audience. LGBTQ+ customers may feel comfortable, but current primary sources do not establish queer ownership or a dedicated community mission.",
    "dress_code": "Ordinary workday, sightseeing and casual lunch clothing fits the rustic basement room. There is no dress code. Travel light for stairs and close tables, and verify physical access directly if mobility is a concern.",
    "staff_inclusivity": "The café publishes direct phone and email contact but no queer-specific or accessibility policy. Staff can address food and seating needs during short service hours; the honest profile should not convert an online ‘LGBTQ-friendly’ label into training evidence.",
    "source_urls": ["https://www.titanicmontreal.com/contact", "https://www.titanicmontreal.com/"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id=1062 then jsonb_build_object('operating_status','duplicate_record_deindexed')
       when id=1438 then jsonb_build_object('operating_status','public_pool_not_queer_venue')
       when id in (1433,1434,1435,1658,1659,1660,1887,1889) then jsonb_build_object('operating_status','active_mainstream_venue')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence', jsonb_build_object(
      'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'updated_at','2026-08-30T00:00:00Z'
  ) as patch from researched
)
update public.places p
set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch,
    updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Duplicate and misclassification cleanup.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (1062,1438);

-- Current operational corrections found during the review.
update public.places set location='1478 Rue Sainte-Catherine E, Montréal, QC H2L 2J1, Canada',hours='Event and room-specific; verify the current programme before travel.',link='https://www.complexesky.ca/en',updated_at=timezone('utc',now()) where id=518;
update public.places set location='1171 Rue Sainte-Catherine E, Montréal, QC H2L 2G8, Canada',hours='Thu-Sat 21:30-03:00; Sun-Wed closed.',link='https://clubunity.com/',updated_at=timezone('utc',now()) where id=519;
update public.places set location='1115 Rue Sainte-Catherine E, Montréal, QC H2L 2G2, Canada',hours='Show-led evening schedule; use the current calendar for doors and performance time.',link='https://www.mado.qc.ca/',updated_at=timezone('utc',now()) where id=520;
update public.places set location='1272 Rue Sainte-Catherine E, Montréal, QC H2L 2H2, Canada',hours='Mon-Wed 15:00-01:00; Thu-Fri 15:00-03:00; Sat 13:00-03:00; Sun 13:00-01:00.',link='https://bar-renard.com/',updated_at=timezone('utc',now()) where id=521;
update public.places set location='1669 Rue Sainte-Catherine E, Montréal, QC H2L 2J5, Canada',hours='Daily 14:00-03:00; recurring drag and karaoke schedules vary.',link='https://www.barlecocktail.com/',updated_at=timezone('utc',now()) where id=522;
update public.places set location='1315 Rue Sainte-Catherine E, Montréal, QC H2L 2H4, Canada',hours='Daily 08:00-03:00; confirm event-specific programming.',link='https://www.aiglenoir.ca/',updated_at=timezone('utc',now()) where id=523;
update public.places set link='https://www.facebook.com/saunaloasis',updated_at=timezone('utc',now()) where id=524;
update public.places set hours='Open 24 hours daily.',link='https://saunagijoe.com/',updated_at=timezone('utc',now()) where id=525;
update public.places set hours='Daily 15:00-03:00.',link='https://www.districtvideolounge.com/en',updated_at=timezone('utc',now()) where id=1059;
update public.places set hours='Daily 14:00-03:00.',link='https://taverne-normandie.ca/',updated_at=timezone('utc',now()) where id=1060;
update public.places set hours='Event-specific after-hours, generally Fri/Sat after midnight; no fixed closing time.',link='https://www.stereonightclub.net/',updated_at=timezone('utc',now()) where id=1061;
update public.places set link='https://www.lestudmontreal.ca/',updated_at=timezone('utc',now()) where id=1062;
update public.places set hours='Thu-Sun 15:00-03:00; verify the selected Stock room and show time.',link='https://stockbarmontreal.com/en',updated_at=timezone('utc',now()) where id=1432;
update public.places set hours='Event-specific; ticket and door times are published per production.',link='https://www.lebelmont.ca/',updated_at=timezone('utc',now()) where id=1433;
update public.places set hours='24-hour hotel; check-in from 16:00, checkout by 12:00.',updated_at=timezone('utc',now()) where id=1434;
update public.places set hours='24-hour hotel; check-in from 16:00, checkout by 12:00.',link='https://hotelwilliamgray.com/',updated_at=timezone('utc',now()) where id=1435;
update public.places set hours='Small B&B; check-in after 14:00 by agreed arrival time, checkout before 11:00.',link='https://bbv.qc.ca/',updated_at=timezone('utc',now()) where id=1436;
update public.places set name='Piscine Maisonneuve du parc Francine-Léger',location='4350 Rue de Rouen, Montréal, QC H1V 1H1, Canada',hours='Seasonal municipal outdoor pool; first-come, first-served. Closed after 23 August 2026.',link='https://montreal.ca/lieux/piscine-maisonneuve-du-parc-francine-leger',description='A free seasonal municipal outdoor pool for neighbourhood residents, families and swimmers. This is a public aquatic facility, not a cruising venue, and the former classification was unsupported.',updated_at=timezone('utc',now()) where id=1438;
update public.places set hours='Daily 14:00-03:00.',link='https://www.lestudmontreal.ca/',updated_at=timezone('utc',now()) where id=1652;
update public.places set hours='Daily from 13:00; summer karaoke Thu-Sat from 20:00 and Sun-Wed from 21:00.',link='https://www.instagram.com/datekaraoke/',updated_at=timezone('utc',now()) where id=1653;
update public.places set link='https://www.leweiser.com/en',updated_at=timezone('utc',now()) where id=1654;
update public.places set hours='DJ and room-specific; follows the attached Renard operation.',link='https://bar-renard.com/',updated_at=timezone('utc',now()) where id=1655;
update public.places set hours='Reception 08:00-17:00; self-check-in after 17:00 by emailed instructions.',link='https://www.maison-desjardins.ca/en',updated_at=timezone('utc',now()) where id=1656;
update public.places set hours='Adults-only B&B; check-in by arrangement from 14:00, checkout by 12:00.',link='https://www.laloggia.ca/',updated_at=timezone('utc',now()) where id=1657;
update public.places set hours='24-hour hotel; check-in from 16:00, checkout by 12:00.',link='https://www.hotel10montreal.com/',updated_at=timezone('utc',now()) where id=1658;
update public.places set hours='24-hour reception; check-in from 15:00, checkout by 12:00.',link='https://www.hyatt.com/hyatt-place/en-US/yulzm-hyatt-place-montreal-downtown',updated_at=timezone('utc',now()) where id=1659;
update public.places set hours='24-hour reception; check-in from 15:00, checkout by 11:00; rooftop 08:00-22:00.',link='https://www.m-montreal.com/',updated_at=timezone('utc',now()) where id=1660;
update public.places set location='921 Rue Sainte-Catherine E, Montréal, QC H2L 2E5, Canada',hours='Daily 07:00-23:00.',link='https://ouimanon.com/pages/contact',updated_at=timezone('utc',now()) where id=1887;
update public.places set location='611 Avenue Duluth E, Montréal, QC H2L 1A9, Canada',hours='Mon-Fri 07:30-17:00; Sat-Sun 08:00-17:00; events may extend later.',link='https://www.instagram.com/cafereinegarcon/',updated_at=timezone('utc',now()) where id=1888;
update public.places set hours='Mon-Fri 10:30-16:00; Sat-Sun closed.',link='https://www.titanicmontreal.com/',updated_at=timezone('utc',now()) where id=1889;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places
  where id in (518,519,520,521,522,523,524,525,1059,1060,1061,1062,1432,1433,1434,1435,1436,1438,1652,1653,1654,1655,1656,1657,1658,1659,1660,1887,1888,1889)
    and venue_intel->>'updated_at'='2026-08-30T00:00:00Z';
  if updated_count<>30 then raise exception 'Expected 30 repaired Montreal profiles, found %',updated_count; end if;

  select count(*) into invalid_fields from public.places p
  cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
  where p.id in (518,519,520,521,522,523,524,525,1059,1060,1061,1062,1432,1433,1434,1435,1436,1438,1652,1653,1654,1655,1656,1657,1658,1659,1660,1887,1888,1889)
    and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every Montreal intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;

  select count(*) into duplicate_fields from (
    select f.key,f.value,count(*) from public.places p
    cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
    where p.id in (518,519,520,521,522,523,524,525,1059,1060,1061,1062,1432,1433,1434,1435,1436,1438,1652,1653,1654,1655,1656,1657,1658,1659,1660,1887,1888,1889)
    group by f.key,f.value having count(*)>1
  ) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate Montreal intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
