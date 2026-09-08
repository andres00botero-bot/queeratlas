-- Madrid queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-01. Idempotent by normalized city/name.
--
-- "Barkings" and "Nirvana" are deliberately not inserted. No current Madrid
-- retail business under either name could be corroborated through operator,
-- city, map or current queer-directory sources. Nirvana Madrid search results
-- refer to a private swingers club, not a shop. Add only after a URL/address is
-- supplied and independently verified.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_madrid_stores$
  [
    {
      "name":"Libreria Berkana",
      "city":"madrid",
      "type":"store",
      "description":"Spain's pioneering openly LGBTQ+ bookshop, founded in 1993 and rooted in Chueca. Berkana combines a deep Spanish-language queer catalogue with comics, poetry, essays, biographies, children's books, films, magazines and a focused range of community gifts.",
      "hours":"Monday-Friday 10:30-20:30; Saturday 11:30-20:30; Sunday 12:00-14:00 and 17:00-20:00.",
      "link":"https://www.libreriaberkana.com/",
      "location":"Calle de Hortaleza 62, 28004 Madrid-Chueca, Spain",
      "lat":40.422815,
      "lng":-3.699183,
      "vibe":"pioneering queer bookshop with activist history and serious Spanish-language curation",
      "what":"LGBTQ+ novels, poetry, biographies, essays, politics, trans and bisexuality titles, HIV/AIDS resources, comics, children's books, films and magazines. Berkana's own guides also surface focused themes such as queer art, sport and trans history instead of treating every queer book as one undifferentiated shelf.",
      "best":"Weekday late morning or early afternoon is the calmest time to ask for a recommendation or locate a specialist title. Use the shop's current channels for launches and cultural activity; Sunday has split hours, so avoid arriving between 14:00 and 17:00.",
      "online":"Berkana sells through its own catalogue and ships within Spain, the EU and internationally by courier. Published domestic delivery is usually 48-72 working hours after dispatch; international timing and cost are calculated in the basket and can be affected by stock or customs.",
      "payment":"The official shipping terms publish credit-card payment for all destinations and cash on delivery for mainland Spain and some domestic routes. International orders must be paid by card; the card is charged when the order is ready to ship, not when an unavailable title is merely ordered.",
      "privacy":"Berkana is an openly LGBTQ+ cultural institution, not an adult-only shop, and its catalogue explicitly spans lesbian, gay, bisexual, trans, feminist and children's perspectives. Online order records are retained for legal and tax purposes; the shop states that customer data is kept confidential and marketing is sent only after newsletter consent.",
      "hours_source":"https://www.patroc.com/gay/madrid/shops.html",
      "sources":["https://www.libreriaberkana.com/","https://www.libreriaberkana.com/condiciones-envio/","https://www.esmadrid.com/compras/berkana","https://www.patroc.com/gay/madrid/shops.html"]
    },
    {
      "name":"BOXER Madrid",
      "city":"madrid",
      "type":"store",
      "description":"BOXER's compact Chueca shop for gay men's underwear, sportswear, swimwear, leather, neoprene and latex-look pieces, fetish accessories and adult toys, positioned as a fashion-to-play stop rather than a pure leather workshop.",
      "hours":"Monday-Saturday approximately 12:00-14:00 and 16:00-21:00; Sunday closed. Current directories differ, so confirm before a midday visit or during Pride.",
      "link":"https://www.facebook.com/Boxermadridshop/",
      "location":"Calle de Pelayo 3, 28004 Madrid-Chueca, Spain",
      "lat":40.421743,
      "lng":-3.699111,
      "vibe":"bright Chueca mix of body-conscious sportswear, fetish fashion and toys",
      "what":"Men's underwear, swimwear and sportswear alongside leather, neoprene, latex-look and technical-fabric pieces, plus fetish accessories and gay adult toys. Choose BOXER when you want club or beach clothing and play gear in one visit rather than custom leatherwork.",
      "best":"Visit after 16:00 on Monday-Saturday because the most current specialist guide reports a midday closure. Pride and major fetish weekends can bring extended hours and a busier shop; check the Madrid social page before relying on festival schedules.",
      "online":"BOXER has historically promoted online shopping alongside its Madrid branch, but the researched current sources do not expose a reliable Madrid-specific international-delivery policy. Confirm stock, destination, parcel presentation and returns directly before placing a privacy-sensitive overseas order.",
      "payment":"No current Madrid operator page publishes a dependable complete list of payment methods. Contact the shop if a particular card, cash or mobile-wallet option is required; do not infer the Madrid counter's methods from another BOXER country operation.",
      "privacy":"The store is explicitly gay and fetish focused in the centre of Chueca, so underwear, toys and gear are normal retail questions rather than hidden requests. A current Madrid-specific discreet-packaging statement could not be verified, so online buyers needing unbranded parcels should ask first.",
      "hours_source":"https://www.patroc.com/gay/madrid/d/boxer-shop.html",
      "sources":["https://www.patroc.com/gay/madrid/d/boxer-shop.html","https://spartacus.gayguide.travel/goingout/madrid/92072_Boxer%2BMadrid","https://es.travelgay.com/venue/boxer-madrid","https://www.paginasamarillas.es/f/madrid/boxer-madrid_229112586_000000001.html"]
    },
    {
      "name":"SR Leather Shop",
      "city":"madrid",
      "type":"store",
      "description":"A veteran Chueca leather and BDSM specialist known for traditionally made own-label leather goods, made-to-measure work, uniforms, rubber wear and hard-to-find fetish accessories, with a more workshop-led identity than neighbouring fashion stores.",
      "hours":"Monday-Saturday 11:00-21:00; Sunday 11:00-21:00 according to current specialist listings. Call before a Sunday or midday visit because older directories show split hours.",
      "link":"https://www.visitchueca.com/en/guia/177-s-r-leather-shop",
      "location":"Calle de Pelayo 7, 28004 Madrid-Chueca, Spain",
      "lat":40.421833,
      "lng":-3.698994,
      "vibe":"hands-on leather workshop expertise for custom fetish and bondage gear",
      "what":"Traditionally made leather clothing and accessories, made-to-measure pieces, uniforms, rubber wear, masks, chains, cuffs, bondage equipment and other BDSM gear. SR is the stronger choice for material quality, custom fit or a specialist leather request rather than general underwear shopping.",
      "best":"Choose a weekday daytime visit for measurements, construction questions or a custom request. Later afternoons and Pride periods have more Chueca energy but are less suitable for an unhurried fitting; call first if commissioning work or travelling on Sunday.",
      "online":"Current sources verify the physical shop, telephone and contact email but do not provide a current public checkout or dependable international-shipping policy. For custom work or delivery, contact SR directly and agree dimensions, lead time, destination, returns and parcel presentation before payment.",
      "payment":"A reliable current payment-method list is not published in the researched operator and directory sources. Confirm the deposit and final-payment method directly, especially for made-to-measure leather where the terms may differ from an off-the-rack shop purchase.",
      "privacy":"SR is an established gay leather and BDSM specialist, and current descriptions emphasize a warm welcome and experienced help even for shy or first-time shoppers. Custom orders involve sensitive measurements and preferences, so ask how those details are stored and how any shipment is labelled before commissioning.",
      "hours_source":"https://es.travelgay.com/venue/sr-leather",
      "sources":["https://www.visitchueca.com/en/guia/177-s-r-leather-shop","https://es.travelgay.com/venue/sr-leather","https://www.gomadridpride.com/listings/sr-leather-shop/","https://www.qdq.com/sr-leather-shop-673525"]
    }
  ]
  $qa_madrid_stores$) s(
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
    'research_status', 'current_operator_city_and_specialist_directory_sources',
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
      or (s.name = 'Libreria Berkana' and lower(trim(p.name)) in ('berkana', 'libreria berkana', 'librería berkana'))
      or (s.name = 'BOXER Madrid' and lower(trim(p.name)) in ('boxer', 'boxer madrid'))
      or (s.name = 'SR Leather Shop' and lower(trim(p.name)) in ('sr', 'sr leather', 'sr leather shop', 's.r. leather shop', 'boxer fetish'))
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
      or (s.name = 'Libreria Berkana' and lower(trim(p.name)) in ('berkana', 'libreria berkana', 'librería berkana'))
      or (s.name = 'BOXER Madrid' and lower(trim(p.name)) in ('boxer', 'boxer madrid'))
      or (s.name = 'SR Leather Shop' and lower(trim(p.name)) in ('sr', 'sr leather', 'sr leather shop', 's.r. leather shop', 'boxer fetish'))
    )
);

select public.qa_refresh_city_seo_status('madrid')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name, type, hours, location,
       venue_intel ->> 'research_status' as research_status
from public.places
where lower(trim(city)) = 'madrid'
  and lower(trim(name)) in ('libreria berkana', 'boxer madrid', 'sr leather shop')
order by name;
