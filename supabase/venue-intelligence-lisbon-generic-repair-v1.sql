-- Venue Intelligence repair: lisbon, 20 individually researched places.
-- Idempotent and intentionally uses no temporary tables, staging tables or cross-statement aliases.

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait in minutes is published. Friday and Saturday create the greatest door pressure; the official presale entrance separates advance-ticket arrivals.','best_nights','Friday Crush and Saturday Laundry Room are the main full-club choices; Thursday Rabbit Hole supplies a smaller recurring alternative.','crowd_mix','A large, mixed LGBTQIA+ crowd across genders and ages, with gay men prominent and tourists joining Lisbon regulars.',
    'dress_code','Expressive queer clubwear and ordinary dance clothing both fit; individual themed parties may announce a separate look.','staff_inclusivity','The house regularly hires LGBTQIA+ dancers, DJs and drag artists. Its public material does not identify trained welfare personnel or a reporting procedure.',
    'source_urls','["https://trumps.pt/shop/","https://www.visitlisboa.com/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=105
  and lower(trim(p.name))='trumps'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','The intimate room has no dependable published wait time. Capacity is most pressured before the late drag show, while café-concert reservations avoid uncertain walk-up access.','best_nights','The nightly transformismo show is the signature; Sunday’s New Talents format is the clearest choice for emerging drag performers.','crowd_mix','Drag devotees, gay regulars, tourists, performers and a notably mixed-age queer audience gather in the close-packed room.',
    'dress_code','Dress for a late cabaret or club: casual glamour and expressive looks fit, with no formal venue-wide fashion code published.','staff_inclusivity','Transformismo artists have been institutionally central since 1976; no separate public evidence was found for staff inclusion training or a formal complaint route.',
    'source_urls','["https://www.finalmenteclub.com/discoteca/","https://qlist.app/events/Lisbon/Finalmente-Club-Drag-Show/25375"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=106
  and lower(trim(p.name))='finalmente club'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured minute range is published. Outdoor and indoor seating fill through the evening, but the venue does not operate a typical nightclub queue.','best_nights','Friday and Saturday bring the most energy; recurring bear theme parties are the strongest choice when community focus matters.','crowd_mix','Bears, cubs and admirers are central, joined by gay locals, international visitors and respectful LGBTQ+ friends.',
    'dress_code','Come-as-you-are casual bar clothing is the norm; bear style is common but no body type, leather item or fetish garment is required.','staff_inclusivity','The bar is bear-owned and operated and explicitly welcomes the wider LGBT community; no detailed public incident-response process is published.',
    'source_urls','["https://www.tr3slisboa.com/","https://www.patroc.com/gay/lisbon/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=814
  and lower(trim(p.name))='tr3s lisboa'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable wait in minutes is published. It is a small café and wine bar where table availability, not a managed entrance line, is the practical constraint.','best_nights','Friday and Saturday evenings are the livelier wine-bar periods; a weekday daytime visit is better for quiet conversation.','crowd_mix','Neighbourhood café guests, LGBTQ+ visitors, couples and mixed local friendship groups share a small, conversational room.',
    'dress_code','Daytime café basics transition easily to understated dinner attire; management states no appearance threshold at the door.','staff_inclusivity','Current sources identify a queer-welcoming venue and positive owner contact, but no staff training or formal inclusion policy is publicly documented.',
    'source_urls','["https://rendezvous.eatbu.com/?lang=pt","https://restaurantguru.com/Rendezvous-Lisbon-2"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=815
  and lower(trim(p.name))='rendezvous - more than wine'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait is published. Entry is processed at a private-club reception, with theme-night capacity the only supported source of delay.','best_nights','Thursday’s Naked Only session is the fixed specialist date; Friday and Saturday draw the strongest attendance under the regular house format.','crowd_mix','Adult gay and bisexual men seeking a sex-positive cruise and fetish environment; the club explicitly excludes other genders.',
    'dress_code','Thursday is naked only. On every other day, naked or underwear is required, and bare feet are not permitted.','staff_inclusivity','Staff operate an explicitly male-only adult club within the ARCO partner network; that narrow access rule must not be described as universal inclusion.',
    'source_urls','["https://www.arco.lgbt/en/club/drako-club/","https://www.travelgay.com/venue/drako-club"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=816
  and lower(trim(p.name))='drako club'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable reception-wait estimate is published. Weekend peak periods may slow locker allocation, but a minute range cannot be supported.','best_nights','The continuous Friday-to-Monday weekend period is the main social window; Monday under-36 sessions target a younger crowd.','crowd_mix','Adult gay and bisexual men, with age mix changing by promotion; weekend DJs attract a more social and nightlife-oriented group.',
    'dress_code','Nudity or a towel is standard inside; the venue supplies towels, flip-flops and a locker, so street clothing remains stored.','staff_inclusivity','Published rules address respect, safety and hygiene, and staff can intervene; the venue remains explicitly men-only rather than universally inclusive.',
    'source_urls','["https://www.trombetabath.com/","https://www.patroc.com/gay/lisbon/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=817
  and lower(trim(p.name))='trombeta bath'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Not applicable: this is a public park without a managed entrance, reception desk or venue queue.','best_nights','No responsible cruising “best night” is verified. Daylight is the appropriate time for ordinary park use and situational awareness.','crowd_mix','The park is used by the general public, including families, commuters, tourists and walkers; any cruising presence is informal and unstaffed.',
    'dress_code','Ordinary weather-appropriate public-space clothing applies; there is no venue dress code or private changing provision.','staff_inclusivity','Not applicable: there is no venue staff, inclusion team or on-site safeguarding service attached to this cruising-area record.',
    'source_urls','["https://www.visitlisboa.com/en/places/eduardo-vii-park","https://www.patroc.com/gay/lisbon/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','public_unmanaged',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=820
  and lower(trim(p.name))='parque eduardo vii (cruising area)'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait in minutes is available. Its small, cosy interior can become full before any formal line develops.','best_nights','Friday and Saturday are the strongest social nights; a published theme party is preferable when a defined programme matters.','crowd_mix','Gay locals, Bairro Alto visitors, tourists and mixed LGBTQ+ friendship groups share an intimate neighbourhood-bar crowd.',
    'dress_code','Casual bar clothing and expressive queer looks both fit; no formal appearance requirement is documented.','staff_inclusivity','Current guides describe a warm LGBTQ+ welcome, but no concrete public evidence of staff training or an incident-reporting protocol was found.',
    'source_urls','["https://www.gaymapper.com/gay-venue/lisbon/espaco-40e1","https://www.facebook.com/espaco41"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1281
  and lower(trim(p.name))='espaço 40e1'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable reception-wait range is published. Direct check-in is normal, with locker availability the plausible constraint at busier periods.','best_nights','Use the live events calendar rather than a fixed weekday; mixed-gender naturist sessions and community formats can change the audience substantially.','crowd_mix','Adults of all genders, identities and orientations are explicitly welcomed, unlike Lisbon’s men-only gay saunas.',
    'dress_code','Nudity, underwear, swimwear or a towel are allowed in most areas; the snack bar requires coverage, and supplied slippers must be worn.','staff_inclusivity','The operator explicitly applies the same welcome and conditions across genders and identities and invites guests to contact staff for direct assistance.',
    'source_urls','["https://en.saunapolo56.pt/contact/","https://es.saunapolo56.pt/faqs-perguntas-respostas/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1282
  and lower(trim(p.name))='saunapolo 56'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable wait in minutes is published. The compact, closed-door bar may hold arrivals when its interior reaches capacity.','best_nights','Friday and Saturday are the main cruise-bar nights; a named leather or bear event is the best choice for a more defined theme.','crowd_mix','Predominantly adult gay and bisexual men, especially bears, leather men and admirers interested in a cruise-oriented setting.',
    'dress_code','Casual masculine barwear, leather, harnesses and underwear-oriented looks all fit; confirm any stricter theme before attending.','staff_inclusivity','The venue serves gay men and bear/leather communities, but no public evidence was found for staff training or a formal consent-support procedure.',
    'source_urls','["https://www.allaboutportugal.pt/pt/lisboa/bares/woof-x","https://lisboa-cruising.com/woofx"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1283
  and lower(trim(p.name))='woof x'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable minute estimate is published. The small room becomes crowded during games and shows, but there is no documented standard queue.','best_nights','Sunday Message Night is the clearest recurring community format; Friday and Saturday are strongest for the regular late bar atmosphere.','crowd_mix','Gay men across ages, cross-dressers, trans guests, locals and international visitors form a broader crowd than a men-only cruise bar.',
    'dress_code','Casual bar clothes, feminine presentation, drag and expressive gender presentation are all reported as comfortable; no formal code is published.','staff_inclusivity','Current feedback specifically describes warm staff and welcoming treatment of cross-dressing guests, though no formal training or reporting policy is published.',
    'source_urls','["https://www.lisbongaycircuit.com/106-2/","https://restaurantguru.com/Bar-106-Lisbon"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1284
  and lower(trim(p.name))='bar 106'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait is published. Neighbourhood footfall and the compact room affect access more than a managed club line.','best_nights','Thursday through Saturday are the documented operating nights and provide the strongest atmosphere; no recurring queer show is currently verified.','crowd_mix','A mixed LGBTQ+ Bairro Alto crowd of locals, tourists, students and friendship groups, rather than one identity-defined audience.',
    'dress_code','Relaxed Bairro Alto barwear is appropriate; the venue publishes no formal appearance, costume or fetish requirement.','staff_inclusivity','Lisbon tourism and current guides identify an LGBT-friendly role, but no specific public staff training or incident-response practice was found.',
    'source_urls','["https://www.lisbongaycircuit.com/side-bar/","https://www.visitlisboa.com/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1285
  and lower(trim(p.name))='side bar'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait in minutes is published. Lineup popularity and ticket sell-outs, not a stable weekly estimate, determine door pressure.','best_nights','Friday and Saturday are the core club nights; choose a listed tribal-house or circuit event for the venue’s clearest musical identity.','crowd_mix','Predominantly gay men and circuit-party dancers, joined by tourists and a smaller mixed LGBTQ+ club crowd.',
    'dress_code','Fitted clubwear, tanks, harness accents and expressive dance looks are common; individual parties may publish a stricter theme.','staff_inclusivity','The operation is LGBTQ-focused, but no concrete public evidence of staff inclusion training, a welfare lead or reporting protocol was located.',
    'source_urls','["https://shotgun.live/en/venues/construction-lisbon-club","https://www.patroc.com/gay/lisbon/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1286
  and lower(trim(p.name))='construction'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable minute estimate is published. Friday and Saturday concentrate arrivals, and popular drag or pop events create the greatest door pressure.','best_nights','Friday and Saturday are the regular club nights; advertised drag, pop, funk or reggaeton events provide the most defined programme.','crowd_mix','A younger LGBTQIAP+ crowd across genders, with gay men, queer women, drag audiences, local groups and visitors.',
    'dress_code','Fashion-forward casual clubwear and expressive queer looks fit; follow any costume direction attached to the specific event.','staff_inclusivity','The club explicitly presents itself as LGBTQIAP+ and employs queer performers, but no detailed staff training or safeguarding protocol is public.',
    'source_urls','["https://bio.link/poshlisbon","https://pinkyclub.pt/eventos/this-is-drag-isboa"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1287
  and lower(trim(p.name))='posh club'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable wait in minutes is published. Its small Bairro Alto room becomes physically crowded on weekend evenings before a formal queue is likely.','best_nights','Friday and Saturday are the liveliest pre-club choices; Sunday is the calmer recurring alternative in the published weekly pattern.','crowd_mix','Party-oriented gay men are prominent, with queer women, local friends and visitors joining the broader Construction crowd.',
    'dress_code','Casual pre-club clothing, fitted looks and harness accents all fit; no mandatory fetish code is published for ordinary bar nights.','staff_inclusivity','It is an LGBTQ-oriented outpost of Construction, but no venue-specific staff inclusion training or complaint pathway is publicly documented.',
    'source_urls','["https://cdnc.heyzine.com/files/uploaded/v3/f6351ffa61d1c6bf09e3335ae7e7f0950b535841-16.pdf","https://www.instagram.com/construction_bar"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1288
  and lower(trim(p.name))='construction bar'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No stable minute estimate is published. The compact room is reported to become packed after midnight, especially from Thursday through Saturday.','best_nights','Thursday through Saturday after midnight show the fullest bar-and-dance atmosphere; Queer Lisboa partnership dates add a cultural focus.','crowd_mix','Queer women remain important, alongside trans and non-binary guests, gay men, artists, locals and tourists in a deliberately mixed crowd.',
    'dress_code','Alternative casual wear, vintage, rave touches and expressive queer style all fit; there is no formal door fashion rule.','staff_inclusivity','Female ownership and an active Queer Lisboa partnership are concrete community links; no separate public staff safeguarding protocol was found.',
    'source_urls','["https://www.gayplaces.co/city/lisbon/bar/purex","https://www.queerporto.pt/en/2026-editions/queer-lisboa/-834"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1289
  and lower(trim(p.name))='purex'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured minute range is published. The small interior becomes packed after midnight on weekends, and arrivals may be held outside.','best_nights','Friday and Saturday after 23:00 bring the fullest party atmosphere; Sunday is a useful livelier option when several nearby bars are closed.','crowd_mix','Youngish LGBTQ+ locals and tourists mix easily, including gay men, queer women and mixed friendship groups.',
    'dress_code','Informal Bairro Alto clothing is the norm; everyday casual and expressive queer looks work without a published fashion requirement.','staff_inclusivity','Current sources repeatedly describe friendly bartenders and an LGBTQ+ welcome, but no formal inclusion training or incident procedure is public.',
    'source_urls','["https://friendsbairroalto.eatbu.com/?lang=en","https://www.corner.inc/place/pkTMXiCXebV3"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1290
  and lower(trim(p.name))='friends bairro alto'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','The Late Birds publishes no usual arrival delay. Reception handling depends on the day’s guest turnover rather than a public admission line.','best_nights','Warm-season garden and pool periods are the most social; the property’s communal rhythm matters more than a fixed party weekday.','crowd_mix','Gay men are the intended core community, with LGBTIQA+ friends and allies welcomed into the wider guesthouse environment.',
    'dress_code','Light resort pieces suit the garden and pool, while ordinary Lisbon daywear is appropriate indoors; no property-wide style rule is stated.','staff_inclusivity','The guesthouse was created specifically for gay men and now explicitly welcomes the LGBTIQA+ community, friends and allies; that mission is staff-facing and operational.',
    'source_urls','["https://www.thelatebirdslisbon.com/","https://www.queerlisboa.pt/contents/pasteditions/catalogo-queer-lisboa-29.pdf"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1876
  and lower(trim(p.name))='the late birds lisbon (príncipe real)'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Anjo Azul provides no evidence-based duration for arrival processing. Any reception delay is situational, not a recurring door line.','best_nights','No queer-specific best night or recurring social programme is documented; choose dates for the neighbourhood rather than an on-site event.','crowd_mix','A mainstream international guesthouse crowd of couples, solo travellers and city-break visitors; no LGBTQ-exclusive audience is documented.',
    'dress_code','There is no hotel-wide dress code; ordinary city clothing is appropriate throughout the guesthouse.','staff_inclusivity','No property-specific LGBTQ+ staff training, inclusion policy or complaint process was found, so friendliness should not be upgraded into verified practice.',
    'source_urls','["https://www.anjoazul.site/pt/","https://www.patroc.com/gay/lisbon/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1877
  and lower(trim(p.name))='anjo azul (bairro alto)'
  and lower(trim(p.city))='lisbon';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Memmo does not quantify a normal arrival delay. Reception is continuously staffed, but no recurring wait pattern is documented.','best_nights','Current DJ Sessions are the clearest programmed social dates; otherwise dinner and terrace atmosphere are not tied to a single best night.','crowd_mix','International luxury guests, couples, design travellers and local restaurant visitors form a mainstream, cosmopolitan crowd.',
    'dress_code','Refined smart-casual suits the restaurant and terrace, while the hotel itself has no published appearance rule.','staff_inclusivity','The hotel documents a staffed front desk and an adapted room, but no property-specific LGBTQ+ training or anti-discrimination response process was found.',
    'source_urls','["https://www.memmohotels.com/principereal/pt/","https://www.memmohotels.com/principereal/faq"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1878
  and lower(trim(p.name))='memmo príncipe real'
  and lower(trim(p.city))='lisbon';

-- Operational corrections stay outside venue_intel.
update public.places set location='Rua da Palmeira 38, 1200-313 Lisbon, Portugal',link='https://www.finalmenteclub.com/' where id=106 and lower(trim(name))='finalmente club';
update public.places set hours='Monday-Thursday 17:00-02:00; Friday-Saturday 17:00-03:00; Sunday 17:00-02:00.',link='https://www.arco.lgbt/en/club/drako-club/' where id=816 and lower(trim(name))='drako club';
update public.places set seo_indexable=false,seo_quality_status='pending' where id=820 and lower(trim(name))='parque eduardo vii (cruising area)';
update public.places set hours='Thursday-Saturday 18:00-02:00.' where id=1285 and lower(trim(name))='side bar';

do $$
begin
  if (select count(*) from public.places p where p.id in (105,106,814,815,816,817,820,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1876,1877,1878) and lower(trim(p.city))='lisbon' and p.venue_intel->>'research_status'='venue_specific_sources_reviewed_2026_08_30')<>20 then
    raise exception 'Lisbon post-update count is not 20';
  end if;
end $$;
