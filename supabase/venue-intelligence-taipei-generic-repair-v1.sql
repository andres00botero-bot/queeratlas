-- Queer Atlas Venue Intelligence: Taipei generic-copy repair.
-- Research rechecked 2026-08-30. Replaces generic text for exactly 29 records.
-- Eight profiles researched on 2026-08-29 are intentionally untouched.

begin;

with researched(id, profile) as (
  values
  (602, $qa${
    "queue_wait":"Café Dalida uses the Red House terrace at Lane 10, Chengdu Road. Ordinary early evenings are walk-in; drag and weekend tables tighten after 21:00. Arrive before show time or message the venue for a group rather than assuming an outdoor seat will remain free.",
    "best_nights":"Weeknights suit cocktails and conversation; Friday/Saturday bring the busiest terrace and late cabaret energy. Check Dalida's current social post for drag and special events because the plaza atmosphere changes more by programme than by a fixed weekly rule.",
    "crowd_mix":"Gay men, drag audiences, mixed LGBTQ+ groups, Taipei regulars and international visitors form an open-air social crowd. Early terrace hours span ages; weekend late periods are denser and more visitor-heavy as people start a wider Ximending route.",
    "dress_code":"Casual terrace clothing, date-night looks and full drag all fit; there is no formal code. Dress for heat or rain and bring cash as a fallback. The outdoor seating does not remove ordinary consent or photography etiquette.",
    "staff_inclusivity":"Dalida is an established gay café-bar with drag programming, so queer service is core rather than inferred. Bar staff and the show host are visible reporting routes; bring harassment, misgendering or unwanted photography to them promptly.",
    "source_urls":["https://www.instagram.com/cafedalidataipei/","https://zh-tw.travelgay.com/gay-map-of-taipei","https://wom.com.tw/guides/taipei-gay-bar-guide?lang=en"]
  }$qa$::jsonb),
  (603, $qa${
    "queue_wait":"Commander D is a small basement fetish bar at B1, 36 Kaifeng Street Sec. 2. Theme nights can reach capacity and use a cover or minimum charge; check the current post, carry physical ID and arrive near opening instead of joining after-midnight pressure.",
    "best_nights":"Select the announced rope, gear, underwear or social theme; an ordinary night is much calmer and less performance-led. The event brief matters more than weekday, especially for dress expectations, cover and who the format centres.",
    "crowd_mix":"Gay and bisexual men, fetish regulars, curious first-timers and international visitors make a male-focused adult crowd. A named event may narrow the audience, but interest in kink never implies consent to touch, photograph or participate.",
    "dress_code":"Read the event: street clothes may be accepted on social nights, while gear or underwear can be encouraged for a theme. Bring a secure bag for changing, keep phones controlled and never mistake fetish presentation for consent.",
    "staff_inclusivity":"Staff run explicit gay-men and fetish programming and can explain the night's boundaries at the door. Ask the host before entry about gender admission, access or dress; report consent violations immediately to bar or security staff rather than managing them alone.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://www.travelgay.com/venue/commander-d","https://wom.com.tw/guides/taipei-gay-bar-guide?lang=en"]
  }$qa$::jsonb),
  (604, $qa${
    "queue_wait":"G-Paradise sits at 47 Lane 10, Chengdu Road in the Red House cluster. The terrace is usually walk-in, but bear events and weekend tables fill after 21:00. Start earlier for seating and bring cash as a payment fallback.",
    "best_nights":"An early weekday offers an easy bear-bar conversation; Friday/Saturday give the fullest plaza social scene. Check current posts for bear or performer themes, then use G-Paradise as a first stop before clubs rather than expecting an all-night dance floor.",
    "crowd_mix":"Bears, bigger men, admirers, gay friends and visitors are especially visible, alongside the broader mixed Red House LGBTQ+ crowd. The identity focus is welcoming, not a body requirement; early hours tend to be more conversational and age-diverse.",
    "dress_code":"Relaxed casual, bear-scene style and ordinary tourist clothing all fit without a formal code. Prepare for outdoor weather, tight terrace tables and possible cash payment. Body type or masculinity is never an admission rule.",
    "staff_inclusivity":"G-Paradise deliberately serves bear and gay communities, giving staff experience with a broader body and age range than image-led clubs. Report body-shaming or harassment to the bar team; ask directly about step access or seating needs before peak.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://wom.com.tw/guides/taipei-gay-bar-guide?lang=en"]
  }$qa$::jsonb),
  (605, $qa${
    "queue_wait":"Chance Bar is at 10 Lane 27, Chengdu Road and trades from afternoon into late night. Walk-ins are normal, but weekend cocktails and theme nights compress the small room; reserve if offered or arrive before 21:00 for easier seating and service.",
    "best_nights":"Afternoon and early evening suit cocktails and conversation; Friday/Saturday continue later and create the stronger queer social bar. Check the live event feed for themes because a special host matters more than a generic 'weekend is best' claim.",
    "crowd_mix":"Taipei LGBTQ+ locals, gay men, mixed friendship groups, dates and international visitors share a friendly cocktail crowd. Earlier service is broader and quieter; late weekends draw people moving through Ximending's bar route.",
    "dress_code":"Casual city clothing and polished date-night looks both work; no fixed club code is published. Carry a weather layer for walking between bars and keep bags small in the compact interior.",
    "staff_inclusivity":"Chance programmes queer nightlife and accepts reservations through current hospitality channels, making bar staff the direct support route. Ask the duty lead to address harassment, misgendering or drink-safety concerns instead of assuming the intimate layout self-polices.",
    "source_urls":["https://www.opentable.com.tw/restaurant/profile/191783","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (606, $qa${
    "queue_wait":"Mudan occupies the Red House lanes at roughly 43–45 Lane 10, Chengdu Road. Outdoor tables are usually walk-in and cash-led; Friday/Saturday demand rises after 21:00. Arrive early for a seat and confirm any minimum order before settling in.",
    "best_nights":"A weekday sunset visit preserves the relaxed outdoor bar; weekend late evening delivers the fullest gay plaza atmosphere. Use current posts for performers or themes and expect many guests to move onward around 23:00.",
    "crowd_mix":"Gay men, Taipei regulars, mixed queer groups and travellers share Mudan's terrace, with a social rather than dance-floor emphasis. The Red House location produces more first-time visitors than a neighbourhood bar.",
    "dress_code":"Easy terrace wear, date-night casual and expressive queer looks are all normal. Bring cash, mosquito/weather protection when useful and avoid blocking narrow shared lanes with luggage.",
    "staff_inclusivity":"Mudan operates inside Taipei's openly gay Red House cluster and serves LGBTQ+ guests as its core trade. The bar team can handle seating and conduct concerns; ask directly about accessible placement because outdoor tables and lane surfaces vary.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://wom.com.tw/guides/taipei-gay-bar-guide?lang=en"]
  }$qa$::jsonb),
  (607, $qa${
    "queue_wait":"C.U.M is a queer party organiser using changing host venues, not a fixed club. Buy only through the dated official ticket page and follow that edition's address, doors, age and last entry; the database must never route visitors to a permanent C.U.M location.",
    "best_nights":"Attend a named C.U.M drag ball, Pride party or collaboration that matches your community and music interests. There is no weekly best night. A 2026 event at Riverside Live House does not make that host C.U.M's permanent home.",
    "crowd_mix":"Queer and trans dancers, drag and ballroom communities, artists, allies and international visitors shift with each production. Read who the organiser explicitly centres; the host venue's normal audience is not evidence for the party crowd.",
    "dress_code":"Follow the edition's concept: expressive fashion and performance looks may be celebrated, but no permanent costume applies. Host-venue ID, bag and search rules remain controlling, and photographing drag or ballroom guests requires permission.",
    "staff_inclusivity":"C.U.M's all-gender queer programming is concrete, while welfare and access responsibility is shared with each host. Use the named organiser and venue contacts for harassment or access; never promise a fixed staff team across editions.",
    "source_urls":["https://cumpartytw.kktix.cc/?locale=zh-TW","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (608, $qa${
    "queue_wait":"Rainbow Spa survives mainly in old travel references, with no reliable current operator, booking channel, address confirmation or 2026 hours. Do not travel or pay a third party from this record; keep it deindexed until primary and recent independent evidence agree.",
    "best_nights":"There is no defensible current best time. Use an active Taipei sauna or massage provider with verified reception and same-day contact rather than inheriting Rainbow Spa's historical schedule.",
    "crowd_mix":"No current audience can be described responsibly. An old gay-men spa label does not establish present admission, age mix, services or whether the business exists under another name.",
    "dress_code":"No verified house rules exist. Do not copy towel, nudity, footwear or phone guidance from another business; a current operator must publish or explain those procedures before this record returns.",
    "staff_inclusivity":"No active staff, consent policy, health link or complaint route could be verified. Deindexing prevents an obsolete listing from falsely promising queer-aware service or help on site.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://www.travelgay.com/destination/gay-taiwan/gay-taipei"]
  }$qa$::jsonb),
  (609, $qa${
    "queue_wait":"In Touch is an appointment-led men's massage spa at 20 Alley 3, Lane 165, Zhongxiao East Road Sec. 5. Book a therapist and treatment through the official channel; arrive before the slot for consultation rather than expecting sauna-style walk-in admission.",
    "best_nights":"Choose by therapist availability and treatment, not nightlife. A weekday daytime appointment is typically calmer; the final booking is around the venue's published last-appointment window, so confirm duration before choosing a late slot.",
    "crowd_mix":"Adult male clients seeking professional massage and wellness are the service audience. This is not a communal gay sauna, bar or cruising room; other clients' identity, treatment and interest must remain private.",
    "dress_code":"Arrive in comfortable clothing and follow the therapist's draping and changing instructions. State pressure, boundaries and medical concerns before treatment. A men's spa or therapist profile never implies sexual services.",
    "staff_inclusivity":"The official site provides named treatments, reservations and direct contact, giving clients an accountable professional route. Staff inclusion here means respectful male-client care, privacy and consent; raise boundary concerns immediately and end a treatment if needed.",
    "source_urls":["https://www.in-touch-spa.com.tw/contact_us.php","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (610, $qa${
    "queue_wait":"Prime Spa is a men's massage business, not a sauna. Contact the current operator for a timed therapist booking, exact address and price; do not arrive expecting lockers, communal wet areas or an unstructured walk-in stay.",
    "best_nights":"Select a treatment and available therapist rather than a party night. Book earlier in the day when you need language, pressure or accessibility discussion, and confirm the appointment again before crossing Taipei.",
    "crowd_mix":"Individual adult male massage clients use a private professional service. There is no shared nightlife crowd to predict, and another guest's sexual orientation or treatment choice must not be inferred.",
    "dress_code":"Comfortable arrival clothing is sufficient; the therapist should explain changing, draping and touch boundaries. State pain, pressure and no-go areas before the session. Massage must not be presented as implied sexual contact.",
    "staff_inclusivity":"A legitimate massage appointment requires consent, privacy, clear pricing and a way to stop the treatment. Prime is listed in the current gay spa category, but no detailed trans or access policy was found; ask before booking rather than promising coverage.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://www.travelgay.com/destination/gay-taiwan/gay-taipei"]
  }$qa$::jsonb),
  (1690, $qa${
    "queue_wait":"OMNI is a large mainstream superclub at 5F, 201 Zhongxiao East Road Sec. 4. Major DJ dates create ID, ticket, dress and security lines from late evening; prebook through the official event, arrive before peak and confirm table entry separately.",
    "best_nights":"Choose the actual DJ or queer-friendly promoter; a normal EDM, hip-hop or bottle-service night is not automatically LGBTQ+ centred. Wednesday-to-weekend operation varies, so lineup and ticket terms outrank weekday advice.",
    "crowd_mix":"Taipei clubbers, university-age groups, bottle-service tables, international visitors and electronic fans form a mainstream mixed audience. Explicit Pride or queer collaborations can shift the room, but OMNI is not a permanent gay club.",
    "dress_code":"Polished mainstream clubwear and closed, dance-suitable shoes are safest; avoid beachwear and large bags. Carry passport or accepted physical ID and read the event's dress notice. Expressive queer style may be visible without being a protected door category.",
    "staff_inclusivity":"OMNI has professional security and management but no verified permanent LGBTQ+ welfare programme. For a queer event, identify the promoter's contact as well as venue security; report harassment immediately and do not equate occasional queer attendance with specialist staff training.",
    "source_urls":["https://www.omni-taipei.com/","https://www.instagram.com/omni_taipei/"]
  }$qa$::jsonb),
  (1691, $qa${
    "queue_wait":"Green World Zhonghua has staffed hotel reception near Ximending; afternoon check-in and group turnover create the real wait. Confirm early bag storage and the exact window or accessible-room category before arrival rather than treating the property as nightlife.",
    "best_nights":"Stay for walkable access to the Red House queer bars and Ximen transport, not for hotel programming. Friday/Saturday make nightlife easiest but increase area noise and rates; weekdays better suit sightseeing and a calmer lobby.",
    "crowd_mix":"Tour groups, families, couples, solo visitors and LGBTQ+ travellers form a mainstream city-hotel audience. Proximity to the gay village is valuable, but it does not turn other guests or hotel spaces into queer community programming.",
    "dress_code":"No hotel dress rule applies; ordinary travel clothes are appropriate. Pack a separate outfit and photo ID for nearby bars, whose rules remain independent. Select luggage compactly if booking a smaller city room.",
    "staff_inclusivity":"Reception and formal hotel management provide an escalation route, but no property-specific queer or trans training standard was verified. Put chosen name, partner and room configuration in writing and ask the duty manager to correct errors.",
    "source_urls":["https://zhonghua.greenworldhotels.com/en/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1692, $qa${
    "queue_wait":"The Okura Prestige Taipei is a full-service luxury hotel with 24-hour reception; peak check-in, groups and restaurant reservations are the likely waits. Confirm early arrival, airport transfer and an accessible room directly before travel.",
    "best_nights":"Choose it for luxury accommodation, dining and Zhongshan access, not a recurring queer event. Weekends favour leisure and nearby nightlife, while weekdays can be business-heavy; spa and restaurant bookings need their own reservations.",
    "crowd_mix":"International luxury travellers, business guests, couples, families and LGBTQ+ visitors form a mainstream hotel audience. Inclusion should be assessed through service, not by labelling the property or its other guests queer.",
    "dress_code":"Travel clothing is valid at reception; smart casual suits restaurants and lounges, with pool/spa attire confined to facilities. External LGBTQ+ venues set their own ID and dress rules.",
    "staff_inclusivity":"A luxury hotel provides concierge and management escalation, but no property-specific LGBTQ+ certification or trans policy was verified. Add chosen name, partner treatment, bed setup and access needs to the reservation, then confirm them before arrival.",
    "source_urls":["https://www.okurataipei.com.tw/en","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1693, $qa${
    "queue_wait":"Grey Area at 57-3 Zhongshan North Road Sec. 1 is reported permanently closed, and no current operator or 2026 programme could be verified. Do not travel or buy from an unofficial event using the old club name.",
    "best_nights":"No present night exists. Historical multi-floor queer electronic parties explain the archive entry, but Pawnshop, 23 Music Room or a dated independent promoter listing should be used for current planning.",
    "crowd_mix":"The former venue served queer underground and electronic audiences, but it has no current crowd. That identity and safety reputation cannot be transferred to a new party without verified continuity.",
    "dress_code":"No active door policy applies. Ignore old Funktion-One, lounge and underground styling advice; use the current host's ID, bag, photo and clothing rules for any successor event.",
    "staff_inclusivity":"No current Grey Area management, security or welfare route was found. Deindexing is necessary because a closed venue cannot provide staff inclusion, incident escalation or access assistance.",
    "source_urls":["https://taipei.gaycities.com/bars/310562-grey-area","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1694, $qa${
    "queue_wait":"HERO is upstairs at 15-2 Kunming Street and shifts from karaoke/social bar to later DJ energy. Friday/Saturday entry and minimum-spend processing can slow after 22:00; arrive earlier, ask the charge before ordering and keep the receipt.",
    "best_nights":"Tuesday–Thursday and Sunday suit karaoke and conversation; Friday/Saturday run later and bring the fuller multi-floor party. Check the current post because performance and DJ use of the upper levels can change.",
    "crowd_mix":"Gay men, karaoke groups, younger dancers, older regulars and international visitors share the venue, with weekends more crowded. Women and mixed LGBTQ+ friends can be present; it should not be described as men-only.",
    "dress_code":"Casual karaoke clothing, fitted nightlife outfits and expressive queer style fit without a fetish requirement. Carry physical ID, keep bags manageable on stairs and clarify any minimum spend at entry.",
    "staff_inclusivity":"HERO programmes gay nightlife, but current guest reports include inconsistent treatment of foreign and older patrons. Ask staff to state charges clearly, keep proof of payment and escalate differential service to the manager before placing a large order.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://www.travelgay.com/venue/hero-bar"]
  }$qa$::jsonb),
  (1695, $qa${
    "queue_wait":"Inhouse Hotel Ximending uses staffed reception in a busy pedestrian district. Afternoon check-in and weekend arrivals create the relevant wait; confirm luggage storage, room window and taxi drop-off because the street environment can complicate arrival.",
    "best_nights":"Stay for immediate Ximending dining and a short walk to Red House queer bars, not hotel nightlife. Friday/Saturday maximise going-out convenience but increase street noise; weekdays suit shopping and transit.",
    "crowd_mix":"Couples, international tourists, solo travellers and LGBTQ+ visitors form a mainstream boutique-hotel audience. Its gay-village proximity is practical, but neither lobby nor guests should be labelled queer by location.",
    "dress_code":"No reception code applies. Ordinary travel clothing is fine; pack weather protection for the Red House terraces and physical ID for external bars. Room size and storage matter more than fashion.",
    "staff_inclusivity":"The hotel has reception and management escalation, but no current property-level LGBTQ+ training statement was verified. Put chosen name, partner and bed setup into the booking and address misgendering or unequal treatment with the duty manager.",
    "source_urls":["https://www.inhousehotel.com/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1697, $qa${
    "queue_wait":"Matt Bar appears in Taipei's current gay-bar map, but a dependable official schedule is not consistently published. Verify the latest social post and address before travel; the small room is more likely to hit seating capacity than create a formal club line.",
    "best_nights":"Use a current event or bartender post to choose the visit. An early drink supports conversation; late weekends bring the denser gay-bar audience. Avoid inventing a weekly theme from archived listings.",
    "crowd_mix":"Gay men, Taipei locals and visitors form the core social-bar audience, with the exact age and style mix changing by host. The limited current evidence does not support promising a bear, karaoke or dance crowd on a fixed night.",
    "dress_code":"Casual barwear and expressive queer style should work, but no verified formal code is available. Carry physical ID and a cash fallback; use only a newly dated event brief for stronger outfit guidance.",
    "staff_inclusivity":"Current queer-directory presence supports a gay-bar identity, but no detailed staff training, access or incident policy was found. Ask the bartender about entry and seating before paying, and escalate conduct concerns directly rather than relying on generic reputation.",
    "source_urls":["https://zh-tw.travelgay.com/gay-map-of-taipei","https://www.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1698, $qa${
    "queue_wait":"The Landis Taipei is a full-service hotel with staffed reception; normal check-in, tour and banquet traffic create the wait. Confirm airport transfer, accessible-room details and luggage handling directly rather than treating its gay-travel listing as nightlife access.",
    "best_nights":"Use the Zhongshan property for accommodation, restaurants and city access, not a queer programme. Weekend stays suit leisure and nightlife; weekdays may bring business and event groups. Reserve dining separately.",
    "crowd_mix":"Business guests, international tourists, couples, families and LGBTQ+ travellers share a mainstream upscale hotel. Queer-friendly directory inclusion should not be rewritten as queer ownership or a community crowd.",
    "dress_code":"Travel clothes are appropriate at reception; smart casual suits hotel restaurants. Nearby nightlife establishes separate ticket, ID and dress requirements, so pack for the actual destination.",
    "staff_inclusivity":"The Landis offers concierge-led service and a manager-on-duty path for complaints. Its queer-travel listing does not document staff training, so email couple treatment and pronoun requests beforehand; keep the written reply if reception handles them differently.",
    "source_urls":["https://taipei.landishotelsresorts.com/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1699, $qa${
    "queue_wait":"Chez Nous Bar is inside the hotel at 18 Lane 147, Xinyi Road Sec. 3. The small sophisticated room is reservation-friendly and closes around 01:00; book weekend seating and confirm last entry because current official and directory hours differ slightly.",
    "best_nights":"Tuesday–Saturday evening is the clearest current official window. Choose a specifically advertised gay party for community energy; on ordinary nights the bar is a polished mixed hotel cocktail destination.",
    "crowd_mix":"Hotel guests, cocktail dates, LGBTQ+ visitors and a mainstream local audience share the room. Occasional gay events bring more gay and bisexual men, but the everyday bar should not be labelled exclusively queer.",
    "dress_code":"Smart casual and date-night clothing fit the hotel bar; no formal code is published. Carry ID for late drinks and avoid assuming a queer-event costume on an ordinary service night.",
    "staff_inclusivity":"The hotel bar has direct reservations, reception and management contacts, while gay events establish some community familiarity. No detailed trans or accessibility protocol is published; put needs into the reservation and use the duty manager for unequal service.",
    "source_urls":["https://www.cheznoushotel.com/bare.php","https://www.travelgay.com/venue/chez-nous-bar"]
  }$qa$::jsonb),
  (1702, $qa${
    "queue_wait":"amba Taipei Ximending has 24-hour hotel reception inside the Ximen commercial area. Peak check-in and lift traffic, not club entry, are the likely waits; confirm the building entrance, bag storage and exact room category before arrival.",
    "best_nights":"Stay for Ximending shopping and walkability to the Red House queer bars. Weekends maximise nightlife access but bring denser streets; weekdays are calmer for city exploration. Hotel dining and events have separate schedules.",
    "crowd_mix":"Independent travellers, couples, families, creative city visitors and LGBTQ+ guests make a mainstream design-hotel audience. Location near gay nightlife is useful but does not establish a queer-only social environment.",
    "dress_code":"Everyday travel clothes fit reception and common areas; use smart casual where a restaurant requests it. Bring weather-ready terrace clothing and ID for external bars, whose rules are unrelated to the hotel.",
    "staff_inclusivity":"amba's design-hotel desk and guest-service team are the practical contacts for room or identity issues. Because no public trans-care standard was found, message the Ximending property with the exact guest names and bedding request and retain its confirmation.",
    "source_urls":["https://www.amba-hotels.com/en/ximending/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1703, $qa${
    "queue_wait":"G.Star is active at B1, 23 Longjiang Road and current nights can run until early morning. Pride, drag and weekend dates produce a real basement line; check the official post for cover and drink tickets, arrive near opening and carry physical ID.",
    "best_nights":"Choose the announced GoGo, drag, K-pop or DJ format. Wednesday-to-Sunday operation and occasional closures vary, so a current poster is more useful than declaring Saturday universally best.",
    "crowd_mix":"Young gay men are prominent alongside drag audiences, mixed LGBTQ+ groups, women friends, international students and visitors. Pride periods broaden the room; it remains a gay-centred club rather than a men-only space.",
    "dress_code":"Fashion-forward clubwear, pop looks and comfortable dance clothing fit; theme nights may encourage more. Bring physical ID, keep bags small and understand cover/drink-ticket tiers before entry. No permanent fetish code applies.",
    "staff_inclusivity":"G.Star runs current gay, drag and GoGo programming, so LGBTQ+ service is central. Door staff should explain pricing and admission; find the floor manager for harassment or drink safety and ask in advance about step access to the basement.",
    "source_urls":["https://www.instagram.com/gstartaipei/","https://www.travel.taipei/file/35575/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1704, $qa${
    "queue_wait":"Roaders Hotel uses 24-hour reception near Taipei Main/Ximending. Afternoon room turnover and family arrivals cause the wait; confirm luggage storage, window type and any basement/common-area access before arrival.",
    "best_nights":"Use it as a playful central base for transport and queer nightlife, not an LGBTQ+ programme. Weekend nights make Ximending easier but raise demand; weekdays favour rail connections and sightseeing.",
    "crowd_mix":"Families, couples, solo tourists, younger travellers and LGBTQ+ guests form a mainstream themed-hotel audience. Gay-travel listings indicate practical suitability, not a queer community crowd.",
    "dress_code":"Ordinary travel clothing is appropriate. Pack a separate nightlife outfit and physical ID for Red House bars or clubs, and keep luggage manageable for the booked room.",
    "staff_inclusivity":"Reception and hotel management provide a clear service route, but no property-specific queer or trans training policy was found. Put chosen name, partner, bedding and access requests into the booking, then verify them at check-in.",
    "source_urls":["https://www.roadershotel.com/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1708, $qa${
    "queue_wait":"Riverview Suites Taipei is a hotel arrival, not a nightlife door. Afternoon check-in, coaches and lift traffic can create delays; confirm whether reception is shared with Hotel Riverview, plus luggage storage and the exact room view before travel.",
    "best_nights":"Choose it for a quieter Ximending-edge stay and access to Red House nightlife. Friday/Saturday suit going out but can add area traffic; weekdays are calmer. The hotel itself has no verified recurring queer programme.",
    "crowd_mix":"Tourists, tour groups, couples and LGBTQ+ city visitors share a mainstream accommodation audience. Nearby gay venues do not make the property or other guests community-specific.",
    "dress_code":"No reception code applies. Travel clothing is fine; bring weather protection for the walk and separate ID/outfits for external nightlife. Smart casual may suit hotel dining.",
    "staff_inclusivity":"A staffed reception and management hierarchy offer formal escalation, but no property-specific LGBTQ+ training statement was verified. Confirm chosen name, couple setup and accessibility details in writing, especially if two connected hotel brands share services.",
    "source_urls":["https://suites.riverview.com.tw/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1709, $qa${
    "queue_wait":"Taipei I/O is a gay men's sauna at 49 Lane 12, Shuangcheng Street. Reception and lockers can tighten during current theme events; verify the same-day post, bring physical ID and ask price, closing time and re-entry before paying.",
    "best_nights":"Current listings show event-led periods such as Thursday underwear programming. Choose the announced theme if it fits, or an earlier weekday for a calmer first orientation; do not rely on one archived weekly schedule.",
    "crowd_mix":"Adult gay and bisexual men, Taipei locals and visitors use the men-focused sauna. Theme nights can shift age and style, but no guest's clothing, body or presence signals consent.",
    "dress_code":"Use lockers and follow reception's towel, underwear and footwear rules for that event. Keep phones away from intimate spaces, secure valuables and obtain explicit consent for every interaction.",
    "staff_inclusivity":"A current gay-sauna listing and live themed events confirm an operating men-focused venue. Reception is the route for consent, hygiene and service issues; ask before purchase about trans admission, mobility, safer-sex supplies and any event-specific rule.",
    "source_urls":["https://www.travelgay.com/destination/gay-taiwan/gay-taipei","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1710, $qa${
    "queue_wait":"Palais de Chine is a large luxury hotel beside Taipei Main Station. Rail arrivals, group check-in and banquets can pressure reception and lifts; confirm airport transfer, luggage storage and an accessible room before travel.",
    "best_nights":"Use the hotel for transport, dining and a central city stay rather than queer programming. Weekends suit leisure and Ximending nightlife; weekdays can bring business and banquet traffic. Restaurant reservations are separate.",
    "crowd_mix":"International tourists, rail travellers, business guests, couples, families and LGBTQ+ visitors form a mainstream upscale audience. A gay-friendly travel listing does not make common areas a queer social hub.",
    "dress_code":"Travel clothes are appropriate at reception; smart casual or formalwear may suit the hotel's dining rooms. External queer venues set their own ID, ticket and clothing policies.",
    "staff_inclusivity":"Palais de Chine has concierge and banquet-scale guest services, but its public material does not evidence LGBTQ+ training. Send the front office the guest's chosen name, couple setup and mobility detail, then ask them to read the notes back before arrival.",
    "source_urls":["https://www.palaisdechinehotel.com/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1712, $qa${
    "queue_wait":"23 Music Room is an event-led electronic venue at Taipei Expo Park, shop 18, 1 Yumen Street. Buy the named ticket and use its door time; high-profile lineups create searches, cloakroom pressure and late queues, so arrive before the peak.",
    "best_nights":"Follow the artist or promoter. Techno, live-electronic and queer collaborations attract different audiences, and there is no useful generic weekday. Check the event's age, last entry and transport-home plan.",
    "crowd_mix":"Electronic-music listeners, local creatives, international visitors and mixed queer-friendly ravers form a music-first audience. An explicit LGBTQ+ promoter offers stronger community centring; ordinary bookings are not automatically gay nights.",
    "dress_code":"Practical dancewear, individual underground style and comfortable shoes suit the room. Read the event's photo, bag and ID rules; expressive queer clothing can fit without functioning as an admission requirement.",
    "staff_inclusivity":"At 23 Music Room, the ticketing promoter controls much of the guest experience while house staff control the room. Save both contacts before a queer edition; ask at entry who handles welfare, then report unwanted conduct to that named person without delay.",
    "source_urls":["https://ra.co/clubs/211813","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1713, $qa${
    "queue_wait":"Pawnshop is a basement electronic club at B1, 279 Xinyi Road Sec. 4. Popular techno bookings create ticket, ID, search and entry pressure after midnight; prebuy, arrive near doors and check the event's last-entry and no-photo rules.",
    "best_nights":"Choose the lineup or queer promoter, not the weekday. A music-first techno date and an LGBTQ+-centred collaboration can feel very different. Confirm set times and a safe trip home because sessions run late.",
    "crowd_mix":"Serious local ravers, DJs, international visitors and queer-friendly electronic communities form a mixed underground crowd. Queer guests are visible, but Pawnshop is not permanently a gay club; promoter intent determines who is centred.",
    "dress_code":"Functional black or expressive clubwear, comfortable shoes and minimal bags suit the industrial room. Respect no-photo practice and carry physical ID. No costume or fetish requirement applies unless a named event says so.",
    "staff_inclusivity":"Pawnshop's queer-friendly reputation comes through programming, while venue security remains the first operational contact. For community-specific support, identify the promoter or awareness contact; report harassment promptly instead of treating underground culture as self-regulating.",
    "source_urls":["https://ra.co/clubs/155887","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1715, $qa${
    "queue_wait":"WESTGATE Hotel has 24-hour reception beside Ximen Station. Peak afternoon check-in and tour arrivals create the wait; confirm early bag drop, airport transfer and the exact room or accessibility feature before travel.",
    "best_nights":"WESTGATE is strongest when an almost door-to-door Ximen MRT return matters after Red House drinks. Pride and weekend dates demand earlier booking; a midweek stay trades that buzz for easier station movement and quieter mornings.",
    "crowd_mix":"WESTGATE draws short-stay Ximen shoppers, metro users, couples, families and queer nightlife visitors. Expect an ordinary busy city-hotel lobby; its Red House convenience says nothing about another guest's identity or interest in socialising.",
    "dress_code":"Ordinary travel clothing works at reception; hotel dining may suit smart casual. Bring rain/heat layers for the outdoor bar plaza and separate physical ID for clubs.",
    "staff_inclusivity":"WESTGATE's central front desk can resolve room and service errors. No published queer-care protocol was found, so place the guest's actual name and couple setup in the reservation; if either is changed at check-in, request correction before keys are issued.",
    "source_urls":["https://www.westgatehotel.com.tw/","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb),
  (1716, $qa${
    "queue_wait":"228 Peace Memorial Park is a public historic park, not a staffed queer venue. There is no door or managed queue; museum areas and official facilities keep their own hours. Use daylight and public paths rather than seeking secluded access.",
    "best_nights":"Visit in daytime for the memorial landscape, museum context and civic history. Do not publish a cruising hour or secluded route: lighting, policing, maintenance and public use change, and the site's memorial purpose deserves respect.",
    "crowd_mix":"Residents, families, students, tourists, memorial visitors and queer people share public space. No one present should be presumed LGBTQ+, cruising or interested in contact based on location, eye contact or solitude.",
    "dress_code":"Wear weather-appropriate city clothing and respectful attire for memorial spaces. Public-decency rules, consent and photography etiquette always apply; clothing or presence is never an invitation.",
    "staff_inclusivity":"Park and museum personnel are civic staff, not a queer welfare team. Use official staff or emergency services for safety issues and never describe an unmonitored section as a managed LGBTQ+ safe space.",
    "source_urls":["https://www.travel.taipei/en/attraction/details/524","https://www.228.org.tw/en/"]
  }$qa$::jsonb),
  (1717, $qa${
    "queue_wait":"Hotel Midtown Richardson uses high-volume reception near Ximen Station. Tour groups and afternoon check-in can create substantial lobby and lift waits; confirm bag storage, room window and accessible route before arrival.",
    "best_nights":"Choose it for transport and short walking access to Red House queer nightlife, not in-house programming. Weekends provide easy late returns but more groups and street noise; weekdays are calmer for sightseeing.",
    "crowd_mix":"Tour groups, families, couples, solo travellers and LGBTQ+ guests form a large mainstream hotel audience. Nearby gay bars are a location advantage, not evidence that the property or its guests are queer-centred.",
    "dress_code":"No reception dress code applies. Ordinary travel clothing is fine; pack compactly for city rooms and carry separate nightlife attire and photo ID for external venues.",
    "staff_inclusivity":"A staffed front desk and duty management provide escalation, but no hotel-specific queer competency policy was verified. Record chosen name, partner, bed and mobility requests in writing and reconfirm them before accepting the room.",
    "source_urls":["https://www.midtownrichardson.com/en/Midtown%2BRichardson","https://zh-tw.travelgay.com/gay-map-of-taipei"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id in (608,1693) then jsonb_build_object('operating_status','closed_or_current_operation_unverified_deindexed')
       when id=607 then jsonb_build_object('operating_status','active_event_organizer_no_fixed_venue')
       when id in (609,610) then jsonb_build_object('operating_status','active_appointment_led_massage_service')
       when id=1690 then jsonb_build_object('operating_status','active_mainstream_superclub')
       when id in (1691,1692,1695,1698,1702,1704,1708,1710,1715,1717) then jsonb_build_object('operating_status','active_mainstream_accommodation')
       when id in (1712,1713) then jsonb_build_object('operating_status','active_event_led_electronic_venue')
       when id=1716 then jsonb_build_object('operating_status','public_memorial_park_not_managed_venue')
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

-- Records that are closed, unverified, organizer-only or public spaces cannot remain indexed as fixed venues.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (607,608,1693,1716);

-- Operational and classification corrections verified during this review.
update public.places set location='No. 51, Lane 10, Chengdu Road, Wanhua District, Taipei, Taiwan',link='https://www.instagram.com/cafedalidataipei/',hours='Sun-Thu approximately 19:00-03:00; Fri-Sat 18:00-04:00; verify current event.',updated_at=timezone('utc',now()) where id=602;
update public.places set location='B1, No. 36, Section 2, Kaifeng Street, Wanhua District, Taipei, Taiwan',hours='Usually approximately 20:00-02:00; theme events vary.',updated_at=timezone('utc',now()) where id=603;
update public.places set location='No. 47, Lane 10, Chengdu Road, Wanhua District, Taipei, Taiwan',hours='Daily evening service, commonly approximately 18:00-02:00; verify current post.',updated_at=timezone('utc',now()) where id=604;
update public.places set location='No. 10, Lane 27, Chengdu Road, Wanhua District, Taipei, Taiwan',hours='Daily from approximately 14:00; closes around 03:00, Fri-Sat around 04:00.',updated_at=timezone('utc',now()) where id=605;
update public.places set location='Lane 10, Chengdu Road, Wanhua District, Taipei, Taiwan',hours='Daily late-afternoon/evening service; verify current closing time.',updated_at=timezone('utc',now()) where id=606;
update public.places set hours='Event organizer without a permanent venue; use the dated ticket for host address and doors.',link='https://cumpartytw.kktix.cc/?locale=zh-TW',description='Queer party and drag/ballroom organizer using changing Taipei host venues. This row is deindexed as a fixed place; follow only a current dated event.',updated_at=timezone('utc',now()) where id=607;
update public.places set hours='Current operation, operator and address unverified; do not travel from this listing.',description='Deindexed legacy spa record. No primary operator channel or reliable current 2026 listing could be verified.',updated_at=timezone('utc',now()) where id=608;
update public.places set type='service',location='No. 20, Alley 3, Lane 165, Section 5, Zhongxiao East Road, Xinyi District, Taipei, Taiwan',hours='Daily 11:30-22:30 by appointment; confirm the final booking time.',link='https://www.in-touch-spa.com.tw/contact_us.php',updated_at=timezone('utc',now()) where id=609;
update public.places set type='service',hours='Appointment-led massage service; confirm therapist, address, price and hours directly.',updated_at=timezone('utc',now()) where id=610;
update public.places set location='5F, No. 201, Section 4, Zhongxiao East Road, Da’an District, Taipei, Taiwan',link='https://www.omni-taipei.com/',hours='Event-led, commonly Wed-Sun from approximately 22:30; verify ticket and closing time.',updated_at=timezone('utc',now()) where id=1690;
update public.places set type='hotel',link='https://zhonghua.greenworldhotels.com/en/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1691;
update public.places set type='hotel',link='https://www.okurataipei.com.tw/en',hours='24-hour hotel operation; restaurants and spa require separate reservations.',updated_at=timezone('utc',now()) where id=1692;
update public.places set hours='Permanently closed according to current venue reporting; no 2026 programme verified.',description='Historical record for the former queer electronic venue Grey Area. It is not a current destination and remains deindexed.',updated_at=timezone('utc',now()) where id=1693;
update public.places set location='2F-4F, No. 15-2, Kunming Street, Wanhua District, Taipei, Taiwan',hours='Tue-Thu and Sun approximately 20:00-02:00; Fri-Sat 20:00-04:00; Mon closed.',updated_at=timezone('utc',now()) where id=1694;
update public.places set type='hotel',link='https://www.inhousehotel.com/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1695;
update public.places set hours='Current small-bar schedule changes; verify a newly dated official post before travel.',updated_at=timezone('utc',now()) where id=1697;
update public.places set type='hotel',link='https://taipei.landishotelsresorts.com/',hours='24-hour hotel operation; restaurants and facilities use separate schedules.',updated_at=timezone('utc',now()) where id=1698;
update public.places set location='No. 18, Lane 147, Section 3, Xinyi Road, Da’an District, Taipei, Taiwan',link='https://www.cheznoushotel.com/bare.php',hours='Current official page: Tue-Sat approximately 19:30-01:30; verify before travel.',updated_at=timezone('utc',now()) where id=1699;
update public.places set type='hotel',link='https://www.amba-hotels.com/en/ximending/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1702;
update public.places set location='B1, No. 23, Longjiang Road, Zhongshan District, Taipei, Taiwan',hours='Event-led, commonly Wed-Sun late night; verify the current official post.',updated_at=timezone('utc',now()) where id=1703;
update public.places set type='hotel',link='https://www.roadershotel.com/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1704;
update public.places set type='hotel',link='https://suites.riverview.com.tw/',hours='24-hour hotel operation; confirm reception, check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1708;
update public.places set location='No. 49, Lane 12, Shuangcheng Street, Zhongshan District, Taipei, Taiwan',hours='Event-led gay sauna; verify same-day hours, last admission and theme before travel.',updated_at=timezone('utc',now()) where id=1709;
update public.places set type='hotel',link='https://www.palaisdechinehotel.com/',hours='24-hour hotel operation; restaurants and facilities use separate schedules.',updated_at=timezone('utc',now()) where id=1710;
update public.places set location='Taipei Expo Park, Shop 18, No. 1, Yumen Street, Zhongshan District, Taipei, Taiwan',hours='Event-specific; use the ticket for doors, age and last entry.',link='https://ra.co/clubs/211813',updated_at=timezone('utc',now()) where id=1712;
update public.places set location='B1, No. 279, Section 4, Xinyi Road, Da’an District, Taipei, Taiwan',hours='Event-specific; use the ticket for doors, age and last entry.',link='https://ra.co/clubs/155887',updated_at=timezone('utc',now()) where id=1713;
update public.places set type='hotel',link='https://www.westgatehotel.com.tw/',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1715;
update public.places set hours='Public memorial park; museum and facility schedules vary.',link='https://www.travel.taipei/en/attraction/details/524',description='Public historic memorial park and museum context, not a managed queer venue. Visit respectfully and never infer identity, consent or interest from other park users.',updated_at=timezone('utc',now()) where id=1716;
update public.places set type='hotel',link='https://www.midtownrichardson.com/en/Midtown%2BRichardson',hours='24-hour hotel operation; confirm check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1717;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places where id in (602,603,604,605,606,607,608,609,610,1690,1691,1692,1693,1694,1695,1697,1698,1699,1702,1703,1704,1708,1709,1710,1712,1713,1715,1716,1717) and venue_intel->>'updated_at'='2026-08-30T00:00:00Z';
  if updated_count<>29 then raise exception 'Expected 29 repaired Taipei profiles, found %',updated_count; end if;
  select count(*) into invalid_fields from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (602,603,604,605,606,607,608,609,610,1690,1691,1692,1693,1694,1695,1697,1698,1699,1702,1703,1704,1708,1709,1710,1712,1713,1715,1716,1717) and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every Taipei intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;
  select count(*) into duplicate_fields from (select f.key,f.value,count(*) from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (602,603,604,605,606,607,608,609,610,1690,1691,1692,1693,1694,1695,1697,1698,1699,1702,1703,1704,1708,1709,1710,1712,1713,1715,1716,1717) group by f.key,f.value having count(*)>1) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate Taipei intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
