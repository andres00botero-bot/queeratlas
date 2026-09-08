-- New York queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-01. Idempotent by normalized city/name.
--
-- Bluestockings Cooperative is deliberately not inserted: the Suffolk Street
-- shop permanently closed in September 2025.
-- Sources: https://maps.apple.com/place?place-id=I6681CB05EEA72588
--          https://en.wikipedia.org/wiki/Bluestockings_(bookstore)
--
-- The Phluid Project is deliberately not inserted: its former 684 Broadway
-- flagship is out of business. The queer-owned brand remains available online,
-- but no current public NYC retail shop could be verified.
-- Sources: https://www.nyctourism.com/fr/shopping/the-phluid-project/
--          https://thephluidproject.com/collections/phluid-nyc

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_new_york_stores$
  [
    {
      "name":"The Leather Man",
      "city":"new_york",
      "type":"store",
      "description":"A West Village gay leather institution founded on Christopher Street in 1965, before Stonewall. The compact specialist shop carries leather and fetish clothing, harnesses, restraints, toys and gear, including pieces made in its own New York workshop.",
      "hours":"Monday-Sunday 12:00-19:45.",
      "link":"https://www.theleatherman.com/",
      "location":"111 Christopher Street, New York, NY 10014, United States",
      "lat":40.73363,
      "lng":-74.00547,
      "vibe":"old-school Christopher Street leather specialist with in-house NYC gear",
      "what":"A deep men-focused leather and S/M range: harnesses, jockstraps, leather clothing, restraints, collars, paddles, toys, lubricants and specialist accessories. The online catalogue is not the full inventory, and selected Leather Man restraints and other pieces are made in the shop's own New York workshop.",
      "best":"Visit soon after noon on a weekday when you want time for fit, measurements or first-time gear questions. Weekend afternoons put you in the heart of Christopher Street's queer foot traffic; call ahead when a particular leather size or item is essential because the website does not show the entire shop range.",
      "online":"The official web shop serves customers worldwide and aims to dispatch within 24 hours on working days; carrier, speed and cost appear at checkout. International legality, duties and sizing remain the buyer's responsibility, and custom, altered or body-contact products can be final sale, so confirm before ordering abroad.",
      "payment":"Apple Maps currently reports credit cards, contactless payment and Apple Pay in store. The official checkout determines the available online methods and shipping choices; use its live checkout or contact the shop if a particular foreign card or wallet is required.",
      "privacy":"This is an explicitly gay, adult leather and fetish shop with more than sixty years on Christopher Street, not a generic fashion boutique. Newcomers can ask staff about fit and use without needing prior scene knowledge. The shop is reported wheelchair accessible; online terms require customers to be 18 or older.",
      "hours_source":"https://maps.apple.com/place?place-id=I75586EAFD1795AEA",
      "sources":["https://www.theleatherman.com/service/about/","https://www.theleatherman.com/service/general-terms-conditions/","https://www.theleatherman.com/leather-man-restraints-leather-with-velcro.html","https://maps.apple.com/place?place-id=I75586EAFD1795AEA"]
    },
    {
      "name":"The Pleasure Chest Upper East Side",
      "city":"new_york",
      "type":"store",
      "description":"The remaining New York flagship of the sex-positive retailer founded in 1971: a spacious, education-led Upper East Side shop for body-safe toys, lubricants, safer-sex supplies, lingerie and BDSM products, backed by free virtual workshops and inclusive specialist guidance.",
      "hours":"Monday-Sunday 12:00-22:00.",
      "link":"https://www.thepleasurechest.com/content/c/new-york-upper-east-side/",
      "location":"810 Lexington Avenue, New York, NY 10065, United States",
      "lat":40.76445,
      "lng":-73.96688,
      "vibe":"spacious sex-positive flagship combining broad choice with education-led advice",
      "what":"Vibrators, dildos, anal and male toys, app-controlled products, lubricants, safer-sex supplies, lingerie, restraints and wider BDSM gear across beginner and specialist levels. The Upper East Side flagship has the brand's broader New York selection and promotes free virtual workshops centred on education, enjoyment and inclusion.",
      "best":"Early weekday afternoons are best for unhurried comparison and questions; the store remains open until 22:00 daily for after-work or pre-date shopping. Check the linked Eventbrite programme before travelling for a workshop, as events are scheduled separately. This location is in-store shopping only rather than local pickup.",
      "online":"The full online store ships to more than 250 countries. Orders usually leave in one to two business days; international air mail is quoted at one to six weeks and insured FedEx or UPS at five to twelve business days, excluding customs delays. Destination laws, taxes and duties remain the buyer's responsibility.",
      "payment":"Online checkout accepts Visa, Mastercard, American Express, Discover, JCB and PayPal; current product pages also display Afterpay on eligible purchases. US-bank checks and money orders are accepted by mail, but personal checks delay dispatch for three weeks. Verify in-store wallet availability at the register.",
      "privacy":"Online orders use a plain box or envelope, show Innov8 Solutions as sender and appear as 'Innov8*PC 1-888-773-1631' on card statements. The flagship explicitly frames service around sex positivity, education and inclusion; the website states a WCAG 2.1 accessibility goal and provides a dedicated accessibility contact.",
      "hours_source":"https://www.thepleasurechest.com/content/c/new-york-upper-east-side/",
      "sources":["https://www.thepleasurechest.com/content/c/new-york-upper-east-side/","https://www.thepleasurechest.com/help","https://www.thepleasurechest.com/terms-and-conditions/","https://www.xbiz.com/news/294724/pleasure-chest-to-close-west-village-location"]
    }
  ]
  $qa_new_york_stores$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-01','source_urls',sources,
    'research_status','current_operator_and_map_sources',
    'updated_at','2026-09-01T00:00:00Z'
  ) intel from raw_stores s
), updated as (
  update public.places p set
    name=s.name,type=s.type,description=s.description,hours=s.hours,link=s.link,
    location=s.location,lat=s.lat,lng=s.lng,vibe=s.vibe,
    vibe_tags=array['store']::text[],venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||s.intel,
    seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now())
  from stores s where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='The Leather Man' and lower(trim(p.name)) in ('leather man','the leatherman','leatherman'))
    or (s.name='The Pleasure Chest Upper East Side' and lower(trim(p.name)) in ('pleasure chest','the pleasure chest','pleasure chest upper east side','the pleasure chest upper east side'))
  ) returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,
       array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s where not exists (
  select 1 from public.places p where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='The Leather Man' and lower(trim(p.name)) in ('leather man','the leatherman','leatherman'))
    or (s.name='The Pleasure Chest Upper East Side' and lower(trim(p.name)) in ('pleasure chest','the pleasure chest','pleasure chest upper east side','the pleasure chest upper east side'))
  )
);

select public.qa_refresh_city_seo_status('new_york')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places where lower(trim(city))='new_york'
and lower(trim(name)) in ('the leather man','the pleasure chest upper east side')
order by name;
