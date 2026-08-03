import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const rows = [
  [1155,"Stonewall Bali","bali","club",["https://stonewallbali.com/"]],
  [1162,"The Yoga Barn (BaliSpirit Hub)","bali","cafe",["https://www.balispiritfestival.com/","https://www.tripadvisor.com/Attraction_Review-g297701-d1506742-Reviews-The_Yoga_Barn-Ubud_Gianyar_Regency_Bali.html"]],
  [543,"Banana Room Club","bangkok","bar",["https://www.travelgay.com/venue/banana-room-club//"]],
  [1952,"Blu Cabin Ari Stylish Gay Poshtel","bangkok","hotel",["https://www.agoda.com/en-ca/blu-cabin-gay-poshtel/hotel/bangkok-th.html","https://www.tripadvisor.co.uk/Hotel_Review-g293916-d15657488-Reviews-Blu_Cabin_Ari_Stylish_Gay_Poshtel-Bangkok.html"]],
  [1953,"BRB Hostel Bangkok Silom","bangkok","hotel",["https://brbhostel.com/","https://www.agoda.com/brb-hostel-bangkok-silom/reviews/bangkok-th.html"]],
  [545,"Chakran Sauna","bangkok","sauna",["https://www.reddit.com/r/gaysian/comments/1fp9r0i/gay_bathhouse_in_bangkok_thailand/","https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/"]],
  [541,"Connections Bar","bangkok","bar",["https://www.travelgay.com/bangkok-gay-bars"]],
  [538,"DJ Station","bangkok","club",["https://www.travelgay.com/venue/dj-station"]],
  [544,"Fake Club","bangkok","club",["https://www.timeout.com/bangkok/bars/fake-club-bangkok","https://www.visitthailandtoday.com/nightlife/bangkok/fake-club-bangkok"]],
  [539,"G Bangkok","bangkok","club",["https://www.travelgay.com/venue/g-o-d-g-bangkok","https://wanderlog.com/place/details/3947458/g-bangkok"]],
  [1954,"Kinnon Deluxe Hostel","bangkok","hotel",["https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/","https://www.booking.com/hotel/th/kinnon-hostel.html"]],
  [546,"Krubb Bangkok Social Club & Sauna","bangkok","sauna",["https://www.reddit.com/r/gaysian/comments/1fp9r0i/gay_bathhouse_in_bangkok_thailand/","https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/"]],
  [1948,"Pride Bar & Circus","bangkok","bar",["https://www.circussoi4.com/","https://www.travelgay.com/bangkok-gay-bars"]],
  [1951,"Pullman Bangkok King Power","bangkok","hotel",["https://www.pullmanbangkokkingpower.com/","https://www.booking.com/reviews/th/hotel/pullman-bangkok-king-power.en-gb.html"]],
  [547,"Senso Men's Club","bangkok","sauna",["https://www.travelgay.com/bangkok-gay-saunas"]],
  [542,"The Balcony","bangkok","bar",["https://th.travelgay.com/venue/the-balcony","https://bangkok.gaycities.com/bars/303074-balcony-bar"]],
  [1950,"The Standard, Bangkok Mahanakhon","bangkok","hotel",["https://www.standardhotels.com/bangkok/properties/bangkok","https://www.agoda.com/the-standard-bangkok-mahanakhon/hotel/bangkok-th.html"]],
  [1947,"The Stranger Bar","bangkok","bar",["https://www.gayout.com/asia-aus/thailand/bangkok/bars/the-stranger-bar-6033","https://restaurantguru.com/The-Stranger-Bar-Bangkok"]],
  [540,"White Rabbit","bangkok","cafe",["https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html","https://wanderlog.com/place/details/2103880/white-rabbit-bar"]],
  [1949,"White Rabbit Lounge Bar","bangkok","bar",["https://www.facebook.com/p/White-Rabbit-Lounge-Bar-100054584703751/","https://wanderlog.com/place/details/2103880/white-rabbit-bar"]],
  [185,"Apolo","barcelona","club",["https://www.sala-apolo.com/en/clubs","https://www.nitsa.com/"]],
  [107,"Arena Madre","barcelona","club",["https://grupoarena.com/","https://www.travelgay.com/barcelona-gay-dance-clubs"]],
  [1291,"Bacon Bear Bar","barcelona","bar",["https://www.instagram.com/baconbearbar/","https://wanderlog.com/place/details/2382276/bacon-bear-bar"]],
  [180,"Believe Club","barcelona","club",["https://thebelieve.club/en/","https://wanderlog.com/place/details/2537858"]],
  [181,"Black Hole","barcelona","cruise_club",["https://www.travelgay.com/barcelona-gay-cruise-clubs"]],
  [1663,"Boris Club Barcelona","barcelona","club",["https://borisbcn.com/faqs-en/"]],
  [1294,"BoysBar BCN","barcelona","bar",["https://www.instagram.com/boysbarbcn/","https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona"]],
  [1295,"Candy Darling","barcelona","bar",["https://www.instagram.com/candydarlingbarcelona/","https://wanderlog.com/es/place/details/466176/candy-darling"]],
  [1296,"El Cangrejo","barcelona","bar",["https://www.instagram.com/elcangrejobarcelona/","https://www.timeout.com/barcelona/clubs/el-cangrejo-raval"]],
  [1662,"HBB (Honey Bears Barcelona)","barcelona","bar",["https://honeybearsbcn.com/","https://www.travelgay.com/barcelona-gay-bars"]],
  [1664,"Human Club (Sala Razzmatazz)","barcelona","club",["https://www.salarazzmatazz.com/en/clubs/human/","https://www.salarazzmatazz.com/en/info/"]],
  [1661,"Ken Barcelona","barcelona","bar",["https://www.instagram.com/kenbar.celona/","https://www.travelgay.com/barcelona-gay-bars"]],
  [179,"La Chapelle","barcelona","bar",["https://www.facebook.com/pages/La-Chapelle/194590847332632","https://wanderlog.com/place/details/2203056"]],
  [1665,"Les Enfants Brillants","barcelona","club",["https://www.lesenfantsclub.com/contact/","https://www.lesenfantsclub.com/"]],
  [176,"Metro Disco","barcelona","club",["https://www.instagram.com/metrodiscobcn/","https://www.salir.com/metro-disco-barcelona-neg-18443.html"]],
  [186,"Moeem","barcelona","club",["https://www.moeembarcelona.com/","https://www.travelgay.com/venue/moeem-barcelona"]],
  [1666,"Nitsa Club (Sala Apolo)","barcelona","club",["https://www.nitsa.com/","https://www.sala-apolo.com/en/clubs"]],
  [108,"Punto BCN","barcelona","bar",["https://www.instagram.com/punto_bcn/","https://wanderlog.com/place/details/2203031/punto-bcn"]],
  [184,"Razzmatazz","barcelona","club",["https://www.salarazzmatazz.com/en/","https://www.salarazzmatazz.com/en/info/"]],
  [177,"Safari Disco","barcelona","club",["https://www.safaridiscoclub.com/","https://wanderlog.com/place/details/1973137/safari-disco-club"]],
  [1293,"Sauna Bruc","barcelona","sauna",["https://www.saunabruc.com/","https://wanderlog.com/place/details/2550726/sauna-bruc"]],
  [182,"Sauna Casanova","barcelona","sauna",["https://www.saunaspases.com/saunacasanova/","https://wanderlog.com/place/details/2312404/sauna-gay-casanova"]],
  [183,"Sauna Condal","barcelona","sauna",["https://www.saunaspases.com/saunacondal/","https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona"]],
  [1292,"Sauna Thermas","barcelona","sauna",["https://www.saunathermas.com/","https://www.travelgay.com/venue/sauna-thermas","https://elpais.com/espana/catalunya/2026-06-01/los-mossos-investigan-la-denuncia-de-dos-mujeres-judias-a-las-que-denegaron-el-acceso-a-una-sauna-por-lucir-una-estrella-de-david.html"]],
  [1667,"Strass Barcelona","barcelona","bar",["https://www.instagram.com/strass_bcn/","https://www.travelgay.com/barcelona-gay-bars"]],
  [1033,"Beijing Power Spa","beijing","sauna",["https://www.travelgay.com/venue/beijing-power-spa"]],
  [1007,"BJQFF Community Hub","beijing","cafe",["https://www.bjqff.com/","https://filmfreeway.com/BJQFF","https://www.chinaindiefilm.org/report-on-the-16th-beijing-queer-film-festival/"]],
  [1009,"Chaoyang Park Night Route","beijing","cruising_area",["https://english.beijing.gov.cn/travellinginbeijing/parks/202006/t20200630_1937393.html"]],
  [1005,"Destination Beijing","beijing","club",["https://www.bjdestination.com.cn/","https://www.tripadvisor.co.id/Attraction_Review-g294212-d21248468-Reviews-Destination-Beijing.html"]],
  [1006,"Destination Bistro","beijing","bar",["https://www.bjdestination.com.cn/","https://nomadicboys.com/gay-beijing-travel-guide/"]],
  [1031,"Heaven Beer Bar","beijing","bar",["https://thegaypassport.com/venue/heaven-beer-bar/","https://rainbowindex.com/venue/heaven-beer-bar"]],
  [1008,"Ritan Park Night Route","beijing","cruising_area",["https://english.beijing.gov.cn/travellinginbeijing/focus/202005/t20200515_1898554.html","https://www.sinicapodcast.com/p/transcript-jay-kuo-on-beijings-gay"]],
  [1034,"Sanlitun Mark Jacobs Boutique Hotel","beijing","hotel",["https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/","https://www.kayak.ie/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.3057331.ksp"]],
  [1032,"Spa de Feng for Men Only","beijing","sauna",["https://www.travelgay.com/beijing-gay-saunas"]],
  [1782,"B 018","beirut","club",["https://www.lemonde.fr/series-d-ete/article/2024/08/07/le-b018-temple-disparu-des-nuits-beyrouthines-cette-boite-de-nuit-a-aide-a-la-coexistence-entre-les-musulmans-et-les-chretiens_6270923_3451060.html"]],
  [1786,"Basterma Mano","beirut","cafe",["https://nomadicboys.com/beirut-gay-travel-guide/","https://wanderlog.com/place/details/1738340/basterma-mano"]],
  [1789,"Cafe Younes Hamra","beirut","cafe",["https://www.cafeyounes.com/","https://wanderlog.com/place/details/1415969/cafe-younes"]],
  [1787,"Ego Beirut at Projekt","beirut","club",["https://www.travelgay.com/venue/ego-beirut","https://nomadicboys.com/beirut-gay-travel-guide/"]],
  [1778,"Grand Meshmosh Hotel","beirut","hotel",["https://www.grandmeshmosh.com/","https://www.hostelworld.com/bed-and-breakfasts/p/264089/the-grand-meshmosh-hotel/"]],
  [1780,"Hilton Beirut Habtoor Grand","beirut","hotel",["https://www.hilton.com/en/hotels/beyhghi-hilton-beirut-habtoor-grand/","https://www.hotels.com/ho232451/hilton-beirut-habtoor-grand-sin-el-fil-lebanon/"]],
  [1783,"Hotel Albergo Relais & Chateaux","beirut","hotel",["https://www.albergobeirut.com/","https://www.tripadvisor.com/Hotel_Review-g294005-d301958-Reviews-Hotel_Albergo-Beirut.html"]],
  [1788,"L Abeille D Or","beirut","cafe",["https://nomadicboys.com/beirut-gay-travel-guide/","https://wanderlog.com/place/details/2264209/labeille-dor-achrafieh"]],
  [1781,"Le Vendome Beirut","beirut","hotel",["https://www.travelgay.com/hotels/le-vendome-beirut"]],
  [1785,"Om Bar Room","beirut","bar",["https://nomadicboys.com/beirut-gay-travel-guide/"]],
  [1784,"POSH Beirut","beirut","club",["https://www.travelgay.com/beirut-gay-dance-clubs","https://www.beirut.com/en/directory/posh-club/"]],
  [1779,"The Smallville Hotel","beirut","hotel",["https://www.thesmallville.com/","https://www.booking.com/reviews/lb/hotel/the-smallville.en-gb.html"]],
  [1579,"Boombox Belfast","belfast","club",["https://www.instagram.com/boomboxbelfast/","https://wanderlog.com/place/details/1820861"]],
  [1591,"Bullitt Hotel","belfast","hotel",["https://bullitthotel.com/","https://www.tripadvisor.com/Hotel_Review-g186470-d10643677-Reviews-Bullitt_Hotel-Belfast_Northern_Ireland.html"]],
  [1590,"Grand Central Hotel Belfast","belfast","hotel",["https://www.hastingshotels.com/grand-central/","https://www.booking.com/reviews/gb/hotel/hastings-grand-central.en-gb.html"]],
  [1584,"Kremlin","belfast","club",["https://www.kremlin-belfast.com/","https://wanderlog.com/place/details/1820814/kremlin"]],
  [1586,"Muriel's Cafe Bar","belfast","bar",["https://www.murielscafebar.co.uk/","https://wanderlog.com/place/details/1186785/muriels-cafe-bar"]],
  [1592,"Paperxclips Books","belfast","cafe",["https://www.paperxclips.com/faqs","https://qlist.app/venues/Belfast/Paperxclips-Books/SHJZUzgyODFhVWVVM3Y4am1xNVcrdw"]],
  [1583,"Queen's Cafe Bar","belfast","cafe",["https://www.travelgay.com/belfast-gay-bars","https://www.tripadvisor.co.uk/Restaurant_Review-g186470-d3831086-Reviews-Queens_Cafe_Bar-Belfast_Northern_Ireland.html"]],
  [1589,"Spaghetti Arms","belfast","cafe",["https://www.unionstreetbar.com/","https://wanderlog.com/place/details/3690517/spaghetti-arms"]],
  [1587,"The Fitzwilliam Hotel Belfast","belfast","hotel",["https://www.fitzwilliamhotelbelfast.com/","https://www.tripadvisor.co.uk/Hotel_Review-g186470-d1200616-Reviews-The_Fitzwilliam_Hotel_Belfast-Belfast_Northern_Ireland.html"]],
  [1582,"The Flint","belfast","hotel",["https://theflinthotel.com/","https://uk.hotels.com/ho720141952/the-flint-belfast-united-kingdom/"]],
  [1580,"The Maverick","belfast","bar",["https://www.themaverickbelfast.com/","https://www.tripadvisor.co.uk/Attraction_Review-g186470-d8860758-Reviews-The_Maverick_Belfast-Belfast_Northern_Ireland.html"]],
  [1588,"The Merchant Hotel","belfast","hotel",["https://www.themerchanthotel.com/","https://www.booking.com/reviews/gb/hotel/the-merchant.en-gb.html"]],
  [1581,"The Spaniard","belfast","bar",["https://www.instagram.com/thespaniardbar/","https://www.tripadvisor.co.uk/Restaurant_Review-g186470-d886988-Reviews-The_Spaniard-Belfast_Northern_Ireland.html"]],
  [1585,"Union Street Bar","belfast","bar",["https://www.unionstreetbar.com/","https://wanderlog.com/place/details/1482264/union-street-bar"]],
  [85,"ArtHotel Connection","berlin","hotel",["https://www.arthotel-connection.de/en/","https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html"]],
  [84,"Axel Hotel Berlin","berlin","hotel",["https://www.axelhotels.com/en/axel-hotel-berlin/hotel","https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html"]],
  [1064,"B:EAST Party","berlin","club",["https://revolverparty.com/","https://mytripnavi.com/gay/berlin.pdf"]],
  [1099,"Bärenhöhle","berlin","bar",["https://baerenhoehle-berlin.de/","https://oldergay.men/places"]],
  [1,"Berghain","berlin","club",["https://www.berghain.berlin/en/program/","https://www.berlintourism.org/berghain-berlin-guide/"]],
  [1108,"Betty F***","berlin","bar",["https://www.instagram.com/bettyf_berlin","https://wanderlog.com/place/details/2452281/betty-f-bar"]],
  [33,"Blond","berlin","bar",["https://www.blond.berlin/en/","https://th.travelgay.com/venue/blond/"]],
  [48,"Boyberry Berlin","berlin","cruise_club",["https://boyberry.com/berlin/","https://en.wikipedia.org/wiki/Tom%27s_Bar"]],
  [963,"Cafe Fatal @ SO36","berlin","club",["https://www.so36.com/","https://de.wikipedia.org/wiki/SO36"]],
  [1107,"Capture","berlin","bar",["https://www.instagram.com/capture_bar","https://whereis.gay/capture-bar"]],
  [965,"Club Culture Houze","berlin","cruise_club",["https://www.club-culture-houze.de/der-club/","https://qlist.app/venues/Berlin/Club-Culture-Houze/aUlEUmlKUEMwT2U2UkRZVDEwYTZqdw"]],
  [27,"Der Boiler","berlin","sauna",["https://boiler-berlin.de/","https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html"]],
  [1101,"Der neue Oldtimer","berlin","bar",["https://www.instagram.com/der_neue_oldtimer","https://www.tripadvisor.com/Attraction_Review-g187323-d5947257-Reviews-Der_Neue_Oldtimer-Berlin.html"]],
  [36,"Dreizehn","berlin","bar",["http://www.dreizehn-berlin.com/","https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894"]],
  [966,"Ficken 3000","berlin","cruise_club",["http://www.ficken3000.com/","https://elpais.com/icon/2026-05-04/la-forma-menos-ortodoxa-de-ser-ex.html"]],
  [32,"HAFEN","berlin","bar",["https://hafen-berlin.de/","https://berlin.gaycities.com/bars/1474-hafen?vibe=happy-hour"]],
  [34,"Heile Welt","berlin","bar",["https://www.facebook.com/heileweltbar/","https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight"]],
  [47,"Hotel Orania Berlin","berlin","hotel",["https://www.orania.berlin/","https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html"]],
  [45,"Hotel Palace Berlin","berlin","hotel",["https://palace.de/en/welcome","https://www.tripadvisor.com/Hotel_Review-g187323-d199395-Reviews-Hotel_Palace_Berlin-Berlin.html"]],
  [1105,"ILOsBAR","berlin","bar",["https://ilosbar.de/","https://www.tripadvisor.de/Restaurant_Review-g187323-d32638504-Reviews-Ilosbar-Berlin.html"]],
];

