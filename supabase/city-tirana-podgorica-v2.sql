-- Queer Atlas: replace country-as-city routing with two real city destinations.
-- Verified 2026-10-03. Safe to run multiple times.
--
-- This deliberately moves only listings that are located in Tirana or Podgorica.
-- Country-wide and coastal records remain untouched until their own city or regional
-- destination is created. Do not assign them to the capital merely to retain display.
--
-- Radio Bar Tirana is intentionally excluded: its currently stored coordinates
-- resolve outside Tirana and require separate source verification.

begin;

update public.places
set city = 'tirana'
where lower(trim(city)) = 'albania'
  and name in (
    'Bunker 1944 Lounge',
    'Tulla Culture Center',
    'Destil Creative Hub',
    'Mullixhiu',
    'Colonial Cocktails Academy Tirana',
    'Nouvelle Vague Tirana',
    'Folie Terrace',
    'Komiteti Kafe Muzeum',
    'Hemingway Bar Tirana',
    'Maritim Hotel Plaza Tirana',
    'Rogner Hotel Tirana'
  );

update public.services
set city = 'tirana'
where lower(trim(city)) = 'albania'
  and name in (
    'Aleanca LGBT',
    'Streha LGBT',
    'Pro LGBT Albania',
    'Pink Embassy Albania'
  );

update public.places
set city = 'podgorica'
where lower(trim(city)) = 'montenegro'
  and name in ('Propaganda Podgorica', 'Hilton Podgorica Crna Gora');

update public.services
set city = 'podgorica'
where lower(trim(city)) = 'montenegro'
  and name in (
    'Queer Montenegro',
    'Montenegro Pride',
    'Association Spectra',
    'Juventas Montenegro'
  );

-- These contact and advocacy records have no verified public visit locations.
-- Their former shared city-centre point made four records render as one marker
-- and incorrectly inflated the map cluster count. Remove the unverified records
-- rather than presenting them as Podgorica destinations.
delete from public.services
where lower(trim(city)) = 'podgorica'
  and name in (
    'Queer Montenegro',
    'Montenegro Pride',
    'Association Spectra',
    'Juventas Montenegro'
  );

commit;

-- Expected post-migration counts: Tirana 11 venues + 4 services;
-- Podgorica 2 verified venues. Review country-wide records separately.
select 'tirana places' as category, count(*) as total from public.places where lower(trim(city)) = 'tirana'
union all
select 'tirana services', count(*) from public.services where lower(trim(city)) = 'tirana'
union all
select 'podgorica places', count(*) from public.places where lower(trim(city)) = 'podgorica'
union all
select 'podgorica services', count(*) from public.services where lower(trim(city)) = 'podgorica';
