import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const citySources = {
  berlin: ["https://www.siegessaeule.de/en/"],
  bogota: ["https://bogotivo.com/en/queer-in-bogota/"],
  bologna: ["https://static.bolognawelcome.com/immagini/34/41/f0/c9/20250929163508.pdf"],
  boston: ["https://www.meetboston.com/explore/diversity/lgbtq/"],
  brighton: ["https://www.travelgay.com/brighton-gay-bars-clubs"],
  brussels: ["https://thegayagenda.fyi/brussels/"],
  bucharest: ["https://www.gayplaces.co/city/bucharest"],
  budapest: ["https://www.worldredlightdistricts.com/blog/gay-bars-budapest"],
  buenos_aires: ["https://resources.pridetravelers.com/guide/gay-buenos-aires-travel-guide/pdf"],
  busan: ["https://www.travelgay.com/gay-busan"],
  cape_town: ["https://worldrainbowhotels.com/wp-content/uploads/2024/09/Out-and-About-Cape-Town.pdf"],
  caracas: ["https://es.wikipedia.org/wiki/Cultura_LGBT_en_Venezuela"],
  cartagena: ["https://www.gayout.com/south-america/colombia/cartagena/bars"],
  chiang_mai: ["https://www.gay-in-chiangmai.com/news/2026/2026-gay-lgbtq-chiang-mai-update/"],
  chicago: ["https://www.choosechicago.com/articles/lgbtq-plus/"],
  cologne: ["https://magazine.cologne-tourism.com/cologne/queer-cologne-top-tips-for-a-night-out-on-the-town/"],
};

const dressText = {
  casual: "Relaxed casual clothing is normally practical; check any one-off theme before travelling.",
  smart: "Neat smart-casual clothing is the safest practical choice; avoid beachwear where door selection applies.",
  club: "Dance-ready clubwear and photo ID are practical; the event promoter may set additional rules.",
  expressive: "Expressive queer nightlife clothing fits the atmosphere; there is no reliable recurring formal code.",
  fetish: "Read the exact event rules: fetishwear, underwear, nudity or a creative sex-positive look may be required.",
  sauna: "Street clothes are stored on entry; towel or venue-appropriate undress and posted consent rules apply inside.",
  hotel: "There is no hotel-wide dress code; smart casual suits restaurants, bars and evening public spaces.",
  public: "Wear normal weather-appropriate public-space clothing, secure footwear and keep valuables discreet.",
};

const staffText = {
  queer: "The LGBTQ+ focus is explicit and community feedback is broadly welcoming, though individual door and service experiences can vary.",
  positive: "Recent reviews generally describe friendly, helpful service; this remains a community signal rather than a guarantee for every visit.",
  mixed: "Public feedback is mixed, with both welcoming reports and complaints about door or service consistency; check recent reviews.",
  limited: "Recent independent staff and inclusion evidence is too limited for a confident rating; confirm specific needs directly.",
  mainstream: "This is a mainstream venue described as LGBTQ+-friendly, but no dedicated queer staff policy or training evidence was established.",
  caution: "Current feedback raises material safety or service concerns; verify policies and recent community reports before visiting.",
  community: "The organisation has an explicit LGBTQ+ community mission; access can still depend on the individual programme or host venue.",
};

const notes = [];
const add = (id, best, crowd, dress = "casual", staff = "limited", status = "active", extra = []) => {
  notes.push({ id, best, crowd, dress, staff, status, extra });
};