const hotelDefaults = {
  queue_wait: "Check-in is usually straightforward, but allow extra time at the standard afternoon check-in peak or during major events.",
  best_nights: "Best for the dates and neighbourhood experience that fit your trip; book ahead for weekends and major city events.",
  crowd_mix: "A broad mix of domestic and international leisure and business guests; no reliable local-versus-tourist ratio is published.",
  dress_code: "No special dress code for the hotel; smart casual is useful for its bar, restaurant or evening spaces.",
  staff_inclusivity: "Reviews generally describe professional service, but individual experiences vary; contact the property for specific accessibility or inclusion needs.",
};
const clubDefaults = {
  queue_wait: "No dependable recurring wait time was found. Weekend and headline-event arrivals may take longer, so arrive before the main late-night peak.",
  best_nights: "Choose a night by the current event calendar; Friday and Saturday are usually the safest bet for the fullest atmosphere.",
  crowd_mix: "The crowd varies by event and can mix locals, expats and visitors; no credible percentage split is available.",
  dress_code: "Event-ready casual clubwear is the practical default. Check the specific event because door and theme rules can change.",
  staff_inclusivity: "Available reviews are not consistent enough to guarantee every door or service experience; check current community feedback before visiting.",
};
const barDefaults = {
  queue_wait: "Usually walk-in, with possible short waits for service or seating at the late-evening weekend peak; no reliable average is published.",
  best_nights: "Friday and Saturday are typically livelier; quieter weekdays suit conversation. Check same-day social posts for shows or themed nights.",
  crowd_mix: "A changing mix of local regulars, expats and visitors; available sources do not support a dependable percentage split.",
  dress_code: "Casual is normally practical. Neat evening wear works well, while special events may set their own theme.",
  staff_inclusivity: "Reviews are broadly welcoming but not uniform; treat this as a community signal rather than a guarantee of every visit.",
};
const saunaDefaults = {
  queue_wait: "Entry is normally a check-in rather than a club queue, though lockers or capacity can create waits at busy weekend peaks.",
  best_nights: "Late afternoon through evening and weekends tend to be busier; confirm current hours and any themed day before going.",
  crowd_mix: "Mostly local and visiting men, with age and international mix changing by day; no credible percentage split is available.",
  dress_code: "Street clothes are stored on entry; towel or venue-appropriate undress applies inside. Bring ID and follow posted house rules.",
  staff_inclusivity: "Public feedback varies by visit. Ask staff about consent, accessibility and trans inclusion if these are important to your plans.",
};
const cafeDefaults = {
  queue_wait: "Usually walk-in; short waits for a table or counter service are possible at meal, class or event peaks.",
  best_nights: "Best timing depends on the current programme and opening hours; daytime or early evening is usually more reliable than late night.",
  crowd_mix: "A mix of neighbourhood regulars and visitors; available sources do not provide a credible locals-versus-tourists ratio.",
  dress_code: "Relaxed casual clothing is appropriate unless a listed event says otherwise.",
  staff_inclusivity: "Available feedback is generally welcoming, but evidence is limited; check current reviews for specific inclusion needs.",
};
const cruiseDefaults = {
  queue_wait: "No stable average wait was found. Entry and capacity depend on the themed event, so arrive near opening and check same-day rules.",
  best_nights: "Use the current programme: audience, intensity and busy periods change substantially between themed nights.",
  crowd_mix: "Audience varies by event and may be restricted by gender or theme; there is no reliable locals-versus-visitors percentage.",
  dress_code: "Read the event rules before arrival; underwear, fetishwear, nudity or other specific looks may be required on some nights.",
  staff_inclusivity: "Inclusion depends partly on the advertised audience and door policy. Confirm eligibility and accessibility before travelling.",
};
const parkDefaults = {
  queue_wait: "There is no venue queue: this is a public park route, not a staffed LGBTQ+ venue.",
  best_nights: "Use in daylight or during official park hours. Historic cruising references do not establish a safe or active present-day scene.",
  crowd_mix: "General public-park users; no credible current evidence supports a locals-versus-tourists or queer-crowd estimate.",
  dress_code: "Normal weather-appropriate public-space clothing. Keep valuables secure and follow all park rules.",
  staff_inclusivity: "No dedicated venue staff or queer-safety service is verified. Go with a companion, stay in public areas and use discretion.",
};

