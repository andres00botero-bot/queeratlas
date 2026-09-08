-- Venue Intelligence repair: paris, 20 individually researched places.
-- Idempotent: standalone UPDATE statements only; no helper relations.

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable minute range is published. The small entrance is under most pressure when the pavement crowd and DJ set peak on Friday or Saturday.',
    'best_nights','Friday and Saturday DJ sets are the strongest dance-bar sessions; an early weekday visit works better for conversation.',
    'crowd_mix','Primarily gay men, including long-time Marais regulars, bears, tourists and a broad adult age range.',
    'dress_code','Casual bar clothes are standard; the venue publishes no formal appearance rule.',
    'staff_inclusivity','Cox is a current gay venue, but its public material does not identify staff inclusion training, a welfare lead or a discrimination-reporting route.',
    'source_urls','["https://cox.fr/","https://cox.fr/programmation/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='15 Rue des Archives, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=99
  and lower(trim(p.name))='cox'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait is published. Door pressure rises for the late weekend club period; reservations are the only documented way to secure a table.',
    'best_nights','Friday and Saturday deliver the fullest late-night club atmosphere; cabaret, karaoke and themed programming vary through the week.',
    'crowd_mix','A mixed LGBTQ+ and straight-friendly audience, with gay regulars, tourists and groups drawn by cabaret and pop dancing.',
    'dress_code','Smart-casual going-out clothes fit the bar-club format; no detailed public dress code was found.',
    'staff_inclusivity','Banana Café is listed among Paris caring nightlife places associated with prevention measures; no named on-duty welfare contact is published.',
    'source_urls','["https://www.bananacafeparis.com/","https://parisjetaime.com/eng/article/paris-by-night-caring-places-a1867"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=100
  and lower(trim(p.name))='banana café'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable wait in minutes is published. The entrance and standing room become busiest before the midnight Shower Boys show, especially at weekends.',
    'best_nights','Arrive before midnight for the daily Shower Boys show; Friday and Saturday continue later and carry the largest party crowd.',
    'crowd_mix','Mostly gay men plus LGBTQ+ friends and tourists, with a show-focused late-night crowd.',
    'dress_code','Confident casual clubwear is common; Raidd publishes no mandatory clothing standard for ordinary nights.',
    'staff_inclusivity','The programme visibly employs queer performers, but no public staff-training or safeguarding protocol was located; recent service reports are mixed.',
    'source_urls','["https://raiddbar.com/fr/","https://raiddbar.com/fr/index.html"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='23 Rue du Temple, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=140
  and lower(trim(p.name))='raidd bar'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','There is no published minute estimate. Friday and Saturday basement sessions have the clearest capacity pressure; early bar hours use normal walk-in entry.',
    'best_nights','Friday and Saturday from 23:00 are the dedicated basement-club sessions; daily resident DJs start in the upstairs bar from 18:00.',
    'crowd_mix','Gay and queer locals, younger weekend dancers, Marais visitors and mixed friendship groups.',
    'dress_code','Relaxed bar clothing works upstairs and ordinary clubwear downstairs; no formal door code is published.',
    'staff_inclusivity','Freedj is explicitly gay and programmes queer artists, but it publishes no staff inclusion training, welfare contact or complaint procedure.',
    'source_urls','["https://freedj.fr/","https://freedj.fr/actualites/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='35 Rue Sainte-Croix de la Bretonnerie, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=141
  and lower(trim(p.name))='freedj'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No stable minute range applies because demand changes by programme. The September reopening event warns of limited capacity, so advance tickets are prudent.',
    'best_nights','Choose the named concept: Friday House centres young LGBTQIA+ clubbers, Saturday ORGY/Menergy rotates, and Sunday Legacy centres POC LGBTQ+ guests.',
    'crowd_mix','The mix changes by night: young LGBTQIA+ dancers, bears, gay men, POC queer communities and international club visitors.',
    'dress_code','Follow the named party theme; expressive clubwear is normal and no single venue-wide costume rule is published.',
    'staff_inclusivity','Gibus is in Paris responsible-nightlife networks, and its team has documented Consentis training on preventing sexual and gender-based violence.',
    'source_urls','["https://gibusclub.fr/","https://parisjetaime.com/culture/gibus-p1457","https://www.gone.radio/agenda/heaven-opening-season-new-gibus-5117"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','reopening_2026_09',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='18 Rue du Faubourg du Temple, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=142
  and lower(trim(p.name))='gibus club'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait is published. Continuous daily opening spreads arrivals, while weekend late-night periods create the greatest reception pressure.',
    'best_nights','Friday and Saturday after midnight are busiest; weekday afternoons and early evenings offer a quieter cruise environment.',
    'crowd_mix','Adult gay and bisexual men using a men-only cruise club, with locals and visitors across a broad age range.',
    'dress_code','Street clothes are checked before the cruise areas; fetish or minimal clothing may suit themed periods, but verify the current programme.',
    'staff_inclusivity','The operation is explicitly men-only and gay. Its public site does not document inclusion training, consent monitors or a named welfare contact.',
    'source_urls','["https://ledepot-paris.com/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='10 Rue aux Ours, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=143
  and lower(trim(p.name))='le dépôt'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured wait is published. The terrace can fill in good weather and on weekend evenings, but this is seating pressure rather than a managed club queue.',
    'best_nights','Sunny late afternoons suit the terrace; Friday and Saturday evenings run latest and bring the strongest social atmosphere.',
    'crowd_mix','Gay men, Marais regulars, tourists and mixed LGBTQ+ friendship groups, especially around the street-facing terrace.',
    'dress_code','Everyday café-bar clothing is appropriate; there is no published door or fashion requirement.',
    'staff_inclusivity','Open Café presents itself as a gay meeting place, but no concrete employee inclusion training or reporting procedure is publicly documented.',
    'source_urls','["https://www.opencafe.fr/","https://www.opencafe.fr/contact/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='17 Rue des Archives, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=145
  and lower(trim(p.name))='open café'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable minute estimate is available. Its compact room can reach standing capacity on late queer DJ nights, especially Friday and Saturday.',
    'best_nights','Friday and Saturday queer DJ sessions are the clearest party choice; earlier weekday hours favour conversation in the small bar.',
    'crowd_mix','A mixed queer crowd with lesbians, trans and non-binary guests, gay men, local creatives and allies.',
    'dress_code','Casual, alternative and expressive queer looks all fit; no formal appearance code is published.',
    'staff_inclusivity','Its long-running mixed LGBTQI+ identity is well documented, but no current staff-training standard or named safeguarding contact was found.',
    'source_urls','["https://feverup.com/fr/paris/venue/les-souffleurs","https://www.parislgbt.com/listing/les-souffleurs/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=147
  and lower(trim(p.name))='les souffleurs'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','CUD publishes no typical wait. The basement is most pressured after midnight on Friday and Saturday; entry remains walk-in with no guest list.',
    'best_nights','Friday and Saturday are the fullest dance nights and run latest; Sunday through Thursday can be easier for spontaneous entry.',
    'crowd_mix','Predominantly gay men, with Marais visitors, tourists and mixed LGBTQ+ friends in a late-night basement setting.',
    'dress_code','The official rule is no dress code; ordinary going-out clothes are accepted, subject to lawful door control.',
    'staff_inclusivity','CUD says guests may come as they are, but current public reviews contain serious door-treatment complaints and no published escalation process was found.',
    'source_urls','["https://cudbar.com/en/","https://maps.apple.com/place?place-id=IA86C30FB7EF0AFF0"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='12 Rue des Haudriettes, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=148
  and lower(trim(p.name))='cud bar'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical wait is published. Entry is continuous during opening hours, with higher reception pressure on Friday and Saturday late evenings.',
    'best_nights','Use the official theme calendar: naturist and underwear sessions rotate; Friday and Saturday remain open until 06:00.',
    'crowd_mix','Adult gay and bisexual men seeking a naturist cruise bar; admission is explicitly men-only.',
    'dress_code','Nudity or the announced underwear theme governs inside; phones and cash are not carried in the play space.',
    'staff_inclusivity','Staff operate a men-only gay naturist venue and enforce phone restrictions, but no public inclusion training or consent-response protocol is described.',
    'source_urls','["https://impact-bar.com/impact-bar-faq.php","https://linktr.ee/limpactbar"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='18 Rue Greneta, Paris, France',
  type='cruise_club',
  link='https://impact-bar.com/',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=149
  and lower(trim(p.name))='impact sauna'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable reception wait is published. Sunday tea dance and monthly bear events create the clearest arrival peaks; ordinary sessions are walk-in.',
    'best_nights','Sunday Gay Tea Dance is the strongest social session; Tuesday Nasty Boys, Wednesday karaoke and the monthly bear rendezvous offer distinct formats.',
    'crowd_mix','Adult gay and bisexual men, with bears and admirers especially visible at the monthly European Bear Rendezvous.',
    'dress_code','A towel or nudity is normal beyond reception; clothes go in the locker and the venue supplies towels and slippers.',
    'staff_inclusivity','The men-only gay sauna provides condoms and hosts ARMEDIA sexual-health testing on Fridays; no broader staff inclusion curriculum is published.',
    'source_urls','["https://www.suncity-paris.fr/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='62 Boulevard de Sébastopol, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=150
  and lower(trim(p.name))='sun city sauna'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical check-in wait is published. A staffed 24-hour reception handles arrivals continuously; peak-delay data are unavailable.',
    'best_nights','There is no queer-specific best night; choose dates for Marais plans, while the hotel itself operates as accommodation every day.',
    'crowd_mix','Mainstream leisure and business travellers using a small central hotel; the property does not describe a specifically LGBTQ+ guest mix.',
    'dress_code','Normal hotel attire applies; no guest dress code is published.',
    'staff_inclusivity','Reception assistance is available around the clock, but the hotel publishes no property-specific LGBTQ+ inclusion training or discrimination procedure.',
    'source_urls','["https://www.dwinhotel.com/en/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1860
  and lower(trim(p.name))='d''win hotel'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable reception-wait estimate is published. The 24-hour multilingual desk supports continuous arrivals rather than scheduled admission.',
    'best_nights','No venue-specific queer night exists; the practical advantage is daily access to the Marais rather than an in-house event programme.',
    'crowd_mix','A mainstream international boutique-hotel clientele; no evidence supports describing its guests as a queer crowd.',
    'dress_code','Ordinary travel and hotel clothing is appropriate; no appearance requirement is stated.',
    'staff_inclusivity','A multilingual reception is staffed 24/7, but no LGBTQ+ employee training, inclusive-service policy or reporting contact is publicly specified.',
    'source_urls','["https://www.hotelparismaraisbretonnerie.com/en/page/hotel-3-stars-la-bretonnerie-paris-marais-services.7305.html"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1861
  and lower(trim(p.name))='hotel de la bretonnerie'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No normal check-in wait is published. Reception processes registered hotel arrivals; there is no evidence for a nightlife-style entrance queue.',
    'best_nights','There is no queer-specific best night; select the stay for nearby Marais programming, not for an in-house LGBTQ+ event.',
    'crowd_mix','Design-hotel guests and international city-break travellers; the property does not document a distinct LGBTQ+ audience composition.',
    'dress_code','Standard hotel attire applies with no published dress code.',
    'staff_inclusivity','The property offers a step-free route and one adapted room, but no venue-specific LGBTQ+ staff training or complaint protocol was found.',
    'source_urls','["https://en.hotelpetitmoulinparis.com/contact","https://acceslibre.beta.gouv.fr/app/75-paris/a/hotel/erp/hotel-du-petit-moulin-small-luxury-hotels-of-the-world/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1862
  and lower(trim(p.name))='hôtel du petit moulin'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','A conventional reception queue is largely avoided: guests receive access codes in advance, while the team is onsite in the morning and reachable remotely.',
    'best_nights','There is no in-house queer night; its value is a quiet Marais base for whichever external programme the guest chooses.',
    'crowd_mix','Guests of a five-room boutique property, mainly couples and independent city visitors; no queer-specific crowd claim is supported.',
    'dress_code','Everyday hotel attire is suitable; no clothing policy is published.',
    'staff_inclusivity','Remote help is available by phone, email and app, but no LGBTQ+ staff-training or anti-discrimination process is publicly documented.',
    'source_urls','["https://1eretagemarais.com/en/hotel.html"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1863
  and lower(trim(p.name))='le 1er etage marais'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable check-in wait is stated. With 189 apartments, arrival pressure can vary, but the operator publishes no minute range.',
    'best_nights','No queer-specific night is programmed; use the aparthotel as a daily central base for external events.',
    'crowd_mix','A broad international mix of families, business travellers and longer-stay city visitors, not a documented LGBTQ+-specific clientele.',
    'dress_code','Normal hotel clothing applies; no guest dress requirement is published.',
    'staff_inclusivity','Accessible rooms are documented, but no Les Halles property-specific LGBTQ+ training or discrimination-reporting route was located.',
    'source_urls','["https://www.discoverasr.com/fr/citadines/france/citadines-les-halles-paris","https://acceslibre.beta.gouv.fr/app/75-paris/a/hotel/erp/citadines-les-halles-paris/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1864
  and lower(trim(p.name))='citadines les halles paris'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured table wait is published. The compact dining room is most capacity-sensitive at weekend meal peaks; booking is the practical way to reduce uncertainty.',
    'best_nights','Friday and Saturday dinner are liveliest; a weekday lunch or early dinner is better for a calmer table.',
    'crowd_mix','Gay Marais regulars, LGBTQ+ tourists and mixed friends attracted by the deliberately gay-themed burger restaurant.',
    'dress_code','Casual restaurant clothes are appropriate; no dress standard is published.',
    'staff_inclusivity','Queer identity is explicit in the concept and décor, but no concrete staff inclusion training or customer-reporting procedure is publicly available.',
    'source_urls','["https://tata-burger.fr/fr/booking","https://fr.travelgay.com/venue/tata-burger"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1865
  and lower(trim(p.name))='tata burger'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable table-wait estimate is published. The panoramic terrace is the main constraint at sunset and weekend brunch; reservations reduce uncertainty.',
    'best_nights','Choose a clear-weather sunset for the terrace or the advertised weekend brunch; there is no verified LGBTQ+-specific night.',
    'crowd_mix','Neighbourhood diners, couples, tourists and mixed social groups; sources do not support labelling the regular crowd specifically queer.',
    'dress_code','Relaxed café and terrace clothing fits; no formal dress code is stated.',
    'staff_inclusivity','The restaurant publishes ordinary contact and reservation service, but no LGBTQ+ staff training or venue-specific inclusion protocol was found.',
    'source_urls','["https://www.moncoeurbelleville.com/","https://www.moncoeurbelleville.com/r%C3%A9server"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1866
  and lower(trim(p.name))='moncoeur belleville'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','There is no managed entry queue. Limited shop floor space may feel busy around author signings, but no typical wait is published.',
    'best_nights','Daytime browsing works daily; choose a listed signing or discussion for direct engagement with LGBTQIA+ writers and readers.',
    'crowd_mix','LGBTQIA+ readers, writers, students, local regulars and visitors seeking queer literature and cultural material.',
    'dress_code','Ordinary shop clothing is appropriate; no appearance rule exists.',
    'staff_inclusivity','Inclusion is substantive: staff curate specialist LGBTQIA+ literature and cultural events. No separate formal complaints protocol is published.',
    'source_urls','["https://motsbouche.com/","https://parisjetaime.com/eng/shopping/les-mots-a-la-bouche-p2290","https://www.parislgbt.com/listing/les-mots-a-la-bouche/"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  location='37 Rue Saint-Ambroise, Paris, France',
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1867
  and lower(trim(p.name))='les mots à la bouche'
  and lower(trim(p.city))='paris';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','General garden entry is free and normally has no venue queue; temporary exhibitions or summer attractions may operate their own separate lines.',
    'best_nights','Visit in daylight within the Louvre-published seasonal hours; this record should not recommend the garden as a night cruising venue.',
    'crowd_mix','A broad public-park mix of residents, families, tourists, runners and museum visitors rather than a defined queer venue audience.',
    'dress_code','Weather-appropriate public-park clothing and comfortable shoes are suitable.',
    'staff_inclusivity','Not applicable as venue intelligence: this is a managed public garden, not an LGBTQ+ hospitality team with a published inclusion practice.',
    'source_urls','["https://www.louvre.fr/en/explore/the-gardens"]'::jsonb,
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','public_space',
    'topic_evidence',jsonb_build_object('queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only','dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_indexable=false,
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=1868
  and lower(trim(p.name))='the tuileries garden'
  and lower(trim(p.city))='paris';

do $$
declare n integer;
begin
  select count(*) into n from public.places where id in (99,100,140,141,142,143,145,147,148,149,150,1860,1861,1862,1863,1864,1865,1866,1867,1868) and lower(trim(city))='paris' and venue_intel->>'research_status'='venue_specific_sources_reviewed_2026_08_30';
  if n <> 20 then raise exception 'Expected 20 reviewed paris records, found %', n; end if;
end $$;