// Berlin 201–225
add(37,"Weekend evenings are the likeliest social peak; earlier visits suit conversation.","Mostly mature gay male regulars with some visitors","casual","mixed");
add(2,"Choose by event; Saturday is busiest, while weekday formats can be easier for newcomers.","Sex-positive Berlin regulars and international visitors across genders and orientations","fetish","mixed","active",["https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html","https://www.visitberlin.de/en/kitkatclub"]);
add(41,"Dinner and weekend brunch are the reliable peaks; book for larger groups.","Friedrichshain locals, queer residents and city visitors","smart","positive");
add(964,"Use only the official event calendar; audience and rules vary radically by night.","Predominantly gay and bisexual men, mixing Berlin regulars and international visitors","fetish","mixed");
add(87,"Best as a quiet Schöneberg base; weekends maximise nearby queer nightlife.","German and international leisure and business hotel guests","hotel","mainstream","verify");
add(7,"Tuesday is traditionally more lesbian/FLINTA-led; Thursday and weekends draw a broader queer crowd.","Alternative queer locals, students, expats and visitors","casual","mixed");
add(29,"No active best night: the former Mutschmann's closed in 2024 and ILOsBAR now occupies the address.","No current crowd; historically fetish-oriented gay men","fetish","limited","closed",["https://berlin.gaycities.com/bars/312124-ilos-bar"]);
add(3,"Friday and Saturday are fullest; weekday evenings are easier for solo conversation.","Gay men, especially bears, daddies and leather-adjacent guests, plus tourists","casual","mixed");
add(44,"Any night works as a hotel base; weekends suit Tiergarten and Schöneberg nightlife.","International leisure, family and business guests","hotel","positive");
add(49,"Friday and Saturday plus drag or karaoke events are the strongest draw.","Mixed-age LGBTQ+ locals, drag audiences and visitors","expressive","positive");
add(962,"Attend only the announced monthly party date; it is not an everyday club.","International gay male circuit crowd with Berlin regulars","fetish","mixed");
add(40,"Daytime coffee and early evening are more reliable than late-night expectations.","Schöneberg locals and LGBTQ+ visitors in a café setting","casual","positive","verify");
add(8,"Late Friday and Saturday suit the iconic crowded bar experience; weekdays are calmer.","Alternative queer locals and international visitors across genders","expressive","mixed");
add(1063,"No active best night: SchwuZ announced closure and should be treated as historical unless a new official venue is confirmed.","No current crowd; historically broad LGBTQ+ communities across genders","club","community","closed",["https://www.rbb24.de/kultur/beitrag/2025/10/berlin-schwuz-club-insolvenz-schliessung.html"]);
add(1102,"Thursday and weekend evenings, plus listed queer-feminist community events.","Queer, trans, nonbinary and neighbourhood regulars with visitors","expressive","positive");
add(42,"Dinner and weekend reservations matter more than a nightlife peak.","Mixed restaurant guests, local couples and Schöneberg visitors","smart","positive");
add(46,"Any night works as a west-Berlin base; confirm the property's Dorint identity before booking.","International leisure and business hotel guests","hotel","mainstream","active");
add(43,"Daytime community use and listed evening events; weekends are social but programme-led.","Kreuzberg queer communities, activists, neighbours and visitors","casual","community");
add(1100,"Friday and Saturday late evening are fullest; earlier hours suit conversation.","Predominantly mature gay men and local regulars with tourists","casual","mixed");
add(1104,"Friday and Saturday cocktails and DJ nights; check the current calendar.","Queer men, creative locals, expats and international visitors","smart","positive");
add(821,"Use daylight and official park hours; historic cruising reports do not establish a safe current night venue.","General park users; no defensible current queer-crowd estimate","public","limited","area");
add(1103,"Drag, karaoke and FLINTA or queer-community events; select by the published calendar.","Broad queer and trans-inclusive crowd with locals and visitors","expressive","positive");
add(38,"No dependable current operating night was found; verify the venue directly.","Historic mature gay male bar crowd; current mix unknown","casual","limited","verify");
add(31,"Weekday mornings are calmer; weekend afternoons and infusion sessions are busier.","Mainstream mixed-gender wellness guests, locals and international spa visitors","casual","mainstream");
add(1106,"Weekend nights and drag-led events are liveliest; earlier visits suit neighbourhood drinks.","Mixed queer Friedrichshain regulars, drag audiences and visitors","expressive","positive");

// Bogotá 226–259
add(1683,"Lunch, dinner and scheduled cultural events; reserve for performances.","Bogotá creatives, students, activists and international visitors","casual","community");
add(1195,"Friday and Saturday drag and club nights; arrive before the late peak.","Young queer Bogotá locals with regional and international visitors","expressive","queer");
add(591,"Only attend against a current dated event listing; recurring operation is unclear.","Alternative music crowd; current LGBTQ+ mix is not verified","club","limited","verify");
add(1202,"Use the current Instagram programme; weekend adult events are the likely peak.","Primarily gay and bisexual men, with locals and visitors","fetish","mixed","verify");
add(1674,"Weekend electronic nights if a current event is confirmed.","Young club crowd; current queer and visitor mix is not independently established","club","limited","verify");
add(1191,"Use busy public streets and organised venues, not an unstaffed 'night route'.", "General Chapinero nightlife users; no credible cruising-crowd ratio","public","limited","area");
add(1200,"Use the current programme; evening and weekend social events are typically strongest.","Gay, bi and curious men, predominantly local with visitors","sauna","mixed");
add(589,"No reliable current operating night was found; verify before travelling.","Historic LGBTQ+ bar crowd; current mix unknown","casual","limited","verify");
add(592,"Weekend afternoon and evening are the likely peak if current operation is confirmed.","Gay and bisexual men, including locals and travellers","sauna","limited","verify");
add(1681,"Early evening and weekend craft-beer periods if current opening is confirmed.","Queer-friendly locals and neighbourhood visitors","casual","limited","verify");
add(1194,"Friday and Saturday after midnight, subject to current Instagram events.","Alternative and queer-friendly Bogotá clubbers with visitors","club","mixed");
add(1673,"Choose by the current DJ calendar; Friday and Saturday are most likely busy.","Electronic-music locals and visitors; queer share varies by event","club","mainstream");
add(587,"Attend only a current El Mozo event; it is a promoter-led experience.","Gay male and broader queer partygoers, largely local with visitors","expressive","queer");
add(1196,"Early evening or a listed music event; verify current operation on Instagram.","Neighbourhood locals, queer guests and visitors","casual","limited","verify");
add(1679,"Any night works as a Chapinero hotel base; weekends are livelier nearby.","Domestic, regional and international hotel guests","hotel","mainstream");
add(1669,"Sunset and weekend DJ sessions, with reservations useful for groups.","Affluent local nightlife crowd and international visitors","smart","mainstream");
add(1678,"Any night as a Chapinero base; confirm check-in and current amenities.","Domestic and international independent hotel guests","hotel","positive");
add(1193,"Weekends for Chapinero nightlife; weekday stays are quieter.","Design-focused domestic and international travellers","hotel","positive", "active", ["https://bogotivo.com/en/queer-in-bogota/"]);
add(1675,"No reliable current bookability was found; verify through a reputable platform.","Historic boutique-hotel guests; current mix unknown","hotel","limited","verify");
add(1672,"Attend a dated Kinder event; Friday and Saturday warehouse parties are the core draw.","Large queer-friendly local crowd with visiting clubbers","expressive","queer");
add(1201,"Daytime and early evening; verify current hours on Instagram.","Chapinero LGBTQ+ locals, friends and visitors","casual","positive","verify");
add(1682,"Daytime coffee and weekend brunch; use the current official branch hours.","Neighbourhood residents, students and visitors","casual","positive");
add(1192,"Daily themed events can start a night; weekends are fuller.","Queer locals and tourists across a mixed adult age range","expressive","positive");
add(1676,"Any night as an apartment-hotel base; weekends suit Chapinero nightlife.","Domestic and international longer-stay guests","hotel","mainstream");
add(1671,"Choose by the official event listing; mainstream crowds vary by artist.","Bogotá music fans and visitors; LGBTQ+ presence is event-dependent","club","mainstream");
add(1670,"Friday and Saturday electronic events; advance tickets reduce uncertainty.","Local electronic-music crowd and international club visitors","club","mainstream");
add(1680,"Weekend brunch from late morning is the strongest published draw.","Queer-friendly locals and visitors; the café is noted for employing trans people","casual","positive","active",["https://bogotivo.com/en/queer-in-bogota/"]);
add(1197,"Weekend afternoon and evening are likely busiest; check current Instagram hours.","Gay and bisexual men, mixing local regulars and visitors","sauna","mixed");
add(1198,"Any night for Zona Rosa access; weekends and major events book earlier.","International, regional and domestic luxury-hotel guests","hotel","positive");
add(1677,"Only book after confirming the current host, address and house rules.","Adult naturist guests; current local-versus-tourist mix is unverified","casual","limited","verify");
add(586,"Saturday is the clearest peak; the multi-room venue also runs active Friday programming.","Huge LGBTQ+ local crowd with domestic and international visitors","expressive","mixed","active",["https://bogotivo.com/en/queer-in-bogota/"]);
add(1199,"Friday and Saturday warehouse events; audience changes by promoter and floor.","Young queer-friendly locals and international club visitors","club","mixed");
add(588,"Early evening is best for drinks before clubs; verify current operation.","Queer Chapinero locals and visitors","casual","limited","verify");
add(590,"Only use a current dated listing; the historic venue status is unclear.","Alternative local club crowd; current LGBTQ+ mix unknown","club","limited","verify");