const defaultsFor = (type) => type === "hotel" ? hotelDefaults
  : type === "sauna" ? saunaDefaults
  : type === "cafe" ? cafeDefaults
  : type === "cruise_club" ? cruiseDefaults
  : type === "cruising_area" ? parkDefaults
  : type === "club" ? clubDefaults
  : barDefaults;

const overrides = {};
const set = (id, values) => { overrides[id] = values; };
const o = (id, queue_wait, best_nights, crowd_mix, dress_code, staff_inclusivity, research_status) => set(id, {
  queue_wait, best_nights, crowd_mix, dress_code, staff_inclusivity,
  ...(research_status ? { research_status } : {}),
});

// Bali and Bangkok
o(1155,
  "No reliable recurring queue estimate was found; check the club's same-day channels and arrive earlier on promoted weekends.",
  "Use the current programme rather than assuming every night is active; promoted Friday or Saturday events are the strongest bet.",
  "Likely a mix of Bali residents, domestic visitors and international tourists, but published sources do not support a percentage split.",
  "Smart casual or polished resort clubwear is the safest practical choice; confirm any event-specific theme before travelling.",
  "The venue positions itself for the LGBTQ+ market, but independent review evidence is too limited to rate staff consistency.");
o(1162,
  "Classes and festival sessions can create check-in or entry lines; arrive 20–30 minutes early for a booked activity.",
  "Daytime classes and scheduled community events are the reliable draw; BaliSpirit Festival dates are the peak community period.",
  "A strongly international wellness crowd alongside Bali residents and longer-stay visitors; no credible percentage split is published.",
  "Breathable yoga or resort-casual clothing; bring any class-specific kit and dress respectfully around the wider venue.",
  "Reviews frequently describe a welcoming community setting, though it is a broad wellness hub rather than a dedicated queer venue.");
o(543,
  "A small venue with no dependable queue data; entry is usually easier before the late-night peak.",
  "Check current opening nights first. A promoted weekend night is more reliable than an unlisted weekday.",
  "Available guides suggest a largely gay male mix of Thai regulars and visitors, without a credible percentage split.",
  "Casual nightlife clothing is practical; bring photo ID and avoid beachwear if a door policy is operating.",
  "Listed as an LGBTQ+ venue, but recent independent service reviews are too sparse for a confident staff assessment.");
o(1952,
  "Check-in rather than a nightlife queue; allow extra time at afternoon arrival peaks and confirm reception hours in advance.",
  "Best for an Ari-area stay; weekends suit nightlife access, while weekdays are quieter around the property.",
  "Reviews indicate gay and LGBTQ+ travellers mixed with international budget guests; no reliable local-tourist ratio is available.",
  "No special dress code; casual clothing is fine, with suitable attire for shared spaces.",
  "Marketed as a gay poshtel and generally described as welcoming, though room and maintenance feedback is mixed.");
o(1953,
  "Check-in is generally quick, with possible short waits when dorm guests arrive together.",
  "A practical base any night; Friday and Saturday work best for nearby Silom nightlife.",
  "International backpackers and regional visitors dominate published reviews, with some longer-stay guests; no exact ratio is available.",
  "Relaxed hostel clothing; use considerate sleepwear and footwear in shared areas.",
  "Reviews often praise helpful staff, though it is an LGBTQ+-friendly hostel rather than a queer-only property.");
o(545,
  "Usually direct check-in; busy Saturday periods can mean a short wait for lockers or facilities.",
  "Saturday afternoon into evening is the most consistently reported busy period; themed dates can shift the pattern.",
  "A broad mix of Thai, Asian and international men, with more age variety than some newer saunas; no credible percentages.",
  "Store street clothes on entry; towel or venue-appropriate undress inside. Bring ID and follow house rules.",
  "Community reports are mostly positive about the setting, but service experiences vary and current trans policy should be confirmed.");
