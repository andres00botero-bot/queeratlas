-- Queer Atlas Venue Intelligence: Amsterdam generic-copy repair.
-- Research rechecked 2026-08-29. Replaces generic text for exactly 30 records,
-- corrects moved venues and deindexes two duplicates plus one unverified closure.

begin;

with researched(id, profile) as (
  values
  (103, $qa${
    "queue_wait": "Friday and Saturday presale is the reliable route; Pride tickets only gave priority before midnight, then joined the regular queue. Thursdays and Sundays use door sale. Bring physical ID, know the party and avoid groups larger than five.",
    "best_nights": "Saturday’s 3xNYX is the clearest gay-pop night across three floors; Friday mixes pop, house, R&B and dancehall. Thursday is easier and younger. Pick the music programme first, because the four-storey club changes character by night.",
    "crowd_mix": "Gay men, queer club kids, students, international visitors and straight friends mix across separate music floors. NYX calls itself open-minded rather than exclusively gay; Saturday is the most explicitly gay-centred recurring edition.",
    "dress_code": "Expressive partywear is welcome, but Thursday warns that tracksuits and football shirts can trigger refusal. Avoid large groups, bring a look that shows you chose the night, and wear practical shoes for stairs and several floors.",
    "staff_inclusivity": "NYX publishes equality, kindness and gender-open values, while giving the door host final admission authority. The useful safeguard is operational: approach the door host, security or floor staff immediately if behaviour undermines that stated standard.",
    "source_urls": ["https://clubnyx.nl/about/", "https://clubnyx.nl/faqs/", "https://www.nyxopdonderdag.nl/faq", "https://pride.amsterdam/en/event/vrijdag-is-nyx-pride/"]
  }$qa$::jsonb),
  (104, $qa${
    "queue_wait": "PRIK is normally a free walk-in rather than a club queue. Its terrace and compact pink room tighten for karaoke, Pride street parties and weekend dancing; arrive before the scheduled host if a seat or easy bar access matters.",
    "best_nights": "Tuesday queer gaming, Thursday camp nostalgia and Sunday karaoke are concrete weekly choices. Friday/Saturday run later and dance more; an afternoon terrace visit is the best lower-volume introduction to the queer-owned bar.",
    "crowd_mix": "Locals, expats, gay men, mixed LGBTQ+ groups and visitors share an intentionally low-attitude room. Karaoke and gaming make solo contact easier; Pride shifts the balance toward a large international street-party audience.",
    "dress_code": "PRIK explicitly says there is no dress code. Everyday clothes, bright camp details and polished cocktail looks all work. Dress for terrace weather and a small room rather than inventing leather or harness rules that the venue does not publish.",
    "staff_inclusivity": "The queer-owned venue identifies its team publicly and builds weekly gaming, drag-screening and karaoke formats for community participation. Its stated rule is friendly, no-attitude entry; bring a service or safety issue directly to the bar lead.",
    "source_urls": ["https://www.prikamsterdam.nl/copy-of-home", "https://www.prikamsterdam.nl/event-list", "https://pride.amsterdam/event/prik-pride-streetparty/"]
  }$qa$::jsonb),
  (164, $qa${
    "queue_wait": "Club Church uses a theme-specific door, not one universal line. Friday underwear and major Saturday parties fill fastest; arrive near the listed opening with physical ID. Read the audience, dress and closing rules for that exact edition before queuing.",
    "best_nights": "Wednesday Naked Bar, Thursday BLUE, Friday (Z)onderbroek and rotating Saturday/Sunday fetish formats serve different communities. Bi(Z)onderbroek is all-gender; Furball, Ladz and nude sessions have their own audience and kit.",
    "crowd_mix": "Regular programming centres gay and bisexual men, bears, fetish communities and cruising guests. Named editions broaden the room: Bi(Z)onderbroek welcomes all genders, while other sessions are specifically men-only or kink-specific.",
    "dress_code": "The event name is the rule: nude, underwear, sportswear or fetish may be required or central. Do not generalise from another night. Bring only useful layers, use the coat facilities and preserve privacy in play areas.",
    "staff_inclusivity": "Church publishes separate consent, safer-sex, drugs and transgender policies and distinguishes all-gender from men-only sessions. That gives staff enforceable boundaries; report unwanted contact to bar, floor or door staff immediately.",
    "source_urls": ["https://clubchurch.nl/", "https://www.clubchurch.nl/info/sexualConsentPolicy", "https://www.clubchurch.nl/info/transgenderPolicy", "https://www.clubchurch.nl/info/houseRules"]
  }$qa$::jsonb),
  (166, $qa${
    "queue_wait": "SoHo is walk-in earlier, but Friday, Saturday and special events sell tickets at the door. Entry changes after midnight: the venue is 18+ earlier and 21+ after 00:00. Bring valid ID and arrive before the late switch if age is relevant.",
    "best_nights": "Thursday’s Tasty Thursday and Sunday’s Spicy Sunday provide named weekly hooks; Friday/Saturday run until 04:00 and create the largest dance-bar crowd. Wednesday is the calmer two-level introduction.",
    "crowd_mix": "Gay men, queer groups, tourists and respectful friends fill a central Reguliersdwarsstraat club-bar. The audience becomes younger and more international late, while early evenings retain more local conversation and table use.",
    "dress_code": "Polished casual and expressive queer nightlife clothes fit the multi-level room. No strict fetish code is published. Carry little for stairs and dancing, and check the named special event before assuming ordinary barwear is sufficient.",
    "staff_inclusivity": "SoHo operates explicitly as an LGBTQ+ bar/club and publishes house rules plus an age-controlled door. Guest feedback on service is mixed, so the accurate guidance is to escalate problems to the manager rather than promise uniform warmth.",
    "source_urls": ["https://www.soho-amsterdam.com/info/faq", "https://www.soho-amsterdam.com/info/house-rules", "https://www.iamsterdam.com/en/whats-on/lgbtqi-areas-of-amsterdam"]
  }$qa$::jsonb),
  (167, $qa${
    "queue_wait": "EXIT opens late Monday/Tuesday/Sunday and from 15:00 Wednesday–Saturday. The small dance bar is easiest before its DJ peak; Friday/Saturday after midnight can clog at the entrance and bar. Bring ID and use the current Reguliersdwarsstraat address.",
    "best_nights": "Wednesday explicitly breaks up the week; Friday/Saturday stretch to 05:00 for the fullest pop-dance finish. Start earlier for a beer and more space, then let the DJ-led room become the after-bar rather than expecting a concert timetable.",
    "crowd_mix": "Gay men, Reguliersdwarsstraat bar-hoppers, tourists and mixed queer friend groups form a casual mainstream party crowd. It is social and pop-forward rather than fetish-specific or an underground techno room.",
    "dress_code": "Casual dance-bar clothing, denim, trainers and playful party details all fit. There is no evidenced gear requirement. Choose clothes for a pole, close dancing and a long late finish, not the old address or a formal velvet-rope image.",
    "staff_inclusivity": "EXIT says guests may arrive alone and be themselves and builds the night around energetic bar staff and DJs. That is venue-specific intent; if the room fails it, identify the shift manager or security rather than relying on a generic safe-space label.",
    "source_urls": ["https://www.exitamsterdam.nl/", "https://www.instagram.com/exitamsterdam/", "https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam"]
  }$qa$::jsonb),
  (168, $qa${
    "queue_wait": "This is a duplicate, stale-address record for De Trut. Do not travel to Singel 167b or use this entry for queue planning. The active Sunday party is recorded separately at Bilderdijkstraat 165 E under place ID 1121.",
    "best_nights": "No separate best night exists for this duplicate. The canonical De Trut party runs Sunday 22:00–03:00; consult ID 1121 for the current line-up, phone-off rule, accessibility and arrival guidance.",
    "crowd_mix": "This record has no independent crowd. It duplicated the volunteer-run De Trut community at an incorrect location. Publishing two crowd profiles would inflate Amsterdam’s venue count and misdirect queer visitors.",
    "dress_code": "No outfit makes the Singel address valid. For the real Sunday party, use the canonical listing and read the weekly theme; phones must be fully switched off and photography is prohibited inside.",
    "staff_inclusivity": "There is no separate team to assess at this duplicate. De Trut’s volunteer inclusion and accessibility information belongs to canonical place ID 1121; this record should remain rejected and non-indexable.",
    "source_urls": ["https://www.trutfonds.nl/en/party/index.html", "https://trutfonds.nl/agenda-en-line-up.html"]
  }$qa$::jsonb),
  (169, $qa${
    "queue_wait": "This is a duplicate Saarein record with the wrong Driekoningenstraat address. Do not navigate here. The active community-run café is at Elandsstraat 119 and is represented by canonical place ID 1931.",
    "best_nights": "This duplicate has no independent programme. Use ID 1931 for Saarein’s Wednesday–Sunday hours and current Instagram-led events; maintaining two recommendations would create a false second lesbian/queer bar.",
    "crowd_mix": "No separate audience belongs to this row. It duplicates Café Saarein’s queer women-centred, all-queer-minded community at Elandsstraat and should not count toward Amsterdam venue totals.",
    "dress_code": "Not applicable at the stale address. The real Saarein is a relaxed brown café with no selector wardrobe; consult the canonical profile rather than dressing for a venue that is not there.",
    "staff_inclusivity": "This duplicate has no staff. Inclusion evidence belongs to Stichting Saarein and its volunteers at Elandsstraat 119; the honest database action is rejection and deindexing, not a second invented rating.",
    "source_urls": ["https://cafesaarein.nl/", "https://www.iamsterdam.com/uit/agenda/eten-en-drinken/cafes-en-bars/saarein", "https://crowdfunding.cafesaarein.nl/contact/"]
  }$qa$::jsonb),
  (171, $qa${
    "queue_wait": "Reception checks 18+ entry and can refuse intoxicated guests. Weekly formats such as No Towel Tuesday, Wednesday Queer Night and the second-Sunday Tea Dance concentrate lockers and changing; arrive near the published start for easier facilities.",
    "best_nights": "Monday is mellow, Tuesday is no-towel, Wednesday explicitly broadens to Queer Night, Thursday is youth-focused and the second Sunday has a 15:00–21:00 Tea Dance. Choose the audience and clothing policy, not a generic weekend.",
    "crowd_mix": "The sauna’s core is gay and bisexual men across ages and body types; Wednesday Queer Night broadens participation. Bears gather on the last Saturday, while Thursday targets younger adults. This is sexual wellness, not a mixed public spa.",
    "dress_code": "Standard areas prohibit underwear, caps and swimwear; Thursday permits swimwear. Tea Dance allows swimwear, towel or nudity. Phones stay in the lounge/locker zone and photography is forbidden throughout the venue.",
    "staff_inclusivity": "House rules explicitly ban discriminatory language, actions and symbols and provide a manager email for complaints. Staff also enforce drug, phone and clothing rules; Wednesday’s Queer Night is the clearest all-community inclusion signal.",
    "source_urls": ["https://saunanieuwezijds.nl/", "https://www.saunanieuwezijds.nl/info/our-house-rules", "https://saunanieuwezijds.nl/agenda/tea-dance"]
  }$qa$::jsonb),
  (172, $qa${
    "queue_wait": "Panama is event-led: hours, age floor and ticket operator change every week. Buy the named event, bring physical ID and allow time for security, €4 key lockers and tokens. Recent guests specifically criticise peak logistics, so early arrival is useful.",
    "best_nights": "There is no honest universal Friday. Choose a promoter and lineup: BACKDOOR/WE PARTY creates a large LGBTQ+ circuit night, Bear Necessity centres bears, while other bookings are mainstream electronic or live events.",
    "crowd_mix": "The building itself is a mainstream event venue. Queer circuit crowds, bears, international Pride visitors or general electronic audiences appear only when the named promoter brings them; do not assign one LGBTQ+ mix to every night.",
    "dress_code": "Follow the ticketed event, not Panama as a building. Carry valid ID, wear dance-safe shoes and plan for a small key locker. A queer circuit production may invite a bolder look, while another organiser can set different rules.",
    "staff_inclusivity": "Panama provides security, free tap water, earplugs and an email escalation route, but queer inclusion is primarily promoter-specific. Confirm accessibility and welfare provision with the organiser; 2026 reviews flag poor logistics on crowded nights.",
    "source_urls": ["https://panama.nl/faq-2/", "https://pride.amsterdam/en/event/backdoor-x-we-party-world-pride-2026/", "https://pride.amsterdam/en/event/bear-necessity-pride/", "https://www.reddit.com/r/amsterdam_rave/comments/1ruqjz5/"]
  }$qa$::jsonb),
  (173, $qa${
    "queue_wait": "RADION’s ticket and physical-ID checks precede a discretionary safety door. Weekend and marathon arrivals can queue, so use the ticket slot and know the lineup. The industrial route includes stairs and uneven surfaces; closed-toe shoes are strongly recommended.",
    "best_nights": "Choose the production: RADION-curated techno, Vault Sessions, Gegen and marathon programmes each set a different musical and queer emphasis. An ordinary Friday is not interchangeable with a sex-positive promoter or all-day Sunday continuation.",
    "crowd_mix": "Amsterdam techno regulars, artists, students and international ravers form the base. Queer and sex-positive editions bring a more LGBTQ+ and fetish-forward mix; the venue itself is inclusive but not exclusively queer every weekend.",
    "dress_code": "Closed-toe shoes are the meaningful rule; unsafe footwear can be refused. Wear durable club clothes for concrete, stairs and long dancing. A promoter may add theme or privacy expectations, so read its page before adopting fetishwear.",
    "staff_inclusivity": "RADION has a staffed Club Care booth for emotional support, intoxication, first aid, quiet breaks and locker help. Its rules ban queerphobia, racism and harassment and direct guests to Club Care, security or any crew member.",
    "source_urls": ["https://radion.amsterdam/our-policies", "https://radion.amsterdam/safer-clubbing", "https://radion.amsterdam/", "https://www.radion.amsterdam/news/get-home-safe-with-radion"]
  }$qa$::jsonb),
  (174, $qa${
    "queue_wait": "Lellebel is tiny, so the issue is standing room rather than a formal queue. It opens at 21:00 Wednesday–Sunday; arrive before karaoke, drag or comedy for a place near the stage. The correct door is Utrechtsestraat 4H.",
    "best_nights": "Sunday karaoke is the weekly anchor. The last weekends of the month add queer comedy, Friday karaoke and drag, while early-month pub nights favour rock, conversation and meeting the regulars without a produced show.",
    "crowd_mix": "Trans and non-binary guests, queer women, gay men, alternative-music regulars, performers and visitors share a deliberately broad little pub. It is community-led and conversational, not a male-only drag bar.",
    "dress_code": "Alternative, indie, grunge, expressive queer style or ordinary jeans all fit; there is no fashion test. Dress for a warm, close room and a spontaneous turn at karaoke rather than a polished circuit-club threshold.",
    "staff_inclusivity": "Lellebel is trans/queer-woman owned and operated, not merely rainbow-branded. Fresh reviews repeatedly name the owner and staff as personally welcoming; its stage also invites queer comedians, singers and drag performers to propose work.",
    "source_urls": ["https://www.lellebel.nl/", "https://www.iamsterdam.com/uit/agenda/eten-en-drinken/cafes-en-bars/cafe-lellebel", "https://www.instagram.com/lellebelamsterdam/"]
  }$qa$::jsonb),
  (852, $qa${
    "queue_wait": "This is mainstream hotel reception, with check-in from 15:00 and checkout by noon. The desk is busiest around afternoon turnover; early arrival may mean luggage storage rather than a room. Book the exact room type if canal view or twin beds matter.",
    "best_nights": "Use ibis Stopera as a quieter central base for Waterlooplein and eastern-centre access, not for an in-house queer programme. Pride and festival weekends raise rates and lobby pressure; ordinary weekdays suit practical sightseeing.",
    "crowd_mix": "Tourists, couples, families and business guests form a broad three-star hotel audience. LGBTQ+ travellers are ordinary guests, but the property does not present itself as queer-owned or a dedicated community hotel.",
    "dress_code": "No dress code applies at reception, breakfast or the lounge. Travel clothes are sufficient. Nearby nightlife venues set their own ID and outfit rules, so do not infer club admission from the hotel’s central location.",
    "staff_inclusivity": "The official property lists wheelchair accessibility, a non-smoking building and a 24-hour service model, but no queer-specialist staff policy. Confirm names, room setup and access needs with reception rather than relying on a generic LGBTQ-friendly claim.",
    "source_urls": ["https://all.accor.com/hotel/3044/index.en.shtml", "https://all.accor.com/hotel/3044/index.nl.shtml"]
  }$qa$::jsonb),
  (853, $qa${
    "queue_wait": "The Otherside is a compact cannabis coffeeshop open daily 10:00–00:00. Seating, not a door queue, is the practical constraint; the operator says there is usually room even when it looks busy. Bring legal ID and expect product-service checks.",
    "best_nights": "Daytime or early evening is best for the room, music and conversation before Reguliersdwarsstraat nightlife peaks. This is a cannabis coffeeshop, not a DJ bar; visit late only if smoking and a short pause are the actual goal.",
    "crowd_mix": "Locals, cannabis regulars, LGBTQ+ visitors from the surrounding street and tourists mix in a small room. Its location makes it gay-popular, but it is not a dedicated queer community organisation or women-centred bar.",
    "dress_code": "Everyday street clothes are appropriate. There is no nightlife dress rule. Carry legal identification, consume responsibly and avoid combining products with a long club itinerary if you do not know your response.",
    "staff_inclusivity": "The operator foregrounds friendly service, neighbourly seating and a long Reguliersdwarsstraat history; current testimonials specifically praise workers. That is service evidence, while queer inclusion remains contextual rather than an explicit specialist policy.",
    "source_urls": ["https://theotherside.nl/", "https://maps.apple.com/place?place-id=IB72101E4C902A3DB", "https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam"]
  }$qa$::jsonb),
  (854, $qa${
    "queue_wait": "Oosterpark is a public municipal park, not an admission-controlled queer venue. There is no legitimate queue, coat check or host. The database’s ‘busiest after 22:00’ claim is unsourced cruising lore and should not be treated as safe advice.",
    "best_nights": "Use daylight for walking, sport, picnics or dated public events. The city publishes facilities and an alcohol ban, not a cruising schedule. Meeting strangers after dark in secluded areas adds risk without venue staff or consent infrastructure.",
    "crowd_mix": "Residents, families, runners, skaters, festival visitors and tourists use a mainstream neighbourhood park. Queer people are part of that public, but the park as a whole does not have a gay or cruising audience.",
    "dress_code": "Wear ordinary park clothing for weather, visibility and walking. There is no barwear or fetish code. Public-decency, consent and municipal rules apply; minimise valuables and choose populated paths if meeting someone.",
    "staff_inclusivity": "Municipal park workers are not queer nightlife hosts and no inclusion score can substitute for that distinction. Use city services or emergency support for safety issues; the official park page documents facilities and an alcohol prohibition.",
    "source_urls": ["https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/", "https://oosterpark.nl/", "https://www.iamsterdam.com/en/explore/neighbourhoods/oost"]
  }$qa$::jsonb),
  (1121, $qa${
    "queue_wait": "De Trut opens only Sunday 22:00–03:00 with about 230-person capacity, so the queue is real and community-managed. Arrive before 22:00 rather than after midnight. Your phone must be visibly switched fully off before entry.",
    "best_nights": "Every Sunday is the party; the weekly lineup and theme are the choice. The first Sunday of each month omits strobe and flash effects for light-sensitive guests. Check Trutpost for dress themes before committing.",
    "crowd_mix": "Dykes, trans people, gay men and everyone between are explicitly named in the house rules. Volunteers, Amsterdam alternative queers and newcomers share a non-commercial basement whose profits support small LGBTQIA+ projects.",
    "dress_code": "There is no permanent fashion uniform, but a weekly theme may apply. The hard rule is privacy: phone completely off, no photos or video. Bring a physical payment card or cash because mobile payment cannot work with the phone off.",
    "staff_inclusivity": "Volunteers enforce a privacy policy designed for closeted and vulnerable guests, provide free water cups and publish a strobe-free first Sunday. The basement has stairs and a difficult toilet route; contact them days ahead for assistance.",
    "source_urls": ["https://www.trutfonds.nl/en/party/index.html", "https://trutfonds.nl/agenda-en-line-up.html", "https://www.trutfonds.nl/en/"]
  }$qa$::jsonb),
  (1122, $qa${
    "queue_wait": "Bears Amsterdam is usually a bar walk-in; Bear Pride, visiting titleholders and house-music events fill the social floor and play area. Use the current Sint Jacobsstraat 6 address. Coat check costs €1.50; lockers €2 plus €10 deposit.",
    "best_nights": "Choose a dated bear-community event, Sunday social or Amsterdam Bear Pride gathering for maximum connection. An ordinary early evening suits conversation; large Bear Necessity dance events happen at Panama, not inside this compact bar.",
    "crowd_mix": "Bears, cubs, otters, daddies, chasers and friends form the centre. Women and non-binary guests are explicitly welcome; trans men are welcome throughout the bar, events and play area when they identify with the men/bear community.",
    "dress_code": "Casual bear-bar wear, denim, leather and fetish accents all fit without a universal costume. Check a named event for gear. Use the cloakroom or locker for valuables and retain the deposit token before closing.",
    "staff_inclusivity": "The official FAQ answers trans-men, women and non-binary access directly rather than vaguely: trans men may use the play area, and non-male friends are welcome when respecting the bear focus. Free condoms and safer-sex information are provided.",
    "source_urls": ["https://bearsamsterdam.com/nl/", "https://amsterdambearpride.com/nl/events/", "https://www.dutchrubbermen.nl/venue/bears-amsterdam/"]
  }$qa$::jsonb),
  (1123, $qa${
    "queue_wait": "Bar Blend is walk-in for groups under eight; Monday bingo and weekend drag/DJs operate ‘full means full’. Arrive before the 21:00 bingo host for a table. Groups of eight or more can reserve, held for only 15 minutes on busy nights.",
    "best_nights": "Monday Drag Queen Bingo is the distinctive free weekly event. Friday/Saturday bring drag, dancers and DJs until 04:00; weekday afternoons are better for cocktails and actual conversation in the small original bar.",
    "crowd_mix": "LGBTQIA+ locals, gay men, drag audiences, tourists and respectful friends use a compact, mixed-gender room. Weekend entertainment broadens the visitor crowd, while weekday regulars give it more neighbourhood texture.",
    "dress_code": "The group publishes no strict dress code: colourful casual, smart cocktail clothes and drag-night sparkle all work. The meaningful constraint is space, so keep bags small and wear shoes that handle a packed little dance area.",
    "staff_inclusivity": "Bar Blend publishes zero tolerance for racism, transphobia and harassment. It is step-free with a ground-floor toilet and offers a quieter rear lounge; staff ask guests to call ahead for a quiet corner or specific support.",
    "source_urls": ["https://barblend.nl/bar-blend", "https://barblend.nl/faq", "https://barblend.nl/accessibility", "https://barblend.nl/terms"]
  }$qa$::jsonb),
  (1124, $qa${
    "queue_wait": "Montmartre has moved from Halvemaansteeg to Reguliersdwarsstraat 48 as Montmartre XL. Small groups walk in; eight or more may reserve. Sing-along weekends fill fastest, so arrive near 18:00 if a ground-floor base matters.",
    "best_nights": "Wednesday/Thursday give the 18:00–01:00 sing-along bar; Friday–Sunday extend to 03:00 with Eurovisie, disco and 80s/90s classics. Choose it for communal Dutch-pop energy, not a techno or fetish night.",
    "crowd_mix": "Long-time gay-bar fans, Dutch sing-along regulars, younger LGBTQIA+ groups, birthdays and visitors mix around the revived name. It is open to respectful friends and intentionally intergenerational rather than men-only.",
    "dress_code": "No strict code applies. Casual barwear is enough; glitter and Eurovision drama suit theme nights but are optional. The main floor is accessible, while the sing-along platform has two steps.",
    "staff_inclusivity": "The operator publishes zero tolerance for racism, transphobia and harassment. Montmartre XL has ground-floor entry and toilet, with two steps to the sing-along platform; staff invite advance contact for assistance or a quiet pause.",
    "source_urls": ["https://barblend.nl/montmartre-xl", "https://barblend.nl/faq", "https://barblend.nl/accessibility", "https://barblend.nl/contact"]
  }$qa$::jsonb),
  (1125, $qa${
    "queue_wait": "Pamela’s official site currently says ‘Pam’s out’ and ‘we’ll be back soon’, with no verified operating address or reopening date. Do not travel to the former Jacob van Lennepstraat listing or quote its old brunch hours as current.",
    "best_nights": "There is no verified active night. The former queer-owned bar/kitchen mixed food, performance and parties, but an archived Friday/Saturday recommendation is not a reopening notice. Follow the official Instagram for a dated return.",
    "crowd_mix": "Pamela previously centred queer West locals, trans and non-binary guests, performers and food-led friend groups. A paused operation has no current crowd, and that former identity cannot be assigned to a future address without review.",
    "dress_code": "Not applicable until a new door and programme are announced. The old room welcomed expressive casual style, but no outfit validates an obsolete address. Check the eventual launch post for location, accessibility and event rules.",
    "staff_inclusivity": "The prior queer-owned identity is valuable history, not proof of a current team. With no verified active service, the honest inclusion status is operation unverified; reassess staffing and reporting routes after a dated reopening.",
    "source_urls": ["https://www.pamela.amsterdam/", "https://www.instagram.com/pamela.amsterdam/", "https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam"]
  }$qa$::jsonb),
  (1126, $qa${
    "queue_wait": "Spijkerbar is a free walk-in, though Saturday Drag Bingo and Naked Tuesday can fill its compact pool-bar layout. Arrive before Saturday’s 18:00 host for a usable position. Free lockers support stripping and darkroom use.",
    "best_nights": "Tuesday from 19:00 is men-only Naked Bar; Saturday at 18:00 has Drag Bingo. Wednesday/Thursday offer 18:00–20:00 happy hour. Pick the format deliberately, because naked cruising and early bingo are not the same audience.",
    "crowd_mix": "Gay men, local regulars, pool players, older patrons and visitors form the base. Tuesday is explicitly men-only and nude-focused; Saturday drag broadens the social bar atmosphere without changing its gay-male centre.",
    "dress_code": "Everyday barwear works most days; Tuesday is a naked event with free lockers. Shoes remain practical around the bar and pool table. Privacy and consent matter in the darkroom even though the official page does not publish a costume gate.",
    "staff_inclusivity": "The venue gives concrete boundaries: Tuesday is men-only, lockers support nude participation and staff instructions govern entry. It serves a gay-male constituency rather than claiming all-audience inclusion; guests outside that format should choose another night.",
    "source_urls": ["https://www.spijkerbar.nl/events/", "https://www.spijkerbar.nl/", "https://www.spijkerbar.nl/reservation/"]
  }$qa$::jsonb),
  (1127, $qa${
    "queue_wait": "Taboo does not take online table reservations and says staff will find a place on arrival. Wednesday and Sunday drag around 22:00 and weekend terrace traffic fill fastest; arrive earlier for seating, food and less bar pressure.",
    "best_nights": "Wednesday Fabulous Cocktail Night combines drag, games and drink offers; Sunday Drag Me to Heaven begins around 22:00. Friday/Saturday run until 04:00 for the louder street-party version.",
    "crowd_mix": "Gay men, drag fans, Reguliersdwarsstraat regulars, tourists and mixed LGBTQ+ groups share the bar and Kantine terraces. Earlier dining is broader; late drag and weekend hours skew more queer-nightlife focused.",
    "dress_code": "Casual-to-polished gay-bar clothing and drag-night colour fit; no strict code is published. Dress for terrace weather and a busy standing bar. Taboo Bar Amsterdam is unrelated to the similarly named Dutch touring house-event promoter.",
    "staff_inclusivity": "The bar’s recurring drag programme and LGBTQ+ street identity are concrete, while its public site offers direct WhatsApp contact. For misconduct, identify bar management immediately; do not confuse its policy with the separate Taboo Events organisation.",
    "source_urls": ["https://taboo-bar-amsterdam.jimdosite.com/", "https://taboo-bar-amsterdam.jimdosite.com/contact/", "https://www.iamsterdam.com/en/whats-on/theatre-and-stage/amsterdams-sparkling-drag-scene"]
  }$qa$::jsonb),
  (1128, $qa${
    "queue_wait": "The Queen’s Head is walk-in, but Tuesday Drag Bingo at 20:30 and weekend DJs fill the compact canal-view room. Arrive well before bingo for a seat; Friday/Saturday dancing creates crowd pressure rather than a selective club door.",
    "best_nights": "Tuesday bingo, second-Wednesday queer quiz, Thursday drag and alternating Friday karaoke provide distinct choices. Weekend DJs run until 03:00; an ordinary 16:00 opening is best for canal views and regular-bar conversation.",
    "crowd_mix": "Gay regulars, older locals, drag fans, tourists and mixed-gender LGBTQ+ groups share an explicitly gay but open-to-everyone bar. Bingo brings the broadest visitor crowd; ordinary weekdays feel more rooted in Zeedijk regulars.",
    "dress_code": "Everyday brown-café clothes, smart-casual date looks and drag-night sparkle all work. There is no strict outfit door. Dress for close seating and a small weekend dance floor rather than a fetish or high-fashion rule.",
    "staff_inclusivity": "The venue explicitly welcomes every gender, race and sexuality and backs that with drag competition, queer quiz, bingo and recurring performers. For a problem, approach the bar team or named host; both are visible in the compact room.",
    "source_urls": ["https://queenshead.nl/", "https://dezeedijk.amsterdam/directory-zeedijk/company/cafe-the-queens-head/", "https://www.iamsterdam.com/en/whats-on/theatre-and-stage/amsterdams-sparkling-drag-scene"]
  }$qa$::jsonb),
  (1924, $qa${
    "queue_wait": "Amistad has only nine rooms and reception is now staffed 08:00–16:00, not until 23:00. Send an arrival time when booking; later arrivals use key pickup. Every room is reached only by stairs, so confirm mobility needs before payment.",
    "best_nights": "Choose it for a small social breakfast, Kerkstraat location and walkable queer nightlife rather than hotel events. Pride and major weekends sell the limited inventory early; quieter dates better suit the shared-table, home-like atmosphere.",
    "crowd_mix": "Gay men, solo LGBTQ+ travellers, same-sex couples and other welcoming guests use a tiny independent hotel. The property now explicitly welcomes lesbian, gay, bi, trans, straight and questioning guests rather than operating men-only.",
    "dress_code": "No dress code applies. Ordinary travel clothing is right; nightlife nearby has separate rules. Pack light because all nine rooms require stairs, and bring breakfast-table clothes if communal dining feels different from anonymous buffet service.",
    "staff_inclusivity": "The official site directly welcomes guests across LGBTQ identities and names owner Klaas and long-serving team member Mike. That personal evidence is stronger than a badge; the key limitation is physical, with no lift and all rooms stair-only.",
    "source_urls": ["https://www.amistad.nl/", "https://www.amistad.nl/rooms"]
  }$qa$::jsonb),
  (1925, $qa${
    "queue_wait": "Hotel CC has 24-hour reception and is cashless. Standard hotel check-in applies; bring physical ID and a payment card. Monumental-house layouts vary, and some attic rooms require partial stairs despite the lift, so verify the assigned category.",
    "best_nights": "Book for Central Station, Zeedijk and Red Light District access, not for an in-house queer programme. Weekend street noise and visitor traffic are the trade-off; courtyard or suitable lower-access rooms make more sense for a quieter stay.",
    "crowd_mix": "International tourists, couples, families and nightlife visitors form a mainstream three-star hotel audience. The Zeedijk location is close to gay venues, but the hotel does not evidence queer ownership or a transgender-specialist operation.",
    "dress_code": "No hotel dress rule applies. Travel clothes are sufficient. Carry valid ID because visitors must register, and note that external visitors are restricted after 23:00—important if your nightlife plan assumes bringing someone back.",
    "staff_inclusivity": "The useful policies are 24-hour reception, lift access and registered-visitor rules, not an unsupported trans-safe label. Historic construction means access varies by room; confirm lift reach and chosen name before arrival in writing.",
    "source_urls": ["https://hotelcc.nl/", "https://www.winhotels.com/explore-hotels/hotel-cc-amsterdam/", "https://www.booking.com/hotel/nl/cc.html"]
  }$qa$::jsonb),
  (1926, $qa${
    "queue_wait": "Check-in begins 15:00 and checkout is noon; early or late service is availability-led and late checkout may cost extra. The large 12-floor hotel has lifts and a 24-hour service model, so the practical peak is afternoon room turnover.",
    "best_nights": "Use Aitana for spacious design rooms, IJ waterfront calm and a walk to Centraal, not a recurring queer programme. Weekends suit nightlife access; weekdays better preserve the quiet-district advantage and may reduce rate pressure.",
    "crowd_mix": "Couples, families, business travellers and international tourists use a mainstream four-star design hotel. An out gay founder is relevant company history, but it does not turn every property night into an LGBTQ+ community venue.",
    "dress_code": "No dress code applies. Smart-casual suits the lobby and restaurant, while ordinary travel clothing is valid. Nearby nightlife sets independent ID and outfit rules; a hotel reservation carries no club-door privilege.",
    "staff_inclusivity": "Current reviews rate staff strongly and the property provides lifts and accessible facilities, but no current source supports calling it a transgender landmark. Confirm pronouns, partner details and a specific accessible room with reception before travel.",
    "source_urls": ["https://room-matehotels.com/gb/hotel-aitana-amsterdam/", "https://www.booking.com/hotel/nl/room-mate-aitana.html", "https://uk.hotels.com/ho437565/room-mate-aitana-amsterdam-netherlands/"]
  }$qa$::jsonb),
  (1927, $qa${
    "queue_wait": "Café ’t Mandje is tiny, so weekend and heritage-event pressure shows up as no seat or standing room rather than a managed club queue. Come near the 15:00/16:00 opening to see the historic interior; Monday is closed.",
    "best_nights": "An afternoon or early evening best reveals Bet van Beeren’s preserved room and permits conversation. Friday/Saturday run to 03:00 for a livelier bar; use dated open-stage or Zeedijk festival posts for actual programming.",
    "crowd_mix": "Queer-history visitors, lesbians, gay men, older regulars, sailors-and-city-history enthusiasts and tourists share a small brown café. It is LGBTQ+ heritage without an identity-policed door and often feels more museum-like earlier.",
    "dress_code": "Come as you are: street clothes, denim and relaxed date-night layers fit the old brown-café room. There is no fetish or fashion code. Keep belongings compact around preserved memorabilia and a very small floor.",
    "staff_inclusivity": "Its operating motto is ‘Fun & respect since 1927’, rooted in Bet van Beeren’s practice of mixing queer people with sailors and neighbours. The current business reopened in 2025; report disrespect to the bar rather than treating history as automatic protection.",
    "source_urls": ["https://www.cafetmandje.amsterdam/", "https://www.cafetmandje.amsterdam/openingstijden/", "https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam"]
  }$qa$::jsonb),
  (1928, $qa${
    "queue_wait": "Bar Buka is a walk-in neighbourhood bar, not a nightclub. Most visitors arrive after dinner; karaoke and themed dates fill the tables. Groups may reserve an area, and Monday–Wednesday open only for private bookings or special events.",
    "best_nights": "Twice-monthly karaoke, speed dating, pub quizzes, Kinky Women gatherings, crafting and 50+ afternoons serve different needs. Friday/Saturday bring the liveliest regular bar; selected Sundays offer a short 16:00–20:00 community window.",
    "crowd_mix": "The bar reports roughly 95% women, spanning ages, Dutch locals and international visitors. Lesbians and queer women are intentionally central; trans, non-binary and male LGBTQ+ guests plus respectful allies are also explicitly welcome.",
    "dress_code": "The official FAQ says no dress code or strict door policy. Everyday clothes, date looks and karaoke colour all work. This is a residential-area bar with volume limits, so expect tables, conversation and modest dancing rather than clubwear pressure.",
    "staff_inclusivity": "Buka directly explains who is centred and who may enter, rather than using vague language: women and lesbians lead the room, with trans and non-binary people and allies welcome. Its programme includes age-specific, social and kink-focused formats.",
    "source_urls": ["https://barbuka.nl/", "https://pride.amsterdam/en/boats/bar-buka/", "https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam"]
  }$qa$::jsonb),
  (1929, $qa${
    "queue_wait": "Use the presale time slot exactly: entry outside it is refused, and a ticket still does not guarantee admission. Door hosts assess fit with the queer space. Groups are limited to three; bring physical ID and arrive informed about the lineup.",
    "best_nights": "Choose the collective and duration, not Friday versus Saturday. RAUM invites, PAX-ROMANA and queer community collaborations shape sound and sexual energy differently; some editions run 12 hours or longer with timed doors.",
    "crowd_mix": "Queer and trans clubbers, Amsterdam techno regulars, artists and international dancers are deliberately centred, with respectful non-queer guests admitted. Specific collectives can shift the room toward gay men, FLINTA audiences or broader experimental scenes.",
    "dress_code": "Self-expression is expected, but business attire, formal uniforms, sports-club merchandise, open shoes and thin soles may cause refusal. Phones are camera-stickered and photography is forbidden. Dress for the event, industrial floor and queer context.",
    "staff_inclusivity": "RAUM has an awareness team, written neurodiversity and guest policies, explicit anti-racism work and enforceable bans for harassment, transphobia, ableism or fatphobia. Staff ask guests to report incidents directly for action and follow-up.",
    "source_urls": ["https://www.clubraum.nl/house-rules", "https://www.clubraum.nl/code", "https://www.clubraum.nl/calendar", "https://www.clubraum.nl/"]
  }$qa$::jsonb),
  (1930, $qa${
    "queue_wait": "Regular Thursday–Sunday nights are free entry; special daytime events may charge and door-only editions can fill. Bags and backpacks must go to guarded coat check, no suitcases are stored, and footwear is mandatory throughout.",
    "best_nights": "Thursday Men@Work is cruise-led; Friday/Saturday add DJs and late dancing; Sunday runs 22:00–04:00. Daytime Pup, bear, rubber, nude and all-gender formats have separate audience and entry rules—use the exact agenda.",
    "crowd_mix": "Regular hours remain men-only, including trans men and non-binary people who identify as men. More than 150 extra events add all-gender, women-only, FLINTA, BDSM, pup, bear and other fetish communities.",
    "dress_code": "Regular nights allow street clothes, underwear, nudity or fetish gear; shoes or boots are always required and flip-flops are banned. Theme events may enforce specific gear. Coat check is free when naked, in underwear, jockstrap or full fetish.",
    "staff_inclusivity": "The official policy explicitly includes trans men and male-identifying non-binary guests during regular men-only hours and labels other editions precisely. Guarded coat check and event-specific staff provide clear reporting points in the sexual space.",
    "source_urls": ["https://www.eagleamsterdam.com/", "https://www.eagleamsterdam.com/about-eagle-amsterdam-gay-club/", "https://linktr.ee/eagleamsterdam"]
  }$qa$::jsonb),
  (1931, $qa${
    "queue_wait": "Saarein is a small community brown café at Elandsstraat 119. Walk-ins work, but pool, weekend tables and announced events tighten the room; contact the café for a reservation rather than relying on the duplicate Driekoningenstraat listing.",
    "best_nights": "Wednesday/Thursday are best for pool and conversation; Friday/Saturday run until 02:00 with a fuller queer crowd. Events are announced on Instagram. Sunday offers an earlier community finish rather than a late club night.",
    "crowd_mix": "Queer women and lesbians remain the historic centre, joined by trans and non-binary guests, gay friends and other queer-minded people. The new foundation model brings volunteers and an intergenerational community rather than a tourist-only bar.",
    "dress_code": "Neighbourhood casual, soft-butch tailoring, femme looks, work clothes and ordinary denim all belong. There is no selector wardrobe. Dress for pool, close tables and a traditional brown-café room rather than a dance-club production.",
    "staff_inclusivity": "Stichting Saarein was formed specifically to preserve an inclusive, safe and visible queer meeting place, supported by more than thirty volunteers. That community ownership is concrete; reservations and questions go directly to the café team.",
    "source_urls": ["https://cafesaarein.nl/", "https://www.iamsterdam.com/uit/agenda/eten-en-drinken/cafes-en-bars/saarein", "https://crowdfunding.cafesaarein.nl/contact/"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id in (168,169) then jsonb_build_object('operating_status','duplicate_record_deindexed')
       when id=1125 then jsonb_build_object('operating_status','current_operation_unverified')
       when id=854 then jsonb_build_object('operating_status','public_space_not_managed_venue')
       when id=172 then jsonb_build_object('operating_status','active_event_led_mainstream_venue')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence', jsonb_build_object(
      'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_29',
    'updated_at','2026-08-29T00:00:00Z'
  ) as patch from researched
)
update public.places p
set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch,
    updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Duplicate and unverifiable-operation cleanup.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (168,169,1125);

-- Current operational corrections found during the review.
update public.places set location='Reguliersdwarsstraat 42, 1017 BM Amsterdam, Netherlands',link='https://clubnyx.nl/',updated_at=timezone('utc',now()) where id=103;
update public.places set location='Spuistraat 109, 1012 SV Amsterdam, Netherlands',hours='Mon-Thu 16:00-01:00; Fri 16:00-03:00; Sat 15:00-03:00; Sun 15:00-01:00.',link='https://www.prikamsterdam.nl/',updated_at=timezone('utc',now()) where id=104;
update public.places set name='Club Church',location='Kerkstraat 52, 1017 GM Amsterdam, Netherlands',hours='Event-specific: Wed from 20:00; Thu-Sat from 22:00; Sun afternoon sessions; use current agenda.',link='https://clubchurch.nl/',updated_at=timezone('utc',now()) where id=164;
update public.places set location='Reguliersdwarsstraat 42, 1017 BM Amsterdam, Netherlands',hours='Mon-Tue 22:00-04:00; Wed-Thu 15:00-04:00; Fri-Sat 15:00-05:00; Sun 22:00-04:00.',link='https://www.exitamsterdam.nl/',updated_at=timezone('utc',now()) where id=167;
update public.places set location='Oostelijke Handelskade 4, 1019 BM Amsterdam, Netherlands',hours='Event-specific; verify the named organiser, doors and closing time.',link='https://panama.nl/',updated_at=timezone('utc',now()) where id=172;
update public.places set location='Utrechtsestraat 4H, 1017 VN Amsterdam, Netherlands',hours='Mon-Tue closed; Wed-Thu 21:00-00:00; Fri-Sat 21:00-02:00; Sun 21:00-03:00.',link='https://www.lellebel.nl/',updated_at=timezone('utc',now()) where id=174;
update public.places set link='https://all.accor.com/hotel/3044/index.en.shtml',hours='24-hour hotel; check-in from 15:00, checkout by 12:00.',updated_at=timezone('utc',now()) where id=852;
update public.places set link='https://theotherside.nl/',updated_at=timezone('utc',now()) where id=853;
update public.places set hours='Public park; use daylight and current municipal notices. Alcohol is prohibited.',link='https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/',updated_at=timezone('utc',now()) where id=854;
update public.places set location='Bilderdijkstraat 165 E, 1053 KP Amsterdam, Netherlands',link='https://www.trutfonds.nl/en/party/index.html',updated_at=timezone('utc',now()) where id=1121;
update public.places set location='Sint Jacobsstraat 6, 1012 NC Amsterdam, Netherlands',link='https://bearsamsterdam.com/en_gb/',updated_at=timezone('utc',now()) where id=1122;
update public.places set hours='Mon-Thu 15:00-03:00; Fri-Sat 14:00-04:00; Sun 14:00-03:00.',link='https://barblend.nl/bar-blend',updated_at=timezone('utc',now()) where id=1123;
update public.places set name='Montmartre XL',location='Reguliersdwarsstraat 48, 1017 BM Amsterdam, Netherlands',hours='Wed-Thu 18:00-01:00; Fri-Sun 18:00-03:00.',link='https://barblend.nl/montmartre-xl',updated_at=timezone('utc',now()) where id=1124;
update public.places set hours='Current operation unverified; official site says the venue will return.',updated_at=timezone('utc',now()) where id=1125;
update public.places set hours='Mon closed; Tue 19:00-01:00; Wed-Thu 16:00-01:00; Fri-Sat 16:00-03:00; Sun 16:00-01:00.',link='https://www.spijkerbar.nl/',updated_at=timezone('utc',now()) where id=1126;
update public.places set hours='Mon-Thu 16:00-03:00; Fri 15:00-04:00; Sat 15:00-04:00; Sun 15:00-03:00.',link='https://taboo-bar-amsterdam.jimdosite.com/',updated_at=timezone('utc',now()) where id=1127;
update public.places set link='https://queenshead.nl/',updated_at=timezone('utc',now()) where id=1128;
update public.places set hours='Reception 08:00-16:00; later arrival by arranged key pickup.',link='https://www.amistad.nl/',updated_at=timezone('utc',now()) where id=1924;
update public.places set hours='24-hour reception; check-in from 15:00, checkout by 11:00.',link='https://hotelcc.nl/',updated_at=timezone('utc',now()) where id=1925;
update public.places set hours='24-hour hotel; check-in from 15:00, checkout by 12:00.',link='https://room-matehotels.com/gb/hotel-aitana-amsterdam/',updated_at=timezone('utc',now()) where id=1926;
update public.places set hours='Mon closed; Tue-Thu 16:00-01:00; Fri-Sat 15:00-03:00; Sun 15:00-01:00.',updated_at=timezone('utc',now()) where id=1927;
update public.places set hours='Mon-Wed closed; Thu 17:00-00:30; Fri-Sat 17:00-01:00; selected Sun 16:00-20:00.',updated_at=timezone('utc',now()) where id=1928;
update public.places set hours='Event-specific, usually Fri/Sat from 23:00; ticket time slot is binding.',updated_at=timezone('utc',now()) where id=1929;
update public.places set hours='Thu 22:00-04:00; Fri-Sat 22:00-05:00; Sun 22:00-04:00; extra events vary.',updated_at=timezone('utc',now()) where id=1930;
update public.places set location='Elandsstraat 119, 1016 RX Amsterdam, Netherlands',hours='Mon-Tue closed; Wed-Thu 16:00-01:00; Fri-Sat 16:00-02:00; Sun 16:00-01:00.',link='https://cafesaarein.nl/',updated_at=timezone('utc',now()) where id=1931;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places
  where id in (103,104,164,166,167,168,169,171,172,173,174,852,853,854,1121,1122,1123,1124,1125,1126,1127,1128,1924,1925,1926,1927,1928,1929,1930,1931)
    and venue_intel->>'updated_at'='2026-08-29T00:00:00Z';
  if updated_count<>30 then raise exception 'Expected 30 repaired Amsterdam profiles, found %',updated_count; end if;

  select count(*) into invalid_fields from public.places p
  cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
  where p.id in (103,104,164,166,167,168,169,171,172,173,174,852,853,854,1121,1122,1123,1124,1125,1126,1127,1128,1924,1925,1926,1927,1928,1929,1930,1931)
    and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every Amsterdam intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;

  select count(*) into duplicate_fields from (
    select f.key,f.value,count(*) from public.places p
    cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f
    where p.id in (103,104,164,166,167,168,169,171,172,173,174,852,853,854,1121,1122,1123,1124,1125,1126,1127,1128,1924,1925,1926,1927,1928,1929,1930,1931)
    group by f.key,f.value having count(*)>1
  ) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate Amsterdam intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
