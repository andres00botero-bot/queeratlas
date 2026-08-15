-- Queer Atlas: Cairo curated city package
-- Researched and checked 2026-08-15. Idempotent, constraint-safe and no null coordinates.
-- Public mixed venues are not presented as gay venues. Confidential services use area pins, never private offices.

begin;

-- Preserve every type already accepted by the live database while adding the
-- two cultural venue types used by Cairo. pg_get_expr avoids hard-coding an
-- older constraint definition that may differ between environments.
do $cairo_place_types$
declare
  existing_expression text;
begin
  select pg_get_expr(c.conbin, c.conrelid)
    into existing_expression
  from pg_constraint c
  where c.conrelid = 'public.places'::regclass
    and c.conname = 'places_type_check'
    and c.contype = 'c';

  if existing_expression is null then
    alter table public.places
      add constraint places_type_check
      check (type in ('club','bar','restaurant','sauna','cruise_club','cruising_area','cafe','hotel','cinema','gallery'));
  elsif not (existing_expression ilike '%cinema%' and existing_expression ilike '%gallery%') then
    execute 'alter table public.places drop constraint places_type_check';
    execute format(
      'alter table public.places add constraint places_type_check check ((%s) or type in (''cinema'', ''gallery''))',
      existing_expression
    );
  end if;
end;
$cairo_place_types$;

