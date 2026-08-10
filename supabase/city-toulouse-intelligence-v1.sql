-- Queer Atlas: Toulouse venue and event intelligence
-- Researched 2026-08-10 from official pages, 2026 programmes, local reporting and review consensus.
-- Safe to run repeatedly. Sources stay in metadata; public topic copy reads as direct editorial guidance.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

with researched(name, patch) as (
  values
    ('Chez les Jumeaux', jsonb_build_object(
      'queue_wait', 'Most ordinary afternoons and early evenings should be a direct walk-in; the bar is new, open daily and built around quick, informal service. The room changes after 22:00 and can fill on Saturday or a named DJ night. Pride reporting described a likely full house, so arrive before the main party hour when a special edition matters.',
      'best_nights', 'Go early in the week for a relaxed drink with the owners and their first wave of regulars. Friday and especially Saturday are for the warmer Spanish-style party mood, louder music and later 03:00 close. Because the bar only opened in 2026, Instagram is more useful than assuming a fixed weekly ritual already exists.',
      'crowd_mix', 'Gay men and local scene regulars lead, joined by LGBTQ+ friends, allies and people who knew Pedro and Luis from Sitges. The press found repeat Toulouse customers almost immediately, while the late programme attracts visitors. It is a local gay bar with an open door, not a tourist-only themed concept.',
      'dress_code', 'Everyday city clothes, a fitted night-out look, denim, trainers or something hotter all work. There is no published fashion filter. The room aims for festive hospitality rather than selective-door theatre, so dress for heat and movement on a packed Saturday instead of trying to solve an imaginary code.',
      'staff_inclusivity', 'The strongest early signal is personal welcome: customers interviewed soon after opening praised the warmth, and the first review cluster repeatedly mentions friendly, attentive and fast service. This remains a young evidence base, so it supports a promising inclusive start rather than a claim of years-long consistency.',
      'review_signal', 'A June 2026 queer directory showed 5.0/5 from only four reviews, all positive about atmosphere and staff. Local newspaper interviews independently echoed the hospitality and affordable prices. The signal is encouraging but still small; Queer Atlas will not present four early ratings as settled long-term consensus.',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/chezlesjumeaux/',
        'https://www.ladepeche.fr/2026/06/04/toulouse-manque-de-lieux-gay-friendly-le-nouveau-bar-chez-les-jumeaux-vient-etoffer-loffre-nocturne-et-festive-du-centre-ville-13402924.php',
        'https://qlist.app/venues/Toulouse/In-twins/UDJJM2VkSzVvYVVKODNUeUsvNlBMZw',
        'https://ducotedechezmarc.com/'
      ]::text[]),
      'evidence_scope', '2026_opening_report_owner_identity_current_hours_and_small_early_review_consensus',
      'research_status', 'editorial_review_consensus_new_venue_small_sample',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('La Gougnotte', jsonb_build_object(
      'queue_wait', 'There is no classic club line, but the room is genuinely small. A drag competition, concert or karaoke can use every seat and turn the communal tables into standing space. Come near 17:00 for a calm drink; for a named show, arriving around opening is wiser than appearing just before the performance.',
      'best_nights', 'Monday to Wednesday stay softer and suit conversation. Thursday through Saturday run later and are strongest when the little stage is active; a drag or open-mic night reveals the bar better than a random crawl. Sunday can feel like a community decompression evening, but verify the same-day programme and close.',
      'crowd_mix', 'Queer women, lesbians, trans and non-binary people, feminist regulars and younger LGBTQ+ locals form the centre, with gay men, friends and informed visitors welcome around them. Community recommendations repeatedly point queer newcomers here because it connects to people and projects beyond the bar itself.',
      'dress_code', 'There is no door aesthetic to imitate. Soft tailoring, work clothes, political tees, glitter, trainers and full drag all make sense depending on the programme. Prioritise a layer you can remove in the packed room and do not mistake a queer-feminist safer-space culture for a demand to look a particular way.',
      'staff_inclusivity', 'The recurring description is active welcome rather than generic tolerance: visitors highlight the smiling team, local performers and a room designed as a real queer refuge. Inclusion is socially centred on queer and feminist community, so respectful guests should read the event audience and avoid treating the space as spectacle.',
      'review_signal', 'Current local collections expose more than one hundred ratings and repeatedly praise beer, staff, openness and varied events. Written review detail is less standardised than for a large restaurant platform, so the reliable signal is qualitative: small, warm, proudly queer and liveliest when the stage is in use.',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/lagougnotte/',
        'https://www.pagesjaunes.fr/pros/63087537',
        'https://bar-gay.autour-de-moi.com/la-gougnotte-2040456.html',
        'https://www.corner.inc/place/pQhf5AJPv4oM',
        'https://www.reddit.com/r/toulouse/comments/14zoquz/moving_to_toulouse_soon_lgbt_community/',
        'https://www.reddit.com/r/toulouse/comments/1o8cggs/meeting_queer_lgbt_people/'
      ]::text[]),
      'evidence_scope', 'current_hours_local_queer_positioning_programme_and_cross_platform_community_consensus',
      'research_status', 'editorial_review_consensus_without_stable_single_aggregate',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Le Bear''s Bar', jsonb_build_object(
      'queue_wait', 'Thursday and Sunday normally move straight to the bar. Friday and Saturday can become packed from roughly 22:00 and stay busy for hours; a current reviewer arrived at 21:00 on Friday and remained until 03:00. There is usually no cover or famous door queue, but the narrow room itself becomes the capacity limit.',
      'best_nights', 'Friday gives the clearest full Bear’s experience: late, busy and social. Saturday follows the same pattern; Sunday starts earlier and can be friendlier for conversation. A quieter weekday or opening hour may feel flat if you expected a club, so choose it only when you want the bar and staff without the crowd.',
      'crowd_mix', 'Bears, mature gay men, admirers and masculine-presenting regulars shape the room, with younger men, solo visitors and friends mixed in. Locals dominate outside major weekends. Travellers do appear, but reviews show that speaking a little French or making the first social move can change how easily you enter the conversation.',
      'dress_code', 'Jeans, tees, polos, leather touches, trainers and everyday bear-bar clothes all fit; there is no general fashion code. Any underwear, naked or themed format must be confirmed on the event post rather than assumed from the venue identity. Keep valuables close and your drink in sight as in any late crowded bar.',
      'staff_inclusivity', 'Most recent guests describe friendly staff, generous pours and real effort with solo visitors. A minority report being ignored when they did not speak French, and two 2024 reviews make serious unverified safety allegations. The fair conclusion is broadly warm but uneven; language and peak-night conditions matter, and personal drink safety should never be dismissed.',
      'review_signal', 'The current Google-derived aggregate is about 4.4/5 from 235 reviews. Praise centres on Friday atmosphere and staff; criticism covers language barriers, smoke effects, music and isolated serious safety concerns. The score is strong, but the written split is important enough to keep visible.',
      'source_urls', to_jsonb(array[
        'https://bears-toulouse.club/',
        'https://www.pagesjaunes.fr/pros/64488276',
        'https://wanderlog.com/place/details/1828406/le-bears-bar',
        'https://fr.restaurantguru.com/Bears-Toulouse',
        'https://qlist.app/venues/Toulouse/Le-Bears-Bar/ZVF1QVdOcERkNnpiNkErQlVyZVZwQQ/fr'
      ]::text[]),
      'evidence_scope', 'official_current_identity_and_hours_plus_large_review_consensus_with_language_and_safety_caveats',
      'research_status', 'editorial_review_consensus_with_material_caveats',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Le Quinquina', jsonb_build_object(
      'queue_wait', 'The terrace has only a handful of tables and is the first thing to disappear on a warm evening, but there is no selective door or sustained line. Arrive around 17:00–19:00 for an outside seat and the best chance to talk; later arrivals usually stand, move downstairs or accept a tighter local-bar rhythm.',
      'best_nights', 'Wednesday and Thursday are the cleanest choices for a quiet Toulouse aperitif. Friday and Saturday gather more regulars and become livelier, especially when the White Room has a DJ or live date. This is not a 03:00 club: its best hours come before dinner or as the first stop of the night.',
      'crowd_mix', 'Mainly gay Toulouse regulars in their thirties and above, with couples, straight friends and solo travellers passing through the tiny terrace. Multiple reviews call it family-like; a small number of outsiders felt watched or excluded by the regulars-first dynamic. The room rewards conversation more than anonymity.',
      'dress_code', 'A shirt, tee, denim, trainers or ordinary warm-weather terrace clothes are enough. There is no appearance-based door policy and no reason to dress for a glossy club. The practical choice is comfort in a small room and a layer for street-side drinking after sunset.',
      'staff_inclusivity', 'Long-term reviews repeatedly make the person behind the bar the reason to return, describing warmth, humour and a gift for connecting strangers. Recent feedback remains mostly positive, but not unanimous: one 2025 guest found the service cold and the regulars insular. Expect personality, not standardised hotel-bar service.',
      'review_signal', 'The most useful evidence is hundreds of local comments across years, including fresh 2026 praise for an unforgettable aperitif and a July 2026 note on the welcoming owner. A small TravelGay poll sits at 2.6/5 from nine votes and conflicts with the richer written consensus, so it is reported rather than allowed to dominate.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/le-quinquina',
        'https://www.tripadvisor.fr/Restaurant_Review-g187175-d7108300-Reviews-Quinquina_Bar-Toulouse_Haute_Garonne_Occitanie.html',
        'https://bar-gay.autour-de-moi.com/quinquina-bar-3370022.html',
        'https://lacarte.menu/restaurants/toulouse/quinquina-bar',
        'https://www.gayout.com/europe/france/toulouse/bars/quinquina-bar'
      ]::text[]),
      'evidence_scope', 'current_hours_long_running_identity_recent_and_historic_written_reviews_with_conflicting_small_poll',
      'research_status', 'editorial_review_consensus_with_regulars_first_caveat',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('KS Sauna', jsonb_build_object(
      'queue_wait', 'Reception is normally a direct payment and orientation rather than a queue. Wednesday evening can be notably busy because under-26 admission drops to €7; Friday and Saturday build later under the 02:00 close. First-timers should arrive with enough time to hear the layout and price explanation instead of rushing in near last entry.',
      'best_nights', 'Monday afternoon is calmer and has enough company for guests who want the facilities first. Wednesday evening brings a younger, busier crowd through the reduced rate. Friday and Saturday offer the latest energy. The official after-20:00 price of €14 makes an evening visit the value move on any day.',
      'crowd_mix', 'Gay and bisexual men lead, with ages shifting by tariff and hour: under-26s are more visible Wednesday, tourists appear on weekends and quieter weekday afternoons skew local and relaxed. Reviews from visiting couples and friends describe a social mix rather than one fixed body type, but this remains an adult men-focused venue.',
      'dress_code', 'No clubwear is needed; follow sauna hygiene and consent rules. Bring your own flip-flops despite one enthusiastic review saying they were unnecessary—wet-floor safety is the better practical standard. Towels, toiletries and a small lockable routine matter more than clothes, and nobody owes interaction inside play areas.',
      'staff_inclusivity', 'Many recent guests praise friendly reception, bar staff, cleanliness and help for visitors. A minority describe cold treatment and criticise confrontational management replies to negative reviews. The balanced read is generally welcoming with inconsistent conflict handling; ask questions clearly at entry and decide for yourself if the tone feels right.',
      'review_signal', 'A current review aggregate reports 4.0/5 from 194 reviews. Cleanliness, jacuzzi temperature, varied spaces and friendly staff lead the praise; negative reports focus on reception attitude rather than the physical plant. Wednesday-night energy is mentioned repeatedly enough to be useful rather than generic.',
      'source_urls', to_jsonb(array[
        'https://www.kssauna.fr/fr/horaires-tarifs/',
        'https://www.pagesjaunes.fr/pros/54854658',
        'https://wanderlog.com/place/details/6942934/le-ks-sauna',
        'https://cristalcoiffure.fr/le-ks-sauna/'
      ]::text[]),
      'evidence_scope', 'official_hours_tariffs_and_audience_plus_large_recent_review_consensus_with_service_caveat',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Le Kalinka', jsonb_build_object(
      'queue_wait', 'This is a reservation and seating problem, not a nightclub line. Book the dinner-show, arrive at the time on your confirmation and allow the team to place the room before service. Sold-out weekends and New Year editions punish last-minute plans; an early booking also lets you request a sightline or accessibility arrangement.',
      'best_nights', 'Thursday is the slightly softer introduction; Friday and Saturday carry the full weekend celebration and later finish. Choose the production that excites you rather than assuming every revue is identical. A birthday group works, but a smaller table can absorb the detail and humour more easily.',
      'crowd_mix', 'Queer regulars, couples, mixed friend groups, birthdays and culturally curious visitors share the 110 seats. The audience is broader and often older than a drag-club crowd, while the stage keeps transformism and gender play central. Toulouse locals and regional day-trippers outweigh international tourists.',
      'dress_code', 'Smart-casual or celebratory clothes suit the dinner-show format, but there is no published glamour test. Wear something that lets you sit comfortably for the full meal and performance. Sequins are welcome for pleasure; ordinary shirts, dresses and trainers are not a reason to be turned away.',
      'staff_inclusivity', 'Current 2026 reviews repeatedly praise the artists and servers for warmth, reassurance and attention, including a guest with social anxiety. The cast often carries both performance and hospitality, giving the night a personal scale. Contact the venue in advance for wheelchair seating rather than leaving placement until the room is full.',
      'review_signal', 'The venue reports an average 4.9/5 across more than one thousand ratings, and Tripadvisor gives it Travellers’ Choice recognition. Fresh 2026 reviews praise energy, food and service; the useful negative says a poor sightline weakened value despite excellent performers and staff. Seating deserves attention.',
      'source_urls', to_jsonb(array[
        'https://www.lekalinka.com/',
        'https://www.lekalinka.com/le-cabaret/',
        'https://www.pagesjaunes.fr/pros/08982330',
        'https://www.tripadvisor.fr/Restaurant_Review-g187175-d1381812-Reviews-Le_Kalinka-Toulouse_Haute_Garonne_Occitanie.html'
      ]::text[]),
      'evidence_scope', 'official_capacity_programme_and_venue_reported_aggregate_plus_fresh_2026_independent_reviews',
      'research_status', 'editorial_review_consensus_with_seating_caveat',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Folles Saisons', jsonb_build_object(
      'queue_wait', 'Ordinary lunches work by reservation or normal table availability, but Bagdam dinners and lesbian party nights are different: food quantities and the social programme depend on knowing who is coming. Call ahead for the meal and arrive for the announced opening rather than turning up at dance time expecting dinner.',
      'best_nights', 'For everyday character, Thursday or Friday dinner gives the garden restaurant at its most relaxed. For queer Atlas purposes, the announced Bagdam soirée is the real destination: shared food, archive cinema or conversation, then dancing. These dates are occasional, so the cultural calendar matters more than the regular weekly hours.',
      'crowd_mix', 'Lunch draws Pradettes neighbours, workers and families. Lesbian cultural evenings shift the centre toward women across generations, feminist organisers, long-time Bagdam participants and friends. That history makes the event crowd deeply local; visitors are welcome only according to the audience wording of the named programme.',
      'dress_code', 'Come as you would to a warm cultural restaurant: practical, personal and not overproduced. Garden layers help outside; comfortable shoes make sense when dinner becomes a party. Non-mixed lesbian events should be respected as an audience boundary, not treated as a fashion or appearance test.',
      'staff_inclusivity', 'The organisation has a documented commitment to women artists, anti-sexist culture and lesbian social life, while most dining reviews call the setting and staff welcoming. A 2024 guest found the service abrupt, so hospitality is not universally experienced. Reserving and explaining dietary needs early gives the team the clearest chance to help.',
      'review_signal', 'Tripadvisor currently marks Folles Saisons as Travellers’ Choice. Fresh 2025–2026 reviews praise seasonal homemade food, value, parking and conviviality; the main dissent concerns staff tone rather than cooking. Bagdam’s long partnership independently confirms the venue’s importance to Toulouse lesbian culture.',
      'source_urls', to_jsonb(array[
        'https://www.follessaisons.fr/',
        'https://www.bagdam.org/',
        'https://metropole.toulouse.fr/associations/annuaire/folles-saisons',
        'https://www.tripadvisor.fr/Restaurant_Review-g187175-d5984672-Reviews-Folles_Saisons-Toulouse_Haute_Garonne_Occitanie.html'
      ]::text[]),
      'evidence_scope', 'official_hours_food_access_and_cultural_mission_plus_recent_restaurant_reviews_and_lesbian_programme_history',
      'research_status', 'editorial_review_consensus_event_audience_varies',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('La Cabane', jsonb_build_object(
      'queue_wait', 'There is no public box office outside show time. Buy the named event online, then expect a normal ticket scan when doors open; sold-out queer festivals can concentrate arrivals in the first half-hour. Because any exit is final, handle food, medication, smoking and belongings before entering rather than planning to pop out.',
      'best_nights', 'La Cabane belongs on this map only when the programme does: Girls Don’t Cry, feminist production or a clearly queer organiser can transform it, while a random concert may have no LGBTQ+ focus. For a takeover, arrive at doors to explore all three levels and settle access needs before the headline flow.',
      'crowd_mix', 'The audience follows the producer. Girls Don’t Cry brings queer and gender-expansive music crowds, artists, students and local feminist networks; other concerts may be completely mixed. Toulouse and regional visitors dominate, with the Halles drawing curious first-timers who would not enter a dedicated gay bar.',
      'dress_code', 'There is no permanent code. Expressive clubwear and creative looks make sense at queer festivals; ordinary concert clothes work just as well. Prioritise shoes for standing and stairs, or request a mobility place. Noise-reduction headsets are available, which is more practically valuable than guessing how glamorous the room will be.',
      'staff_inclusivity', 'The venue publishes an inclusion commitment and unusually specific access: step-free public areas, accessible toilets on every level, guided assistance, hearing loop, audio description, guide-dog places and noise-reduction headsets. Event organisers can add their own safety team, so check both host layers.',
      'review_signal', 'A stable venue-wide guest score with useful written detail was not exposed. The strongest evidence is operational rather than promotional: exact access equipment, final-exit rule, event-led staffing and Girls Don’t Cry’s Main Forte system. Queer quality depends on the named takeover, not the building alone.',
      'source_urls', to_jsonb(array[
        'https://halles-cartoucherie.fr/cabane-infos-pratiques/',
        'https://halles-cartoucherie.fr/cabane-accessibilite/',
        'https://www.lapetite.fr/girlsdontcry/girls-dont-cry-festival-2026/',
        'https://halles-cartoucherie.fr/la-cabane/'
      ]::text[]),
      'evidence_scope', 'official_event_access_entry_and_inclusion_rules_plus_confirmed_queer_takeover_safety_system',
      'research_status', 'officially_verified_event_space_without_stable_independent_aggregate',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.places p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || r.patch,
    updated_at = timezone('utc', now())
from researched r
where lower(trim(p.city)) = 'toulouse'
  and lower(trim(p.name)) = lower(trim(r.name));

with researched(name, patch) as (
  values
    ('CONTACT Toulouse Listening Group — September 2026', jsonb_build_object(
      'entry_wait', 'There is no public door or walk-in queue. Register with CONTACT, wait for the confirmation and keep the privately supplied address off public channels. Capacity and participant care matter more than speed; arriving unregistered may compromise the room and should not be treated as a harmless drop-in.',
      'best_arrival', 'Reach the central meeting point about fifteen minutes before the 14:00 start so registration, accessibility and emotional settling happen quietly. Arriving much earlier risks exposing a protected address; arriving late can interrupt introductions. Use the organiser’s confirmation, not a map guess.',
      'crowd_mix', 'LGBTQ+ people, parents, siblings, partners, relatives and relevant professionals share the conversation. Toulouse and wider Occitanie participants are likely, with newcomers specifically supported. It is deliberately intergenerational and not a nightlife audience; nobody is required to disclose more than feels safe.',
      'dress_code', 'There is none. Wear ordinary comfortable clothes for seated conversation and bring only what registration requests. Privacy is the practical code: do not photograph, tag the location or repeat another participant’s story outside the room.',
      'host_inclusivity', 'CONTACT frames the group around listening, family communication and non-judgement across sexual orientation and gender identity. The private address and registration process are safeguarding choices. Contact the team beforehand for mobility, language or companion needs rather than assuming the undisclosed venue cannot accommodate them.',
      'review_signal', 'Future confidential support group with no public attendee rating, appropriately. Confidence comes from CONTACT’s established regional remit, exact date and time, published audience and protected registration flow; no testimonials have been invented for a room where privacy is part of the service.',
      'source_urls', to_jsonb(array[
        'https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026',
        'https://www.asso-contact.org/asso/31/coordonnees-occitanie-ouest-pyrenees'
      ]::text[]),
      'evidence_scope', 'official_future_date_time_audience_registration_and_confidential_location_policy',
      'research_status', 'officially_verified_future_support_group',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Festival Sans Pression 2026', jsonb_build_object(
      'entry_wait', 'Buy the correct pass or workshop option through the official ticket page; the venue is not set up for a speculative club queue. Workshop and escape-game capacities are the likely pressure points. Arrive before Saturday’s 11:00 opening if your booked activity begins early and keep the confirmation available.',
      'best_arrival', 'Saturday morning gives the full arc from welcome and workshops through shared dinner, music and dance. Sunday at 09:30 is intentionally gentler and shorter. If you need to pace energy, choose the sessions that matter rather than forcing an eleven-hour day; the alcohol-free format supports a different rhythm.',
      'crowd_mix', 'FLINTA participants—women, lesbians, intersex, non-binary, trans and agender people—are centred, with Toulouse queer organisers and regional visitors meeting across ages. Cis men are explicitly not admitted. This boundary is part of the safety concept and must not be softened into “everyone welcome.”',
      'dress_code', 'No aesthetic code applies. Comfortable workshop clothes, layers for a long day and something that lets you dance are useful. Expression is welcome, but eligibility follows the stated FLINTA audience rather than how someone looks; nobody should be asked to perform gender at the door.',
      'host_inclusivity', 'The organiser builds the first edition around softness, sorority, alcohol-free participation and FLINTA community. Published transport and schedule information reduce uncertainty. Because it is a first edition, use the contact form for disability, food or language needs rather than assuming every practical detail has already been stress-tested.',
      'review_signal', 'First edition, so there is no honest attendee consensus yet. What is verifiable is substantial: two-day timetable, exact venue, audience boundary, alcohol-free policy, ticket structure and named workshops. The record treats “new” as uncertainty, not permission to recycle generic festival praise.',
      'source_urls', to_jsonb(array[
        'https://www.festivalsanspression.com/en/',
        'https://www.helloasso.com/associations/parenthese-31/evenements/festival-sans-pression',
        'https://metropole.toulouse.fr/associations/annuaire/parenthese'
      ]::text[]),
      'evidence_scope', 'official_first_edition_dates_times_venue_ticketing_audience_and_alcohol_free_policy',
      'research_status', 'officially_verified_future_first_edition',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('CONTACT Online Gender Identity Group — October 2026', jsonb_build_object(
      'entry_wait', 'There is no physical entry. Register in advance and test the private connection link, camera, microphone and chosen display name before 20:00. Do not forward the link; moderation depends on knowing who is entering. Join a few minutes early rather than making the group troubleshoot your device mid-introduction.',
      'best_arrival', 'Open the link around 19:50 from a private, quiet room with headphones if possible. The value is sustained dialogue between trans people, relatives and professionals, so multitasking or joining from public transport undermines both your own attention and others’ privacy.',
      'crowd_mix', 'Trans and questioning people, parents, partners, relatives and professionals can join across Occitanie without travelling to Toulouse. Ages and levels of understanding vary widely; some attend with lived experience, others with questions. The group is not a debate stage and nobody’s identity is an educational exhibit.',
      'dress_code', 'None—even camera use should follow the host’s rules rather than social pressure. Choose a display name and background that protect your privacy. Headphones, a charged device and a door you can close are the practical equivalents of venue preparation.',
      'host_inclusivity', 'CONTACT explicitly designs the session for dialogue around gender identity in family life. Registration and private links create accountability while widening regional access. Tell the team ahead of time about captioning, interpretation or other digital access needs; an online format is not automatically accessible to everyone.',
      'review_signal', 'Future confidential online group with no public star rating. Its value is supported by a repeated CONTACT format, confirmed date and time and clearly named participants—not by public reviews that would conflict with the event’s privacy purpose.',
      'source_urls', to_jsonb(array[
        'https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026',
        'https://www.asso-contact.org/asso/31/'
      ]::text[]),
      'evidence_scope', 'official_future_online_date_time_topic_audience_and_registration_requirement',
      'research_status', 'officially_verified_future_online_support_group',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Journées du Soin Communautaire #3', jsonb_build_object(
      'entry_wait', 'The five-day dates are confirmed, but session venues, capacities and registration rules are not yet published. Follow CLAR-T rather than arriving at its regular office. Workshops may require separate sign-up even if the wider gathering stays free; wait for the programme and reserve only the sessions you can genuinely attend.',
      'best_arrival', 'Build around the 20 November Trans Day of Remembrance core once times appear, then add workshops, shared meals or festivities that support rather than exhaust you. This is care infrastructure across five days, not a festival to “complete.” An opening orientation will likely be the most useful first contact when announced.',
      'crowd_mix', 'Trans people and CLAR-T’s Toulouse community sit at the heart, alongside queer, intersex, antiracist, decolonial, disability-justice and child-rights organisers, invited speakers and allies. The tenth anniversary should draw returning members as well as newcomers; individual sessions may have tighter audience boundaries.',
      'dress_code', 'No global look exists. Bring comfortable, weather-ready November layers and respect any masking, scent, access or safer-space request published for a session. Mourning, celebration, politics and shared food may occupy different rooms; dress for your own regulation rather than performing a single “queer event” aesthetic.',
      'host_inclusivity', 'CLAR-T describes an explicit community-care framework shaped by trans self-support, anti-racism, anti-ableism, accessibility and the wish to keep money from blocking participation. The fundraising page also names translation and interpretation as resources. Practical delivery must be checked against the final programme.',
      'review_signal', 'Third edition and tenth-anniversary gathering, but no 2026 attendee reviews exist yet. The strong evidence is organiser continuity, confirmed five-day span, political framework and transparent fundraising for food, access, speakers and interpreters. Exact rooms and times remain intentionally marked pending.',
      'source_urls', to_jsonb(array[
        'https://www.helloasso.com/associations/clar-t/collectes/journees-du-soin-communautaire-3-18-22-nov-2026-toulouse',
        'https://www.helloasso.com/associations/clar-t'
      ]::text[]),
      'evidence_scope', 'official_future_dates_organiser_anniversary_values_access_fundraising_and_programme_pending_status',
      'research_status', 'officially_verified_future_event_programme_and_venues_pending',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('CONTACT Toulouse Listening Group — November 2026', jsonb_build_object(
      'entry_wait', 'Advance registration is essential because the central address is private. This is not the same room as a public Centre LGBT+ drop-in and should not be located by guesswork. Keep the confirmation available, arrive quietly and contact the facilitator if travel disruption will make you late.',
      'best_arrival', 'Plan for 13:45, giving enough space to find the disclosed entrance and settle before 14:00. The date overlaps CLAR-T’s wider November gathering, so check your emotional and practical capacity rather than stacking support spaces back-to-back simply because both are queer.',
      'crowd_mix', 'LGBTQ+ people and relatives across generations are the core, with professionals present where relevant. The late-autumn session may include people returning from September and first-timers arriving with very different family situations. Listening is as valid as speaking, and no one should be pressed to reconcile on the day.',
      'dress_code', 'Ordinary, comfortable and weather-ready is enough. The meaningful rules concern confidentiality: no photography, no public location sharing and no retelling someone else’s disclosure. Bring any registration information and accessibility aids discussed with the organiser.',
      'host_inclusivity', 'CONTACT’s method gives sexual orientation, gender identity, family experience and professional questions room without turning one perspective into the default. Protected location and registration support safety. For access or language needs, direct contact before the meeting remains more reliable than assumptions.',
      'review_signal', 'Future support group with no public rating. It intentionally reuses CONTACT’s trusted format, not the September event’s exact text: this date has its own seasonal context and overlap with Toulouse’s trans community-care week. Facts come from the autumn 2026 programme.',
      'source_urls', to_jsonb(array[
        'https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026',
        'https://www.asso-contact.org/asso/31/coordonnees-occitanie-ouest-pyrenees'
      ]::text[]),
      'evidence_scope', 'official_future_date_time_audience_registration_and_confidential_address_policy',
      'research_status', 'officially_verified_future_support_group',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Girls Don''t Cry Festival 2026', jsonb_build_object(
      'entry_wait', 'Buy one night or the two-day pass before the event; the 19:00 opening can create a concentrated ticket scan as people explore the installation together. Door sales are advertised but cost more and depend on remaining capacity. Because re-entry is not allowed at La Cabane, arrive prepared for the full 19:00–01:00 stretch.',
      'best_arrival', 'Come at 19:00, not just for a late headliner. The festival is built as a whole environment—scenography, performance, creators and unexpected corners—and the 2026 running order will only be released in September. Early arrival also gives the Main Forte and access teams time to orient you calmly.',
      'crowd_mix', 'Queer and gender-expansive music lovers, feminist networks, artists, students, club regulars and first-timers mix across Toulouse and the region. The programme centres marginalised-gender artists rather than enforcing a simplistic audience-only gender gate. Expect more creative locals than destination tourists.',
      'dress_code', 'Wear the version of yourself that can dance, stand and move between levels for six hours: expressive looks, soft clothes, trainers, makeup or none all belong. There is no published fashion selection. Ear protection, layers and access planning are smarter than uncomfortable performance; noise-reduction equipment is available.',
      'host_inclusivity', 'La Petite co-builds the festival with volunteers and deploys Main Forte, a trained anti-violence team. The published framework adds zero tolerance for discrimination, free water, risk reduction, seating, step-free access, vibrating vests and sign-language-aware staff. Ask for help early; care infrastructure works best when used.',
      'review_signal', 'The 2026 edition is future and its artist schedule is still due in September. Confidence comes from six years of continuity, exact prices and hours, named safety system and exceptionally detailed access offer. No imaginary reaction to an unannounced running order has been added.',
      'source_urls', to_jsonb(array[
        'https://www.lapetite.fr/girlsdontcry/girls-dont-cry-festival-2026/',
        'https://halles-cartoucherie.fr/cabane-infos-pratiques/',
        'https://halles-cartoucherie.fr/cabane-accessibilite/'
      ]::text[]),
      'evidence_scope', 'official_future_dates_hours_prices_venue_access_safety_format_and_programme_pending_status',
      'research_status', 'officially_verified_future_flagship_event_programme_pending',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.events e
set event_intel = coalesce(e.event_intel, '{}'::jsonb) || r.patch,
    updated_at = timezone('utc', now())
from researched r
where lower(trim(e.city)) = 'toulouse'
  and lower(trim(e.name)) = lower(trim(r.name));

commit;

select 'places_with_complete_intel' as check_name, count(*)::bigint as result
from public.places
where lower(trim(city)) = 'toulouse'
  and coalesce(venue_intel->>'queue_wait', '') <> ''
  and coalesce(venue_intel->>'best_nights', '') <> ''
  and coalesce(venue_intel->>'crowd_mix', '') <> ''
  and coalesce(venue_intel->>'dress_code', '') <> ''
  and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
union all
select 'events_with_complete_intel', count(*)::bigint
from public.events
where lower(trim(city)) = 'toulouse'
  and coalesce(event_intel->>'entry_wait', '') <> ''
  and coalesce(event_intel->>'best_arrival', '') <> ''
  and coalesce(event_intel->>'crowd_mix', '') <> ''
  and coalesce(event_intel->>'dress_code', '') <> ''
  and coalesce(event_intel->>'host_inclusivity', '') <> ''
order by check_name;