// Bologna 260–267
add(1468,"Any night as a city base; weekends and fair dates should be booked early.","Domestic and international leisure and business hotel guests","hotel","positive");
add(1472,"Choose by Cassero's cultural and club calendar; weekend parties are busiest.","Broad LGBTQIA+ Bologna community, students, activists and visitors","expressive","community");
add(1465,"Weekend afternoon and evening are the likely peak; confirm membership rules.","Gay and bisexual men, local regulars and visitors","sauna","mixed");
add(1469,"A listed queer event or weekend evening; check social posts for the current programme.","Alternative queer locals, students and allies","expressive","community");
add(1471,"Friday and Saturday club nights; check current membership and event details.","Gay and queer locals with regional visitors","club","mixed");
add(1467,"Lunch is the main peak and queues can form before service; arrive early.","Bologna residents, students and food tourists; not a dedicated queer venue","casual","mainstream");
add(1466,"Weekend afternoon and evening; verify themed days and membership requirements.","Gay and bisexual men across ages, locals and visitors","sauna","mixed");
add(1470,"Use the current men-only fetish programme; nights vary by theme.","Primarily gay and bisexual men, including fetish regulars and visitors","fetish","mixed");

// Boston 268–269
add(1939,"Friday and Saturday late evening plus listed drag, DJ and community events.","Queer women, trans and nonbinary guests, broader LGBTQ+ community and allies","expressive","queer");
add(1940,"Any night as a South End base; weekends suit nearby queer nightlife.","Domestic and international city-break and business guests","hotel","positive");

// Brighton 270–281
add(401,"Cabaret and musical-theatre show nights, especially Friday and Saturday.","LGBTQ+ locals, theatre fans, drag audiences and seaside visitors","expressive","positive");
add(399,"Daylight and busy seafront periods; this is a public beach, not a staffed cruising venue.","General beach users and LGBTQ+ visitors; no credible crowd ratio","public","limited","area");
add(396,"Weekend afternoon and evening are typically busiest; confirm current sessions.","Gay and bisexual men, locals and international visitors","sauna","mixed");
add(394,"Friday and Saturday plus drag, karaoke and cabaret events.","Mixed-age LGBTQ+ Kemptown regulars, allies and tourists","casual","positive");
add(402,"Use the official Revenge ticket calendar; this appears to describe the basement level, not a separate venue.","Young LGBTQ+ clubbers, students, allies and visitors","club","mixed","active",["https://www.tripadvisor.com/Attraction_Review-g186273-d547478-Reviews-Club_Revenge-Brighton_East_Sussex_England.html"]);
add(400,"Weekend evening for bar-hopping; Kemptown is a district rather than one venue.","Broad LGBTQ+ residents, allies and tourists across many venues","casual","limited","area");
add(115,"Friday and Saturday after about 23:00; weekday cabaret suits an earlier visit.","Gay men, broader LGBTQ+ locals and a substantial visitor crowd","expressive","positive");
add(398,"Choose by the artist calendar; queer presence depends on the event.","Brighton music locals, students and visitors","club","mainstream");
add(393,"Monday, Thursday, Friday and Saturday official club nights; pre-book for major events.","Young LGBTQ+ locals, students, allies and tourists","club","mixed","active",["https://revenge.co.uk/","https://wanderlog.com/place/details/1462427/revenge"]);
add(116,"Friday and Saturday late evening; weekday drinks are calmer.","Mostly gay men and Kemptown regulars with tourists","casual","mixed");
add(395,"Cabaret-led evenings and weekends; verify the current show schedule.","LGBTQ+ locals, drag audiences and visitors across ages","expressive","positive");
add(397,"Choose by the current electronic-music listing; LGBTQ+ presence varies by promoter.","Brighton clubbers, students and visiting music fans","club","mainstream");