with src as (
 select * from jsonb_to_recordset($cairo_places$
[
 {"name":"Cairo Jazz Club","city":"cairo","type":"club","description":"For more than two decades this compact Agouza room has been one of Cairo's most dependable live-music and club-programme anchors. The calendar moves between jazz, Egyptian independent acts, electronic nights and DJs, so the artist matters more than the venue name. It is a mixed club, not a gay venue, and the formal door is part of the experience: reservations, hard ID, 23+, capacity limits and the couples-or-mixed-groups rule are all published house policy.","vibe":"close, music-first Cairo nightlife with a serious programme and a selective door","hours":"Programme-led; commonly Sunday-Wednesday 20:00-02:00 and Thursday-Friday 20:00-03:00. Reservations and the current listing control access.","link":"https://www.cairojazzclub.com/","location":"197A 26th of July Street, Agouza, Giza, Egypt","lat":30.06213,"lng":31.21161},
 {"name":"ROOM Art Space & Cafe Garden City","city":"cairo","type":"cafe","description":"A small basement arts room where a coffee can turn into live music, theatre, film, dance or karaoke without the night becoming a velvet-rope production. Garden City's central location and ROOM's varied calendar make it one of the easier public ways to meet creative Cairo. The audience is mixed and the venue makes no public LGBTQ+ safety guarantee, so choose the exact programme and keep personal disclosure proportionate to the setting.","vibe":"intimate basement culture, shared tables and programme-led social energy","hours":"Daily from daytime into late evening; event doors, tickets and closing times vary. Verify the official calendar.","link":"https://www.roomart.space/","location":"10 Etehad Al Mohamin Street, Garden City, Cairo, Egypt","lat":30.0353257,"lng":31.2287665},
 {"name":"Zawya Cinema","city":"cairo","type":"cinema","description":"Cairo's essential independent cinema lives inside Cinema Karim, screening Arab and international arthouse work, retrospectives, festivals and films that commercial multiplexes rarely hold. Its value to a queer traveller is cultural rather than branded: thoughtful programming, a film-literate public and a central room where identity can be encountered through cinema without exposing a private community. It is not a declared queer safe space.","vibe":"serious independent cinema with warm Downtown character and a curious local audience","hours":"Daily according to the film schedule; box office and doors follow each screening.","link":"https://zawyacinema.com/","location":"Cinema Karim, 15 Emad El Deen Street, Downtown Cairo, Egypt","lat":30.05573,"lng":31.24451},
 {"name":"Townhouse Gallery","city":"cairo","type":"gallery","description":"One of Cairo's pioneering independent art spaces, tucked into the lanes of Downtown with exhibitions, talks, a library and connections to performance work. Townhouse rewards the person willing to find the entrance: the scale is human, the staff are often praised for being helpful and the programme opens a window onto contemporary Egyptian thought. Visit for the current exhibition, not because the gallery claims to be a permanent queer venue.","vibe":"hidden-lane contemporary art, books and conversation away from the city's louder circuits","hours":"Commonly Saturday-Wednesday 12:00-21:00; Thursday-Friday closed. Confirm the current exhibition and access before travelling.","link":"http://thetownhousegallery.com/","location":"10 Hussein Basha Al Meamari Street, Marouf, Downtown Cairo, Egypt","lat":30.04885,"lng":31.23817},
 {"name":"Harry's Pub","city":"cairo","type":"bar","description":"An intimate English-style pub inside the Cairo Marriott, known for evening drinks, sport and recurring live-band sets. Hotel security and a predictable international service format can make arrival simpler than an independent club, while the room still draws Egyptians alongside expatriates and guests. It is not a gay bar and should not be sold as one; its role in this atlas is a legible mixed option where the setting, price and exit route are easy to understand.","vibe":"polished hotel-pub ease with live-band nights and a mixed Zamalek crowd","hours":"Daily 18:00-01:00 according to the hotel's current dining listing.","link":"https://www.marriott.com/en-us/hotels/caieg-cairo-marriott-hotel/dining/","location":"Cairo Marriott Hotel, 16 Saray El Gezira Street, Zamalek, Cairo, Egypt","lat":30.05709,"lng":31.22456},
 {"name":"Pub 28 Zamalek","city":"cairo","type":"bar","description":"A smoky, old-school Zamalek pub with wood-panelled intimacy, Egyptian dishes and the feeling of a neighbourhood institution rather than a designed nightlife concept. Regulars value conversation, familiar staff and late tables; the long review trail is also frank about smoke, uneven service and prices that can surprise. International gay guides sometimes mention it, but there is no credible basis for calling it a gay venue: come discreetly for a mixed local pub, not a promised queer scene.","vibe":"lived-in Zamalek conversation, strong pours and unapologetically old-school atmosphere","hours":"Current listings show daily service around 12:00-02:00; confirm holiday and late-night hours.","link":"https://www.facebook.com/Pub28Zamalek","location":"28 Shagaret Al Dor Street, Abu Al Feda, Zamalek, Cairo, Egypt","lat":30.063032,"lng":31.220063},
 {"name":"Cairo Marriott Hotel & Omar Khayyam Casino","city":"cairo","type":"hotel","description":"A large international hotel built around the historic Gezira Palace, with round-the-clock reception, several restaurants, gardens and a central Zamalek base. For a queer traveller its practical advantage is legibility: staffed arrival, transport support and public hospitality infrastructure in a city where discretion matters. That does not make the property queer-certified, and public affection, dating-app meetings and visitor rules still require the same caution as elsewhere in Cairo.","vibe":"palace-scale Zamalek base with international systems and an easy staffed arrival","hours":"Hotel reception operates 24 hours; dining, casino, pool and visitor access use separate schedules and policies.","link":"https://www.marriott.com/en-us/hotels/caieg-cairo-marriott-hotel/overview/","location":"16 Saray El Gezira Street, Zamalek, Cairo, Egypt","lat":30.05709,"lng":31.22456}
]
$cairo_places$) p(name text,city text,type text,description text,vibe text,hours text,link text,location text,lat double precision,lng double precision)
), upd as (
 update public.places p set type=s.type,description=s.description,vibe=s.vibe,hours=s.hours,link=s.link,location=s.location,lat=s.lat,lng=s.lng,seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now())
 from src s where lower(trim(p.city))=s.city and lower(trim(p.name))=lower(trim(s.name)) returning p.id
)
insert into public.places(name,city,type,description,vibe,vibe_tags,hours,link,location,lat,lng,seo_indexable,seo_quality_status,updated_at)
select name,city,type,description,vibe,array[]::text[],hours,link,location,lat,lng,true,'approved',timezone('utc',now()) from src s
where not exists(select 1 from public.places p where lower(trim(p.city))=s.city and lower(trim(p.name))=lower(trim(s.name)));