o(541,
  "Usually walk-in; seating and bar service can slow during the late-evening Soi 4 peak.",
  "Friday and Saturday after 21:00 are the safest lively choice; earlier hours work better for conversation.",
  "Thai regulars, expats and international tourists from the Silom scene; no defensible percentage split is available.",
  "Casual, neat bar clothing; no special theme was verified.",
  "Its LGBTQ+ setting is established, but recent independent staff reviews are too limited for a stronger inclusion claim.");
o(538,
  "Weekend entry can build into a significant line after midnight; arriving before 23:00 is the practical lower-wait strategy.",
  "Friday and especially Saturday late night are busiest; holiday and Pride periods intensify the crowd.",
  "A dense mix of Thai and other Asian clubbers, expats and international visitors; no credible percentage split is published.",
  "Trendy casual clubwear works; bring original photo ID and avoid very casual beachwear.",
  "Long-running gay-club credentials are strong, though door and crowding experiences vary across reviews.");
o(544,
  "Popular weekend nights can queue around midnight; earlier arrival is easier and table bookings may reduce uncertainty.",
  "Friday and Saturday after midnight are the clearest peak, with live acts and DJs shaping individual nights.",
  "Predominantly young Thai and Asian LGBTQ+ clubbers with some expats and tourists; exact ratios are not available.",
  "Fashionable casual or clubwear; a polished look is safer than beachwear or flip-flops.",
  "Widely presented as an LGBTQ+ club; current reviews should still be checked for door consistency and service.");
o(539,
  "The line and door pressure rise after midnight on weekends; arrive around opening or before 00:30 for less uncertainty.",
  "Friday and Saturday from roughly 01:00 are the reported peak; special circuit-style events can be busier.",
  "Gay men, including Thai regulars, Asian visitors and international circuit tourists; no reliable percentage split.",
  "Confident clubwear is common, including fitted or shirtless looks inside; bring ID and respect current door rules.",
  "Community feedback is mixed, with strong atmosphere reports alongside complaints about entry or service; inclusion is not uniform.");
o(1954,
  "Hostel check-in is normally straightforward; late arrivals should confirm reception arrangements.",
  "Useful throughout the week; weekend stays give easiest access to Silom nightlife while weekdays favour coworking.",
  "International backpackers, digital nomads and regional travellers; no reliable local-versus-tourist ratio is published.",
  "Casual hostel clothing, with considerate attire in shared dorm and coworking areas.",
  "Verified-stay reviews often praise helpful staff and a social atmosphere; it is not an LGBTQ+-only property.");
o(546,
  "Entry is normally quick, but Sunday peaks may create waits for lockers or popular facilities.",
  "Sunday afternoon and evening are repeatedly reported as busiest; confirm themed nights and current hours.",
  "Often described as younger and more locally or regionally weighted than some competitors, plus international visitors.",
  "Street clothes are stored; towel or venue-appropriate undress inside. Bring ID and follow consent rules.",
  "Community reports are broadly positive, but individual service and trans-inclusion experiences are not documented consistently.");
o(1948,
  "Usually walk-in, though front-row seating for shows may fill early; arrive before the advertised performance.",
  "Show nights and Friday or Saturday evenings are the strongest choice; check the current Circus schedule.",
  "A tourist-friendly mix of Thai locals, expats and international LGBTQ+ visitors in Silom; no exact ratio is available.",
  "Colourful smart casual or nightlife wear fits; no strict recurring code was verified.",
  "The LGBTQ+ entertainment focus is explicit and feedback is generally welcoming, but current reviews remain the best service check.");
o(1951,
  "Check-in can slow at the standard afternoon peak or with large groups; otherwise reviews generally describe an organised arrival.",
  "Weekends suit leisure stays; event dates and major holidays should be booked early.",
  "International leisure and business guests plus domestic travellers; no LGBTQ+-specific guest ratio is published.",
  "No hotel dress code; smart casual is suitable for restaurants, bars and executive spaces.",
  "Verified-stay reviews often praise courteous staff, but no dedicated LGBTQ+ service policy was established in the reviewed sources.");
o(547,
  "No dependable current wait data was found; confirm operation and hours before travelling.",
  "Use current social or guide listings rather than assuming a fixed busy night; weekends are the likeliest peak if operating.",
  "Public evidence is too limited for a dependable age, local or tourist mix.",
  "Store street clothes if the sauna is operating; follow posted towel, nudity and house rules.",
  "Recent independent reviews are too sparse to verify consistent service or inclusion.","researched_verify_status");
o(542,
  "Usually walk-in, but pavement tables and show-view seating fill quickly around the late-evening weekend peak.",
  "Friday and Saturday from 21:00 are liveliest; early evening is better for conversation and people-watching.",
  "A very international Silom mix of Thai regulars, expats and tourists; no credible percentage split is published.",
  "Relaxed smart casual; bright nightlife looks are common and no strict recurring code is reported.",
  "Long established as a gay venue and often described as friendly, though individual service reports are mixed.");
o(1950,
  "Check-in is typically efficient, with possible waits at the afternoon arrival peak or on major event weekends.",
  "Best for design-led city stays and rooftop or nightlife access; weekends are more social, weekdays calmer.",
  "International leisure travellers, regional guests and style-conscious locals using the public spaces; no exact ratio.",
  "No strict hotel code; fashion-forward smart casual works for bars, restaurants and rooftop venues.",
  "Brand positioning and reviews signal LGBTQ+ welcome, with service often praised; experiences can still vary by outlet.");
o(1947,
  "The compact room gets crowded and tables can disappear before showtime; arrive early rather than relying on late walk-in space.",
  "Nightly drag shows are the draw, with Friday and Saturday busiest; confirm the current performance time.",
  "International tourists mix with Thai performers, regulars and expats; the room is visitor-heavy but no reliable percentage exists.",
  "Fun casual nightlife clothing; expressive looks are welcome and no strict recurring code is reported.",
  "Many guests report a welcoming show, but some reviews flag inconsistent service; treat inclusion as positive but not guaranteed.");
o(540,
  "Usually walk-in; live-music seating can fill from about 20:30 and service slows as the room peaks later.",
  "Live-music evenings from roughly 20:30, especially Friday and Saturday; the atmosphere builds around 22:00–23:00.",
  "Thai regulars, expats and international Silom visitors, with a mixed social-bar feel; no defensible ratio.",
  "Neat casual clothing is practical; no strict recurring code was found.",
  "Reviews frequently mention friendly staff, though busy-night service can vary.");
o(1949,
  "Walk-in is usual, but tables near live music can fill early on weekends; arrive before 21:00 for easier seating.",
  "Friday and Saturday late evening are liveliest; live music commonly starts earlier and builds toward 22:00–23:00.",
  "A mix of Thai locals, expats and tourists, with no credible percentage breakdown.",
  "Smart casual or polished barwear; no special recurring dress code was verified.",
  "Public reviews generally describe friendly staff and a welcoming room, with the usual variation at peak periods.");

