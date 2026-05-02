-- Queer Atlas: Berlin venue enrichment (cool queer vibe)
-- Safe behavior:
-- 1) Updates existing rows by lower(city)+lower(name)
-- 2) Inserts only if missing

begin;

with payload (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
) as (
  values
    (
      'Bärenhöhle',
      'berlin',
      'bar',
      'Bärenhöhle runs on that warm Berlin bear-bar chemistry where everyone clocks each other fast, then settles into real neighborhood momentum. It is less tourist showcase, more loyal local room with a playful, masculine-but-soft social tone that rewards staying longer than one drink.',
      'cozy bear-social local lane',
      array['social','cozy']::text[],
      'Mon-Fri 18:00-03:00; Sat 20:00-03:00.',
      'https://baerenhoehle-berlin.de/',
      'Schönhauser Allee 90, 10439 Berlin, Germany',
      52.5474,
      13.4138
    ),
    (
      'Betty F***',
      'berlin',
      'bar',
      'Betty F*** feels like Berlin after dark compressed into one dense Mitte pressure point: fast entries, louder flirt energy, and a room that flips from cute to chaotic by weekend peak. Come ready for crowd heat, short eye-contact negotiations, and a very direct social tempo.',
      'busy mitte social pulse',
      array['social','mixed']::text[],
      'Mon-Thu 20:00-03:00; Fri-Sat 20:00-05:00; Sun 20:00-03:00.',
      'https://www.instagram.com/bettyf_berlin',
      'Mulackstraße 13, 10119 Berlin, Germany',
      52.5268,
      13.4022
    ),
    (
      'Capture',
      'berlin',
      'bar',
      'Capture gives Friedrichshain queer nightlife a more art-forward lane: intimate room size, stylish but unpretentious crowd, and a social rhythm that is easy to enter even when you arrive solo. Great pre-club anchor if you want conversation before full dance-floor release.',
      'arty friedrichshain crossover',
      array['social','mixed']::text[],
      'Daily 18:00-02:00; Fri-Sat till 03:00.',
      'https://www.instagram.com/capture_bar',
      'Wühlischstraße 32, 10245 Berlin, Germany',
      52.5084,
      13.4584
    ),
    (
      'Der neue Oldtimer',
      'berlin',
      'bar',
      'Der neue Oldtimer is classic Schöneberg continuity: camp touches, mature regulars, and that old-school Berlin comfort where everyone seems to already know the room. Less trend chase, more enduring neighborhood identity with strong regular-to-visitor crossover.',
      'traditional camp local room',
      array['cozy','social']::text[],
      'Daily 14:00/16:00-02:00/05:00.',
      'https://www.instagram.com/der_neue_oldtimer',
      'Lietzenburger Straße 12, 10789 Berlin, Germany',
      52.4997,
      13.3436
    ),
    (
      'ILOsBAR',
      'berlin',
      'bar',
      'ILOsBAR balances polished cocktails with real late-night Berlin movement: early social elegance, then a stronger dance-room pull on weekend hours. It works well as a bridge between Schöneberg bar-crawl mode and a more club-coded second chapter.',
      'polished dance-room social hub',
      array['social','mixed']::text[],
      'Tue-Thu 19:00-02:00; Fri-Sat 19:00-04:00.',
      'https://ilosbar.de/',
      'Motzstraße 30, 10777 Berlin, Germany',
      52.4979,
      13.3455
    ),
    (
      'Rauschgold',
      'berlin',
      'bar',
      'Rauschgold is Kreuzberg drag-pop chaos done right: karaoke spikes, camp performance energy, and a crowd that loves singalong catharsis as much as flirting. If you want Berlin to feel messy, theatrical, and very alive without pretending to be too cool, this is your room.',
      'drag karaoke pop pressure',
      array['drag','pop']::text[],
      'Mon 20:00-03:00; Tue-Thu 20:00-04:00; Fri-Sat 20:00-06:00; Sun 20:00-04:00.',
      'https://www.rauschgold.berlin/',
      'Mehringdamm 62, 10961 Berlin, Germany',
      52.4930,
      13.3876
    ),
    (
      'Tabasco',
      'berlin',
      'bar',
      'Tabasco carries old-Berlin gay-bar DNA: direct social contact, zero-frills confidence, and a room that has seen generations rotate through Nollendorf nightlife. The vibe is unapologetically classic and still delivers a useful late-stop social pulse.',
      'old-school men-meet-men lane',
      array['social','mixed']::text[],
      'Daily 18:00-03:00; Fri-Sat till 05:00.',
      'https://www.tabascobar.de/',
      'Fuggerstraße 3, 10777 Berlin, Germany',
      52.4998,
      13.3460
    ),
    (
      'The Coven',
      'berlin',
      'bar',
      'The Coven plays the premium cocktail card with queer intent: moody lighting, polished service, and a crowd that leans date-night-smart before drifting toward late-city spontaneity. Perfect for when you want Berlin nightlife to start with style, not noise.',
      'stylish cocktail queer room',
      array['social','cozy']::text[],
      'Mon-Thu 19:00-02:00; Fri-Sat 20:00-03:00; Sun 19:00-02:00.',
      'https://www.thecovenberlin.com/',
      'Kleine Präsidentenstraße 3, 10178 Berlin, Germany',
      52.5227,
      13.4025
    ),
    (
      'Tipsy Bear',
      'berlin',
      'bar',
      'Tipsy Bear is one of those joyful performance-driven spaces where drag, karaoke, and queer stage culture blend into nightly social electricity. It feels inclusive, playful, and intentionally loud in spirit without losing community warmth.',
      'performance-forward queer social room',
      array['drag','social']::text[],
      'Daily from 18:00 to late.',
      'https://tipsybearberlin.com/',
      'Eberswalder Straße 21, 10437 Berlin, Germany',
      52.5405,
      13.4124
    ),
    (
      'SilverFuture',
      'berlin',
      'bar',
      'SilverFuture brings Neukölln queer politics and nightlife into one room: mixed crowd, sharper social edge, and a community-first atmosphere that still turns fun and flirty fast. Great for travelers who want Berlin beyond rainbow-window dressing.',
      'queer-inclusive neukolln social lane',
      array['social','mixed']::text[],
      'Mon-Tue 17:00-01:00; Wed-Thu 17:00-02:00; Fri-Sat 17:00-03:00.',
      'https://www.silverfuture.net/',
      'Weserstraße 206, 12047 Berlin, Germany',
      52.4866,
      13.4245
    ),
    (
      'Zum schmutzigen Hobby',
      'berlin',
      'bar',
      'Zum schmutzigen Hobby sits in the Revaler energy field where creative crowd, queer nightlife, and post-midnight unpredictability collide. Expect a rougher-cooler texture, stronger music identity, and a social vibe that feels very Berlin-now.',
      'revaler queer music lane',
      array['mixed','social']::text[],
      'Wed from 20:00; Thu from 21:00; Fri-Sat from 22:00.',
      'https://www.zumschmutzigenhobby.de/',
      'Revaler Str. 99 (Gate 2), 10245 Berlin, Germany',
      52.5074,
      13.4549
    )
),
updated as (
  update public.places p
  set
    type = s.type,
    description = s.description,
    vibe = s.vibe,
    vibe_tags = s.vibe_tags,
    hours = s.hours,
    link = s.link,
    location = s.location,
    lat = s.lat,
    lng = s.lng
  from payload s
  where lower(p.city) = lower(s.city)
    and lower(p.name) = lower(s.name)
  returning p.id
)
insert into public.places (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
)
select
  s.name,
  s.city,
  s.type,
  s.description,
  s.vibe,
  s.vibe_tags,
  s.hours,
  s.link,
  s.location,
  s.lat,
  s.lng
from payload s
where not exists (
  select 1
  from public.places p
  where lower(p.city) = lower(s.city)
    and lower(p.name) = lower(s.name)
);

commit;