// Brussels 282–293
add(205,"Daytime terrace and weekend evenings; tables may be harder to find in good weather.","Mixed LGBTQ+ locals, city-centre workers and international visitors","casual","positive");
add(201,"Friday and Saturday drag shows; the tiny room fills before performances.","Mixed-age queer locals, drag fans and tourists","expressive","positive","active",["https://www.thegayagenda.fyi/brussels/businesses/chez-maman/"]);
add(207,"Choose by the techno calendar; Saturday and special events are core.","Brussels electronic-music crowd, queer guests and international visitors","club","mixed");
add(203,"Late weekend nights if a current event is confirmed.","Predominantly gay and bisexual men, locals and visitors","fetish","limited","verify");
add(202,"Early evening or weekends for the classic pub atmosphere.","Mature gay regulars, mixed LGBTQ+ guests and tourists","casual","positive");
add(95,"Weekend late evening; verify current operation because official information is sparse.","Gay men, local regulars and international visitors","casual","limited","verify");
add(210,"Sunday Flash Club and currently advertised nights; Le You branding appears historical.","Young mixed LGBTQ+ and ally club crowd","club","mixed","verify");
add(209,"No dependable current operating night was found; verify directly.","Historic gay male bar crowd; current mix unknown","casual","limited","verify");
add(204,"Choose by the official event calendar; the church setting hosts mainstream and private formats.","Affluent Brussels clubbers and visitors; queer share varies by event","smart","mainstream");
add(206,"Use the official men-only programme; fetish and cruise nights differ.","Gay and bisexual men, including local regulars and visitors","fetish","mixed");
add(96,"Weekend late evening if a current official listing confirms operation; the stored link is unrelated.","Historic young gay male crowd; current mix unverified","club","limited","verify");
add(208,"Wednesday through weekend community events; select by the current calendar.","Young queer, trans and nonbinary locals with visitors","expressive","community");

// Bucharest 294–302
add(841,"Any night as a central hotel base; weekends and business dates can be busier.","Romanian and international leisure and business guests","hotel","mainstream","verify");
add(755,"Use daylight and normal park routes; historic night references do not verify a safe cruising venue.","General park users; no credible current queer-crowd estimate","public","limited","area");
add(752,"Early evening and weekends if current hours are confirmed.","LGBTQ+ Bucharest locals and visitors in a small bar setting","casual","limited","verify");
add(757,"Morning and daytime coffee peaks; not a dedicated queer venue.","Coffee-focused locals, remote workers and tourists","casual","positive");
add(750,"No reliable current listing was found; verify venue identity and address.","Historic LGBTQ+ club crowd; current mix unknown","club","limited","verify");
add(754,"Use the current Soho programme; adult cruise formats may differ from standard sauna access.","Gay, bi, trans, queer and curious adults, primarily men","fetish","mixed");
add(753,"Friday evening and weekends are the likely social peak; check current hours.","Gay, bi, trans, queer and curious adults, primarily men","sauna","mixed","active",["https://saunasoho.ro/"]);
add(749,"Recurring gay club nights, usually weekend-led; confirm the current venue and date.","Young gay and broader LGBTQ+ locals with visitors","club","mixed","active",["https://www.gayplaces.co/city/bucharest/club/q-club"]);
add(751,"No dependable current operation was found; historic Facebook information is insufficient.","Historic gay male bar crowd; current mix unknown","casual","limited","verify");

// Budapest 303–308
add(457,"Friday and Saturday, with the established midnight drag show as a focal point.","Mainstream gay male and broader LGBTQ+ locals, expats and tourists","club","mixed");
add(492,"No reliable current identity was confirmed; the stored Facebook link may be stale.","Historic mixed LGBTQ+ café-club crowd; current mix unknown","casual","limited","verify");
add(494,"No dependable current operating signal was found; verify on the venue's latest social channel.","Historic gay bar regulars and visitors","casual","limited","verify");
add(493,"Early evening and weekdays for conversation; weekends are livelier.","Gay male regulars, mixed LGBTQ+ guests and tourists","casual","positive","active",["https://www.tripadvisor.co.uk/Restaurant_Review-g274887-d10193969-Reviews-Habrolo_Bisztro-Budapest_Central_Hungary.html"]);
add(459,"Friday and weekend periods are commonly busiest; themed Xplore sessions change the audience.","Gay and bisexual men across ages, with some mixed-gender themed access","sauna","caution","current_caution",["https://www.tripadvisor.com/Attraction_Review-g274887-d28126113-Reviews-Magnum_Sauna-Budapest_Central_Hungary.html"]);
add(458,"Early evening and weekdays for drinks; Friday and Saturday are fuller.","Gay men, broader LGBTQ+ locals and international tourists","casual","positive");