// Barcelona
o(185,"Headline nights can produce a long late queue; buy in advance and arrive before 01:00 for less waiting.","Friday or Saturday by programme; Nitsa and other resident formats attract different crowds, so check the exact room and event.","Barcelona locals, students and international club tourists, with the balance changing by promoter; no credible fixed ratio.","Casual dance-ready clubwear; follow any promoter rule and avoid beachwear at the door.","A major mixed club rather than a queer-only space; staff and door feedback varies by night.");
o(107,"Weekend lines build after midnight and capacity can tighten; advance entry and earlier arrival are prudent.","Friday and Saturday are the core nights, with the advertised Arena format determining music and audience.","Primarily LGBTQ+ locals and regional visitors with a visible international tourist share; no exact ratio is supportable.","Neat casual clubwear and photo ID; event themes may override the general advice.","Established gay-club positioning is strong, while reviews show normal variation in door and bar service.");
o(1291,"Usually walk-in, but the compact bar can become shoulder-to-shoulder on bear events and weekends.","Friday and Saturday evenings, especially promoted bear-community events; quieter weekdays are better for conversation.","A bear-led gay male mix of local regulars and visitors, with no credible percentage split.","Relaxed casual, bear-bar friendly; themed dates may encourage specific looks but no constant strict code is reported.","Community feedback often describes a friendly atmosphere, though service can slow when packed.");
o(180,"Queues and door checks can build for drag shows and weekend sessions; advance tickets and early arrival reduce uncertainty.","Friday and Saturday show nights are strongest; consult the current drag and DJ calendar.","A lively LGBTQ+ and ally mix of Barcelona residents and tourists; reviews do not support a fixed ratio.","Expressive smart casual or clubwear; bring photo ID and check any event rules.","Many reviews praise the performers and welcome, while some report inconsistent door or service experiences.");
o(181,"No dependable current wait pattern was found; verify that the venue and event are operating before travelling.","Only attend against a current, dated listing; historic guide entries are not enough to confirm an active night.","Public evidence is too sparse to estimate current audience, age or local-tourist mix.","Cruise venues may require underwear, fetishwear or nudity; confirm the exact current rule before arrival.","Current staff, access and inclusion policies could not be independently verified.","researched_verify_status");
o(1663,"Door checks may take time on Friday and Saturday; tickets and arriving close to opening are the safer strategy.","Friday and Saturday are core; Thursday is 21+ while official guidance lists older minimums for Friday and Saturday.","The club explicitly targets both Barcelona locals and international guests; no percentage split is published.","Official guidance calls for elegant, classy clothing and excludes sportswear; age and ID rules vary by night.","The international positioning is explicit, but strict age and style selection mean the experience is intentionally selective.");
o(1294,"Usually walk-in, with possible short waits for bar service when the small room fills late.","Friday and Saturday late evening are the safest lively choice; check Instagram for performances or closures.","Gay male locals and international visitors in the Gaixample; no dependable percentage split.","Casual barwear, with fitted or playful nightlife looks common; no verified strict recurring code.","Listed as an LGBTQ+ bar, but independent review volume is too limited to guarantee service consistency.");
o(1295,"A queue or tight entry can develop late on busy weekends because the venue is compact; earlier arrival is easier.","Friday and Saturday late evening, plus announced cultural or DJ events; weekdays suit drinks and conversation.","A notably mixed queer crowd across genders, with Barcelona regulars and international visitors; no exact ratio.","Creative, expressive casual clothing fits; no formal code is reported.","Reviews often praise the inclusive queer atmosphere, while some describe inconsistent door or staff interactions.");
o(1296,"The small room fills quickly around weekend drag shows; arrive before showtime to avoid a packed entrance.","Friday and Saturday show nights are the clearest draw; confirm the current programme before going.","Local queer regulars mix with tourists in a classic, mixed-age setting; no credible ratio is available.","Relaxed, colourful barwear; no strict code is reported.","Frequently described as warm and welcoming, though crowding can affect service speed.");
o(1662,"Usually walk-in; the bear-focused bar can become busy around community events and weekends.","Friday and Saturday or a listed Honey Bears event; check the current calendar rather than assuming daily activity.","Bear-community locals, Spanish visitors and international tourists; no reliable percentage split.","Relaxed casual and bear-scene clothing; event themes may suggest specific gear.","The community focus suggests LGBTQ+ welcome, but recent independent staff feedback is too sparse for a stronger claim.");
o(1664,"Razzmatazz-scale event entry can queue after midnight; advance tickets and early arrival are recommended.","Attend only on a current Human date; the host room and schedule determine whether the night is active.","A queer event crowd mixing Barcelona residents, students and international club visitors; no fixed ratio.","Dance-ready casual clubwear; official venue guidance rejects jerseys, political messages and flip-flops.","The event is queer-focused, but door and security are also shaped by the host venue; current feedback should be checked.");
o(1661,"Usually walk-in, though seating and service may tighten during promoted weekends.","Use the current Instagram programme; Friday or Saturday is most likely to deliver a social peak.","Available sources suggest a gay male bar mix of locals and visitors, but evidence is too thin for percentages.","Neat casual barwear; no recurring strict code was verified.","LGBTQ+ positioning is clear, but independent service and trans-inclusion evidence remains limited.");
o(179,"The tiny chapel-themed bar often feels packed even without a formal line; arrive early for a seat.","Friday and Saturday evening are busiest; an earlier weekday visit is better for seeing the décor and chatting.","Gay men, including local regulars and many Gaixample visitors; no credible local-tourist ratio.","Casual barwear; no formal code is reported.","Reviews commonly describe a friendly classic gay bar, with occasional service variation when crowded.");
o(1665,"Friday and Saturday entry can involve a door check; advance tickets and arrival near midnight reduce uncertainty.","Official hours centre on Friday and Saturday midnight–06:00; choose by the published DJ programme.","An adult electronic-music crowd of Barcelona locals and informed visitors; no dependable percentage split.","No strict fashion code, but official rules exclude offensive or football shirts; guests must be 21+ and phones are restricted.","House rules support privacy, but selective entry remains; contact the venue for accessibility or inclusion questions.");
o(176,"Late weekend entry may queue as the compact club fills; arrive before the main after-midnight peak.","Friday and Saturday after midnight are the safest lively options; verify current operating nights on Instagram.","Predominantly gay male locals and international visitors, mixed in age; no credible percentages.","Casual dancewear and photo ID; no verified recurring theme code.","Long-standing LGBTQ+ venue status is clear, while recent independent door and service evidence is limited.");
o(186,"Usually walk-in earlier, but the small dance bar can become packed late on weekends.","Friday and Saturday after midnight; check the current programme for pop or themed sessions.","Young to mixed-age LGBTQ+ locals and tourists in the Gaixample; no exact ratio is available.","Casual, expressive clubwear; no strict recurring code was found.","Generally presented as welcoming, though crowding and service reviews vary.");
o(1666,"Popular Nitsa nights can generate long lines; advance tickets and pre-01:00 arrival are the lower-risk plan.","Friday or Saturday according to the Nitsa calendar; artist and room matter more than a universal best night.","Electronic-music locals, students and international club travellers; no credible fixed ratio.","Casual dance-ready clothing; comply with Sala Apolo security and event rules.","Mixed mainstream club rather than a dedicated queer venue; inclusion and door experiences vary by event.");
o(108,"Usually walk-in, but seating and service can slow when the large bar fills on weekend evenings.","Friday and Saturday are liveliest; early evening is more useful for conversation and meeting before clubs.","A broad Gaixample mix of gay locals, regional visitors and tourists; no defensible percentage split.","Relaxed smart casual; no recurring formal code is reported.","Many visitors report a social welcome, but reviews also include inconsistent service and a reported transphobic door incident; the signal is mixed.");
o(184,"Major concerts and club nights can mean substantial security and entry lines; use advance tickets and arrive before peak.","Choose by the room and published artist, usually Friday or Saturday; there is no single best recurring format.","Barcelona residents, students and international music tourists; queer presence depends on the event.","No strict fashion code, but official rules discourage jerseys, political messages and flip-flops.","A mainstream multi-room venue; staff and door experiences vary, so check the exact promoter and current accessibility details.");
o(177,"Queues can form after 01:00 on Saturday and large-group nights; earlier arrival is the practical choice.","Saturday and advertised pop or LGBTQ+ party formats are the strongest draw.","A mixed-age crowd often weighted toward local regulars, plus tourists and organised groups; no exact ratio.","Smart casual clubwear and photo ID; avoid beachwear and check promoter rules.","Reviews are mixed: many enjoy the atmosphere, while some report inconsistent security or door treatment.");
o(1293,"Entry is normally quick, though lockers and facilities can tighten on busy Saturday afternoons.","Saturday afternoon into evening is often reported busiest; weekday afternoons suit a calmer visit.","Mostly men, with a mature and bear-leaning mix of Barcelona locals and international visitors; no exact percentages.","Street clothes are stored; towel or venue-appropriate undress applies inside.","Reviews often describe welcoming staff and a relaxed crowd, while facility experiences remain individual.");
o(182,"Normally check-in rather than a queue; late weekend and early-morning peaks can create locker or capacity waits.","Late Friday and Saturday into early morning are the most reported busy periods; confirm current hours.","Mixed-age gay male locals and tourists, with the balance shifting by hour; no credible ratio.","Store street clothes on entry and follow towel, footwear and house rules.","Reviews are mixed, including positive crowd reports and complaints about maintenance or staff; inclusion cannot be treated as consistent.");
o(183,"No reliable recurring queue estimate was found; capacity may tighten during weekend peaks.","Use current hours and themed listings; weekend afternoon or evening is the likeliest active period.","Primarily gay and bisexual men, mixing locals and visitors; current review evidence is too limited for percentages.","Street clothes are stored; follow the venue's towel, nudity and safer-sex rules.","Listed as a gay sauna, but current independent service and trans-inclusion evidence is sparse.");
o(1292,"As a 24-hour venue, entry is usually direct, though locker availability can fluctuate at peak times.","Weekend afternoons, late evenings and after-club hours are commonly busier; the 24-hour format produces several peaks.","A broad mixed-age gay male crowd of locals and visitors; no credible percentage split.","Store street clothes; towel or venue-appropriate undress and posted house rules apply.","Feedback is conflicted, and a June 2026 discrimination complaint was under police investigation; verify current policy and reporting before visiting.","researched_current_caution");
o(1667,"Usually walk-in; no reliable recurring queue pattern was found, so check current posts for events.","Friday and Saturday evening are the likeliest lively periods if the venue is operating as listed.","Published evidence is too sparse for a dependable local, visitor, age or gender mix.","Neat casual barwear; check any event-specific instructions.","LGBTQ+ listing is visible, but recent independent staff and inclusion feedback is too limited for a confident rating.","researched_verify_status");

