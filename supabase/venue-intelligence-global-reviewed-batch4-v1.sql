-- Queer Atlas venue intelligence: global review-led editorial pass, batch 4.
-- Tokyo, Sydney, Mexico City, Los Angeles, Toronto, Vienna, Prague, Rome
-- and Stockholm.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (649::bigint, jsonb_build_object(
      'queue_wait', 'The tiny interior rarely creates a classic club queue; on weekends the whole rainbow-gate crowd spills onto the street. Go early for easy ordering and a standing table, or later when meeting strangers matters more than personal space.',
      'best_nights', 'Weekend DJs, drag queens and go-go guests give the open-air bar its brightest pulse. The daily early beer offer is the smarter move for a low-pressure first visit before Ni-chōme turns into a full night out.',
      'crowd_mix', 'Japanese regulars and first-time Tokyo visitors meet unusually easily here, with many Asian and Western travellers in the mix. All identities are explicitly welcome, making it a social gateway to the district rather than a closed local-only bar.',
      'dress_code', 'There is no cover and no visible fashion ritual: streetwear, travel-day clothes, date-night polish and queer colour all work. Dress for standing outdoors as well as squeezing through a very small bar.',
      'staff_inclusivity', 'English-speaking staff and a warm first-timer welcome are strong long-term themes. A serious May 2026 account alleges verbal abuse and pressure to buy drinks from one employee, so the usual friendliness cannot erase a recent inclusion failure.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g1066457-d7685666-Reviews-Aiiro_Cafe-Shinjuku_Tokyo_Tokyo_Prefecture_Kanto.html',
        'https://deeptokyo.jp/en/spot/nightlife/3117/',
        'https://tabelog.com/en/tokyo/A1304/A130401/13191097/',
        'https://tabelog.com/tokyo/A1304/A130401/13191097/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g1066457-d7685666-Reviews-Aiiro_Cafe-Shinjuku_Tokyo_Tokyo_Prefecture_Kanto.html','https://deeptokyo.jp/en/spot/nightlife/3117/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g1066457-d7685666-Reviews-Aiiro_Cafe-Shinjuku_Tokyo_Tokyo_Prefecture_Kanto.html','https://deeptokyo.jp/en/spot/nightlife/3117/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://deeptokyo.jp/en/spot/nightlife/3117/','https://www.tripadvisor.com/Attraction_Review-g1066457-d7685666-Reviews-Aiiro_Cafe-Shinjuku_Tokyo_Tokyo_Prefecture_Kanto.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://deeptokyo.jp/en/spot/nightlife/3117/','https://tabelog.com/en/tokyo/A1304/A130401/13191097/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g1066457-d7685666-Reviews-Aiiro_Cafe-Shinjuku_Tokyo_Tokyo_Prefecture_Kanto.html','https://deeptokyo.jp/en/spot/nightlife/3117/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (882::bigint, jsonb_build_object(
      'queue_wait', 'Weekend arrival can involve both a busy door and close scrutiny under Sydney service rules. Go before the late peak, carry valid ID and keep another Oxford Street option in mind: reviews show that admission and service can feel unpredictable.',
      'best_nights', 'A named drag competition, viewing party or upstairs club event is the strongest reason to go. Weeknights can feel more relaxed; Friday and Saturday run much later and deliver the larger dance-floor version.',
      'crowd_mix', 'Gay men and queer Oxford Street regulars remain visible, but the modern weekend mix includes straight women, male partners and visitors. A specific queer programme pulls the room closer to its community roots than a generic late Saturday.',
      'dress_code', 'Mainstream Sydney clubwear works—neat, dance-ready and easy to move in. There is no dependable published queer dress code, yet appearance-based treatment appears in guest reports, so the actual door can feel more selective than the stated identity.',
      'staff_inclusivity', 'Some guests praise bartenders, security and management; others describe aggressive or discriminatory treatment based on age, body, appearance or speech. This is a material and repeated warning, not a minor service quibble.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/universal-sydney',
        'https://wanderlog.com/place/details/1954506/universal-sydney',
        'https://www.reddit.com/r/SydneyScene/comments/1uwtyk9/any_help_in_understanding_sydneys_queer_scene/',
        'https://www.reddit.com/r/sydney/comments/1ht4wi8/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/universal-sydney','https://wanderlog.com/place/details/1954506/universal-sydney']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/universal-sydney','https://www.reddit.com/r/sydney/comments/1ht4wi8/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.reddit.com/r/SydneyScene/comments/1uwtyk9/any_help_in_understanding_sydneys_queer_scene/','https://www.travelgay.com/venue/universal-sydney']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/universal-sydney','https://wanderlog.com/place/details/1954506/universal-sydney']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/universal-sydney','https://wanderlog.com/place/details/1954506/universal-sydney']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (516::bigint, jsonb_build_object(
      'queue_wait', 'The room gets packed, hot and physically close, with a real entrance line later at night. Arrive early if you want to understand the cover and upstairs access before the rush; ask exactly which floor your payment includes.',
      'best_nights', 'Weekend drag and pop-reggaetón energy is the classic choice. Come for Mexican queens, Spanish-language sing-alongs and surprise performance moments; a quieter early visit will not show why the room became legendary.',
      'crowd_mix', 'Mexico City LGBTQ+ regulars, drag fans, visitors and mixed friend groups share the floor. Recent reviews describe a slightly more age-varied crowd than some nearby clubs, which can make thirty-something guests feel less like outsiders.',
      'dress_code', 'Kitsch, colour and dance-floor glamour fit beautifully, but casual clubwear is enough. Heat and close contact are the real brief: wear something breathable, keep valuables secure and bring a payment method you can monitor clearly.',
      'staff_inclusivity', 'Many guests call door and bar staff genuinely friendly. Others report being denied the advertised upstairs space or treated badly as English-speaking visitors. The welcome is often warm, but access disputes and alleged nationality bias are serious exceptions.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/2302717/marrakech-salon'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2302717/marrakech-salon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2302717/marrakech-salon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2302717/marrakech-salon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2302717/marrakech-salon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2302717/marrakech-salon']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (823::bigint, jsonb_build_object(
      'queue_wait', 'It does not take reservations, so a major drag booking or anniversary can turn the door into the wait. Ordinary happy hour is much easier: arrive before the headline event, eat first and let the room build around you.',
      'best_nights', 'The calendar is the personality: bear happy hour, queer bachata, trivia, drag brunch, comedy and community fundraisers all pull different Los Angeles worlds. Pick the format that names your crowd instead of defaulting to Saturday.',
      'crowd_mix', 'Downtown queer regulars, bears, drag audiences, Latino community nights and arts crowds overlap without becoming one uniform scene. Visitors are present, but the partnerships and recurring causes keep the room connected to local LGBTQ+ life.',
      'dress_code', 'Industrial-bar casual is the baseline, then the event takes over—bear gear, brunch colour, dance clothes or themed drag all make sense. No general fashion test is published; valid ID and respect for the advertised crowd matter more.',
      'staff_inclusivity', 'Friendly bartenders and a welcoming community atmosphere are the dominant pattern, with service inconsistency in a minority of reviews. Visible links to immigrant rights, trans resources, sexual health and local queer groups deepen the inclusion claim.',
      'source_urls', to_jsonb(array[
        'https://precinctdtla.com/',
        'https://linktr.ee/precinctdtla',
        'https://www.restaurantji.com/ca/los-angeles/precinct-dtla-/',
        'https://maps.apple.com/place?place-id=I24C5AAB6418436EF'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://precinctdtla.com/','https://www.restaurantji.com/ca/los-angeles/precinct-dtla-/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://precinctdtla.com/','https://linktr.ee/precinctdtla']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://linktr.ee/precinctdtla','https://maps.apple.com/place?place-id=I24C5AAB6418436EF']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://precinctdtla.com/','https://linktr.ee/precinctdtla']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.restaurantji.com/ca/los-angeles/precinct-dtla-/','https://linktr.ee/precinctdtla']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (527::bigint, jsonb_build_object(
      'queue_wait', 'Saturday can put a long line down Church Street, including bag checks at the door. Arrive before the headline show for an easier entry and better position; tipping money and a drink in hand are more useful inside than another half-hour outside.',
      'best_nights', 'Nightly drag means there is always a reason to enter, but Friday and Saturday bring the fullest show-and-dance combination. Follow the performer roster: a favourite queen will shape the night more than the weekday label.',
      'crowd_mix', 'Toronto queer regulars, lesbians, gay men, trans guests, birthday groups and first-time drag audiences share the house. The ground floor gathers around performance while the upper dance area creates a younger, more club-like mix.',
      'dress_code', 'Come ready to cheer, tip and dance: casual going-out clothes, queer sparkle or full drag-friendly glamour all belong. There is no reliable strict fashion code, though valid ID and a bag check are normal door practicalities.',
      'staff_inclusivity', 'Recent reviews are unusually warm about bartenders, management and a genuinely inviting room. Older complaints exist, especially around security, but the 2025–26 signal points to improved service and performers who know how to include the whole crowd.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1384426/crews--tangos',
        'https://www.tripadvisor.com/Attraction_Review-g155019-d600557-Reviews-Crews_Tangos-Toronto_Ontario.html',
        'https://www.gayout.com/usa-canada/canada/toronto/bars/crews-tangos-toronto'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g155019-d600557-Reviews-Crews_Tangos-Toronto_Ontario.html','https://www.gayout.com/usa-canada/canada/toronto/bars/crews-tangos-toronto']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1384426/crews--tangos','https://www.gayout.com/usa-canada/canada/toronto/bars/crews-tangos-toronto']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g155019-d600557-Reviews-Crews_Tangos-Toronto_Ontario.html','https://wanderlog.com/place/details/1384426/crews--tangos']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1384426/crews--tangos','https://www.tripadvisor.com/Attraction_Review-g155019-d600557-Reviews-Crews_Tangos-Toronto_Ontario.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1384426/crews--tangos','https://www.tripadvisor.com/Attraction_Review-g155019-d600557-Reviews-Crews_Tangos-Toronto_Ontario.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (93::bigint, jsonb_build_object(
      'queue_wait', 'The small downtown club can burst at the seams on Friday and Saturday. Entry and cloakroom are cash-only even though bars take cards, so arrive with euros before the late crush and avoid making the ATM your first Vienna dance partner.',
      'best_nights', 'Friday and Saturday are the official nights, both running until 6 am. Throwback pop, house and familiar dance hits define the mood; choose it when nostalgic sing-along energy matters more than underground music credibility.',
      'crowd_mix', 'Young gay men lead the floor, but lesbians, bi, trans and queer guests are explicitly welcomed alongside straight friends. Vienna regulars mix with weekend visitors across three floors, giving the compact club more variety than its footprint suggests.',
      'dress_code', 'Colourful, uncomplicated pop-club wear is the natural fit. No formal fashion code is published; bring secure dance shoes, valid ID and cash for the door rather than trying to solve the look with expensive clothes.',
      'staff_inclusivity', 'The official welcome covers every colour of the rainbow, and many guests enjoy the crowd. Recent reviews raise concerns about high entry cost, unexplained tips and inconsistent waiter treatment, so financial clarity is part of feeling respected here.',
      'source_urls', to_jsonb(array[
        'https://why-not.at/content/content-1/',
        'https://www.whereis.gay/why-not-club',
        'https://www.wien.info/en/see-do/lgbt/parties-clubs-355086',
        'https://www.wien.info/en/why-not-131360',
        'https://www.tripadvisor.com/Attraction_Review-g190454-d4702488-Reviews-Why_Not_Clubdiscothek-Vienna.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://why-not.at/content/content-1/','https://www.wien.info/en/see-do/lgbt/parties-clubs-355086']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://why-not.at/content/content-1/','https://www.wien.info/en/why-not-131360']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://why-not.at/content/content-1/','https://www.travelgay.com/venue/why-not-2']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://why-not.at/content/content-1/','https://www.wien.info/en/see-do/lgbt/parties-clubs-355086']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.whereis.gay/why-not-club','https://www.tripadvisor.com/Attraction_Review-g190454-d4702488-Reviews-Why_Not_Clubdiscothek-Vienna.html','https://why-not.at/content/content-1/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (97::bigint, jsonb_build_object(
      'queue_wait', 'Most ordinary nights are an easy central-city arrival; Prague Pride and headline themes create the true pressure. The cloakroom is part of entry, while bags cost extra and require cash, so handle that before expecting a seamless first drink.',
      'best_nights', 'Wednesday is designed for mingling; karaoke, drag, pop and themed parties rotate every evening. Friday gives the bigger club energy, while Monday student nights offer a younger, lower-pressure way into the room.',
      'crowd_mix', 'Young queer Praguers, international students, tourists and straight friends all share the floor. It is gay-centred but deliberately open to everyone, with Wednesday socials making connection more explicit than in a typical tourist club.',
      'dress_code', 'Unpretentious pop-night clothes are exactly right: casual, colourful or a little show-ready. No formal fashion test appears in the stated policy; bring cash for bag storage and dress for dancing until 6 am.',
      'staff_inclusivity', 'Current sources often praise friendly security, English accommodation and mixed-crowd warmth. Older reviews report rude cloakroom and door treatment toward foreigners, so the recent signal is better without erasing that history.',
      'source_urls', to_jsonb(array[
        'https://www.friendsclub.cz/en/',
        'https://www.travelgay.com/venue/friends-prague',
        'https://prague.eu/en/objevujte/friends-club/',
        'https://prague.gaycities.com/bars/302015-friends-prague'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.friendsclub.cz/en/','https://www.travelgay.com/venue/friends-prague']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.friendsclub.cz/en/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.friendsclub.cz/en/','https://prague.gaycities.com/bars/302015-friends-prague']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.friendsclub.cz/en/','https://prague.eu/en/objevujte/friends-club/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/friends-prague','https://prague.gaycities.com/bars/302015-friends-prague','https://www.friendsclub.cz/en/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (119::bigint, jsonb_build_object(
      'queue_wait', 'This is more terrace takeover than velvet-rope line. Weekend crowds spill along Gay Street beneath the Colosseum, so arrive before the 10:30 pm show for an outdoor table; walk-ins remain normal even when the pavement becomes the party.',
      'best_nights', 'Saturday is the signature drag-and-DJ night, with Thursday and Friday offering their own weekly shows. Tuesday and Wednesday add playful formats, making almost any night viable if you check which performance starts at 10:30.',
      'crowd_mix', 'LGBTQ+ Romans and local friends meet an exceptionally international tourist crowd drawn by the Colosseum address. It works as an unofficial queer welcome desk: solo travellers and first-time Rome visitors are more visible than at a hidden local bar.',
      'dress_code', 'Sightseeing clothes can roll straight into aperitivo, while evening guests add colour and sharper queer polish. There is no hard club uniform; choose a look that can handle dinner, cobblestones, an outdoor table and a late drag set.',
      'staff_inclusivity', 'Fresh 2026 reviews strongly praise friendly, multilingual and attentive teams, while a smaller set reports brusque service or poor food interactions. The current welcome is broadly warm, particularly for tourists and couples, but peak traffic still exposes inconsistency.',
      'source_urls', to_jsonb(array[
        'https://www.comingout.it/',
        'https://www.travelgay.com/venue/coming-out',
        'https://www.gayout.com/europe/italy/rome/bars/coming-out-rome',
        'https://www.gayout.com/it/europe/italy/rome/bars/coming-out-rome',
        'https://rome.gaycities.com/bars/1722-coming-out'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/italy/rome/bars/coming-out-rome','https://www.travelgay.com/venue/coming-out']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.comingout.it/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/italy/rome/bars/coming-out-rome','https://www.travelgay.com/venue/coming-out','https://rome.gaycities.com/bars/1722-coming-out']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.comingout.it/','https://www.gayout.com/europe/italy/rome/bars/coming-out-rome']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/it/europe/italy/rome/bars/coming-out-rome','https://www.travelgay.com/venue/coming-out']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (90::bigint, jsonb_build_object(
      'queue_wait', 'Weekend security is the unpredictable part of arrival, not a dependable timed queue. Go earlier for food, courtyard space and an easy conversation; returning after a smoke or arriving late can trigger stricter assessment at the door.',
      'best_nights', 'Friday and Saturday turn the all-day bar into three dance floors with mixed music. A weekday or afternoon is the better version for conversation and food; weekend late hours are for a younger, denser Gamla Stan party.',
      'crowd_mix', 'Stockholm gay regulars, younger queer groups, straight friends and international Old Town visitors mix across the rooms. Locals anchor the year-round bar, but the central location gives tourists a larger share than at event-led suburban queer spaces.',
      'dress_code', 'Stockholm going-out casual is enough: clean trainers, dark layers, colour or a sharper dinner look. No formal queer dress code is published; practical late-night warmth and a composed door interaction matter more than fashion theatre.',
      'staff_inclusivity', 'Positive reviews describe welcoming daytime staff and a visibly diverse dance floor. The negative pattern is serious: repeated accounts allege rude guards, age bias and racial profiling. An inclusive crowd does not cancel those door experiences.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Restaurant_Review-g189852-d7171645-Reviews-The_Secret_Garden-Stockholm.html',
        'https://www.travelgay.com/venue/the-secret-garden',
        'https://wanderlog.com/place/details/65064/the-secret-garden',
        'https://thatsup.se/stockholm/nattklubb/the-secret-garden/reviews/?page=1',
        'https://uploads-media.qx.se/QXQueerMap2026.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/the-secret-garden','https://www.tripadvisor.com/Restaurant_Review-g189852-d7171645-Reviews-The_Secret_Garden-Stockholm.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g189852-d7171645-Reviews-The_Secret_Garden-Stockholm.html','https://www.travelgay.com/venue/the-secret-garden']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/the-secret-garden','https://wanderlog.com/place/details/65064/the-secret-garden','https://uploads-media.qx.se/QXQueerMap2026.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://uploads-media.qx.se/QXQueerMap2026.pdf','https://wanderlog.com/place/details/65064/the-secret-garden']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/the-secret-garden','https://thatsup.se/stockholm/nattklubb/the-secret-garden/reviews/?page=1','https://www.tripadvisor.com/Restaurant_Review-g189852-d7171645-Reviews-The_Secret_Garden-Stockholm.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    ))
)
update public.places as p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || reviewed.patch
from reviewed
where p.id = reviewed.id;

do $$
declare updated_count integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (649, 882, 516, 823, 527, 93, 97, 119, 90)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 9 then
    raise exception 'Expected 9 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
