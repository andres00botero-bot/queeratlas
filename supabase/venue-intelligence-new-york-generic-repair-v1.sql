-- Queer Atlas Venue Intelligence: New York generic-copy repair.
-- Research rechecked 2026-08-29. Replaces generic text for exactly 31 places
-- and records operational corrections found during the venue-by-venue review.

begin;

with researched(id, profile) as (
  values
  (568, $qa${
    "queue_wait": "Julius’ is normally a walk-in historic bar, not a selector-door club. The small room and grill tighten after work, on Mattachine parties and around the April Sip-In anniversary; arrive before the event start if you want a table rather than standing room.",
    "best_nights": "Choose an early evening for burgers, conversation and the landmark interior. Mattachine nights bring dancing and a more produced queer-history crowd; the annual Sip-In commemoration is the clearest heritage visit, but confirm its dated programme first.",
    "crowd_mix": "West Village regulars, older gay men, queer history visitors and younger LGBTQ+ groups share a bar whose community role predates Stonewall. Event nights broaden the ages and gender mix; ordinary afternoons feel especially local and conversational.",
    "dress_code": "There is no dress test. Denim, work clothes, leather details, tourist layers and a smarter date-night shirt all fit the unpolished historic room. Wear something comfortable for a tight bar and possible standing, not a costume for a landmark.",
    "staff_inclusivity": "Its 1966 Sip-In challenged the refusal of service to gay people, and the present bar actively hosts LGBTQ+ heritage and Mattachine events. That history is real inclusion evidence; at packed commemorations, expect brisk bar service rather than museum-style interpretation.",
    "source_urls": ["https://juliusbarnyc.com/", "https://www.nps.gov/articles/000/julius-sip-in.htm", "https://www.nyclgbtsites.org/site/julius/"]
  }$qa$::jsonb),
  (569, $qa${
    "queue_wait": "Ticketed ballroom and weekend events can sell out and create a security line; an ordinary bar visit is much easier. Buy the named event in advance and arrive near doors for coat check and orientation in this large warehouse-style space.",
    "best_nights": "Let the calendar choose the visit: OTA ballroom, drag, queer dance parties and community benefits each create a different room. A headline Friday or Saturday is biggest; earlier bar hours suit guests who want the Brooklyn venue without a full-scale party.",
    "crowd_mix": "This is a broad Brooklyn LGBTQ+ venue rather than a single-scene gay club. Ballroom nights centre queer and trans people of colour; other editions mix drag audiences, club kids, local friend groups and visitors across its indoor and outdoor areas.",
    "dress_code": "Check the event artwork. Ballroom and themed parties reward a category-ready or expressive look, while ordinary nights accept casual streetwear. Comfortable shoes and a light layer make sense in the large, active space; there is no universal costume code.",
    "staff_inclusivity": "3 Dollar Bill explicitly centres queer identity, and its OTA ballroom programme works with HIV prevention, mental-health and harm-reduction partners. Inclusion is event-specific in practice, so use the named host or security team immediately for consent or access concerns.",
    "source_urls": ["https://www.3dollarbillbk.com/", "https://www.otaweekly.com/", "https://www.instagram.com/3dollarbillbk/"]
  }$qa$::jsonb),
  (570, $qa${
    "queue_wait": "Hardware opens at 2pm daily and is simplest before the nightly show crowd. The narrow Hell’s Kitchen room compresses around drag and weekend DJ sets; arriving before showtime improves sightlines and bar access more than joining late at peak.",
    "best_nights": "Nightly drag makes the performer schedule more useful than a generic weekend rule. Pick a queen you want to see and arrive early; a weekday afternoon or early happy hour gives the gay-owned bar’s friendlier conversational version.",
    "crowd_mix": "Gay men and Hell’s Kitchen regulars form the base, joined by drag audiences, tourists and mixed LGBTQ+ friend groups. The room becomes younger and more visitor-heavy around late shows while afternoons retain a neighbourhood-bar feel.",
    "dress_code": "Casual gay-bar clothes work: jeans, a fitted tee, trainers or a brighter drag-night look. There is no published fashion door. Dress for a warm, packed room and standing through a show rather than for a formal club threshold.",
    "staff_inclusivity": "Hardware is gay-owned and operated and books queer drag artists every night. Current accounts range from a sweet, no-judgment welcome to complaints about individual bartenders, so inclusion is structurally clear but service tone is not uniformly praised.",
    "source_urls": ["https://hardwarebar.com/", "https://www.instagram.com/hardwarebarnyc/", "https://wanderlog.com/place/details/438017/hardware-bar"]
  }$qa$::jsonb),
  (571, $qa${
    "queue_wait": "The downstairs bar is usually accessible earlier, but Pride, commemorations and headline weekend sets can put a real line on Christopher Street. Come near the 1pm weekend or 2pm weekday opening for history; pre-event arrival is essential for upstairs shows.",
    "best_nights": "Use the current calendar: piano, karaoke, drag and dance parties occupy different floors and audiences. Daytime gives space to absorb the landmark; Friday and Saturday run louder and later, while Pride programming is meaningful but exceptionally crowded.",
    "crowd_mix": "LGBTQ+ visitors from around the world mix with West Village regulars, gay men, lesbians, trans guests, allies and queer-history pilgrims. The landmark status makes it more tourist-facing than many neighbourhood bars, especially in Pride season.",
    "dress_code": "No universal code: sightseeing clothes, denim, drag-night sparkle and smart-casual date looks all appear. Wear shoes for stairs and standing if following an upstairs programme; an event theme is an invitation, not the venue’s everyday admission rule.",
    "staff_inclusivity": "The Inn publicly frames itself as a community where everyone belongs and maintains active drag, karaoke and Pride programming. Staff operate a busy bar, not a visitor centre; ask directly about the accessible route or event floor before committing to a ticket.",
    "source_urls": ["https://thestonewallinnnyc.com/", "https://www.iloveny.com/event/stonewall-pride-2026/77035/", "https://www.nps.gov/places/stonewall-inn.htm"]
  }$qa$::jsonb),
  (572, $qa${
    "queue_wait": "Rise is easy near opening but tightens for weekend drag brunch, Sport-Tea and late DJ hours. Brunch has set seatings at 12:15 and 2:30; reserve rather than gambling on a walk-in, and arrive before a popular show for a usable view.",
    "best_nights": "Monday musicals, Tuesday bingo and karaoke, Wednesday drag and Sunday Sport-Tea each have a distinct social hook. Weekend brunch is the strongest daytime choice; Friday and Saturday until 4am are the fuller dance-bar version.",
    "crowd_mix": "Hell’s Kitchen gay men anchor the room, with drag-brunch groups, tourists, local regulars and mixed queer friends changing the balance by programme. Sport-Tea leans social and male; brunch and comedy broaden the table mix.",
    "dress_code": "Polished casual, gym-to-bar basics and expressive drag-brunch looks all work. There is no stated selector code. Dress for the programme: comfortable standing shoes late, or a brighter seated-brunch look if that is the event you booked.",
    "staff_inclusivity": "Rise programmes queer performers across drag, comedy and hosting throughout the week rather than treating inclusion as a Pride-only slogan. For a busy brunch, booking and telling the host about access or seating needs in advance produces more useful support.",
    "source_urls": ["https://www.risebarnyc.com/", "https://www.risebarnyc.com/events", "https://www.instagram.com/risebarnyc/"]
  }$qa$::jsonb),
  (573, $qa${
    "queue_wait": "Atlas is a compact neighbourhood bar, so the late-week problem is elbow room and drink access rather than a formal club queue. Come earlier for the leather-clubhouse décor and conversation; later weekend arrivals should expect a dense standing room.",
    "best_nights": "An early weekday shows the social-club side; Friday and Saturday bring the fullest gay-bar energy. Current event information is strongest on the bar’s social feed, so verify any DJ or special rather than relying on an old directory calendar.",
    "crowd_mix": "Hell’s Kitchen gay men, regulars and visitors form the core, with a grown-up lounge mood earlier and a denser mixed-age bar crowd late. The masculine décor does not by itself make the venue a strict fetish club.",
    "dress_code": "Everyday gay-bar wear, denim and leather accents fit the clubhouse interior. No verified strict gear rule was found, so do not treat a harness as mandatory. Dress for a small, warm room and keep bulky bags out of the circulation path.",
    "staff_inclusivity": "Fresh 2026 accounts name friendly bartenders and a welcoming room, while other guests report inconsistent pricing or service. The responsible reading is an active gay bar with personable shifts but not a uniformly documented service experience.",
    "source_urls": ["https://www.facebook.com/atlassocialclub/", "https://wanderlog.com/place/details/1373851/atlas-social-club", "https://qlist.app/venues/New-York/Atlas-Social-Club/dHZ5ZHAyYjJqVUdJQkdORGZVRkp2UQ"]
  }$qa$::jsonb),
  (574, $qa${
    "queue_wait": "Ritz is usually a walk-in, but its two levels and patios fill after drag shows and weekend DJs. Arrive during the 4–9pm happy hour for easier service and a base; later guests may queue briefly at security and then wait at the bars.",
    "best_nights": "Themed parties and drag make the live calendar decisive. Friday and Saturday deliver the high-energy, two-floor version; a weekday happy hour is better for conversation and an easier first look at the Hell’s Kitchen institution.",
    "crowd_mix": "Gay men are prominent, joined by drag audiences, tourists from the Times Square corridor and mixed LGBTQ+ groups. The front and rear patios widen the social mix early; late DJs pull a younger, more dance-led crowd.",
    "dress_code": "Smart-casual gay-bar wear, nightlife streetwear and drag-night sparkle all fit. No strict outfit policy is published. Dress for moving between patios, stairs and a packed dance area; themed-event styling is welcome but not the everyday threshold.",
    "staff_inclusivity": "Ritz identifies and operates as an LGBTQ+ venue with queer performers and recurring themed nights across two floors. At peak, flag harassment directly to a manager or security; the host cannot reliably see every part of the two-level room.",
    "source_urls": ["https://www.timessquarenyc.org/entertainment/the-ritz-bar-lounge", "https://www.instagram.com/ritznewyork/", "https://www.facebook.com/ritzbarandlounge/"]
  }$qa$::jsonb),
  (575, $qa${
    "queue_wait": "The two floors, patio and pool tables absorb ordinary traffic, but karaoke and Friday/Saturday themed parties can slow security and bar service. Arrive before the headline host if your group wants seats; this is generally a manageable sports-bar door, not a marathon line.",
    "best_nights": "Friday Hot Sauce centres queer hip-hop; Saturday Viva La Vida is the inclusive gay Latin night. Tuesday and Sunday karaoke, Wednesday bingo and Thursday Cock Fight offer more participatory alternatives to a generic weekend visit.",
    "crowd_mix": "Gay sports-bar regulars, queer men of colour, Latin-night groups, karaoke singers, tourists and sports viewers share a large Chelsea venue. The crowd changes substantially with the branded night, so programme choice matters more than the weekday alone.",
    "dress_code": "Sportswear, denim, team jerseys, fitted tees and party-night colour all work. There is no published fashion gate. Choose comfortable shoes for two floors and bring only what you can manage around pool tables, screens and a busy patio.",
    "staff_inclusivity": "BOXERS is explicitly a 21+ gay sports bar, and its current programme gives recurring space to queer hip-hop and inclusive gay Latin hosts. For a safety issue, identify the named event host or floor manager; the scale makes passive observation unreliable.",
    "source_urls": ["https://boxersnyc.com/", "https://www.instagram.com/boxersnyc/", "https://maps.apple.com/?q=BOXERS%20Chelsea"]
  }$qa$::jsonb),
  (576, $qa${
    "queue_wait": "REBAR Chelsea is permanently closed, so there is no current queue or valid arrival advice. Old event listings and reviews must not be used to plan a night at this address; verify the independently branded successor before travelling.",
    "best_nights": "There is no current best night. REBAR’s former drag, DJ and community calendar is historical material, not a live schedule. Choose an operating Chelsea venue with a dated official post rather than following archived weekend recommendations.",
    "crowd_mix": "The former club served gay men, drag audiences and mixed LGBTQ+ nightlife groups. A closed business has no present crowd, and its past audience cannot be assigned automatically to any new operator using the room or a similar social handle.",
    "dress_code": "Not applicable: REBAR no longer has an operating door. Historic party photos do not establish the policy of a successor. Check the actual venue name, ticket and current house rules before choosing an outfit or expecting entry.",
    "staff_inclusivity": "There is no current REBAR staff team to assess. Earlier queer programming does not justify a live inclusion score after closure; any G Lounge successor needs its own verification, management record and venue-specific profile.",
    "source_urls": ["https://www.corner.inc/place/pRvugohXEe8T", "https://linktr.ee/gloungechelsea"]
  }$qa$::jsonb),
  (577, $qa${
    "queue_wait": "Industry opens at 5pm daily and is easiest during early happy hour. Nightly drag around 11pm and weekend DJs pack the large room; arrive before the show for sightlines. Current guides report cash-only service with two ATMs, so prepare before the bar rush.",
    "best_nights": "Choose the scheduled queen or host: nightly drag is the reliable anchor. Friday and Saturday bring the largest dance crowd, while the 5–9pm happy hour gives a lower-friction weekday visit before performance volume takes over.",
    "crowd_mix": "Hell’s Kitchen gay men, drag fans, visitors and mixed LGBTQ+ friend groups fill a much larger room than many nearby bars. Earlier hours skew conversational and local; the show and late DJ window brings younger guests and more tourism.",
    "dress_code": "Casual-to-polished gay nightlife wear works: denim, fitted basics, trainers, leather details or drag-night glamour. No strict costume policy is published. Dress for standing and dancing in a busy performance room, and carry cash securely.",
    "staff_inclusivity": "Industry employs and platforms queer drag talent every night and operates as an established gay venue. The practical inclusion test is peak execution: locate security or a manager early, because a large, loud room can make bartender-only reporting ineffective.",
    "source_urls": ["https://industry-bar.com/", "https://www.instagram.com/industrybarnyc/", "https://www.gaycities.com/articles/97009/nyc-gay-happy-hour-guide-2026/"]
  }$qa$::jsonb),
  (578, $qa${
    "queue_wait": "Security checks government ID at this 21+ venue. Friday/Saturday leather events and Sunday roof-deck hours can create a line and coat-check bottleneck; the official coat check is $4 per item. Arrive near doors if a named party matters.",
    "best_nights": "Sunday from 5pm uses the roof-deck/social side before the late crowd. Friday and Saturday are strongest for leather, dancing and all three floors; Monday–Thursday suit a less compressed first visit, subject to the current event calendar.",
    "crowd_mix": "Gay and bisexual men dominate, with leather and fetish regulars, bears, visitors and younger nightlife groups distributed differently across three floors. It is explicitly male-oriented and sexualised, not a general mixed queer lounge.",
    "dress_code": "Leather, harnesses, denim, sportswear and bare-chested looks are common, but the exact party decides whether gear is encouraged or required. Read the event post. Bring government ID and budget for coat check rather than carrying bulky layers.",
    "staff_inclusivity": "The Eagle is an established gay men’s leather venue, not an all-audiences claim. Security, coat check and floor staff provide concrete contact points; consent and photography concerns should be raised immediately, especially in darker or more sexual areas.",
    "source_urls": ["https://eagle-ny.com/location/", "https://eagle-ny.com/events/", "https://www.instagram.com/eaglenyc/"]
  }$qa$::jsonb),
  (579, $qa${
    "queue_wait": "Entry is through sixth-floor reception with valid ID; choose a locker or private room rather than expecting a club line. Weekday after-work hours, roughly 4–7pm, are the most consistently cited busy window, so room availability can tighten then.",
    "best_nights": "This is better planned by time than night: weekday after work has the clearest community consensus for activity, while off-peak afternoons can be sparse. Check official 18+ admission, room rates and same-day hours before travelling.",
    "crowd_mix": "The club explicitly serves gay and bisexual men, with ages and body types varying by hour. Regulars and visitors use lockers or private rooms; it is a sexual wellness/bathhouse setting, not a mixed-gender spa or conventional dance club.",
    "dress_code": "Street clothes are stored on entry. Use the issued locker or room, follow towel and privacy norms and keep phones away from private areas. Valid government ID is the essential door item; no nightlife fashion look improves the visit.",
    "staff_inclusivity": "The venue clearly states an 18+ gay/bi men audience and provides staffed reception, lockers and private rooms. Recent facility and service reports are mixed, so ask reception about cleanliness, room condition and charges before paying rather than assuming spa-level hospitality.",
    "source_urls": ["https://eastsideclubnyc.com/", "https://www.reddit.com/r/nycgaybros/comments/1l31d6t/east_side_club/", "https://www.gaycities.com/bathhouses/190005-east-side-club"]
  }$qa$::jsonb),
  (945, $qa${
    "queue_wait": "Club Cumming is a small performance room, so ticketed cabaret and weekend events fill from the stage outward. Buy the named show when offered and arrive before doors for a sightline; the venue’s contact hours run 6pm–4am, but the live calendar controls access.",
    "best_nights": "Choose by act: queerlesque, drag and dancing, trans comedy, cabaret and piano each produce a different audience. An early cabaret rewards attention; later weekend programming becomes more social and dance-led. Verify the dated calendar.",
    "crowd_mix": "Performers, theatre people, gay men, trans and non-binary guests, drag audiences, celebrities and East Village visitors share a deliberately intimate queer room. The host and format can shift the gender and age balance dramatically.",
    "dress_code": "Expressive nightlife clothes, vintage glamour, cabaret polish and ordinary denim all fit. There is no single published uniform. Dress for the act and a close room; accessibility matters more than fashion because the physical venue states it is not ADA compliant.",
    "staff_inclusivity": "Current programming materially includes trans comedy, queerlesque and drag rather than relying on a generic welcome. The venue explicitly says the physical space is not ADA compliant; contact it before purchase for mobility needs instead of expecting an improvised route.",
    "source_urls": ["https://clubcummingnyc.com/", "https://clubcummingnyc.com/accessibility", "https://www.instagram.com/clubcumming/"]
  }$qa$::jsonb),
  (946, $qa${
    "queue_wait": "Flaming Saddles opens at 3pm weekdays and 2pm weekends. The room becomes difficult to navigate when bartenders perform and late weekend crowds arrive; come earlier for food and a clear view, later for the loudest show-bar version.",
    "best_nights": "Friday and Saturday deliver the full dancing-cowboy spectacle until 4am. A weekday early evening is easier for food, conversation and actually seeing the choreography without the same crush. Check the current social feed for special hosts.",
    "crowd_mix": "Gay men, Hell’s Kitchen regulars, tourists, birthday groups and mixed LGBTQ+ friends come for the country-western show-bar format. The performance concept attracts more first-time and straight-adjacent visitors than a quiet neighbourhood gay bar.",
    "dress_code": "Jeans, boots, western details and everyday gay-bar clothes fit naturally, but cowboy costume is not required. Wear stable shoes and avoid fragile accessories near a crowded bar where staff may dance overhead.",
    "staff_inclusivity": "Queer performers and dancing bartenders are the business model, and current management engages publicly with guest feedback. That does not erase individual service complaints; raise a problem with a floor manager rather than interrupting a performer mid-set.",
    "source_urls": ["https://www.flamingsaddles.com/", "https://www.instagram.com/flamingsaddlesnyc/", "https://www.tripadvisor.com/Attraction_Review-g60763-d7361428-Reviews-Flaming_Saddles_Saloon-New_York_City_New_York.html"]
  }$qa$::jsonb),
  (947, $qa${
    "queue_wait": "Cubbyhole is genuinely tiny. The common wait is outside or for physical space, especially after work, weekends and Pride; arrive early afternoon for a stool and conversation. A packed doorway can be an access barrier even when admission is informal.",
    "best_nights": "Daytime and early weekday hours show the neighbourhood-bar warmth; Friday/Saturday are the colourful, shoulder-to-shoulder version. Pick early hours for a first solo visit, or a busy evening if communal sing-along energy matters more than personal space.",
    "crowd_mix": "Queer women, lesbians, trans and non-binary guests, West Village regulars, gay friends and visitors share the room. It is women-centred without presenting itself as an identity-policed single-gender space.",
    "dress_code": "Come as you are: work clothes, denim, soft-butch tailoring, femme looks, Pride colour and tourist layers all fit. There is no fashion door. Dress for close contact and weather if the crowd pushes part of the visit outside.",
    "staff_inclusivity": "Cubbyhole explicitly calls itself a safe space and says bigotry, racism, transphobia and discrimination are not tolerated; guests are told to ask staff for help. That is a usable reporting policy, not just a rainbow label, though the tiny room can slow intervention.",
    "source_urls": ["https://www.cubbyholebar.com/", "https://www.instagram.com/cubbyholebar/", "https://www.nyclgbtsites.org/site/cubbyhole/"]
  }$qa$::jsonb),
  (948, $qa${
    "queue_wait": "The Cock is a late-night, men-focused dive with door control rather than a polished reservation system. Friday and Saturday are most likely to bottleneck; carry government ID, arrive before the deepest late-night rush and expect stairs with no step-free route.",
    "best_nights": "Friday and Saturday provide the sweaty, sexually charged version; an earlier weekday is less compressed but may feel sparse. Current specialist listings disagree with the bar’s historic 10pm pattern, so verify the same-day Facebook or Instagram post before travelling.",
    "crowd_mix": "Gay and bisexual men, East Village regulars, cruising-oriented guests and late-night visitors dominate. This is a dark, adult, sexually direct bar rather than a broad all-ages queer community room.",
    "dress_code": "Dark casual clothes, denim, leather, a harness or minimal layers fit, without evidence of a universal fetish requirement. Dress for heat and close contact. Keep your phone away in private-feeling areas and do not photograph people without explicit permission.",
    "staff_inclusivity": "The Cock’s value is a specific gay men’s sexual-nightlife space, not a generic all-LGBTQ promise. Current access listings report no step-free entry or accessible toilet; consent or harassment concerns should go directly to door or bar staff.",
    "source_urls": ["https://www.facebook.com/thecocknyc/", "https://queer.bar/venues/the-cock-nyc", "https://maps.apple.com/place?place-id=I5BD3493FA6E36F1D"]
  }$qa$::jsonb),
  (949, $qa${
    "queue_wait": "Adonis is a ticketed adult revue, not a fixed-address nightclub. Wednesday runs 10pm–2am at VV Bar; Friday/Saturday 11pm–3am at Side Door. Buy the correct date and use that ticket’s address; late arrival can reduce seating and dancer interaction.",
    "best_nights": "Wednesday is the midweek VV Bar edition; Friday and Saturday at Side Door are the fuller late-night shows. Choose by venue and featured dancers rather than assuming one permanent room, and recheck the official location page on the day.",
    "crowd_mix": "The audience is primarily gay and bisexual men attending a male revue, with tourists, regulars, birthdays and bachelor-style groups. Dancers, lap dances and champagne rooms make this adult entertainment, not a general queer dance floor.",
    "dress_code": "Smart-casual nightlife wear, fitted basics and celebratory group looks all work; there is no published fetish uniform. Bring government ID, the correct ticket and a planned spending limit for tips, private dances or champagne rooms.",
    "staff_inclusivity": "Adonis explicitly produces a gay male revue and provides hosts, dancers and venue security at each edition. Inclusion applies within that adult men-centred format; confirm accessibility and report consent or billing concerns to the event manager before leaving the host venue.",
    "source_urls": ["https://adonislounge.com/nyc/location/", "https://adonislounge.com/nyc/about/", "https://www.instagram.com/adonisloungenyc/"]
  }$qa$::jsonb),
  (950, $qa${
    "queue_wait": "The upstairs piano bar opens at 4pm weekdays and 3pm weekends; the downstairs nightclub creates the later bottleneck. Arrive before the featured show or DJ for easier stairs and bar service. A packed basement is the pressure point, not a famous selective door.",
    "best_nights": "Use the daily piano schedule for sing-along personality, then stay for the downstairs club if that is your goal. Friday and Saturday give both levels at maximum energy; an early weekday better reveals the long-running neighbourhood institution.",
    "crowd_mix": "Gay men and West Village regulars form the core, joined by piano fans, drag and club audiences, tourists and occasional straight guests. Upstairs skews conversational and mixed-age; the downstairs room becomes younger and dance-led late.",
    "dress_code": "Everyday gay-bar clothes, smart-casual date looks and performance-night sparkle all belong. There is no verified universal code. Choose shoes for stairs and dancing; a piano-bar outfit need not imitate the club crowd downstairs.",
    "staff_inclusivity": "The Monster has served the gay community for decades and directly employs queer piano and nightlife talent. Its two-level format means concerns should go to staff on the relevant floor; an upstairs bartender may not see what happens in the basement.",
    "source_urls": ["https://www.manhattan-monster.com/", "https://www.manhattan-monster.com/events", "https://www.instagram.com/themonsternyc/"]
  }$qa$::jsonb),
  (951, $qa${
    "queue_wait": "ICON Astoria is a walk-in lounge earlier, then tightens around drag, karaoke and weekend DJs. It opens 5pm Monday–Saturday and 3pm Sunday; arrive before the scheduled host if seating or a clear stage view matters.",
    "best_nights": "The weekly event page is the guide: drag shows, competitions, karaoke and DJs create different rooms. Friday/Saturday run latest and fullest; Sunday’s 3pm opening offers a more social neighbourhood start before evening programming.",
    "crowd_mix": "Queens LGBTQ+ locals, gay men, drag audiences, trans and non-binary performers, friend groups and Manhattan visitors share the room. It feels more neighbourhood-led than Midtown while changing noticeably with each host.",
    "dress_code": "Casual barwear, drag-night glamour, colourful streetwear and polished date looks all work. No strict outfit door is published. Dress for the named event and a compact lounge rather than assuming Manhattan circuit-club rules.",
    "staff_inclusivity": "ICON’s current weekly programme repeatedly platforms queer drag artists and hosts, giving inclusion a concrete local form. For access or safety needs, contact the venue before the show and identify the event host on arrival; peak noise makes passive reporting unreliable.",
    "source_urls": ["https://www.iconastoria.com/", "https://www.iconastoria.com/weekly-events", "https://www.instagram.com/iconastoria/"]
  }$qa$::jsonb),
  (952, $qa${
    "queue_wait": "Major Friday/Saturday parties frequently sell out; a ticket does not always guarantee immediate entry when the door is processing safety and theme rules. Buy ahead, arrive early and bring government ID. House of Love applies a stricter fetishwear door.",
    "best_nights": "Pick the production, not just Saturday. Spectacle-led dance parties suit a first visit; House of Love is explicitly fetish and consent-focused; weekday shows can be more spacious. Read the full event page because theme, entry and photography rules change.",
    "crowd_mix": "Queer performers, club kids, dancers, burners, LGBTQ+ groups and expressive allies make a broad, theatrical Brooklyn crowd. A specific production can centre fetish, circus, drag or dance communities, so no single demographic describes every night.",
    "dress_code": "Friday/Saturday asks guests to dress to express and show effort; a themed look helps. House of Love requires genuine fetishwear and can refuse entry despite a ticket. Comfortable dance shoes matter, and photography is prohibited on the dance floor.",
    "staff_inclusivity": "The venue publishes zero tolerance for harassment, unwanted touch, discrimination and violence and directs guests to security or a manager. It has gender-inclusive toilets and single-level wheelchair access; House of Love additionally foregrounds affirmative consent.",
    "source_urls": ["https://www.houseofyes.org/faq/", "https://www.houseofyes.org/love", "https://www.instagram.com/houseofyesnyc/"]
  }$qa$::jsonb),
  (1539, $qa${
    "queue_wait": "This is hotel reception, not a nightlife door. Official check-in starts 3pm, checkout is noon, and the hotel places a $200-per-night incidental hold; the named guest must be 21+. Expect the longest desk wait around standard afternoon turnover.",
    "best_nights": "Book for Meatpacking access, rooftop/pool appeal and a polished base rather than a queer programme. Weekends put you nearest the district’s nightlife but also its noise and room demand; a weekday gives calmer hotel use and often easier public-space access.",
    "crowd_mix": "A mainstream boutique audience of leisure guests, couples, business travellers and nightlife visitors uses the hotel. Its neighbourhood is LGBTQ+ significant, but the property does not present itself as queer-owned or as a dedicated community hotel.",
    "dress_code": "There is no identity or fashion threshold for hotel guests. Smart-casual works in public areas; bring season-appropriate rooftop/pool clothing and a valid card for the hold. Nearby clubs may have separate dress and ID rules.",
    "staff_inclusivity": "The hotel serves a broad mainstream audience; no venue-specific evidence supports claiming queer-specialist staff. Use the front desk for room, name or safety needs and ask before booking if gender-neutral forms, partner recognition or a particular accessibility setup is essential.",
    "source_urls": ["https://www.gansevoorthotelgroup.com/gansevoort-meatpacking-nyc/", "https://www.gansevoorthotelgroup.com/faq/", "https://www.tripadvisor.com/Hotel_Review-g60763-d282217-Reviews-Gansevoort_Meatpacking_NYC-New_York_City_New_York.html"]
  }$qa$::jsonb),
  (1540, $qa${
    "queue_wait": "Official check-in is 4pm and checkout 11am. Expect a $150-per-night incidental hold plus a $43-before-tax nightly amenity fee; guests may check in from age 18. The desk has no dedicated concierge, so resolve special requests before arrival.",
    "best_nights": "Choose NoMo for SoHo access and design-led accommodation, not a recurring queer event. Weekends suit shopping and downtown nightlife but bring heavier lobby and street traffic; weekdays are calmer for business or a design-focused stay.",
    "crowd_mix": "This is a mainstream design hotel used by tourists, couples, fashion visitors and business travellers. It is not evidenced as queer-owned or LGBTQ+-specific, so proximity to downtown queer life should not be presented as community programming.",
    "dress_code": "No dress code applies to hotel entry. Fashion-forward smart-casual suits the lobby and restaurant, while ordinary travel clothes are valid. Carry photo ID and a payment card capable of covering the fee and nightly hold.",
    "staff_inclusivity": "ADA rooms are offered, but current guest reports about front-desk responsiveness and service are mixed. NoMo does not publish a queer-specific staff policy; state names and room/access needs before arrival and obtain written confirmation for anything essential.",
    "source_urls": ["https://www.nomosoho.com/faq", "https://www.nomosoho.com/", "https://www.tripadvisor.com/Hotel_Review-g60763-d1786395-Reviews-Nomo_Soho-New_York_City_New_York.html"]
  }$qa$::jsonb),
  (1541, $qa${
    "queue_wait": "This small men-only, clothing-optional guesthouse is reservation-led, not a walk-in venue. Confirm the exact room, shared facilities, payment method and hot-water status in writing before arrival; recent verified complaints make an unconfirmed booking risky.",
    "best_nights": "There is no evidence-based event night. Stay only if the men-only, clothing-optional lodging format and Chelsea location specifically outweigh the documented service and facility concerns. A refundable alternative is prudent.",
    "crowd_mix": "The property markets to adult men and attracts gay male travellers seeking a clothing-optional guesthouse. It is not a broad all-genders LGBTQ+ hotel, and the small shared-property format means fellow guests strongly shape the experience.",
    "dress_code": "Clothing optional applies inside designated guest areas, not to the street or ordinary check-in expectations. Bring shower footwear and a robe if facilities are shared, and clarify privacy boundaries before booking rather than assuming bathhouse norms.",
    "staff_inclusivity": "A men-focused concept is not proof of dependable service. Recent guest reports cite cleanliness, hot-water and payment problems, including difficult complaint handling. Obtain price, facilities and cancellation terms in writing and avoid cash without a receipt.",
    "source_urls": ["https://www.trip.com/hotels/new-york-hotel-detail-21855860/chelsea-mews-guest-house/", "https://www.tripadvisor.com/Hotel_Review-g60763-d1776507-Reviews-Chelsea_Mews_Guest_House-New_York_City_New_York.html"]
  }$qa$::jsonb),
  (1542, $qa${
    "queue_wait": "Hotel check-in follows the booked reservation; rooftop and BOOM events may have separate tickets, security and queues. Do not assume a room grants party entry. Late weekend arrivals also meet Meatpacking traffic and event noise, so confirm both access and room placement.",
    "best_nights": "Choose a dated BOOM or Pride event for queer programming; the hotel’s Pride 2026 series featured queer performers and hosts. Outside those dates, book for High Line location and nightlife, with higher noise risk on active rooftop nights.",
    "crowd_mix": "Mainstream hotel guests, fashion and nightlife visitors use the property; BOOM and Pride events add queer performers, LGBTQ+ groups and allies. The event crowd should not be projected onto every hotel floor or ordinary night.",
    "dress_code": "Hotel entry has no club code. BOOM and Pride events may call for polished, expressive nightlife looks, but the ticket controls. Wear practical city layers and ask for a quieter room if club or rooftop noise would undermine the stay.",
    "staff_inclusivity": "Hosting an explicit Pride programme is concrete LGBTQ+ engagement, though guest reports about general service remain mixed. Confirm names, access and quiet-room needs directly with reception; event staff and hotel staff handle different parts of the experience.",
    "source_urls": ["https://www.standardhotels.com/new-york/properties/high-line", "https://www.standardhotels.com/en-GB/culture/boom-pride-2026", "https://www.gayout.com/pl/usa-canada/united-states/new-york-city/hotels/the-standard-high-line-nyc"]
  }$qa$::jsonb),
  (1544, $qa${
    "queue_wait": "The Marshal is a small reservation-led restaurant. Online bookings are held for 15 minutes, and prime dinner or pre-theatre times fill faster than a casual walk-in suggests. Reserve, arrive on time and call for groups or changes rather than expecting bar overflow.",
    "best_nights": "Choose a weekday dinner for calmer wood-fired cooking and conversation; Friday/Saturday suit a Hell’s Kitchen date but require more planning. This is about New York ingredients, local wine and a compact dining room, not a recurring queer event night.",
    "crowd_mix": "Neighbourhood diners, couples, theatre visitors and food-focused travellers form a mainstream restaurant crowd. The Hell’s Kitchen location is queer-friendly context, but The Marshal does not establish itself as an LGBTQ+-specific venue.",
    "dress_code": "Restaurant casual is right: clean denim, polished trainers, work clothes or a relaxed date-night layer. There is no door fashion rule. Dress for a compact room and the weather, since waiting space is limited if your table is not ready.",
    "staff_inclusivity": "No credible source supports calling the staff queer-specialist. The useful service evidence is operational: reservations, a 15-minute hold and direct contact for needs. State pronouns, dietary restrictions and access requirements clearly when booking.",
    "source_urls": ["https://www.the-marshal.com/", "https://www.the-marshal.com/reservations", "https://www.the-marshal.com/about"]
  }$qa$::jsonb),
  (1545, $qa${
    "queue_wait": "Fresco’s now operates at 28-50 31st Street in Astoria, not the old 31st Avenue address. Drag brunches have fixed productions and should be reserved; arrive before seating so food orders do not collide with the first number.",
    "best_nights": "Choose the actual format: Sunday drag matinee and karaoke, the city’s drag-king brunch, Big Girlz’s all-POC cast or another monthly themed brunch. The performer roster gives a more useful choice than simply saying weekend.",
    "crowd_mix": "Queens LGBTQ+ locals, Latinx and POC audiences, drag and drag-king fans, brunch groups and allies share a restaurant-event room. Different productions intentionally centre different parts of the community rather than offering one generic crowd.",
    "dress_code": "Colourful brunch looks, casual restaurant clothes and celebratory group outfits all work. There is no selector door. Dress to sit, eat and interact with performers; bring tipping cash and avoid blocking sightlines with oversized accessories.",
    "staff_inclusivity": "Inclusion is visible in the programme: drag kings, an all-POC Big Girlz cast and recurring queer hosts receive named stages. For seating, dietary or mobility needs, contact the restaurant with the reservation because show-day improvisation is harder once service starts.",
    "source_urls": ["https://welovefrescos.com/", "https://welovefrescos.com/queens-astoria-fresco-s-grand-cantina-happy-hours-specials", "https://www.instagram.com/frescosgrandcantina/"]
  }$qa$::jsonb),
  (1546, $qa${
    "queue_wait": "The Bureau Cafe is a walk-in lobby cafe inside The Center, open daily 9am–5pm. There is no nightclub queue; the practical pinch is seating and outlets during meetings or Center programmes. The right-side entrance ramp reaches the lobby near the cafe.",
    "best_nights": "This is strongest in daylight: coffee, work, a meeting or a pause before The Center’s services and events. Pair a Tuesday–Sunday afternoon with The Bureau queer bookstore, open 1–7pm, rather than treating the cafe as nightlife.",
    "crowd_mix": "Queer and trans baristas serve Center visitors, programme participants, local workers, students and community members. Because it sits in an LGBTQ+ service hub, the mix is more intergenerational and purpose-led than a commercial queer cafe alone.",
    "dress_code": "Everyday cafe and community-centre clothing is right—workwear, street clothes, appointment-day layers or whatever supports comfort. There is no dress threshold. Keep pathways and accessible seating clear when working with a laptop.",
    "staff_inclusivity": "The Center describes the cafe as queer-owned and operated and specifically identifies queer and trans baristas. Ramp entry reaches the lobby near the cafe, and the Information & Referral desk can assist with building questions; these are concrete inclusion supports.",
    "source_urls": ["https://gaycenter.org/about/inside-the-center/", "https://gaycenter.org/accessibility/", "https://gaycenter.org/calendar/"]
  }$qa$::jsonb),
  (1891, $qa${
    "queue_wait": "Prospect Park is a 526-acre public park, not a staffed cruising venue or club. NYC311 lists 5am–1am access; the Alliance lists 6am–1am, so use 6am as the conservative arrival. There is no admission line, coat check or queer host.",
    "best_nights": "Daylight is the responsible recommendation for walking, meeting or exploring. No official source endorses sexual activity or a queer cruising schedule, and isolated after-dark areas add avoidable risk. Use dated public LGBTQ+ events when available.",
    "crowd_mix": "Brooklyn residents, runners, cyclists, families, dog walkers, event audiences and tourists use a mainstream public park. Queer people are part of that public, but the entire park cannot responsibly be labelled an LGBTQ+ crowd or venue.",
    "dress_code": "Wear ordinary park clothing for weather, distance and visibility. There is no barwear or fetish code. Carry a charged phone and minimise valuables; public-decency, consent and park rules apply everywhere, including secluded landscape areas.",
    "staff_inclusivity": "Park staff and public-safety personnel are not queer venue hosts, so no nightclub-style inclusion score is valid. Use 311 or emergency services for safety issues and The Prospect Park Alliance for facilities; meet in populated areas rather than relying on informal cruising lore.",
    "source_urls": ["https://portal.311.nyc.gov/article/?kanumber=KA-02940", "https://www.prospectpark.org/visit-the-park/general-info/", "https://www.nycgovparks.org/parks/prospect-park"]
  }$qa$::jsonb),
  (1893, $qa${
    "queue_wait": "Playhouse opens 5pm Tuesday–Wednesday and 2pm Thursday–Sunday. Earlier hours are easy; drag shows and weekend DJs fill the narrow West Village room, so arrive before the billed performer for sightlines and less bar congestion.",
    "best_nights": "Use the current show calendar: drag, DJs and hosted parties create the strongest visits. Thursday–Sunday’s 2pm start supports a relaxed first drink; Friday/Saturday late is the denser dance-and-performance version.",
    "crowd_mix": "Gay men, drag audiences, West Village locals, tourists and mixed LGBTQ+ friend groups share a small bar. The crowd changes with the queen or DJ; afternoons are broader and conversational, while late weekends skew younger and louder.",
    "dress_code": "Casual gay-bar wear, denim, fitted basics and drag-show sparkle all work. No strict fashion door is published. Choose comfortable shoes and compact layers because the room can move quickly from seated-looking to standing-only.",
    "staff_inclusivity": "Playhouse’s active programme employs queer drag artists and hosts throughout the week, providing concrete community participation. In a packed show, identify the host, bartender and security position early so a consent or access concern reaches the right person.",
    "source_urls": ["https://www.playhousebar.com/", "https://www.instagram.com/playhousebarnyc/", "https://www.facebook.com/playhousebarnyc/"]
  }$qa$::jsonb),
  (1894, $qa${
    "queue_wait": "HUSH opens 5pm Tuesday–Sunday and is closed Monday; Friday/Saturday run to 4am. Earlier lounge hours are simplest, while drag and weekend parties can create a short security line and a crowded bar. Arrive before the billed show for a clear position.",
    "best_nights": "Choose the weekly host or performer rather than defaulting to Saturday. Friday and Saturday provide the full late club version; Sunday’s 5pm–2am window and midweek shows are easier for conversation and a first visit.",
    "crowd_mix": "Hell’s Kitchen gay men, drag fans, tourists and mixed LGBTQ+ groups fill a polished club-lounge. Event hosts can shift the gender, age and cultural mix; late weekends lean younger and more dance-focused than early weekdays.",
    "dress_code": "Polished casual, fitted nightlife basics, colour and drag-show glamour suit the room. No universal strict code is published. Dress for dancing and standing, and check a themed post before assuming an ordinary outfit meets a special event request.",
    "staff_inclusivity": "HUSH explicitly presents itself as an LGBTQ+ nightlife space and builds its calendar around queer hosts and performers. For a safety issue, use security or a manager rather than relying only on a busy bartender; request access details directly before arrival.",
    "source_urls": ["https://hushhk.com/about-us/", "https://hushhk.com/events/", "https://www.instagram.com/hushhk/"]
  }$qa$::jsonb),
  (1895, $qa${
    "queue_wait": "Henrietta Hudson opens 6pm Wednesday–Sunday and is closed Monday–Tuesday; Friday/Saturday run to 4am. The intimate room fills quickly on DJ and special-event nights, so arrive early for seating or easier entry and expect a standing crowd late.",
    "best_nights": "Wednesday/Thursday and Sunday offer the more conversational 6pm–2am version. Friday and Saturday bring the full late dance bar. Use the current calendar for queer art, DJs or community events rather than applying an old ‘lesbian bar’ template.",
    "crowd_mix": "Henrietta calls itself a queer human bar built by dykes. Lesbians and queer women remain central, alongside trans and non-binary guests, queer men and respectful friends; the identity is intentionally broader than a women-only door.",
    "dress_code": "Soft-butch tailoring, femme glamour, denim, streetwear and ordinary after-work clothes all fit. There is no published identity costume or fashion test. Dress for a close West Village room and dancing on later nights.",
    "staff_inclusivity": "The venue’s own history centres lesbian, queer and trans community evolution and now explicitly welcomes queer humans. That language rejects identity policing; guests should still bring harassment or misgendering directly to bar staff or the event host.",
    "source_urls": ["https://www.henriettahudson.com/", "https://henriettahudson.com/history", "https://www.instagram.com/henriettahudson/"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id=576 then jsonb_build_object('operating_status','permanently_closed')
       when id=1891 then jsonb_build_object('operating_status','public_space_not_managed_venue')
       when id=1541 then jsonb_build_object('operating_status','active_booking_listed_service_caution')
       when id=949 then jsonb_build_object('operating_status','active_roaming_event_series')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence', jsonb_build_object(
      'queue_wait', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'best_nights', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'crowd_mix', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'dress_code', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'staff_inclusivity', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_29',
    'updated_at','2026-08-29T00:00:00Z'
  ) as patch from researched
)
update public.places p
set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch,
    updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Operational corrections found during this review.
update public.places
set seo_indexable=false, seo_quality_status='rejected', updated_at=timezone('utc',now())
where id=576; -- REBAR Chelsea is permanently closed.

update public.places set name='ICON Astoria', hours='Mon-Sat 17:00-04:00; Sun 15:00-04:00.', link='https://www.iconastoria.com/', updated_at=timezone('utc',now()) where id=951;
update public.places set hours='Daily 14:00-04:00.', link='https://hardwarebar.com/', updated_at=timezone('utc',now()) where id=570;
update public.places set hours='Mon-Fri 14:00-04:00; Sat-Sun 13:00-04:00.', link='https://thestonewallinnnyc.com/', updated_at=timezone('utc',now()) where id=571;
update public.places set hours='Sun 12:15-02:00; Mon-Thu 16:00-02:00; Fri 15:00-04:00; Sat 12:15-04:00.', link='https://www.risebarnyc.com/', updated_at=timezone('utc',now()) where id=572;
update public.places set hours='Daily 17:00-04:00.', link='https://industry-bar.com/', updated_at=timezone('utc',now()) where id=577;
update public.places set hours='Mon 22:00-03:00; Tue-Sat 22:00-04:00; Sun 17:00-04:00.', link='https://eagle-ny.com/location/', updated_at=timezone('utc',now()) where id=578;
update public.places set hours='Event-led; contact page lists 18:00-04:00.', link='https://clubcummingnyc.com/', updated_at=timezone('utc',now()) where id=945;
update public.places set hours='Mon-Fri 15:00-04:00; Sat-Sun 14:00-04:00.', link='https://www.flamingsaddles.com/', updated_at=timezone('utc',now()) where id=946;
update public.places set location='Event-specific: VV Bar, 325 W 51st St (Wed); Side Door, 151 E 57th St (Fri-Sat), New York, NY, United States', hours='Wed 22:00-02:00; Fri-Sat 23:00-03:00; verify the dated event.', link='https://adonislounge.com/nyc/location/', updated_at=timezone('utc',now()) where id=949;
update public.places set hours='Mon-Fri 16:00-04:00; Sat-Sun 15:00-04:00.', link='https://www.manhattan-monster.com/', updated_at=timezone('utc',now()) where id=950;
update public.places set link='https://www.houseofyes.org/', updated_at=timezone('utc',now()) where id=952;
update public.places set link='https://www.gansevoorthotelgroup.com/gansevoort-meatpacking-nyc/', updated_at=timezone('utc',now()) where id=1539;
update public.places set link='https://www.nomosoho.com/', updated_at=timezone('utc',now()) where id=1540;
update public.places set name='Fresco''s Grand Cantina', location='28-50 31st Street, Astoria, NY 11102, United States', link='https://welovefrescos.com/', updated_at=timezone('utc',now()) where id=1545;
update public.places set name='The Bureau Cafe', location='The Center, 208 W 13th Street, New York, NY 10011, United States', hours='Daily 09:00-17:00.', link='https://gaycenter.org/about/inside-the-center/', updated_at=timezone('utc',now()) where id=1546;
update public.places set hours='Public park: use 06:00-01:00 as the conservative official window.', link='https://www.prospectpark.org/visit-the-park/general-info/', updated_at=timezone('utc',now()) where id=1891;
update public.places set hours='Tue-Wed from 17:00; Thu-Sun from 14:00; verify closing time and event.', link='https://www.playhousebar.com/', updated_at=timezone('utc',now()) where id=1893;
update public.places set hours='Mon closed; Tue 17:00-02:00; Wed-Sat 17:00-04:00; Sun 17:00-02:00.', link='https://hushhk.com/about-us/', updated_at=timezone('utc',now()) where id=1894;
update public.places set hours='Wed-Thu 18:00-02:00; Fri-Sat 18:00-04:00; Sun 18:00-02:00; Mon-Tue closed.', link='https://www.henriettahudson.com/', updated_at=timezone('utc',now()) where id=1895;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (568,569,570,571,572,573,574,575,576,577,578,579,945,946,947,948,949,950,951,952,1539,1540,1541,1542,1544,1545,1546,1891,1893,1894,1895)
    and venue_intel->>'updated_at'='2026-08-29T00:00:00Z';
  if updated_count<>31 then raise exception 'Expected 31 repaired New York profiles, found %',updated_count; end if;

  select count(*) into invalid_fields
  from public.places p
  cross join lateral jsonb_each_text(jsonb_build_object(
    'queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights',
    'crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code',
    'staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
  where p.id in (568,569,570,571,572,573,574,575,576,577,578,579,945,946,947,948,949,950,951,952,1539,1540,1541,1542,1544,1545,1546,1891,1893,1894,1895)
    and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every New York intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;

  select count(*) into duplicate_fields from (
    select f.key,f.value,count(*)
    from public.places p
    cross join lateral jsonb_each_text(jsonb_build_object(
      'queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights',
      'crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code',
      'staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
    where p.id in (568,569,570,571,572,573,574,575,576,577,578,579,945,946,947,948,949,950,951,952,1539,1540,1541,1542,1544,1545,1546,1891,1893,1894,1895)
    group by f.key,f.value having count(*)>1
  ) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate New York intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
