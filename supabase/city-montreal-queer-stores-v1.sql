-- Montreal queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-02. Idempotent by normalized city/name.
--
-- "Boutique Priape Leather & Fetish" is not a second venue. Priape Leather is
-- the in-house leather range/workshop within Priape's single Montreal flagship
-- at 1311 Sainte-Catherine Est, and is covered by the Priape record below.
-- Sources: https://www.priape.com/pages/store
--          https://www.priape.com/products/support-leather-cock-ring
--
-- O'Boy and Boutique L'Amour are deliberately not inserted: no current,
-- independently verifiable physical Montreal storefront, operator page, address
-- and opening hours could be established under either requested name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_montreal_stores$
  [
    {
      "name":"Librairie L'Euguelionne",
      "city":"montreal",
      "type":"store",
      "description":"A non-profit feminist and queer solidarity cooperative near Beaudry metro, combining a specialist bilingual bookstore with a community space. Its shelves centre women, LGBTQIA2S+, Indigenous, anti-racist and anti-colonial voices across new and used books, zines and printed art.",
      "hours":"Tuesday, Thursday-Saturday 10:30-18:30; Wednesday 12:00-18:30; Sunday-Monday closed.",
      "link":"https://librairieleuguelionne.com/",
      "location":"1426 Rue Beaudry, Montreal, QC H2L 3E5, Canada",
      "lat":45.51897,
      "lng":-73.55639,
      "vibe":"non-profit feminist queer book cooperative with activist community programming",
      "what":"French- and English-language fiction, poetry, essays, graphic novels and children's books by women and LGBTQIA2S+ writers, plus feminist, lesbian, gay, bisexual, trans, intersex, asexual, agender, Two-Spirit, anti-racist and anti-colonial work. Also expect used books, zines and locally printed art, with specialist booksellers able to order beyond the core selection.",
      "best":"Tuesday or Thursday morning gives the longest calm browsing window and the best chance to ask for a precise recommendation; Wednesday starts later at noon. Launches, reading circles, talks and workshops turn the cooperative into a community venue, so check its current social programme before choosing an event-led visit.",
      "online":"The affiliated Leslibraires.ca shop supports delivery, digital titles and eligible store pickup, with exact carrier, timing and charges shown before confirmation. International availability is title- and destination-dependent rather than a blanket worldwide promise, so test the delivery address at checkout or contact the cooperative for unusual or institutional orders.",
      "payment":"Delivered and digital online orders are paid by credit card through the platform's PayPal or Braintree transaction services. Eligible pickup orders may be prepaid or paid at the bookstore when collected. The operator does not publish a complete current list of in-store cash, card and mobile-wallet options, so confirm any essential method directly.",
      "privacy":"This is explicitly a feminist, queer and anti-racist community space, run as a non-profit solidarity cooperative rather than an adult shop. Its curation spans children, families and adults and intentionally foregrounds voices marginalized by conventional distribution. The current official page does not publish a detailed mobility-access statement, so contact the shop for specific access needs.",
      "hours_source":"https://librairieleuguelionne.com/",
      "sources":["https://librairieleuguelionne.com/","https://euguelionne.leslibraires.ca/librairie","https://euguelionne.leslibraires.ca/conditions-d-utilisation","https://librairieleuguelionne.com/wp-content/uploads/2023/08/Euguelionne-Une-Page-Intro-2.pdf"]
    },
    {
      "name":"Priape Montreal",
      "city":"montreal",
      "type":"store",
      "description":"Montreal's original gay and fetish flagship, founded in 1974 and still operating beside Beaudry metro. Priape combines men's underwear and clubwear, toys and lubricants with leather, latex, neoprene, bondage and custom gear, including hand-sewn Priape Leather pieces made in its Montreal workshop.",
      "hours":"Monday-Wednesday 11:00-21:00; Thursday-Saturday 11:00-22:00; Sunday 11:00-19:00.",
      "link":"https://www.priape.com/pages/store",
      "location":"1311 Rue Sainte-Catherine Est, Montreal, QC H2L 2H4, Canada",
      "lat":45.51927,
      "lng":-73.55671,
      "vibe":"five-decade Village gay fetish flagship with its own Montreal leather workshop",
      "what":"A broad men-focused range of underwear, swimwear, sportswear and clubwear alongside lubricants, masturbators, dildos, rings, pumps, chastity, bondage and electro gear. Priape Leather is not a separate shop: its hand-sewn Canadian harnesses, cuffs, collars and custom pieces are part of this flagship, alongside latex and neoprene.",
      "best":"Weekday shortly after 11:00 is best for fitting leather, comparing toys or discussing a custom order with less Village foot traffic. Thursday through Saturday stay open until 22:00 and suit pre-club shopping. Order online for pickup when stock matters, but wait for confirmation; pickup can be same day for early weekday orders and otherwise may take two to four days.",
      "online":"Priape ships with Canada Post and FedEx; destination, service, price and estimated arrival appear at checkout. Canadian orders over CAD 75 can qualify for free standard shipping, while US and international delivery depends on product and destination. Customs descriptions must be accurate abroad, and duties and local taxes are the buyer's responsibility.",
      "payment":"The online shop accepts Visa, Visa Debit except CIBC, Mastercard, American Express and Discover. Canadian orders over CAD 200 can use Canada Post collect-on-delivery. Card statements show 'PRIA-WEB 1-800-461-6969'; special and custom leather orders require a 50% pre-tax deposit.",
      "privacy":"Priape uses plain boxes or bubble envelopes and omits the Priape name from ordinary shipping labels; the Montreal return address remains visible, COD labels differ, and international customs forms must describe contents accurately. The operator calls it Montreal's original gay and fetish shop, reports ground-floor access and serves in French and English.",
      "hours_source":"https://www.priape.com/pages/store",
      "sources":["https://www.priape.com/pages/store","https://www.priape.com/policies/shipping-policy","https://www.priape.com/pages/faq","https://www.priape.com/products/support-leather-cock-ring","https://interligne.co/en/resources/chez-priape-2/"]
    }
  ]
  $qa_montreal_stores$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-02','source_urls',sources,
    'research_status','current_operator_platform_and_community_sources',
    'updated_at','2026-09-02T00:00:00Z'
  ) intel from raw_stores s
), updated as (
  update public.places p set
    name=s.name,type=s.type,description=s.description,hours=s.hours,link=s.link,
    location=s.location,lat=s.lat,lng=s.lng,vibe=s.vibe,
    vibe_tags=array['store']::text[],venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||s.intel,
    seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now())
  from stores s where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Librairie L''Euguelionne' and lower(trim(p.name)) in ('l''euguélionne','l''euguelionne','librairie l''euguélionne','librairie l''euguelionne'))
    or (s.name='Priape Montreal' and lower(trim(p.name)) in ('priape','priape montreal','priape montréal','chez priape','boutique priape leather & fetish','priape leather'))
  ) returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,
       array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s where not exists (
  select 1 from public.places p where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Librairie L''Euguelionne' and lower(trim(p.name)) in ('l''euguélionne','l''euguelionne','librairie l''euguélionne','librairie l''euguelionne'))
    or (s.name='Priape Montreal' and lower(trim(p.name)) in ('priape','priape montreal','priape montréal','chez priape','boutique priape leather & fetish','priape leather'))
  )
);

select public.qa_refresh_city_seo_status('montreal')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places where lower(trim(city))='montreal'
and lower(trim(name)) in ('librairie l''euguelionne','priape montreal')
order by name;
