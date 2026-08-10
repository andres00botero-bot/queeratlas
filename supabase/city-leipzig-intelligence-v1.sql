-- Queer Atlas: Leipzig venue and event intelligence
-- Researched 2026-08-10 from official pages, current programmes and review consensus.
-- Safe to run repeatedly. No temporary tables are used.
-- Source names remain in metadata; visitor-facing topic copy reads as direct local guidance.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

with researched(name, patch) as (
  values
    ('Havanna Club Leipzig', jsonb_build_object(
      'queue_wait', 'There is no velvet-rope ritual here: the constraint is physical size. The narrow room fills easily after midnight and during the two happy hours, but arrivals normally move straight to the bar. Come before 21:00 for a seat and conversation; later means standing closer, louder talk and more smoke.',
      'best_nights', 'Any evening can work because the bar opens daily, but the mood changes more by hour than weekday. Early happy hour is calm and neighbourly; Friday and Saturday after midnight bring the strongest late-night pulse. A weekday is the better choice when you want locals, cheap drinks and an actual conversation.',
      'crowd_mix', 'This is a regulars-first Leipzig bar with queer locals at its centre, plus friends, Bach or trade-fair visitors and a modest stream of informed travellers. Reviews repeatedly describe a warm local room rather than a tourist attraction. German dominates, but visitors who engage naturally tend to fold in.',
      'dress_code', 'Wear what you would wear to a familiar neighbourhood bar: denim, trainers, a simple shirt or something brighter all fit. There is no evidence of fashion-based door selection. The practical warning is smoke, not style—choose clothes you can air afterwards if indoor smoking bothers you.',
      'staff_inclusivity', 'The recurring review signal is accommodating, friendly service and a room where newcomers can make contact without being treated as spectacle. Staff warmth scores more consistently than cocktail theatre. The entrance is small and some listings disagree on wheelchair access, so contact the bar directly for current step-free details.',
      'review_signal', 'Current aggregates cluster around 4.0–4.2/5 from roughly 136–274 ratings. Guests praise low prices, happy hour, conversation and staff; the dominant criticism is indoor cigarette smoke, with the tiny room described as both the charm and the limitation.',
      'source_urls', to_jsonb(array[
        'https://havanna-club-leipzig.de/',
        'https://wanderlog.com/place/details/4994087',
        'https://restaurantguru.com/Havanna-Club-Leipzig',
        'https://intravel.net/leipzig/nightlife/havanna-club',
        'https://qlist.app/venues/Leipzig/Havana-Club/cW5YRWF1TFFBL3ZFNzJvc25wc1BpUQ'
      ]::text[]),
      'evidence_scope', 'official_identity_hours_and_payment_plus_current_multi_platform_local_bar_review_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('APART Bar', jsonb_build_object(
      'queue_wait', 'Ordinary evenings are usually an easy walk-in; karaoke, bingo and larger weekend groups are when tables become the scarce resource. Locals who come as a group often reserve. If the event matters, arrive near 18:00 or book ahead rather than appearing at peak karaoke and hoping the terrace solves capacity.',
      'best_nights', 'Wednesday music-request evenings suit a relaxed midweek drink, while karaoke dates bring the most communal, sing-along energy. Friday and Saturday stay open later and feel more animated. In warm weather the front terrace is the sweetest move: sociable, central and far less smoky than the interior.',
      'crowd_mix', 'Gay and bisexual men form a visible core, but ages are mixed and lesbians, queer friends, allies, solo travellers and visiting groups appear comfortably. Reviews from both locals and visitors describe it as a broad scene lounge rather than a narrow pickup bar. Event nights diversify the room further.',
      'dress_code', 'Smart-casual, jeans, trainers and everyday city clothes all work. There is no published fashion code and no recurring review pattern of appearance-based refusal. Bring a layer for the terrace and wear smoke-tolerant clothes inside; practical comfort matters much more than looking club-ready.',
      'staff_inclusivity', 'Recent 2025 reviews are strongly positive about attentive, humorous and family-like service, including solo guests and larger reserved groups. Older reviews include isolated cold or rude encounters, so the honest consensus is warmly inclusive with occasional inconsistency. Wheelchair access is specifically praised in a current review.',
      'review_signal', 'Google-derived aggregates report about 4.2/5 from 161–168 reviews, while Tripadvisor’s six-review sample is much harsher and therefore too small to stand alone. The broad pattern favours welcome, value and events; cigarette smoke is the most repeated practical complaint.',
      'source_urls', to_jsonb(array[
        'https://www.apart.bar/',
        'https://www.leipzig.travel/gastro/apart-bar',
        'https://wanderlog.com/place/details/1821741/apart-bar',
        'https://www.tripadvisor.de/Attraction_Review-g187400-d14082195-Reviews-Apart-Leipzig_Saxony.html',
        'https://www.misterbandb.com/gay-guide/germany/leipzig/50-bars-clubs/25253-apart-bar',
        'https://www.gay.de/germany/sachsen/leipzig/locations/sex/bar/apart/1036/'
      ]::text[]),
      'evidence_scope', 'official_hours_access_and_programme_plus_current_local_travel_and_queer_review_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Pixi Kollektivbar', jsonb_build_object(
      'queue_wait', 'No club queue defines Pixi, but the little room and courtyard can run out of comfortable space when drag, karaoke, bingo or a watch party lands. Regular bar evenings are simple walk-ins. For a named show, arrive close to opening and treat the suggested donation or ticket note as part of supporting the programme.',
      'best_nights', 'Wednesday is the clearest choice for smoke-sensitive guests and a softer neighbourhood feel. Thursday’s Bears & Friends night adds easy social structure once a month; Friday and Saturday carry more late energy. The best Pixi night is ultimately the event that fits you, because the collective calendar reshapes the crowd.',
      'crowd_mix', 'Queer Leipzig locals—students, artists, activists, FLINTA* people, trans and non-binary regulars, gay men and neighbourhood friends—set the tone. Travellers appear, but reviews describe a Kiez living room rather than a destination bar. Bears nights and drag events each tilt the mix without erasing the broader base.',
      'dress_code', 'There is no performance of exclusivity at the door. Vintage layers, political tees, denim, glitter, trainers and ordinary after-work clothes all sit naturally together. Dress for a small room that can become warm and loud; if smoke is a concern, verify the current smoke-free day rather than relying on old listings.',
      'staff_inclusivity', 'Community accounts consistently describe friendly staff, fair pricing and an actively queer safer-space ethos, not just passive tolerance. The collective publicly rejects inappropriate behaviour and offers solidarity options when money is tight. That does not promise a friction-free room, but inclusion is built into how the place operates.',
      'review_signal', 'Current local and queer listings repeatedly highlight warm staff, affordable drinks, drag and karaoke, with individual reviews calling it cosy, thoroughly queer and friendly. A stable large-platform score is not exposed consistently, so the signal is qualitative and multi-source rather than a manufactured number.',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/pixi_kollektivbar/',
        'https://www.leipzig-leben.de/pixi-kollektivbar-lindenaus-queere-kiezkneipe/',
        'https://pinksider.com/leipzig/clubs-bars/b1259/pixi-kollektivbar/?lang=de',
        'https://wanderlog.com/place/details/10826439/pixi-bar',
        'https://kreuzer-leipzig.de/restaurants/pixi',
        'https://www.queer.de/detail.php?article_id=57612'
      ]::text[]),
      'evidence_scope', 'current_collective_identity_award_local_reporting_and_cross_platform_guest_consensus',
      'research_status', 'editorial_review_consensus_without_stable_aggregate_score',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Café Ocka', jsonb_build_object(
      'queue_wait', 'There is no door line, but the café can become full and noticeably loud on weekend afternoons or during markets and workshops. Recent guests specifically mention crowding. Arrive near noon for the calmest table, or check the event post when the room is being used for a concert, community kitchen or project.',
      'best_nights', 'This is strongest as a daytime stop: weekday coffee for working or talking, weekend cake when you want more neighbourhood life. Special events can carry on beyond the regular 18:00 close and are the better route for meeting the collective community. Do not turn up late expecting a conventional bar.',
      'crowd_mix', 'FLINTA* organisers, queer and feminist locals, families, students, freelancers and Altlindenau neighbours share the tables. Tourists are a small minority unless they have sought the place out deliberately. The result feels community-rooted and multigenerational rather than scene-policed or designed for nightlife tourism.',
      'dress_code', 'Come exactly as you are: work clothes, vintage finds, trainers, practical layers and children’s gear all appear naturally. There is no door code. Accessibility is the more important practical issue—one recent guest reports stairs and a tight interior—so contact the café before visiting with a wheelchair.',
      'staff_inclusivity', 'The collective model is explicitly based on mutual recognition, care, fair work and cooperation. Reviews usually find the team gracious and service prompt, with vegan choices clearly welcomed rather than treated as an exception. No repeated exclusion pattern surfaced; physical access is the clearer limitation.',
      'review_signal', 'Google is reported at 4.7/5 from about 154 reviews and another aggregate gives 4.66/5 from 119. Guests praise vegan cake, kind service and cosiness; the useful caveats are peak noise, limited wheelchair access and a room that can feel crowded.',
      'source_urls', to_jsonb(array[
        'https://www.cafeocka.de/',
        'https://pulsleipzig.de/2024/10/05/cafe-ocka/',
        'https://restaurantguru.com/OCKA-Leipzig',
        'https://www.reviewhero.io/cafe-ocka-ff90',
        'https://www.urbanite.net/leipzig/locations/cafe-ocka/'
      ]::text[]),
      'evidence_scope', 'official_collective_hours_plus_current_local_editorial_and_cafe_review_consensus_with_access_caveat',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Secondhand & Café Gold', jsonb_build_object(
      'queue_wait', 'This is a browse-and-linger café, not a queue venue. Tables can feel cosier when shoppers and event guests overlap, but no chronic wait appears in reviews. Quieter weekday hours give you time for tea and the clothing rails; community dates are livelier and worth arriving near their announced start.',
      'best_nights', 'Use it by daylight for the full hybrid experience: coffee, vegan or Eastern European comfort food and second-hand browsing. A workshop, flea market or queer gathering adds the strongest social layer. Winter visits need warmer clothes—recent reviewers note that small heaters and blankets do not fully warm the room.',
      'crowd_mix', 'Queer women and FLINTA* locals give the café a recognisable community reputation, alongside vintage shoppers, students, neighbours and mixed friends. It is locally known as a lesbian-friendly meeting point without operating as a women-only space. Visitors arrive for the concept rather than mass tourism.',
      'dress_code', 'There is no dress code; half the pleasure is being surrounded by clothes you might buy. Vintage, oversized layers and practical café wear all fit. In cold weather, dress warmer than you would for a conventional heated café. Nothing in the evidence suggests appearance-based filtering.',
      'staff_inclusivity', 'Most current reviews call the staff friendly, cute or warmly welcoming and praise the relaxed room. One queer-community account describes a body-insensitive “bikini figure” tea comment, while another thread raises privacy concerns around promotional filming. These are isolated reports, but they deserve a real caveat rather than a perfect score.',
      'review_signal', 'Google-derived sources report roughly 4.6/5 from 138–171 reviews, with strong praise for hospitality, reasonable prices and the café-shop concept. The overall signal is positive; winter cold and a small number of awareness or privacy concerns complicate the safer-space reputation.',
      'source_urls', to_jsonb(array[
        'https://prinz.de/leipzig/locations/cafe-gold/',
        'https://restaurantguru.com/Secondhand-and-Cafe-Gold-Leipzig',
        'https://wanderlog.com/place/details/6976946/secondhand--cafe-gold',
        'https://pulsleipzig.de/2025/06/28/queerfriendly-locations-in-leipzig/',
        'https://www.reddit.com/r/Leipzig/comments/198448c/cafe_gold_kritik/'
      ]::text[]),
      'evidence_scope', 'current_cafe_reviews_local_queer_positioning_and_specific_community_awareness_caveat',
      'research_status', 'editorial_review_consensus_with_isolated_awareness_concern',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Cocks Bar Leipzig', jsonb_build_object(
      'queue_wait', 'Regular Thursday to Saturday entry is usually a direct ID-and-payment flow rather than a famous queue. Bear Weekend, mask parties and lights-out nights can concentrate arrivals after opening. Large bags and rucksacks belong in the cloakroom, so leaving them at the hotel makes the door quicker.',
      'best_nights', 'Thursday themes are the most deliberate: mask, underwear/naked or lights-out formats change both mood and dress. Friday and Saturday are later, more open-ended cruise nights; the Bear Weekend Friday brings the clearest bear, cub, daddy and chaser concentration. Read the exact calendar before choosing.',
      'crowd_mix', 'Adult men are the entire intended audience, with bears, leather and rubber fans, daddies, cruisers and local regulars most visible. Theme and festival weekends bring more visitors from outside Leipzig. This is not an all-gender queer bar and should never be described as one simply because it is LGBTQ+.',
      'dress_code', 'The base rule is 18+ with valid ID; ordinary clothes are fine on Just Cocks nights. Theme nights can mean underwear, naked or mask-led participation, so follow that edition rather than improvising at the door. Smoking is allowed, and the cloakroom costs extra for what you will not be wearing.',
      'staff_inclusivity', 'The official tone is playful, sex-positive and clear about payment, bags and minimum age. A smaller directory credits the team with a good mood and personal care, but independent written reviews are too thin to certify uniformly excellent handling. Consent and boundaries remain the guest’s practical compass.',
      'review_signal', 'The only substantial current audience metric found is 3.1/5 from 99 votes on a gay travel directory, with no written comments attached. Facilities and format are well verified, but detailed service consensus is not; this record deliberately avoids turning a bare star score into invented reasons.',
      'source_urls', to_jsonb(array[
        'https://cocks-bar.com/',
        'https://www.travelgay.com/venue/cocks-bar',
        'https://pinkuk.com/countries/europe/germany/saxony/leipzig/cocks-bar',
        'https://www.leipzig-baeren.de/party/'
      ]::text[]),
      'evidence_scope', 'official_current_hours_theme_faq_and_facilities_plus_limited_queer_directory_rating',
      'research_status', 'officially_verified_limited_independent_review_evidence',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Stargayte Sauna', jsonb_build_object(
      'queue_wait', 'Most visits begin with a normal reception explanation, not a long line. The venue itself recommends arriving before 20:00 on open-gender Tuesdays and Fridays to avoid waits, and registered Bear Sauna guests must still arrive early because registration does not guarantee entry. Peak events are the exception.',
      'best_nights', 'Monday is the value-and-sauna-ritual choice; Tuesday and Friday welcome all genders; Saturday runs through 06:00; Sunday’s reduced under-30 price makes the crowd younger without excluding older men. Bear Sauna dates add a warm community focus. Choose by audience, not by guessing which day is universally “best.”',
      'crowd_mix', 'Gay men remain the everyday core, with a broad range of ages and bodies. Open Days deliberately add women, lesbians, bi, straight, trans and non-binary guests; Bear Sauna shifts toward bears, cubs and chasers; Sunday skews younger. Reviews disagree on how social a random Saturday feels, so timing matters.',
      'dress_code', 'Swimwear is optional in the adult sauna context, but bath slippers are compulsory and charged if you do not bring your own. Towels, gel and private cabins can also cost extra. Pack your own slippers and towels if value matters; theme events may add separate dress or participation guidance.',
      'staff_inclusivity', 'First-time visitors, queer men and FLINTA* guests repeatedly praise open, helpful and familiar staff, plus strong cleanliness. A minority report stressed or unfriendly service and object to staff responses to criticism. The consensus is genuinely positive, but peak workload and pricing explanations can shape the welcome.',
      'review_signal', 'Current sources report about 4.4/5 from 205 Google reviews, with another collection surfacing 104 detailed comments. Size, cleanliness and staff are the leading strengths; extra towel, gel and slipper charges, mixed crowd energy and occasional cold areas drive most criticism.',
      'source_urls', to_jsonb(array[
        'https://stargayte.de/',
        'https://www.stargayte.de/',
        'https://intravel.net/leipzig/entertainment/stargayte-sauna',
        'https://massageinleipzig.de/stargayte-sauna',
        'https://www.gelbeseiten.de/gsbiz/ed9445ed-f365-43e6-ba1a-ce8622ac9ae0',
        'https://www.leipzig-baeren.de/sauna/'
      ]::text[]),
      'evidence_scope', 'official_current_audience_day_price_and_facility_rules_plus_large_mixed_review_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Twenty One Leipzig', jsonb_build_object(
      'queue_wait', 'The club explicitly recommends arriving early because of current demand. Expect an ID check and real door selection rather than an automatic ticket scan; reviews also describe waiting only to have all-male groups refused under the “balanced gender ratio” policy. A queer takeover does not remove the building’s door logistics.',
      'best_nights', 'For Queer Atlas, go on a confirmed KissKissBangBang date—the recurring second-Friday concept changes the audience and values of the room. A normal Twenty One night is mainstream electronic clubbing. Check the live event, ticket and genre in the app before treating the venue as queer.',
      'crowd_mix', 'KissKissBangBang deliberately mixes lesbians, gay men, trans and non-binary guests, drag performers, gender-bending crowds and allies. Outside that promoter night, the club aims for a mainstream “balanced” gender mix and can reject male-only groups. The promoter, not the address, determines the queer ratio.',
      'dress_code', 'The published code is relaxed but bans jogging bottoms, sandals and football shirts. Bring original photo ID; guests using a residence permit are asked to carry a passport. On the queer night, expressive looks and drag fit naturally, but none of that guarantees an exemption from the venue’s security process.',
      'staff_inclusivity', 'The queer promoter explicitly rejects homophobia, sexism, racism, xenophobia and ageism. General venue reviews, however, allege unfriendly security and refusal of groups of men because no women accompanied them. Keep both truths visible: the party’s values are strong, while the host club’s standard door record is contested.',
      'review_signal', 'No stable current aggregate suitable for citation surfaced in this pass. The most actionable evidence is the club’s own ID, early-arrival, dress and gender-ratio policy plus independent complaints that the ratio rule has been applied to reject polite male groups.',
      'source_urls', to_jsonb(array[
        'https://www.twentyone-leipzig.de/',
        'https://www.kisskiss-bangbang.de/',
        'https://concerts50.com/venues/germany/leipzig/twentyone',
        'https://www.misterbandb.com/gay-guide/germany/leipzig/50-clubs/25252-kiss-kiss-bang-bang'
      ]::text[]),
      'evidence_scope', 'official_current_dress_id_demand_and_gender_ratio_policy_plus_queer_promoter_values_and_door_complaint',
      'research_status', 'editorial_review_consensus_with_material_host_door_caveat',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('WUEST at Pittlerwerke', jsonb_build_object(
      'queue_wait', 'WUEST is event-led, so there is no honest universal wait. For the Bear Party, advance tickets and arrival near the 20:00 opening are the low-friction route; a warehouse crowd arriving after pre-drinks creates a different flow. The final walk through the industrial site also needs more time than a city-centre doorway.',
      'best_nights', 'Go only for a named dinner, exhibition, concert or queer production. The October Bear Party is the major queer date, while ordinary dinner evenings showcase the architecture and food rather than nightlife. The converted forge feels most alive when the programme is large enough to use its industrial scale.',
      'crowd_mix', 'Each organiser supplies the audience. The Bear Party brings bears, cubs, chasers, leather men, puppies and friends from Leipzig and beyond; restaurant nights draw design and food crowds. It is not a permanent queer venue, so no fixed local-to-tourist ratio can honestly be attached to the building.',
      'dress_code', 'WUEST’s restaurant lists casual dress. The Bear Party says leather, shine, denim or simply yourself—“anything can, nothing must”—and is puppy-friendly. Comfortable shoes are wise because the industrial terrain can be uneven; expressive dress is welcome, but no fetish uniform is compulsory.',
      'staff_inclusivity', 'Restaurant reviews strongly praise charming, knowledgeable service, and the venue positions itself as a cross-cultural meeting platform. For the Bear Party, named organisers, visible lanyards, awareness leads and a route to mobility assistance provide more concrete safeguards than a generic inclusion promise.',
      'review_signal', 'The restaurant side is reported at 4.9/5 from 54 Google-derived reviews, especially for service, food and industrial atmosphere. That score does not rate the future Bear Party; event confidence comes instead from the organiser’s detailed awareness, access and programme information.',
      'source_urls', to_jsonb(array[
        'https://www.pittlerwerke.org/wuest',
        'https://www.provenexpert.com/wuest-leipzig/',
        'https://www.opentable.de/restaurant/profile/358968',
        'https://www.leipzig-baeren.de/party/',
        'https://www.eventleader.net/images/clients/Pittlerwerke/WUEST%20Locationbroschure.pdf'
      ]::text[]),
      'evidence_scope', 'official_industrial_event_role_restaurant_reviews_and_detailed_bear_party_access_awareness_material',
      'research_status', 'editorial_review_consensus_with_event_specific_overlay',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Motel One Leipzig-Nikolaikirche', jsonb_build_object(
      'queue_wait', 'Standard check-in begins at 15:00 and online quick check-in can remove much of the friction. Major football, Bach, CSD and WGT weekends can crowd the lounge and breakfast room even when reception copes well. Free luggage storage is the smarter plan if you arrive early instead of waiting for a room.',
      'best_nights', 'Choose this hotel for a compact centre weekend: Havanna, APART, Passage Kinos and the station are walkable. The 24-hour lounge is useful after a late return, but church bells and surrounding city life can disturb light sleepers. Ask for a quieter room rather than assuming every central room is silent.',
      'crowd_mix', 'City-break couples, solo travellers, business guests, Bach audiences, football groups and WGT visitors make the lobby internationally mixed. It is not a queer hotel, although its location is practical for the scene and same-sex couples are unremarkable within the broad guest base. Festival dates change the balance most.',
      'dress_code', 'There is no hotel dress code. Travel clothes work at reception, and relaxed smart-casual suits the lounge bar. Bring ID and booking details; compact 16 m² rooms have limited storage, so a streamlined wardrobe makes more sense than packing for a resort stay.',
      'staff_inclusivity', 'Large current datasets score staff and friendliness very highly, with many solo and international guests describing warm, helpful service. A few 2026 stays report rushed breakfast handling or an unfriendly reception encounter. No queer-specific complaint pattern surfaced, but neither is there a published LGBTQ+ service standard.',
      'review_signal', 'The hotel reports 8.9/10 from more than 5,100 ratings; Booking.com lists 8.5/10 from about 2,724 with staff at 9.3, and Tripadvisor 4.3/5 from 681. Location and staff lead; small rooms, breakfast crowding, bells and limited in-room amenities are the recurring trade-offs.',
      'source_urls', to_jsonb(array[
        'https://www.motel-one.com/en/hotels/leipzig/hotel-leipzig-nikolaikirche/',
        'https://www.booking.com/hotel/de/motel-one-leipzig.html',
        'https://www.booking.com/reviews/de/hotel/motel-one-leipzig.en-gb.html',
        'https://www.tripadvisor.com/Hotel_Review-g187400-d1382545-Reviews-Hotel_Motel_One_Leipzig_nikolaikirche-Leipzig_Saxony.html',
        'https://www.holidaycheck.de/hr/bewertungen-motel-one-leipzig-nikolaikirche/287e3b87-9abf-39a2-a048-bbcc90ef1cde'
      ]::text[]),
      'evidence_scope', 'official_current_checkin_room_and_guest_metrics_plus_multiple_large_verified_review_sets',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.places p
set
  venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || r.patch,
  updated_at = timezone('utc', now())
from researched r
where lower(trim(p.city)) = 'leipzig'
  and lower(trim(p.name)) = lower(trim(r.name));

with researched(name, patch) as (
  values
    ('Bears & Friends at Pixi — August 2026', jsonb_build_object(
      'entry_wait', 'This is a bar meet-up, not a ticketed club line. Pixi’s small room is the only pressure point, so arriving around the 19:00 start gives you space to settle and makes introductions easier. Later arrivals may stand, especially if the courtyard is limited by weather.',
      'best_arrival', 'Come between 19:00 and 19:30 while the hosts and regulars are still forming the room. It is easier to join a conversation before groups harden around tables. There is no advantage in treating this as a midnight event; the value is the slow social build.',
      'crowd_mix', 'Leipzig bears, cubs, chasers and friends form the centre, with local regulars outweighing visitors on a normal monthly edition. The wording welcomes friends rather than enforcing a body type or fetish identity. Pixi’s broader queer crowd may remain around the edges.',
      'dress_code', 'No bear uniform is required. Jeans, tees, plaid, trainers, leather accents or whatever you usually wear to Pixi all work. Dress for a small bar, not a fetish inspection, and check the venue’s current smoking note if that affects what you wear.',
      'host_inclusivity', 'The organiser frames the series around easy connection for bears and friends, while the host bar brings collective, feminist safer-space practice. There is no separate published event code for this monthly date, so use the venue team or visible organisers if a boundary issue appears.',
      'review_signal', 'Future recurring edition; no post-event rating exists for 13 August 2026. Confidence comes from the established monthly calendar, Pixi’s independently praised queer welcome and the organiser’s decade-long community programme rather than invented attendee quotes.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig-baeren.de/',
        'https://www.leipzig-baeren.de/party/',
        'https://pinksider.com/leipzig/clubs-bars/b1259/pixi-kollektivbar/?lang=de',
        'https://wanderlog.com/place/details/10826439/pixi-bar'
      ]::text[]),
      'evidence_scope', 'future_recurring_event_official_date_format_and_host_venue_review_consensus',
      'research_status', 'officially_verified_future_recurring_event',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Aidshilfe Leipzig Counselling & Rapid Testing — August 2026', jsonb_build_object(
      'entry_wait', 'This is appointment-led healthcare, not open queuing. Call during office hours; email appointments are explicitly not issued. Arrive a few minutes before the assigned time with questions in mind, and do not rely on the 15:00 public start as permission to walk in unbooked.',
      'best_arrival', 'Follow the time given by phone and allow a calm ten-minute buffer for finding the office. The useful preparation is knowing when a possible exposure happened, because different tests have different window periods. Staff can explain what is appropriate without judgement.',
      'crowd_mix', 'People seeking HIV or STI testing, PrEP or PEP information and sexual-health advice make up the audience across orientations and genders. This is mostly local healthcare use, not a social mixer. English is spoken, which makes the service more usable for international residents and visitors.',
      'dress_code', 'There is no dress code and no need to perform confidence. Wear ordinary comfortable clothes and bring only the documents or information requested when booking. Privacy and informed consent matter more than appearance; ask directly if you are unsure what a particular test involves.',
      'host_inclusivity', 'The service publicly offers confidential advice, English support and a direct phone route without moralising language. Its wider work includes HIV support, sexual education and specialist sex-work counselling. Medical suitability must still be assessed individually, so the team should answer clinical questions rather than this guide.',
      'review_signal', 'Future appointment session with no event rating. The intelligence is based on the provider’s current phone-only booking rule, published office hours, address, English-language offer and established counselling remit—not on fictional patient reviews.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig.aidshilfe.de/',
        'https://www.leipzig.aidshilfe.de/veranstaltungen',
        'https://www.leipzig.aidshilfe.de/beratung'
      ]::text[]),
      'evidence_scope', 'future_health_session_official_booking_language_contact_and_service_information',
      'research_status', 'officially_verified_future_health_session',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Bärensauna at Stargayte — August 2026', jsonb_build_object(
      'entry_wait', 'Register by 18:00 on 21 August to receive the €5 discount, but registration does not reserve capacity. Entry is paid at the sauna and the reduced price applies only when entering by 19:00. Arriving soon after the 13:00 start is the clearest way to protect both access and discount.',
      'best_arrival', 'Aim for 13:00–15:00: the crowd forms gradually, you get a full sauna afternoon and there is time to learn the large layout before it becomes busier. Do not leave the first arrival until 18:55. Same-day re-entry follows the venue’s current pause-card rules.',
      'crowd_mix', 'Bears, cubs, chasers and male friends lead the day, with Leipzig regulars joined by regional visitors. The organiser states that all men are welcome, so body size, age and bear label are not entry tests. It remains a men-centred sauna date, not an all-gender Open Day.',
      'dress_code', 'No costume is required inside the sauna, but bath slippers are compulsory; bring your own to avoid buying them. Towels and gel cost extra unless you pack them. A simple arrival outfit and a small practical bag beat elaborate clubwear for an afternoon built around heat, water and play.',
      'host_inclusivity', 'The event lowers price through individual registration and explicitly welcomes all men, while the venue’s first-timer reviews frequently praise open, helpful staff. Registration asks for personal details, so read the form and privacy terms before submitting. Consent and sauna etiquette remain essential throughout.',
      'review_signal', 'Future dated edition with no attendee rating. Stargayte itself carries a strong current review consensus around size, cleanliness and staff; the event-specific facts—deadline, discount, no guaranteed entry and male welcome—come from the live registration page.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig-baeren.de/sauna/',
        'https://stargayte.de/',
        'https://intravel.net/leipzig/entertainment/stargayte-sauna',
        'https://massageinleipzig.de/stargayte-sauna'
      ]::text[]),
      'evidence_scope', 'future_event_official_registration_deadline_price_capacity_and_audience_rules_plus_host_reviews',
      'research_status', 'officially_verified_future_event_with_host_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('QueerBLICK: Strange River', jsonb_build_object(
      'entry_wait', 'Buy a cinema ticket rather than planning around a door queue. The monthly series uses a defined auditorium and popular titles can take the better seats first. The included drink begins at 20:00, giving the foyer a social flow before the 20:30 screening instead of one last-minute crush.',
      'best_arrival', 'Arrive around 19:50–20:00 to collect or scan your ticket, choose your drink and meet the room before taking a seat. At 20:25 you lose the part that makes QueerBLICK more than an ordinary screening. The film is shown in its original version with subtitles.',
      'crowd_mix', 'Queer cinema regulars, students, couples, solo film lovers and allies mix across ages. Leipzig locals dominate a monthly series, while the central location and subtitled version make it accessible to visitors. Expect a film audience with social edges, not a party crowd.',
      'dress_code', 'There is none. Comfortable cinema layers and whatever feels like you are enough; the auditorium matters more than the foyer look. Bring the digital or printed ticket and remember that a drink is included from 20:00, so no separate bar styling or reservation is needed.',
      'host_inclusivity', 'The series identifies itself as a meeting point for Leipzig’s queer scene and anyone interested in thoughtful queer cinema. Passage Kinos publishes accessibility icons and offers a hearing loop in relevant rooms. Confirm the exact auditorium’s access directly if you need a specific accommodation.',
      'review_signal', 'Future screening with no attendee score. Confidence comes from an established monthly format, exact film and time, original-language presentation, included pre-film drink and the cinema’s detailed access information rather than invented reactions to a film not yet screened here.',
      'source_urls', to_jsonb(array[
        'https://www.passage-kinos.de/strange-river',
        'https://www.passage-kinos.de/queerblick',
        'https://www.passage-kinos.de/termine',
        'https://www.passage-kinos.de/tickets'
      ]::text[]),
      'evidence_scope', 'future_screening_official_time_language_ticket_social_format_and_cinema_access_information',
      'research_status', 'officially_verified_future_screening',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('QueerBLICK: Something You Said Last Night', jsonb_build_object(
      'entry_wait', 'The fixed-seat cinema format makes advance booking more useful than queue speculation. A full monthly edition means fewer preferred seats, not a selective door. Collect the included drink from 20:00 and let the audience arrive naturally before the 20:30 start.',
      'best_arrival', 'Use 20:00 as the real beginning. It gives you half an hour for the pre-film drink and conversation, then a calm move into the Universum auditorium. Arriving only at the advertised film time turns a queer meeting point into a rushed ticket scan and risks disturbing seated guests.',
      'crowd_mix', 'The trans-centred family story should draw trans and wider queer viewers, arthouse regulars, allies and people interested in representation beyond trauma clichés. The monthly base is local, with visitors helped by the original-language subtitled screening. Ages and identities are broader than a nightlife event.',
      'dress_code', 'No dress rule applies. Wear comfortable layers for a September cinema evening and bring your ticket. The film centres an intimate family holiday, so the room asks for attention rather than identity performance; no attendee owes anyone a personal discussion after the credits.',
      'host_inclusivity', 'The programme frames queer cinema as serious, emotionally rich film culture and selects a work that resists familiar trans narratives. The host cinema publishes physical-access and hearing-support information. For a specific seat or companion need, contact the venue before booking.',
      'review_signal', 'Future Leipzig screening with no local attendee rating. The assessment is grounded in the confirmed film, date, auditorium, subtitled format and established QueerBLICK social ritual; it does not recycle the August screening’s story or pretend to know audience satisfaction.',
      'source_urls', to_jsonb(array[
        'https://www.passage-kinos.de/queerblick',
        'https://www.passage-kinos.de/termine',
        'https://www.passage-kinos.de/tickets'
      ]::text[]),
      'evidence_scope', 'future_trans_centred_screening_official_date_auditorium_language_social_and_access_information',
      'research_status', 'officially_verified_future_screening',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Ballroom Showcase & Queer Performance Night', jsonb_build_object(
      'entry_wait', 'This is a ticketed theatre premiere, not a club door. Book through the performance venue once sales are live and leave time for the Spinnerei campus and Halle 18; the industrial complex is not a single street-front entrance. A fifteen-to-thirty-minute navigation buffer is sensible.',
      'best_arrival', 'Reach the Spinnerei early enough to find Halle 18, handle tickets and take in the room before curtain. The exact performance time must come from the live booking confirmation—the confirmed date alone is not permission to invent it. Late seating may depend on theatre policy.',
      'crowd_mix', 'Leipzig’s ballroom community, queer performers, dance audiences, fashion and theatre people, friends of the houses and curious newcomers should overlap. The collaboration can draw visitors beyond the usual scene, but the creative centre remains local and community-connected rather than a touring commercial ball.',
      'dress_code', 'Audience glamour is welcome but optional. Runway looks, club creativity, statement makeup or ordinary theatre clothes can all coexist; the performance belongs to the stage, so spectators are not required to compete. Wear practical shoes for the industrial grounds and check cloakroom rules.',
      'host_inclusivity', 'The production is designed around ballroom history, queer self-expression, voguing and a safer space rather than borrowing the aesthetic without context. A recognised theatre and local collective share responsibility. Contact the box office for physical access because the campus route matters as much as the hall.',
      'review_signal', 'Future premiere with no audience review. The reliable evidence is the named local collective, producing theatre, exact date, venue and stated focus on queer identities and safer space; no star rating or crowd verdict has been fabricated.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig.travel/event/premiere-ballroom-showcase-queer-performance-night',
        'https://www.schauspiel-leipzig.de/spielplan/a-z/ballroom-showcase-queer-performance-night/',
        'https://www.spinnerei.de/'
      ]::text[]),
      'evidence_scope', 'future_premiere_official_date_venue_creative_team_artistic_focus_and_safer_space_description',
      'research_status', 'officially_verified_future_premiere',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Leipzig Bear Weekend 2026', jsonb_build_object(
      'entry_wait', 'The weekend is a chain of different entry systems, not one wristband queue. Free APART sessions, separately ticketed culture, registered sauna, Cocks entry and the WUEST party each have their own flow. Buy or reserve the parts you want and arrive at WUEST near 20:00 rather than assuming the box office solves everything.',
      'best_arrival', 'Friday’s 15:00 meet-and-greet is the smartest first-timer arrival because information, remaining tickets and conversation are built in. Saturday party-only visitors should reach the industrial site early. The weekend works best as a social arc—welcome, culture, sauna or city activity, party, then Sunday brunch—not a single late drop-in.',
      'crowd_mix', 'Bears, cubs, chasers, leather men, jeans and puppy communities form the core, with friends explicitly welcomed. Leipzig regulars mix with German and international weekend visitors, especially at the flagship party. The awareness wording centres male-read people who feel at home in the bear community.',
      'dress_code', 'There is no compulsory bear or fetish uniform. Leather, shine, denim and everyday self-expression are all named as valid, and the main party is puppy-friendly. Individual stops differ—sauna slippers, Cocks themes and practical walking shoes for the city programme each matter more than one weekend-wide look.',
      'host_inclusivity', 'The organisers publish a concrete awareness system: homophobia, racism, xenophobia, religious hostility, aggression and illegal drugs are rejected; lanyards identify the team and two orange-tank leads are main contacts. Mobility help is available for WUEST’s uneven terrain, and sign interpretation for the tram can be requested by deadline.',
      'review_signal', 'Future tenth-anniversary weekend with no 2026 attendee score. Confidence comes from the ninth full weekend edition, a minute-by-minute public programme, transparent prices, named awareness contacts, access routes and returning partner venues—not generic festival prose.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig-baeren.de/party/',
        'https://www.leipzig-baeren.de/sauna/',
        'https://www.leipzig-baeren.de/party/hotel/',
        'https://www.pittlerwerke.org/wuest',
        'https://cocks-bar.com/'
      ]::text[]),
      'evidence_scope', 'future_multi_venue_weekend_detailed_official_schedule_ticket_access_awareness_audience_and_dress_information',
      'research_status', 'officially_verified_future_flagship_event',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('33rd LeLe*Tre — Leipzig Queer Lesbian Meeting', jsonb_build_object(
      'entry_wait', 'This is a four-day cultural meeting spread across Frauenkultur and nearby partner rooms, so each programme item may have its own capacity. The detailed 2026 programme is still forthcoming. Once released, reserve limited workshops or screenings instead of assuming the broad festival dates guarantee a seat everywhere.',
      'best_arrival', 'Use the opening programme as your orientation point when times are published, then build around the sessions that genuinely fit you. Connewitzer Kreuz venues are close enough to connect on foot. Until the full schedule appears, any more precise arrival advice would be guesswork.',
      'crowd_mix', 'Queer lesbians across generations and backgrounds are the centre, with FLINTA* and invited wider audiences depending on each session. The long-running Leipzig base makes the gathering local and regional, while its thirty-third edition can draw returning visitors. Individual programme labels should govern who a room is for.',
      'dress_code', 'No festival-wide look is required. Comfortable clothes for workshops, talks, cinema and October movement between venues make sense; dressier cultural moments can be chosen for pleasure, not compliance. Read session-specific FLINTA* or audience notes once the programme is published.',
      'host_inclusivity', 'The gathering explicitly promises room for different queer-lesbian perspectives regardless of origin, religion, identity or disability and rejects racist, homo-, bi-, trans- and inter-hostility. That is a strong declared framework. Practical accommodations still depend on the final venue and session information.',
      'review_signal', 'Future thirty-third edition with no 2026 participant rating and no published detailed programme yet. The assessment rests on the official dates, multi-venue addresses, long institutional history and explicit inclusion statement; uncertain session details remain clearly marked as uncertain.',
      'source_urls', to_jsonb(array[
        'https://www.frauenkultur-leipzig.de/angebote/aktuelle-projekte/leletre-leipziger-lesbentreffen/',
        'https://www.frauenkultur-leipzig.de/',
        'https://www.frauenkultur-leipzig.de/kontakt/anfahrt/'
      ]::text[]),
      'evidence_scope', 'future_long_running_meeting_official_dates_audience_inclusion_venues_and_programme_status',
      'research_status', 'officially_verified_future_event_programme_pending',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Bärensauna at Stargayte — December 2026', jsonb_build_object(
      'entry_wait', 'The December date is confirmed for 13:00, but its dedicated registration window has not yet been published. Use the live sauna form closer to 19 December; previous editions tie the €5 reduction to registration and early entry without guaranteeing capacity. Do not reuse August’s deadline as if it applies.',
      'best_arrival', 'An early-afternoon arrival gives this winter edition its own rhythm: sauna heat, conversation and time to settle before evening. Watch the organiser page for the exact discount cut-off. December weather and holiday transport make a planned journey more useful than arriving just before any future deadline.',
      'crowd_mix', 'This end-of-year edition should bring Leipzig bears, cubs, chasers and male friends together with regional returners. It is more seasonal reunion than tourist event, though Christmas-market visitors may join. All men are welcome under the recurring format; no bear body type is an entry condition.',
      'dress_code', 'Bring bath slippers because the sauna requires them, plus your own towels if you want to avoid rental costs. No festive costume or fetish code is announced. Warm street layers for the December trip and a light, practical sauna bag are more useful than copying a club-night outfit.',
      'host_inclusivity', 'The recurring series states that all men are welcome and lowers the full entry price for correctly registered guests. Stargayte reviews frequently praise first-timer support, while a minority find service inconsistent under pressure. Check the new form’s privacy and eligibility wording when it goes live.',
      'review_signal', 'Future recurring date with no edition-specific reviews or live registration terms yet. The date and 13:00 start are verified; audience and venue guidance come from the recurring format and substantial host reviews. Unknown December deadlines are deliberately not invented.',
      'source_urls', to_jsonb(array[
        'https://www.leipzig-baeren.de/sauna/',
        'https://www.leipzig-baeren.de/',
        'https://stargayte.de/',
        'https://intravel.net/leipzig/entertainment/stargayte-sauna'
      ]::text[]),
      'evidence_scope', 'future_recurring_event_confirmed_date_time_and_format_with_registration_details_pending_plus_host_review_consensus',
      'research_status', 'officially_verified_future_date_registration_pending',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.events e
set
  event_intel = coalesce(e.event_intel, '{}'::jsonb) || r.patch,
  updated_at = timezone('utc', now())
from researched r
where lower(trim(e.city)) = 'leipzig'
  and lower(trim(e.name)) = lower(trim(r.name));

commit;

select 'places_with_complete_intel' as check_name, count(*)::bigint as result
from public.places
where lower(trim(city)) = 'leipzig'
  and coalesce(venue_intel->>'queue_wait', '') <> ''
  and coalesce(venue_intel->>'best_nights', '') <> ''
  and coalesce(venue_intel->>'crowd_mix', '') <> ''
  and coalesce(venue_intel->>'dress_code', '') <> ''
  and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
union all
select 'events_with_complete_intel', count(*)::bigint
from public.events
where lower(trim(city)) = 'leipzig'
  and coalesce(event_intel->>'entry_wait', '') <> ''
  and coalesce(event_intel->>'best_arrival', '') <> ''
  and coalesce(event_intel->>'crowd_mix', '') <> ''
  and coalesce(event_intel->>'dress_code', '') <> ''
  and coalesce(event_intel->>'host_inclusivity', '') <> ''
order by check_name;