// Buenos Aires 309–323
add(797,"Friday and Saturday after 01:00; the open-bar club runs very late.","Large LGBTQ+ Buenos Aires crowd with domestic and international visitors","club","mixed","active",["https://wanderlog.com/place/details/2385277/amerika"]);
add(838,"Use daylight and official park activity; do not treat an unstaffed cruising listing as a safe venue.","General park users; no credible current queer-crowd ratio","public","limited","area");
add(420,"Saturday after 01:00 for the signature stage show and dance party.","Gay men, broader queer locals and international visitors","expressive","positive","active",["https://wanderlog.com/es/place/details/4333701/club-69"]);
add(1133,"Only attend against a current dated event; the club's recurring status is unclear.","Alternative electronic crowd; current queer mix unknown","club","limited","verify");
add(1131,"Listed cultural, theatre and party events; weekends are the busiest social period.","Broad LGBTQ+ community across genders, locals and visitors","expressive","community");
add(421,"Use the current Nix event announcement; it is a party series rather than a daily venue.","Young queer Buenos Aires party crowd with visitors","expressive","queer");
add(1130,"Attend a current Puerca or Plop-linked event; usually weekend and late-night.","Young LGBTQ+ locals, pop-party fans and tourists","expressive","queer");
add(1129,"Use the current Jolie event calendar; weekend parties are the likely peak.","Mixed queer locals and visitors across genders","expressive","queer");
add(418,"Friday and Saturday late night if current operation is confirmed.","Gay male and broader LGBTQ+ clubbers, mostly local with visitors","club","mixed","verify");
add(422,"Weekend afternoon and evening; confirm current hours and facilities.","Gay and bisexual men, locals and visitors","sauna","mixed");
add(1132,"Choose by the current mainstream event calendar; LGBTQ+ presence varies by night.","Young Buenos Aires club crowd and tourists","club","mainstream");
add(416,"Thursday through Saturday late evening for a fuller Palermo bar.","Young queer men, broader LGBTQ+ locals and international visitors","expressive","positive");
add(417,"The stored link points to Homosapiens, so no current café visit should be planned without correction.","Historic café crowd; current identity unknown","casual","limited","verify");
add(836,"Any night as a Palermo boutique base; verify current direct booking information.","International couples and independent city travellers","hotel","positive");
add(419,"Late weekend adult hours if a current listing confirms operation.","Primarily gay and bisexual men, locals and visitors","fetish","limited","verify");

// Busan 324–337
add(1775,"Any night as a Seomyeon base; weekends are livelier nearby.","Korean domestic and international leisure travellers","hotel","positive");
add(1764,"Late evening and weekends if a current listing confirms operation.","Mostly local gay men with some international visitors","casual","limited","verify");
add(1772,"Late evening and weekends; confirm the current address and social channel.","Local gay men, expats and visitors","casual","limited","verify");
add(1765,"Any night as a Seomyeon budget-hotel base; weekends can be noisier.","Korean domestic and international budget travellers","hotel","mixed");
add(1776,"No reliable current bookability under this exact name was found; verify possible rebranding.","Historic hotel guests; current mix unknown","hotel","limited","verify");
add(1773,"Any night as a central business and leisure base.","Korean domestic and international business and leisure guests","hotel","positive");
add(1768,"Any night for the spa-oriented hotel stay; confirm current booking and policies.","Korean domestic travellers and international visitors","hotel","mixed");
add(1770,"Late evening, especially Friday and Saturday, if current operation is confirmed.","Mostly local gay men with some travellers","casual","limited","verify");
add(1774,"Weekends and summer beach periods; reserve spa and dining in advance.","Korean domestic resort guests and international leisure travellers","hotel","positive");
add(1767,"Weekends for Haeundae atmosphere; weekdays are calmer for a luxury stay.","Affluent Korean and international leisure and business guests","hotel","positive");
add(1771,"Daytime coffee and weekend cultural visits; not a dedicated queer venue.","Busan locals, design visitors and tourists","casual","positive");
add(1763,"No reliable current operating evidence was found; verify locally before travelling.","Historic local gay bar crowd; current mix unknown","casual","limited","verify");
add(1769,"Late Friday and Saturday if a current listing confirms operation.","Young local gay men and visiting clubbers","club","limited","verify");
add(1766,"Around 22:00–23:00, when reviews report the room filling; weekends are safest.","Local gay men, English-speaking visitors and expats","casual","positive","active",["https://www.travelgay.com/venue/tool"]);

