import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");

function event({ name, city, date, endDate = date, location, description, link, vibe, vibe_tags, intel }) {
  return {
    name, city, date, start_date: date, end_date: endDate, location, description, link, ticket_url: link,
    vibe, vibe_tags, event_status: "scheduled",
    event_intel: { ...intel, source_urls: [link], research_status: "verified_source", updated_at: new Date().toISOString() },
  };
}

const events = [
  event({
    name: "Flip Phone XXL: Halloween", city: "minneapolis", date: "2026-10-30",
    location: "First Avenue, 701 North 1st Avenue, Minneapolis, MN 55403, United States",
    link: "https://www.axs.com/events/1601812/flip-phone-xxl-halloween-tickets",
    vibe: "18+ Halloween drag spectacular and dance party", vibe_tags: ["drag", "electronic", "social"],
    description: "First Avenue's Flip Phone XXL: Halloween brings Crystal Methyd, winner of RuPaul's Drag Race All Stars, to Minneapolis with DJ Larry Peace, host Luna Muse and a large local drag cast: Sasha Cassadine, Julia Starr, Queen Onya, Rose Nylon, Myster’eo Cassadine, Iconica, Carmen Monoxide, Kat Wilderness and Hunky Dory. Doors open at 21:00; this event is 18+ with valid government ID.",
    intel: { entry_wait: "Doors open at 21:00 and valid government ID is required for this 18+ event; arrive early for the Halloween-night ticket scan and age check.", best_arrival: "Aim to enter soon after the published 21:00 doors if you want to see the complete cast and secure your place before the room fills.", crowd_mix: "A Minneapolis Halloween crowd centred on Crystal Methyd fans, Flip Phone regulars, local drag supporters and late-night dance-floor guests.", dress_code: "Costume and Halloween drag are especially fitting for this edition; choose footwear that works for a long standing-and-dancing night at First Avenue.", host_inclusivity: "The show is built around queer drag artists and a locally rooted cast; contact First Avenue directly before travel for accessibility or mobility arrangements." },
  }),
  event({
    name: "QTS: Chicago", city: "chicago", date: "2026-11-21",
    location: "The Jackhammer Chicago, 6406 North Clark Street, Chicago, IL 60626, United States",
    link: "https://ra.co/events/2518018",
    vibe: "21+ queer trance and progressive-house club night", vibe_tags: ["electronic", "underground", "social"],
    description: "QTS (pronounced ‘cuties’) takes over The Jackhammer Chicago for one night of queer trance and high-energy club cuts. Farius leads the announced line-up, with a second act still TBA; the promoter describes two rooms of progressive house and trance from 22:00 to 05:00. Entry is 21+ and listed at $15–25.",
    intel: { entry_wait: "Bring government photo ID: QTS is listed as 21+ and runs 22:00–05:00, so entry checks are part of the published door conditions.", best_arrival: "Arrive close to the 22:00 opening if you want time to experience both rooms before the late-night peak; the listed price range is $15–25.", crowd_mix: "A dance-floor-first audience for Farius, progressive house and trance, explicitly framed by the promoter as a queer collective rather than a spectator show.", dress_code: "No formal dress rule is published. Wear clothes and shoes you can move in for a seven-hour, two-room club night, and leave space for coat-check planning in November.", host_inclusivity: "QTS explicitly presents the night as queer trance and asks guests to leave ego at the door; direct questions can be sent to the promoter through the event listing." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "phoenix", date: "2027-03-09",
    location: "Arizona Financial Theatre, 400 West Washington Street, Phoenix, AZ 85003, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-phoenix-arizona-03-09-2027/event/190064B2F70F8976",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "RuPaul's Drag Race Werq The World 2027 Tour reaches Phoenix's Arizona Financial Theatre on 9 March at 20:00. The official Ticketmaster listing confirms the date and venue; Arizona Financial Theatre publishes mobile entry and a bag-search policy for arrivals.",
    intel: { entry_wait: "The published showtime is 20:00. Arizona Financial Theatre uses mobile entry and searches bags, so have your mobile ticket ready before joining the queue.", best_arrival: "Arrive well before 20:00 for bag screening and downtown parking; the adjacent Adams Street garage is cashless according to the venue.", crowd_mix: "A large Phoenix audience of Drag Race fans, queer community groups, pop-culture visitors and touring-production regulars.", dress_code: "Expressive drag-inspired looks suit a Werq The World theatre date; keep bags within the venue's published 12 × 6 × 12 inch limit.", host_inclusivity: "The tour is explicitly built around queer drag performance. Arizona Financial Theatre publishes venue-access information and should be contacted directly for specific accommodations." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "dallas", date: "2027-02-27",
    location: "The Pavilion at Toyota Music Factory, 300 West Las Colinas Boulevard, Irving, TX 75039, United States",
    link: "https://www.ticketmaster.com/rupaul-s-drag-race-werq-the-world-tour-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "The 2027 Werq The World tour plays The Pavilion at Toyota Music Factory in Irving, serving the Dallas–Fort Worth area, on 27 February at 20:00. Ticketmaster lists separate VIP Club and Fast Lane products, neither of which is a concert ticket.",
    intel: { entry_wait: "The Ticketmaster listing sets an 20:00 start. The Pavilion is in Irving, so allow additional Dallas–Fort Worth travel time before ticket scanning.", best_arrival: "Arrive early if using a separately sold VIP Club or Fast Lane product; those add-ons do not replace admission to the performance.", crowd_mix: "A regional Dallas–Fort Worth crowd of Drag Race followers, queer community groups and fans travelling to Irving for the large touring show.", dress_code: "A high-production drag tour invites bold styling, while comfortable shoes help with the walk through Toyota Music Factory and the flexible pavilion layout.", host_inclusivity: "The event centres queer drag performance; The Pavilion publishes accessibility information and should be contacted directly for seating or mobility arrangements." },
  }),
  event({
    name: "Ginger Minj and Jujubee: Licked: For Gay", city: "richmond", date: "2027-03-18", endDate: "2027-03-20",
    location: "Robert B. Moss Theatre, 1300 Altamont Avenue, Richmond, VA 23230, United States",
    link: "https://rtriangle.org/experience/",
    vibe: "queer drag parody and cabaret theatre", vibe_tags: ["drag", "cultural", "social"],
    description: "Richmond Triangle Players presents Ginger Minj and Jujubee in Licked: For Gay from 18–20 March 2027 at the Robert B. Moss Theatre. The explicitly queer drag parody of Wicked places a confessional Glinda and Jujubee's Elphaba in the Ozdust Barroom, with music reimagined from Ariana Grande songs.",
    intel: { entry_wait: "The production runs across three nights at the 90-seat Robert B. Moss Theatre; choose the desired performance date and arrive early for ticket collection or door procedures.", best_arrival: "This is an intimate Scott's Addition cabaret venue rather than a drop-in club event, so aim to be seated before the advertised performance begins.", crowd_mix: "A close-room audience of Ginger Minj and Jujubee fans, queer theatre-goers, drag devotees and Richmond Triangle Players regulars.", dress_code: "Camp, Wicked references and dressy-casual cabaret looks all fit the premise; practical layers work well in an intimate theatre setting.", host_inclusivity: "Richmond Triangle Players is an LGBTQ+-rooted professional theatre company, and this production is explicitly a queer drag parody; contact RTP directly for access needs." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "orlando", date: "2027-02-20",
    location: "Hard Rock Live Orlando, 6050 Universal Boulevard, Orlando, FL 32819, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "RuPaul's Drag Race Werq The World 2027 Tour comes to Hard Rock Live Orlando on 20 February at 20:00. Ticketmaster also lists a separately sold pre-show VIP meet-and-greet upgrade for this Universal CityWalk date.",
    intel: { entry_wait: "The official listing gives an 20:00 start; factor in Universal CityWalk arrival and venue security before joining the Hard Rock Live entry queue.", best_arrival: "Use an early arrival window if you hold the separately sold pre-show VIP meet-and-greet upgrade, which does not include admission by itself.", crowd_mix: "A destination-Orlando crowd mixing Drag Race fans, local queer communities, theme-park visitors and groups travelling in for a Saturday production.", dress_code: "Stage-tour glamour fits the room; comfortable footwear is useful for walking through the Universal CityWalk complex before and after the show.", host_inclusivity: "Werq The World is a queer drag-centred production. Contact Hard Rock Live Orlando directly for current accessible-entry and seating arrangements." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "austin", date: "2027-02-23",
    location: "ACL Live at the Moody Theater, 310 West Willie Nelson Boulevard, Austin, TX 78701, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "The 2027 Werq The World tour plays Austin's ACL Live at the Moody Theater on 23 February at 20:00. Ticketmaster confirms the Tuesday date and downtown Austin venue.",
    intel: { entry_wait: "The scheduled curtain is 20:00. Arrive with enough time for downtown Austin traffic, ticket scanning and the Moody Theater's theatre entry process.", best_arrival: "Aim for the early part of the entry window: this is a fixed-time touring stage production, not a late-entry nightclub event.", crowd_mix: "An Austin audience of Drag Race fans, queer community groups, pop-culture visitors and theatre-goers drawn to a large live production.", dress_code: "Bold drag-inspired styling suits the show, while breathable layers are practical for a long seated indoor performance in the downtown entertainment district.", host_inclusivity: "The production centres queer drag artists; ask ACL Live directly about accessible seating, mobility routes and companion-ticket options." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "houston", date: "2027-02-26",
    location: "713 Music Hall, 401 Franklin Street, Houston, TX 77201, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "RuPaul's Drag Race Werq The World 2027 Tour arrives at Houston's 713 Music Hall on 26 February at 20:00. The official listing includes optional Fast Lane, pre-show pass, meet-and-greet, parking and Kashmere Lounge products, all sold separately from concert admission.",
    intel: { entry_wait: "The 713 Music Hall date starts at 20:00. Keep your show ticket separate from any Fast Lane, pre-show, parking, lounge or meet-and-greet confirmation.", best_arrival: "Arrive early if you purchased an upgrade, since the official listing explicitly marks these products as not being concert tickets.", crowd_mix: "A Houston live-music crowd of Drag Race devotees, queer groups, visitors and fans using the post-show entertainment district nearby.", dress_code: "This is a high-production drag show in a music-hall setting, so expressive looks and shoes comfortable for standing or venue navigation both work well.", host_inclusivity: "Werq The World is queer drag-led; contact 713 Music Hall before travel for its current accessibility, seating and entry-support details." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "denver", date: "2027-03-03",
    location: "Mission Ballroom, 4242 Wynkoop Street, Denver, CO 80216, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "Denver's Werq The World stop is at Mission Ballroom on 3 March 2027, with a 19:30 performance listed by Ticketmaster. It follows the city's December holiday-drag programming with a distinct spring arena-scale production.",
    intel: { entry_wait: "Ticketmaster lists a 19:30 start, earlier than several other Werq dates. Allow time for RiNo arrival, security and the Mission Ballroom entry wave.", best_arrival: "Enter before the pre-curtain rush so you can orient yourself in Mission Ballroom and reach your designated or chosen viewing area before the opening.", crowd_mix: "A Denver crossover crowd of large-tour drag fans, queer nightlife communities, theatre audiences and visitors coming into RiNo for the show.", dress_code: "Stage-show glamour is appropriate, with a warm layer useful for early-March Denver weather and footwear suited to the room's concert format.", host_inclusivity: "The tour is explicitly queer drag-centred. Confirm Mission Ballroom's accessible viewing, seating or mobility support directly with the venue." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "san_diego", date: "2027-03-05",
    location: "Balboa Theatre, 868 Fourth Avenue, San Diego, CA 92101, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "RuPaul's Drag Race Werq The World 2027 Tour reaches San Diego's Balboa Theatre on 5 March at 20:00. Ticketmaster identifies this as the San Diego stop in the national stage tour.",
    intel: { entry_wait: "The Balboa Theatre listing gives an 20:00 start. Plan for downtown San Diego arrival, ticket scanning and a seated-theatre entry before showtime.", best_arrival: "Arrive early enough to find your section and settle in; large touring productions can begin with visual elements that are easy to miss after the curtain.", crowd_mix: "A San Diego audience of Drag Race fans, queer community members, visitors and theatre-goers looking for a Friday-night production.", dress_code: "Drag-inspired glamour fits the touring spectacle, while a light layer is useful in the theatre and for a March evening downtown.", host_inclusivity: "This is a queer drag-centred event. Contact Balboa Theatre directly for accessible seating, entry routes and support requirements." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "los_angeles", date: "2027-03-11",
    location: "Orpheum Theatre, 842 South Broadway, Los Angeles, CA 90014, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "Los Angeles hosts Werq The World 2027 at the Orpheum Theatre on 11 March at 20:00. Ticketmaster lists the historic Broadway venue as the tour's Los Angeles stop.",
    intel: { entry_wait: "The published start is 20:00. Leave a buffer for Broadway parking or transit, theatre security and ticket scanning in the Historic Core.", best_arrival: "Use an early arrival window if arranging dinner or transport around downtown Los Angeles, rather than relying on entry after the 20:00 curtain.", crowd_mix: "A major Los Angeles crowd of Drag Race superfans, local queer communities, industry audiences and visitors attending a flagship tour stop.", dress_code: "This is a natural night for maximal drag glamour; balance it with comfortable shoes for the Broadway approach and a full evening in the theatre.", host_inclusivity: "Werq The World is queer drag-led; confirm Orpheum Theatre accessibility and any companion-seat needs directly before purchase." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "san_francisco", date: "2027-03-14",
    location: "The Warfield, 982 Market Street, San Francisco, CA 94102, United States",
    link: "https://www.ticketmaster.com/rupauls-drag-race-werq-the-world-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "The 2027 Werq The World tour plays San Francisco's Warfield on 14 March at 20:00. Ticketmaster confirms the Sunday performance in the city's Market Street theatre district.",
    intel: { entry_wait: "The listed performance starts at 20:00. Arrive early for Market Street navigation, ticket scanning and any venue security checks.", best_arrival: "Plan to be inside before the curtain, particularly on a Sunday night when transport connections after the show may be less frequent.", crowd_mix: "A San Francisco crowd of Drag Race fans, queer cultural audiences, visitors and theatre regulars attending a large-scale Sunday production.", dress_code: "The Warfield date welcomes expressive drag-inspired looks; bring an outer layer for the evening and choose footwear comfortable for the Market Street approach.", host_inclusivity: "The show centres queer drag artists. Contact The Warfield directly for current accessibility, seating and assisted-entry information." },
  }),
  event({
    name: "2027 Gay Ocho Festival", city: "miami", date: "2027-02-14",
    location: "Domino Park, 1444 Southwest 8th Street, Miami, FL 33135, United States",
    link: "https://www.eventbrite.com/e/2027-gay-ocho-festival-tickets-1983204740766",
    vibe: "all-day Latino LGBTQ+ community festival", vibe_tags: ["festival", "cultural", "social"],
    description: "Gay Ocho Festival returns to Little Havana's Domino Park on 14 February 2027 from 11:00 to 22:00. The festival presents an all-day celebration of pride, music, love and Hispanic/Latino LGBTQ+ community in Miami.",
    intel: { entry_wait: "The published festival hours are 11:00–22:00. Arrive earlier in the day for an easier entry into Domino Park and time to explore the full programme.", best_arrival: "Start around the 11:00 opening if you want a daylight Little Havana experience, or arrive before evening for the final music-and-community stretch.", crowd_mix: "A broad intergenerational Miami crowd centred on Hispanic and Latino LGBTQ+ community, allies, local families and festival visitors.", dress_code: "It is an outdoor, eleven-hour Little Havana festival: choose breathable clothes, sun protection and footwear comfortable for standing and dancing.", host_inclusivity: "Gay Ocho explicitly frames the event around diversity, pride and unity. Its daytime format welcomes people looking for a community-led alternative to a late-night party." },
  }),
  event({
    name: "Arsht Impact CommuniTEA Dance 2027", city: "miami", date: "2027-06-06",
    location: "Ziff Ballet Opera House, Adrienne Arsht Center, 1300 Biscayne Boulevard, Miami, FL 33132, United States",
    link: "https://admin.arshtcenter.org/tickets/2026-2027/arsht-presents/communitea-dance/communitea-dance-2027/",
    vibe: "free Pride community dance and celebration", vibe_tags: ["social", "cultural", "festival"],
    description: "The Adrienne Arsht Center's tenth annual CommuniTEA Dance brings South Florida's LGBTQIA+ community and allies together on 6 June 2027 at 16:00. The free downtown Miami Pride celebration includes music, connection, happy-hour food and drinks, local vendors and talent to be announced in February.",
    intel: { entry_wait: "Tickets are free but RSVP is required through the Arsht Center. Reserve before travelling and allow time for downtown Miami entry and the Ziff Ballet Opera House check-in.", best_arrival: "Arrive close to the 16:00 opening to meet vendors and community groups before the later dance-floor energy builds.", crowd_mix: "An intentionally mixed South Florida LGBTQIA+ and ally crowd, combining arts-centre patrons, Pride-week visitors, local organisations and social dancers.", dress_code: "Pride colour, dance-ready comfort and light layers fit a late-afternoon indoor celebration; the event is free and community-focused rather than formal gala attire.", host_inclusivity: "The Arsht Center explicitly presents CommuniTEA as an LGBTQIA+ and allies gathering and uses a Pay What You Can/free-access model to lower barriers to attendance." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "new_york", date: "2026-11-25",
    location: "New York City Center, 131 West 55th Street, New York, NY 10019, United States",
    link: "https://www.nycitycenter.org/events/2026-2027-the-jinkx-and-dela-holiday-show",
    vibe: "camp holiday drag and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "Jinkx Monsoon and BenDeLaCreme bring their 2026 Holiday Show to New York City Center on 25 November. City Center describes a new winter spectacle with original songs, camp comedy, costumes, dance and theatrical storytelling; the Wednesday performance begins at 19:30.",
    intel: { entry_wait: "This City Center performance begins at 19:30. Leave time for Midtown travel, security and finding a theatre seat before the fixed curtain.", best_arrival: "Arrive before the main 19:30 entry wave, especially if you have separately purchased a VIP add-on, which is not included with the base ticket.", crowd_mix: "A New York holiday audience of Jinkx and DeLa fans, queer theatre-goers, Drag Race viewers and camp-comedy regulars.", dress_code: "Festive camp and theatrical holiday looks fit the show; use a warm outer layer for a late-November Midtown arrival.", host_inclusivity: "The performance is created and led by queer drag artists. Contact New York City Center for its current accessibility, companion seating and assisted-listening options." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "new_york", date: "2026-11-27",
    location: "New York City Center, 131 West 55th Street, New York, NY 10019, United States",
    link: "https://www.nycitycenter.org/events/2026-2027-the-jinkx-and-dela-holiday-show",
    vibe: "camp holiday drag and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "The Jinkx & DeLa Holiday Show returns to New York City Center for a second listed 2026 date on Friday 27 November at 19:30. The production combines new songs, camp gags, elaborate costumes, dance and original seasonal storytelling.",
    intel: { entry_wait: "The Friday performance is scheduled for 19:30. Thanksgiving-week Midtown crowds can add time at the theatre door, so avoid arriving at curtain time.", best_arrival: "Use an early evening arrival and keep any separately purchased VIP add-on confirmation with your standard show ticket.", crowd_mix: "A Friday-after-Thanksgiving mix of local queer audiences, visitors, theatre fans and Jinkx-and-DeLa devotees.", dress_code: "Holiday glamour, drag-inspired styling and theatre-ready layers all work well for this post-Thanksgiving evening performance.", host_inclusivity: "This is a queer artist-led production. New York City Center can advise on accessible entrances, seating and other access requirements before purchase." },
  }),
  event({
    name: "Provincetown Zine & Art Book Fair", city: "provincetown", date: "2027-05-14", endDate: "2027-05-16",
    location: "The Commons, 46 Bradford Street, Provincetown, MA 02657, United States",
    link: "https://www.provincetowncommons.org/commons-events/zinefestandartbookfair",
    vibe: "queer-friendly independent publishing and art fair", vibe_tags: ["cultural", "social", "underground"],
    description: "Provincetown's first Zine & Art Book Fair runs 14–16 May 2027 at The Commons. The free, open event brings together independent artists, writers, illustrators, designers, publishers, collectives and readers for zines, artist books, prints and DIY publishing.",
    intel: { entry_wait: "The published hours begin Friday at 10:00 and end Sunday at 14:00. Entry is free and open to all, but arrive early for the widest selection from participating makers.", best_arrival: "Visit Friday or Saturday if you want unhurried browsing and time to speak with artists; Sunday closes at 14:00.", crowd_mix: "A creative Provincetown mix of independent publishers, queer cultural visitors, artists, writers, collectors and people curious about DIY print culture.", dress_code: "Comfortable daytime layers and a bag for books or prints are more useful than nightlife attire; expect a browsing-and-conversation environment.", host_inclusivity: "The Commons frames the fair as a place to make, share, trade and collect stories, with free entry and a broad invitation to both experienced makers and first-time visitors." },
  }),
  event({
    name: "Rehoboth Beach Pride Festival 2027", city: "rehoboth_beach", date: "2027-07-17",
    location: "Rehoboth Beach Convention Center, 229 Rehoboth Avenue, Rehoboth Beach, DE 19971, United States",
    link: "https://sussexpride.org/rehobothbeach/",
    vibe: "free LGBTQ+ Pride festival and community weekend", vibe_tags: ["festival", "cultural", "social"],
    description: "Rehoboth Beach Pride Weekend returns 15–18 July 2027, with the Pride Festival at Rehoboth Beach Convention Center on Saturday 17 July. Sussex Pride presents the weekend as a local LGBTQ+ celebration and will publish 2027 vendor and sponsor details ahead of the event.",
    intel: { entry_wait: "The festival date is confirmed for Saturday 17 July within a four-day Pride Weekend. Check the organiser's schedule closer to the date for opening time and programme details.", best_arrival: "Plan the main festival visit for Saturday and arrive early for the strongest choice of community stalls, vendors and daytime programming once the detailed schedule is released.", crowd_mix: "A coastal Delaware Pride audience of LGBTQ+ residents, summer visitors, families, community groups and people travelling from the wider Mid-Atlantic region.", dress_code: "Summer coastal Pride calls for sun protection, breathable clothes and shoes suited to a daytime convention-centre festival and beach-town walking.", host_inclusivity: "Sussex Pride organises the weekend as a community Pride event. The festival venue gives the 2027 programme a clear, accessible central location rather than an unspecified town-wide listing." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "washington_dc", date: "2026-11-19",
    location: "Warner Theatre, 513 13th Street NW, Washington, DC 20004, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "18+ touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas brings its touring holiday drag revue to Washington's Warner Theatre. Ticketmaster lists a 19:30 performance on 19 November, marks the date 18+, and offers a separate meet-and-greet add-on rather than including it with entry.",
    intel: { entry_wait: "Bring government photo ID: Ticketmaster marks this Warner Theatre performance 18+, with a 19:30 showtime and separate ticket scanning for add-ons.", best_arrival: "Arrive well before 19:30 if using the meet-and-greet add-on or navigating downtown Washington; the add-on is not a show ticket by itself.", crowd_mix: "An adult Washington audience of drag-revue fans, queer community groups, allies and theatre-going visitors.", dress_code: "Holiday sparkle and drag-inspired looks fit the revue, while a seated theatre evening in November calls for layers you can keep comfortable indoors.", host_inclusivity: "The event is explicitly drag-centred. Contact Warner Theatre directly for accessible entrance, seating and companion-ticket arrangements." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "philadelphia", date: "2026-11-22",
    location: "The Fillmore Philadelphia, 29 East Allen Street, Philadelphia, PA 19123, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "18+ touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "The 2026 A Drag Queen Christmas tour reaches The Fillmore Philadelphia for a 19:30 Sunday performance. Ticketmaster lists this as an 18+ event and publishes optional parking, lounge and coat-check add-ons separately from the show ticket.",
    intel: { entry_wait: "This Fillmore date is listed as 18+, so bring valid photo ID and allow time for the 19:30 entry queue and security process.", best_arrival: "Arrive early if you have a separately purchased parking, lounge or coat-check add-on; none of those products replaces a show ticket.", crowd_mix: "A Philadelphia adult crowd of touring-drag fans, local queer audiences and holiday-season night-out groups.", dress_code: "Festive drag styling suits the revue; use a coat-check plan if arriving in winter layers and keep ID easy to reach at the door.", host_inclusivity: "A Drag Queen Christmas is a queer performance event; confirm accessible seating and the Fillmore's current entry options directly with the venue." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "chicago", date: "2026-11-27",
    location: "Riviera Theatre, 4746 North Racine Avenue, Chicago, IL 60640, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas plays Chicago's Riviera Theatre on the Friday after Thanksgiving. Ticketmaster lists an 20:00 performance on 27 November as part of the national holiday drag revue tour.",
    intel: { entry_wait: "The published showtime is 20:00. Build in time for a holiday-weekend crowd, ticket scanning and the Riviera's theatre entry procedures.", best_arrival: "Come before the late rush: this is a fixed-start touring revue, and an early arrival gives time to settle in before the opening number.", crowd_mix: "A Chicago holiday-weekend mix of Drag Race fans, queer nightlife regulars, friends on a seasonal night out and theatre audiences.", dress_code: "The Friday-after-Thanksgiving date welcomes festive styling; choose warm outerwear for Uptown and comfortable layers once inside.", host_inclusivity: "The programme is a drag-centred stage event. Ask the Riviera directly about accessible routes, seating and any venue-specific assistance." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "denver", date: "2026-12-04",
    location: "Paramount Theatre, 1621 Glenarm Place, Denver, CO 80202, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "Denver's Paramount Theatre hosts A Drag Queen Christmas on 4 December. Ticketmaster lists the touring holiday drag revue at 20:00, the night before the separate BERTHA: Grateful Drag concert elsewhere in the city.",
    intel: { entry_wait: "Ticketmaster lists a 20:00 start. Arrive with enough time for downtown Denver travel, ticket scanning and theatre seating before the revue begins.", best_arrival: "Use an early arrival window to avoid joining the main queue immediately before the 20:00 curtain and to find your seat without interruption.", crowd_mix: "A seasonal Denver theatre audience of drag fans, LGBTQ+ locals, visitors and groups looking for a high-energy holiday production.", dress_code: "Glitter, holiday camp and theatre-night looks all make sense; winter temperatures make a warm layer useful for the Glenarm Place approach.", host_inclusivity: "The event centres drag performance; contact Paramount Theatre ahead of time for specific accessibility, companion-seat or mobility guidance." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "seattle", date: "2026-12-07",
    location: "The Moore Theatre, 1932 2nd Avenue, Seattle, WA 98101, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas brings its touring holiday revue to Seattle's Moore Theatre on 7 December at 19:30. Ticketmaster also lists a separate Moore Theatre parking product, which does not include admission to the show.",
    intel: { entry_wait: "The scheduled curtain is 19:30; allow time for Belltown travel, theatre security and ticket scanning before the seated performance starts.", best_arrival: "Arrive early if using the separately sold parking product, remembering that it is not a substitute for a show ticket.", crowd_mix: "A Seattle crowd of drag-revue devotees, queer community members, seasonal visitors and fans gathering for a Monday-night show.", dress_code: "Holiday camp and expressive drag-inspired outfits fit naturally; take a rain-ready layer for the December walk to The Moore.", host_inclusivity: "This is a drag-focused production. Contact The Moore Theatre directly for current accessible seating and mobility support." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "los_angeles", date: "2026-12-12",
    location: "The Wiltern, 3790 Wilshire Boulevard, Los Angeles, CA 90010, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas closes its California run at Los Angeles' Wiltern on 12 December. Ticketmaster lists a 19:00 show and separate parking, lounge-access and meet-and-greet add-ons; those add-ons do not include concert admission.",
    intel: { entry_wait: "The Wiltern showtime is 19:00. Allow extra time for Wilshire Boulevard arrival and keep both your show ticket and any separate add-on confirmation ready.", best_arrival: "Use the early entry window if you have a meet-and-greet, lounge or parking add-on; each is sold separately and does not grant show admission alone.", crowd_mix: "A large Los Angeles drag audience including local queer communities, touring-revue fans, visitors and holiday-night groups.", dress_code: "This is a strong occasion for festive glamour or full drag-inspired styling, with comfortable shoes for the approach and post-show exit.", host_inclusivity: "The programme is explicitly drag-centred; contact The Wiltern directly for accessible seating, entry and companion-ticket requirements." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "austin", date: "2026-12-19",
    location: "ACL Live at the Moody Theater, 310 West Willie Nelson Boulevard, Austin, TX 78701, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "18+ touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas arrives at ACL Live at the Moody Theater in Austin on 19 December. Ticketmaster lists an 20:00 performance and marks this final-weekend date for guests aged 18 and over.",
    intel: { entry_wait: "Bring valid photo ID: Ticketmaster labels the Austin date 18+ and sets the performance for 20:00 at ACL Live.", best_arrival: "Get downtown before the pre-show rush, particularly on a Saturday night, so the 18+ check and ticket scan do not cut into the opening.", crowd_mix: "An adult Austin audience of drag-show fans, LGBTQ+ locals, visitors and groups marking the final holiday weekend before Christmas.", dress_code: "Seasonal sparkle, camp and danceable night-out clothing suit the show; carry a light layer for air-conditioned theatre seating.", host_inclusivity: "The revue is led by drag performers. Confirm accessible seating, venue entry and any companion accommodations with ACL Live before booking." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "atlanta", date: "2026-11-11",
    location: "The Eastern, 777 Memorial Drive SE, Atlanta, GA 30316, United States",
    link: "https://www.axs.com/events/1502300/the-jinkx-dela-holiday-show-tickets",
    vibe: "18+ camp holiday drag, comedy and theatrical variety show", vibe_tags: ["drag", "cultural"],
    description: "BenDeLaCreme and Jinkx Monsoon bring their annual holiday production to Atlanta: new songs, camp comedy, elaborate costumes and theatrical storytelling. The official Atlanta listing sets doors at 19:00 and the performance at 20:00; admission is 18+.",
    intel: { entry_wait: "Doors open one hour before the 20:00 performance; arrive by 19:15 for ticket scanning and the 18+ ID check.", best_arrival: "The Atlanta VIP photo opportunity is scheduled after the show, so VIP guests should keep their ticket and add-on confirmation available throughout the performance.", crowd_mix: "An 18+ audience built around Jinkx and DeLa fans, Drag Race viewers and queer holiday-show regulars.", dress_code: "Festive camp, holiday drag and comfortable theatre clothing all fit; venue entry remains subject to the published bag and ID rules.", host_inclusivity: "The billed performers are explicitly queer drag artists; consult The Eastern directly for accessible seating or mobility arrangements." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "chicago", date: "2026-12-06",
    location: "Auditorium Theatre, 50 East Ida B. Wells Drive, Chicago, IL 60605, United States",
    link: "https://www.ticketmaster.com/the-jinkx-%26-dela-holiday-show-tickets/artist/2909555",
    vibe: "camp holiday drag and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "Jinkx Monsoon and BenDeLaCreme's original holiday stage production reaches Chicago's Auditorium Theatre. Ticketmaster lists a 19:00 performance, part of the duo's 2026 North American holiday tour.",
    intel: { entry_wait: "This is a seated theatre performance; allow time for security, ticket scanning and finding a seat before the published 19:00 start.", best_arrival: "Aim for the first half of the venue's entry window so late arrival does not interrupt a theatrical number.", crowd_mix: "Fans of Jinkx Monsoon and BenDeLaCreme, queer theatre-goers and holiday-show audiences across Chicago.", dress_code: "The show rewards festive or camp styling, but theatre-ready layers are practical for Chicago winter travel and a long seated set.", host_inclusivity: "The programme is led by two queer drag artists; confirm wheelchair, companion-seat and sensory requirements directly with Auditorium Theatre." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "las_vegas", date: "2026-12-14",
    location: "House of Blues Las Vegas, Mandalay Bay, 3950 South Las Vegas Boulevard, Las Vegas, NV 89119, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages holiday drag, songs and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "The annual Jinkx & DeLa holiday production comes to House of Blues Las Vegas with a new winter show of songs, comedy, costumes and theatrical surprises. The official tour schedule lists doors at 18:00 and showtime at 19:00; this date is all ages.",
    intel: { entry_wait: "Mandalay Bay is a large resort complex, so build in extra walking time after arriving at the property; doors are at 18:00.", best_arrival: "Use the 18:00 door time rather than relying on the 19:00 curtain: casino-resort navigation and venue security can add time.", crowd_mix: "An all-ages audience of Drag Race fans, queer visitors, local show-goers and holiday travellers.", dress_code: "Camp holiday looks work well, while comfortable footwear is useful for the walk through Mandalay Bay to House of Blues.", host_inclusivity: "The artist-led show is explicitly queer; contact House of Blues Las Vegas before travel for accessible seating and resort-entry guidance." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "portland", date: "2026-12-17",
    location: "Arlene Schnitzer Concert Hall, 1037 SW Broadway, Portland, OR 97205, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages holiday drag, songs and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "Jinkx Monsoon and BenDeLaCreme bring their original holiday stage show to Portland, mixing camp comedy, music, dance, costumes and new seasonal storytelling. The official tour schedule lists 18:30 doors and a 19:30 show; this date is all ages.",
    intel: { entry_wait: "Doors open at 18:30; leave a buffer for downtown arrival, ticket scanning and theatre seating before the 19:30 curtain.", best_arrival: "Arrive soon after doors to settle in before the show; this is a fixed-time theatrical performance rather than a drop-in party.", crowd_mix: "A cross-generational all-ages audience of queer community members, theatre regulars and fans of the two headliners.", dress_code: "Holiday camp is welcome, but Portland winter weather makes a warm outer layer and practical shoes useful for the approach to the hall.", host_inclusivity: "The performance is created by queer artists; ask the concert hall directly about accessible routes, companion seating and assistive-listening options." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "seattle", date: "2026-12-21",
    location: "The Moore Theatre, 1932 2nd Avenue, Seattle, WA 98101, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages holiday drag, songs and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "Seattle hosts the first of four Christmas-week performances of Jinkx & DeLa's original holiday production at The Moore Theatre. The official tour schedule lists 18:00 doors and a 19:00 show for this all-ages date.",
    intel: { entry_wait: "For the opening Seattle date, arrive after the 18:00 door time begins to avoid the pre-show entry wave at The Moore.", best_arrival: "Choose an early arrival if collecting tickets or using accessible services; the show begins at 19:00.", crowd_mix: "An all-ages Seattle audience of Drag Race fans, queer theatre-goers and holiday visitors.", dress_code: "A festive look is at home here; bring a weatherproof layer for the walk through Belltown in December.", host_inclusivity: "This is a queer artist-led production; contact The Moore Theatre for current accessibility and seating support." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "seattle", date: "2026-12-22",
    location: "The Moore Theatre, 1932 2nd Avenue, Seattle, WA 98101, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages holiday drag, songs and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "A second Seattle performance of Jinkx & DeLa's annual holiday show, combining original music, camp comedy, costumes, dance and theatrical seasonal storytelling. The official tour schedule lists 18:00 doors and a 19:00 all-ages performance.",
    intel: { entry_wait: "The second Seattle night uses 18:00 doors and a 19:00 curtain; plan for ticket scanning before the fixed theatre start.", best_arrival: "Use the first 30 minutes after doors for a calmer entry and time to find the correct seating section.", crowd_mix: "A mixed all-ages audience centred on queer community, drag fans and Seattle holiday-night crowds.", dress_code: "Wear whatever reads festive or theatrical to you, with a warm layer for the downtown Seattle approach.", host_inclusivity: "The event is fronted by queer performers; verify accessibility details with The Moore rather than assuming the same setup as another Seattle venue." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "seattle", date: "2026-12-23",
    location: "The Moore Theatre, 1932 2nd Avenue, Seattle, WA 98101, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages holiday drag, songs and theatrical comedy", vibe_tags: ["drag", "cultural"],
    description: "The third Seattle Christmas-week date for Jinkx Monsoon and BenDeLaCreme's annual original holiday stage show. The official tour schedule lists 18:00 doors, a 19:00 show and all-ages admission.",
    intel: { entry_wait: "Expect a holiday-week theatre entry rush near the 18:00 door time; arrive early enough for security and a 19:00 seated start.", best_arrival: "If travelling from outside Seattle, build in traffic and parking time before the published 18:00 doors.", crowd_mix: "All-ages drag and theatre fans, including local queer audiences and visitors in Seattle for the holiday week.", dress_code: "Seasonal camp works, but keep outerwear easy to manage once seated in the theatre.", host_inclusivity: "The creative team is explicitly queer; contact the venue directly for mobility, sensory or companion-seat needs." },
  }),
  event({
    name: "The Jinkx & DeLa Holiday Show", city: "seattle", date: "2026-12-24",
    location: "The Moore Theatre, 1932 2nd Avenue, Seattle, WA 98101, United States",
    link: "https://www.jinkxanddela.com/",
    vibe: "all-ages Christmas Eve holiday drag and theatre", vibe_tags: ["drag", "cultural"],
    description: "A Christmas Eve matinee-style Seattle performance of Jinkx & DeLa's annual holiday production. The official tour schedule lists 16:00 doors and a 17:00 all-ages show, making it the early option in the Seattle run.",
    intel: { entry_wait: "This Christmas Eve show starts earlier than the other Seattle dates: doors are 16:00 and the performance begins at 17:00.", best_arrival: "Plan travel around holiday-day closures and arrive shortly after the 16:00 door time for a low-stress early evening.", crowd_mix: "An all-ages Christmas Eve crowd of queer community, families of fans and visitors looking for a theatrical holiday plan.", dress_code: "Festive clothes are welcome; choose layers suitable for Seattle winter and an early-evening departure.", host_inclusivity: "The show is queer-led and all ages; confirm venue accessibility arrangements in advance because holiday staffing and transport can differ." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "boston", date: "2026-11-15",
    location: "Emerson Colonial Theatre, 106 Boylston Street, Boston, MA 02116, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas brings its touring holiday drag revue to Boston's Emerson Colonial Theatre. Ticketmaster lists a 19:30 performance on 15 November.",
    intel: { entry_wait: "The Emerson Colonial Theatre listing gives a 19:30 start; arrive early enough for theatre security and assigned or selected seating.", best_arrival: "Target at least 30 minutes before showtime because Boylston Street and the Theatre District can be busy on a Sunday evening.", crowd_mix: "A holiday drag-revue audience mixing LGBTQ+ locals, visiting fans and theatre-goers.", dress_code: "Holiday sparkle and drag-inspired looks suit the revue format, while theatre seating calls for layers you can keep comfortable for the full show.", host_inclusivity: "This is a drag-centred performance; check the Colonial Theatre's current accessibility and entry policies when booking." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "salt_lake_city", date: "2026-12-05",
    location: "Kingsbury Hall, 1395 Presidents Circle, Salt Lake City, UT 84112, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas stops at Kingsbury Hall in Salt Lake City. Ticketmaster lists an 20:00 performance on 5 December as part of the touring holiday drag revue.",
    intel: { entry_wait: "The published start is 20:00; allow time for campus-area navigation, ticket scanning and any theatre bag check.", best_arrival: "Arrive early enough to settle in before the 20:00 curtain rather than treating the performance as a late-entry club night.", crowd_mix: "A Utah audience of queer community members, drag fans, allies and holiday theatre-goers.", dress_code: "A festive night-out look works well; winter weather and the university setting make a warm layer practical.", host_inclusivity: "The show is drag-centred; contact Kingsbury Hall for exact accessible-entry, companion-seat and parking guidance." },
  }),
  event({
    name: "A Drag Queen Christmas", city: "sacramento", date: "2026-12-09",
    location: "Channel 24, 1801 24th Street, Sacramento, CA 95816, United States",
    link: "https://www.ticketmaster.com/a-drag-queen-christmas-tickets/artist/2301859",
    vibe: "18+ touring holiday drag revue", vibe_tags: ["drag", "cultural"],
    description: "A Drag Queen Christmas brings its touring holiday drag revue to Sacramento's Channel 24. Ticketmaster lists a 19:30 show on 9 December and labels this date 18+.",
    intel: { entry_wait: "Bring government photo ID: Ticketmaster marks this Channel 24 date as 18+, with a 19:30 performance time.", best_arrival: "Arrive before the pre-show rush for the 18+ ID check and ticket scan; do not rely on late entry after the revue begins.", crowd_mix: "An adult drag-revue crowd of Sacramento queer locals, visiting fans and holiday-night audiences.", dress_code: "Holiday drag, glitter and comfortable dance-or-theatre clothing fit the room; keep ID readily accessible at entry.", host_inclusivity: "The event is explicitly drag-focused; ask Channel 24 directly about accessibility, seating configuration and current venue policies." },
  }),
  event({
    name: "BERTHA: Grateful Drag", city: "denver", date: "2026-12-05",
    location: "Cervantes' Masterpiece Ballroom, 2637 Welton Street, Denver, CO 80205, United States",
    link: "https://www.ticketmaster.com/search?q=BERTHA%3A+Grateful+Drag",
    vibe: "16+ drag-fronted Grateful Dead tribute concert", vibe_tags: ["drag", "cultural", "social"],
    description: "BERTHA brings its drag-fronted Grateful Dead tribute format to Denver's Cervantes' Masterpiece Ballroom. Ticketmaster lists an 20:30 performance on 5 December with 16+ admission.",
    intel: { entry_wait: "This is a 16+ ballroom concert, not a seated theatre show; reach the door before the 20:30 start for age verification and a better viewing position.", best_arrival: "Arrive near doors rather than only at set time if you want room to orient yourself in a standing-room concert format.", crowd_mix: "A crossover crowd of Deadheads, drag fans, queer music audiences and Denver live-music regulars.", dress_code: "Comfortable shoes matter more than formal theatre wear; colourful or camp looks suit the drag-meets-jam-band concept.", host_inclusivity: "The billing explicitly centres drag performance; contact Cervantes' directly for accessibility and standing-room accommodation needs." },
  }),
  event({
    name: "RuPaul's Drag Race Werq The World 2027 Tour", city: "boston", date: "2027-04-16",
    location: "Orpheum Theatre, 1 Hamilton Place, Boston, MA 02108, United States",
    link: "https://www.ticketmaster.com/rupaul-s-drag-race-werq-the-world-tour-tickets/artist/2679678",
    vibe: "large-scale RuPaul's Drag Race stage tour", vibe_tags: ["drag", "massive", "cultural"],
    description: "The 2027 Werq The World tour brings a large-scale RuPaul's Drag Race stage production to Boston's Orpheum Theatre. The official venue calendar lists an 20:00 performance on 16 April.",
    intel: { entry_wait: "The Orpheum calendar lists an 20:00 start; plan entry time for a large touring production and a full theatre audience.", best_arrival: "Use an early arrival window to clear ticket scanning before the 20:00 curtain and avoid missing opening production elements.", crowd_mix: "A large mixed-age drag audience: Drag Race fans, queer community groups, visitors and mainstream theatre-goers.", dress_code: "Big-stage drag invites expressive looks, but Boston spring weather and a long seated show make layers a sensible choice.", host_inclusivity: "The production is built around queer drag performers; contact the Orpheum in advance for accessible seating or mobility support." },
  }),
];

const requiredIntelFields = ["entry_wait", "best_arrival", "crowd_mix", "dress_code", "host_inclusivity"];
for (const row of events) {
  const missing = ["name", "city", "date", "location", "description", "link", "ticket_url", "vibe"]
    .filter((field) => !row[field]);
  const incompleteIntel = requiredIntelFields.filter((field) => !row.event_intel?.[field] || row.event_intel[field].length < 24);
  if (missing.length || !row.vibe_tags?.length || incompleteIntel.length || !row.event_intel?.source_urls?.length) {
    throw new Error(`Incomplete event data for ${row.name}: ${[...missing, ...incompleteIntel].join(", ")}`);
  }
}

for (const row of events) {
  const { data: existing, error: readError } = await supabase
    .from("events")
    .select("id")
    .eq("name", row.name)
    .eq("city", row.city)
    .eq("date", row.date)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) continue;
  if (apply) {
    const { error } = await supabase.from("events").insert(row);
    if (error) throw error;
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", checked: events.length }, null, 2));
