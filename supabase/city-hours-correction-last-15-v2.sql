-- Queer Atlas: verified opening-hours correction v2 for the latest 15 city batches.
-- Self-contained Supabase version with no temporary objects or procedural blocks.
-- Checked 2026-08-28. Corrects 71 place records without inventing fixed hours
-- for event-only venues. Closed/non-place records are removed from SEO.

begin;

with qa_hours_fix(city,name,hours,source_url,seo_indexable,seo_quality_status) as (
values
('canberra','ChiChiz Bar','Wednesday 18:00-23:00; Thursday 18:00-00:00; Friday 18:00-03:30; Saturday 19:00-03:30; Sunday-Tuesday closed.','https://eatdrinkcheap.com.au/canberra/chichiz-canberra-civic',true,'approved'),
('canberra','Cube Nightclub','Permanently closed as Cube at the end of 2025; the premises now trade under another name.','https://abr.business.gov.au/ABN/View?id=21654734611',false,'rejected'),
('canberra','Smith''s Alternative','Sunday 12:00-21:30; Monday 12:00-21:00; Tuesday-Thursday 12:00-21:30; Friday-Saturday 12:00-23:30.','https://maps.apple.com/place?place-id=IFA9942FEB8B4CB16',true,'approved'),
('canberra','The Ranch','Daily 10:00-23:00.','https://www.mustangranch.com.au/the-ranch',true,'approved'),

('montpellier','Le Coxx Montpellier','Daily 18:00-01:00.','https://www.fiertemontpellierpride.com/guide-lgbt',true,'approved'),
('montpellier','Le Café de la Mer','Monday-Saturday 09:00-01:00; Sunday closed.','https://fr.restaurantguru.com/Cafe-de-la-Mer-Montpellier',true,'approved'),
('montpellier','Madrediosa','Tuesday-Saturday 18:00-01:00; Sunday-Monday closed.','https://lefooding.com/en/bars/madrediosa',true,'approved'),
('montpellier','Le Mercury','Monday and Thursday-Saturday 18:00-01:00; Tuesday, Wednesday and Sunday closed.','https://trouver-ouvert.fr/montpellier/le-mercury-3070177',true,'approved'),
('montpellier','Mireille Café Moderne','Sunday-Tuesday and Thursday-Saturday 10:00-19:00; Wednesday closed.','https://wanderlog.com/fr/place/details/10401004/mireille-caf%C3%A9-moderne',true,'approved'),
('montpellier','Le Moom Club','Daily 14:00-20:00 according to the operator booking page; late club access is limited to separately advertised events.','https://le-moom-nightclub.eatbu.com/?lang=en',true,'approved'),
('montpellier','One Sauna','Daily 12:00-21:00; last admission 20:00.','https://www.one-sauna.com/horaires',true,'approved'),
('montpellier','Koncept Sauna','Daily 13:00-01:00; themed sessions begin at 20:00.','https://www.konceptsauna.com/',true,'approved'),
('montpellier','Le Marvelous','Daily 12:00-14:30 and 19:00-22:30.','https://www.tripadvisor.fr/Restaurant_Review-g187153-d7060983-Reviews-Le_MARVELOUS-Montpellier_Herault_Occitanie.html',true,'approved'),

('goa','Rudy''s Bar & Grill','Daily 18:30-23:30.','https://www.tripadvisor.co.uk/Restaurant_Review-g1204883-d23939722-Reviews-Rudy_s_Goa-Vagator_North_Goa_District_Goa.html',true,'approved'),
('goa','Flying Dolphin Beachside Café','Daily 08:00-00:00.','https://www.tripadvisor.com/Restaurant_Review-g306995-d1932040-Reviews-Flying_Dolphin_Beach_Side_Cafe_and_Bar_with_Tapas-Calangute_North_Goa_District_Go.html',true,'approved'),
('goa','Artjuna Café','Daily 07:30-22:00.','https://maps.apple.com/place?place-id=I89F363F9EFA3244F',true,'approved'),
('goa','Saltamontes Garden Café & Bar','Daily 09:00-01:00.','https://www.zomato.com/goa/saltamontes-garden-cafe-bar-anjuna/info',true,'approved'),
('goa','Hopping Frog','Sunday-Monday and Wednesday-Saturday 19:30-04:00; Tuesday closed.','https://wanderlog.com/place/details/767740/hopping-frog-bar--kitchen-anjuna-goa',true,'approved'),
('goa','Copa Cabana by De''bee','Daily 13:00-00:00.','https://wanderlog.com/place/details/8623979/copa-cabana-by-debee',true,'approved'),

('osaka','EAGLE OSAKA','Monday-Thursday 20:00-04:00; Friday-Sunday 18:00-04:00.','https://visitgayosaka.com/bar/gay_bar/eagle-osaka.html',true,'approved'),
('osaka','EXPLOSION','No standing weekday hours; advertised Saturday and pre-holiday events generally run 21:00-05:00, with some ending 04:00.','https://explosion.osaka/',true,'approved'),
('osaka','FrenZ FrenZY','Sunday-Thursday 19:00-02:00; Friday-Saturday 19:00-late; irregular holidays.','https://visitgayosaka.com/bar/gay_bar/frenz-frenzy.html',true,'approved'),
('osaka','GRAND SLAM','Tuesday-Sunday 21:00-05:00; Monday closed unless it is a national holiday.','https://visitgayosaka.com/bar/gay_bar/grand-slam.html',true,'approved'),
('osaka','Bacchus','Monday-Saturday 18:00-02:00; Sunday closed (Monday closes instead when Sunday is a holiday).','https://visitgayosaka.com/bar/gay_bar/bacchus.html',true,'approved'),
('osaka','DENG MANG','Sunday-Friday 18:00-01:00; Saturday 18:00-04:00; irregular holidays.','https://visitgayosaka.com/bar/gay_bar/deng-mang.html',true,'approved'),
('osaka','GuLf','Sunday-Thursday 19:00-01:00; Friday-Saturday 20:00-04:00; irregular holidays.','https://visitgayosaka.com/bar/gay_bar/gulf.html',true,'approved'),
('osaka','HIGEBUN','Monday-Saturday 19:00-02:00; Sunday 19:00-00:00; irregular holidays.','https://visitgayosaka.com/bar/gay_bar/higebun.html',true,'approved'),
('osaka','Hug','Daily 20:00-05:00.','https://visitgayosaka.com/bar/gay_bar/hug.html',true,'approved'),
('osaka','Dungaree','Tuesday-Thursday and Sunday 19:00-01:00; Friday-Saturday and pre-holidays 19:00-02:00; Monday closed, with irregular exceptions.','https://visitgayosaka.com/bar/gay_bar/dungaree.html',true,'approved'),

('cluj_napoca','OUTside / Q Club','Monday-Wednesday 18:00-22:00; Thursday-Sunday 18:00-02:00.','https://deschis.ro/cluj-napoca/outside-cluj-136192',true,'approved'),
('cluj_napoca','Flying Circus Cluj','Sunday-Wednesday 17:00-04:00; Thursday-Saturday 17:00-06:00.','https://cluj.com/locatii/flying-circus/',true,'approved'),
('cluj_napoca','MATTER','No regular public hours; admission is only for advertised events at the door time shown on each ticket or listing.','https://www.instagram.com/matter.cluj/',true,'approved'),
('cluj_napoca','Urania Café','Monday-Friday 07:30-21:00; Saturday-Sunday 09:00-19:00.','https://uraniasocialhub.ro/contact/',true,'approved'),
('cluj_napoca','Cinema Victoria','Open for the day''s programmed screenings; the box office closes admission five minutes before each published start time.','https://www.cinemavictoria.ro/info-bilete/',true,'approved'),

('lille','Silom','Monday-Wednesday 17:00-01:00; Thursday-Saturday 17:00-02:00; Sunday closed.','https://www.pagesjaunes.fr/pros/64121523',true,'approved'),
('lille','Le Privilège','Monday-Saturday 15:00-03:00; Sunday 17:00-03:00.','https://www.lilletourism.com/sortir/bonnes-adresses/restaurants/le-privilege-lille-fr-4431518/',true,'approved'),
('lille','Slay Club Lille','No permanent premises or weekly opening hours; Slay is a mobile event brand and publishes the host venue and door time per event.','https://www.instagram.com/slayclub_lille/',false,'rejected'),
('lille','Le Sling','Thursday 12:00-18:00; Friday 20:00-01:00; Saturday 20:00-02:00; Sunday 14:00-18:00; Monday-Wednesday closed.','https://www.lesling.com/',true,'approved'),
('lille','Les Bains Lille','Monday-Thursday and Sunday 12:00-00:00; Friday 12:00-01:00; Saturday 14:00-01:00.','https://www.lesbains.fr/nos-soirees',true,'approved'),
('lille','Sauna Soho Lille','The operator website is currently unavailable and no reliable current public opening hours could be verified on 2026-08-28.','https://saunasoho.com/',false,'hold'),
('lille','Bar du Centre at J''en Suis, J''y Reste','Thursday 18:00-22:30; closed to public at other times except for announced association events.','https://www.jensuisjyreste.org/',true,'approved'),
('lille','Lokarria','Monday-Wednesday and Sunday 17:00-01:00; Thursday-Saturday 17:00-02:00.','https://www.bottin.fr/fiche-locale/bibfhajdbbddehfeajac--lokarria--lille.htm',true,'approved'),
('lille','La Griffe','Tuesday-Thursday 17:00-00:00; Friday 17:00-01:00; Saturday 17:00-02:00; Sunday-Monday closed.','https://lille.citycrunch.fr/2020/02/27/on-a-teste-la-griffe-le-cafe-concert-de-la-rue-des-postes-lance-par-trois-tigresses/',true,'approved'),

('corfu','LARNA','No public walk-in hours; access is limited to accepted residencies and registered stays on the operator''s published programme dates.','https://larna.gr/',false,'rejected'),

('chania','Da Vinci Bar Club on Apollo Party nights','Da Vinci: Monday-Saturday 09:00-02:00, Sunday closed. Apollo Party 2026 doors: 21:00-04:00 on announced dates.','https://www.apollopartycrete.com/event-details-registration/apollo-party-chania-thursday-august-27th-2026',true,'approved'),
('chania','Ababa','Daily 10:00-03:00.','https://restaurantguru.com/ABABA-Chania',true,'approved'),

('cork','Wilde Cork','Friday-Saturday from 20:00; Sunday from 18:00; Monday-Thursday closed. The operator publishes no fixed closing time.','https://www.instagram.com/wildecork/',true,'approved'),
('cork','The Liberty Bar','Monday-Thursday 16:00-23:30; Friday 15:00-01:00; Saturday 14:00-01:00; Sunday 15:00-23:30.','https://www.tripadvisor.ie/Attraction_Review-g186600-d26355164-Reviews-The_Liberty_Bar_X_Resistance-Cork_County_Cork.html',true,'approved'),
('cork','Nudes Craft & Cocktail','Daily from 17:00; the operator publishes event door times separately and no fixed closing time.','https://www.instagram.com/nudescork/',true,'approved'),
('cork','The Pav','Intermission: Sunday-Thursday 14:00-02:00 and Friday-Saturday 14:00-02:30; upstairs Pav opens Thursday-Sunday from 17:00, with event doors as listed.','https://thepav.ie/',true,'approved'),

('innsbruck','DomCafe-Bar','Daily 11:00-01:00.','https://www.domcafe.at/',true,'approved'),
('innsbruck','Die Bäckerei - Kulturbackstube','Day café Monday-Thursday 09:00-17:00 and Friday 09:00-12:30; bar Thursday-Saturday 19:00-00:00. Published seasonal closures override these hours.','https://www.diebaeckerei.at/',true,'approved'),
('innsbruck','Funkraum on Queer Attack nights','No standing weekly hours; Funkraum opens for advertised events, and Queer Attack/Pride admission uses the door time on the specific organiser listing.','https://www.queerattack.at/',true,'approved'),
('innsbruck','Bogentheater','Performance days only; the box office opens 30 minutes before the published curtain time.','https://rausgegangen.de/locations/bogentheater/',true,'approved'),

('pamplona','Harrotu LGTBI Centre','16 September-14 June: Monday 17:00-20:30; Tuesday-Friday 10:30-13:30 and 17:00-20:30; Saturday 11:00-14:00. 15 June-15 September: Monday and Friday 10:30-14:00; Tuesday-Thursday 17:00-21:00; Saturday-Sunday closed.','https://www.pamplona.es/temas/igualdad-y-lgtbi/harrotu',true,'approved'),
('pamplona','Casa de las Mujeres de Pamplona','Monday-Wednesday 17:00-21:00; Thursday-Friday 10:30-13:30 and 17:00-21:00; Saturday 10:00-13:30 and 17:00-20:30; Sunday closed. Published July and holiday closures apply.','https://www.pamplona.es/fr/node/28251',true,'approved'),

('oxford','The Jolly Farmers','Monday-Thursday 12:00-00:00; Friday-Saturday 12:00-01:00; Sunday 12:00-23:00.','https://www.jollyfarmers-oxford.co.uk/shop',true,'approved'),
('oxford','Plush Oxford','Tuesday during university term 22:30-03:00; Thursday-Saturday 22:30-03:30; Monday, Wednesday and Sunday closed.','https://plushoxford.com/',true,'approved'),
('oxford','Common Ground Workspace','Temporarily closed; no public opening hours as of 2026-08-28.','https://www.commongroundoxford.com/contact',false,'hold'),
('oxford','The Nest Oxford','No standing public hours; ticketed events publish individual door times, with current 2026 listings showing 18:00, 18:30 or 21:00 depending on the production.','https://wegottickets.com/location/29502',true,'approved'),

('bergen','Fincken','Wednesday-Thursday 19:00-01:30; Friday 20:00-03:00; Saturday 12:00-03:00; Sunday-Tuesday closed.','https://www.fincken.no/',true,'approved'),
('bergen','Det Akademiske Kvarter on queer nights','No regular queer-night hours; the student house opens according to its programme, and each queer event publishes its room and door time.','https://kvarteret.no/',true,'approved'),
('bergen','USF Verftet on Bergen Pride nights','Kafé Kippers daily 11:00-23:00; event halls open at the published door time for each Bergen Pride production.','https://usf.no/kontakt/',true,'approved'),

('santiago_de_compostela','Bloom Santiago','Wednesday-Thursday 20:00-04:00; Friday-Saturday 20:00-04:30; Sunday-Tuesday closed.','https://www.santiagoturismo.com/pubs/bloom',true,'approved'),
('santiago_de_compostela','A Medusa Pub','Tuesday-Thursday 17:30-02:00; Friday 17:30-03:00; Saturday 16:30-03:00; Sunday 16:30-00:00; Monday closed.','https://www.cylex.es/santiago-de-compostela/a-medusa-pub--santiago-de-compostela--13774208.html',true,'approved'),
('santiago_de_compostela','Tarasca','Wednesday-Thursday 23:30-04:00; Friday-Saturday 23:30-04:30; Sunday-Tuesday closed.','https://www.santiagoturismo.com/pubs/tarasca',true,'approved'),

('salzburg','HOSI Bar Salzburg','Wednesday from 19:00 and Saturday from 20:00; closed to the public on other days except for announced events. The operator publishes no fixed closing time.','https://hosi.or.at/',true,'approved'),
('salzburg','Dark Eagle','Wednesday-Thursday 20:00-00:00; Friday-Saturday 20:00-02:00; Sunday-Tuesday closed.','https://www.dark-eagle.at/dark-eagle/die-bar/',true,'approved'),
('salzburg','NarrenCastl','Monday, Tuesday and Thursday 18:00-22:00; Wednesday, Friday and Saturday 18:00-23:00; Sunday closed.','https://www.narrencastl.at/contact',true,'approved'),
('salzburg','Furo Salzburg','Tuesday 17:00-22:00; Wednesday-Friday 12:00-14:00 and 17:00-22:00; Saturday 10:00-14:00 and 17:00-22:00; Sunday 10:00-14:00; Monday closed.','https://furo.at/essen/',true,'approved'),
('salzburg','ARGEkultur on HOSI Fest nights','Information desk: Tuesday 14:00-17:00; Wednesday-Friday 11:00-13:00 and 17:00-19:00. Event box office opens one hour before the published start time.','https://www.argekultur.at/kontakt',true,'approved')
), updated as (
update public.places p
set hours = f.hours,
    seo_indexable = f.seo_indexable,
    seo_quality_status = f.seo_quality_status,
    venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || jsonb_build_object(
      'hours_source_url', f.source_url,
      'hours_checked_at', '2026-08-28',
      'hours_research_status', case
        when f.seo_quality_status = 'rejected' then 'closed_or_not_a_permanent_public_venue'
        when f.seo_quality_status = 'hold' then 'temporarily_closed'
        when f.hours ilike 'No standing%' or f.hours ilike 'No regular%' or f.hours ilike 'Performance days%' or f.hours ilike 'Open for%' then 'verified_event_only_access'
        else 'verified_published_opening_hours'
      end
    ),
    updated_at = timezone('utc', now())
from qa_hours_fix f
where lower(trim(p.city)) = f.city
  and (
    lower(trim(p.name)) = lower(f.name)
    or (
      f.city = 'cluj_napoca'
      and f.name = 'Urania Café'
      and lower(trim(p.name)) = 'urania social hub'
    )
  )
returning p.id, f.city as fix_city, f.name as fix_name
)
select
  71 as expected_rows,
  (select count(*) from updated) as updated_rows,
  coalesce(
    (
      select jsonb_agg(jsonb_build_object('city',f.city,'name',f.name) order by f.city,f.name)
      from qa_hours_fix f
      where not exists (
        select 1 from updated u
        where u.fix_city = f.city and u.fix_name = f.name
      )
    ),
    '[]'::jsonb
  ) as missing_rows;

-- Correct two operator identities/links discovered during the hours audit.
update public.places
set name = 'Urania Social Hub',
    link = 'https://uraniasocialhub.ro/',
    updated_at = timezone('utc', now())
where lower(trim(city)) = 'cluj_napoca'
  and lower(trim(name)) = 'urania café';

update public.places
set link = 'https://www.jollyfarmers-oxford.co.uk/',
    updated_at = timezone('utc', now())
where lower(trim(city)) = 'oxford'
  and lower(trim(name)) = 'the jolly farmers';

select public.qa_refresh_city_seo_status(slug)
from (values
  ('canberra'),('montpellier'),('goa'),('osaka'),('cluj_napoca'),
  ('lille'),('corfu'),('chania'),('cork'),('innsbruck'),
  ('pamplona'),('oxford'),('bergen'),('santiago_de_compostela'),('salzburg')
) v(slug)
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select city,name,hours,seo_indexable,seo_quality_status,
       venue_intel->>'hours_source_url' as hours_source_url
from public.places
where lower(trim(city)) in (
  'canberra','montpellier','goa','osaka','cluj_napoca',
  'lille','corfu','chania','cork','innsbruck',
  'pamplona','oxford','bergen','santiago_de_compostela','salzburg'
)
order by city,name;
