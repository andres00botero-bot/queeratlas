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
    name: "69/96: The Final Descent", city: "copenhagen", date: "2026-10-24",
    location: "Basement, Enghavevej 42, 1674 Copenhagen V, Denmark",
    link: "https://www.copenhagenpride.dk/events/",
    vibe: "queer pre-Halloween underground party", vibe_tags: ["electronic", "underground", "social"],
    description: "Copenhagen Pride marks the final dark chapter of its 30-year anniversary with 69/96: The Final Descent at Basement. The queer pre-Halloween party runs from 22:00 on 24 October until 05:00 the following morning and is listed at DKK 100.",
    intel: { entry_wait: "The event runs 22:00–05:00. Arrive close to opening if you want to avoid the late-night entry peak at Basement.", best_arrival: "Come before 23:00 to settle in before the Halloween crowd fills the underground room; the official listing gives a DKK 100 ticket price.", crowd_mix: "A Copenhagen Pride anniversary crowd of queer nightlife regulars, Halloween stylists, allies and people drawn to Basement's underground setting.", dress_code: "No rule is published, but the event is explicitly a dark queer pre-Halloween party; costume, clubwear and practical dance shoes all fit.", host_inclusivity: "Copenhagen Pride is the host and frames the night as part of its anniversary programme, rooted in the city's queer community and Stonewall history." },
  }),
  event({
    name: "Queer Café – November 2026", city: "odense", date: "2026-11-12",
    location: "Studenterhus Odense, Amfipladsen 6, 5000 Odense C, Denmark",
    link: "https://odensepride.dk/vaer-med/arrangementer/",
    vibe: "queer community café and social gathering", vibe_tags: ["social", "cozy", "cultural"],
    description: "Odense Pride's Queer Café takes place at Studenterhus Odense on 12 November from 16:00 to 20:00. It is part of the organisation's year-round programme for gathering the local LGBTQ+ community beyond the annual Pride day.",
    intel: { entry_wait: "This is an early-evening community event running 16:00–20:00, so entry is likely calmer than a late-night club queue.", best_arrival: "Arrive shortly after 16:00 if you want the most time to meet people before the four-hour café session ends.", crowd_mix: "A local Odense LGBTQ+ community gathering, likely mixing students, regular Pride volunteers, newcomers and allies in a social setting.", dress_code: "Casual, comfortable daytime clothes suit a Studenterhus community café; no special dress requirement is published.", host_inclusivity: "Odense Pride explicitly runs year-round activities to strengthen the queer community in Odense, making this a low-pressure social entry point." },
  }),
  event({
    name: "Queer Café – December 2026", city: "odense", date: "2026-12-10",
    location: "Studenterhus Odense, Amfipladsen 6, 5000 Odense C, Denmark",
    link: "https://odensepride.dk/vaer-med/arrangementer/",
    vibe: "queer community café and social gathering", vibe_tags: ["social", "cozy", "cultural"],
    description: "Odense Pride hosts its December Queer Café at Studenterhus Odense on 10 December from 16:00 to 20:00. The recurring café is part of the local Pride organisation's programme of activities throughout the year.",
    intel: { entry_wait: "The published session is 16:00–20:00. This is a scheduled café gathering, not a ticketed late-night event.", best_arrival: "Start early if you are visiting for the first time: arriving near 16:00 gives the longest window for conversation before the event closes.", crowd_mix: "An Odense queer-community mix of students, residents, Pride supporters, newcomers and allies meeting in an informal early-evening environment.", dress_code: "Wear whatever feels comfortable for a community café. Winter layers are useful for travel, but no dress code is listed.", host_inclusivity: "The host is Odense Pride, whose stated purpose is strengthening the LGBTQ+ community in Odense and beyond through year-round activities." },
  }),
  event({
    name: "Aarhus Pride 2027", city: "aarhus", date: "2027-05-29",
    location: "Rådhusparken, 8000 Aarhus C, Denmark",
    link: "https://www.visitdenmark.com/denmark/plan-your-trip/aarhus-pride-gdk763771",
    vibe: "family-friendly LGBTQ+ Pride parade and festival", vibe_tags: ["festival", "cultural", "social"],
    description: "Aarhus Pride takes place on Saturday 29 May 2027 from 12:00. The city-wide celebration combines a colourful parade with music at the Pride stage, picnics in the Pride area and events hosted by local organisations around Aarhus.",
    intel: { entry_wait: "The official start time is 12:00. Arrive before noon if you want to join the parade atmosphere rather than meeting it after the route is underway.", best_arrival: "Use the early afternoon for the parade and Pride stage, then stay into the afternoon to explore local-organisation events across the city.", crowd_mix: "A broad, family-friendly Aarhus mix of LGBTQ+ people, children, friends, colleagues, local organisations and visitors from the surrounding region.", dress_code: "Rainbow, costume and casual picnic-ready clothing are all fitting; choose shoes suitable for a parade route and time outdoors in Rådhusparken.", host_inclusivity: "The organiser describes Aarhus Pride as welcoming everyone regardless of gender, age, ethnicity, religion or political belief, with a particular family-friendly emphasis." },
  }),
  event({
    name: "LGBTIQA Winterdays and Christmas Avenue 2026", city: "berlin", date: "2026-11-04", endDate: "2026-12-23",
    location: "Nollendorfplatz, 10777 Berlin, Germany",
    link: "https://www.berlin.de/en/events/queer/",
    vibe: "LGBTQIA+ winter market, stage programme and community gathering", vibe_tags: ["festival", "cultural", "cozy"],
    description: "Berlin's LGBTQIA Winterdays and Christmas Avenue run from 4 November to 23 December at Nollendorfplatz. The queer winter market combines seasonal lighting, a varied stage programme, food and drinks in the heart of Schöneberg.",
    intel: { entry_wait: "This is a multi-week outdoor market rather than a single-ticket show. Visit earlier on weekdays for a calmer arrival than the busiest Friday and Saturday evening periods.", best_arrival: "Go after dusk for the lighting and stage atmosphere, but arrive earlier in the evening if you want time to explore food stalls before the crowd peaks.", crowd_mix: "A Schöneberg mix of Berlin LGBTQIA+ locals, visitors, neighbours, allies and people looking for a queer seasonal alternative to a conventional Christmas market.", dress_code: "Warm layers and weatherproof shoes matter most for an outdoor Berlin winter market; festive styling is welcome but no dress code is published.", host_inclusivity: "The event is explicitly LGBTQIA+-focused and takes place at Nollendorfplatz, a longstanding centre of Berlin's queer community." },
  }),
  event({
    name: "Viennese Rainbow Ball 2027", city: "vienna", date: "2027-01-23",
    location: "Austria Trend Parkhotel Schönbrunn, Hietzinger Hauptstraße 14-16, 1130 Vienna, Austria",
    link: "https://regenbogenball.at/en/",
    vibe: "formal LGBTIQ+ charity ball and queer community celebration", vibe_tags: ["cultural", "luxury", "social"],
    description: "The 29th Vienna Rainbow Ball takes place on 23 January 2027 at the Austria Trend Parkhotel Schönbrunn. The formal queer ball celebrates diversity and visibility while supporting HOSI Vienna's community work, Rainbow Parade and Das Gugg community centre.",
    intel: { entry_wait: "Advance tickets go on sale 1 November 2026 at 12:00. This is a formal seated ball, so arrive early enough for ticket checks, cloakroom and finding your booked table or loge.", best_arrival: "Plan to arrive before the ball programme starts rather than treating it as a late club entry; table categories and seating areas are sold separately.", crowd_mix: "A dressed-up Vienna LGBTIQ+ community, allies, ballroom regulars, supporters of HOSI Vienna and international guests drawn to the Schönbrunn setting.", dress_code: "This is a formal Viennese ball. Check the organiser's published dress-code guidance before booking, and plan attire appropriate for a gala ballroom evening.", host_inclusivity: "The Rainbow Ball explicitly welcomes people of every sexual orientation and gender identity, and directs net proceeds to HOSI Vienna's LGBTIQ community work." },
  }),
  event({
    name: "WASt LGBTIQ Conference 2026: Queer intersektional gelesen", city: "vienna", date: "2026-11-20",
    location: "Vienna City Hall, Wappensaal, Friedrich-Schmidt-Platz 1, 1010 Vienna, Austria",
    link: "https://www.wien.gv.at/veranstaltungen/lqbtiq",
    vibe: "free LGBTIQ+ intersectionality conference", vibe_tags: ["cultural", "social", "chill"],
    description: "Vienna's Anti-Discrimination Office for LGBTIQ Affairs hosts its 2026 conference, Queer intersektional gelesen, at City Hall's Wappensaal on 20 November from 09:00 to 17:00. The City of Vienna lists the event as free.",
    intel: { entry_wait: "The event runs 09:00–17:00 and is free. Arrive before the morning opening to allow for City Hall entry and registration procedures.", best_arrival: "Come for the 09:00 opening if you want the full conference arc; it is a daytime learning and discussion programme rather than an evening social event.", crowd_mix: "A Vienna mix of LGBTIQ+ community members, advocates, public-sector staff, researchers, allies and people interested in intersectional anti-discrimination work.", dress_code: "Business-casual or comfortable daytime conference clothing fits the venue; no formal dress code is listed by the City of Vienna.", host_inclusivity: "The event is hosted by Vienna's official Anti-Discrimination Office for LGBTIQ Affairs and is structured around queer intersectionality and public access." },
  }),
  event({
    name: "HEAT by UNDR – Kinky House & Techno Party", city: "berlin", date: "2026-11-21",
    location: "Insomnia, Alt-Tempelhof 17-19, 12099 Berlin, Germany",
    link: "https://ra.co/events/2379555",
    vibe: "sex-positive LGBTQIA+ house and techno club night", vibe_tags: ["techno", "fetish", "underground"],
    description: "HEAT by UNDR brings a sex-positive house-and-techno night to Insomnia Berlin on 21 November from 22:00 to 06:00. PyjamaMama, SIKAE and ZLATOMIRA play the House main floor, while Epicx and Mia Mangata lead the Techno dungeon; the event is presented as LGBTQIA+-friendly and a safe space.",
    intel: { entry_wait: "The event runs 22:00–06:00. A presale ticket gives priority-queue access, but arrive with enough time for Insomnia's door process and dress-code assessment.", best_arrival: "Arrive near 22:00 if you want time on both the House main room and the Techno dungeon before the late-night peak.", crowd_mix: "A sex-positive, LGBTQIA+-friendly Berlin club crowd drawn to house, techno, fetish fashion and a consent-conscious nightlife environment.", dress_code: "The stated code is sexy, kinky, fetish or futuristic; streetwear is not accepted, so prepare an intentional outfit rather than standard club basics.", host_inclusivity: "UNDR explicitly describes HEAT as a safe, LGBTQIA+-friendly experience. The event's format centres consent-aware, sex-positive club culture." },
  }),
  event({
    name: "RE:CODED – Gay Techno Fetish Party", city: "berlin", date: "2026-11-13",
    location: "PKH Warehouse, Dorotheenstraße 30, 10117 Berlin, Germany",
    link: "https://recodedparty.com/",
    vibe: "gay techno and fetish party", vibe_tags: ["techno", "fetish", "men_only"],
    description: "RE:CODED is a gay techno fetish party at PKH Warehouse on 13 November, with doors at 22:00. The programme splits dark techno and house across two floors and lists Ben Manson among the techno artists; tickets are sold via Eventjet and valid ID is required.",
    intel: { entry_wait: "Doors open at 22:00. Bring valid ID and your Eventjet ticket; ticket releases close on their stated dates or when sold out.", best_arrival: "Arrive early for the lower early-bird price window and to enter before the warehouse's main late-night rush.", crowd_mix: "A men-focused gay fetish and techno crowd looking for darker sound, a dress-code-led environment and a sex-positive warehouse night.", dress_code: "The organiser states that the dress code counts. Treat fetish, leather, harness, sportswear or intentional club styling as part of the event rather than an optional extra.", host_inclusivity: "RE:CODED presents itself as a space for men to let go, be seen and be respected; its entry framing is specifically gay and fetish-oriented." },
  }),
  event({
    name: "NEST with Mood II Swing, Gallegos, Sherø + more", city: "berlin", date: "2026-11-27",
    location: "Kater, Holzmarktstraße 25, 10243 Berlin, Germany",
    link: "https://ra.co/events/2543968",
    vibe: "queer pro-trans acid house, techno and ballroom rave", vibe_tags: ["techno", "underground", "social"],
    description: "NEST returns to Kater Berlin on 27 November from 22:00 to 08:00 with Mood II Swing, Gallegos, Sherø, Bézier, Esther Dune, Qualia Trax and more. The queer, fiercely pro-trans night spans acid house, techno, deep house and ballroom across Kater's rooms.",
    intel: { entry_wait: "The night starts at 22:00 and has limited RA presale plus more tickets at the club. A presale ticket does not guarantee door entry, though refusal is refunded by RA excluding fees.", best_arrival: "Arrive early if you want the full multi-room programme and to avoid relying on a later door decision after the limited presale allocation is exhausted.", crowd_mix: "A queer, pro-trans dance-floor crowd for acid house, techno, deep house and ballroom, with organisers asking guests to make space for the community's safety.", dress_code: "No fixed outfit rule is published. Wear clothes you can dance in for ten hours and respect the organisers' request to use space considerately.", host_inclusivity: "NEST explicitly states zero tolerance for homophobia, transphobia, racism and discrimination, and identifies community comfort and safety as its priority." },
  }),
  event({
    name: "RARA AVIS", city: "amsterdam", date: "2026-10-24",
    location: "Club NYX, Reguliersdwarsstraat 42, 1017 BM Amsterdam, Netherlands",
    link: "https://ra.co/events/2507060",
    vibe: "colourful queer techno, house and hyperpop club night", vibe_tags: ["techno", "electronic", "underground"],
    description: "RARA AVIS returns to Club NYX during Amsterdam Dance Event on 24 October from 23:00 to 05:00. The queer club night brings techno, house, disco and hyperpop across three rooms, with Alice Olsthoorn, TEKNA, DJ SEXSTASY, Spikey Lee, DNDYKES, VAIDACH and more on the line-up.",
    intel: { entry_wait: "The listing runs 23:00–05:00 and is 18+. Buy through the official RA link before travelling; ADE weekend and the compact NYX entrance can mean a later queue.", best_arrival: "Come shortly after the 23:00 start to see the full three-room line-up and to arrive before the busiest midnight-to-01:00 window.", crowd_mix: "A queer ADE crowd of techno club kids, house and hyperpop listeners, creative dressers and allies seeking a deliberately expressive dance floor.", dress_code: "The promoter explicitly welcomes bold looks, creative makeup and fearless self-expression. Colourful clubwear is encouraged; choose something you can dance in.", host_inclusivity: "RARA AVIS describes itself as a safer queer playground. Its published policy says racism, sexism, homophobia, transphobia, xenophobia and other discrimination are not tolerated, and directs guests to staff for help." },
  }),
  event({
    name: "QUEER MOUSSEM FESTIVAL BY GAZELLE L'HAFLA", city: "brussels", date: "2026-10-30",
    location: "Les Halles de Schaerbeek, 22b Rue Royale Sainte-Marie, 1030 Brussels, Belgium",
    link: "https://ra.co/events/2538609",
    vibe: "queer Maghrebi and Levantine club, ballroom and acid techno festival", vibe_tags: ["techno", "cultural", "underground"],
    description: "Gazelle L'Hafla and Les Halles de Schaerbeek present the second Queer Moussem Festival on 30 October from 20:00 to 05:00. Across two rooms, the night combines live music, performance, ballroom and clubbing, connecting sounds from Aïta and Mezoued to electro and acid techno with artists from the Maghreb, Levant, Europe and the US.",
    intel: { entry_wait: "The official RA page lists an 20:00 start, 18+ entry and tickets from €20. Secure a ticket in advance rather than relying on the door for this multi-artist festival night.", best_arrival: "Arrive near 20:00 to catch the live and performance elements before the programme shifts deeper into its late-night club and ballroom energy.", crowd_mix: "A queer, diasporic and cross-cultural Brussels audience joining artists and dancers connected to the Maghreb, Levant, Europe and the US, alongside ballroom and club communities.", dress_code: "No fixed dress code is published. Expressive clubwear that lets you dance through a long multi-room programme is appropriate; avoid treating cultural references as costume.", host_inclusivity: "The event is explicitly framed as Queer Moussem and presents collective trance, performance and ballroom as a community-centred club experience rather than a conventional nightlife booking." },
  }),
  event({
    name: "5 Years Oh Honey – 24 Hour Queer Rave", city: "antwerp", date: "2026-11-14", endDate: "2026-11-15",
    location: "Traum, Verversrui 15, 2000 Antwerp, Belgium",
    link: "https://traumclub.com/",
    vibe: "24-hour queer house and techno rave", vibe_tags: ["techno", "electronic", "underground"],
    description: "Oh Honey celebrates five years with a 24-hour queer rave at Traum in Antwerp from 14 November. The official programme lists Massimiliano Pagliara, Julie Desire, Mala Ika, Cheriii Disjoli, Flemish.Fetish, Mariona, Puck, Sherø, Sonek, Space, Stanislawa and Sweatlana.",
    intel: { entry_wait: "This is a 24-hour ticketed rave, so check the official Traum ticket link before travelling. Arrive with photo ID and allow extra time if you choose the main evening entry period.", best_arrival: "For the fullest experience, enter early on Saturday rather than treating the event as a short late-night stop; the long format lets you pace the programme and take breaks.", crowd_mix: "A queer Antwerp and visiting European dance-floor crowd, bringing together local DJs and international guests for a marathon house-and-techno celebration.", dress_code: "No specific dress code is published. Traum's shared-values setting rewards considerate club behaviour; wear expressive but practical clothes for a long dance-floor session.", host_inclusivity: "The event is explicitly billed as a queer rave, and Traum states that guests agree to its shared principles intended to create a positive experience for everyone." },
  }),
  event({
    name: "Queer Sunday Café – November 2026", city: "rotterdam", date: "2026-11-08",
    location: "OASE, Schiehaven 15a, 3024 EC Rotterdam, Netherlands",
    link: "https://www.oaserotterdam.nl/programma",
    vibe: "relaxed queer community café, games and connection", vibe_tags: ["social", "cozy", "chill"],
    description: "Queer Events 010 and OASE host Queer Sunday Café on 8 November at 13:00. The drop-in afternoon is designed for queer people and allies to meet, join planned activities, conversations and games, and build friendships in Rotterdam's queer community; tickets start at €5.",
    intel: { entry_wait: "The listed start is 13:00 and the event is a daytime café drop-in. Booking ahead via OASE is sensible, but the format is designed to let participants arrive during the afternoon.", best_arrival: "Come close to 13:00 if you want the most time for games and introductions; later arrival still suits the stated drop-in format.", crowd_mix: "Queer Rotterdam residents, allies, newcomers and regular community members looking for an easier daytime way to meet people than a club night.", dress_code: "Casual, comfortable daytime clothes suit the café setting. No special styling is expected, so choose what makes you feel at ease joining a conversation or game.", host_inclusivity: "OASE and Queer Events 010 explicitly invite queer people and allies, using facilitated activities and games to lower the barrier to connection and friendship." },
  }),
  event({
    name: "Queer Sunday Café – December 2026", city: "rotterdam", date: "2026-12-13",
    location: "OASE, Schiehaven 15a, 3024 EC Rotterdam, Netherlands",
    link: "https://www.oaserotterdam.nl/programma",
    vibe: "relaxed queer community café, games and connection", vibe_tags: ["social", "cozy", "chill"],
    description: "Queer Events 010 and OASE host their December Queer Sunday Café on 13 December at 13:00. The afternoon is a drop-in meeting place for queer people and allies, with planned activities, conversations and games intended to build friendship and connection in Rotterdam's queer community; tickets start at €5.",
    intel: { entry_wait: "The official programme lists a 13:00 start and a drop-in format. Reserve through OASE if you want certainty, while knowing guests can join during the afternoon.", best_arrival: "Arrive near the 13:00 opening for the most time to take part in introductions, games and conversations; the relaxed format also accommodates later arrivals.", crowd_mix: "Queer Rotterdam residents, allies, newcomers and regular community members seeking a daytime setting for conversation, activities and low-pressure connection.", dress_code: "The event is a community café, so casual clothes are ideal. There is no styling expectation: wear what lets you feel comfortable meeting new people.", host_inclusivity: "OASE and Queer Events 010 explicitly welcome queer people and allies, using activities and games to make building friendships and community participation easier." },
  }),
  event({
    name: "Peach Club – Queer Indie Party", city: "rotterdam", date: "2026-12-05",
    location: "Rotown, Nieuwe Binnenweg 17, 3014 GB Rotterdam, Netherlands",
    link: "https://www.rotown.nl/agenda/peach-club-queer-indie-party-1/",
    vibe: "queer alternative indie, electronic and pop club night", vibe_tags: ["electronic", "pop", "social"],
    description: "Peach Club brings a queer alternative club night to Rotown on 5 December, with doors and music from 23:00. The playlist moves through indie, post-punk, electronic music and pop, from Wet Leg and Chappell Roan to COBRAH, Shygirl, Robyn and Justice; tickets start at €5 and entry is 18+.",
    intel: { entry_wait: "Doors open at 23:00. The organiser lists advance tickets from €5 and door entry at €7, so an advance ticket is the safer option if you do not want to depend on capacity.", best_arrival: "Arrive around opening for a lower-pressure start and the full night of alternative music; the party runs as a single late-night dance floor rather than a headline concert.", crowd_mix: "A mixed queer and ally crowd for people who want indie, post-punk, electronic and pop without the usual club-scene pigeonholing.", dress_code: "Wear whatever feels comfortable; the promoter specifically invites guests to use a fun party outfit they have been waiting to wear, but makes it optional.", host_inclusivity: "Peach Club says everyone is welcome regardless of gender, sexual orientation, religion or ethnicity, and states that intolerance is not tolerated." },
  }),
  event({
    name: "Pornceptual", city: "amsterdam", date: "2026-12-11", endDate: "2026-12-12",
    location: "Parallel, Buiksloterweg 5C, 1031 CC Amsterdam, Netherlands",
    link: "https://ra.co/events/2559889",
    vibe: "queer sex-positive techno, art and performance night", vibe_tags: ["techno", "fetish", "underground"],
    description: "Pornceptual comes to Parallel Amsterdam on 11 December from 23:59 to 05:00 with Spikey Lee, TEKNA and Boris. The Berlin-born art movement combines techno and experimental music with visual art, performances, a cinema room and designated private cruising areas, framing pornography as queer, diverse and inclusive.",
    intel: { entry_wait: "The event runs 23:59–05:00. A ticket does not guarantee entry because Pornceptual uses a strict door policy to uphold its dress code and atmosphere, so give yourself time for the door conversation.", best_arrival: "Arrive close to opening to settle through the door process calmly and to experience the art and performance components before the dance floor reaches its late-night peak.", crowd_mix: "A queer, sex-positive, art-minded Amsterdam crowd of techno listeners, performance audiences and people interested in Pornceptual's inclusive erotic culture.", dress_code: "A strict event-specific dress code applies and can affect entry. Check Pornceptual's current guidance before leaving; choose an intentional look that fits the sex-positive artistic setting rather than ordinary streetwear.", host_inclusivity: "Pornceptual explicitly frames its work as queer, diverse and inclusive. Its published safer-space guidance asks guests to intervene safely around aggressive sexual advances and racist or transphobic comments." },
  }),
  event({
    name: "NOGENDER OVERSIZE 10TH ANNIVERSARY", city: "lyon", date: "2027-01-30", endDate: "2027-01-31",
    location: "Fiducial Asteria, 5 Avenue Simone Veil, 69150 Décines-Charpieu, France",
    link: "https://ra.co/events/2555519",
    vibe: "large-scale queer industrial techno and performance rave", vibe_tags: ["techno", "fetish", "industrial"],
    description: "NOGENDER marks ten years with OVERSIZE at Fiducial Asteria near Lyon on 30 January 2027, from 23:00 to 06:00. The organiser presents it as its largest queer rave yet: a 3,000-person night of techno across styles, performance and a programme led by Angel Karel, with additional artists announced later.",
    intel: { entry_wait: "This is an 18+ event and the organiser requires photo ID. Tickets are sold through the official RA listing; plan for a substantial arrival flow at a 3,000-capacity anniversary event.", best_arrival: "Arrive near the 23:00 start to avoid the densest later entry period and to take in the full seven-hour programme before the final set of the night.", crowd_mix: "A broad Lyon and visiting queer-rave community: regulars from NOGENDER's ten-year history, first-time guests, techno dancers, fetish and performance audiences across genders and sexualities.", dress_code: "The promoter asks everyone to wear black at minimum and actively welcomes leather, latex, harnesses, drag, oversized looks and more experimental styling. Everyday casual clothes are discouraged.", host_inclusivity: "NOGENDER states it is open to all sexualities, origins and genders. Its published rules reject discrimination, violence, homophobia, transphobia, sexism and racism, with prevention and harm-reduction teams present." },
  }),
  event({
    name: "GEGEN BRUSSELS", city: "brussels", date: "2026-11-28", endDate: "2026-11-29",
    location: "C12, Rue Marché aux Herbes 116, 1000 Brussels, Belgium",
    link: "https://ra.co/events/2493897",
    vibe: "queer fetish techno, performance and sex-positive club night", vibe_tags: ["techno", "fetish", "underground"],
    description: "GEGEN Brussels takes over C12 on 28 November from 23:00 to 06:00 with Boris, Card Mercier and Mar/us on sound, plus bodies Eric, Lee Versatile and Mirko Piccolo, visual work by Qajii and Club Derive in the X Area. The queer party pairs dark club sound with fetish styling, performance and a consent-led safer-space approach.",
    intel: { entry_wait: "Tickets are sold through the official GEGEN link. Arrive with enough time for C12's door process because the published dress code is actively enforced at entry.", best_arrival: "Come near 23:00 to enter before the busiest period and to experience the opening arc of the sound, body and visual programme rather than arriving only for the peak hours.", crowd_mix: "A mixed queer, fetish and techno crowd across genders, sexualities and backgrounds, drawn to GEGEN's body-positive performance and club culture.", dress_code: "No casual wear: the organiser explicitly welcomes vibrant colour, fetish, latex, leather, rubber, sportswear, shiny, dirty or bare looks. Plan an intentional outfit that fits that direction.", host_inclusivity: "GEGEN says guests should feel comfortable regardless of gender, race, religion, class or sexual orientation. It requires consent and directs anyone facing harassment or discrimination to its yellow-vest awareness team or staff." },
  }),
  event({
    name: "Horst Club x MISSFITTE x Body Language", city: "brussels", date: "2026-11-28", endDate: "2026-11-29",
    location: "ASIAT Park, entry via Willem Elsschotstraat 19, 1800 Vilvoorde, Belgium",
    link: "https://ra.co/events/2534959",
    vibe: "24-hour queer-forward house, electronic and performance club weekend", vibe_tags: ["electronic", "underground", "social"],
    description: "Brussels collective MISSFITTE and Berlin's Body Language co-curate Horst Club at ASIAT Park over 24 hours on 28–29 November. The queer-forward programme spans house, downtempo, live sets and performance, with Josh Caffé, DJ Fuckoff, DJ Straight Again, Camilla Rae, Göksu Kunak, Hot Bodies, Stella Zekri and many more.",
    intel: { entry_wait: "The event runs for 24 hours and includes a cloakroom. The organiser says bus service is included in the ticket price; use the official ticket page for the current travel and entry details.", best_arrival: "Arrive near the 23:00 Saturday opening if you want the fullest 24-hour programme and an easier orientation before the site becomes busy; the extended format allows you to pace your visit.", crowd_mix: "A queer-forward Brussels and international club audience around MISSFITTE and Body Language, with dancers, performance audiences and people drawn to expression, body positivity and musical curiosity.", dress_code: "No fixed dress code is published. Choose expressive, comfortable clubwear suitable for a long event and the outdoor-to-industrial setting of ASIAT Park.", host_inclusivity: "MISSFITTE and Body Language are described by the organiser as queer collectives centred on expression and body positivity, making queer culture—not merely a themed booking—the focus of the 24-hour collaboration." },
  }),
  event({
    name: "Isulia Festival 2026", city: "bordeaux", date: "2026-11-05", endDate: "2026-11-07",
    location: "Base sous-marine, 284 Boulevard Alfred Daney, 33300 Bordeaux, France",
    link: "https://www.bordeaux-metropole.fr/agenda/42301388_isulia-festival-2026",
    vibe: "inclusive electronic music festival with techno, house and hybrid live sets", vibe_tags: ["festival", "electronic", "techno"],
    description: "Isulia Festival returns to Bordeaux's Base sous-marine and Bassins des Lumières from 5 to 7 November. The 2026 programme brings two stages of techno, house, electro and hybrid sounds, with Audrey Danza, Belaria & Zaatar, Nastia, Djedjotronic & Trio Xenakis, Octave One live, Maara and more; public sessions run 18:00–02:00.",
    intel: { entry_wait: "The festival lists tickets at €16–29 via its official Shotgun venue link. Arrive before the 18:00 programme begins, particularly on Friday and Saturday when two stages are active.", best_arrival: "Come early in the evening to navigate the large converted submarine-base site, see the opening performances and move between the Bunker and Mirage stages before the later peak.", crowd_mix: "A Bordeaux electronic-music audience spanning techno, house and hybrid-set listeners, international DJs, local clubgoers and visitors drawn to the unusual cultural venue.", dress_code: "No dress code is published. Wear layers and comfortable shoes for a long, multi-stage programme in the raw industrial spaces of the submarine base.", host_inclusivity: "Isulia explicitly publishes a no-LGBTQIA+-phobia, no-racism, no-sexism, no-harassment and no-hate policy, and states that discriminatory, violent or oppressive behaviour has no place at the festival." },
  }),
  event({
    name: "Overqueer – Queer Techno Rave", city: "montpellier", date: "2026-10-24", endDate: "2026-10-25",
    location: "Mélomane Club, 11 Rue du Lantissargues, 34070 Montpellier, France",
    link: "https://shotgun.live/fr/events/we-are-overqueer",
    vibe: "queer hard-bounce and hard-techno rave with drag performance", vibe_tags: ["techno", "drag", "underground"],
    description: "Overqueer returns to Mélomane Club in Montpellier on 24 October from 23:55 to 06:00 for its 11th edition. The queer techno rave combines hard bounce and hard techno from NIKITA, AEZR, ISALINE and K-GET b2b BIZY with drag shows by Bad Inked Barbie and Mystik Drama, a 20kW sound system and a dedicated safeness-and-care setup.",
    intel: { entry_wait: "The official Shotgun listing is 18+ and offers early, regular and door tickets. Buy in advance and arrive before the 23:55 opening rush, especially because the club night is a single late-night programme.", best_arrival: "Arrive at opening to catch the full DJ and drag-show programme and settle into the care-led space before the main hard-techno peak after midnight.", crowd_mix: "Queer people, LGBTQ+ women and allies from Montpellier's electronic scene, plus techno dancers seeking a club night with drag performance and a visibly queer-led crowd.", dress_code: "Black and pink are suggested but explicitly not mandatory. The organiser says to come as you are, so comfort and self-expression matter more than following a uniform.", host_inclusivity: "Overqueer is explicitly made for queer people, LGBTQ+ women and allies. The listing foregrounds safeness and care alongside its drag shows and electronic programme." },
  }),
  event({
    name: "Sovanight XL – Drag Show", city: "lille", date: "2026-11-14", endDate: "2026-11-15",
    location: "Slay Club, 9 Rue Maracci, 59800 Lille, France",
    link: "https://agendalgbt.com/lille/events/sovanight-xl-drag-show-605968",
    vibe: "queer drag show and late-night dance party", vibe_tags: ["drag", "pop", "social"],
    description: "Sovanight XL comes to Slay Club Lille on 14 November from 23:30 to 06:00. The club night pairs a drag show and StarDancers performances with DJ Rackell, hosted by Sovanja and featuring Dina Price and Tina Barthelina; tickets start at €10.",
    intel: { entry_wait: "The event starts at 23:30 and tickets are offered from €10 through the event listing. Book ahead if you want certainty for the first XL edition at the smaller Slay Club venue.", best_arrival: "Arrive close to 23:30 to secure space for the drag-show segment before the later DJ-led dance-floor portion of the night.", crowd_mix: "A Lille queer nightlife crowd around drag, dance performance and pop-forward clubbing, with fans of Sovanja, the invited performers and a celebratory late-night atmosphere.", dress_code: "No mandatory dress code is published. Glamorous, expressive clubwear suits the drag-show setting, while comfortable shoes will help for dancing until 06:00.", host_inclusivity: "The event is listed in Lille's LGBTQ+ agenda and centres drag artists and performers, creating a clearly queer-led club programme rather than a standard nightclub booking." },
  }),
  event({
    name: "2much Nantes: Panteros666, DJ Schnake, Kichta & more", city: "nantes", date: "2026-12-04", endDate: "2026-12-05",
    location: "Warehouse, 21 Quai des Antilles, 44200 Nantes, France",
    link: "https://agendalgbt.com/nantes/events/2much-nantes-panteros666-dj-schnake-kichta-more-601539",
    vibe: "Y2K trance, hard-dance and techno club night", vibe_tags: ["techno", "electronic", "pop"],
    description: "2much celebrates two years at Warehouse Nantes on 4 December from 23:59 to 06:30. Panteros666 headlines a Y2K-focused night of trance, eurodance and 2000s club music, joined by DJ Schnake, Kichta, Eskha and Kandy Namite, while the GOW FAST ALL STARS take over Room 2.",
    intel: { entry_wait: "The listing is 18+ and requires photo ID; the venue reserves the right of entry. Use the published ticket link rather than depending on late door availability for this multi-room anniversary night.", best_arrival: "Arrive shortly after the 23:59 opening if you want both the headline room and the GOW FAST ALL STARS room before the strongest hard-dance peak later in the night.", crowd_mix: "A Nantes club crowd around 2much's playful, Y2K and hard-dance aesthetic, including trance, techno, eurodance and club-music listeners from the city's queer nightlife orbit.", dress_code: "No dress code is published. The event's Y2K, fun and uninhibited framing leaves room for colourful club styling, but practical dance clothes work equally well.", host_inclusivity: "The event is published through the current Nantes LGBTQ+ nightlife agenda. Its host's Y2K club format is positioned there as part of the city's queer-facing nightlife selection; standard adult-entry and venue rules still apply." },
  }),
  event({
    name: "SWEAT", city: "paris", date: "2026-11-06", endDate: "2026-11-07",
    location: "Nouveau Casino, 109 Rue Oberkampf, 75011 Paris, France",
    link: "https://www.patroc.com/gay/paris/d/sweat-party.html",
    vibe: "queer house dance and play party", vibe_tags: ["electronic", "fetish", "social"],
    description: "SWEAT returns to Nouveau Casino in Paris on 6 November, running from midnight to 06:00. The queer dance-and-play house party features DJ Anton and Mr Cozzo, with tickets from €15.",
    intel: { entry_wait: "The published programme starts at midnight and tickets begin at €15. Buy via the organiser's linked channels before travelling, as this is a focused six-hour late-night party rather than an all-night venue schedule.", best_arrival: "Arrive around midnight to enter before the main rush and to experience the full DJ-led house programme with time to orient yourself in the venue.", crowd_mix: "A Paris queer nightlife crowd looking for a house-driven dance floor with a sex-positive play-party component, rather than a conventional mainstream club night.", dress_code: "No dress code is stated on the published listing. Choose intentional, comfortable clubwear and check the organiser's current social channels before attending in case door guidance changes.", host_inclusivity: "The event is explicitly billed as a queer dance-and-play house party, centring a queer adult nightlife space rather than merely a general house booking." },
  }),
  event({
    name: "13.NOV | PARIS | VENDREDIXXL", city: "paris", date: "2026-11-13", endDate: "2026-11-14",
    location: "La Bellevilloise, 19-21 Rue Boyer, 75020 Paris, France",
    link: "https://agendalgbt.com/en/paris/events/13-nov-paris-vendredixxl-580739",
    vibe: "gay XXL club night with cabaret, electro, techno and cruising", vibe_tags: ["techno", "electronic", "social"],
    description: "VendrediXXL takes over La Bellevilloise on 13 November from 19:00 to 06:00. The gay club event combines Cabaret d'Ivré sse, a queer-artist concert, hyperpop and electro on the Bitchy Floor, and an electro, techno and progressive programme in La Cave Electric, alongside the Bestial Zone and outdoor garden/terrace spaces.",
    intel: { entry_wait: "The event begins at 19:00, with the electronic Cave opening at 22:00. Use the official ticket link and arrive early if you want the cabaret and concert before the late club queues build.", best_arrival: "Come for the early Cabaret d'Ivresse programme or by 22:00 for the Cave Electric opening; that gives you the clearest choice between show time and the full techno/progressive club stretch.", crowd_mix: "A gay Paris nightlife crowd mixing cabaret-goers, queer-artist fans, hyperpop dancers and late-night electro, techno and progressive listeners across La Bellevilloise's distinct spaces.", dress_code: "No published mandatory dress code appears on the listing. Dress for a long multi-space evening and check VendrediXXL's current channels for any door guidance before you go.", host_inclusivity: "VendrediXXL is explicitly presented as a gay party with a queer-artist concert and distinct spaces for clubbing and adult play. It is an adult nightlife format; check the organiser's live rules and consent guidance before attending." },
  }),
  event({
    name: "Queer Porto 12 – International Queer Film Festival", city: "porto", date: "2026-11-03", endDate: "2026-11-07",
    location: "Batalha Centro de Cinema, Praça da Batalha 47, 4000-101 Porto; Casa Comum, Reitoria da Universidade do Porto, Praça de Gomes Teixeira, 4099-002 Porto; Passos Manuel, Rua de Passos Manuel 137, 4000-385 Porto, Portugal",
    link: "https://www.queerporto.pt/en/2026-editions/queer-porto/venues-and-tickets",
    vibe: "international queer cinema, discussion and closing-party festival", vibe_tags: ["festival", "cultural", "social"],
    description: "Queer Porto's 12th International Queer Film Festival runs from 3 to 7 November across Batalha Centro de Cinema, Casa Comum at the University of Porto and Passos Manuel. The festival brings queer film, screenings, guests and discussion to Porto, with ticketed cinema sessions, free Casa Comum entry subject to capacity and a €5 closing party at Pérola Negra.",
    intel: { entry_wait: "Batalha tickets went on sale on 20 October, while Casa Comum screenings are free but admit guests in arrival order. Arrive early for free sessions and use the official venue ticket information for paid screenings.", best_arrival: "Choose a daytime Batalha screening for the widest ticket-office window, or arrive well before a Casa Comum session if free entry matters most. The festival finishes with the Saturday closing party at Pérola Negra.", crowd_mix: "A Porto and international audience of queer-cinema viewers, filmmakers, volunteers, students, community organisations and visitors interested in LGBTQ+ culture and discussion.", dress_code: "No dress code is published. Comfortable cinema and conversation-ready clothes suit the daytime programme; check the closing-party venue's current guidance if attending Pérola Negra on the final night.", host_inclusivity: "The festival is explicitly dedicated to queer cinema and themes, and its official programme works across screenings, guests and community participation. Casa Comum's free entry model also lowers the barrier to joining the festival." },
  }),
];

const intelFields = ["entry_wait", "best_arrival", "crowd_mix", "dress_code", "host_inclusivity"];
for (const row of events) {
  const missing = ["name", "city", "date", "location", "description", "link", "ticket_url", "vibe"].filter((field) => !row[field]);
  const incompleteIntel = intelFields.filter((field) => !row.event_intel?.[field] || row.event_intel[field].length < 24);
  if (missing.length || !row.vibe_tags?.length || incompleteIntel.length || !row.event_intel?.source_urls?.length) {
    throw new Error(`Incomplete event data for ${row.name}: ${[...missing, ...incompleteIntel].join(", ")}`);
  }
}

for (const row of events) {
  const { data: existing, error: readError } = await supabase.from("events").select("id").eq("name", row.name).eq("city", row.city).eq("date", row.date).maybeSingle();
  if (readError) throw readError;
  if (!existing && apply) {
    const { error } = await supabase.from("events").insert(row);
    if (error) throw error;
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", checked: events.length }, null, 2));
