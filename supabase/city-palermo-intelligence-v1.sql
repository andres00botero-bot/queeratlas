-- Queer Atlas: Palermo venue and event intelligence
-- Researched 2026-08-13 from official pages, municipal records, current programmes and review consensus.
-- Idempotent. Sources remain in metadata; visitor-facing topic copy reads as direct editorial guidance.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

alter table if exists public.services
  add column if not exists service_intel jsonb not null default '{}'::jsonb;

with researched(name, patch) as (
  values
    ('Exit Drinks', jsonb_build_object(
      'queue_wait', 'There is rarely a formal rope line. The friction is finding a pavement table once the piazza fills: early drinks are easy, while Friday and Saturday after roughly 23:00 compress regulars and pre-club groups into a small footprint. Arrive before the late wave if conversation matters more than standing with a cocktail.',
      'best_nights', 'Choose Wednesday or Thursday for the version built on talking to whoever is behind the bar. Friday and Saturday bring the strongest social pulse and often work as the launch point for Exit10&Love. Palermo schedules move with seasons and festivals, so the current Instagram post beats any permanently printed “best night.”',
      'crowd_mix', 'Palermo LGBTQ+ regulars lead: gay men are visible, but lesbians, trans people, mixed queer friends and allies all appear. Pride and summer pull in Sicilian visitors and international travellers; ordinary weeks feel far more local. It is a community bar with tourist curiosity around it, not a tourist bar performing community.',
      'dress_code', 'Everyday Palermo night-out clothes work—tees, shirts, denim, dresses, trainers or something sharper before Fabric. There is no published appearance test. In warm months the practical code is breathable clothing for pavement drinking; save more theatrical looks for the named party if that is where the night is going.',
      'staff_inclusivity', 'Fresh 2026 comments repeatedly describe care with cocktails, genuine welcome and the value of an LGBTQ-run room. The record is not spotless: older and newer minority reviews mention rushed outdoor-table service or a staff misunderstanding. Expect personal neighbourhood hospitality rather than a scripted chain-bar experience, and raise a problem calmly in the moment.',
      'review_signal', 'The current cross-platform signal sits around four stars, with recent praise stronger than some older comments. Written feedback consistently values community, welcome and atmosphere; recurring criticism concerns drink consistency, crowding and table pressure. The city itself names Exit as an LGBTQ+ bar since 1996 and routed Pride past it in tribute.',
      'source_urls', to_jsonb(array[
        'https://palermoconcilia.it/welfare-di-prossimita',
        'https://turismo.comune.palermo.it/palermo-welcome-new-dettaglio.php?id=43266',
        'https://www.tripadvisor.it/Attraction_Review-g187890-d1643285-Reviews-Exit-Palermo_Province_of_Palermo_Sicily.html',
        'https://www.gayout.com/europe/italy/palermo/bars/exit-palermo'
      ]::text[]),
      'evidence_scope', 'municipal_identity_current_pride_role_recent_written_reviews_and_cross_platform_aggregate',
      'research_status', 'editorial_review_consensus_with_service_caveats',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Bunker Men''s Club', jsonb_build_object(
      'queue_wait', 'Ordinary entry is usually a short membership and payment exchange, not a famous door queue. The bigger variable is attendance: a weekday can be almost empty, while a promoted Friday or Saturday has enough bodies to animate the labyrinth. Arrive after 23:00 for crowd, earlier if you want the layout explained without pressure.',
      'best_nights', 'Friday Black Out and Saturday Macho Macho are the usual momentum choices, but the summer schedule overrides them: July–September 2026 is Friday and Saturday only except specials, with a closure after 15 August and reopening 4 September. Read the dated post, not an undated weekly graphic.',
      'crowd_mix', 'On standard nights this is an adult men-only room with gay and bisexual locals, varied ages and body types, plus some travellers finding the new Via Argenteria Gay Street. Reviews describe both younger men and mature regulars. Crowd size is inconsistent, and a quiet weekday can feel like a bar with only a handful of guests.',
      'dress_code', 'The code belongs to the event: naturist can mean mandatory nudity or the exact accessories stated; underwear and blackout nights follow different rules. Do not translate “men’s club” into one universal outfit. Bring valid ID, read membership conditions, respect consent and privacy, and leave phones away from adult areas.',
      'staff_inclusivity', 'Several current reviews praise attentive, friendly staff, strong cocktails and a discreet welcome across ages. Others criticise an underused play area, atmosphere or how entry was handled; one 2026 report alleges discriminatory treatment and cannot be independently resolved. Men-only audience rules are explicit, but consistent respectful application still matters.',
      'review_signal', 'Google-derived listings currently show roughly 4.1/5 from about 25 reviews. Praise focuses on bartenders, cleanliness and discretion; criticism focuses on low attendance, limited privacy and expectations of a larger darkroom. This is a compact cruise club whose success depends heavily on the chosen night, not a guaranteed packed maze.',
      'source_urls', to_jsonb(array[
        'https://bunkerpalermo.altervista.org/',
        'https://www.travelgay.com/venue/bunker-men-s-club',
        'https://www.gayout.com/pt/europe/italy/palermo/bars/bunker-mens-club',
        'https://www.unionesarda.it/en/italy/sicily39-s-first-quot-gay-streetquot-will-open-in-palermo-l7e82w0d'
      ]::text[]),
      'evidence_scope', 'official_theme_schedule_facilities_membership_and_current_mixed_review_consensus',
      'research_status', 'editorial_review_consensus_with_material_entry_and_crowd_caveats',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Maxximum Time', jsonb_build_object(
      'queue_wait', 'Reception is normally direct; this is not a nightclub queue. The useful question is whether the facilities have enough people at your chosen hour. Mid-afternoon can be very calm, while later Friday and weekend sessions usually offer more social energy. Do not arrive near closing and expect the full sauna value.',
      'best_nights', 'Friday late afternoon into evening is the most frequently useful recommendation in visitor reports. Saturday and Sunday are alternatives for a broader leisure crowd; a weekday is better when steam, hydro and quiet matter more than meeting people. Ask reception about any current theme or massage availability before paying.',
      'crowd_mix', 'Adult gay and bisexual men form the core, with Palermo regulars and visitors across ages. Reviews do not support a single body type or tourist-heavy profile. The balance shifts by hour: daytime leans toward facility use and mature locals, while later weekend sessions have the better chance of a mixed social crowd.',
      'dress_code', 'Streetwear disappears at the locker. Follow the venue’s towel, footwear, hygiene and consent rules; flip-flops are the sensible choice on wet surfaces. No one owes interaction in the adult areas, and a sauna ticket is never blanket consent. Ask before touching and protect your key and valuables.',
      'staff_inclusivity', 'Positive reports mention friendly English-capable reception, cleanliness and a comfortable welcome for visitors. Negative reports question price, maintenance or how quiet the venue felt rather than identifying one stable staff pattern. The fair read is generally helpful but not uniformly praised; request a tour if the layout or rules are unclear.',
      'review_signal', 'Current public aggregates sit around 3.7/5 from more than one hundred reviews, with a separate travel audience score near 3.3. Cleanliness, modern facilities and friendly help earn praise; low attendance at the wrong hour, pricing and occasional maintenance complaints pull the average down. Timing is the decisive practical detail.',
      'source_urls', to_jsonb(array[
        'https://www.maxximumtime.com/home1',
        'https://www.travelgay.com/palermo-gay-saunas',
        'https://wanderlog.com/place/details/6190321/maxximum-time'
      ]::text[]),
      'evidence_scope', 'official_facilities_and_contact_plus_large_cross_platform_review_consensus',
      'research_status', 'editorial_review_consensus_with_timing_and_maintenance_caveats',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Fabric — Exit10&Love', jsonb_build_object(
      'queue_wait', 'A promoted Saturday can concentrate arrivals around midnight, and the trip from central Palermo makes poor timing expensive. Buy or confirm entry through the organiser when offered, then arrive before the headline drag and dance-floor peak. Do not travel to Fabric on speculation: a non-Exit night is a different product.',
      'best_nights', 'Only an announced Exit10&Love or Pride finale belongs in this guide. Those Saturdays provide Palermo’s clearest large-scale queer club format; an ordinary Fabric date may be completely mixed. Start at Exit for atmosphere and current intelligence, but leave enough time for the north-west taxi before the main room fills.',
      'crowd_mix', 'The takeover draws gay men, drag audiences, lesbians, trans and non-binary partygoers, mixed friend groups and a younger Palermo club crowd. Pride weekends bring more Sicilian and international visitors. Because this is a branded event inside a mainstream venue, the promoter shapes the audience more strongly than the building does.',
      'dress_code', 'Polished clubwear, streetwear, mesh, colour, makeup and drag-adjacent looks all make sense; no verified permanent fashion filter is published for the queer edition. Dress for heat, dancing and a late finish. Check the exact ticket and door wording because mainstream house rules still apply beneath the takeover.',
      'staff_inclusivity', 'The inclusive signal comes primarily from Exit10&Love’s long queer programming and Palermo Pride’s choice of Fabric for the 2026 finale, not from a dedicated LGBTQ+ venue policy. Security and bar teams may belong to the host club. Raise issues with the queer organiser as well as venue management so responsibility is not blurred.',
      'review_signal', 'No clean, stable rating isolates Exit10&Love from Fabric’s ordinary programme, so a generic club score would mislead. The evidence instead confirms repeated Saturday positioning, drag and go-go format and official Pride-finale use. Visitor confidence should attach to the named edition and organiser, not every night at this address.',
      'source_urls', to_jsonb(array[
        'https://www.gay.it/locali-gay-a-palermo',
        'https://turismo.comune.palermo.it/palermo-welcome-new-dettaglio.php?id=43266',
        'https://www.instagram.com/exit_drinks/'
      ]::text[]),
      'evidence_scope', 'confirmed_recurring_queer_takeover_format_and_official_pride_finale_without_event_specific_aggregate',
      'research_status', 'officially_corroborated_event_space_not_permanent_queer_venue',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Prospero Enoteca Letteraria', jsonb_build_object(
      'queue_wait', 'Most visits are normal table availability rather than a queue. A reading, tasting or weekend breakfast can tighten the small room, so book or arrive near opening if the programme is the reason for going. On an ordinary early evening, the reward is precisely the absence of club-door theatre.',
      'best_nights', 'Go around aperitivo for books, natural wine and actual conversation; choose a listed cultural night when you want more community energy. Weekend morning service offers a completely different, softer use of the venue. It is not a late dance destination, so pair it with another stop rather than waiting for it to become one.',
      'crowd_mix', 'Queer locals, readers, writers, natural-wine people, couples and mixed friends share the tables. The venue’s own identity is explicitly queer and open, but the daily crowd is broader than an LGBTQ-only room. Its northern location and literary programme make locals more visible than bar-crawl tourists.',
      'dress_code', 'There is none beyond ordinary café and enoteca comfort. Personal style, quiet date clothes or whatever you wore all day will fit. Bring a layer if sitting outside and avoid dressing for a velvet-rope fantasy—the social signal here comes from books, food and conversation, not appearance selection.',
      'staff_inclusivity', 'Recent positive feedback describes courteous welcome and a calm space; the venue explicitly calls itself queer and open to all. Some older reviews criticise staff tone, and one politically charged complaint comes from the green-pass period rather than current inclusion practice. The evidence supports a queer mission without pretending every service interaction was perfect.',
      'review_signal', 'Platforms disagree: Google-derived listings are around 4.1/5 from more than two hundred reviews, Facebook much higher, and a small Tripadvisor set lower. Praise centres on atmosphere, wine and concept; criticism centres on service consistency. The written detail is more useful than blending unlike platforms into one false universal score.',
      'source_urls', to_jsonb(array[
        'https://www.prosperopalermo.com/',
        'https://www.prosperopalermo.com/menu.html',
        'https://restaurantguru.com/Prospero-enoteca-letteraria-Palermo'
      ]::text[]),
      'evidence_scope', 'official_queer_identity_menu_hours_and_cross_platform_review_consensus',
      'research_status', 'editorial_review_consensus_with_platform_variance',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('EPYC — European Palermo Youth Centre', jsonb_build_object(
      'queue_wait', 'Daytime access behaves like a cultural centre; a free queer party or major meeting can create a short registration or capacity check. There is no reason to queue for EPYC without knowing the programme. Arrive around the announced start for a talk, workshop or social night so the room’s purpose is clear from the beginning.',
      'best_nights', 'The best date is the calendar entry, not a generic Friday. Queer B!TCH and community sessions show how the building can shift from everyday youth hub to dance floor or political room. For casual use, early evening is easiest; for LGBTQ-specific connection, follow EPYC and Palermo’s community map before choosing a night.',
      'crowd_mix', 'Young Palermitani, students, organisers, artists and wider ARCI networks make up the everyday base. Queer-specific events bring LGBTQIA+ locals and allies across a broader age range. It is not designed around tourists, though visitors who respect the programme can enter a genuinely local civic and cultural space.',
      'dress_code', 'Ordinary study, café or cultural-event clothes are enough. A named techno or queer party may invite more expressive looks, but there is no permanent visual code. The meaningful etiquette is political and social: respect the audience, pronouns, consent and the fact that some meetings are organised spaces rather than entertainment.',
      'staff_inclusivity', 'The city’s official LGBTQIA+ mapping describes EPYC as hosting cultural, political, recreational and social activity for the community. That is stronger evidence of institutional intent than a tiny review sample. Ask the team about access or event rules directly; different organisers may use the building on different nights.',
      'review_signal', 'Only a very small public visitor-review base is visible, too weak for a responsible star-score conclusion. Better evidence comes from municipal inclusion mapping, published long opening hours and documented queer programming including a free 18+ electronic night in March 2026. No popularity claim has been manufactured from one review.',
      'source_urls', to_jsonb(array[
        'https://palermoconcilia.it/welfare-di-prossimita',
        'https://linktr.ee/epyc_palermo',
        'https://ra.co/events/2387006',
        'https://www.tripadvisor.com/Attraction_Review-g187890-d33114036-Reviews-EPYC_European_Palermo_Youth_Centre-Palermo_Province_of_Palermo_Sicily.html'
      ]::text[]),
      'evidence_scope', 'municipal_lgbtq_role_current_hours_and_confirmed_queer_programming_with_minimal_review_base',
      'research_status', 'officially_verified_community_space_review_consensus_unavailable',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Cinema De Seta — Cantieri Culturali alla Zisa', jsonb_build_object(
      'queue_wait', 'Festival screenings use tickets and fixed start times, so the practical risk is a sold-out session or late arrival rather than a club queue. Buy the film or pass in advance, reach the Cantieri with time to locate the correct hall, and do not assume a festival badge guarantees every seat.',
      'best_nights', 'During Sicilia Queer, opening, closing and guest-present sessions carry the strongest collective energy; a smaller afternoon screening is better for concentrated cinema and discussion. Outside that programme, follow Cinema De Seta’s mixed calendar. The building alone is not a year-round queer destination.',
      'crowd_mix', 'Filmmakers, critics, Palermo culture workers, queer communities, students and international festival visitors meet here, with individual films attracting their own audiences. Under Queer adds younger Italian makers; retrospectives pull cinephiles beyond LGBTQ nightlife. Locals and serious festival travellers outweigh casual club tourists.',
      'dress_code', 'There is no appearance policy. Comfortable cinema clothes, creative festival looks and ordinary Palermo daywear all belong. Bring layers for air-conditioned screenings and shoes suitable for crossing the industrial campus. Tickets, timing and curiosity matter; glamour is optional even on closing night.',
      'staff_inclusivity', 'Sicilia Queer’s sixteen-year programme and explicit work across queer, trans, feminist and non-normative cinema provide a deep inclusion record. Venue operations are shared with the municipal Cantieri, so access questions should be sent before arrival. A cultural mission does not automatically solve every physical barrier in an industrial complex.',
      'review_signal', 'A generic venue rating would collapse municipal exhibitions, ordinary screenings and the queer festival into one unhelpful number. Confidence comes from the 2026 programme itself: more than eighty films, exact ticket structure, international juries, emerging-maker work and a free closing party. The event record is richer than an aggregate.',
      'source_urls', to_jsonb(array[
        'https://www.siciliaqueerfilmfest.it/edizioni/sicilia-queer-2026',
        'https://www.comune.palermo.it/vivere-il-comune/luoghi/cantieri-culturali-alla-zisa/',
        'https://turismo.comune.palermo.it/palermo-welcome-luogo-dettaglio.php?det=21&id=171&tp=68'
      ]::text[]),
      'evidence_scope', 'official_festival_programme_ticketing_and_municipal_venue_information',
      'research_status', 'officially_verified_event_space_not_permanent_queer_venue',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Palazzo Cutelli LGBTQ House', jsonb_build_object(
      'queue_wait', 'There is no walk-in lobby queue; coordinate arrival with the hosts because this is a five-room property, not a permanently staffed hotel desk. Send the arrival time before landing and keep the contact available. During Pride or festival week, room availability—not reception speed—is the real bottleneck.',
      'best_nights', 'The property works every night as a quiet base, with greatest value when local advice and breakfast help frame the next day. Book early for Palermo Pride and Sicilia Queer. Guests wanting nightlife at the bedroom door may prefer elsewhere; Cutelli suits travellers who want host contact and can walk ten to twenty minutes.',
      'crowd_mix', 'LGBTQ travellers are explicitly centred, while couples, solo guests and other respectful visitors use the small property. International guests appear throughout the reviews, but the scale stays domestic rather than resort-like. You are sharing a hosted house atmosphere, not disappearing into an anonymous party hotel.',
      'dress_code', 'None. This is accommodation, so comfort and respect for shared rooms are the only useful code. Ask before bringing unregistered visitors, keep late-night noise down and tell the hosts about massage or breakfast needs in advance. The personal environment depends on treating it like a home as well as a booking.',
      'staff_inclusivity', 'Hosts are the strongest part of the evidence: verified Booking guests score staff around 9.5/10 and repeatedly describe warmth, practical help and welcome. The official property positioning is LGBTQ-focused. This is unusually consistent across platforms, although a small hosted property always depends on direct communication around arrival and needs.',
      'review_signal', 'Booking currently shows 8.7/10 with cleanliness 9.3, comfort 9.1 and value 9.1; another verified accommodation platform reports about 9.3/10. Praise repeats for immaculate rooms, breakfast and hosts. The useful caveats are a modest walk from the deepest centre, variable Wi-Fi and occasional street noise.',
      'source_urls', to_jsonb(array[
        'https://www.palazzocutelli.com/en/',
        'https://www.booking.com/reviews/it/hotel/palazzo-cutelli.en-gb.html',
        'https://www.bed-and-breakfast.it/en/sicily/palazzo-cutelli-bedbook-palermo/10883',
        'https://wanderlog.com/place/details/5460378/palazzo-cutelli-bedbook'
      ]::text[]),
      'evidence_scope', 'official_lgbtq_positioning_and_multi_platform_verified_guest_consensus',
      'research_status', 'strong_verified_review_consensus',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Barcarello Rocks', jsonb_build_object(
      'queue_wait', 'There is no entrance, staff or managed queue. Parking and the rough fifteen-minute path are the bottlenecks in good weather. Go in daylight, allow enough time to return before dusk and never treat an online map pin as a promise of easy access, facilities or a particular crowd.',
      'best_nights', 'This is a daytime coastal stop, not a night venue. Warm weekday afternoons reduce weekend congestion; calm sea and dry ground matter more than any social calendar. If swimming or sunbathing is the goal, check weather and transport first. After-dark cruising adds terrain and personal-safety risks that Queer Atlas does not recommend.',
      'crowd_mix', 'Gay and bi men and naturist visitors are documented around the rocks, alongside ordinary hikers, swimmers and people using the wider coast. Locals are more likely to know the discreet sections; tourists may follow community tips. Nobody’s presence, clothing or nudity signals consent or guarantees they are part of a queer crowd.',
      'dress_code', 'Swimwear, sun protection and sturdy water or trail shoes are the practical essentials; the shore is rocky and the path uneven. Naturism is associated with parts of the area, but follow current local rules and the behaviour of the exact section. Carry water and take every item and piece of litter back out.',
      'staff_inclusivity', 'There is no staff and therefore no inclusion or safeguarding team. Your safety depends on daylight, weather, consent, environmental care and an independent return plan. Tell someone where you are going, keep valuables minimal and leave immediately if another person’s behaviour or the terrain feels wrong.',
      'review_signal', 'Community cruising directories describe high use, privacy and a rough fifteen-minute approach, while local travel discussion confirms Barcarello as a swimming coast. This is self-reported and not an official managed LGBTQ beach. The natural setting is verified; attendance, nudity and cruising conditions can change without notice.',
      'source_urls', to_jsonb(array[
        'https://www.gays-cruising.com/it/cruising/barcarello_palermo_italia_111958',
        'https://www.reddit.com/r/palermo_city/comments/14zenwu',
        'https://it.wikipedia.org/wiki/Turismo_LGBT'
      ]::text[]),
      'evidence_scope', 'community_reported_gay_naturist_use_route_and_terrain_with_public_coast_context',
      'research_status', 'community_verified_unmanaged_natural_area_conditions_variable',
      'updated_at', '2026-08-13T00:00:00Z'
    ))
)
update public.places p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || r.patch,
    updated_at = timezone('utc', now())
from researched r
where lower(trim(p.city)) = 'palermo'
  and lower(trim(p.name)) = lower(trim(r.name));

with researched(name, patch) as (
  values
    ('Bunker Ferragosto Surprise Party — 14 August 2026', jsonb_build_object(
      'entry_wait', 'Allow time for the men-only membership and admission check; the line itself is normally short. This is a confirmed holiday special rather than the standard Friday format. Arrive before the 01:00 draw if that matters and give reception space to explain the labyrinth and consent rules.',
      'best_arrival', 'Around 23:00 balances a formed room with time to learn the layout. Arriving earlier suits anyone who wants a calmer orientation; after midnight brings more holiday energy. The organiser has deliberately kept the party theme a surprise, so come for the club rather than one promised performance.',
      'crowd_mix', 'Adult gay and bisexual men, mainly Palermo and Sicilian regulars with some holiday visitors, across varied ages. This is not an all-gender queer party. Attendance is not guaranteed, even on Friday, and the dark format makes respectful verbal consent more important rather than less.',
      'dress_code', 'Underwear, jockstrap, naked or normal dress are all explicitly suggested, not one mandatory uniform. Bring ID and minimal valuables. Phones stay away from adult zones; any amount of clothing or darkness leaves consent fully intact, and anyone can stop an interaction at any point.',
      'host_inclusivity', 'Bunker publishes the men-only audience and named theme clearly, while current reviews often praise friendly staff. Mixed entry and service reports mean first-time expectations should be discussed at reception. Inclusive operation here means respectful treatment within the stated audience, not pretending the event is open to everybody.',
      'review_signal', 'This future special has no attendee consensus. The organiser has confirmed all four Ferragosto dates, flexible dress options, the 01:00 draw and the later closure. Broader venue reviews remain mixed on crowd size, so a holiday listing is not presented as a guarantee of a packed room.',
      'source_urls', to_jsonb(array['https://bunkerpalermo.altervista.org/ferragosto-al-bunker-12-13-14-15-agosto/','https://www.gayout.com/pt/europe/italy/palermo/bars/bunker-mens-club']::text[]),
      'evidence_scope', 'official_specific_holiday_date_programme_dress_guidance_and_current_venue_review_context',
      'research_status', 'officially_verified_future_special',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Bunker Ferragosto Closing Party — 15 August 2026', jsonb_build_object(
      'entry_wait', 'This confirmed Saturday is both Ferragosto and the last Bunker night before 4 September, so attendance may concentrate later than usual. Membership and payment happen at the same compact entrance. Arrive with ID before the 01:00 draw and do not assume an old membership remains valid after reopening.',
      'best_arrival', 'Around 23:00 leaves time to understand the club before the closing-party peak. Go earlier for easier reception contact, later for the stronger chance of a full room. The point is a final local night before the break, not a large stage show with a fixed running order.',
      'crowd_mix', 'Adult gay and bisexual men from Palermo and across Sicily, plus holiday visitors, with varied ages and bodies. The closing date can pull back regulars who skipped quiet summer weekends. It remains a men-only cruise-club event, not a broad all-gender Pride party.',
      'dress_code', 'The holiday post suggests underwear, jockstrap, naked or normal, leaving guests more choice than a strict theme night. ID, minimal valuables and consent awareness matter more than styling. Photography belongs nowhere in adult areas, and a closing party never relaxes another person’s boundaries.',
      'host_inclusivity', 'The organiser clearly publishes audience, address, dress options, closure and the upcoming membership change. Current reviews often praise discreet staff, while a minority report poor entry experiences. Ask questions before paying and expect house rules to be applied consistently across ages and nationalities.',
      'review_signal', 'The date and closing status are official, but satisfaction and turnout cannot be known in advance. Wider Bunker feedback supports friendly cocktails and discretion while warning that crowd size varies. The record gives users the verified special details without calling an unreviewed future night “unmissable.”',
      'source_urls', to_jsonb(array['https://bunkerpalermo.altervista.org/ferragosto-al-bunker-12-13-14-15-agosto/','https://bunkerpalermo.altervista.org/closed-party-reopen-party-2/']::text[]),
      'evidence_scope', 'official_specific_closing_date_dress_guidance_closure_and_membership_change',
      'research_status', 'officially_verified_future_closing_party',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Bunker Reopen Party — 4 September 2026', jsonb_build_object(
      'entry_wait', 'Reopening and a new membership system can make reception slower than an ordinary Friday. Read Freedom Circuit requirements beforehand, bring the required ID and arrive before the after-midnight wave. Do not assume a card used before the summer closure automatically covers the new membership year.',
      'best_arrival', 'Around 22:30–23:00 gives staff time to handle registration and explain any reopening changes. Later offers more atmosphere but less patience at a small front desk. The useful purpose of this date is reconnecting with the local men’s scene after the closure, not chasing an unannounced headline act.',
      'crowd_mix', 'Adult gay and bisexual men, returning Palermo regulars, Sicilian weekend visitors and curious first-timers. A reopening should draw more locals than a quiet ordinary Friday, but turnout is still future and cannot be guaranteed. The club remains men-only under its stated format.',
      'dress_code', 'The reopening notice does not publish one mandatory outfit, so use normal cruise-club nightwear unless a later flyer says otherwise. Bring ID and minimal valuables. Membership establishes access, not consent; phones, privacy and interaction rules remain fully in force.',
      'host_inclusivity', 'The club has given unusually clear advance notice of closure, reopening date and Freedom Circuit transition. That transparency helps visitors prepare. Current staff feedback is mostly warm but not unanimous, so the first night will also test whether new registration is explained consistently and respectfully.',
      'review_signal', 'This future reopening has no attendee reviews. The date and membership change are directly confirmed by the organiser, while the established venue review base gives context on staff and variable crowd size. No prediction about a sold-out room has been converted into fact.',
      'source_urls', to_jsonb(array['https://bunkerpalermo.altervista.org/closed-party-reopen-party-2/','https://bunkerpalermo.altervista.org/']::text[]),
      'evidence_scope', 'official_reopening_date_seasonal_closure_and_new_membership_system',
      'research_status', 'officially_verified_future_reopening',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Palermo Pride 2026', jsonb_build_object(
      'entry_wait', 'The march was open and free, with gathering from 16:00 rather than a controlled ticket queue. The evening programme at the Cantieri was also free; the later Fabric party had its own club entry. These are three different arrival systems, and moving between them required planning rather than one all-access assumption.',
      'best_arrival', 'The complete day began at the 16:00 Via Roma gathering, before the 17:00 departure. Joining early gave the political and community context; arriving at the Cantieri around 20:00 captured the live stage and Rainbow Party. The final club was optional, out of centre and much later.',
      'crowd_mix', 'LGBTQIA+ Palermitani, families, activists, associations, artists, allies and visitors filled the route. The deliberate stop past Exit connected present Pride to local venue history. The Cantieri widened the mix further through live performance, DJs and a free public programme.',
      'dress_code', 'There was no gate or appearance code for the march. Sun protection, water and shoes for a long central route mattered more than spectacle, though flags and expressive Pride looks were everywhere. Fabric’s later security rules were separate; march participation never guaranteed club admission.',
      'host_inclusivity', 'The official programme foregrounded inclusion, community organisations and a free finale, while Palermo’s municipal RE.A.DY membership supplied a civic layer. Large public Pride still requires ordinary attention to heat, mobility, crowd density and police interaction; users with access needs should check route support directly each year.',
      'review_signal', 'This is a documented past event, so dates, route, timings, performers and venues come from the municipal tourism record rather than retrospective star ratings. Its editorial value is as a verified 2026 benchmark. Future Pride dates must be added separately and never inferred by shifting the calendar.',
      'source_urls', to_jsonb(array['https://turismo.comune.palermo.it/palermo-welcome-new-dettaglio.php?id=43266','https://www.comune.palermo.it/vivere-il-comune/eventi/giornata-nazionale-contro-lomolesbobitransafobia/']::text[]),
      'evidence_scope', 'official_city_date_route_timing_venues_and_programme',
      'research_status', 'officially_verified_past_event',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Sicilia Queer Filmfest 2026', jsonb_build_object(
      'entry_wait', 'Festival and daily passes reduced friction, but individual sessions still depended on seats. Online single-film tickets were the cleanest choice for a must-see title. The Cantieri is a campus, so arriving only minutes before the screening risked losing time finding Cinema De Seta, Sala Wenders or the correct outdoor space.',
      'best_arrival', 'A first visit worked best in late afternoon: one film, one conversation and enough time to understand the campus before an evening premiere. Opening and closing nights carried communal energy; daytime retrospectives offered the deepest focus. Under Queer on 23–24 May was its own young-filmmaker prelude.',
      'crowd_mix', 'Palermo queer communities met international filmmakers, critics, students, artists and dedicated cinephiles. Not everyone attending identified as LGBTQ+, and that intellectual breadth is part of the festival’s character. Under Queer brought younger Italian makers into a programme otherwise spanning local and global work.',
      'dress_code', 'No fashion code. Comfortable cinema layers, good walking shoes and a bag organised for multiple screenings were ideal. Evening guests could dress up for pleasure, but the programme valued attention over performance. Follow photography rules around artists and never record a film or private discussion without permission.',
      'host_inclusivity', 'Sixteen editions demonstrate sustained queer cultural work rather than seasonal branding. The 2026 programme included trans, lesbian, gay and formally radical cinema, emerging makers and international access through subtitles. Contact the festival in advance for physical, sensory or language requirements because the historic industrial campus varies by room.',
      'review_signal', 'The strongest evidence is the complete official programme: more than eighty films, exact dates, prices, juries, venues and a free closing party. A single consumer score would flatten a week of different works and rooms. This entry records the verified 2026 edition; it does not pretend to review every film.',
      'source_urls', to_jsonb(array['https://www.siciliaqueerfilmfest.it/edizioni/sicilia-queer-2026','https://www.siciliaqueerfilmfest.it/media-stampa/press-room/10020-edizioni']::text[]),
      'evidence_scope', 'complete_official_2026_dates_programme_ticketing_venues_and_editorial_framework',
      'research_status', 'officially_verified_past_flagship_event',
      'updated_at', '2026-08-13T00:00:00Z'
    ))
)
update public.events e
set event_intel = coalesce(e.event_intel, '{}'::jsonb) || r.patch,
    updated_at = timezone('utc', now())
from researched r
where lower(trim(e.city)) = 'palermo'
  and lower(trim(e.name)) = lower(trim(r.name));

with researched(name, patch) as (
  values
    ('Arcigay Palermo — Protego', jsonb_build_object(
      'booking_lead_time', 'Message or call before visiting so the team can route you to listening, legal, psychological or rapid-testing support. Public activity calendars change, and an appointment protects both privacy and staff capacity.',
      'best_time', 'Use the private contact during ordinary daytime hours rather than waiting for an urgent late-night situation. For rapid HIV or syphilis testing, follow the exact announced session and preparation instructions.',
      'client_mix', 'LGBTQ+ people across ages, people facing discrimination, those seeking sexual-health support and community members wanting connection. Some services are specialist, while social and cultural activity is broader.',
      'preparation', 'Share the minimum useful outline of your need, preferred safe contact method and any language or access requirement. Bring documents only when the team says they are relevant; never send sensitive originals through casual messaging.',
      'provider_inclusivity', 'Palermo is historically central to the Arcigay story, and the current committee combines rights, health and community support. Protego explicitly addresses discrimination and marginalisation rather than treating them as side issues.',
      'source_urls', to_jsonb(array['https://www.arcigay.it/palermo/','https://palermoconcilia.it/welfare-di-prossimita']::text[]),
      'research_status', 'officially_verified_community_service',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('La Migration — Arcigay Palermo', jsonb_build_object(
      'booking_lead_time', 'Begin through the dedicated WhatsApp, SMS or Telegram number. Response time is not published, so contact before a deadline involving documents, housing or appointments rather than expecting immediate walk-in help.',
      'best_time', 'A private daytime message is the safest first step. State whether replying, calling or leaving a voice note is safe for you, especially when family, housing or immigration circumstances make visible contact risky.',
      'client_mix', 'LGBTQ+ migrants, refugees and newcomers whose identity, documents, language, housing or isolation overlap. It is not a generic tourist information desk and should remain available to people who need migration-aware support.',
      'preparation', 'Prepare a short explanation, preferred language, safe contact channel and the date of any urgent deadline. Do not send passports, case files or intimate history until a trusted worker explains why and how they are needed.',
      'provider_inclusivity', 'The service exists because migration and queer life cannot be handled as separate boxes. Its placement within Arcigay Palermo provides an LGBTQ framework, while private first contact reduces exposure for people in precarious situations.',
      'source_urls', to_jsonb(array['https://palermoconcilia.it/welfare-di-prossimita']::text[]),
      'research_status', 'municipally_verified_specialist_service',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Palermo Policlinico HIV Clinic', jsonb_build_object(
      'booking_lead_time', 'Call before attending to confirm whether the clinic accepts your visit directly and which service window applies. Clinical follow-up and testing may need different preparation, documentation or appointment timing.',
      'best_time', 'Use the published Tuesday–Thursday morning window and arrive with time for hospital navigation. Calling first is especially important around public holidays or when medication, exposure timing or symptoms make the question urgent.',
      'client_mix', 'People seeking HIV or infectious-disease testing, medical assessment and follow-up. The clinic is not limited to gay men, even though it is an important part of Palermo’s queer sexual-health map.',
      'preparation', 'Ask whether to bring health identification, prescriptions, prior results or exposure dates and whether fasting matters. For a recent potential exposure, say when it happened immediately so staff can assess time-sensitive options.',
      'provider_inclusivity', 'This is a clinical hospital route rather than peer support. The service is listed through a gay-health contact network, but individual experience data are limited; patients should expect confidentiality and can request respectful language and clear explanation.',
      'source_urls', to_jsonb(array['https://salutegay.it/contatti/']::text[]),
      'research_status', 'official_contact_directory_verified_clinical_service',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('Associazione Culturale Sicilia Queer', jsonb_build_object(
      'booking_lead_time', 'Contact well ahead for press, volunteering, industry access or collaboration; festival tickets follow their own published sale. The Via Catania address is an operational office, not a guaranteed daily public desk.',
      'best_time', 'Programme questions are easiest before the May festival rush. During festival week, use the ticket and venue channels printed for the exact screening instead of expecting the office to solve an immediate door issue.',
      'client_mix', 'Filmmakers, audiences, volunteers, critics, students, cultural partners and queer communities. Calls and opportunities can have precise eligibility, so read the named programme rather than treating every contact route as interchangeable.',
      'preparation', 'Include the relevant film, session, access need or collaboration idea, a clear deadline and concise contact details. For submissions, follow the formal call and technical rules; sending material to a general inbox is not a substitute.',
      'provider_inclusivity', 'Sixteen festival editions, Under Queer and sustained international programming show long-term work across queer forms and communities. Physical access can vary between partner venues, so specific accommodation still needs advance coordination.',
      'source_urls', to_jsonb(array['https://www.siciliaqueerfilmfest.it/','https://www.siciliaqueerfilmfest.it/edizioni/sicilia-queer-2026']::text[]),
      'research_status', 'officially_verified_cultural_service',
      'updated_at', '2026-08-13T00:00:00Z'
    )),
    ('RE.A.DY Palermo Anti-Discrimination Contact', jsonb_build_object(
      'booking_lead_time', 'Call the municipal numbers before going to Vicolo Palagonia so the correct office can receive the issue. Public-administration routing may take time; urgent danger belongs with emergency services, not an unanswered office visit.',
      'best_time', 'Weekday municipal hours are the practical window. Start early when the matter involves a written complaint, school, public service or deadline, and ask for the responsible office and any protocol number.',
      'client_mix', 'Residents and people dealing with discrimination connected to sexual orientation or gender identity in Palermo’s civic sphere. Community support, workplace law and criminal emergencies may require different organisations alongside this contact.',
      'preparation', 'Write a factual timeline, preserve relevant messages or documents and decide what outcome you are requesting. Keep copies and ask how personal data will be handled before submitting sensitive identity or health information.',
      'provider_inclusivity', 'Palermo has participated in the national RE.A.DY network since 2013 and publicly frames the work intersectionally. That is a meaningful municipal commitment, though it should be judged by practical response as well as public messaging.',
      'source_urls', to_jsonb(array['https://www.comune.palermo.it/vivere-il-comune/eventi/giornata-nazionale-contro-lomolesbobitransafobia/']::text[]),
      'research_status', 'officially_verified_municipal_service',
      'updated_at', '2026-08-13T00:00:00Z'
    ))
)
update public.services s
set service_intel = coalesce(s.service_intel, '{}'::jsonb) || r.patch,
    updated_at = timezone('utc', now())
from researched r
where lower(trim(s.city)) = 'palermo'
  and lower(trim(s.name)) = lower(trim(r.name));

commit;

select 'places_with_complete_intel' as check_name, count(*)::bigint as result
from public.places
where lower(trim(city)) = 'palermo'
  and coalesce(venue_intel->>'queue_wait', '') <> ''
  and coalesce(venue_intel->>'best_nights', '') <> ''
  and coalesce(venue_intel->>'crowd_mix', '') <> ''
  and coalesce(venue_intel->>'dress_code', '') <> ''
  and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
union all
select 'events_with_complete_intel', count(*)::bigint
from public.events
where lower(trim(city)) = 'palermo'
  and coalesce(event_intel->>'entry_wait', '') <> ''
  and coalesce(event_intel->>'best_arrival', '') <> ''
  and coalesce(event_intel->>'crowd_mix', '') <> ''
  and coalesce(event_intel->>'dress_code', '') <> ''
  and coalesce(event_intel->>'host_inclusivity', '') <> ''
union all
select 'services_with_complete_intel', count(*)::bigint
from public.services
where lower(trim(city)) = 'palermo'
  and coalesce(service_intel->>'booking_lead_time', '') <> ''
  and coalesce(service_intel->>'best_time', '') <> ''
  and coalesce(service_intel->>'client_mix', '') <> ''
  and coalesce(service_intel->>'preparation', '') <> ''
  and coalesce(service_intel->>'provider_inclusivity', '') <> ''
order by check_name;
