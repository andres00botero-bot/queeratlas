-- Queer Atlas venue-intelligence repair: 51 UI-hidden profiles across nine cities.
-- Research checked 2026-08-29. Hidden evidence states are replaced only when the
-- profile has venue-specific, visitor-useful content. Known duplicates, closures,
-- and a misclassified public facility are de-indexed below.

begin;

with researched(id, profile) as (
  values
  (857, $qa${
    "queue_wait":"Bar Queen is a compact late-night room; the practical pressure point is the door after midnight on Friday and Saturday. Arrive near opening for easier entry and confirm the night's cover on the venue's current social post.",
    "best_nights":"Friday and Saturday are the strongest late-night choices. Sunday starts earlier and is the better alternative when you want Queen's drag-led atmosphere without the same weekend peak.",
    "crowd_mix":"The room is centred on São Paulo's gay and broader LGBTQIA+ nightlife, with drag audiences, downtown regulars and visitors rather than a generic mixed cocktail crowd.",
    "dress_code":"No formal code is published. Expressive clubwear and drag-friendly looks fit the room; use closed, comfortable footwear for a small standing venue and keep valuables close in Santa Ifigênia.",
    "staff_inclusivity":"Queer performance is part of Bar Queen's core identity, not an occasional theme. No separate trans-inclusion or accessibility policy was found, so specific access needs should be confirmed directly before travel.",
    "source_urls":["https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/","https://www.instagram.com/barqueenoficial/"]
  }$qa$::jsonb),
  (858, $qa${
    "queue_wait":"Blue Space is a large show club, but its headline drag dates concentrate arrivals around showtime. Buy any advertised ticket in advance and arrive before the main performance block rather than joining the late door surge.",
    "best_nights":"Saturday is the main late club night; Sunday is known for the earlier drag-show format. Check the current programme because special anniversary and Casa Fluida events can replace the normal rhythm.",
    "crowd_mix":"A multigenerational LGBTQIA+ audience comes for large-scale drag, pop and go-go performance; regulars mix with visitors who know the club's long role in São Paulo's queer stage culture.",
    "dress_code":"There is no standing formal code. Performance-night clubwear, colourful queer styling and comfortable dance shoes are appropriate; follow any costume theme announced with the individual event.",
    "staff_inclusivity":"The venue's principal product is LGBTQIA+ drag performance and it has operated as a queer show house since the 1990s. That is strong community evidence, though no detailed written accessibility or anti-harassment policy was located.",
    "source_urls":["https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/","https://linktr.ee/casafluida","https://pt.wikipedia.org/wiki/Cultura_LGBTQIA%2B_na_cidade_de_S%C3%A3o_Paulo"]
  }$qa$::jsonb),
  (859, $qa${
    "queue_wait":"RG is an adult men's cruise bar rather than a conventional dance club. Entry is usually simpler near the 18:00 opening; Friday and Saturday demand rises later, so carry photo ID and check the current admission price and rules first.",
    "best_nights":"Friday and Saturday provide the longest published sessions and the largest social window. Tuesday to Thursday suit a quieter first visit; the venue is normally closed Sunday and Monday.",
    "crowd_mix":"The audience is adult gay and bisexual men, including Vila Mariana regulars and visiting men looking for a cruise-club setting. Do not present it as an all-community bar.",
    "dress_code":"Street clothes are suitable for arrival; any underwear, nudity or themed requirement belongs to the specific event. Bring only essentials and follow the venue's changing-room and consent rules inside.",
    "staff_inclusivity":"RG explicitly serves adult men in a gay cruise setting. Staff inclusion here means enforcing consent, privacy and the advertised men-only boundary; no broader all-gender inclusion claim is made.",
    "source_urls":["https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/","https://www.reddit.com/r/arco_iris/comments/1l3zs8p/"]
  }$qa$::jsonb),
  (861, $qa${
    "queue_wait":"This is a full-service Avenida Paulista hotel, so the relevant wait is reception rather than a nightlife queue. Online check-in details and an off-peak arrival reduce delays; Pride weekends can make the lobby and lifts substantially busier.",
    "best_nights":"Choose it for direct Avenida Paulista and Consolação access, especially during Pride and major city events. It is a base rather than a queer programme venue, so nights are determined by the city calendar.",
    "crowd_mix":"Business travellers, international visitors, couples and event guests share the property. Its Paulista location is convenient for LGBTQIA+ visitors, but the hotel is not presented as an LGBTQIA+-only property.",
    "dress_code":"No special dress code applies beyond normal hotel and restaurant standards. Streetwear is fine in the lobby; use the individual restaurant or event guidance for smarter occasions.",
    "staff_inclusivity":"Meliá publishes a group-level diversity and inclusion framework and the hotel operates professional 24-hour reception. Guests needing a specific name, title, room setup or accessibility arrangement should add it to the booking before arrival.",
    "source_urls":["https://www.melia.com/en/hotels/brazil/sao-paulo/melia-paulista","https://www.meliahotelsinternational.com/en/our-company/our-commitments/diversity-and-inclusion"]
  }$qa$::jsonb),
  (944, $qa${
    "queue_wait":"Ibirapuera is a public park, not a managed nightlife venue. There is no admission queue for ordinary pedestrian access, but museums, pavilions and large events can have their own ticket lines.",
    "best_nights":"Use daylight, early evening and programmed cultural events. Do not treat isolated after-dark areas as a recommended cruise venue; arrange transport before the park quietens.",
    "crowd_mix":"Runners, families, museum visitors, tourists and LGBTQIA+ residents use the same large civic park. Queer presence is real but does not make every area a dedicated or supervised queer space.",
    "dress_code":"Weather-ready park clothing, sun protection and walking shoes are appropriate. Carry little at night and do not display valuables on quieter paths.",
    "staff_inclusivity":"Park staff are municipal or facility-specific, not queer-venue hosts. Use official security and emergency channels for help; no claim is made that informal cruising areas are monitored as LGBTQIA+ safe spaces.",
    "source_urls":["https://www.parqueibirapuera.org/","https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/"]
  }$qa$::jsonb),
  (1916, $qa${
    "queue_wait":"Reception is staffed continuously; the main delay risk is the 14:00 check-in wave and Pride-weekend demand. Complete booking details in advance and ask about luggage storage if arriving before the room is ready.",
    "best_nights":"The property is most useful during Avenida Paulista events and Pride because it sits one block from MASP/Trianon access. It is accommodation, not an in-house queer nightlife venue.",
    "crowd_mix":"Apartment-style leisure guests, business travellers, families and Pride visitors mix here. The operator actively marketed the property to LGBTQIA+ Pride guests, but it is not community-exclusive.",
    "dress_code":"No special code applies. Casual city clothing is suitable throughout the apartments and lobby; pool and fitness areas require their normal facility clothing.",
    "staff_inclusivity":"Travel Inn explicitly marketed this property for São Paulo Pride with language of diversity, respect and celebration. That supports an LGBTQIA+-welcoming signal; add names, pronouns and room preferences to the reservation for a smoother check-in.",
    "source_urls":["https://www.travelinn.com.br/promocoes/a-parada-do-orgulho-lgbtqia/","https://book.omnibees.com/hotelresults?q=13058"]
  }$qa$::jsonb),
  (1920, $qa${
    "queue_wait":"Tunnel's late Friday/Saturday opening creates a concentrated post-midnight door. Check the specific party post, carry photo ID and arrive in the first hour if you want the least uncertain entry.",
    "best_nights":"Friday and Saturday are the verified operating nights. The crowd and music depend heavily on the promoter, so select the event rather than assuming every weekend has the same queer-pop format.",
    "crowd_mix":"The long-running club is associated with São Paulo's gay nightlife and drag/pop programming, attracting LGBTQIA+ clubbers, performers and mixed friends.",
    "dress_code":"No universal formal code is published. Use expressive clubwear and comfortable dance shoes; obey any party-specific theme and avoid bringing bulky items to a late, crowded room.",
    "staff_inclusivity":"The club's programme and history are LGBTQIA+-centred. No current detailed safer-space or trans-inclusion policy was found, so this profile does not infer how every outsourced door team handles incidents.",
    "source_urls":["https://www.instagram.com/tunnelsp/","https://pt.wikipedia.org/wiki/Cultura_LGBTQIA%2B_na_cidade_de_S%C3%A3o_Paulo","https://revistaviag.com.br/2026/05/sao-paulo-lgbt-guia-hoteis-bares-baladas/"]
  }$qa$::jsonb),
  (1922, $qa${
    "queue_wait":"Casa Fluida is a narrow multi-level cultural bar; drag nights and anniversary events can fill the room. Reserve or secure the listed ticket when offered and arrive before the performance start for seating and simpler bar service.",
    "best_nights":"Wednesday drag programming and the Thursday-to-Saturday Experiência Drag are the clearest choices; verify the week's cast and any advance registration on the official account.",
    "crowd_mix":"LGBTQIA+ artists, drag audiences, local friendship groups and curious visitors share a bar, restaurant and gallery rather than a conventional nightclub floor.",
    "dress_code":"Creative and expressive looks fit naturally, but there is no formal code. Choose shoes that handle stairs and standing; participation in the drag experience may require prior Instagram registration.",
    "staff_inclusivity":"Casa Fluida defines itself as an LGBTQIAP+ art-and-gastronomy hub and builds its programme around drag artists. That is direct inclusion evidence, not a generic friendly label.",
    "source_urls":["https://linktr.ee/casafluida","https://rolezero.com.br/sao-paulo/lugar/casafluida","https://www.baressp.com.br/restaurantes/bar-e-restaurante/casa-fluida"]
  }$qa$::jsonb),

  (1696, $qa${
    "queue_wait":"Hans operates 24 hours, so there is rarely a conventional line. Evening and weekend peaks can slow locker issue; bring photo ID, cash/card for the current fee and ask staff to explain house rules before entering.",
    "best_nights":"Evenings and late nights are the stronger social windows; daytime is quieter. The 24-hour format makes it flexible, but crowd balance changes sharply by hour.",
    "crowd_mix":"An adult men-only sauna with a notably mature, bear-friendly local crowd plus international visitors; it is more social bathhouse than luxury spa.",
    "dress_code":"Arrive in ordinary street clothes and change into the issued towel/locker setup. Keep valuables secured and follow consent, hygiene and no-recording expectations in all shared spaces.",
    "staff_inclusivity":"Warm staff and a long-standing gay men's focus are reported, but this is a gender-restricted adult venue rather than an all-LGBTQIA+ space. Ask at reception if gender-document or access rules affect you.",
    "source_urls":["https://qlist.app/venues/Wanhua-District/Hans-Mens-Sauna-level-8/TEtyeWo0L3hqamgrTCtTQkRsNEhqUQ","https://wom.com.tw/guides/taipei-gay-sauna-guide?lang=en"]
  }$qa$::jsonb),
  (1700, $qa${
    "queue_wait":"Wonder is a lounge-scale bar, not a large club. Friday and Saturday arrivals after 22:00 are most likely to wait for a table; arrive near 19:00 or reserve through the current venue channel when possible.",
    "best_nights":"Friday and Saturday provide the later close and strongest lounge energy. Tuesday to Thursday suit cocktails and conversation; Monday is normally closed.",
    "crowd_mix":"A lesbian- and queer-women-centred lounge with local groups, couples and respectful friends; it should not be described as a generic gay men's bar.",
    "dress_code":"Smart-casual cocktail clothing works well, with no published compulsory code. Personal queer expression is welcome; confirm themes for programmed parties.",
    "staff_inclusivity":"The venue is explicitly women-loving-women/queer oriented, giving the team a direct community-hosting role. No detailed public accessibility or anti-harassment policy was located.",
    "source_urls":["https://www.travelgay.com/taipei-gay-bars","https://www.taipeitourism.org/taipei-nightlife/"]
  }$qa$::jsonb),
  (1701, $qa${
    "queue_wait":"WAY opens late and can impose a minimum spend. Friday and Saturday after midnight are the tightest periods; arrive earlier, carry ID and confirm the night's table/minimum-spend rule before committing.",
    "best_nights":"Friday and Saturday run latest and attract the strongest club-bar crowd. Sunday to Thursday are better for a less compressed room while retaining the late-night format.",
    "crowd_mix":"Predominantly gay men, including Taipei regulars, after-hours groups and visitors; the atmosphere is more late-night and bottle-table oriented than Ximen's open-air bar strip.",
    "dress_code":"Fashionable late-night streetwear works; no formal code is published. Avoid beachwear and bring only essentials because seating and storage can be limited.",
    "staff_inclusivity":"The venue is designed for a gay male audience. Inclusion evidence supports that audience boundary, but no broader all-gender or trans-access policy is published; confirm directly if access is uncertain.",
    "source_urls":["https://www.travelgay.com/taipei-gay-bars","https://www.taipeitourism.org/taipei-nightlife/"]
  }$qa$::jsonb),
  (1705, $qa${
    "queue_wait":"Soi 13 In operates around the clock; locker check-in is usually fluid outside the evening peak. Late afternoon through late night is busiest, so carry ID and confirm foreign-visitor pricing before payment.",
    "best_nights":"Daily 17:00-22:00 is the strongest reported social window, with Friday and Saturday extending later. Daytime suits facilities more than crowd.",
    "crowd_mix":"An adult men-only sauna known for a younger, fitter local crowd alongside Asian and international visitors; expectations are more modern cruise club than traditional hot-spring bathhouse.",
    "dress_code":"Street clothes at reception, then the venue's towel/locker system. Consent, hygiene and no photography are the practical rules; do not assume all spaces permit the same behaviour.",
    "staff_inclusivity":"The venue's inclusion is specifically for adult men and reported service is accustomed to foreign visitors. Pricing may differ, so ask clearly at reception before entry rather than discovering terms inside.",
    "source_urls":["https://wom.com.tw/guides/taipei-gay-sauna-guide?lang=en","https://www.travelgay.com/taipei-gay-saunas"]
  }$qa$::jsonb),
  (1706, $qa${
    "queue_wait":"Huang Chi is a 24-hour Beitou hot-spring complex rather than a conventional gay sauna. Peak evening and weekend periods may mean waiting for bathing or private-room access; confirm the chosen service and fee at reception.",
    "best_nights":"Weekday daytime is calmer; evenings and weekends bring the strongest communal-bathing crowd. Visit for the hot-spring facility, not on an assumption that every guest is queer.",
    "crowd_mix":"A broad local hot-spring audience uses the complex, with an established gay male following. It is mixed public hospitality, not an exclusively LGBTQIA+ venue.",
    "dress_code":"Follow the bathhouse's changing, shower and towel rules; swimwear or nudity requirements vary by pool/room. Bring simple street clothes and secure valuables.",
    "staff_inclusivity":"Staff operate a mainstream hot-spring facility and no explicit LGBTQIA+ inclusion policy was found. The queer signal comes from sustained community use, so ask reception practical questions without assuming specialist support.",
    "source_urls":["https://wom.com.tw/guides/taipei-gay-sauna-guide?lang=en","https://www.travelgay.com/taipei-gay-saunas"]
  }$qa$::jsonb),
  (1707, $qa${
    "queue_wait":"Abrazo shifts from bistro seating into a late bar. Friday and Saturday after 22:00 are the pressure point; reserve dining early or arrive before the nightlife changeover if you need a table.",
    "best_nights":"Friday and Saturday provide the longest party hours. Tuesday to Thursday work better for food, drinks and conversation; Monday is normally closed.",
    "crowd_mix":"Stylish gay and queer locals, groups dining before nightlife and international visitors mix here; later hours skew more clubby and male.",
    "dress_code":"Polished casual or fashion-forward nightlife clothing fits the Daan setting. No mandatory code is published, but it is sharper than a daytime café.",
    "staff_inclusivity":"Abrazo is consistently presented within Taipei's LGBTQIA+ hospitality circuit. The venue welcomes queer groups, though no detailed public trans-inclusion or incident-response policy was found.",
    "source_urls":["https://www.travelgay.com/taipei-restaurants","https://www.taipeitourism.org/taipei-nightlife/"]
  }$qa$::jsonb),
  (1711, $qa${
    "queue_wait":"Casa's Ximen location is small and social; outdoor-strip traffic can fill tables after 21:00 on weekends. Arrive near 18:00-20:00 for easier seating.",
    "best_nights":"Friday and Saturday are busiest; early weekday evenings are better for relaxed drinks. Its position near the Red House makes it a practical first stop before later venues.",
    "crowd_mix":"Gay men, mixed LGBTQIA+ groups, Taipei regulars and international visitors using the Ximen/Red House circuit.",
    "dress_code":"Casual city clothing is normal and no formal code is published. Prepare for humid outdoor movement between nearby bars and carry rain protection in season.",
    "staff_inclusivity":"The bar participates in an established LGBTQIA+ cluster and routinely serves queer visitors. No separate written inclusion policy was located, so accessibility specifics should be checked directly.",
    "source_urls":["https://www.travelgay.com/taipei-gay-bars","https://www.taipeitourism.org/taipei-nightlife/"]
  }$qa$::jsonb),
  (1714, $qa${
    "queue_wait":"Al Revés is a daytime café/restaurant; lunch and weekend brunch tables are the main capacity issue, not a nightlife door. Arrive before the middle of the lunch window or reserve if the current channel offers it.",
    "best_nights":"This is best Tuesday-Sunday in daylight or early evening and normally closes around 20:30. Do not plan it as a late-night stop.",
    "crowd_mix":"LGBTQIA+ locals, couples, friends and Ximen visitors looking for food in a queer-friendly setting rather than a bar-only crowd.",
    "dress_code":"Relaxed café clothing is appropriate; there is no published code. Weather-ready walking clothes suit its position near the wider Ximen circuit.",
    "staff_inclusivity":"Its repeated placement in Taipei LGBTQIA+ dining guides supports a queer-welcoming service signal. No formal identity or accessibility policy is published, so the profile makes no stronger claim.",
    "source_urls":["https://www.travelgay.com/taipei-restaurants","https://www.taipeitourism.org/taipei-nightlife/"]
  }$qa$::jsonb),

  (832, $qa${
    "queue_wait":"LaKama serves breakfast, food and cocktails across a long day. Chueca brunch and terrace periods create table waits; reserve for groups or arrive before 13:30 and before the late-evening drink crowd.",
    "best_nights":"Daytime and early evening are the distinctive experience; Thursday through Saturday become livelier later. Use it as a food-led Chueca start rather than a dance-club destination.",
    "crowd_mix":"LGBTQIA+ locals, tourists, brunch groups and mixed friends in central Chueca. It is gay-friendly hospitality rather than a single-gender bar.",
    "dress_code":"Casual-smart café clothing works throughout the day; no formal code is published. A slightly sharper evening look fits cocktails but is not required.",
    "staff_inclusivity":"LaKama is explicitly presented as gay-friendly and serves the Chueca community across restaurant and bar hours. No detailed published trans or accessibility protocol was found.",
    "source_urls":["https://conmenu.com/establishment/3195-lakama","https://www.travelgay.com/madrid-gay-bars/"]
  }$qa$::jsonb),
  (1089, $qa${
    "queue_wait":"El 12 is a compact Chueca club-bar. Friday and Saturday after midnight are the likeliest queue period; arrive during the 18:00-21:00 opening stretch for easier entry and conversation.",
    "best_nights":"Friday and Saturday are strongest, while Sunday offers an earlier start. The venue runs to about 03:00, so it works as both an opener and a late stop.",
    "crowd_mix":"Predominantly gay men, Chueca regulars, visitors and mixed queer friendship groups in a small late-night room.",
    "dress_code":"No formal code is published. Neat casual nightlife clothing and comfortable shoes fit; check the event feed for any themed party.",
    "staff_inclusivity":"El 12 identifies and is mapped as an LGBTQ nightclub in Chueca. That supports queer service experience, but no detailed public anti-harassment or accessibility policy was located.",
    "source_urls":["https://www.instagram.com/el12club/","https://maps.apple.com/place?place-id=I6FE9FA3890917335"]
  }$qa$::jsonb),
  (1096, $qa${
    "queue_wait":"THICK is a small specialist bar, so capacity rather than a long formal line is the issue. Arrive before midnight on Friday/Saturday if you want space to settle in.",
    "best_nights":"Friday and Saturday carry the strongest bear-bar energy; weekday late evenings are more conversational. Verify the current address and hours on the venue channel before departure because older guides conflict.",
    "crowd_mix":"Bears, cubs, chubs and their adult male admirers are the core crowd, with visitors from the wider Chueca circuit.",
    "dress_code":"Casual masculine barwear, bear styling and personal expression are normal; no compulsory fetish code is published.",
    "staff_inclusivity":"THICK is intentionally bear- and chub-friendly, making body inclusion part of the venue's proposition. It remains a male-focused bar, not a claim of equal relevance to every LGBTQIA+ audience.",
    "source_urls":["https://www.gayplaces.co/city/madrid/bar","https://www.travelgay.com/madrid-gay-bars/"]
  }$qa$::jsonb),
  (1097, $qa${
    "queue_wait":"You&Me is a small late bar; the room can feel full quickly after midnight. Arrive around 21:00-23:00 for easier service and verify the current address because directory listings have shifted.",
    "best_nights":"Friday and Saturday are busiest and run latest; weeknights offer a more local, conversational visit.",
    "crowd_mix":"Predominantly local gay men with Chueca visitors and friends; it is an intimate bar rather than a broad dance-club crowd.",
    "dress_code":"Relaxed nightlife clothing is sufficient and no formal code is published. A clean casual look fits the small neighbourhood-bar setting.",
    "staff_inclusivity":"The venue is established as a gay men's bar in Chueca. No detailed written inclusion policy was found, so the profile does not infer broader practices beyond that community focus.",
    "source_urls":["https://www.gayplaces.co/city/madrid/bar","https://www.travelgay.com/madrid-gay-bars/"]
  }$qa$::jsonb),
  (1098, $qa${
    "queue_wait":"Zafyro opens in the early evening and becomes busier as Chueca's late circuit builds. Arrive before 22:00 for a table; Friday/Saturday after midnight is the most compressed period.",
    "best_nights":"Thursday through Saturday suit cocktails and a lively room; Sunday or early weekdays are calmer. It closes late but is more cocktail bar than full dance club.",
    "crowd_mix":"Gay men, mixed LGBTQIA+ groups, couples and Chueca visitors looking for cocktails in a sociable central bar.",
    "dress_code":"Smart-casual and expressive evening clothing work well. There is no published compulsory code.",
    "staff_inclusivity":"Zafyro operates within Chueca's LGBTQIA+ bar circuit and is identified as a gay cocktail venue. No detailed public policy on trans inclusion or access assistance was found.",
    "source_urls":["https://www.gayplaces.co/city/madrid/bar","https://www.travelgay.com/madrid-gay-bars/"]
  }$qa$::jsonb),
  (1869, $qa${
    "queue_wait":"Casa de Campo is a 1,535-hectare municipal park, not a managed cruising venue. Pedestrian access is continuous; only attractions and event facilities have separate queues.",
    "best_nights":"Use daylight and established recreational routes. Vehicle gates near major attractions close 01:00-06:00, and isolated nighttime cruising is not recommended as a visitor experience.",
    "crowd_mix":"Walkers, cyclists, families, attraction visitors and many other residents share the park. Any LGBTQIA+ social use is informal and unsupervised.",
    "dress_code":"Weather-ready park clothing and proper walking shoes. Take water, keep valuables discreet and use lit routes and known exits.",
    "staff_inclusivity":"Municipal park teams are not queer-venue hosts. Use official security or emergency services for help; the app does not claim that informal meeting areas have dedicated LGBTQIA+ protection.",
    "source_urls":["https://www.madrid.es/portales/munimadrid/es/Inicio/Vivienda-urbanismo-y-obras/Urbanismo/Licencias-Urbanisticas/Parque-de-la-Casa-de-Campo/"]
  }$qa$::jsonb),

  (1048, $qa${
    "queue_wait":"Atmósfera is a cocktail bar opened in 2025, not the 3 Monkeys listing previously linked here. The room is busiest after 22:00; arrive around 19:00-21:00 for easier seating.",
    "best_nights":"Friday and Saturday have the strongest La Nogalera crossover; earlier weekday evenings suit cocktails. Check the official account for seasonal daily openings.",
    "crowd_mix":"LGBTQIA+ locals, holiday visitors and friends beginning a La Nogalera night in a new cocktail-led space.",
    "dress_code":"Relaxed resort-evening clothing works; no formal code is published. Personal queer style is welcome.",
    "staff_inclusivity":"The bar is explicitly listed in the current gay circuit and promotes itself to the Torremolinos LGBTQIA+ audience. No detailed written incident or accessibility protocol was found.",
    "source_urls":["https://www.instagram.com/atmosfera.torremolinos.family/","https://www.patroc.com/guiagay/torremolinos/bares.html"]
  }$qa$::jsonb),
  (1052, $qa${
    "queue_wait":"Boomerang is a terrace bar in Pueblo Blanco, not 3 Monkeys in La Nogalera. Weekend terrace tables fill from early evening; arriving near 18:00 gives the best chance of seating.",
    "best_nights":"Friday through Sunday are strongest, with a broader summer schedule. It is useful for early cocktails before walking to La Nogalera.",
    "crowd_mix":"A mixed LGBTQIA+ crowd of gay men, lesbians, local regulars and holiday visitors; reviews emphasise social terrace energy rather than a men-only room.",
    "dress_code":"Casual resort clothing is standard and no formal code is published. Bring a light layer for the terrace outside peak summer.",
    "staff_inclusivity":"Current guides describe LGBTQ-friendly mixed clientele and repeatedly note friendly service. That supports practical inclusion across the community rather than a generic label.",
    "source_urls":["https://www.facebook.com/boomerang.torremolinos","https://www.patroc.com/guiagay/torremolinos/bares.html","https://www.gaymapper.com/gay-guide/gay-torremolinos/gay-bars"]
  }$qa$::jsonb),
  (1053, $qa${
    "queue_wait":"Crews is a small men-focused bar opened in 2025. Saturday and Sunday bear-week traffic can fill it quickly; start near opening for easier entry and terrace space.",
    "best_nights":"Friday and Saturday are strongest; Sunday opens earlier at about 16:00 and is useful for a social afternoon. Seasonal hours should be checked.",
    "crowd_mix":"Adult gay men, especially bears and fetish-friendly guests, plus visiting men during Torremolinos' bear and fetish weeks.",
    "dress_code":"Casual masculine or fetish-friendly barwear fits, but no mandatory code is published. Follow any event-specific theme on the official account.",
    "staff_inclusivity":"Crews explicitly welcomes bears and fetish communities. It is a men-focused venue, so the profile does not present it as a general all-gender LGBTQIA+ bar.",
    "source_urls":["https://www.instagram.com/crewsbar/","https://www.patroc.com/guiagay/torremolinos/bares.html"]
  }$qa$::jsonb),
  (1054, $qa${
    "queue_wait":"Mariquita's terrace and drag moments draw a concentrated evening crowd. Arrive before the first performance or around 19:00-21:00 for easier seating.",
    "best_nights":"Friday and Saturday are liveliest; Tuesday-Sunday operation and terrace drag make earlier evenings worthwhile. Confirm the night's performers on Instagram.",
    "crowd_mix":"A broad LGBTQIA+ and friends crowd, including drag audiences, locals and international holiday groups in La Nogalera.",
    "dress_code":"Colourful resort-night clothing and expressive queer looks fit; there is no published compulsory code.",
    "staff_inclusivity":"Mariquita openly serves LGBTQIA+ people and friends and programmes drag on its terrace. That is direct community-hosting evidence; no separate formal accessibility policy was found.",
    "source_urls":["https://www.instagram.com/mariquitacopas/","https://www.patroc.com/guiagay/torremolinos/bares.html","https://www.torremolinos.info/en/la-nogalera/"]
  }$qa$::jsonb),
  (1056, $qa${
    "queue_wait":"Conexxxtion and Exxxtreme form a specialist adult cruise-club complex. Weekend and fetish-event doors are the pressure point; carry photo ID and read the current admission, membership and re-entry terms before queuing.",
    "best_nights":"Friday, Saturday and official fetish-week dates are strongest. Select the event by its stated audience and theme rather than assuming a uniform nightly format.",
    "crowd_mix":"Adult gay and bisexual men, fetish visitors and international cruise-club regulars. It is not an all-ages or general-community bar.",
    "dress_code":"Event rules may range from street clothes to underwear, leather or fetishwear. The specific calendar overrides general advice; bring only essentials and use lockers.",
    "staff_inclusivity":"The operator explicitly hosts adult men and fetish/cruising communities. Inclusion here requires consent, privacy and respect for that access boundary; no all-gender claim is made.",
    "source_urls":["https://exxxtremeclub.com/conexxxtion/","https://torremolinosfetish.com/wp-content/uploads/2026/03/TFW26-Magazine-English-1.pdf"]
  }$qa$::jsonb),
  (1057, $qa${
    "queue_wait":"XXL is a small men-only cruise bar in La Nogalera. Friday/Saturday after midnight can reach capacity; arrive near 22:00, carry ID and verify the night's door terms.",
    "best_nights":"Friday and Saturday run latest and are busiest. Weeknights provide a quieter first visit; Pride, bear and fetish weeks change the pattern.",
    "crowd_mix":"Adult gay and bisexual men, including local regulars, tourists and fetish-week visitors; it is not a mixed general bar.",
    "dress_code":"Casual masculine barwear is normally sufficient, with fetish or underwear looks on themed nights. Check the event post because there is no single code for every date.",
    "staff_inclusivity":"The venue explicitly serves adult men in a cruise-bar format. Staff practice should centre consent and privacy within that scope; no broader all-gender inclusion claim is made.",
    "source_urls":["https://www.facebook.com/mensbartorremolinos","https://torremolinosfetish.com/wp-content/uploads/2026/03/TFW26-Magazine-English-1.pdf"]
  }$qa$::jsonb),

  (1350, $qa${
    "queue_wait":"Delmonica's can become a standing-room venue around its GAG drag show and Friday/Saturday peak. Book a booth for a group or arrive before the advertised act if seating matters.",
    "best_nights":"The weekly GAG drag show is the signature choice; Friday and Saturday deliver the fullest dance-and-cocktail atmosphere. Use the official rundown because acts change weekly.",
    "crowd_mix":"A broad queer Glasgow crowd, drag audiences, students, long-time regulars, visitors and allies in the heart of Merchant City.",
    "dress_code":"Casual-to-expressive queer nightlife clothing is welcome; there is no published formal code. Follow any theme attached to the night's show.",
    "staff_inclusivity":"Delmonica's explicitly calls itself a safe and inclusive queer space and has served Glasgow's community since 1991. That is a first-party commitment, not an inferred friendly rating.",
    "source_urls":["https://delmonicas.co.uk/","https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide"]
  }$qa$::jsonb),
  (1354, $qa${
    "queue_wait":"Merchant Pride is a small traditional bar; the constraint is finding a seat rather than a managed club queue. Friday evening and Saturday are busiest, so start near opening for an easier table.",
    "best_nights":"Friday and Saturday suit a livelier community-pub visit; weekday early evenings are better for conversation with regulars.",
    "crowd_mix":"Predominantly local gay men and long-standing Merchant City regulars, with visitors and friends; the atmosphere is more neighbourhood pub than destination club.",
    "dress_code":"Everyday pub clothing is normal and no formal code is published. There is no need for clubwear.",
    "staff_inclusivity":"Its role is a dedicated community gay pub, but no current written trans-inclusion or safer-space policy was found. The profile therefore supports gay-community experience without claiming a documented all-identity protocol.",
    "source_urls":["https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide","https://www.patroc.com/gay/glasgow/bars.html"]
  }$qa$::jsonb),
  (1356, $qa${
    "queue_wait":"The Gallery is table-service led, so peak waits are for a terrace/table rather than club admission. Friday and Saturday after 19:00 are busiest; early afternoon is easiest.",
    "best_nights":"Friday and Saturday bring the fullest social bar atmosphere, while Sunday afternoon suits a calmer drink. Current hours end around midnight rather than deep after-hours.",
    "crowd_mix":"Mixed-age LGBTQIA+ locals, Merchant City visitors and friendship groups, with outdoor seating attracting a broader social crowd.",
    "dress_code":"Relaxed smart-casual bar clothing works; there is no published code. Dress for outdoor seating if using the terrace.",
    "staff_inclusivity":"Recent visitor feedback repeatedly describes friendly, welcoming and attentive table service for LGBTQIA+ guests. That is venue-specific service evidence, although no formal inclusion policy is published.",
    "source_urls":["https://maps.apple.com/place?place-id=IB419724C3C35B717","https://restaurantguru.com/The-Gallery-Glasgow"]
  }$qa$::jsonb),
  (1358, $qa${
    "queue_wait":"The Underground is a small basement dive bar; Queeraoke, Cabareoke and bingo can fill seats before the event begins. Arrive early for programmed evenings rather than expecting table space later.",
    "best_nights":"Choose the published Queeraoke, Cabareoke or bingo night for the venue's strongest identity. Daytime and early evening are deliberately quieter.",
    "crowd_mix":"Local LGBTQIA+ regulars, karaoke and cabaret audiences, solo visitors and friends in a relaxed small-room setting.",
    "dress_code":"Casual pub clothing is standard; performance nights welcome expressive looks but publish no compulsory dress rule.",
    "staff_inclusivity":"Visit Glasgow lists it as part of the city's LGBTQIA+ core and the programme is queer-specific. The basement format may affect step-free access, so mobility needs should be checked before travel.",
    "source_urls":["https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide","https://www.facebook.com/UndergroundGlasgow/"]
  }$qa$::jsonb),
  (1361, $qa${
    "queue_wait":"The Waterloo is a compact no-frills pub. Saturday afternoon entertainment and Friday/Saturday evenings can leave few seats; arrive early rather than expecting a formal queue system.",
    "best_nights":"Saturday afternoon entertainment is a distinctive choice; Friday and Saturday evenings are busiest. Weekday daytime gives the clearest traditional-pub feel.",
    "crowd_mix":"A mature, predominantly gay male local crowd with long-time regulars and visitors drawn by its history as one of Scotland's oldest gay pubs.",
    "dress_code":"Ordinary pub clothing is appropriate; no formal or fetish code applies.",
    "staff_inclusivity":"The bar has a long, explicit gay-community identity. Recent feedback describes welcoming service overall while also noting isolated staff-attitude problems, so the profile avoids promising uniformly warm treatment.",
    "source_urls":["https://www.visitglasgow.com/explore-by-interest/lgbtqplus-glasgow/lgbtqplus-guide","https://maps.apple.com/place?place-id=I58485ADCF54F3E30"]
  }$qa$::jsonb),

  (1424, $qa${
    "queue_wait":"Superstar is a basement club with a narrow stair entry. Friday and Saturday cabaret/club hours create the main door pressure; arrive before midnight and carry ID.",
    "best_nights":"Friday and Saturday run until about 05:00 and are strongest for drag cabaret, pop and house. Weeknights retain cabaret with a smaller crowd.",
    "crowd_mix":"LGBTQIA+ clubbers, drag audiences, Pride Quarter regulars, students, visitors and mixed allies who want late dancing.",
    "dress_code":"Smart-casual and drag-friendly styling are specifically recommended. Comfortable shoes matter on the dance floor and steep stairs.",
    "staff_inclusivity":"The club has a long LGBTQIA+ identity and queer hosts, but recent feedback includes a complaint about unexplained security removal. Treat the venue identity as verified while recognising mixed door-service evidence.",
    "source_urls":["https://www.anightinliverpool.com/venue/superstar-boudoir","https://www.visitliverpool.com/things-to-do-in-liverpool/nightlife-in-liverpool/"]
  }$qa$::jsonb),
  (1425, $qa${
    "queue_wait":"Masquerade is a small, long-running bar rather than a ticketed club. Friday/Saturday after 22:00 is the seating pressure point; earlier hours work better for a first drink or solo visit.",
    "best_nights":"Friday and Saturday are liveliest and run later; weekday evenings suit conversation. Pride and street-event dates can alter access around Cumberland Street.",
    "crowd_mix":"Local LGBTQIA+ regulars across ages, solo visitors, friends and allies in a notably chatty neighbourhood-bar setting.",
    "dress_code":"Casual pub-to-nightlife clothing is appropriate with no formal code.",
    "staff_inclusivity":"The venue explicitly welcomes the LGBT+ community and allies and has long promoted itself as Liverpool's friendliest LGBT+ bar. This is supported by the city's official visitor listing.",
    "source_urls":["https://www.visitliverpool.com/listing/masquerade-bar/47525101/","https://www.visitbritain.com/en/things-to-do/lgbtqia-guide-liverpool"]
  }$qa$::jsonb),
  (1426, $qa${
    "queue_wait":"The Lisbon is an ornate, compact pub; Friday/Saturday tables beneath the ceiling fill early. Arrive in the afternoon or early evening if you want to sit rather than stand.",
    "best_nights":"Friday and Saturday are busiest; a quieter weekday drink best reveals its historic pub character. Check Monday operation before travelling.",
    "crowd_mix":"A multigenerational LGBTQIA+ local crowd, heritage-pub visitors and friends; it is one of Liverpool's longest-established gay meeting places.",
    "dress_code":"Everyday pub clothing is normal; no formal code. The setting is decorative, but the service style remains relaxed.",
    "staff_inclusivity":"Visit Liverpool describes The Lisbon as a friendly and welcoming LGBTQIA+ hang-out with decades of community continuity. No detailed written trans or incident policy was found.",
    "source_urls":["https://www.visitbritain.com/en/things-to-do/lgbtqia-guide-liverpool","https://www.explore-liverpool.com/wp-content/uploads/2022/06/Visitor-Guide_Spring_Summer_2022-VL_compressed.pdf"]
  }$qa$::jsonb),
  (1427, $qa${
    "queue_wait":"Poste House is very small; the upstairs queer bar can become standing-room only on Friday/Saturday. Arrive earlier for a seat, and use the downstairs pub if the upper floor is full.",
    "best_nights":"Friday and Saturday give the strongest upstairs LGBTQIA+ atmosphere; daytime and weekday evenings are quieter, mixed traditional-pub visits.",
    "crowd_mix":"Older regulars often use downstairs while a younger and mixed LGBTQIA+ crowd gathers upstairs; locals value it as an inexpensive conversation pub.",
    "dress_code":"Casual pub clothing is standard with no formal code.",
    "staff_inclusivity":"Current reviews include many friendly-service reports but also an older, serious transphobia complaint and newer staff-attitude criticism. Trans guests wanting a clearly stated inclusive policy may prefer Masquerade nearby.",
    "source_urls":["https://www.gayout.com/fr/europe/united-kingdom/liverpool/bars/the-poste-house-10799","https://www.tripadvisor.com/Attraction_Review-g186337-d12208467-Reviews-Poste_House-Liverpool_Merseyside_England.html","https://www.reddit.com/r/Liverpool/comments/1u1hm12/best_lgbt_bars_for_solo_people/"]
  }$qa$::jsonb),
  (1428, $qa${
    "queue_wait":"Dolphin has no membership requirement and opens daily 11:00-20:00; last entry is 19:00. Check-in is normally direct, but carry ID under its Challenge 21 policy.",
    "best_nights":"This is a daytime/early-evening sauna, not an overnight venue. The operator says attendance is unpredictable and currently runs no separate bear, trans, twink or fetish days.",
    "crowd_mix":"Adult gay, bisexual and curious men across ages and body types; the operator explicitly welcomes young/old, fat/thin and Black/white guests.",
    "dress_code":"Street clothes at reception, then towels and lockers inside. Alcohol and illegal drugs are prohibited; follow hygiene rules, including the jacuzzi restriction.",
    "staff_inclusivity":"The venue publishes unusually concrete inclusion language and a ban on verbal or physical violence. It is 18+ and male-focused, with no membership gate; ask directly about gender-access questions.",
    "source_urls":["https://www.dolphinsauna.co.uk/","https://www.gaysaunaguide.net/venue/dolphin-sauna/"]
  }$qa$::jsonb),

  (1058, $qa${
    "queue_wait":"This row duplicates Saloon Bistro Bar at the same address. For the active restaurant, reserve dinner or arrive before the Village happy-hour peak; use the canonical Saloon Bistro Bar listing for current details.",
    "best_nights":"Thursday through Saturday are liveliest for cocktails and dinner. The canonical restaurant row, not this duplicate bar row, should guide planning.",
    "crowd_mix":"Village LGBTQIA+ residents, couples, dinner groups, happy-hour regulars and visitors in a lively mixed bistro-bar.",
    "dress_code":"Relaxed smart-casual clothing fits; no formal code is published.",
    "staff_inclusivity":"Saloon is a long-standing institution in Montréal's LGBTQIA+ Village. This record is de-indexed solely because it duplicates the canonical restaurant entry, not because the business is unwelcoming.",
    "source_urls":["https://www.mtl.org/en/experience/where-eat-montreal-village","https://www.restomontreal.ca/resto/le-saloon-bistro-bar-montreal/1875/en/"]
  }$qa$::jsonb),
  (1437, $qa${
    "queue_wait":"These are public stadium washrooms, not a venue or managed cruising space. Access depends on the Olympic Park event/facility being open; there is no separate queer admission.",
    "best_nights":"No night is recommended for cruising. Use washrooms only for their intended purpose while attending an authorised event or public facility.",
    "crowd_mix":"Event attendees, athletes, tourists, families and staff use the facilities. Other users have not consented to being part of a sexual or queer venue.",
    "dress_code":"Follow the event or facility dress rules. Sexual activity and covert recording have no place in a public washroom.",
    "staff_inclusivity":"Olympic Park staff manage a public facility, not an LGBTQIA+ social space. This record is de-indexed as a venue to protect privacy, consent and data accuracy.",
    "source_urls":["https://parcolympique.qc.ca/","https://nrc-publications.canada.ca/eng/view/ft/?id=5753ca72-c843-4af4-aa36-79cc6ed7e581"]
  }$qa$::jsonb),
  (1651, $qa${
    "queue_wait":"DD's is an intimate downstairs bar, so drag, DJ and dance nights can reach capacity. Check the Instagram event post and arrive near opening; the monthly 35+ mixer begins earlier than standard club nights.",
    "best_nights":"Choose the announced drag-king/drag-queen, DJ or small-show programme. The dedicated 35+ Before Dark mixer is the best fit for older queer guests.",
    "crowd_mix":"Lesbian, sapphic and broader LGBTQ2IA+ communities, drag audiences, dancers and Plateau regulars; specific nights deliberately broaden the age mix.",
    "dress_code":"Casual-to-expressive queer nightlife clothing fits. No universal code is published; event themes take priority.",
    "staff_inclusivity":"DD's was created by a queer team as an LGBTQ2IA+ bar for drag, dancing and small shows. Its programme includes an intentional 35+ space, providing direct community and age-inclusion evidence.",
    "source_urls":["https://cultmtl.com/2025/09/club-dds-is-officially-opening-in-the-old-blue-dog-space-on-sept-13/","https://www.timeout.com/fr/montreal/bars/meilleurs-bars-clubs-gais-lgbtq-montreal"]
  }$qa$::jsonb),
  (1885, $qa${
    "queue_wait":"Saloon's popular 5-à-8 happy hour and Friday/Saturday dinner period can fill the bistro. Reserve for dinner or arrive before the happy-hour peak for easier seating.",
    "best_nights":"Thursday through Saturday are strongest for a lively cocktail-and-dinner atmosphere; earlier weekdays are calmer. It is a bistro-bar, not a dance club.",
    "crowd_mix":"Village LGBTQIA+ residents, couples, dinner groups, happy-hour regulars and visitors, with a mixed and social rather than single-gender room.",
    "dress_code":"Relaxed smart-casual clothing is suitable; no formal code. Terrace clothing should account for Montréal weather.",
    "staff_inclusivity":"Saloon has operated as a Gay Village institution for more than 25 years and is currently promoted by Tourisme Montréal within the Village. That history supports experienced LGBTQIA+ hospitality.",
    "source_urls":["https://www.mtl.org/en/experience/where-eat-montreal-village","https://www.restomontreal.ca/resto/le-saloon-bistro-bar-montreal/1875/en/"]
  }$qa$::jsonb),
  (1886, $qa${
    "queue_wait":"Restaurant Tendresse permanently closed after service on 31 August 2025. There is no current table, queue or booking path.",
    "best_nights":"None: the Village restaurant is closed. Keep the name only as historical data until the record is removed from visitor-facing results.",
    "crowd_mix":"Historically a queer-welcoming vegan Village restaurant serving brunch and dinner guests; it no longer has an active audience.",
    "dress_code":"Not applicable because the business is permanently closed.",
    "staff_inclusivity":"The former team created a welcoming vegan gathering place, but there is no active staff to host guests now. This record is de-indexed to prevent false inclusion claims about a closed business.",
    "source_urls":["https://www.silo57.ca/montreal-perd-joyaux-cuisine-vegane","https://www.themain.com/montreal/restaurant/restaurant-tendresse"]
  }$qa$::jsonb),

  (1383, $qa${
    "queue_wait":"GC is tiny and table-heavy. Friday/Saturday after 21:00 can become difficult to enter without bottle spend; arrive soon after 17:00 for easier service and be ready to leave if terms change at the door.",
    "best_nights":"Friday and Saturday run to about 02:00 and bring the strongest gay crowd; weekdays close around midnight and are quieter. Recent evidence shows very uneven Saturday service.",
    "crowd_mix":"Gay Hanoi locals, expatriates, Asian and international visitors, plus occasional mixed groups; indoor smoking makes the room unsuitable for many non-smokers.",
    "dress_code":"Casual nightlife clothing is accepted and no formal code is published. Choose washable layers if sensitive to heavy indoor smoke.",
    "staff_inclusivity":"GC is explicitly a gay bar, but recent reviews conflict sharply: some praise staff and prices while others report hostile service and bottle-pressure on busy nights. Queer identity does not guarantee consistently inclusive treatment here.",
    "source_urls":["https://whereis.gay/gc-bar","https://www.viet-biz.com/en/bar-gc_1B-0332-688-295","https://www.facebook.com/pages/GC-bar/221011564595347"]
  }$qa$::jsonb),
  (1392, $qa${
    "queue_wait":"Artisan is a small Old Quarter hotel; the practical wait is the 15:00 check-in window. Send passport and arrival details through the booking channel and use luggage storage for earlier arrivals.",
    "best_nights":"Choose it for walking access to Hoàn Kiếm rather than queer programming. Weekend Old Quarter traffic makes an airport transfer more useful than a last-minute street pickup.",
    "crowd_mix":"International leisure guests, couples, families and solo travellers in a 35-room boutique property; it is not a dedicated LGBTQIA+ hotel.",
    "dress_code":"Normal casual hotel clothing applies. Shoulders/knees may need coverage for nearby religious sites, but there is no property dress code.",
    "staff_inclusivity":"No explicit LGBTQIA+ policy or queer certification was found. English-speaking reception and standard couple bookings are documented; add both guests' names and any title preference before arrival rather than relying on an unverified gay-friendly label.",
    "source_urls":["https://impt.io/hotels/vietnam/hanoi/artisan-boutique-hotel/","https://www.traveloka.com/en-vn/hotel/vietnam/artisan-boutique-hotel-9000003307136"]
  }$qa$::jsonb),
  (1396, $qa${
    "queue_wait":"Eclipse has a 24-hour front desk with check-in from 14:00. Complete arrival and airport-transfer details before travel; the central location can slow road access at busy Old Quarter hours.",
    "best_nights":"Use it as an Old Quarter base near Hoàn Kiếm and the water-puppet theatre. The hotel has no queer-specific programme, so choose nights by Hanoi's event calendar.",
    "crowd_mix":"International couples, families, solo travellers and value-focused city visitors. It is mainstream accommodation, not an LGBTQIA+-exclusive property.",
    "dress_code":"Normal casual hotel wear is suitable, with no special code. Use respectful coverage when visiting nearby religious sites.",
    "staff_inclusivity":"Current verified-booking feedback rates staff highly and documents attentive 24-hour service, but no explicit LGBTQIA+ policy was found. Confirm names, bed setup and couple occupancy in writing before arrival.",
    "source_urls":["https://www.booking.com/hotel/vn/de-lima.en-gb.html","https://www.tripadvisor.com/Hotel_Review-g293924-d6876978-Reviews-Eclipse_Legend_Hotel-Hanoi.html"]
  }$qa$::jsonb),
  (1400, $qa${
    "queue_wait":"No sufficiently current first-party or major booking source could verify that Charming Vietnam Hotel still operates at 17 Hàng Hòm. Do not plan an arrival or transfer from this record.",
    "best_nights":"None can be responsibly recommended until the current operator, name and booking path are verified.",
    "crowd_mix":"Older guides described a mainstream Old Quarter hotel, not a dedicated LGBTQIA+ property. Current guest activity is unverified.",
    "dress_code":"Not applicable while operation remains unverified.",
    "staff_inclusivity":"No current team or LGBTQIA+ policy could be verified. The record is de-indexed instead of converting an old gay-friendly directory mention into a false staff-inclusion claim.",
    "source_urls":["https://revitrip.com/en/blog/hanoi-gay-bars-lgbtq-nightlife-guide"]
  }$qa$::jsonb),

  (1794, $qa${
    "queue_wait":"Porto da Barra is a free public beach; there is no venue door, but the small sand area becomes extremely crowded on sunny weekends. Arrive before 09:00 for space and easier swimming access.",
    "best_nights":"Daylight and sunset are the recommended windows. Do not treat the beach as a managed night-cruising venue; leave busy areas by established transport after dark.",
    "crowd_mix":"Salvador residents, families, tourists, swimmers and a visible LGBTQIA+ beach crowd, especially around the sociable Barra sections.",
    "dress_code":"Standard Brazilian beachwear, strong sun protection and footwear for hot pavement. Carry few valuables and never leave a phone unattended on the sand.",
    "staff_inclusivity":"This is public space with vendors and lifeguard coverage varying by time, not an LGBTQIA+-run venue. Community visibility is strong, but there is no single staff team responsible for queer inclusion.",
    "source_urls":["https://revistaviag.com.br/2026/05/salvador-lgbt-guia-hoteis-praias-bares/","https://www.reddit.com/r/Salvador/comments/1vj13ak/dicas_para_primeira_visita_%C3%A0_salvador/"]
  }$qa$::jsonb),
  (1799, $qa${
    "queue_wait":"Clube Rio's is an adult men's sauna. Weekday opening is usually calmer; weekend afternoons can make locker and room access slower. Confirm the current fee and services directly before travelling.",
    "best_nights":"Weekend afternoon into early evening is the strongest reported social period; this is not an overnight venue. Current 2026 opening hours are not published on a dependable first-party page.",
    "crowd_mix":"Adult gay and bisexual men, mostly local regulars with some visitors. Community sources distinguish it as client-to-client social space rather than a general wellness spa.",
    "dress_code":"Arrive in discreet street clothing and use the venue's towel/locker system. Carry minimal valuables and agree all prices before any separately offered service.",
    "staff_inclusivity":"The business is explicitly men-focused and known in Salvador's gay circuit. Inclusion evidence does not extend to all genders; staff usefulness should be judged on clear pricing, privacy and consent enforcement.",
    "source_urls":["https://grupogaydabahia.com.br/wp-content/uploads/2024/07/ROTEIRO_LGBT_SALVADOR_2024.pdf","https://repositorio.ufba.br/bitstream/ri/36552/1/%5BTCC%5D%20A%20CENA%20E%20OS%20ESPA%C3%87OS%20DE%20CULTURA%20E%20ENTRETENIMENTO%20LGBTQIA%2B%20EM%20SSA%20-%20ROBERTO%20JUNIOR%20-%20Roberto%20Junior.pdf"]
  }$qa$::jsonb),
  (1803, $qa${
    "queue_wait":"Amsterdam Pop Club is marked closed by the current specialist Salvador guide. There is no valid 2026 door, queue or ticket path at Rua João Gomes 249.",
    "best_nights":"None: the club is closed. Current articles that describe its historical crowd should not be interpreted as an active schedule.",
    "crowd_mix":"Historically a young, mixed LGBTQIA+ and pop audience across two dance floors; there is no active crowd now.",
    "dress_code":"Not applicable because the club is closed.",
    "staff_inclusivity":"The former club served Salvador's LGBTQIA+ pop scene, but no active operator or staff exists at this listing. It is de-indexed to stop presenting historical inclusion as current hospitality.",
    "source_urls":["https://www.guiagaysalvador.com.br/roteiro/Diversos/amsterdam-pop-club","https://www.guiagaysalvador.com.br/noticias/acontece/amsterdam-muda-de-endereco-e-cede-espaco-para-o-mirante-dos-aflitos"]
  }$qa$::jsonb),
  (1805, $qa${
    "queue_wait":"Clube 11 is an adult men's sauna/sex club rather than a general spa. Weekend afternoons and drag-programme dates can slow entry; verify the current fee and any separately priced services before going inside.",
    "best_nights":"Sunday afternoon is repeatedly recommended, with Friday/Saturday also stronger than weekdays. Current hours should be confirmed because reliable first-party 2026 scheduling is limited.",
    "crowd_mix":"Adult gay and bisexual men with a notably mature local base; reporting says more than half the clientele is over 60. Some separately paid male companions may be present.",
    "dress_code":"Discreet street clothing for arrival, then the venue's towel/locker setup. Agree prices and boundaries before any paid interaction and keep valuables secured.",
    "staff_inclusivity":"The venue explicitly serves adult men and has long community continuity. Useful staff practice here means transparent prices, privacy and consent; no all-gender inclusion claim is made.",
    "source_urls":["https://www.guiagaysalvador.com.br/roteiro/saunas-sex-clubs/sauna-planetario-11","https://www.correio24horas.com.br/minha-bahia/o-que-faz-de-salvador-a-capital-da-diversidade-1223","https://grupogaydabahia.com.br/wp-content/uploads/2024/07/ROTEIRO_LGBT_SALVADOR_2024.pdf"]
  }$qa$::jsonb)
), prepared as (
  select
    id,
    profile || jsonb_build_object(
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls') > 1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
        'best_nights', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls') > 1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls') > 1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
        'dress_code', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls') > 1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls') > 1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z')
      ),
      'research_status','venue_specific_sources_reviewed_2026_08_29',
      'updated_at','2026-08-29T00:00:00Z'
    ) as patch
  from researched
)
update public.places as p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || prepared.patch,
    updated_at = timezone('utc', now())