// Cape Town 338–355
add(666,"Dinner-and-show nights and weekend drag events; verify the current address before travelling.","LGBTQ+ locals, drag fans, celebrations and tourists","expressive","positive","verify");
add(1317,"Friday and Saturday evening; daytime meals are calmer.","De Waterkant LGBTQ+ regulars, residents and international tourists","casual","positive");
add(1316,"Use the current Sgt Pepper programme; the stored Tai Pan name may be outdated.","Mainstream Long Street club crowd with event-dependent queer presence","club","mixed","verify");
add(667,"Weekend evenings and karaoke; recent reviews say quieter nights can be sparse.","LGBTQ+ Cape Town regulars and international visitors","casual","mixed","active",["https://www.gayout.com/africa/south-africa/cape-town/bars/crew-bar-139"]);
add(1303,"Any night as a De Waterkant base; weekends put guests closest to queer nightlife.","Domestic and international independent leisure travellers","hotel","positive");
add(1311,"No dependable current operation was found; verify the name, address and social channel.","Historic local lounge crowd; current LGBTQ+ mix unknown","smart","limited","verify");
add(1312,"Only attend against a current dated event listing; recurring operation is unclear.","Alternative Cape Town club crowd; current queer mix unknown","club","limited","verify");
add(1310,"Use the current promoter announcement; this appears event-led rather than nightly.","Afrikaans and broader LGBTQ+ party crowd with regional visitors","expressive","queer","verify");
add(1314,"Weekends for Sea Point access; weekdays provide a quieter boutique stay.","Domestic and international leisure couples and independent travellers","hotel","positive");
add(1305,"Friday and Saturday cocktails and live-DJ nights; reserve for groups.","Stylish mixed Cape Town locals and visitors; queer-friendly but not queer-only","smart","positive");
add(1306,"Daytime dining and weekend brunch; not a dedicated queer venue.","Blouberg residents, families and visitors","casual","positive");
add(1309,"Only attend against a current event announcement; no reliable regular schedule was found.","Historic LGBTQ+ party crowd; current mix unknown","club","limited","verify");
add(1308,"No dependable current venue identity was confirmed; verify directly.","Historic local bar crowd; current LGBTQ+ mix unknown","casual","limited","verify");
add(1304,"Any night as a De Waterkant apartment-hotel base; rooftop periods are busier at sunset.","Domestic and international leisure and business guests","hotel","positive");
add(1315,"Weekends for De Waterkant nightlife and rooftop activity; book dining ahead.","International boutique-hotel guests and Cape Town locals using public venues","hotel","positive");
add(668,"Friday and Saturday late night; verify current official social posts.","LGBTQ+ locals across genders and international visitors","expressive","mixed");
add(670,"Use only a current official listing; the older cruise-club identity may not be active.","Historically gay and bisexual men, locals and visitors","fetish","limited","verify");
add(1313,"No current operation was independently confirmed; verify before a special journey.","Historic health-café crowd; current identity unknown","casual","limited","verify");

// Caracas 356–360
add(923,"No dependable recent operating schedule was found; verify by current social post.","Historically gay and bisexual men, mostly local with some visitors","sauna","limited","verify");
add(922,"Only attend against a current dated X post or local confirmation.","Historic LGBTQ+ Caracas club crowd; current mix unknown","club","limited","verify");
add(921,"Only attend against a current dated announcement; security conditions should be checked locally.","Historic LGBTQ+ local club crowd; current mix unknown","club","caution","verify");
add(924,"Attend a confirmed workshop, support session or community event rather than treating it as a daily café.","LGBTQ+ activists, community members and programme participants","casual","community","verify");
add(925,"Use busy public areas in daylight or established nightlife venues; this is not a staffed queer venue.","General Sabana Grande users; no credible current queer-crowd estimate","public","limited","area");

// Cartagena 361–369
add(1236,"Thursday through Saturday after 23:00, subject to a current listing.","LGBTQ+ Cartagena locals with domestic and international tourists","club","mixed","active",["https://www.gayout.com/south-america/colombia/cartagena/bars"]);
add(1225,"Attend a confirmed community programme, legal-support activity or cultural event.","LGBTQ+ activists, community members and programme participants","casual","community");
add(1230,"Friday and Saturday after 23:30 are busiest; weekdays can be much quieter.","Largely local LGBTQ+ crowd with a noticeable visitor share","club","mixed","active",["https://wanderlog.com/place/details/6698995/gabanna-bar-club-cartagena"]);
add(1249,"Any night for an old-city luxury stay; weekends and weddings book earlier.","Affluent domestic, regional and international leisure guests","hotel","positive");
add(1227,"Any night for Bocagrande access; weekends and holiday periods are busier.","Domestic and international leisure, family and business guests","hotel","positive");
add(1243,"Dinner and weekend evening if a current Facebook update confirms operation.","Local diners and tourists; queer-friendliness is reported but not exclusive","smart","limited","verify");
add(1237,"Early evening before clubs; verify the current address and opening hours.","Cartagena locals and LGBTQ+ visitors in a relaxed bar setting","casual","limited","verify");
add(1235,"Weekend late evening; verify the current identity because the stored domain uses the former Geminis name.","Mostly local gay and bisexual men with visitors","fetish","mixed","verify");
add(1241,"Any night for an old-city luxury stay; restaurant and spa reservations matter on weekends.","Affluent domestic and international leisure guests","hotel","positive");