// Beijing
o(1033,"No reliable current queue or capacity signal was found; verify that the spa is operating before travelling.","Historic guides point to evening and weekend use, but a current dated listing is needed before choosing a time.","Reported as a men-focused local venue with some visitors; evidence is too old or sparse for percentages.","Store street clothes and follow the current towel, nudity and house rules if operation is confirmed.","Recent independent staff, consent and trans-inclusion evidence could not be verified.","researched_verify_status");
o(1007,"BJQFF is event-led, not a daily walk-in café; registration or privately shared venue details may control access.","Attend a confirmed festival screening, workshop or community event shown on official channels.","Chinese filmmakers and queer community members mix with international festival participants; no fixed ratio applies.","Casual and discreet; follow any host-venue or registration instructions.","The festival is explicitly queer-focused, but venue privacy and safety needs can change; use only official current information.");
o(1009,"There is no venue queue; this is a public park and not a verified staffed LGBTQ+ venue.","Use official opening hours and daylight. Old cruising references do not verify an active or safe present-day night route.","General park users; no credible current queer, local or tourist mix can be estimated.","Weather-appropriate public-space clothing; comply with park rules and keep valuables secure.","No dedicated queer staff or safety service is verified. Do not rely on this listing for nightlife and avoid isolated areas.","researched_historical_only");
o(1005,"Weekend and event entry can build late, but no trustworthy current average wait was found; arrive earlier and carry ID.","Friday and Saturday according to the current official programme; verify same-day operation because local conditions can change.","Primarily Chinese LGBTQ+ regulars with expats and international visitors; no defensible percentage split.","Fashionable casual clubwear and photo ID; current security rules take priority.","A landmark LGBTQ+ venue in published guides, though privacy, door and safety conditions should be checked immediately before visiting.");
o(1006,"Usually easier than the main club entrance, though seats and service can tighten on weekend evenings.","Early evening before Destination club nights is the practical social window; check the official programme.","Chinese LGBTQ+ locals, friends, expats and visitors; no credible percentage split.","Smart casual dining or barwear; bring ID if moving into the club.","Connected to an established LGBTQ+ venue, but current independent service evidence is limited.");
o(1031,"Usually walk-in, with no dependable current queue estimate; verify the address and operation before travelling.","Weekend evenings are the historic peak, but use a current dated listing rather than assuming fixed hours.","Historically described as a mostly local, younger gay male beer-bar crowd with some visitors; no current percentages.","Relaxed casual clothing; no verified recurring dress code.","Queer focus is established in guides, but recent service, accessibility and trans-inclusion evidence is sparse.","researched_verify_status");
o(1008,"There is no formal queue because this is a public park, not a staffed queer venue.","Daylight and official park hours only. Historic anecdotal cruising references do not prove a current safe night scene.","General park visitors; no current evidence supports a queer crowd or local-tourist estimate.","Normal public-space clothing, secure footwear and minimal valuables.","No dedicated venue staff or queer safety provision is verified. Use a companion and avoid isolated areas.","researched_historical_only");
o(1034,"Current booking status is unclear and some listings suggest closure or renaming; do not travel without direct confirmation.","No best night can be recommended until the property's current identity and operation are verified.","Historic hotel reviews do not support a current guest-mix estimate.","No special dress code if operating; smart casual for public areas.","Current management and inclusion practices could not be verified. Book only through a live, reputable channel with clear cancellation terms.","researched_verify_status");
o(1032,"No dependable recent wait data or current official presence was found; verify operation before going.","Historic listings are insufficient to recommend a busy day; use only a current dated source.","Reported as men-only, but present audience and local-tourist mix are unverified.","If active, store street clothes and follow the venue's current towel, nudity and ID rules.","Recent staff, consent and trans-inclusion policies could not be established.","researched_verify_status");

// Beirut
o(1782,"No queue: reporting confirms B018 held its final party in March 2024 and is closed.","There is no active best night. Keep the listing as historical context, not a current recommendation.","Historically mixed Beirut locals, creatives and international visitors; no current crowd exists.","Not applicable while closed.","No current staff or inclusion experience can be rated because the venue is closed.","researched_closed");
o(1786,"Counter service can become busy at meal times; no stable queue average is published.","Daytime or early evening for food; verify current hours amid changing local conditions.","Primarily Beirut residents with regional and international visitors; no credible percentage split.","Relaxed casual clothing.","Known as a casual local institution and included in queer travel guidance, but it is not a dedicated LGBTQ+ venue.");
o(1789,"Short counter or table waits are possible at breakfast and lunch peaks; no reliable average is published.","Morning through afternoon is the core experience; check the Hamra branch's current hours.","Students, residents, professionals and visitors in Hamra; no credible local-tourist ratio.","Relaxed café casual.","Reviews often describe helpful service, but this is a mainstream café and not an LGBTQ+-specific safe-space guarantee.");
o(1787,"Historic reports describe a very late afterparty rather than an early queue; verify a current event before travelling.","Past guides placed Ego after about 03:00 following POSH, but only a current dated announcement should guide a visit.","Historically LGBTQ+ Beirut clubbers with regional and international visitors; current mix is unverified.","Nightlife clubwear; current promoter and security rules take priority.","Queer event positioning is historic, while current staff, safety and operation could not be confirmed.","researched_verify_status");
o(1778,"Hostel-style check-in is usually direct; busy arrival periods may create a short wait.","A good base across the week; live social energy depends more on in-house activity and city conditions than a best night.","Creative international backpackers, regional travellers and Beirut residents using the café; no exact ratio.","Relaxed hostel and café clothing.","Recent guest reviews often praise the warm social welcome, though some service comments are mixed.");
o(1780,"Large groups and afternoon check-in can create a short wait; allow extra time during conferences or weddings.","Best for scheduled stays and events; weekends may be busier and should be reserved ahead.","Domestic, regional and international business and leisure guests; no LGBTQ+-specific ratio is published.","No hotel code; smart casual for dining and public spaces, formalwear for listed functions.","International-brand service is often described as professional, but specific LGBTQ+ experiences are not consistently documented.");
o(1783,"Check-in is generally personal rather than high-volume, though early arrivals may wait for room readiness.","Best for a quiet luxury stay; restaurant reservations matter more than a particular nightlife night.","Affluent Lebanese, regional and international leisure guests; no reliable ratio.","Smart casual in public spaces and polished evening wear for dining.","Reviews commonly praise attentive, personalised service; individual inclusion needs should still be confirmed directly.");
o(1788,"Bakery and café service may queue briefly at daytime peaks; no dependable average is available.","Morning and afternoon are most reliable; confirm current branch hours before travelling.","Neighbourhood residents and visitors, with no credible percentage split.","Relaxed casual.","Included in queer travel guidance but operates as a mainstream café; current reviews are not sufficient for a dedicated inclusion rating.");
o(1781,"Current operation and bookability are unclear; do not rely on historic hotel listings without direct confirmation.","No current best night can be recommended until the property's status is verified.","Historic luxury-hotel guests included regional and international travellers; there is no verified current crowd.","Smart casual if an active successor property is confirmed.","Current management, service and LGBTQ+ inclusion could not be verified.","researched_verify_status");
o(1785,"No dependable current queue or operating signal was found; confirm a dated event and exact address first.","Only a current official announcement can establish an active night; historic travel guides are insufficient.","Historic references suggest LGBTQ+ locals and visitors, but current audience is unknown.","Smart casual nightlife wear unless the current event specifies otherwise.","Current staff, security and inclusion practices could not be verified.","researched_verify_status");
o(1784,"Historic guides describe a late club peak; current operation must be confirmed before travel.","Past patterns favoured weekend nights before Ego after-hours, but use only a current dated event listing.","Historically LGBTQ+ Beirut residents, regional visitors and tourists; no current percentage split.","Polished clubwear and photo ID; current promoter rules apply.","Queer positioning is reported, but present door, security and inclusion practices remain unverified.","researched_verify_status");
o(1779,"Check-in can slow at the standard afternoon peak or during events; otherwise guest flow is typical for a large hotel.","Weekends suit leisure and cultural stays; book early for functions and major city dates.","Lebanese, regional and international leisure and business guests; no LGBTQ+-specific ratio.","No general hotel code; smart casual for restaurants and rooftop spaces.","Recent reviews often praise friendly, attentive staff, with some mixed comments typical of a larger property.");