from prepared
where p.id = prepared.id;

-- Repair two source/link mismatches found during the profile review.
update public.places
set link = 'https://www.travelinn.com.br/promocoes/a-parada-do-orgulho-lgbtqia/',
    updated_at = timezone('utc', now())
where id = 1916;

update public.places
set location = 'Calle La Nogalera 11, 29620 Torremolinos, Málaga, Spain',
    hours = 'Daily approximately 19:00/20:00-02:00; verify seasonal hours.',
    link = 'https://www.instagram.com/atmosfera.torremolinos.family/',
    updated_at = timezone('utc', now())
where id = 1048;

update public.places
set location = 'Pueblo Blanco, 29620 Torremolinos, Málaga, Spain',
    hours = 'Thu-Mon approximately 18:00/19:00-00:00/01:00; broader summer opening.',
    link = 'https://www.facebook.com/boomerang.torremolinos',
    updated_at = timezone('utc', now())
where id = 1052;

update public.places
set link = 'https://www.instagram.com/crewsbar/',
    updated_at = timezone('utc', now())
where id = 1053;

update public.places
set link = 'https://www.instagram.com/mariquitacopas/',
    updated_at = timezone('utc', now())
where id = 1054;

update public.places
set link = 'https://exxxtremeclub.com/conexxxtion/',
    updated_at = timezone('utc', now())