// Chiang Mai 370–377
add(1511,"Arrive before the nightly show; recent 2026 reviews report some very quiet performances.","Gay male tourists, local admirers and adult show audiences","smart","mixed","active",["https://www.gayout.com/asia-aus/thailand/chiang-mai/bars/adam-s-apple-club-2092"]);
add(1507,"Late evening, especially Friday and Saturday, in the Night Bazaar area.","Local gay men, expats and international tourists","casual","positive");
add(1505,"Any night for the gay-men guesthouse; weekends make the social areas livelier.","Gay male domestic and international travellers","hotel","positive","active",["https://www.tripadvisor.com.sg/Hotel_Review-g293917-d1792078-Reviews-Club_One_Seven_Chiang_Mai-Chiang_Mai.html"]);
add(1508,"Weekend afternoon into evening is the strongest social period.","Gay and bisexual men, locals, expats and hotel visitors","sauna","positive");
add(1509,"Before the advertised show, particularly on weekends.","Gay male locals and tourists in an adult show-bar setting","smart","mixed");
add(1510,"No dependable current independent reports were found; confirm operation before travelling.","Historic gay male bar crowd; current mix unknown","casual","limited","verify");
add(1504,"Nightly drag shows; the venue is reported packed most evenings, so arrive early.","LGBTQ+ locals, expats, tourists and drag audiences","expressive","positive","active",["https://www.gay-in-chiangmai.com/news/2026/2026-gay-lgbtq-chiang-mai-update/"]);
add(1506,"Friday and Saturday after 22:00 for a mainstream Chiang Mai club night.","Young Thai locals, students, expats and tourists; queer-friendly rather than queer-only","club","mainstream");

// Chicago 378–389
add(503,"Late Friday and Saturday for country-to-pop dancing; verify current official posts.","Gay men, country-dance regulars and Northalsted visitors","casual","mixed");
add(954,"Weekend nights and advertised drag or dance events.","Black LGBTQ+ South Side regulars, broader queer guests and visitors","expressive","mixed");
add(437,"Friday and Saturday after midnight; advance tickets help on major DJ nights.","Young gay men, broader queer clubbers and visitors","club","mixed","active",["https://www.sluurpy.com/en/chicago/restaurant/3819904/hydrate/reviews"]);
add(477,"Thursday specials, drag-viewing events and Friday or Saturday dancing.","Young gay and broader LGBTQ+ locals with a large visitor share","expressive","mixed","active",["https://www.tripadvisor.com.mx/Attraction_Review-g35805-d563918-Reviews-Roscoe_s_Tavern_Gay_Bar-Chicago_Illinois.html"]);
add(476,"Friday and Saturday pop nights; the compact room fills quickly.","Young, gender-diverse queer locals and Northalsted visitors","expressive","mixed");
add(436,"Show-tunes and Drag Race events or weekend evenings; free entry can create a long line.","Large gay male and broader LGBTQ+ crowd, locals and tourists","casual","positive");
add(957,"Choose by the electronic-music calendar; queer presence varies but is historically strong.","Chicago house and electronic locals, queer clubbers and visitors","club","mixed");
add(438,"Late Friday and Saturday, Market Days, Pride and IML are exceptional capacity peaks.","Gay and bisexual men across ages, locals and international visitors","sauna","mixed","active",["https://www.reddit.com/r/chicagogaybros/comments/1szdzex/my_review_of_steamworks/"]);
add(959,"Weekend late evening; weekdays suit conversation in the small room.","Lesbian, queer women, gay men and mixed LGBTQ+ neighbourhood regulars","casual","positive");
add(955,"Early evening cocktails or weekend date-night periods.","LGBTQ+ Northalsted locals, couples and visitors","smart","positive");
add(958,"Sports events, karaoke and weekends for a relaxed community crowd.","Mixed-age gay men, sports fans, neighbourhood regulars and visitors","casual","positive");
add(956,"The stored website belongs to an unrelated New York venue; verify whether Wang's Chicago still operates.","Historic cocktail-bar crowd; current LGBTQ+ mix unknown","smart","limited","verify");

// Cologne 390–400
add(245,"Choose by the concert or queer-party calendar; weekend events vary widely.","Cologne music locals, students and visitors; queer share is event-dependent","club","mainstream");
add(101,"Choose by the artist or Chrome queer-event calendar; major nights sell ahead.","Electronic-music locals, international club visitors and event-dependent queer crowds","club","mixed");
add(237,"Choose by the current concert or party; rules describe dress as casual and event-appropriate.","Ehrenfeld music locals, students and visitors","club","mainstream","active",["https://www.clubbahnhofehrenfeld.de/info/hausordnung"]);
add(1828,"Use daylight and ordinary park routes; historic cruising references do not verify a staffed or safe venue.","General neighbourhood green-space users; no credible current queer ratio","public","limited","area");
add(243,"Late weekend hours and listed fetish events; verify current Facebook operation.","Gay and bisexual men, local regulars and visitors","fetish","mixed","active",["https://www.travelgay.com/venue/deck-5"]);
add(236,"Any evening, with karaoke, DJs and Pride periods especially packed.","Predominantly gay men plus lesbians, other queer guests and tourists","expressive","mixed","active",["https://wanderlog.com/place/details/452552/die-mumu"]);
add(1826,"Any night as a social hostel base; weekends and concerts are livelier.","Young international backpackers, students and independent travellers","hotel","positive");
add(102,"Friday and Saturday late evening; the tiny bar is often already full on ordinary weekends.","Predominantly gay men with mixed LGBTQ+ locals and international visitors","casual","positive","active",["https://www.cologne-tourism.com/arts-culture/sights/detail/schaafenstrasse"]);
add(239,"Attend the published Sunday after-hours date; it is a recurring party, not a daily club.","Gay male circuit and house crowd, locals and international visitors","club","mixed");
add(1822,"Any night for Belgian Quarter access; Pride and trade-fair dates book early.","German and international leisure and business hotel guests","hotel","positive");
add(1825,"Any night for a design-led city stay; weekends and events make public spaces livelier.","International leisure guests, creative business travellers and Cologne locals using events","hotel","positive");