with src as (
 select * from jsonb_to_recordset($cairo_events$
[
 {"name":"Cairo International Festival for Experimental Theatre 2026","city":"cairo","description":"From 1 to 8 September, Cairo's international experimental-theatre festival returns with performance, workshops and exchange across several city stages. This is a broad public arts festival rather than a queer event, but its cross-border, form-breaking programme offers a more interesting cultural route than inventing a rainbow nightlife promise. The final venue schedule controls every ticket, door and journey.","link":"https://cifet.org/","date":"2026-09-01","start_date":"2026-09-01","end_date":"2026-09-08","location":"Multiple Cairo theatres; festival headquarters at Cairo Opera House, El Gezira, Cairo, Egypt","lat":30.0424,"lng":31.2243,"vibe":"international performance, artistic risk and a citywide theatre audience"},
 {"name":"Starlight Festival Egypt 2026","city":"cairo","description":"A four-day electronic-music journey from 8 to 11 October, opening and closing in Cairo around two main festival nights at the Great Pyramids of Giza. The setting is spectacular and the audience international, but this is not a queer festival or protected space. Treat official transport, ID, security, dress outside the gates and a pre-agreed return route as part of the ticket rather than afterthoughts.","link":"https://starlight-festival.org/","date":"2026-10-08","start_date":"2026-10-08","end_date":"2026-10-11","location":"Cairo programme and Great Pyramids of Giza, Al Haram, Giza, Egypt","lat":29.9792,"lng":31.1342,"vibe":"large-scale electronic pilgrimage beneath the pyramids with high-production energy"},
 {"name":"Cairo International Film Festival 2026","city":"cairo","description":"The 47th Cairo International Film Festival runs from 11 to 20 November, bringing international premieres, Arab cinema, industry meetings and public screenings back to the Opera House and partner screens. The 2026 film list is still developing, so Queer Atlas does not promise LGBTQ+ titles before they are announced. What is confirmed is a major, globally connected film week with a schedule worth reading title by title.","link":"https://ciff.org.eg/en/media/news/ciff-announces-the-opening-of-submissions-for-its-47th-edition","date":"2026-11-11","start_date":"2026-11-11","end_date":"2026-11-20","location":"Cairo Opera House and partner cinemas, El Gezira, Cairo, Egypt","lat":30.0424,"lng":31.2243,"vibe":"major Arab and international cinema with premieres, public screenings and industry gravity"}
]
$cairo_events$) e(name text,city text,description text,link text,date date,start_date date,end_date date,location text,lat double precision,lng double precision,vibe text)
), upd as (
 update public.events e set description=s.description,link=s.link,date=s.date,start_date=s.start_date,end_date=s.end_date,location=s.location,lat=s.lat,lng=s.lng,vibe=s.vibe,seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now())
 from src s where lower(trim(e.city))=s.city and lower(trim(e.name))=lower(trim(s.name)) returning e.id
)
insert into public.events(name,city,description,link,date,start_date,end_date,location,lat,lng,vibe,vibe_tags,seo_indexable,seo_quality_status,updated_at)
select name,city,description,link,date,start_date,end_date,location,lat,lng,vibe,array[]::text[],true,'approved',timezone('utc',now()) from src s
where not exists(select 1 from public.events e where lower(trim(e.city))=s.city and lower(trim(e.name))=lower(trim(s.name)));

