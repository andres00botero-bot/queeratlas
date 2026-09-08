-- Queer Atlas Venue Intelligence: Warsaw generic-copy repair.
-- Research rechecked 2026-08-30. Replaces generic text for exactly 21 records.
-- Smolna (ID 2007), a newer hand-written profile, is intentionally untouched.

begin;

with researched(id, profile) as (
  values
  (131, $qa${
    "queue_wait":"La Pose spans a restaurant, cocktail bar and event floors at Mazowiecka 6/8. Reserve dinner or a table; for drag, ballroom and late parties, buy the named event and use its door time. VIP reservations include queue priority, not a promise of instant entry.",
    "best_nights":"Choose the programme rather than a weekday: dinner and cocktails suit an early visit, while drag, burlesque, ballroom and DJ events activate different floors. Check La Pose's own calendar before travel because the daytime restaurant and late queer club are distinct experiences.",
    "crowd_mix":"Queer Warsaw regulars, drag and ballroom communities, mixed LGBTQ+ groups, allies and international visitors move between the dining and event spaces. A community-specific production can centre a narrower audience, so read the host's description rather than assuming every floor feels identical.",
    "dress_code":"Restaurant smart casual works early; expressive queer fashion, drag and dance-ready clothing fit programmed nights. No permanent costume rule applies. Carry photo ID for late entry and dress for stairs and multiple floors rather than a single seated bar.",
    "staff_inclusivity":"La Pose explicitly operates as an LGBTQ+ venue and gives guests restaurant, event and VIP contacts. Hosts, security and floor managers are identifiable escalation routes; raise misgendering, harassment or access needs with the duty team instead of relying on the safe-space label alone.",
    "source_urls":["https://lapose.pl/","https://lapose.pl/vip/","https://gay.pl/miejsca/miasto/warszawa"]
  }$qa$::jsonb),
  (132, $qa${
    "queue_wait":"Metropolis operates Friday and Saturday nights at Sienkiewicza 7, normally from about 23:00. The central three-floor club is busiest after midnight; arrive near opening, bring physical photo ID and check the current event post for cover, age and last entry.",
    "best_nights":"Friday and Saturday are the actual operating nights. Select by the club's current drag, pop or dance announcement rather than treating them as interchangeable; an earlier queer bar suits conversation, while Metropolis is the late dancing stop.",
    "crowd_mix":"Gay men, lesbians, trans and non-binary guests, mixed queer friendship groups and visitors share a mainstream LGBTQ+ club crowd. Music and host can shift the age and gender balance between floors; this is broader than a men-only dance venue.",
    "dress_code":"Polished club casual, pop-night outfits and expressive queer looks fit. There is no verified fetish code. Use comfortable shoes for several floors, keep bags compact and carry accepted ID; the door decision should be based on age and conduct, not conformity.",
    "staff_inclusivity":"Metropolis is listed in Warsaw's current LGBTQ+ venue directory and programmes queer nightlife rather than merely accepting queer guests. Door and floor staff provide an escalation route, but no detailed accessibility or trans-admission policy is published; contact the club before travel for a specific need.",
    "source_urls":["https://gay.pl/miejsca/miasto/warszawa","https://www.instagram.com/metropoliswarsaw/"]
  }$qa$::jsonb),
  (133, $qa${
    "queue_wait":"Ramona is a compact bar at Widok 18/1, not the translated Marszałkowska address. Ordinary afternoons are walk-in; drag bingo, live music and Friday/Saturday late service can fill seats. Reserve through the official site when seeing the stage or keeping a group together matters.",
    "best_nights":"Use Ramona's weekly programme: drag bingo, drag shows and live music produce different rooms. Sunday through Thursday is better for conversation; Friday and Saturday continue to 04:00 and bring the fullest bar atmosphere.",
    "crowd_mix":"LGBTQ+ Warsaw locals, drag audiences, friends, dates and tourists form a mixed community-bar crowd. Earlier hours span more ages and support conversation; weekend performances and late drinks add first-time visitors and a denser standing audience.",
    "dress_code":"Everyday café-bar clothing, date-night smart casual and full drag are all appropriate. There is no formal fashion gate. Carry ID for late service and avoid bulky bags when a performance compresses the small central room.",
    "staff_inclusivity":"Ramona's recurring queer performers and direct booking/contact channels make inclusion part of the operation. Current guest reports are mixed on service, so bring a concrete problem to the floor manager; a queer programme does not make dismissive treatment acceptable.",
    "source_urls":["https://www.ramonabar.pl/","https://gay.pl/miejsca/miasto/warszawa"]
  }$qa$::jsonb),
  (134, $qa${
    "queue_wait":"Heaven Sauna uses reception at Waliców 13. Current listings show afternoon-to-late-night weekday operation, with weekend availability needing direct confirmation. Call before travelling, bring cash/card options and photo ID, and ask whether re-entry or a time limit applies before paying.",
    "best_nights":"A weekday afternoon is the safest verified window and calmer for a first visit; later hours bring more after-work traffic. Do not rely on the database's old daily schedule because current sources conflict about weekend opening.",
    "crowd_mix":"Adult gay and bisexual men, Warsaw regulars and visitors use this men-focused sauna. Age and body mix changes by hour, but no reliable themed-day calendar was found; do not promise a specific crowd from an old directory entry.",
    "dress_code":"Store street clothes in the assigned locker and follow reception's towel and footwear rules. Keep phones away from intimate areas, secure valuables and treat every interaction as consent-dependent; sauna admission never implies access to another guest.",
    "staff_inclusivity":"Heaven participates in the PLUG health partnership network, giving reception a concrete link to HIV/STI prevention information. Inclusion is gay-men-focused rather than all-gender; ask before paying about trans admission, mobility access and any current safer-sex supplies.",
    "source_urls":["https://heavensauna.pl/","https://plug.org.pl/en/partners/","https://gay.pl/miejsca/miasto/warszawa"]
  }$qa$::jsonb),
  (275, $qa${
    "queue_wait":"Plan B is upstairs at Wyzwolenia 18 overlooking Plac Zbawiciela, not Warecka. It is walk-in, with stairs and limited window tables; Friday/Saturday pressure builds from late evening. Arrive before 21:00 for seating and expect bar-service waits after midnight.",
    "best_nights":"Use an afternoon or weekday for affordable drinks and local conversation; Friday/Saturday run later and turn the stairwell room and square-facing edge into a dense social stop. It is an alternative mixed bar, not a programmed gay club.",
    "crowd_mix":"Students, creatives, neighbourhood regulars, queer guests, allies and visitors share an alternative Warsaw crowd. LGBTQ+ people are visible but not the sole audience, so choose a dedicated queer venue when identity-centred hosting or programming is the priority.",
    "dress_code":"Casual Warsaw barwear, vintage clothing and everyday layers fit; there is no club-fashion gate. Dress for the stairs, a crowded interior and possible outdoor overflow on the square. Photo ID may still be useful for late alcohol service.",
    "staff_inclusivity":"Plan B has a long inclusive reputation but does not publish a detailed queer conduct, access or staff-training policy. Treat it as queer-friendly mixed hospitality: report harassment to the bartender or duty lead and do not convert community popularity into a guaranteed support protocol.",
    "source_urls":["https://tablejourney.com/poland/warsaw/nightlife/klub-plan-b/","https://go2warsaw.pl/wp-content/uploads/mapa-USE-IT-Warsaw-2025_do-druku.pdf"]
  }$qa$::jsonb),
  (276, $qa${
    "queue_wait":"Jasna 1 is at Jasna 1 and works entirely by event. Buy the named ticket, follow its door and last-entry times, bring physical ID and prepare for security checks. Major techno bookings build a late line; arriving near doors is more reliable than appearing at peak hour.",
    "best_nights":"Follow the lineup: house, techno and queer-centred collaborations draw different communities. There is no useful generic best weekday. The event page is essential for age, timetable, tickets and whether the night aligns with Queer Atlas users.",
    "crowd_mix":"Warsaw electronic-music regulars, international ravers and mixed queer-friendly audiences attend, with identity balance determined by promoter. Jasna 1 is not permanently a gay club; explicit queer events offer stronger community centring than an ordinary techno booking.",
    "dress_code":"Practical, individual dancewear and comfortable shoes suit the industrial rooms. A no-photo approach protects the floor; keep bags small and read the event rules. There is no evidence that costume or fetish wear is required for ordinary nights.",
    "staff_inclusivity":"Jasna 1 publishes zero tolerance for racism, sexism, homophobia and transphobia and identifies an awareness team in bright blue. That creates a specific reporting route: find awareness staff or security immediately for harassment, distress or unsafe behaviour.",
    "source_urls":["https://jasna1.com/","https://jasna1.com/event/j1-derschein-lucinee-budzko-ilya-gurin-babayeu-raketka-xim/"]
  }$qa$::jsonb),
  (277, $qa${
    "queue_wait":"Pogłos closed in September 2022 and the Burakowska 12 building was later demolished. There is no current queue, ticket or address to use. Do not travel to the database's Zimna 2 location or buy from an unofficial page using the former name.",
    "best_nights":"No present night exists. Historical concerts and queer community events explain why Pogłos belongs in the archive, but recommendations must point to current Warsaw programmes rather than inventing continuity after closure.",
    "crowd_mix":"The former venue supported independent music, activist and queer communities, but it has no current audience. That history must not be transferred to a similarly named event or replacement space without a verified operator.",
    "dress_code":"No current door or clothing policy applies. Use the rules of whichever active venue hosts a former Pogłos collective or related event; archived photos are not guidance for a 2026 visit.",
    "staff_inclusivity":"There is no active Pogłos staff team to assess or contact. Deindexing is the responsible inclusion decision because presenting a closed venue as staffed creates a false safety and escalation promise.",
    "source_urls":["https://warszawa.naszemiasto.pl/klub-poglos-przestal-istniec-kultowe-miejsce-na-koncertowej/ar/c13-9038791","https://um.warszawa.pl/documents/46187514/93088346/EN_map%2Bwarsaw%2Bsafer%2Bspaces.pdf/be19371f-e372-d774-4e82-7e6810879544?t=1741252671234"]
  }$qa$::jsonb),
  (278, $qa${
    "queue_wait":"No reliable current operator, official address or 2026 schedule could be verified for Toro Sauna. Do not travel from this record or treat historical opening hours as live. Keep it deindexed until a primary venue channel and recent independent listing agree.",
    "best_nights":"There is no defensible current best time. Choose an active Warsaw sauna with a verified reception and schedule; an old directory mention is not enough to predict lockers, themed periods or last admission.",
    "crowd_mix":"No current audience can be described responsibly. Historic men-only positioning does not prove who is served now, whether the business moved or whether another operator uses the name.",
    "dress_code":"No verified house rules exist. Do not infer towel, nudity, footwear, phone or consent procedures from another sauna; those rules must come from Toro's own current reception before reactivation.",
    "staff_inclusivity":"No current staff, health partnership or incident-reporting route was found. The absence of an accountable operator is itself a safety finding, so this record must not promise LGBTQ+ inclusion or support.",
    "source_urls":["https://gay.pl/miejsca/miasto/warszawa","https://plug.org.pl/en/partners/"]
  }$qa$::jsonb),
  (279, $qa${
    "queue_wait":"Glam operates at Żurawia 22, with current listings showing Wednesday plus Friday/Saturday from around 22:00. Queer events can be cash-only and busiest after midnight; check the latest club post, bring physical ID and carry a payment fallback.",
    "best_nights":"Wednesday is typically the smaller midweek option; Friday/Saturday offer the full pop, house and commercial club format. Promoter-led queer electronic events can differ sharply, so use the actual poster for lineup, cover and closing time.",
    "crowd_mix":"Gay men, lesbians, trans and non-binary clubbers, drag and performance circles, allies and visitors create a mixed LGBTQ+ dance crowd. A niche promoter can alter the balance; the venue is more community-specific than an ordinary Warsaw superclub.",
    "dress_code":"Expressive queer clubwear, pop-night polish and comfortable dance clothing all fit. No permanent fetish code is documented. Bring ID, minimise bags and check whether the promoter requests a theme; cash-only entry has appeared on current events.",
    "staff_inclusivity":"Glam remains in current Warsaw LGBTQ+ listings and hosts explicitly queer lineups, so inclusion is operational rather than inferred. Door and floor staff are the immediate reporting route; no detailed access policy is published, so contact the venue ahead for mobility or companion needs.",
    "source_urls":["https://pl.ra.co/events/2403454","https://gay.pl/miejsca/miasto/warszawa","https://www.facebook.com/GLAMCLUBWARSAW/"]
  }$qa$::jsonb),
  (280, $qa${
    "queue_wait":"Club Galeria's old plac Mirowski 1 listings conflict with closure reports, and its former web domain no longer provides trustworthy venue information. Do not travel, queue or pay through that site; retain the record only as deindexed history pending primary proof of reopening.",
    "best_nights":"No 2026 programme is reliably verified. Archived drag, karaoke and dance schedules must not be presented as current, and a generic nightlife directory's hours are insufficient to reactivate a club.",
    "crowd_mix":"The historical venue served LGBTQ+ dance and drag audiences, but there is no present crowd to describe. A future operator at the address must establish its own community identity and safety record.",
    "dress_code":"No active door brief exists. Ignore archived Top 40 club advice and follow the rules of a verified current Warsaw venue instead; historical branding does not validate admission in 2026.",
    "staff_inclusivity":"No accountable current management, security or welfare contact could be verified. Deindexing prevents a closed or dormant brand from making a false promise that staff are available to handle harassment or access needs.",
    "source_urls":["https://gay.pl/miejsca/miasto/warszawa","https://um.warszawa.pl/documents/46187514/93088346/EN_map%2Bwarsaw%2Bsafer%2Bspaces.pdf/be19371f-e372-d774-4e82-7e6810879544?t=1741252671234"]
  }$qa$::jsonb),
  (281, $qa${
    "queue_wait":"Chmury is an event-led independent venue at 11 Listopada 22 in Praga. Buy the named concert or party and use its doors; sold-out shows and cloakroom traffic create the wait. Do not rely on generic bar hours or the database's translated address.",
    "best_nights":"Choose the artist, collective or party. Concerts, cultural events and electronic nights attract different rooms, and queer relevance comes from the host rather than every date. The live ticket calendar extends through late 2026.",
    "crowd_mix":"Independent-music listeners, Praga creatives, students, queer-friendly groups and international artists make a mixed culture-led crowd. Explicit queer events centre LGBTQ+ guests; ordinary concerts should not be labelled gay by association.",
    "dress_code":"Casual concert clothing, alternative style and practical dancewear fit, with no permanent fashion gate. Dress for standing, loud sound and seasonal courtyard movement; the selected event may publish its own age or bag rules.",
    "staff_inclusivity":"Chmury is a mixed venue rather than an LGBTQ+ institution, so inclusion depends partly on the promoter. Ticket and venue staff provide incident escalation, but verify a named queer host or policy when identity-centred support is important.",
    "source_urls":["https://www.ticketmaster.pl/venue/chmury-warsaw-tickets/chm/101?language=en-us","https://www.facebook.com/chmurywarszawa/"]
  }$qa$::jsonb),
  (282, $qa${
    "queue_wait":"Lodi Dodi is a compact gay cocktail bar at Wilcza 23. It is usually walk-in; Friday/Saturday seating and bar service tighten after 21:00. Arrive early for conversation, and contact the venue for groups rather than expecting a reserved table from a message alone.",
    "best_nights":"Sunday through Thursday suits cocktails and conversation; Friday/Saturday continue to 03:00 and become the fuller social bar. Check official posts for one-off performances or parties, because it is not a large nightly dance club.",
    "crowd_mix":"Gay men are central, joined by broader LGBTQ+ friends, dates, Warsaw regulars and visitors. Early evening spans ages and is conversational; weekend late hours become denser and more male-skewed without operating as a men-only venue.",
    "dress_code":"Smart casual, date-night clothing and expressive queer style fit; no formal code is published. Choose comfortable footwear and small bags for the intimate room. The polished cocktails do not require formalwear.",
    "staff_inclusivity":"Lodi Dodi publicly identifies as a gay/LGBTQ+ bar and provides direct contact, making the bar team accountable for community conduct. Current accessibility listings indicate no wheelchair access, so contact staff before travel rather than discovering the physical barrier at the door.",
    "source_urls":["https://lodidodi.pl/","https://gay.pl/miejsca/miasto/warszawa"]
  }$qa$::jsonb),
  (1843, $qa${
    "queue_wait":"LAMPA is documented as a party or collective using host venues, not a dependable club at Solec 81B. Follow the organiser's dated event and the host venue's ticket, door and capacity rules; there is no permanent LAMPA queue to predict.",
    "best_nights":"Only attend a newly announced LAMPA event with a confirmed 2026 date and host address. Old Mastak-era listings are historical and cannot establish a recurring night, opening schedule or current venue identity.",
    "crowd_mix":"Past LAMPA events drew queer and alternative dance communities, but each host and lineup determines the present audience. Do not transfer the crowd or safety reputation of a previous edition to an unverified future location.",
    "dress_code":"Use the named event's brief and its host venue's rules. No permanent dress code belongs to this record; archived party imagery may inspire a look but cannot define ID, search or admission policy.",
    "staff_inclusivity":"Responsibility sits with the current promoter and host venue, neither of which is verified for this fixed-place record. Keep it deindexed until an event supplies named contacts, conduct rules and a real escalation route.",
    "source_urls":["https://um.warszawa.pl/documents/46187514/93088346/EN_map%2Bwarsaw%2Bsafer%2Bspaces.pdf/be19371f-e372-d774-4e82-7e6810879544?t=1741252671234","https://gay.pl/miejsca/miasto/warszawa"]
  }$qa$::jsonb),
  (1844, $qa${
    "queue_wait":"El Koktel is a reservation-led cocktail bar at Wojciecha Górskiego 9. The hidden, small-format room has finite seats, so book Friday/Saturday and arrive at the reserved time; it is not a walk-up queer club with a predictable late door line.",
    "best_nights":"Choose an early weekday for bartender interaction and a calmer tasting, or reserve a weekend for the fullest atmosphere. The product is craft cocktails, not recurring LGBTQ+ programming; pair it with a dedicated queer venue if community is the goal.",
    "crowd_mix":"Cocktail enthusiasts, dates, hospitality visitors and international travellers form a mainstream mixed audience. Queer guests may feel comfortable, but no current source supports describing the venue as community-owned or identity-centred.",
    "dress_code":"Smart casual and polished date-night clothing fit the intimate speakeasy style, though no formal code is published. Avoid large bags and strong perfume when seated close to others; ordinary respectful clothing should be sufficient.",
    "staff_inclusivity":"Staff provide table service and a reservation contact, but no venue-specific LGBTQ+ training or conduct policy was found. Use the floor lead for misgendering or harassment, and do not present general hospitality professionalism as verified queer expertise.",
    "source_urls":["https://dineout.pl/en/restaurants/el-koktel","https://www.instagram.com/elkoktel/"]
  }$qa$::jsonb),
  (1845, $qa${
    "queue_wait":"The Fire uses reception at Twarda 44. Confirm same-day hours through the official channel because current public schedules are incomplete; bring photo ID, ask the price and last admission before travel, and clarify whether the entry permits re-entry.",
    "best_nights":"Use a current official post for themes or discounts; without one, an earlier session is calmer and late evening more social. Do not copy Heaven Sauna's schedule or audience onto The Fire merely because both serve gay men.",
    "crowd_mix":"Adult gay and bisexual men, Warsaw locals and visitors use the sauna-and-bar format. No reliable current age-specific event calendar was verified, so the profile avoids promising bears, younger guests or a particular body mix on any weekday.",
    "dress_code":"Ask The Fire desk what is supplied before changing; use the assigned locker and suitable wet-floor footwear. Leave camera use outside private zones, and treat the bar, sauna and any quieter area as separate consent contexts rather than one blanket permission.",
    "staff_inclusivity":"The Fire publishes a dedicated venue identity, address and direct social contact, so reception is the accountable route for hygiene, consent or service problems. No detailed trans-admission or mobility policy was found; ask those questions before paying.",
    "source_urls":["https://www.instagram.com/saunathefire/","https://gay.pl/miejsca/miasto/warszawa","https://lgbtfestival.pl/wp-content/uploads/2022/04/13_LGBTFF_2022_folder_www.pdf"]
  }$qa$::jsonb),
  (1846, $qa${
    "queue_wait":"Butero sits inside the courtyard at Bracka 3 under a rainbow neon. The small room is popular for dinner and weekend lunch; reserve through the official site, especially Friday/Saturday, and allow time to find the gate rather than waiting on the street frontage.",
    "best_nights":"Tuesday–Friday dinner brings the queer bistro at full character; Saturday and Sunday lunch are better for a relaxed meal. Named community events can change seating and noise, so book that programme rather than assuming ordinary restaurant service.",
    "crowd_mix":"Queer Warsaw locals, LGBTQ+ visitors, friends, dates and allies share a deliberately community-facing restaurant. Vegan and vegetarian options broaden the table mix; the space is queer-centred but explicitly welcomes everyone.",
    "dress_code":"Casual restaurant clothes, date-night smart casual and expressive queer style all fit. There is no door code. Dress for a courtyard walk and seated food-sharing; elaborate looks are welcome but not required.",
    "staff_inclusivity":"Butero calls itself a queer safe space, is run by queer people and hosts community initiatives; Warsaw's safer-spaces research confirms that operational role while noting experiences are not universally identical. Bring concerns to the floor manager and specify access needs when booking.",
    "source_urls":["https://butero.pl/","https://butero.localo.site/","https://um.warszawa.pl/documents/46187514/93088346/EN_map%2Bwarsaw%2Bsafer%2Bspaces.pdf/be19371f-e372-d774-4e82-7e6810879544?t=1741252671234"]
  }$qa$::jsonb),
  (1847, $qa${
    "queue_wait":"Miau Grau is a reservable cat café at Kolejowa 47/U21, not an LGBTQ+ nightlife venue. Book a timed table for weekends, follow the café's child and animal rules, and arrive punctually; capacity protects the cats as well as guest comfort.",
    "best_nights":"Visit during café hours for cats, drinks and a quiet break; there is no verified recurring queer night. Weekday daytime is calmer, while weekend reservations suit planned visits but may have more families.",
    "crowd_mix":"Cat lovers, families, couples, tourists and local café guests form a mainstream mixed audience. Queer visitors are customers, not a programmed community, so this listing should never imply that other guests share an LGBTQ+ identity.",
    "dress_code":"Ordinary clean café clothing is appropriate. Avoid scents or accessories that could disturb animals, follow staff instructions and do not pick up cats without permission. This is animal-care etiquette, not a nightlife dress policy.",
    "staff_inclusivity":"Staff expertise is cat welfare and hospitality; no current property-specific LGBTQ+ training statement was verified. Use the café manager for disrespectful treatment, and contact ahead for mobility, sensory or animal-allergy questions.",
    "source_urls":["https://www.miaugrau.pl/","https://www.instagram.com/miaugrau/"]
  }$qa$::jsonb),
  (1848, $qa${
    "queue_wait":"H15 has staffed hotel reception and scheduled check-in, so the likely wait is afternoon room turnover rather than nightlife. Put the exact room and access request on the reservation, and use luggage storage if confirmed for an early arrival.",
    "best_nights":"Stay for a boutique central base near Śródmieście dining and queer nightlife, not for an in-house LGBTQ+ programme. Weekend dates increase leisure demand; weekdays can be calmer but conference or event periods still change reception pressure.",
    "crowd_mix":"International leisure guests, couples, business travellers and LGBTQ+ city visitors form an upscale mainstream hotel audience. Proximity to queer venues is useful, but the property should not be described as a community hub.",
    "dress_code":"No reception dress code applies. Travel wear is valid; smart casual suits the restaurant or bar, and outside clubs set their own ID and outfit rules. Select luggage for the booked room rather than for a fictional hotel party.",
    "staff_inclusivity":"A managed hotel provides reception and management escalation, but no property-specific queer training or trans-inclusion standard was verified. Record chosen name, partner treatment and access needs in writing before arrival and address any mismatch with the duty manager.",
    "source_urls":["https://www.hotelh15boutique.pl/en","https://www.marriott.com/en-us/hotels/wawhf-h15-boutique-hotel-warsaw-a-member-of-design-hotels/overview/"]
  }$qa$::jsonb),
  (1849, $qa${
    "queue_wait":"Polonia Palace is a large central hotel with 24-hour reception; the pressure point is normal afternoon check-in and group turnover. Bring booking ID, confirm luggage storage and request the exact accessible-room feature rather than relying on a generic room label.",
    "best_nights":"Use it for Centrum transport, sightseeing and access to Warsaw nightlife, not queer events inside the hotel. Weekends support leisure travel, while weekdays can bring business groups; choose dates and room position for price and street noise.",
    "crowd_mix":"Tourists, business guests, groups, couples and LGBTQ+ travellers share a mainstream historic hotel. Its central location does not make the lobby a queer social space or establish an LGBTQ+ audience on any night.",
    "dress_code":"Ordinary travel clothing is accepted at reception; smart casual is useful for hotel dining. Carry separate nightlife clothing and photo ID for external venues. There is no basis for a hotel-specific queer dress recommendation.",
    "staff_inclusivity":"The hotel has staffed reception and formal management channels, but no current property-level LGBTQ+ certification or detailed trans policy was found. Add chosen name, couple bed setup and access requirements to the booking, then escalate failures immediately.",
    "source_urls":["https://www.poloniapalace.com/","https://www.poloniapalace.com/contact"]
  }$qa$::jsonb),
  (1850, $qa${
    "queue_wait":"PURO Warszawa Centrum uses hotel reception and digital guest services; peak check-in, not a club line, is the relevant wait. Confirm early bag drop, parking and an accessible room before arrival, especially when travelling for a major Warsaw event.",
    "best_nights":"Choose PURO as a design-led central base for restaurants, culture and nearby queer venues. Friday/Saturday maximise going-out convenience; weekdays can suit work and museums. Any hotel event must be verified separately from accommodation hours.",
    "crowd_mix":"Design-conscious tourists, couples, business travellers, solo guests and LGBTQ+ visitors form a mainstream boutique-hotel mix. Queer-friendly city positioning should not be converted into a claim that the property is queer-owned or community-programmed.",
    "dress_code":"There is no reception dress rule. Contemporary casual fits the property, while the bar or external clubs may call for smarter clothing and ID. Keep travel and nightlife requirements separate.",
    "staff_inclusivity":"PURO provides professional reception and management routes, yet no current property-specific LGBTQ+ training statement was verified. Put chosen name, partner, pronoun and mobility needs in the reservation notes and ask the duty manager to correct service failures.",
    "source_urls":["https://purohotel.pl/en/warsaw/","https://purohotel.pl/en/contact/"]
  }$qa$::jsonb),
  (1851, $qa${
    "queue_wait":"This record describes public Vistula riverbanks, not a staffed venue. There is no door, ticket or managed queue. Popular summer sections can be crowded, but never use remoteness or low footfall as a promise of privacy.",
    "best_nights":"Visit in daylight or busy early evening for the river landscape, paths and seasonal social atmosphere. Do not recommend a cruising hour or secluded route; lighting, water conditions, policing and public use can change without notice.",
    "crowd_mix":"Walkers, cyclists, families, tourists, nightlife groups and queer residents share public space. No one present should be presumed LGBTQ+, interested in contact or part of a venue community.",
    "dress_code":"Wear weather-appropriate clothes and footwear for sand, paths and river edges. Public-decency law, consent and other visitors' privacy always apply; do not frame swimwear, nudity or nightlife clothing as an invitation.",
    "staff_inclusivity":"There is no venue staff or dedicated queer welfare team. Use city emergency services, nearby staffed businesses or trusted friends for help, and avoid presenting an unmonitored public landscape as an inclusive managed safe space.",
    "source_urls":["https://go2warsaw.pl/visiting-the-vistula-river/","https://um.warszawa.pl/"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id in (277,280) then jsonb_build_object('operating_status','closed_or_dormant_deindexed')
       when id in (278,1843) then jsonb_build_object('operating_status','current_operation_or_fixed_location_unverified')
       when id in (276,281) then jsonb_build_object('operating_status','active_event_led_mainstream_venue')
       when id in (1844,1847) then jsonb_build_object('operating_status','active_mainstream_hospitality')
       when id in (1848,1849,1850) then jsonb_build_object('operating_status','active_mainstream_accommodation')
       when id=1851 then jsonb_build_object('operating_status','public_space_not_managed_venue')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence',jsonb_build_object(
      'queue_wait',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'best_nights',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'crowd_mix',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'dress_code',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'staff_inclusivity',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'updated_at','2026-08-30T00:00:00Z'
  ) as patch from researched
)
update public.places p set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch,updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Closed, unverifiable, organizer-only and public-space records must not remain indexed as venues.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (277,278,280,1843,1851);

-- Operational and classification corrections verified during this review.
update public.places set location='Mazowiecka 6/8, 00-048 Warsaw, Poland',link='https://lapose.pl/',hours='Restaurant and event-led; verify the current programme and reservation hours.',updated_at=timezone('utc',now()) where id=131;
update public.places set location='Henryka Sienkiewicza 7, 00-015 Warsaw, Poland',hours='Fri-Sat approximately 23:00-06:00; verify the current event.',updated_at=timezone('utc',now()) where id=132;
update public.places set location='Widok 18/1, 00-023 Warsaw, Poland',link='https://www.ramonabar.pl/',hours='Sun-Mon 16:00-00:00; Tue-Thu 16:00-01:00; Fri-Sat 16:00-04:00.',updated_at=timezone('utc',now()) where id=133;
update public.places set location='Waliców 13, 00-865 Warsaw, Poland',link='https://heavensauna.pl/',hours='Current public schedules conflict; confirm directly before travel.',updated_at=timezone('utc',now()) where id=134;
update public.places set location='Aleja Wyzwolenia 18, 00-570 Warsaw, Poland',type='bar',hours='Sun-Thu approximately 14:00-02:00; Fri-Sat 14:00-04:00; verify locally.',updated_at=timezone('utc',now()) where id=275;
update public.places set location='Jasna 1, 00-013 Warsaw, Poland',link='https://jasna1.com/',hours='Event-specific; use the ticket for doors, age and last entry.',updated_at=timezone('utc',now()) where id=276;
update public.places set location='Burakowska 12, Warsaw, Poland',hours='Permanently closed in September 2022; former building demolished.',description='Historical record for Pogłos, the independent music and community venue that closed in September 2022. This is not a current destination.',updated_at=timezone('utc',now()) where id=277;
update public.places set hours='Current operation, operator and location unverified; do not travel from this listing.',description='Deindexed historical sauna record. No reliable primary operator channel or current Warsaw listing could be verified in August 2026.',updated_at=timezone('utc',now()) where id=278;
update public.places set location='Żurawia 22, 00-515 Warsaw, Poland',hours='Wed approximately 22:00-05:00; Fri-Sat 22:00-06:00; verify current event.',updated_at=timezone('utc',now()) where id=279;
update public.places set location='plac Mirowski 1, Warsaw, Poland',hours='Closed or dormant; no trustworthy 2026 programme or operator verified.',description='Deindexed historical queer-club record. Archived listings conflict with current closure evidence and the former website is not reliable venue proof.',updated_at=timezone('utc',now()) where id=280;
update public.places set location='11 Listopada 22, 03-436 Warsaw, Poland',hours='Event-specific; use the current ticket listing for doors and age.',link='https://www.facebook.com/chmurywarszawa/',updated_at=timezone('utc',now()) where id=281;
update public.places set location='Wilcza 23, 00-544 Warsaw, Poland',link='https://lodidodi.pl/',hours='Sun-Thu 19:00-01:00; Fri-Sat 19:00-03:00.',updated_at=timezone('utc',now()) where id=282;
update public.places set hours='Event series without a verified permanent venue; use a newly dated organiser announcement.',description='Historical event-series record, not a verified fixed venue at Solec 81B. Keep deindexed until a current organiser and host location are confirmed.',updated_at=timezone('utc',now()) where id=1843;
update public.places set location='Wojciecha Górskiego 9, 00-033 Warsaw, Poland',type='bar',link='https://www.instagram.com/elkoktel/',hours='Reservation-led cocktail service; verify current hours when booking.',updated_at=timezone('utc',now()) where id=1844;
update public.places set location='Twarda 44, 00-831 Warsaw, Poland',link='https://www.instagram.com/saunathefire/',hours='Confirm current hours and last admission directly before travel.',updated_at=timezone('utc',now()) where id=1845;
update public.places set location='Bracka 3, 00-501 Warsaw, Poland',link='https://butero.pl/',hours='Tue-Fri 16:00-23:00; Sat 12:00-23:00; Sun 12:00-21:00; Mon closed.',updated_at=timezone('utc',now()) where id=1846;
update public.places set location='Kolejowa 47/U21, 01-210 Warsaw, Poland',type='cafe',link='https://www.miaugrau.pl/',hours='Reservation-led cat café; verify the current timed-entry schedule.',updated_at=timezone('utc',now()) where id=1847;
update public.places set type='hotel',link='https://www.hotelh15boutique.pl/en',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1848;
update public.places set type='hotel',link='https://www.poloniapalace.com/',hours='24-hour reception; confirm current check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1849;
update public.places set type='hotel',link='https://purohotel.pl/en/warsaw/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1850;
update public.places set hours='Public river landscape; no managed venue hours, staff or admission.',description='Public Vistula riverbank and beach context, not a managed queer venue. Visit as shared public space and do not infer consent, privacy or LGBTQ+ identity from other users.',updated_at=timezone('utc',now()) where id=1851;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places where id in (131,132,133,134,275,276,277,278,279,280,281,282,1843,1844,1845,1846,1847,1848,1849,1850,1851) and venue_intel->>'updated_at'='2026-08-30T00:00:00Z';
  if updated_count<>21 then raise exception 'Expected 21 repaired Warsaw profiles, found %',updated_count; end if;
  select count(*) into invalid_fields from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (131,132,133,134,275,276,277,278,279,280,281,282,1843,1844,1845,1846,1847,1848,1849,1850,1851) and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every Warsaw intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;
  select count(*) into duplicate_fields from (select f.key,f.value,count(*) from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (131,132,133,134,275,276,277,278,279,280,281,282,1843,1844,1845,1846,1847,1848,1849,1850,1851) group by f.key,f.value having count(*)>1) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate Warsaw intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