where id = 1056;

update public.places
set link = 'https://www.dolphinsauna.co.uk/',
    location = '129 Mount Street, New Brighton, Wallasey CH45 9JS, United Kingdom',
    updated_at = timezone('utc', now())
where id = 1428;

-- Duplicate, closed, unverified, or unsafe/misclassified records must not be indexed.
update public.places
set seo_indexable = false,
    seo_quality_status = 'rejected',
    updated_at = timezone('utc', now())
where id in (
  1058, -- duplicate of canonical Saloon Bistro Bar row 1885
  1437, -- public stadium washroom, not a venue
  1886, -- Tendresse permanently closed 2025-08-31
  1400, -- current operator/operation could not be verified
  1803  -- Amsterdam Pop Club marked closed
);

do $$
declare
  updated_count integer;
  still_hidden integer;
  overlong_fields integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (
    857,858,859,861,944,1916,1920,1922,
    1696,1700,1701,1705,1706,1707,1711,1714,
    832,1089,1096,1097,1098,1869,
    1048,1052,1053,1054,1056,1057,
    1350,1354,1356,1358,1361,
    1424,1425,1426,1427,1428,
    1058,1437,1651,1885,1886,
    1383,1392,1396,1400,
    1794,1799,1803,1805
  )
  and venue_intel->>'updated_at' = '2026-08-29T00:00:00Z';

  if updated_count <> 51 then
    raise exception 'Expected 51 repaired venue-intelligence rows, found %', updated_count;
  end if;

  select count(*) into still_hidden
  from public.places p
  cross join lateral jsonb_each(coalesce(p.venue_intel->'topic_evidence','{}'::jsonb)) topic
  where p.id in (
    857,858,859,861,944,1916,1920,1922,1696,1700,1701,1705,1706,1707,1711,1714,
    832,1089,1096,1097,1098,1869,1048,1052,1053,1054,1056,1057,1350,1354,1356,1358,1361,
    1424,1425,1426,1427,1428,1058,1437,1651,1885,1886,1383,1392,1396,1400,1794,1799,1803,1805
  )
  and topic.value->>'status' in ('source_unavailable','not_published');

  if still_hidden <> 0 then
    raise exception 'Expected zero hidden topic statuses after repair, found %', still_hidden;
  end if;

  select count(*) into overlong_fields
  from public.places p
  cross join lateral jsonb_each_text(jsonb_build_object(
    'queue_wait', p.venue_intel->>'queue_wait',
    'best_nights', p.venue_intel->>'best_nights',
    'crowd_mix', p.venue_intel->>'crowd_mix',
    'dress_code', p.venue_intel->>'dress_code',
    'staff_inclusivity', p.venue_intel->>'staff_inclusivity'
  )) field
  where p.id in (
    857,858,859,861,944,1916,1920,1922,1696,1700,1701,1705,1706,1707,1711,1714,
    832,1089,1096,1097,1098,1869,1048,1052,1053,1054,1056,1057,1350,1354,1356,1358,1361,
    1424,1425,1426,1427,1428,1058,1437,1651,1885,1886,1383,1392,1396,1400,1794,1799,1803,1805
  )
  and length(field.value) > 320;

  if overlong_fields <> 0 then
    raise exception 'Expected all venue-intelligence fields <= 320 chars, found % over limit', overlong_fields;
  end if;
end $$;

commit;