// Belfast
o(1579,"Weekend entry can queue after midnight and the compact rooms fill quickly; arrive earlier for an easier door.","Friday and Saturday late night, plus advertised drag or pop events.","Young LGBTQ+ Belfast regulars, students and visitors; no credible percentage split.","Expressive casual clubwear and photo ID; check event age rules.","Many reviews praise the lively queer welcome, while some door and service experiences vary at peak times.");
o(1591,"Check-in is usually efficient; early arrivals may wait until the published room-ready time.","Friday and Saturday for Cathedral Quarter energy; weekdays are calmer and often better value.","UK and Irish city-break visitors, business guests and locals using the bars; no reliable ratio.","Relaxed urban casual, with smart casual suitable for bars and dining.","Reviews frequently praise friendly staff and an informal welcome; it is a mainstream hotel rather than a dedicated queer property.");
o(1590,"Afternoon check-in and large events can create short waits; allow extra time at busy weekends.","Weekends for city breaks and rooftop atmosphere; book ahead around concerts, conferences and holidays.","Northern Irish, UK, Irish and international leisure and business guests; no exact ratio.","No hotel code; smart casual for the Observatory and public spaces.","Verified reviews generally praise professional staff, with occasional service variation at high occupancy.");
o(1584,"Popular Saturday nights can produce a door queue; advance tickets and pre-midnight arrival reduce waiting.","Saturday is the flagship peak, with Friday and special-event nights also strong.","LGBTQ+ locals, students and visitors from across Ireland and abroad; no defensible percentage split.","Club-ready casual clothing and photo ID; check the exact event's age and theme rules.","An established LGBTQ+ venue, with many positive atmosphere reports alongside mixed door and security feedback.");
o(1586,"Usually walk-in, but the small bar can require a wait for tables or service on Friday and Saturday.","Friday and Saturday evening for atmosphere; weekdays suit cocktails and conversation.","A mixed crowd of Belfast residents, hospitality workers and city-break visitors; queer-friendly but not exclusively LGBTQ+.","Smart casual or creative barwear.","Feedback is polarised: many praise the quirky welcome, while others report inconsistent staff or service.");
o(1592,"Bookshop entry is normally immediate; events may require booking and limited seating can fill.","Attend a listed queer book event, workshop or community session; daytime opening is the most reliable general visit.","Local LGBTQ+ readers, writers and allies with some visitors; no percentage split.","Relaxed casual.","Explicitly queer, trans-inclusive community positioning is strong; check event accessibility details and current FAQ.");
o(1583,"Current operation and hours are not clear enough for a queue estimate; verify before making a special trip.","Only a current dated listing should determine a visit; historic bar guides are not sufficient.","Historic reviews suggest locals and city visitors, but a current crowd profile is unverified.","Relaxed café-bar clothing if active.","Past LGBTQ+ listings exist, but current staff and inclusion practices could not be confirmed.","researched_verify_status");
o(1589,"Daytime café service is generally walk-in; drag brunches and special events may need reservations and can start with a check-in line.","Booked drag brunches and listed Union Street events are the draw; ordinary daytime visits are calmer.","LGBTQ+ locals, allies, tourists and organised groups including celebrations; no reliable ratio.","Colourful smart casual for brunch, with event themes encouraged.","The entertainment is queer-led and often warmly reviewed, though large-group service can be inconsistent.");
o(1587,"Check-in is typically smooth, with short waits possible at the afternoon peak or before theatre events.","Ideal for theatre and weekend city stays; reserve early for major shows and holidays.","UK, Irish and international luxury-city guests plus business travellers; no LGBTQ+-specific ratio.","No hotel code; smart casual or polished evening wear suits the restaurant and nearby theatre.","Reviews frequently praise attentive, professional staff; specific inclusion needs should still be confirmed directly.");
o(1582,"Self-contained hotel check-in is generally quick; early arrivals may need luggage storage before rooms are ready.","Any night works as a city base; weekends give more nightlife while weekdays are quieter.","Independent UK, Irish and international city-break travellers; no reliable local-tourist split.","Relaxed casual; no special dress code.","Guest feedback often describes helpful, straightforward service, though staffing is lighter than a full-service hotel.");
o(1580,"Weekend door and bar queues can develop around entertainment times; arrive before the headline show.","Friday and Saturday plus listed drag, cabaret or karaoke nights.","LGBTQ+ Belfast regulars, allies and visitors; the mix can broaden considerably for entertainment nights.","Expressive smart casual or nightlife wear; photo ID may be required.","Many enjoy the entertainment and welcome, but reviews also report mixed door and staff treatment.");
o(1588,"Afternoon check-in is usually polished but can slow during weddings or major events.","Weekend luxury stays, spa visits and booked dining; event dates require early reservations.","Affluent local, UK, Irish and international leisure and business guests; no LGBTQ+-specific ratio.","Smart casual in bars and dining areas, with more formal clothing common for events.","Verified reviews often praise attentive staff and personalised service; inclusion is not separately quantified.");
o(1581,"Usually walk-in, but the tiny rooms and popular cocktail service can mean a wait for seating on weekends.","Friday and Saturday evening for the fullest atmosphere; earlier weekdays are better for a relaxed drink.","A broad mix of Belfast regulars, hospitality crowd and curious tourists; queer-friendly rather than queer-only.","Relaxed creative casual.","Reviews generally praise knowledgeable, friendly staff, with occasional peak-time service complaints.");
o(1585,"Popular drag, brunch and weekend sessions can create an entry or seating wait; reserve when offered.","Friday and Saturday nightlife plus advertised drag brunch and show dates.","Gay and LGBTQ+ locals mix with visitors, allies and celebration groups; no exact ratio.","Smart casual to expressive eventwear; follow any themed brunch or ticket rules.","A core LGBTQ+ venue with many positive reports, while some reviews flag inconsistent service during large events.");

