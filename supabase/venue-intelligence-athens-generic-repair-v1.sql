-- Venue Intelligence repair: athens, 19 individually researched places.
-- Idempotent: standalone UPDATE statements only; no helper relations.

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable minute range is published. The entrance becomes most pressured on Friday and Saturday after the live or drag programme begins.',
    'best_nights','Friday and Saturday are the core club nights, with pop dancing and occasional live or drag shows; early arrival suits the outdoor bar in summer.',
    'crowd_mix','Mostly gay men over 30, alongside international visitors, younger friends and straight-friendly mixed groups.',
    'dress_code','Polished casual clubwear fits the more grown-up atmosphere; no formal appearance rule is published.',
    'staff_inclusivity','Shamone is an established gay club with queer performers, but no staff training standard, welfare lead or complaint channel is publicly documented.',
    'source_urls','["https://www.shamone.gr/contact","https://www.thisisathens.org/nightlife/shamone"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='46 Konstantinoupoleos Avenue, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=319
  and lower(trim(p.name))='shamone'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait is available. Its compact room is most likely to reach entrance pressure during headline drag and weekend late-night sessions.',
    'best_nights','Friday and Saturday alternative queer parties and radical drag programmes are the clearest reason to visit; check the current event listing first.',
    'crowd_mix','A deliberately mixed LGBTQIA+ audience, with trans and non-binary guests, drag communities, younger queer clubbers and allies.',
    'dress_code','Alternative, expressive and gender-fluid clubwear fits; individual fetish or costume themes should be checked event by event.',
    'staff_inclusivity','Trans and queer artists are central to the programme, but no public staff safeguarding training or named reporting contact was located.',
    'source_urls','["https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs","https://www.thisisathens.org/nightlife/clubs/where-to-catch-drag-shows-in-athens"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='10 Keleou, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=320
  and lower(trim(p.name))='bequeer'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','The official city guide notes that this small club often develops a queue; no credible minute range is available, and Saturday is the main pressure point.',
    'best_nights','Saturday is the fullest two-room session; use the front room for pop and Greek music and the rear room for house or trance on programmed nights.',
    'crowd_mix','Predominantly gay men with younger LGBTQ+ dancers, local regulars, tourists and mixed friends.',
    'dress_code','Mainstream fitted clubwear is common; the venue publishes no detailed mandatory code.',
    'staff_inclusivity','Its long-running gay identity is documented, but no current employee inclusion training, welfare procedure or complaint route is publicly stated.',
    'source_urls','["https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs","https://www.epagelmatias.gr/company/sodade2-club-sto-gkazi"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='10 Triptolemou, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=321
  and lower(trim(p.name))='sodade'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable wait estimate is published. Seating and sightlines, rather than a long dance-club queue, are the practical constraint before Friday and Saturday shows.',
    'best_nights','Friday and Saturday late shows are the core experience; arrive before the performance for a better view in the intimate cabaret room.',
    'crowd_mix','A mixed LGBTQ+ and ally audience gathered around a troupe led mainly by trans women and drag queens.',
    'dress_code','Expressive evening clothes are welcome, while ordinary smart-casual attire also fits; no formal rule is published.',
    'staff_inclusivity','Trans women and drag artists lead the venue’s public identity and performance work; no separate staff-training or reporting protocol was found.',
    'source_urls','["https://www.thisisathens.org/de/nachtleben/koukles","https://www.thisisathens.org/nightlife/clubs/where-to-catch-drag-shows-in-athens"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='32 Zan Moreas, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=322
  and lower(trim(p.name))='koukles club'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured wait is published. The bar is most crowded on Friday and Saturday late evenings, but no defensible minute estimate is available.',
    'best_nights','Friday and Saturday provide the strongest social turnout; an earlier weekday evening is better for conversation among regulars.',
    'crowd_mix','Bears, larger gay men, admirers and other adult gay visitors, with a more mature and relaxed profile than a mainstream dance club.',
    'dress_code','Casual bar clothing is standard; bear-style looks are common but not a stated requirement.',
    'staff_inclusivity','The venue explicitly centres bears and admirers, but it publishes no staff inclusion training, welfare contact or discrimination-reporting process.',
    'source_urls','["https://www.thisisathens.org/nightlife/big-bar","https://maps.apple.com/place?place-id=IBE3F22D9F1A54181"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='12 Falaisias, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=323
  and lower(trim(p.name))='big bar'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No usual wait is published. Outdoor tables on Agias Eirinis Square are the main capacity pressure in pleasant weather and during evening DJ periods.',
    'best_nights','Daytime suits coffee and food; evening resident DJs strengthen the social mood, with Friday and Saturday the liveliest.',
    'crowd_mix','Gay locals and visitors mix with a broader young, creative and straight-friendly café crowd using the public square.',
    'dress_code','Relaxed café clothing works by day and casual going-out clothes by night; no dress code is published.',
    'staff_inclusivity','Rooster was founded as a gay café and hosts queer cultural activity, but no formal employee inclusion or complaint protocol is public.',
    'source_urls','["https://www.roostercafe.gr/index.php/about","https://www.thisisathens.org/cafes-bakeries/rooster"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=324
  and lower(trim(p.name))='rooster'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No stable wait applies because concerts and DJ events have different capacities. Sold-out ticketed programmes create the only predictable entrance pressure.',
    'best_nights','Choose a specifically listed queer party or drag event; ordinary calendar nights are mixed cultural programmes and should not be assumed LGBTQ+ centred.',
    'crowd_mix','The audience changes with the event: queer communities attend named LGBTQ+ programmes, while regular concerts and DJ nights draw a broad mixed crowd.',
    'dress_code','There is no venue-wide queer dress rule; use the named event brief, with casual creative clothing common on ordinary nights.',
    'staff_inclusivity','The venue hosts queer programmes, but its public site does not identify LGBTQ+ staff training, a welfare team or a discrimination-reporting path.',
    'source_urls','["https://sixdogs.gr/","https://sixdogs.gr/calendar","https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='6-8 Avramiotou, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=325
  and lower(trim(p.name))='six d.o.g.s'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical minute range is meaningful because each promoter controls ticket demand. Sold-out basement parties create the clearest door pressure.',
    'best_nights','Choose a named queer programme such as SLAM or Pride Dance; ordinary concerts and creative events are not automatically LGBTQ+ nights.',
    'crowd_mix','Promoter-dependent: queer dancers and performers centre named Pride or SLAM events, while the wider venue serves Athens creative communities.',
    'dress_code','Follow the event brief; expressive clubwear fits queer parties, while the building has no universal fashion code.',
    'staff_inclusivity','Queer events explicitly frame safer play, but Romantso publishes no permanent LGBTQ+ staff-training standard or named welfare contact across all programmes.',
    'source_urls','["https://romantso.gr/","https://www.romantso.gr.new.bios.gr/event.php?id=374","https://www.romantso.gr/event.php?id=346"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='3-5 Anaxagora, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=326
  and lower(trim(p.name))='romantso'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Not applicable: no current fixed public venue or regular entrance can be verified for this organisation record. Queue information belongs to each announced event.',
    'best_nights','Follow the official Athens Pride programme; there is no permanent Hub night at the database address.',
    'crowd_mix','Athens Pride events bring LGBTQIA+ communities, volunteers, organisations, families, allies and visitors; composition varies by programme.',
    'dress_code','Come as you are for community activities, while event-specific practical rules take precedence.',
    'staff_inclusivity','Athens Pride states that it creates safe, open spaces, and major events direct problems to visibly marked Pride people; this applies to events, not a fixed bar team.',
    'source_urls','["https://athenspride.eu/en/","https://athenspride.eu/en/poioi-eimaste/","https://cityfestival.thisisathens.org/event/athens-pride-street-party/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','organization_no_fixed_venue',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=327
  and lower(trim(p.name))='athens pride hub'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No appointment is needed and no minute range is published. Reception is busiest from 16:00 to 21:00, with Sunday identified by the venue as its busiest day.',
    'best_nights','Sunday has the strongest turnout; Wednesday Bear Day and the first-Wednesday Gusta Bear session are the clearest themed choices.',
    'crowd_mix','Men aged roughly 25-65, mainly 35-55, including gay, bisexual and other men; bears are especially visible on Wednesdays.',
    'dress_code','Clothes and valuables go in a locker; the venue supplies a towel and slippers for the sauna areas.',
    'staff_inclusivity','Flex explicitly welcomes gay, bisexual and other men and describes a safe space, within a men-only admission policy; no broader formal training curriculum is shown.',
    'source_urls','["https://flexsauna.com.gr/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='6 Poliklitou, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=328
  and lower(trim(p.name))='flex sauna'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Not applicable: Gazi is a nightlife neighbourhood with many separate doors, not one venue with a single queue.',
    'best_nights','Friday and Saturday after midnight are the district’s strongest nightlife periods; select an actual venue and verify its programme.',
    'crowd_mix','A broad nightlife mix of LGBTQ+ people, local clubbers, diners, tourists and straight allies moving among independent businesses.',
    'dress_code','No district-wide dress code exists; clothing rules depend on the individual bar, club or event.',
    'staff_inclusivity','Not applicable: a neighbourhood has no single staff team, inclusion policy or complaint contact. Assess the chosen business instead.',
    'source_urls','["https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs","https://accessibleroutes.thisisathens.org/en/mobility-historic-heart-to-urban-soul-of-athens/gkazi/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','neighborhood_not_venue',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=329
  and lower(trim(p.name))='gazi district'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified minute range is published. Its large weekend room draws the strongest arrival pressure after midnight, particularly on Saturday.',
    'best_nights','Saturday is the main large-club night; Wednesday drag is the clearest recurring performance-led choice in the published city guide.',
    'crowd_mix','A young gay and broader LGBTQ+ dance crowd, tourists and mixed friends drawn by pop, Greek hits, drag and stage entertainment.',
    'dress_code','Mainstream clubwear and expressive party looks both fit; no venue-wide mandatory dress rule is published.',
    'staff_inclusivity','Drag performers and gay nightlife are central to the operation, but no staff inclusion training or named welfare procedure was found.',
    'source_urls','["https://www.thisisathens.org/nightlife/clubs/where-to-catch-drag-shows-in-athens","https://en.athinorama.gr/clubbing/guide/gay_and_lesbian%2Cgkazi"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='32 Iakchou, Athens, Greece',
  type='club',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=330
  and lower(trim(p.name))='s-cape club'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No general minute range is published. Ticketed queer takeovers can sell toward capacity; advance purchase is safer than relying on a short walk-in line.',
    'best_nights','Choose the named programme: current Purple Night and SEXTOU takeovers run late with queer house, techno, electro and performance-led line-ups.',
    'crowd_mix','Queer electronic-music dancers, gay men, trans and non-binary clubbers, visiting collectives and respectful allies; the mix changes by promoter.',
    'dress_code','Expressive, fetish-influenced or minimal clubwear may fit specific nights, but only an event’s stated theme creates a requirement.',
    'staff_inclusivity','Current programming centres queer collectives and performers, but no public permanent staff-training, consent-team or incident-reporting protocol was located.',
    'source_urls','["https://ra.co/clubs/227009","https://ra.co/events/2478583","https://ra.co/events/2487364"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='Vatsaxi 4, Athens, Greece',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=426
  and lower(trim(p.name))='smut athens'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical hotel check-in wait is published. Rooftop guests may face capacity limits at sunset, but this is separate from accommodation reception.',
    'best_nights','Sunset and weekend evenings suit the rooftop; there is no verified in-house LGBTQ+-specific night.',
    'crowd_mix','International hotel guests, city-break travellers and a mixed rooftop dining crowd; sources do not establish a queer-specific clientele.',
    'dress_code','Normal hotel clothing applies; smart-casual attire is sensible for the rooftop, but no formal code is published.',
    'staff_inclusivity','The property publishes mainstream hospitality services, but no site-specific LGBTQ+ staff training or discrimination-reporting route was found.',
    'source_urls','["https://aforathens.com/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=855
  and lower(trim(p.name))='a for athens'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','There is no admission queue for ordinary park access. Temporary events may have separate controls; park hours, not a nightlife door, govern entry.',
    'best_nights','Use the park in daylight and within published seasonal hours; this record should not encourage night cruising.',
    'crowd_mix','A general public-park audience of residents, families, walkers, runners and visitors rather than a defined queer venue crowd.',
    'dress_code','Weather-appropriate public clothing and walking shoes are suitable.',
    'staff_inclusivity','Not applicable as hospitality intelligence: this is a public park with security contacts, not an LGBTQ+ venue staff team.',
    'source_urls','["https://pediontouareostoparkomas.gr/maps/grafeia-dioikisis-parkou/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','public_space',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=856
  and lower(trim(p.name))='pedion areos park'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','There is no organised entrance or queue: Limanakia B is an unmanaged rocky cove reached independently.',
    'best_nights','Summer afternoons in daylight are the established social period; avoid treating the isolated shore as a managed night venue.',
    'crowd_mix','Mainly gay men at the identified nudist cove, alongside other swimmers and visitors using the wider Limanakia coastline.',
    'dress_code','Swimwear or nudity is common at the gay cove; sturdy water shoes are important on the rocks and guests must bring supplies.',
    'staff_inclusivity','There is no venue staff, lifeguarded hospitality team or LGBTQ+ reporting contact at this unorganised beach area.',
    'source_urls','["https://www.travelgay.com/athens-gay-beach-guide","https://www.thisisathens.org/attractions/limanakia-beach"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','unmanaged_public_space',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=1881
  and lower(trim(p.name))='limanakia beach'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Ordinary garden access has no venue queue. Temporary exhibitions or ceremonies may operate independent access controls.',
    'best_nights','Visit during daylight for walking and the formal gardens; there is no responsible basis for recommending it as a cruising night.',
    'crowd_mix','Residents, families, tourists, runners and event visitors share this public civic garden; it is not a defined queer audience.',
    'dress_code','Comfortable, weather-appropriate public-garden clothing is suitable.',
    'staff_inclusivity','Not applicable: the maintained public gardens do not provide a single LGBTQ+ hospitality staff team or venue complaint route.',
    'source_urls','["https://www.zappeion.gr/en/zappeion-tour/gardens.html"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','public_space',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=1882
  and lower(trim(p.name))='zappeion gardens'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical wait is published. A 24/7 reception handles registered arrivals continuously, and only 12 suites limit simultaneous check-ins.',
    'best_nights','There is no queer-specific hotel night; rooftop pop-up food events are announced separately and are not inherently LGBTQ+ programmes.',
    'crowd_mix','Guests of 12 design suites, couples, small groups and international city travellers; no source supports a specifically queer crowd profile.',
    'dress_code','Ordinary hotel clothing applies; the roof garden has no published fashion requirement.',
    'staff_inclusivity','Staff are available around the clock for guest assistance, but the property publishes no LGBTQ+ inclusion training or discrimination-reporting process.',
    'source_urls','["https://thefoundrysuitesathens.com/","https://thefoundrysuitesathens.com/services-and-policy/services/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1883
  and lower(trim(p.name))='the foundry suites athens'
  and lower(trim(p.city))='athens';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable check-in wait is published. The 164-room hotel has normal reception processing; rooftop and event demand is separate.',
    'best_nights','Sunset suits the rooftop and hot tubs; there is no verified recurring LGBTQ+-specific night at the hotel.',
    'crowd_mix','Mainstream international leisure and business guests plus a mixed rooftop audience; it should not be described as a queer venue crowd.',
    'dress_code','Standard hotel attire applies, with smart-casual clothing sensible for rooftop dining; no mandatory code is stated.',
    'staff_inclusivity','Brown Acropol lists general accessibility arrangements, but no property-specific LGBTQ+ staff training or guest-reporting protocol was located.',
    'source_urls','["https://brownhotels.com/brown-acropol-hotel","https://brownhotels.com/brown-acropol-hotel-contact"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1884
  and lower(trim(p.name))='brown acropol'
  and lower(trim(p.city))='athens';

do $$
declare n integer;
begin
  select count(*) into n from public.places where id in (319,320,321,322,323,324,325,326,327,328,329,330,426,855,856,1881,1882,1883,1884) and lower(trim(city))='athens' and venue_intel->>'research_status'='venue_specific_sources_reviewed_2026_08_30';
  if n <> 19 then raise exception 'Expected 19 reviewed athens records, found %', n; end if;
end $$;
