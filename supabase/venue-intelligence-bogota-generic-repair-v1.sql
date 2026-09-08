-- Queer Atlas Venue Intelligence: Bogota generic-copy repair.
-- Research rechecked 2026-08-30. Replaces generic text for exactly 33 records,
-- corrects moves/closures and deindexes one duplicate plus one misclassified route.

begin;

with researched(id, profile) as (
  values
  (586, $qa${
    "queue_wait": "Theatron opens Thursday–Saturday at 21:00 and major Saturdays, Halloween and Pride can create a severe street queue. Bring physical ID, arrive near doors and use the official Calle 58 Bis #10-32 entrance; admission varies by event.",
    "best_nights": "Thursday is the lower-pressure introduction; Friday and Saturday activate the largest selection of themed rooms. Choose by the current room and DJ programme—Latin, pop, techno, drag and rooftop spaces produce distinct nights.",
    "crowd_mix": "Gay men, lesbians, trans and non-binary guests, drag audiences, tourists and straight friends share an enormous LGBTQ+-centred complex. Individual rooms skew differently by genre, age and performance rather than one uniform crowd.",
    "dress_code": "Comfortable dancewear and secure shoes matter across many floors. No permanent formal code is published; themed dates may add rules. Avoid bulky costumes on peak nights because heat and circulation become genuine constraints.",
    "staff_inclusivity": "Theatron is an LGBTQ+ institution that hosts Bogotá’s 2026 inclusive employment fair and Festival por la Igualdad programming. Its scale means use the nearest room attendant or security team immediately; keep the official PQRS route for follow-up.",
    "source_urls": ["https://www.portaltheatron.co/en", "https://visitbogota.co/en/node/33", "https://www.tropicanafm.com/2026/feria-de-empleo-para-la-comunidad-lgbtiq-hay-5-000-vacantes-disponibles-466964.html"]
  }$qa$::jsonb),
  (588, $qa${
    "queue_wait": "Village is a compact café-bar where table capacity matters more than a club line. Friday/Saturday late service fills fastest; reserve or arrive before dinner if food and seating matter. Current hours differ from the older 16:00 listing.",
    "best_nights": "Friday and Saturday run to about 02:00 for the liveliest cocktail and music room; weekday lunch and early evening suit food, conversation and meeting regulars. Check Instagram for karaoke or live programming before choosing.",
    "crowd_mix": "Gay and LGBTQ+ Chapinero regulars, diners, tourists and mixed friend groups share one of the district’s longstanding café-bars. Earlier food service is broad; late weekend hours become more explicitly social and queer-nightlife oriented.",
    "dress_code": "Everyday café clothing, date-night polish and relaxed queer streetwear all fit. There is no evidenced selector wardrobe. Dress for table service that can turn into a close standing bar later.",
    "staff_inclusivity": "Village has operated as an LGBTQ+ meeting café rather than merely borrowing rainbow décor. Current reviews praise service, but wheelchair access is reported absent; ask staff about seating and entry before bringing a guest with mobility needs.",
    "source_urls": ["https://www.instagram.com/villagebogota/", "https://es.restaurantguru.com/Village-Cafe-Bogota", "https://www.travelgay.com/venue/village-cafe-bogota-colombia"]
  }$qa$::jsonb),
  (589, $qa${
    "queue_wait": "Coyote Crazy currently opens only Thursday–Saturday from 17:00. It is a walk-in bar, but the small two-level room tightens late; arrive before the dance peak for easier service and verify same-day opening through its Facebook contact.",
    "best_nights": "Thursday is the easier social start; Friday/Saturday bring the fuller Latin and crossover dance-bar version until 03:00. There is no evidence for a permanent Tuesday programme, so use current posts rather than old weekly claims.",
    "crowd_mix": "Gay men, mixed LGBTQ+ groups, Chapinero regulars and visitors form a casual Latin-party crowd. Early drinks are conversational; the upper and lower areas become more dance-focused after nearby bars release guests.",
    "dress_code": "Casual dance-bar clothing and comfortable shoes are appropriate. No strict code is published. Keep layers and bags compact for stairs and close circulation instead of dressing for a high-fashion Zona T door.",
    "staff_inclusivity": "The business is an established LGBTQ+ Chapinero bar, with a direct phone and Facebook contact, but no current source documents a trans-specific protocol. Use the bar lead for harassment or access concerns and avoid claiming certification.",
    "source_urls": ["https://www.facebook.com/profile.php?id=924492074281366", "https://www.waze.com/es/live-map/directions/co/bogota/bogota/coyote-crazy%21?to=place.ChIJay6LXTiaP44RYMcEzAQAz4I"]
  }$qa$::jsonb),
  (590, $qa${
    "queue_wait": "Vintrash Bogotá is reported permanently closed at Avenida Calle 85 #11-53. Do not queue, reserve or travel using the archived Gringo Tuesdays schedule. Reassess only after an official operator posts a dated reopening at a confirmed address.",
    "best_nights": "There is no current best night. Gringo Tuesdays, games and multi-room parties describe the former operation, not a 2026 recommendation. Keep the history in editorial notes but remove it from active nightlife planning.",
    "crowd_mix": "The former venue mixed language-exchange visitors, international travellers, local students and broad nightlife groups. A closed operation has no current crowd, and that audience cannot be assigned to a future Vintrash concept automatically.",
    "dress_code": "Not applicable while the Bogotá venue is closed. Former casual partywear and its reported age/door practices are historical only. Check any future launch post for identity, address, age floor and clothing rules.",
    "staff_inclusivity": "No active team can be assessed. Archived sources describe a broad party audience but do not establish current queer staffing or welfare. The responsible database action is deindexing until the operator confirms a live Bogotá venue.",
    "source_urls": ["https://wanderlog.com/es/place/details/2539192/vintrash-bogot%C3%A1", "https://www.instagram.com/vintrashbar/"]
  }$qa$::jsonb),
  (591, $qa${
    "queue_wait": "Boogaloop has returned in La Candelaria at Calle 12D #4-20; the old Carrera 13 #65-42 listing is stale. It is event-led, so use the current flyer and arrive near doors for concerts or limited-capacity DJ programmes.",
    "best_nights": "Choose the live act or DJ rather than a generic Friday/Saturday rule. The revived venue centres alternative music and emerging talent; a concert, tropical set and electronic night can attract entirely different audiences.",
    "crowd_mix": "Independent-music listeners, artists, students, DJs and open-minded queer guests make up a culture-led audience. It is LGBTQ+-friendly but not a permanent gay club, and the mix follows each booking.",
    "dress_code": "Creative casual, vintage streetwear and comfortable concert shoes fit the independent room. No formal code is published. Check the event for theme or age restrictions and dress for standing, live music and Bogotá’s cool nights.",
    "staff_inclusivity": "Bogotá’s official cultural catalogue describes the revived Boogaloop through freedom, authenticity and support for emerging artists. That is cultural inclusion evidence, while queer welfare remains event-specific; locate house and promoter staff on arrival.",
    "source_urls": ["https://catalogoentretenimiento.visitbogota.co/musica/boogaloop", "https://www.instagram.com/boogaloopclub/"]
  }$qa$::jsonb),
  (592, $qa${
    "queue_wait": "Dagoas operates 24/7 through reception, not a club queue. Weekend and post-club hours can pressure lockers, rooms and wet areas; call the published numbers for accommodation or massage availability before paying.",
    "best_nights": "Friday/Saturday after club closing bring the strongest social and sexual circulation; weekday daytime is quieter for sauna, steam and jacuzzi use. Election alcohol bans do not close the spa, as its 2026 updates confirmed.",
    "crowd_mix": "Adult gay and bisexual men, local regulars, hostel guests and post-club visitors use a combined sauna and accommodation business. The crowd changes sharply by hour and should not be described as mixed-gender without operator confirmation.",
    "dress_code": "Simple clothes that store easily, towel use and wet-area footwear are practical. Keep phones and valuables secured and follow posted privacy, hygiene and consent rules; hostel clothing and sauna nudity belong in separate zones.",
    "staff_inclusivity": "Dagoas explicitly operates as a gay sauna/hostel with staffed 24-hour reception and identifiable phone contacts. That gives guests a reporting point for room, hygiene or consent issues; it does not evidence admission for every gender identity.",
    "source_urls": ["https://x.com/DagoasS", "https://www.idt.gov.co/sites/default/files/Guia-LGBTI-Digital.pdf"]
  }$qa$::jsonb),
  (1191, $qa${
    "queue_wait": "This is a public nightlife corridor, not an admission-controlled cruising venue. There is no legitimate queue, host or capacity policy. Move between verified businesses and use Bogotá’s marked safe-taxi points instead of treating streets as one venue.",
    "best_nights": "Thursday–Saturday bring the most licensed nightlife, but the useful choice is a named venue and safe return plan. The city’s 2026 Zona Segura operation supports verified taxis in Distrito Diverso; it does not publish a cruising schedule.",
    "crowd_mix": "Residents, workers, students, LGBTQ+ nightlife visitors, vendors and general street traffic use the Chapinero corridor. Calling the whole area a cruising crowd is inaccurate and exposes visitors to avoidable safety risk.",
    "dress_code": "Dress for Bogotá’s cold evenings, walking and the actual venue you will enter. Keep phones and valuables discreet, watch drinks and avoid displaying fetish gear on public streets unless travelling directly and safely to a coded event.",
    "staff_inclusivity": "No venue staff manage this corridor. District security and police operate safe-transport points, while emergency help is reached through 123. Inclusion claims belong to individual businesses, not an unsupported map line.",
    "source_urls": ["https://bogota.gov.co/mi-ciudad/seguridad/zonas-seguras-de-rumba-de-modelia-chapinero-y-zona-t-de-bogota-2026", "https://bogota.gov.co/mi-ciudad/seguridad/recomendaciones-para-no-ser-victima-de-paseo-millonario-en-bogota-2025"]
  }$qa$::jsonb),
  (1192, $qa${
    "queue_wait": "Leos opens early and runs to 05:00 daily; its multiple rooms reduce a formal street queue, but karaoke, stripper shows and weekend late traffic can slow the entrance and bars. Reservations and wheelchair access are listed.",
    "best_nights": "Choose the programmed room: cantina, karaoke, terrace and go-go/strip shows serve different visits. Friday/Saturday give the fullest multi-room operation; weekday afternoons and early evenings suit regulars and conversation.",
    "crowd_mix": "Gay men, karaoke singers, show audiences, mixed LGBTQ+ groups and long-time Chapinero regulars circulate through several environments. The audience becomes more male and performance-focused around dancers and late hours.",
    "dress_code": "Everyday bar clothing, dancewear and show-night polish all fit; no strict code is documented. Wear secure shoes for moving among rooms and check a special event before assuming ordinary casual entry.",
    "staff_inclusivity": "Leos is explicitly identified as an LGBTQ+ venue and offers wheelchair access, reservations and staffed entertainment zones. Those are concrete service points; report harassment to the room host or manager rather than relying on a generic safe-space claim.",
    "source_urls": ["https://www.instagram.com/leosbar_mistica/", "https://es.restaurantguru.com/Leos-Bar-Mistica-Bogota", "https://www.waze.com/es/live-map/directions/co/bogota/bogota/leos-bar-mistica-llgbtq-%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88-chapinero?to=place.ChIJ6R4ZaTiaP44RxsiuJvLwtK0"]
  }$qa$::jsonb),
  (1193, $qa${
    "queue_wait": "HAB is a 57-room boutique hotel with check-in from 15:00 and checkout by noon. Afternoon turnover is the predictable desk peak; arrange the paid airport shuttle and exact room configuration before arrival.",
    "best_nights": "Stay for Chapinero Alto, the restored houses, garden, restaurant and access to queer nightlife—not an in-house club. Pride and wedding dates book earlier; weekdays better preserve the residential boutique atmosphere.",
    "crowd_mix": "Design travellers, couples, business guests, restaurant visitors and LGBTQ+ wedding parties form a mainstream boutique-hotel audience. Bogotá’s tourism authority specifically notes many LGBTI guests and same-sex celebrations.",
    "dress_code": "No hotel dress code applies. Travel clothing is valid; smart-casual suits the restaurant and garden. External clubs set their own ID and outfit rules, and a HAB booking gives no door privilege.",
    "staff_inclusivity": "Bogotá’s official tourism guide identifies HAB’s inclusive policies and established same-sex wedding business, which is stronger evidence than a badge. Put chosen names, partner details and access requirements directly on the reservation.",
    "source_urls": ["https://habhotel.co/", "https://habhotel.co/where-to-find-us/", "https://bogota.gov.co/en/international/tourist-and-entertainment-venues-lgbti-community-bogota"]
  }$qa$::jsonb),
  (1194, $qa${
    "queue_wait": "Disco Jaguar is event-led and entry price varies by activity. Large concerts and anniversary dates can create ticket checks and capacity pressure; buy the named event and use Carrera 7 #59-30 rather than assuming fixed weekend doors.",
    "best_nights": "Thursday vinyl sessions offer the clearest recurring distinction. Concerts, afro/urban festivals, football broadcasts and regular dance bookings change the room completely; choose the programme, not a generic Saturday rule.",
    "crowd_mix": "Alternative music fans, artists, students, LGBTQ+ guests and general concert audiences share two rooms. The official city listing marks it suitable for LGBTI groups, but the audience follows the booking rather than staying exclusively queer.",
    "dress_code": "Creative casual, trainers and dance-ready layers suit the tropical, funk, dancehall and disco rooms. No permanent code is published. A live concert or themed festival may add its own age and bag rules.",
    "staff_inclusivity": "Visit Bogotá lists Disco Jaguar as suitable for LGBTI groups and provides direct venue contact. House and promoter teams share responsibility on event nights; identify both if harassment, access or ticketing needs escalation.",
    "source_urls": ["https://visitbogota.co/es/que-hacer-en-bogota/cultura/disco-jaguar", "https://revistabombea.com/2026/08/programate-con-el-natural-flow-fest-de-disco-jaguar/", "https://www.instagram.com/discojaguar.bta/"]
  }$qa$::jsonb),
  (1195, $qa${
    "queue_wait": "Bar Chiquita’s current door is Carrera 14A #83-63, not Carrera 12A #79-25. Cover is published on weekly flyers; reserve by WhatsApp or arrive before the first 22:00/23:00 drag show to reduce capacity and ticket pressure.",
    "best_nights": "Wednesday karaoke, Thursday themed shows and Friday/Saturday pop-perreo parties offer concrete choices. Up to two drag shows can run nightly; use the current flyer because covers, performers and second-floor operation change weekly.",
    "crowd_mix": "Gay men, drag fans, mixed LGBTQ+ groups, tourists, birthdays and bachelorette parties form a deliberately broad audience. The official venue welcomes all genders while keeping queer performers and nightlife at the centre.",
    "dress_code": "Colourful clubwear, casual party clothes and drag-show glamour all work; no strict style code is published. Bring physical ID and a valid ticket code where required, and dress for pop/perreo dancing in a compact room.",
    "staff_inclusivity": "The venue calls itself different, diverse and fun, centres working drag queens and publicly welcomes all genders. A 2026 guest specifically names the door host as protective; report a concern to that host or management immediately.",
    "source_urls": ["https://www.barchiquita.com/en/bar-chiquita-bogota/", "https://www.barchiquita.com/", "https://tikipal.com.co/bogota/chiquitabar"]
  }$qa$::jsonb),
  (1196, $qa${
    "queue_wait": "El Perro y La Calandria remains registered in 2026, with recent guest activity, but online schedules conflict sharply. Treat it as event-led and confirm by Instagram before travel; do not rely on the database’s seven-day hours.",
    "best_nights": "Recent listings point to Friday/Saturday late operation, while older guides describe karaoke and mixed bar formats. Use a dated post or direct message to verify the active room; there is no honest universal weekday recommendation.",
    "crowd_mix": "Gay and LGBTQ+ Chapinero regulars, karaoke participants and local bar-goers form the documented historic audience. Sparse current programming evidence means the exact 2026 mix should be learned from the night’s post, not invented.",
    "dress_code": "Casual neighbourhood bar clothing is the safest assumption; no current dress policy is published. Carry a warm layer and physical ID, and follow any specific event flyer if the operator announces karaoke or a party.",
    "staff_inclusivity": "The business retains a 2026 commercial registration and historic LGBTI recognition, but no current staff policy is public. Confirm opening directly and use the bar manager for conduct issues; do not label it trans-certified without evidence.",
    "source_urls": ["https://www.instagram.com/elperroylacalandria/", "https://assets.ctfassets.net/n1ptkpqt763u/7xbReSlS28ONvmTheOarex/062852c808b8778d104802a0dbc141ef/_7873__28_de_Marzo_de_2026_publicado_30_de_Marzo_de_2026.pdf", "https://untappd.com/v/el-perro-y-la-calandria/14007201"]
  }$qa$::jsonb),
  (1197, $qa${
    "queue_wait": "Saint Moritz opens from 13:00, closing 21:00 Sunday–Thursday, 22:00 Friday and midnight Saturday. Reception handles entry rather than a club line; Saturday programmes and private group dates increase locker and facility demand.",
    "best_nights": "Saturday offers the longest session and fullest programme; weekday afternoons are calmer. Check the current Bogotá calendar for orgy, massage or promotion formats because each creates a different sexual and social intensity.",
    "crowd_mix": "Adult gay and bisexual men, local regulars, visitors and booked private groups use a 500-square-metre men-focused sauna. Programme nights can shift age and fetish emphasis; no source supports a mixed-gender default.",
    "dress_code": "Towel or nudity is standard beyond changing, with wet-area footwear strongly practical. Store phones and valuables, follow posted consent rules and select private rooms, sauna, steam, jacuzzi or massage services deliberately.",
    "staff_inclusivity": "The operator clearly publishes its gay-men sauna purpose, staffed phone contact and massage catalogue. Recent 2026 reviews repeatedly praise cleanliness and staff attention; ask reception directly about trans-men admission before travelling.",
    "source_urls": ["https://saintmoritzsaunas.com/", "https://www.instagram.com/saintmoritz_bog/", "https://wanderlog.com/es/place/details/6062001/sauna-saint-moritz"]
  }$qa$::jsonb),
  (1198, $qa${
    "queue_wait": "Sofitel Victoria Regia is a mainstream luxury hotel with 24-hour reception. Standard afternoon turnover, valet and event arrivals cause the practical wait; confirm check-in time, bed type and accessible room with the booking channel.",
    "best_nights": "Use it for Zona T dining, polished service and northern nightlife access rather than an in-house queer programme. Pride and major city weekends raise rates; quieter weekdays suit business and restaurant-focused stays.",
    "crowd_mix": "International luxury travellers, couples, executives and restaurant guests form a mainstream five-star audience. LGBTQ+ visitors are normal guests, but the property is neither queer-owned nor a dedicated community hotel.",
    "dress_code": "No dress rule applies at reception. Smart-casual suits the restaurant and bar; travel clothes remain valid. External clubs have independent ID and outfit policies, and hotel status does not bypass them.",
    "staff_inclusivity": "Accor publishes global LGBTQ+ inclusion commitments, but no current source proves specialist training for every Bogotá shift. Put chosen name, partner recognition and accessibility details in writing and escalate through the 24-hour manager if mishandled.",
    "source_urls": ["https://sofitel.accor.com/en/hotels/0561.html", "https://all.accor.com/a/en/sustainability/people/diversity-inclusion.html"]
  }$qa$::jsonb),
  (1199, $qa${
    "queue_wait": "Video Club opens Friday/Saturday 21:00–05:00. Current 2026 reviews describe a line to enter followed by further internal waits; buy the event, arrive near doors and know that leaving can invalidate the wristband.",
    "best_nights": "Choose the promoter and room: techno/electronic floors and a Latin-reggaeton area coexist, while queer collectives can change the balance. Neither Friday nor Saturday is automatically queer without the named event.",
    "crowd_mix": "Bogotá electronic regulars, students, tourists, queer clubbers and Latin-room dancers share a mainstream multi-room warehouse. Specific LGBTQ+ promoters create a more queer-centred crowd than an ordinary house booking.",
    "dress_code": "Dark casual ravewear, trainers and sweat-ready layers suit the industrial floor. No strict code is published. Travel light because seating is scarce, and keep the wristband intact if the event prohibits re-entry.",
    "staff_inclusivity": "Video Club provides house security and event staff but publishes no queer-specific welfare policy. Recent reviews flag queues, high cover and no re-entry, so clarify charges and exit terms at the door and identify the promoter’s reporting contact.",
    "source_urls": ["https://www.instagram.com/videoclubx/", "https://es.restaurantguru.com/Video-Club-Bogota", "https://www.arrivalguides.com/en/Dynamic/Download?dest=BOGOTA&lang=en&partner=arrivalguides"]
  }$qa$::jsonb),
  (1200, $qa${
    "queue_wait": "Cómplices opens daily 14:00–21:00. Reception controls entry to the wet zone and massage services; reserve treatments or call before a weekend visit. It is daytime/evening spa use, not a post-club 24-hour operation.",
    "best_nights": "Choose a weekday for quieter sauna and wet-zone use or weekend afternoon for more social circulation. A booked massage or current promotion is a more useful planning anchor than claiming one universal party night.",
    "crowd_mix": "Adult gay men, wellness clients, local regulars and visitors use Bogotá’s long-running gay sauna/spa. Massage customers and sexual/social wet-zone guests may overlap, but this is not a mixed public health spa.",
    "dress_code": "Simple stored clothing, towel use and non-slip footwear are practical. Confirm whether a service is therapeutic, relaxation-focused or sexual before booking, and follow privacy, hygiene and consent rules throughout the wet area.",
    "staff_inclusivity": "Cómplices identifies itself as Bogotá’s largest gay sauna/spa with 28 years of operation and publishes daily hours plus direct WhatsApp. Reception is the concrete escalation point; ask directly about trans-men access rather than assuming.",
    "source_urls": ["https://complicesspa.com/zona-humeda/", "https://linktr.ee/ComplicesSpa"]
  }$qa$::jsonb),
  (1201, $qa${
    "queue_wait": "La Estación is a large café-bar in a heritage house, usually walk-in early. Friday/Saturday food, karaoke and pre-Theatron traffic fill tables; reserve or arrive before the late programme. This is the canonical record for the venue.",
    "best_nights": "Thursday through Saturday provide the strongest café-to-nightlife transition; earlier weekday hours favour food and conversation. Use Instagram for the live karaoke, show or themed calendar rather than the old generic Monday/Thursday claim.",
    "crowd_mix": "Gay men, lesbians, mixed LGBTQ+ groups, long-time Chapinero regulars, diners and visitors share an intergenerational community room. Earlier service is broad and social; later entertainment becomes more visibly queer.",
    "dress_code": "Smart-casual, everyday café clothes and colourful karaoke looks all fit. There is no strict door wardrobe. Bring a Bogotá evening layer and dress for a table that may become a standing party.",
    "staff_inclusivity": "The operator describes Estación as an icon of Bogotá’s gay culture and has served LGBTQ+ gathering needs for decades. Staff manage food, reservations and entertainment in one house, giving guests clear floor and management contacts.",
    "source_urls": ["https://estacioncafecolombia.com/", "https://www.instagram.com/laestacionchapinero/", "https://www.idt.gov.co/sites/default/files/4.2%20Gu%C3%ADa%20LGBTI%20Espa%C3%B1ol.pdf"]
  }$qa$::jsonb),
  (1202, $qa${
    "queue_wait": "Brokeback Mountain is a four-floor LGBTQ+ club operating through a normal bar door. Weekend late traffic creates the largest capacity pressure; arrive earlier to choose a floor and verify the current schedule on Instagram before travel.",
    "best_nights": "Friday/Saturday are the clearest full-club dates. The first floor is general party, the second popular Colombian music, the third crossover and the top floor is rentable; choose a room rather than expecting one soundtrack.",
    "crowd_mix": "Gay men, mixed LGBTQ+ groups, popular-music fans, birthdays and Chapinero bar-hoppers move among four floors. Each music room changes the age and social mix; the venue remains explicitly LGBTI-centred.",
    "dress_code": "Casual Colombian nightlife clothes, trainers and expressive queer looks fit. No permanent fetish rule is published. Dress for stairs, multiple temperatures and the floor you intend to use.",
    "staff_inclusivity": "Visit Bogotá explicitly classifies Brokeback Mountain as an LGBTI club, giving the house team a clear community mandate. Floor staff and security are the immediate reporting points; private-event renters do not replace house responsibility.",
    "source_urls": ["https://visitbogota.co/es/que-hacer-en-bogota/cultura/brokeback-mountain", "https://www.instagram.com/brokebackmountainbar/"]
  }$qa$::jsonb),
  (1669, $qa${
    "queue_wait": "Federal opens every night from 21:00; Friday begins at 20:00. Booking can provide free entry, while birthdays and weekend rooftop capacity create the strongest door pressure. Reserve and bring the confirmation plus physical ID.",
    "best_nights": "Friday/Saturday run to 04:00 for the fullest Colombian crossover party; Sunday–Thursday close around 03:00 and are easier. This is a 365-day mainstream Latin rooftop, not a recurring queer night.",
    "crowd_mix": "Zona T tourists, birthdays, local friend groups, couples and crossover dancers form a broad mainstream crowd. LGBTQ+ guests attend, but the building does not centre them or publish a queer-specific programme.",
    "dress_code": "Polished casual and nightlife-ready shoes fit the Zona T rooftop. No official strict code is published, but reservations and birthday groups create a more styled atmosphere than Chapinero’s alternative clubs.",
    "staff_inclusivity": "Federal documents reservations, table service and direct management contact, but no current queer or trans staff policy. Treat it as a mainstream business: place chosen-name or access needs on the reservation and escalate to the floor manager.",
    "source_urls": ["https://federalrooftop.com/", "https://federalrooftop.com/federal-cc/"]
  }$qa$::jsonb),
  (1670, $qa${
    "queue_wait": "Octava is ticket and event-led, with support via WhatsApp and optional VIP tables. Thursday–Saturday doors are around 22:00; buy direct, arrive before the headline set and retain the ticket code for entry.",
    "best_nights": "Choose the electronic lineup, not Friday versus Saturday. Resident and touring house/techno bills shape sound and audience; the official calendar is the only reliable indicator of whether a night suits queer visitors.",
    "crowd_mix": "Electronic-music regulars, Zona Rosa groups, VIP-table guests, tourists and some queer ravers form a mainstream club crowd. A specific promoter can broaden or queer the room, but Octava itself is not exclusively LGBTQ+.",
    "dress_code": "Octava’s own FAQ specifies free style, dark tones and a cosmic vibe. Comfortable trainers and dance-ready black layers fit; VIP styling is optional. Follow any extra promoter instruction on the ticket.",
    "staff_inclusivity": "The venue offers direct WhatsApp support, email and controlled ticket/VIP entry, but publishes no queer-specific awareness policy. Identify house security and promoter staff; report conduct to both when a touring production is involved.",
    "source_urls": ["https://www.octavaclub.com/", "https://www.octavaclub.com/faq"]
  }$qa$::jsonb),
  (1671, $qa${
    "queue_wait": "Mad Radio operates Wednesday–Saturday from 20:00 at Carrera 14A #82-42. Entry follows the live programme; arrive near doors for concerts or a sought-after DJ and use official Linktree directions rather than a generic 05:00 guarantee.",
    "best_nights": "Choose the artist or Music Lovers programme. Live bands, radio-style sessions and DJs can make Wednesday as useful as Saturday; the named booking matters more than a weekly queer assumption.",
    "crowd_mix": "Music fans, creative professionals, Zona T visitors, concert audiences and LGBTQ+ guests form a mainstream culture-led room. The audience follows the act and is not permanently a queer club crowd.",
    "dress_code": "Creative smart-casual and comfortable concert clothing fit. No strict code is published. Dress for a live set and late DJ continuation, with a warm layer for arrival and safe transport home.",
    "staff_inclusivity": "Mad Radio provides an identifiable venue team, artist channels and direct directions but no published LGBTQ+ welfare standard. Inclusion is partly artist/promoter dependent; locate security and the event producer before the room peaks.",
    "source_urls": ["https://linktr.ee/madradiobogota", "https://www.instagram.com/madradiobogota/"]
  }$qa$::jsonb),
  (1672, $qa${
    "queue_wait": "Proyecto Kinder is a large event campus in a former school, with ticket and security checks set per production. Buy the named event, bring ID and allow time for navigation; do not assume every Friday/Saturday opens all rooms.",
    "best_nights": "Choose the collective, art programme or electronic lineup. Kinder treats nightlife as a creative laboratory, so a concert, installation and techno event can differ more than two weekdays.",
    "crowd_mix": "Artists, students, electronic dancers, queer and trans clubbers, international visitors and Bogotá creative communities use a broad experimental centre. Specific collectives determine whether LGBTQ+ people are centred or simply included.",
    "dress_code": "Expressive underground clothing, durable shoes and layers for a large former-school complex are practical. No universal fashion code is published. Read the promoter’s theme, privacy and bag rules before arrival.",
    "staff_inclusivity": "Kinder’s manifesto explicitly says it fosters difference and diversity and treats nightlife as a cultural field. That creates a house value, but each event needs visible welfare execution; identify production staff and security on entry.",
    "source_urls": ["https://proyectokinder.com/", "https://proyectokinder.com/inicio/manifiesto/"]
  }$qa$::jsonb),
  (1673, $qa${
    "queue_wait": "El Coq is a mainstream Zona Rosa club whose current schedule is primarily social-led. Popular Thursday and weekend bookings can create face-control and capacity waits; verify the live Instagram before relying on the database’s historic hours.",
    "best_nights": "Thursday has historically been the distinctive midweek party, while Friday/Saturday depend on the DJ booking. Use the current flyer; there is no evidence that any regular night is permanently queer.",
    "crowd_mix": "Zona Rosa professionals, fashion and hospitality circles, tourists, electronic/crossover dancers and some LGBTQ+ guests make a styled mainstream crowd. It is not a dedicated community venue.",
    "dress_code": "Polished nightlife clothing and intentional shoes suit the upscale district; avoid assuming Chapinero warehouse casual. Because no current official code is indexed, follow the week’s flyer and carry physical ID.",
    "staff_inclusivity": "El Coq has a staffed commercial door and bar operation but no current public queer or trans policy. Guest inclusion therefore rests on ordinary anti-discrimination duties and manager response, not an unsupported safe-space label.",
    "source_urls": ["https://www.instagram.com/elcoqcoq/", "https://visitbogota.co/en/what-to-do-in-bogota/gastronomy/zona-t"]
  }$qa$::jsonb),
  (1674, $qa${
    "queue_wait": "Capri is event-led with online ticket codes, reservations, capacity control and optional VIP tables. Its current platform shows no published upcoming agenda, so confirm an active event before travelling to the old Calle 83 address.",
    "best_nights": "There is no verified recurring Wednesday, Friday or Saturday schedule at present. Choose only a dated event from the official ticket platform or Instagram; archived Solid Ground copy is not enough to promise an open club.",
    "crowd_mix": "When active, the audience follows the electronic promoter, tables and ticketed production. With no current agenda, there is no responsible 2026 crowd claim and no basis for classifying every future event as queer-friendly.",
    "dress_code": "Not determinable without an active event. Electronic clubwear and trainers may fit past programming, but the next promoter controls theme, age and door expectations. Read the dated ticket before dressing.",
    "staff_inclusivity": "The platform documents security and capacity control but no queer-specific policy or current event team. Confirm who is producing the night and its reporting channel; leave the operation marked event-unverified until a date appears.",
    "source_urls": ["https://capri-club.venuemaster.co/", "https://www.instagram.com/capriclub_official/"]
  }$qa$::jsonb),
  (1675, $qa${
    "queue_wait": "San Sebastián is a small adults-only hotel with reception rather than nightlife entry. Confirm the unusually listed 14:00 check-in/check-out directly and send arrival time; the active booking address is Calle 62 #9-49.",
    "best_nights": "Use it for walking access to Theatron, a sauna and simple Chapinero accommodation—not hotel events. Friday/Saturday improve nightlife convenience but also street noise; weekdays make the small property quieter.",
    "crowd_mix": "Adult leisure guests, couples and LGBTQ+ nightlife travellers form a small hotel audience. Its gay-district location and adults-only rule are relevant, but current sources do not establish queer ownership.",
    "dress_code": "No hotel dress code applies. Pack ordinary travel clothes and keep club outfits inside the room. Confirm visitor rules before assuming a nightlife guest may return with you.",
    "staff_inclusivity": "Current 2026 guests rate staff highly, and the adults-only property serves the Chapinero nightlife market, but no specialist trans policy is published. Put chosen name, bed setup and visitor expectations in writing before arrival.",
    "source_urls": ["https://www.booking.com/hotel/co/boutique-san-sebastian-bogota.es.html", "https://boutique-san-sebastian.greatbogotahotels.com/es/"]
  }$qa$::jsonb),
  (1676, $qa${
    "queue_wait": "Living 55 has only 16 apartment-suites, so check-in is a small reception process rather than a large hotel queue. Send arrival time, bring booking ID and confirm the exact desk coverage and 15:00 check-in before travel.",
    "best_nights": "Stay for a kitchenette-equipped base near Zona G and Chapinero nightlife. Weekends suit going out; longer weekdays make the apartment format more useful and reduce late street traffic.",
    "crowd_mix": "Independent travellers, couples, longer-stay guests and business visitors form a mainstream apartment-hotel mix. LGBTQ+ guests benefit from location but the operator does not present Living 55 as queer-owned or community-specific.",
    "dress_code": "No dress rule applies. Travel clothes and quiet apartment wear are sufficient; external nightlife controls its own door. Pack for self-catering if the kitchenette is part of the booking decision.",
    "staff_inclusivity": "Hoteles Grace publishes direct phone and mobile contacts for this 16-unit property but no queer-specific staff policy. Add chosen name, partner details and access needs to the reservation and request written confirmation.",
    "source_urls": ["https://www.hotelesgrace.com/hotel-living-55-2/", "https://www.hotelesgrace.com/wp-content/uploads/2023/12/POLICY-PROTECTION-OF-PERSONAL-DATA-PDF.pdf"]
  }$qa$::jsonb),
  (1677, $qa${
    "queue_wait": "The Nudist Mansion is a private-room B&B booked through Naturist BnB, not a walk-in venue. Contact host Fabian, confirm acceptance, address and arrival time, and never appear without a completed reservation.",
    "best_nights": "Choose a stay for consensual clothing-optional accommodation, shared lounges and terraces rather than public nightlife. Availability is calendar-led; weekdays and longer bookings may offer lower rates.",
    "crowd_mix": "Registered adult naturist guests share a small private house. The listing is clothing-optional/nude and does not state a gay-only audience; do not treat it as a cruising club or assume sexual access to other guests.",
    "dress_code": "The property lists clothing-optional and nude-only features, but exact zones must be agreed with the host. Bring a towel, respect seated hygiene and consent, and keep clothing available for arrival and shared boundaries.",
    "staff_inclusivity": "Host Fabian publicly communicates in Spanish and English and describes body-reconnection rather than sexual service. Inclusion depends on clear house rules; ask about gender mix, accessibility, nudity zones and visitor consent before booking.",
    "source_urls": ["https://www.naturistbnb.com/properties/primer-proyecto-naturista-en-bogota/", "https://www.naturistbnb.com/owners/pfprojet/"]
  }$qa$::jsonb),
  (1678, $qa${
    "queue_wait": "Grace Chapinero is a small suite hotel; check-in begins around 15:00 and arrival should be confirmed directly. Its correct address is Carrera 9A #61-13. Weekend nightlife traffic affects the street more than the lobby.",
    "best_nights": "Book for kitchenette suites, duplexes, a picnic-style terrace and immediate Chapinero nightlife access. A weekday stay is calmer; Friday/Saturday maximises nearby venues but can increase neighbourhood noise.",
    "crowd_mix": "Couples, independent travellers, longer-stay visitors and nightlife guests make a mainstream suite-hotel audience. The location is useful to LGBTQ+ travellers, but no current source establishes queer ownership or a dedicated guest community.",
    "dress_code": "There is no hotel dress code. Travel and terrace clothing are enough; carry the separate outfit and physical ID required by nearby clubs. Confirm visitor access rather than assuming an apartment layout permits unregistered guests.",
    "staff_inclusivity": "The hotel provides direct landline/mobile contacts and clearly identifies its current operation. No queer-specific staff training is published, so place chosen name, partner recognition and any mobility request in writing before arrival.",
    "source_urls": ["https://www.hotelesgrace.com/grace-chapinero/", "https://www.hotelesgrace.com/wp-content/uploads/2023/12/POLICY-PROTECTION-OF-PERSONAL-DATA-PDF.pdf"]
  }$qa$::jsonb),
  (1679, $qa${
    "queue_wait": "ESTELAR Suites Jones is a mainstream hotel with a 24-hour operation and standard check-in around 15:00. Afternoon turnover and conferences are the likely desk peak; book direct and confirm breakfast, insurance and pet fees.",
    "best_nights": "Use it for spacious rooms, Zona G dining, six meeting rooms and a practical base near Chapinero. Weekdays suit business travel; Pride and weekend nightlife dates should be booked earlier.",
    "crowd_mix": "Business guests, families, couples, pet owners and conference groups form a mainstream hotel audience. LGBTQ+ travellers are regular guests, but the property does not function as a queer social venue.",
    "dress_code": "No dress code applies at reception or Plaza Café. Smart-casual fits Kuzina and meetings; ordinary travel clothes are valid. External bars control their own admission policies.",
    "staff_inclusivity": "Bogotá’s LGBTI tourism guide records a Friendly Biz certification for Suites Jones, providing venue-specific inclusion evidence. Still place names, partner details and accessible-room needs on the booking so the front desk can execute them.",
    "source_urls": ["https://www.estelarsuitesjones.com/en/", "https://www.estelarsuitesjones.com/es/mapa/", "https://bdigital.uexternado.edu.co/bitstreams/ec7087eb-f94d-4b87-a50a-e94d73cf333a/download"]
  }$qa$::jsonb),
  (1680, $qa${
    "queue_wait": "Petunia is a daily 08:00–21:00 bakery-café. Pride brunches and community meetings can fill the pink room; reserve for a programmed gathering or arrive outside lunch. Use the current Carrera 4A #58-51 listing.",
    "best_nights": "Daytime and early evening are the actual product; Pride brunch and It Gets Better meetings are the clearest community dates. This is not a late-night bar, so use a dated post rather than inventing weekend party hours.",
    "crowd_mix": "Trans employees, LGBTQ+ community members, families, dessert visitors and Chapinero neighbours share an all-ages café. Pride programming brings the strongest queer concentration; ordinary days remain broadly public.",
    "dress_code": "Everyday café clothing and bright expressive style both fit; there is no door code. Dress for brunch, cake and conversation rather than nightlife, and bring a layer for Bogotá weather.",
    "staff_inclusivity": "Petunia provides unusually concrete evidence: Bogotá tourism identifies it as Colombia’s first bakery to formally employ trans people, with 15 workers wearing Pride insignia and community meetings against school homophobia.",
    "source_urls": ["https://visitbogota.co/en/node/145", "https://www.idt.gov.co/sites/default/files/Guia-LGBTI-Digital.pdf", "https://www.instagram.com/petuniareposteria/"]
  }$qa$::jsonb),
  (1681, $qa${
    "queue_wait": "Diosa Teusaquillo is a reservable brewery/restaurant open roughly 10:00–22:00 Monday–Saturday and to 17:00 Sunday. Weekend brunch and cultural programmes pressure tables; reserve when an exhibition or performance is listed.",
    "best_nights": "Choose a cultural event, live-music date or weekend brunch. Daytime supports food, coffee and work; evening adds craft beer. The Teusaquillo, Candelaria and NADA collaborations are separate locations, so verify the flyer.",
    "crowd_mix": "Women, queer guests, artists, craft-beer drinkers, diners, families and neighbourhood regulars share an accessible, pet-friendly cultural gastropub. It is broad and feminist/queer-friendly rather than a nightlife club.",
    "dress_code": "Everyday restaurant clothing, creative workwear and event-ready casual all fit. There is no fashion gate. Dress for indoor/outdoor seating and choose practical transport if drinking craft beer.",
    "staff_inclusivity": "Current directories identify women-led diversity management, wheelchair-accessible seating and bathroom, and LGBTQ-friendly service. The cultural programme provides visible staff; bring access, food or conduct concerns to the floor manager.",
    "source_urls": ["https://www.instagram.com/diosacerveceria/", "https://www.bienalbogota.com/sites/default/files/2025-09/Bog25_Directorio_Distritos_Creativos_Agenda_Alterna_v20250925.pdf", "https://es.cybo.com/CO-biz/diosa-cervecer%C3%ADa-teusaquillo"]
  }$qa$::jsonb),
  (1682, $qa${
    "queue_wait": "This is a duplicate of La Estación Café at Calle 62 #7-13/19. Do not route visitors or reservations through a second listing. The active venue, current social link and full intelligence belong to canonical place ID 1201.",
    "best_nights": "No independent programme exists for this duplicate. Use ID 1201 for current food, karaoke and event guidance. Maintaining two calendars would create false capacity and duplicate Bogotá’s community statistics.",
    "crowd_mix": "This row has no separate audience. It duplicates the same longstanding LGBTQ+ café-bar and heritage house represented by ID 1201; the crowd must be counted only once.",
    "dress_code": "No separate door or dress policy belongs to this record. Consult canonical ID 1201 for the real venue’s café, dinner and karaoke expectations at Calle 62.",
    "staff_inclusivity": "There is no second team to assess. La Estación’s LGBTQ+ community history and staff reporting routes belong to ID 1201; rejecting and deindexing this row prevents misleading inclusion data.",
    "source_urls": ["https://estacioncafecolombia.com/", "https://www.instagram.com/laestacionchapinero/"]
  }$qa$::jsonb),
  (1683, $qa${
    "queue_wait": "A Seis Manos is a restaurant and multidisciplinary cultural venue rather than a club door. Reserve for a named concert, exhibition, language exchange or workshop; more than 3,000 hosted events make programmed evenings busier than an ordinary meal.",
    "best_nights": "Choose the dated programme, not a generic weekend: concerts, exhibitions, fairs, workshops and language events create distinct audiences. The venue is normally open Monday–Saturday 11:30–23:30 and closed Sunday.",
    "crowd_mix": "Downtown artists, students, international language-exchange visitors, cultural workers, diners and LGBTQ+ guests share a broad creative audience. It is an inclusive multidisciplinary centre, not a permanently queer-exclusive venue.",
    "dress_code": "Everyday creative casual fits the restaurant, gallery and concert space; there is no fashion gate. Dress for the named activity and Bogotá evening weather, and keep bags manageable when a standing concert fills the room.",
    "staff_inclusivity": "A Seis Manos has an identifiable cultural team and a long public record of cross-cultural programming, but no published queer-specific staff certification. Raise access, identity or conduct concerns with the event producer or floor lead on duty.",
    "source_urls": ["https://aseismanos.com.co/contacto.html", "https://catalogoentretenimiento.visitbogota.co/entretenimiento/seis-manos"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id=590 then jsonb_build_object('operating_status','closed_deindexed')
       when id=1191 then jsonb_build_object('operating_status','public_nightlife_corridor_not_managed_venue')
       when id=1682 then jsonb_build_object('operating_status','duplicate_record_deindexed')
       when id=1674 then jsonb_build_object('operating_status','current_operation_unverified')
       when id=1196 then jsonb_build_object('operating_status','active_schedule_requires_same_day_confirmation')
       when id in (1194,1198,1199,1669,1670,1671,1672,1673,1683) then jsonb_build_object('operating_status','active_event_led_mainstream_venue')
       when id in (1675,1676,1678,1679) then jsonb_build_object('operating_status','active_mainstream_accommodation')
       when id=1677 then jsonb_build_object('operating_status','active_private_naturist_accommodation')
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

-- Closed, duplicate, misclassified and currently unverifiable listings must not be indexed.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (590,1191,1674,1682);

-- Current operational corrections found during the venue-by-venue review.
update public.places set location='Calle 58 Bis #10-32, Bogotá, Colombia',hours='Thu-Sat 21:00-05:00; event cover and room access vary.',link='https://www.portaltheatron.co/en',updated_at=timezone('utc',now()) where id=586;
update public.places set location='Carrera 8 #64-29, Bogotá, Colombia',hours='Mon 11:00-21:30; Tue-Thu 11:30-22:30; Fri 11:30-02:00; Sat 12:00-02:00; Sun closed.',link='https://www.instagram.com/villagebogota/',updated_at=timezone('utc',now()) where id=588;
update public.places set location='Carrera 9 #59-09, Bogotá, Colombia',hours='Thu-Sat 17:00-03:00; verify the current event post.',link='https://www.facebook.com/profile.php?id=924492074281366',updated_at=timezone('utc',now()) where id=589;
update public.places set hours='Permanently closed; retained only as a deindexed historical record.',link='https://www.instagram.com/vintrashbar/',updated_at=timezone('utc',now()) where id=590;
update public.places set location='Calle 12D #4-20, Bogotá, Colombia',hours='Event-specific at the current La Candelaria location; verify the dated programme.',link='https://www.instagram.com/boogaloopclub/',updated_at=timezone('utc',now()) where id=591;
update public.places set location='Calle 59 #9-34, Bogotá, Colombia',hours='Open 24 hours daily.',link='https://x.com/DagoasS',updated_at=timezone('utc',now()) where id=592;
update public.places set hours='Public nightlife district; individual businesses set their own hours.',link='https://bogota.gov.co/mi-ciudad/gobierno/zonas-seguras-bogota',description='A public nightlife corridor within Chapinero’s Distrito Diverso, not a managed venue and not a cruising location. Use verified businesses as destinations and registered transport for the return journey.',updated_at=timezone('utc',now()) where id=1191;
update public.places set location='Calle 59 #9-36, Bogotá, Colombia',hours='Daily approximately 13:00/14:00-05:00; confirm same-day opening.',updated_at=timezone('utc',now()) where id=1192;
update public.places set link='https://habhotel.co/',updated_at=timezone('utc',now()) where id=1193;
update public.places set location='Carrera 7 #59-30, Bogotá, Colombia',hours='Event-led; confirm the dated doors and room schedule.',updated_at=timezone('utc',now()) where id=1194;
update public.places set location='Carrera 14A #83-63, Bogotá, Colombia',hours='Wed-Thu 21:00-02:00; Fri-Sat 21:00-04:00; shows commonly begin around 22:00/23:00.',link='https://www.barchiquita.com/en/bar-chiquita-bogota/',updated_at=timezone('utc',now()) where id=1195;
update public.places set hours='Event-led; current operation is registered but confirm the same-day schedule before travel.',updated_at=timezone('utc',now()) where id=1196;
update public.places set location='Calle 65 #13-30, Piso 2, Bogotá, Colombia',hours='Sun-Thu 13:00-21:00; Fri 13:00-22:00; Sat 13:00-00:00.',link='https://saintmoritzsaunas.com/',updated_at=timezone('utc',now()) where id=1197;
update public.places set link='https://www.sofitel-bogota-victoriaregia.com/',updated_at=timezone('utc',now()) where id=1198;
update public.places set location='Calle 64 #13-09, Bogotá, Colombia',hours='Fri-Sat 21:00-05:00; confirm the current flyer and ticket conditions.',updated_at=timezone('utc',now()) where id=1199;
update public.places set location='Carrera 13A #38-60, Bogotá, Colombia',hours='Daily 14:00-21:00.',link='https://complicesspa.com/zona-humeda/',updated_at=timezone('utc',now()) where id=1200;
update public.places set location='Calle 62 #7-13/19, Bogotá, Colombia',hours='Café-bar and programme-led hours; confirm the current social post.',link='https://estacioncafecolombia.com/',updated_at=timezone('utc',now()) where id=1201;
update public.places set hours='Event-led multi-floor club; verify the current flyer for doors and cover.',link='https://visitbogota.co/en/what-to-do-in-bogota/nightlife/brokeback-mountain',updated_at=timezone('utc',now()) where id=1202;
update public.places set hours='Mon-Thu and Sun until 03:00; Fri-Sat until 04:00; minimum age 21, Friday minimum age 20.',updated_at=timezone('utc',now()) where id=1669;
update public.places set hours='Thu-Sat 22:00-04:00; event ticket and table conditions vary.',updated_at=timezone('utc',now()) where id=1670;
update public.places set hours='Wed-Sat from 20:00; closing and programme vary by event.',updated_at=timezone('utc',now()) where id=1671;
update public.places set hours='Event-specific; use the current programme for doors, age and ticketing.',updated_at=timezone('utc',now()) where id in (1672,1673);
update public.places set hours='No current event schedule verified; listing deindexed until a dated programme returns.',updated_at=timezone('utc',now()) where id=1674;
update public.places set hours='Adults-only hotel; check-in and reception schedule must be confirmed with the booking.',updated_at=timezone('utc',now()) where id=1675;
update public.places set name='Living 55',location='Calle 55 #10-73, Bogotá, Colombia',hours='Apartment hotel; check-in from approximately 15:00, confirm desk coverage before arrival.',link='https://www.hotelesgrace.com/hotel-living-55-2/',updated_at=timezone('utc',now()) where id=1676;
update public.places set location='Calle 39 #18-34, Bogotá, Colombia',hours='Private accommodation by confirmed reservation only.',link='https://www.naturistbnb.com/properties/primer-proyecto-naturista-en-bogota/',updated_at=timezone('utc',now()) where id=1677;
update public.places set location='Carrera 9A #61-13, Bogotá, Colombia',hours='Suite hotel; check-in from approximately 15:00, confirm arrival directly.',link='https://www.hotelesgrace.com/grace-chapinero/',updated_at=timezone('utc',now()) where id=1678;
update public.places set hours='24-hour hotel operation; check-in from approximately 15:00.',link='https://www.estelarsuitesjones.com/en/',updated_at=timezone('utc',now()) where id=1679;
update public.places set location='Carrera 4A #58-51, Bogotá, Colombia',hours='Daily 08:00-21:00.',link='https://www.instagram.com/petuniareposteria/',updated_at=timezone('utc',now()) where id=1680;
update public.places set location='Carrera 19 #36-55, Bogotá, Colombia',hours='Mon-Sat 10:00-22:00; Sun 10:00-17:00.',link='https://www.instagram.com/diosacerveceria/',updated_at=timezone('utc',now()) where id=1681;
update public.places set hours='Duplicate of place ID 1201; do not use this record for visits or statistics.',link='https://estacioncafecolombia.com/',updated_at=timezone('utc',now()) where id=1682;
update public.places set location='Calle 22 #8-60, Bogotá, Colombia',hours='Mon-Sat 11:30-23:30; Sun closed; event times vary.',link='https://aseismanos.com.co/',updated_at=timezone('utc',now()) where id=1683;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places
  where id in (586,588,589,590,591,592,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683)
    and venue_intel->>'updated_at'='2026-08-30T00:00:00Z';
  if updated_count<>33 then raise exception 'Expected 33 repaired Bogotá profiles, found %',updated_count; end if;

  select count(*) into invalid_fields from public.places p
  cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
  where p.id in (586,588,589,590,591,592,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683)
    and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every Bogotá intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;

  select count(*) into duplicate_fields from (
    select f.key,f.value,count(*) from public.places p
    cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
    where p.id in (586,588,589,590,591,592,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683)
    group by f.key,f.value having count(*)>1
  ) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate Bogotá intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