const expectedIds = notes.map((note) => note.id);
if (notes.length !== 200 || new Set(expectedIds).size !== 200) {
  throw new Error(`Expected 200 unique notes, got ${notes.length}/${new Set(expectedIds).size}`);
}

const { data: places, error: readError } = await supabase
  .from("places")
  .select("id,name,city,type,link,venue_intel")
  .in("id", expectedIds);
if (readError) throw readError;
if (places.length !== 200) {
  const found = new Set(places.map((row) => row.id));
  throw new Error(`Missing target rows: ${expectedIds.filter((id) => !found.has(id)).join(", ")}`);
}

const placeById = new Map(places.map((place) => [place.id, place]));
const badStoredLinks = new Set([96, 417, 956]);
const now = new Date().toISOString();

const queueFor = (place, note) => {
  if (note.status === "closed") return "There is no current queue because available evidence indicates that this venue is closed.";
  if (note.status === "verify") return "No reliable current wait pattern was found because operation or identity needs verification; do not make a special trip without a dated confirmation.";
  if (note.status === "area") return "There is no venue queue: this is a public area rather than a staffed LGBTQ+ business.";
  if (place.type === "hotel") return "Check-in is normally straightforward, with possible waits at the standard afternoon peak, during large events or before rooms are ready.";
  if (place.type === "sauna") return "Entry is normally a check-in rather than a club line; lockers or capacity can create short waits during weekend peaks.";
  if (place.type === "cruise_club") return "Entry time and capacity depend on the themed programme; arrive near opening and confirm the current door rules.";
  if (place.type === "club") return "No dependable average wait is published. Popular weekend or headline events can queue after the late-night peak, so advance tickets and earlier arrival help.";
  return "Usually walk-in, with possible waits for seating or bar service during weekend and event peaks; no dependable average is published.";
};

const bestFor = (note) => {
  if (note.status === "closed") return note.best;
  if (note.status === "verify") return `${note.best} Treat historic listings as context, not proof of current operation.`;
  if (note.status === "area") return note.best;
  return `${note.best} Check the same-day official calendar because schedules can change.`;
};

const statusFor = (status) => ({
  active: "researched_external_sources",
  verify: "researched_verify_status",
  closed: "researched_closed",
  area: "researched_public_area_caution",
  current_caution: "researched_current_caution",
}[status] || "researched_external_sources");

const payloads = notes.map((note) => {
  const place = placeById.get(note.id);
  const source_urls = [
    ...(!badStoredLinks.has(place.id) && /^https?:\/\//.test(place.link || "") ? [place.link] : []),
    ...(citySources[place.city] || []),
    ...note.extra,
  ].filter((url, index, list) => list.indexOf(url) === index);
  return {
    id: place.id,
    name: place.name,
    venue_intel: {
      queue_wait: queueFor(place, note),
      best_nights: bestFor(note),
      crowd_mix: `${note.crowd}; no credible fixed local-versus-tourist percentage is published.`,
      dress_code: dressText[note.dress],
      staff_inclusivity: staffText[note.staff],
      source_urls,
      research_status: statusFor(note.status),
      updated_at: now,
    },
  };
});

const required = ["queue_wait","best_nights","crowd_mix","dress_code","staff_inclusivity","source_urls","research_status","updated_at"];
for (const row of payloads) {
  for (const key of required) {
    const value = row.venue_intel[key];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) throw new Error(`Missing ${key} for ${row.id} ${row.name}`);
  }
  for (const key of ["queue_wait","best_nights","crowd_mix","dress_code","staff_inclusivity"]) {
    if (row.venue_intel[key].length > 320) throw new Error(`${key} too long for ${row.id}: ${row.venue_intel[key].length}`);
  }
  for (const url of row.venue_intel.source_urls) new URL(url);
}

const nonEmpty = places.filter((row) => row.venue_intel && Object.keys(row.venue_intel).length > 0);
if (nonEmpty.length) throw new Error(`Refusing to overwrite ${nonEmpty.length} non-empty rows: ${nonEmpty.map((row) => row.id).join(", ")}`);

let written = 0;
for (let start = 0; start < payloads.length; start += 10) {
  const chunk = payloads.slice(start, start + 10);
  const results = await Promise.all(chunk.map((row) => supabase.from("places").update({ venue_intel: row.venue_intel }).eq("id", row.id)));
  const failedIndex = results.findIndex((result) => result.error);
  if (failedIndex >= 0) {
    const row = chunk[failedIndex];
    throw new Error(`Update failed for ${row.id} ${row.name}: ${results[failedIndex].error.message}`);
  }
  written += chunk.length;
}

const { data: verified, error: verifyError } = await supabase
  .from("places")
  .select("id,name,venue_intel")
  .in("id", expectedIds);
if (verifyError) throw verifyError;
const complete = verified.filter((row) => required.every((key) => row.venue_intel?.[key] != null && row.venue_intel[key] !== ""));
const invalidSources = verified.filter((row) => !Array.isArray(row.venue_intel?.source_urls) || row.venue_intel.source_urls.some((url) => {
  try { new URL(url); return false; } catch { return true; }
}));
const statuses = verified.reduce((acc, row) => {
  const status = row.venue_intel?.research_status || "missing";
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ targets: expectedIds.length, written, verified: verified.length, complete: complete.length, invalid_sources: invalidSources.length, statuses }, null, 2));