with src as (
 select * from jsonb_to_recordset($cairo_services$
[
 {"name":"Bedayaa Organization","city":"cairo","type":"wellness","provider_name":"Bedayaa Organization","contact":"info@bedayaa.org; legal.aid@bedayaa.org","booking_link":"https://bedayaa.org/contact-us/","description":"A queer-led organisation supporting LGBTQI+ people in Egypt and Sudan through legal and emergency help, sexual-health and HIV work, psychosocial support and a dedicated queer-refugee programme. Begin remotely and let the team confirm the safest channel and eligibility. This listing deliberately does not publish a private office or meeting point.","hours":"Confidential and programme-led; contact remotely before any meeting. Response times vary by service and urgency.","link":"https://bedayaa.org/","location":"Confidential service in Cairo and across Egypt; map pin marks the city service area, not a walk-in office","lat":30.0444,"lng":31.2357,"price_tier":"$","vibe":"queer-led health, legal and psychosocial care designed around confidentiality","source":"Bedayaa official health, legal-aid, refugee and contact pages; checked 2026-08-15"},
 {"name":"Cairo 52 Legal Research Institute","city":"cairo","type":"other","provider_name":"Cairo 52 Legal Research Institute","contact":"aid@cairo52.com","booking_link":"https://cairo52.com/contact/","description":"An independent institute documenting LGBTQ+ rights in Egypt and offering pro-bono legal assistance for people facing arrest or prosecution connected to sexual orientation, gender identity, online activity or morality laws. Contact through the legal-aid channel and avoid sending unnecessary identifying material in the first message. No private address is exposed here.","hours":"Remote legal-aid intake; contact by email and state urgency without oversharing sensitive evidence.","link":"https://cairo52.com/","location":"Confidential legal service for Cairo and Egypt; map pin marks the city service area, not an office","lat":30.0444,"lng":31.2357,"price_tier":"$","vibe":"rights-focused legal triage and documentation for cases where discretion is essential","source":"Cairo 52 official contact, legal-aid and current rights research; checked 2026-08-15"},
 {"name":"St Andrew's Refugee Services","city":"cairo","type":"other","provider_name":"St Andrew's Refugee Services (StARS)","contact":"+20 2 2575 9451; info@stars-egypt.org","booking_link":"https://www.stars-egypt.org/","description":"A long-established refugee service providing legal, psychosocial, education and community support in Downtown Cairo. It is not an LGBTQ+ organisation, but it is a practical public entry point for refugees and asylum seekers who need protection advice or specialised referral; queer refugees can also contact Bedayaa's dedicated programme. Eligibility and intake vary, so call before travelling.","hours":"Current partner information lists Sunday-Thursday 09:00-17:00; intake and individual programmes may use narrower hours.","link":"https://www.stars-egypt.org/","location":"38 26th of July Street, Downtown Cairo, Egypt","lat":30.05455,"lng":31.23980,"price_tier":"$","vibe":"refugee-centred legal and psychosocial navigation with established local reach","source":"StARS official website and current UNHCR Egypt partner listing; checked 2026-08-15"}
]
$cairo_services$) s(name text,city text,type text,provider_name text,contact text,booking_link text,description text,hours text,link text,location text,lat double precision,lng double precision,price_tier text,vibe text,source text)
), upd as (
 update public.services x set type=s.type,provider_name=s.provider_name,contact=s.contact,booking_link=s.booking_link,description=s.description,hours=s.hours,link=s.link,location=s.location,lat=s.lat,lng=s.lng,price_tier=s.price_tier,vibe=s.vibe,source=s.source,"lastChecked"='2026-08-15'::date,verified=true,seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now())
 from src s where lower(trim(x.city))=s.city and lower(trim(x.name))=lower(trim(s.name)) returning x.id
)
insert into public.services(name,city,type,provider_name,contact,booking_link,description,hours,link,image_urls,location,lat,lng,price_tier,vibe,vibe_tags,source,"lastChecked",verified,seo_indexable,seo_quality_status,updated_at)
select name,city,type,provider_name,contact,booking_link,description,hours,link,array[]::text[],location,lat,lng,price_tier,vibe,array[]::text[],source,'2026-08-15'::date,true,true,'approved',timezone('utc',now()) from src s
where not exists(select 1 from public.services x where lower(trim(x.city))=s.city and lower(trim(x.name))=lower(trim(s.name)));

commit;

select 'places' category,count(*) total from public.places where lower(trim(city))='cairo'
union all select 'events',count(*) from public.events where lower(trim(city))='cairo'
union all select 'services',count(*) from public.services where lower(trim(city))='cairo'
order by category;
