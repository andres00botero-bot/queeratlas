export const NEWCASTLE_CITY_SLUGS = new Set(["newcastle"]);

const reviewedAt = "2026-09-29T00:00:00Z";

function place(entry) {
  return { avgRating: null, reviewCount: 0, seeded: true, ...entry };
}

function intel(queue_wait, best_nights, crowd_mix, dress_code, staff_inclusivity, source_urls) {
  return { queue_wait, best_nights, crowd_mix, dress_code, staff_inclusivity, source_urls, research_status: "multi_source_summary", updated_at: reviewedAt };
}

export const newcastleSeedPlaces = [
  place({
    id: "seed-place-newcastle-rustys", city: "newcastle", name: "Rusty's", type: "bar",
    vibe: "camp late bar with drag hosts, five bars and a terrace",
    description: "Rusty's is the Pink Triangle's bright, maximalist social engine: a place for camp pop, drag-hosted requests and groups that want a proper night without pretending to be cool about it. Its terrace, multiple bars and seven-night schedule make it unusually useful whether you are beginning gently or arriving late with a story already in progress.",
    hours: "Mon-Thu 22:00-03:00; Fri-Sun 21:00-03:00. Rusty's Showbar runs separately; verify its current programme.",
    link: "https://rustys.co.uk/", location: "Unit 3 & 4, International Centre for Life, Times Square, Newcastle upon Tyne NE1 4EP", lat: 54.96714, lng: -1.6201,
    venue_intel: intel("Usually an easy walk-in before late weekend momentum; popular drag and Pride dates can tighten entry. The site does not publish a standing reservation rule.", "A weekday gives the drag-DJ format room to breathe; Friday and Saturday after 23:00 deliver the fullest, loudest version.", "A visibly mixed LGBTQ+ room: local regulars, birthday groups, visitors, drag audiences and allies. It is broad rather than niche.", "No formal code is published. Camp, casual, dressy and costume-ready looks all fit; choose shoes that survive a long standing night.", "Rusty's explicitly presents itself as inclusive across sexuality, race, gender and religion. That is an operating statement, not a substitute for normal drink and group safety.", ["https://rustys.co.uk/", "https://rustys.co.uk/scenepass/"])
  }),
  place({
    id: "seed-place-newcastle-boulevard", city: "newcastle", name: "Boulevard", type: "club",
    vibe: "ticketed drag-and-cabaret theatre with full production energy",
    description: "Boulevard is Newcastle's rare queer night out that begins with a showtime. This purpose-built cabaret room turns drag, dancers, comedy, costumes and audience participation into a polished group occasion; it is the right call when the plan needs a performance, not merely another loud bar.",
    hours: "Shows mainly Fri-Sun; box office Fri 17:00-23:00, Sat 13:00-23:30, Sun 15:00-20:30. Doors open 30 minutes before showtime.",
    link: "https://www.boulevardnewcastle.co.uk/", location: "3-9 Churchill Street, Newcastle upon Tyne NE1 4HF", lat: 54.96839, lng: -1.62067,
    venue_intel: intel("Book rather than treating it as a spontaneous bar: popular shows can require shared tables, and standing tickets are a separate format.", "Choose the production and cast you want; Saturday is the classic big-group slot, while Sunday works for an earlier show-led finish.", "Drag fans, celebrations, mixed queer friendship groups and visitors share a theatrical, table-led crowd rather than a conventional club floor.", "Smart casual is requested; fancy dress is welcomed. The venue excludes sportswear, football shirts, caps, beachwear and dirty workwear.", "Boulevard publishes access contact details and asks guests to arrange requirements with the box office. It is an explicitly LGBTQ+-anchored performance venue; confirm a specific access need before booking.", ["https://www.boulevardnewcastle.co.uk/about-boulevard", "https://www.boulevardnewcastle.co.uk/menus-and-packages"])
  }),
  place({
    id: "seed-place-newcastle-switch", city: "newcastle", name: "Switch", type: "bar",
    vibe: "two-floor Pink Triangle pre-bar with DJs and a rooftop terrace",
    description: "Switch is the practical hinge between an early drink and a Powerhouse finish. The two floors keep chart, dance, house and pop moving while the rooftop terrace gives the night a pause button, which is precisely why it works so well for groups still deciding how serious the evening should become.",
    hours: "Mon 21:00-02:00; Thu 21:00-02:00; Fri 18:00-02:30; Sat 17:00-03:00. Closed Tue-Wed and Sun.",
    link: "https://newcastlegateshead.com/business-directory/things-to-do/switch", location: "4-10 Scotswood Road, Newcastle upon Tyne NE4 7JB", lat: 54.96652, lng: -1.62125,
    venue_intel: intel("Free entry and usually straightforward early; the terrace and bar tighten on sunny weekends and before Powerhouse peak time.", "Friday and Saturday are the most complete version; arrive early for the terrace, later for DJ-led pre-club momentum.", "LGBTQ+ regulars, students, visitors and mixed friend groups meet in a sociable, high-energy room that changes as clubgoers pass through.", "No published door code. Dance-floor casual, party looks and practical terrace layers fit better than formalwear.", "The official visitor listing identifies Switch as a popular gay bar and links an AccessAble guide. No separate staff-training claim is published.", ["https://newcastlegateshead.com/business-directory/things-to-do/switch", "https://www.getintonewcastle.co.uk/things-to-do/ne1-s-guide-to-newcastle-s-pink-triangle"])
  }),
  place({
    id: "seed-place-newcastle-powerhouse", city: "newcastle", name: "Powerhouse", type: "club",
    vibe: "four-floor late club with pop, dance and Pink Triangle scale",
    description: "Powerhouse is the big finish: a long-running Pink Triangle club whose multiple floors, rooms and rooftop smoking area make it more of a small nightlife complex than a single dance floor. It began as a gay club and now draws a deliberately broad crowd, so choose it for sheer late-night range rather than an intimate queer bar conversation.",
    hours: "Typically Mon and Thu 23:00-03:00; Fri-Sun until 04:00, with later Saturday closing reported by official visitor listings. Check the venue calendar.",
    link: "https://www.getintonewcastle.co.uk/venues/powerhouse", location: "7-19 Westmorland Road, Newcastle upon Tyne NE1 4EQ", lat: 54.96649, lng: -1.61809,
    venue_intel: intel("Arrive before midnight for the simplest entry; promoted nights and Saturday build late, with queues changing sharply by programme.", "Friday and Saturday provide the largest multi-room crowd; a Monday or Thursday can suit guests who want a later club without peak-weekend density.", "A mixed, multi-age city club audience includes LGBTQ+ regulars, students, visitors and allies. It is bigger and less identity-specific than the nearby bars.", "No general code is published. Club-ready casual and comfortable footwear are the useful baseline across several floors and late hours.", "Powerhouse publicly states an aim to provide a discrimination-free environment across gender, sexuality and age. Treat that as a stated policy and report concerns to venue staff.", ["https://www.getintonewcastle.co.uk/venues/powerhouse", "https://newcastlegateshead.com/business-directory/things-to-do/powerhouse"])
  }),
  place({
    id: "seed-place-newcastle-eagle", city: "newcastle", name: "The Eagle", type: "bar",
    vibe: "relaxed leather-and-denim pub with an adults-only downstairs space",
    description: "The Eagle brings a more grounded, leather-and-denim note to a strip otherwise dominated by pop and spectacle. Upstairs is the useful local-pint room; downstairs is adults-only and more intimate. It is a strong choice for travellers who want to meet people and read the scene before committing to a louder room.",
    hours: "Sun-Thu 17:00-01:00; Fri 17:00-02:30; Sat 13:00-16:00 and 17:00-02:30. Verify same-day hours.",
    link: "https://www.getintonewcastle.co.uk/venues/the-eagle", location: "42 Scotswood Road, Newcastle upon Tyne NE4 7JD", lat: 54.96636, lng: -1.62156,
    venue_intel: intel("An early evening pint is usually lower friction; quiz and themed nights can concentrate the small venue later on.", "Use it for a calmer early stop or a themed night; Friday and Saturday offer the latest pub hours.", "Primarily gay male regulars alongside queer visitors and leather/denim-coded guests; the upstairs pub and adult downstairs area serve different needs.", "There is no published formal code. Casual leather, denim and everyday pub clothes fit; respect the adults-only boundary downstairs.", "The venue is presented by local tourism sources as part of the Pink Triangle. It does not publish a formal safeguarding statement, so ask staff directly about accessibility or comfort needs.", ["https://www.getintonewcastle.co.uk/venues/the-eagle", "https://newcastlegateshead.com/blog/a-queer-guide-to-newcastlegateshead-where-to-visit-for-an-lgbtq-friendly-weekend-in-the-north-east"])
  }),
  place({
    id: "seed-place-newcastle-number-52", city: "newcastle", name: "Number 52 Sauna", type: "sauna",
    vibe: "men-only gay sauna in the heart of the Pink Triangle",
    description: "Number 52 is Newcastle's dedicated gay men's sauna, positioned directly within the Pink Triangle rather than hidden at the edge of town. It is an adults-only, men-only venue and should be approached as a private wellness-and-sexual-space environment: privacy, consent and the current house rules matter more than nightlife assumptions.",
    hours: "Opening hours vary; verify directly with the venue before travelling.",
    link: "https://www.number52sauna.co.uk/contact/", location: "52 Scotswood Road, Newcastle upon Tyne NE4 7JB", lat: 54.9664, lng: -1.62131,
    venue_intel: intel("Use the direct phone or website before setting out; no reliable public crowd-by-hour pattern was verified.", "Weekend evenings are the likely busier window, but the venue does not publish a dependable best-time claim; verify current service directly.", "An adult men-only gay sauna, not a general LGBTQ+ venue. Entry never implies consent or availability.", "Bring photo ID and minimal valuables; follow current changing, towel, footwear, phone and safer-sex rules on arrival.", "The venue describes a discreet buzzer entry. Its men-only scope is explicit; ask the team directly about accessibility, first-visit process or identity-specific questions.", ["https://www.number52sauna.co.uk/contact/", "https://www.travelgay.com/Newcastle-gay-Saunas"])
  }),
  place({
    id: "seed-place-newcastle-lubber-fiend", city: "newcastle", name: "The Lubber Fiend", type: "club",
    vibe: "co-operative DIY culture room for queer, trans and alternative nights",
    description: "The Lubber Fiend is the antidote to a one-note bar crawl: a co-operative grassroots venue where gigs, club nights, film and art programmes make room for queer, trans and neurodiverse communities. It is for the night when you want a specific bill, a subculture or a genuinely different conversation from the Pink Triangle's commercial core.",
    hours: "Fri-Sat 19:00-03:00; Sun-Thu depend on the event listing.",
    link: "https://newcastlegateshead.com/business-directory/things-to-do/the-lubber-fiend", location: "57 Blandford Street, Newcastle upon Tyne NE1 4HZ", lat: 54.96825, lng: -1.62048,
    venue_intel: intel("Demand follows the bill, so buy in advance for a named gig or club night rather than relying on an ordinary walk-in.", "A specifically queer or trans-led programme is the best reason to go; Friday and Saturday give the venue its broadest late format.", "Alternative music audiences, artists, queer and trans communities, DIY culture regulars and visitors mix according to the promoter.", "Event-led and practical: wear for a gig or dance floor, and follow any promoter-specific theme rather than assuming club polish.", "The official city guide identifies the co-operative as proudly inclusive and a space for queer, trans and neurodiverse communities. Check the individual event for access arrangements.", ["https://newcastlegateshead.com/blog/a-queer-guide-to-newcastlegateshead-where-to-visit-for-an-lgbtq-friendly-weekend-in-the-north-east"])
  }),
  place({
    id: "seed-place-newcastle-alphabetti", city: "newcastle", name: "Alphabetti Theatre", type: "cafe",
    vibe: "independent theatre, cafe and bar with affordable experimental programming",
    description: "Alphabetti is a compact independent theatre where a café-bar, rehearsal rooms and an affordable programme make culture part of the evening rather than a prelude to it. Its queer relevance is programme-led, not a permanent nightlife label—check the listing and you may find cabaret, writing, performance or a quieter way into Newcastle's creative community.",
    hours: "Open 30 minutes before scheduled events and between events on multi-event days; phone lines Mon-Fri 10:00-18:00.",
    link: "https://www.alphabettitheatre.co.uk/", location: "St James Boulevard, Newcastle upon Tyne NE1 4HP", lat: 54.96823, lng: -1.61922,
    venue_intel: intel("There is no conventional nightly queue: book ahead for a specific show, particularly small-capacity performance or cabaret dates.", "The best visit is programme-specific. Pair a queer-led show with an early Pink Triangle drink rather than expecting a permanent club schedule.", "Performers, writers, theatre audiences, students, local creatives and mixed queer-friendly groups share a small arts-led room.", "Everyday expressive clothes suit the venue. Dress for the show and the weather, not a door policy.", "Alphabetti describes its programme as affordable and accessible; it is not marketed as a dedicated LGBTQ+ venue. Confirm specific access needs with the theatre before booking.", ["https://www.alphabettitheatre.co.uk/"])
  }),
  place({
    id: "seed-place-newcastle-cycle-hub", city: "newcastle", name: "The Cycle Hub", type: "cafe",
    vibe: "Quayside independent cafe hosting a monthly LGBTQIA+ coffee club",
    description: "The Cycle Hub earns its place through the kind of queer infrastructure a nightlife map can miss: Queers of the North use it for a first-Saturday coffee club built around making friends, local food and a daytime welcome. It is a good reset after a late night, or the better starting point if bars are not your idea of community.",
    hours: "Verify café hours and the current Queer Coffee Club date before visiting; the social is normally the first Saturday each month.",
    link: "https://www.eventbrite.com/e/the-queer-coffee-club-tickets-1394872022769", location: "The Cycle Hub, Quayside, Newcastle upon Tyne NE6 1BU", lat: 54.97637, lng: -1.59686,
    venue_intel: intel("For the monthly social, arrive near its advertised start; ordinary café service is separate from the community event.", "The first-Saturday Queer Coffee Club is the meaningful queer window. Visit outside it for a calm independent-café stop by the river.", "LGBTQIA+ people seeking connection, newcomers, friends and allies gather for the hosted social; the café otherwise serves a general Quayside audience.", "Comfortable daytime clothes and weather-ready layers are best for the Quayside. There is no dress code.", "The organiser states that the venue supports its LGBTQIA+ mission and has gender-neutral and accessible toilets. Treat these as current event information and check before a trip.", ["https://www.eventbrite.com/e/the-queer-coffee-club-tickets-1394872022769"])
  }),
  place({
    id: "seed-place-newcastle-maldron", city: "newcastle", name: "Maldron Hotel Newcastle", type: "hotel",
    vibe: "central modern four-star base between city centre and Pink Triangle",
    description: "Maldron is a calm, central base for a trip that wants both the city and the scene within easy reach. It is not a queer-branded hotel, but its position near Newgate Street makes the Pink Triangle, train station and daytime centre practical without turning every return journey into a negotiation.",
    hours: "Hotel open daily; check-in from 15:00 and check-out by 11:00.",
    link: "https://www.maldronhotels.com/newcastle/rooms/", location: "17 Newgate Street, Newcastle upon Tyne NE1 5RE", lat: 54.9711, lng: -1.61762,
    venue_intel: intel("Online check-in details and a direct request before arrival reduce front-desk friction on busy Pride, football and weekend dates.", "Book early for Pride and city-centre weekends; otherwise it works as an uncomplicated base for any night in the Pink Triangle.", "City-break guests, business travellers, families and event visitors create a conventional central-hotel mix.", "No special dress expectation beyond standard hotel public-space norms.", "The local tourism board describes the hotel as welcoming and inclusive, but no property-specific LGBTQ+ protocol was verified. Confirm names, bedding and privacy requests directly when important.", ["https://www.maldronhotels.com/newcastle/rooms/", "https://newcastlegateshead.com/blog/a-queer-guide-to-newcastlegateshead-where-to-visit-for-an-lgbtq-friendly-weekend-in-the-north-east"])
  }),
  place({
    id: "seed-place-newcastle-crowne-plaza", city: "newcastle", name: "Crowne Plaza Newcastle – Stephenson Quarter", type: "hotel",
    vibe: "upscale station-side hotel with pool, spa and a direct Pink Triangle walk",
    description: "Crowne Plaza Stephenson Quarter is the stay for travellers who want a proper recovery plan built into the booking: pool, spa, gym and a polished Gin Bar sit a short walk from Central Station and the Pink Triangle. It is an easy choice for a theatre-and-nightlife weekend where comfort after the final song is part of the itinerary.",
    hours: "Hotel open daily; check-in from 15:00 and check-out by 11:00.",
    link: "https://www.crowneplaza.com/hotels/gb/en/newcastle-upon-tyne/nclsq/hoteldetail", location: "Hawthorn Square, Forth Street, Newcastle upon Tyne NE1 3SA", lat: 54.96372, lng: -1.61601,
    venue_intel: intel("Use direct booking and communicate any room preference ahead for a low-friction arrival; large event weekends can concentrate reception demand.", "Best when a station-side base, spa recovery and direct nightlife access matter more than staying in the shopping core.", "Business travellers, event guests, city-break couples and rail arrivals share an upscale international-brand hotel.", "Smart casual fits the Gin Bar and restaurant; regular leisurewear is normal in the spa and gym.", "The hotel publishes accessible and guest-service information but no Newcastle-specific LGBTQ+ service policy. Ask the property privately about any couple-facing or accessibility request.", ["https://www.crowneplaza.com/hotels/gb/en/newcastle-upon-tyne/nclsq/hoteldetail"])
  }),
];

export const newcastleSeedEvents = [
  { id: "seed-event-newcastle-pride-2026", city: "newcastle", name: "Newcastle Pride 2026", description: "A city-centre LGBTQIA+ festival weekend delivered by Curious Futures, with the Pride Arena at Times Square and a programme of community, creative and live events.", link: "https://www.newcastlepride.co.uk/", date: "2026-07-25", lat: 54.96714, lng: -1.6201, seeded: true },
  { id: "seed-event-newcastle-pride-march-2026", city: "newcastle", name: "Newcastle Pride March 2026", description: "The rights-and-visibility centrepiece of Pride weekend: assemble at Newcastle Civic Centre from 11:30 for a 12:00 march to Grey's Monument.", link: "https://www.newcastlepride.co.uk/march", date: "2026-07-25", lat: 54.9783, lng: -1.6127, seeded: true },
];
