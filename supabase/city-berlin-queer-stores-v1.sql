-- Berlin queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-01. Idempotent by normalized city/name.
--
-- Bruno's, Maassenstrasse 14, is deliberately not inserted: the final Berlin
-- store closed in January 2026 following insolvency and brunos.de is offline.
-- Sources: https://www.queer.de/detail.php?article_id=56782
--          https://berlin.gaycities.com/shops/100513-brunos

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_berlin_stores$
  [
    {
      "name":"Prinz Eisenherz Buchladen",
      "city":"berlin",
      "type":"store",
      "description":"Berlin's historic queer bookshop in the Schoneberg rainbow district, with LGBTQ+ fiction and non-fiction, comics, art books, magazines, films and children's and young-adult titles in German plus selected English and other languages. The shop also hosts readings, discussions and workshops.",
      "hours":"Monday-Saturday 10:00-20:00; Sunday closed. The four Advent Sundays may open 13:00-18:00.",
      "link":"https://prinz-eisenherz.buchkatalog.de/",
      "location":"Motzstrasse 23, 10777 Berlin-Schoneberg, Germany",
      "lat":52.497775,
      "lng":13.348946,
      "vibe":"landmark queer bookshop with deep specialist shelves and thoughtful recommendations",
      "what":"Queer fiction, politics, history, biographies, comics, photography and art books, magazines, DVDs and inclusive children's and YA books. The range includes trans, lesbian and gay perspectives plus German and selected English, French and Spanish titles.",
      "best":"Browse on a weekday before the after-work period for the easiest conversation with booksellers. Use the shop's programme when you specifically want a reading, panel or workshop; Saturday is better for atmosphere but can be busier.",
      "online":"The official catalogue accepts online orders for home delivery or collection at Motzstrasse 23. Berlin's official directory confirms delivery and pickup; it does not document a dependable worldwide-shipping promise, so international customers should confirm destination and cost before paying.",
      "payment":"The current official contact and catalogue pages do not publish a complete list of in-store or online payment methods. Check the method shown at checkout, or ask the bookshop before visiting if a particular card or cash option matters.",
      "privacy":"This is a specialist LGBTIQ+ bookshop rather than an adult-only store: trans, lesbian, gay and intersectional subjects sit alongside queer children's books. Staff recommendations and cultural events make it a low-pressure place to ask for a specific topic without needing to know the exact title.",
      "hours_source":"https://prinz-eisenherz.buchkatalog.de/content/AdresseOeffnungszeitenKontakt",
      "sources":["https://prinz-eisenherz.buchkatalog.de/content/AdresseOeffnungszeitenKontakt","https://www.berlin.de/sen/web/service/liefer-und-abholdienste/index.php/detail/1518","https://www.visitberlin.de/en/node/2245222"]
    },
    {
      "name":"Mister B Berlin",
      "city":"berlin",
      "type":"store",
      "description":"Mister B's Schoneberg flagship for premium leather and rubber clothing, fetish gear, bondage equipment, toys and care products, backed by experienced multilingual fitting and product advice.",
      "hours":"Monday-Friday 12:00-20:00; Saturday 11:00-20:00; Sunday closed. Festival-week hours can differ.",
      "link":"https://www.misterb.com/de/berlin",
      "location":"Motzstrasse 22, 10777 Berlin-Schoneberg, Germany",
      "lat":52.498116,
      "lng":13.348898,
      "vibe":"expert leather-and-rubber flagship with practical fitting help",
      "what":"Premium leather and rubber apparel, harnesses, boots, underwear, fetish accessories, BDSM equipment, toys, lubricants and care products. The Berlin team is specifically presented as experienced and multilingual, so this is useful when fit, material or safe use needs explanation.",
      "best":"Go shortly after opening on a weekday for calmer fitting and detailed advice. Friday evening, Saturday and the periods around Easter Berlin or Folsom Europe bring more visitors; use those times for scene energy rather than an unhurried consultation.",
      "online":"The full Mister B web shop ships internationally in plain, discreet packaging with tracking. Published estimates are generally 2-3 working days in the Netherlands, 3-5 in the EU and 5-10 outside the EU; customs and destination restrictions can apply.",
      "payment":"The web shop publishes Mastercard, Visa, Maestro, PayPal, bank transfer and country-specific options including iDEAL, Sofort, Giropay and Multibanco. In-store methods can differ from the web checkout, so confirm locally if one method is essential.",
      "privacy":"Orders are packed in plain material without a brand name on the outside. In the shop, the multilingual team offers detailed product and fit guidance and explicitly describes the welcome as friendly; ask staff directly about sizing, materials or toy care rather than guessing with intimate products.",
      "hours_source":"https://www.misterb.com/de/berlin",
      "sources":["https://www.misterb.com/de/berlin","https://www.misterb.com/de/unsere-laden","https://www.misterb.com/de/knowledge-base","https://www.misterb.com/de/knowledge-base/versand-und-lieferung/"]
    },
    {
      "name":"RoB Berlin",
      "city":"berlin",
      "type":"store",
      "description":"The Berlin branch of the long-running RoB leather and fetish label, carrying leather and rubber clothing, boots, masks, restraint and BDSM equipment, toys, lubricants, hygiene products and the brand's own specialist gear.",
      "hours":"Monday-Thursday 12:00-19:00; Friday-Saturday 11:00-19:00; Sunday closed. Event-week hours can differ.",
      "link":"https://www.rob.eu/de/",
      "location":"Motzstrasse 25, 10777 Berlin-Schoneberg, Germany",
      "lat":52.497713,
      "lng":13.348593,
      "vibe":"heritage leather and fetish specialist with serious gear depth",
      "what":"RoB-branded and selected leather and rubber outfits, trousers, chaps, harnesses, boots, masks and headgear, bondage and corporal-play equipment, toys, lube and hygiene products. It is strongest for shoppers comparing specialist materials and substantial gear rather than general fashion.",
      "best":"Tuesday-Thursday soon after the 12:00 opening is the calmer window for sizing and material questions. Friday, Saturday and Folsom Europe week are livelier and better for browsing the scene, but leave less room for a slow consultation.",
      "online":"RoB ships by insured, tracked UPS: the operator states 3-4 working days within the EU and 5-7 for the rest of the world. Published shipping is EUR 10 to Germany/Benelux, EUR 19 to the rest of the EU, EUR 30 to non-EU Europe and EUR 129 elsewhere; taxes, duties and destination rules can add cost.",
      "payment":"RoB provides a dedicated payment-method page and displays the currently available choices during checkout, but the accessible operator text does not expose a stable complete list. Verify the checkout or call the Berlin shop before relying on one particular in-store method.",
      "privacy":"The operator says products are securely and discreetly wrapped. Important exception: shipments outside the EU require external invoice copies and the RoB logo can be visible on them, so customers needing fully unbranded international delivery should check before ordering.",
      "hours_source":"https://www.rob.eu/de/service/",
      "sources":["https://www.rob.eu/de/","https://www.rob.eu/de/service/","https://www.rob.eu/de/service/shipping-returns/","https://www.rob.eu/de/service/disclaimer/"]
    },
    {
      "name":"BOXER Berlin",
      "city":"berlin",
      "type":"store",
      "description":"BOXER's Schoneberg concept store for men's sportswear and underwear, leather and fetish clothing, accessories and toys, combining the Barcelona label's own designs with a compact one-stop gear selection.",
      "hours":"Monday-Saturday 11:00-20:00; Sunday closed. Check the current social post during major fetish events.",
      "link":"https://www.instagram.com/boxer.berlin/",
      "location":"Eisenacher Strasse 11, 10777 Berlin-Schoneberg, Germany",
      "lat":52.497321,
      "lng":13.349369,
      "vibe":"bold Barcelona-to-Berlin concept store for sportswear, leather and toys",
      "what":"Men's sportswear and underwear, leather and fetish pieces, accessories and toys. BOXER describes the collection around sexy, wearable design and the Berlin shop is advertised as a one-stop mix of leather, sports and toy categories rather than a single-material specialist.",
      "best":"Weekday daytime is the best bet for quieter browsing. Saturday and Folsom Europe periods bring more visitors and a stronger neighbourhood buzz; check @boxer.berlin for temporary hours before a festival-week trip.",
      "online":"BOXER Berlin advertises both in-store and online shopping, but a current, verifiable Berlin-specific international shipping policy was not available in the researched sources. Contact the store through its current Instagram or telephone before promising delivery outside Germany.",
      "payment":"Current Berlin listings do not publish a reliable complete payment-method list. Confirm cash, card or mobile-wallet acceptance directly with the shop if the method matters; do not assume the Barcelona operation and Berlin counter are identical.",
      "privacy":"The shop is openly fetish-focused and sits inside Schoneberg's queer retail cluster, which makes browsing gear more matter-of-fact than in a general clothing store. No current Berlin-specific discreet-parcel policy was found, so privacy-sensitive online shoppers should ask before ordering.",
      "hours_source":"https://www.patroc.com/gay/berlin/d/boxer.html",
      "sources":["https://www.patroc.com/gay/berlin/d/boxer.html","https://folsomeurope.berlin/wp-content/uploads/2024/03/FOLSOM_EUROPE_Pocket_Guide_2024_WEB.pdf","https://maenner.media/locations/boxer-berlin/"]
    }
  ]
  $qa_berlin_stores$) s(
    name text, city text, type text, description text, hours text, link text,
    location text, lat double precision, lng double precision, vibe text,
    what text, best text, online text, payment text, privacy text,
    hours_source text, sources jsonb
  )
), stores as (
  select s.*, jsonb_build_object(
    'queue_wait', what,
    'best_nights', best,
    'crowd_mix', online,
    'dress_code', payment,
    'staff_inclusivity', privacy,
    'hours_source_url', hours_source,
    'hours_checked_at', '2026-09-01',
    'source_urls', sources,
    'research_status', 'current_first_party_and_current_specialist_directory_sources',
    'updated_at', '2026-09-01T00:00:00Z'
  ) as intel
  from raw_stores s
), updated as (
  update public.places p
  set name = s.name,
      type = s.type,
      description = s.description,
      hours = s.hours,
      link = s.link,
      location = s.location,
      lat = s.lat,
      lng = s.lng,
      vibe = s.vibe,
      vibe_tags = array['store']::text[],
      venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || s.intel,
      seo_indexable = true,
      seo_quality_status = 'approved',
      updated_at = timezone('utc', now())
  from stores s
  where lower(trim(p.city)) = s.city
    and (
      lower(trim(p.name)) = lower(trim(s.name))
      or (s.name = 'BOXER Berlin' and lower(trim(p.name)) in ('box berlin', 'boxer berlin'))
      or (s.name = 'RoB Berlin' and lower(trim(p.name)) in ('rob berlin', 'rob'))
      or (s.name = 'Mister B Berlin' and lower(trim(p.name)) in ('mister b', 'mister b berlin'))
    )
  returning p.id
)
insert into public.places(
  name, city, type, description, hours, link, location, lat, lng, vibe,
  vibe_tags, venue_intel, seo_indexable, seo_quality_status, updated_at
)
select
  s.name, s.city, s.type, s.description, s.hours, s.link, s.location,
  s.lat, s.lng, s.vibe, array['store']::text[], s.intel, true, 'approved',
  timezone('utc', now())
from stores s
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = s.city
    and (
      lower(trim(p.name)) = lower(trim(s.name))
      or (s.name = 'BOXER Berlin' and lower(trim(p.name)) in ('box berlin', 'boxer berlin'))
      or (s.name = 'RoB Berlin' and lower(trim(p.name)) in ('rob berlin', 'rob'))
      or (s.name = 'Mister B Berlin' and lower(trim(p.name)) in ('mister b', 'mister b berlin'))
    )
);

select public.qa_refresh_city_seo_status('berlin')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name, type, hours, location,
       venue_intel ->> 'research_status' as research_status
from public.places
where lower(trim(city)) = 'berlin'
  and lower(trim(name)) in (
    'prinz eisenherz buchladen', 'mister b berlin', 'rob berlin', 'boxer berlin'
  )
order by name;