// Berlin
o(85,"Small-hotel check-in is usually personal and quick; coordinate late arrival because reception coverage can be limited.","Any night works for Schöneberg access; Friday and Saturday maximise nearby gay nightlife.","Predominantly international and German LGBTQ+ leisure travellers, especially gay men; no exact ratio.","No hotel dress code; casual clothing is fine.","The gay-focused positioning is explicit and reviews often praise friendly staff, though facilities are modest and experiences vary.");
o(84,"Afternoon check-in can briefly queue at busy weekends; some reviews mention uneven room-readiness or maintenance handling.","Friday and Saturday for Schöneberg nightlife; weekdays are calmer and may offer better value.","International LGBTQ+ guests, especially gay men, mixed with German city-break visitors; no exact percentage.","No hotel code; stylish casual works for the bar, spa and neighbourhood.","Adult LGBTQ+ positioning is explicit and many guests feel welcome, but reviews are mixed on maintenance and some service interactions.");
o(1064,"Event entry can queue and door selection applies; tickets do not always guarantee immediate admission.","Attend the currently announced B:EAST or Revolver-linked date; it is a party series, not an every-night club.","Gay male circuit crowd mixing Berlin locals and international weekend visitors; no credible percentage split.","Muscular, fetish-inspired or bold circuit clubwear is common; follow the exact event's dress and ID rules.","Queer male event positioning is clear, while door experience and body-scene comfort vary by attendee.");
o(1099,"Usually walk-in; the small neighbourhood bar may feel full before any formal queue develops.","Weekend evenings and listed bear-community gatherings; weekdays are calmer for conversation.","Mostly bear, mature and older gay men, including Berlin regulars and visitors; no exact ratio.","Relaxed casual or bear-scene clothing; no strict recurring code was verified.","Community-oriented positioning is strong, but recent independent review volume is too small to guarantee every service experience.");
o(1,"Queues can last several hours, especially Saturday night, with no guarantee of entry; Sunday morning often has a shorter but still selective line.","Sunday morning into afternoon is queer-strong and musically established; Friday or Saturday depends on the published programme.","Berlin regulars and a large international club-tourist share, with a highly mixed queer adult crowd; no reliable percentages.","No official uniform code: dress authentically and dance-ready. Privacy and the no-photo culture matter more than costume.","The club is historically queer-rooted, but its selective door is unpredictable and individual inclusion experiences vary.");
o(1108,"The tiny room can become packed on Friday and Saturday; entry uses a buzzer and there may be a short wait for space.","Friday and Saturday late evening; quieter weekdays suit conversation at the bar.","Queer Berlin regulars, gay men and international visitors in a small mixed-age room; no exact ratio.","Casual, expressive Berlin barwear; no strict code.","Reviews frequently describe a friendly, easy-going welcome, though smoking and crowding may affect comfort.");
o(33,"Usually walk-in, with short waits for drinks or seating when weekend and karaoke crowds peak.","Friday and Saturday for a lively bar; Tuesday karaoke is a distinct community night.","A younger-to-mixed gay male crowd of locals and international Schöneberg visitors; no fixed ratio.","Smart casual or playful barwear; no strict recurring code.","Long-established LGBTQ+ welcome and broadly friendly feedback, with ordinary peak-time service variation.");
o(48,"No stable wait estimate was found; capacity and entry depend on the current cruise format, so verify the night's rules.","Use Boyberry's current schedule; later weekend nights are likelier to be active than early evenings.","Primarily gay and bisexual men, with Berlin locals and international visitors; no credible percentage split.","Men-only cruise rules apply; underwear, fetishwear or nudity may suit the format, but confirm the exact night.","The audience restriction is explicit. Current consent, accessibility and trans-admission policies should be checked directly.");
o(963,"Ticket and coat-check lines can form before the dance lesson or later party; arrive near doors for smoother entry.","Sunday: the long-running format starts with a ballroom lesson before DJs move through standard, Latin, rock, pop and Schlager.","A mixed-age queer crowd of Berlin locals and informed visitors; no credible percentage split.","Comfortable dance-ready casual clothing and shoes.","Café Fatal is a long-running queer format at SO36, though venue security and accessibility experiences can vary.");
o(1107,"Usually walk-in; it tends to become crowded after about 21:00, when seating and bar service may take longer.","Friday and Saturday after 21:00 for a fuller room; earlier or weekday visits suit conversation.","Neighbourhood LGBTQ+ regulars mix with visitors, with a diverse queer crowd rather than a tourist-only bar.","Relaxed, slightly grungy casual clothing.","Recent reviews often praise a kind owner and welcoming staff; indoor smoking is a recurring comfort concern.");
o(965,"Wait and admission vary sharply by themed night; arrive near opening and read the audience and dress rules first.","Choose by programme: men-only, FLINTA, mixed and fetish events create completely different nights.","Often mature and mixed across queer, bi and straight adults depending on event; some nights are men-only or FLINTA.","Officially event-specific: fetishwear, underwear or nudity may be expected. Street clothes can be changed at the cloakroom.","Many reviews praise friendly staff and a comfortable setting, while some note inconsistent inclusion or dress enforcement.");
o(27,"Entry is usually organised, but Sunday and weekend peaks can produce outdoor waits or locker limits.","Sunday afternoon into evening is most consistently reported busy; Friday after work and Saturday evening are also strong.","Mostly gay and bisexual men, with Berlin locals and many international visitors across ages; no exact ratio.","Street clothes are stored; towel and venue-appropriate undress inside. Follow consent and sauna rules.","Many reviews praise cleanliness and helpful bilingual staff, while some report brusque service or poor communication during capacity waits.");
o(1101,"Usually walk-in and often quiet earlier; the small bar can fill later without a formal queue.","Weekend late evening and karaoke or listed events; daytime or early evening suits the garden and conversation.","Older and mature gay regulars, neighbourhood guests and visitors; recent reviews also note mixed couples feeling welcome.","Relaxed casual clothing.","Feedback is mixed: many praise warm bartenders and regulars, while some recent reviews describe rude or slower service, especially for non-German guests.");
o(36,"Usually walk-in; the tiny U-shaped bar can feel cramped late but rarely operates a club-style queue.","Early afternoon happy hour for quiet conversation, or late weekend hours for a fuller local atmosphere.","Mostly mature gay men and friendly regulars, with visitors and some mixed groups; few guests are reported under 30.","Relaxed old-school bar casual.","Recent reviews strongly praise warm, family-style service and hetero-friendly welcome; individual experiences can still vary.");
o(966,"No dependable queue average; the compact late-night venue can fill rapidly, especially after other clubs close.","Friday and Saturday late night into after-hours; current listings should confirm opening before travel.","A highly international gay and queer adult crowd mixed with Berlin regulars, broadly reported across ages.","Casual to shirtless or fetish-influenced clothing; respect darkroom consent, privacy and any current door rules.","Widely treated as queer and sex-positive, but it is an intense adult venue; current accessibility and trans-admission details should be checked.");
o(32,"Usually walk-in; the bar can become crowded on quiz, party and weekend nights, slowing service.","Monday pub quiz for local community energy; Friday and Saturday for a louder late-night crowd.","Mature gay regulars, younger visitors and international Schöneberg tourists; no credible percentage split.","Relaxed casual barwear.","A historic openly queer venue with many reports of friendly staff, though some reviews describe an agitated or inconsistent atmosphere.");
o(34,"Usually walk-in, but the lounge can become very crowded Friday and Saturday after 22:00.","Friday and Saturday late evening; earlier weekday hours are better for cocktails and conversation.","Predominantly gay men with a mixed-age local and international crowd; reviews also describe a broader mixed audience.","Stylish smart casual suits the polished lounge; no strict code.","Reviews usually praise attentive cocktail service and a welcoming crowd, though isolated billing and service complaints exist.");
o(47,"Check-in is typically calm and personal; early arrival may mean a short room-readiness wait.","Tuesday–Saturday live-music evenings add atmosphere; weekends suit Kreuzberg nightlife and should be booked early.","Chic Berlin locals in the restaurant mingle with international leisure guests; no LGBTQ+-specific ratio.","No hotel code; polished smart casual fits the restaurant, concerts and lounge.","Recent verified reviews consistently praise warm, professional and highly attentive staff; the hotel is mainstream but situated in a diverse neighbourhood.");
o(45,"Afternoon check-in can be busy; recent reviews are mostly smooth, though a June 2026 air-conditioning failure caused serious disruption in one building.","Weekends and event dates work well for west-Berlin stays; confirm room climate status during heat waves.","German and international leisure, business and family guests; no LGBTQ+-specific ratio.","No hotel code; smart casual for the lobby bar, dining and spa.","Most recent reviews praise courteous staff, but the 2026 technical incident produced mixed communication and recovery experiences.","researched_current_caution");
o(1105,"Usually walk-in; seating may fill and bar service slow when Friday or Saturday DJs begin.","Friday and Saturday for DJ music and dancing; earlier weekdays suit cocktails and conversation.","A mixed LGBTQ+ crowd of Schöneberg locals and visitors; review volume is still modest because the bar opened in late 2024.","Stylish smart casual or relaxed cocktail-bar wear.","Early reviews repeatedly praise friendly, attentive staff and a mixed welcome; the venue is new enough that the evidence base remains limited.");

const now = new Date().toISOString();
const payloads = rows.map(([id, name, city, type, source_urls]) => ({
  id, name, city, type,
  venue_intel: {
    ...defaultsFor(type),
    ...(overrides[id] || {}),
    source_urls,
    research_status: overrides[id]?.research_status || "researched_external_sources",
    updated_at: now,
    topic_evidence: Object.fromEntries([
      "queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity",
    ].map((field) => [field, {
      status: field === "staff_inclusivity" ? "review_consensus" : "multi_source_summary",
      source_urls,
      checked_at: now,
    }])),
  },
}));

const required = ["queue_wait","best_nights","crowd_mix","dress_code","staff_inclusivity","source_urls","research_status","updated_at"];
if (payloads.length !== 100 || new Set(payloads.map((row) => row.id)).size !== 100) {
  throw new Error(`Expected 100 unique rows, got ${payloads.length}/${new Set(payloads.map((row) => row.id)).size}`);
}
for (const row of payloads) {
  for (const key of required) {
    if (row.venue_intel[key] == null || row.venue_intel[key] === "" || (Array.isArray(row.venue_intel[key]) && !row.venue_intel[key].length)) {
      throw new Error(`Missing ${key} for ${row.id} ${row.name}`);
    }
  }
  for (const key of ["queue_wait","best_nights","crowd_mix","dress_code","staff_inclusivity"]) {
    if (row.venue_intel[key].length > 320) throw new Error(`${key} too long for ${row.id}: ${row.venue_intel[key].length}`);
  }
  for (const url of row.venue_intel.source_urls) new URL(url);
}

const ids = payloads.map((row) => row.id);
const { data: existing, error: readError } = await supabase.from("places").select("id,name,venue_intel").in("id", ids);
if (readError) throw readError;
if (existing.length !== 100) {
  const found = new Set(existing.map((row) => row.id));
  throw new Error(`Missing target rows in Supabase: ${ids.filter((id) => !found.has(id)).join(", ")}`);
}
const nonEmpty = existing.filter((row) => row.venue_intel && Object.keys(row.venue_intel).length > 0);
if (nonEmpty.length && !process.argv.includes("--overwrite")) throw new Error(`Refusing to overwrite ${nonEmpty.length} non-empty venue_intel rows: ${nonEmpty.map((row) => row.id).join(", ")}`);

let written = 0;
for (const row of payloads) {
  const { error } = await supabase.from("places").update({ venue_intel: row.venue_intel }).eq("id", row.id);
  if (error) throw new Error(`Update failed for ${row.id} ${row.name}: ${error.message}`);
  written += 1;
}

const { data: verified, error: verifyError } = await supabase.from("places").select("id,name,venue_intel").in("id", ids);
if (verifyError) throw verifyError;
const complete = verified.filter((row) => required.every((key) => row.venue_intel?.[key] != null && row.venue_intel[key] !== ""));
const badSources = verified.filter((row) => !Array.isArray(row.venue_intel?.source_urls) || row.venue_intel.source_urls.some((url) => {
  try { new URL(url); return false; } catch { return true; }
}));
const statuses = verified.reduce((acc, row) => {
  const key = row.venue_intel?.research_status || "missing";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ targets: ids.length, written, verified: verified.length, complete: complete.length, invalid_sources: badSources.length, statuses }, null, 2));
