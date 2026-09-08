-- Paris queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-01. Idempotent by normalized city/name.
--
-- Men by Men / MBM is deliberately not inserted. The French company register
-- reports no active establishment; its last Paris establishment ceased trading
-- in 2022. Source: https://www.pappers.fr/entreprise/men-by-men-422497743

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_paris_stores$
  [
    {
      "name":"Les Mots a la Bouche",
      "city":"paris",
      "type":"store",
      "description":"Paris's landmark cooperative LGBTQ+ bookshop, founded in 1980 and now based near Saint-Ambroise. It combines queer literature, philosophy, essays, comics, photography and film with free launches, conversations and carefully informed bookseller recommendations.",
      "hours":"Monday-Sunday 10:30-19:30.",
      "link":"https://motsbouche.com/",
      "location":"37 rue Saint-Ambroise, 75011 Paris, France",
      "lat":48.861105,
      "lng":2.377922,
      "vibe":"militant yet expansive queer bookshop with cooperative community energy",
      "what":"LGBTQ+ fiction, philosophy, essays, comics, photography, art books and films from major publishers and small independent presses. The selection extends beyond a narrow identity shelf, placing writers such as Judith Butler and Herve Guibert alongside broader literary voices, and staff can order missing titles.",
      "best":"Weekday late morning or early afternoon is best for thoughtful recommendations. Free launches and author conversations usually take place at ground level and create a stronger community atmosphere; check the current programme before going specifically for an event.",
      "online":"The new official site offers products and gift vouchers with postage calculated separately. Its archived shop explicitly warned customers to stop ordering during the platform transition, so use only the current motsbouche.com checkout and confirm international destination support before relying on delivery abroad.",
      "payment":"Apple Maps reports credit cards, contactless payment and Apple Pay at the physical shop. The current accessible operator pages do not publish a complete online payment list, so verify the checkout or contact the booksellers if one particular method is required.",
      "privacy":"This is a broad lesbian, gay, bisexual and trans cultural institution rather than an adult-only shop. The regional tourism authority reports support for hearing, visual and cognitive accessibility and wheelchair access with assistance; contact the shop before visiting if independent step-free access is essential.",
      "hours_source":"https://motsbouche.com/nous-contacter",
      "sources":["https://motsbouche.com/nous-contacter","https://www.visitparisregion.com/fr/les-mots-a-la-bouche","https://maps.apple.com/place?place-id=IBC6A332B3024FBF2","https://archive.motsbouche.com/"]
    },
    {
      "name":"Boxxman Paris",
      "city":"paris",
      "type":"store",
      "description":"A four-level men-focused complex opposite Les Halles: two upper retail floors for gay sex toys, BDSM and fetish clothing, puppy gear, lubricants and accessories, with the separate adults-only Le Boxx cruising area on the two lower levels.",
      "hours":"Monday-Friday 10:30-23:00; Saturday 10:30-00:00; Sunday 12:00-22:00.",
      "link":"https://www.boxxman.fr/",
      "location":"2 rue de la Cossonnerie, 75001 Paris, France",
      "lat":48.861438,
      "lng":2.348816,
      "vibe":"large late-opening Les Halles gay fetish store above a busy cruising complex",
      "what":"Major gay toy brands, poppers, lubricants, BDSM accessories, fetish clothing and what the operator describes as Paris's largest puppy-gear wardrobe. Shopping occupies the upper two floors; the Le Boxx backroom and cruising facilities are a distinct adults-only offer downstairs.",
      "best":"For shopping advice and easier comparison, visit before the operator's reported 15:00-18:00 busy period. Late evening and Saturday connect more strongly with the cruising venue and nightlife crowd; anyone wanting only retail can stay on the two shop levels.",
      "online":"The current official website primarily documents the physical shop, products and on-site complex; no dependable full e-commerce shipping policy was found. Contact Boxxman before promising online stock, delivery outside France or discreet parcel terms.",
      "payment":"A current complete payment-method list is not published on the accessible official pages. Confirm card, cash or mobile payment directly with the shop, particularly because retail purchases and admission to the separate cruising area are different transactions.",
      "privacy":"The upper floors are an openly gay BDSM and fetish shop, while Le Boxx downstairs is an 18+ men-only cruising venue. Customers seeking only products should follow the shopping levels; no verified mail-order privacy policy was found, so do not assume discreet shipping from the physical venue.",
      "hours_source":"https://www.boxxman.fr/",
      "sources":["https://www.boxxman.fr/","https://www.boxxman.fr/informations-horaires/","https://queer.paris/lieux/boxxman","https://www.pappers.fr/entreprise/snb-807751862"]
    },
    {
      "name":"IEM Distribution Le Marais",
      "city":"paris",
      "type":"store",
      "description":"IEM's historic Marais flagship and online base, serving gay fetish customers since 1980 with thousands of leather, latex, neoprene, textile, BDSM, puppy, toy, lubricant and safer-sex products, including hand-made French IEM leatherwork.",
      "hours":"Monday-Thursday 12:00-20:00; Friday-Saturday 12:00-21:00; Sunday 14:00-20:00.",
      "link":"https://www.iem.fr/fr/",
      "location":"16 rue Sainte-Croix de la Bretonnerie, 75004 Paris, France",
      "lat":48.858426,
      "lng":2.356955,
      "vibe":"deep-catalogue Marais fetish institution with French leather craftsmanship",
      "what":"More than a general sex shop: leather, latex and neoprene clothing, underwear, harnesses, puppy equipment, masks, restraints, electro and playroom gear, toys, condoms, gloves, lubricants and media. IEM-branded leather pieces are individually hand-made in its French workshop.",
      "best":"Weekday opening at noon is the calmest window for sizing, leather care or product advice. Friday and Saturday remain open to 21:00 and suit pre-nightlife shopping; use click-and-collect when a particular size or specialist toy must be waiting.",
      "online":"In-stock orders validated before 17:00 generally dispatch the same working day. IEM ships across France and most European countries, quoting about 24-48 hours after dispatch in France and 3-7 working days elsewhere in Europe; click-and-collect is available at the Marais shop.",
      "payment":"The operator confirms secure card payment using 256-bit encryption but does not expose a stable complete card-and-wallet list in the accessible FAQ. Verify checkout availability for a specific method; online support is available Monday-Friday 10:00-18:00.",
      "privacy":"Every online order is sent in completely neutral packaging without logo or content description. IEM protects account data and offers personal advice; its physical-store positioning is specifically men-for-men and gay fetish focused rather than a universal all-genders adult boutique.",
      "hours_source":"https://www.patroc.com/gay/paris/d/iemlemarais.html",
      "sources":["https://www.iem.fr/fr/","https://www.iem.fr/fr/content/7-assistance","https://www.iem.fr/fr/content/4-a-propos","https://www.patroc.com/gay/paris/d/iemlemarais.html"]
    },
    {
      "name":"BMC Store",
      "city":"paris",
      "type":"store",
      "description":"A compact, late-night gay adult store on rue des Lombards, operating since 1988 with toys, DVDs, lubricants, aromas, leather and bondage accessories, plus separate remote-controlled video cabins in the basement.",
      "hours":"Monday-Sunday 10:00-01:00.",
      "link":"https://www.bmc-store.com/",
      "location":"21 rue des Lombards, 75004 Paris, France",
      "lat":48.859377,
      "lng":2.350648,
      "vibe":"discreet late-night Marais adult shop with old-school video-cabin basement",
      "what":"A broad compact range of dildos, plugs, cock rings, whips, cuffs, nipple clamps, aphrodisiacs, poppers and lubricants, plus a particularly large selection of French and international adult DVDs. Remote-controlled viewing cabins are located separately in the basement.",
      "best":"Daytime is quieter for straightforward product questions. The exceptional 01:00 closing makes BMC useful on the way into or back from Marais nightlife; later visits also overlap more with customers using the basement video cabins.",
      "online":"BMC maintains an online shop, but no sufficiently clear current international-delivery timetable or parcel policy was available in the researched operator text. Confirm destination, tracking, customs and packaging directly before ordering outside France.",
      "payment":"Current directories report bank-card acceptance, while the operator does not publish a stable full list of online or in-store methods. Confirm a specific card or mobile wallet before a late visit rather than relying on unrelated businesses sharing the BMC initials.",
      "privacy":"The street entrance is described as discreet and the basement cabins are separate from ordinary retail browsing. BMC is explicitly a gay adult store; no verified neutral-packaging promise was found for its online orders, so privacy-sensitive customers should ask before purchase.",
      "hours_source":"https://www.bmc-store.com/infos/4-qui-sommes-nous",
      "sources":["https://www.bmc-store.com/infos/4-qui-sommes-nous","https://annuaire-entreprises.data.gouv.fr/entreprise/420408700","https://outxout.com/venue/bmcparis","https://www.travelgay.com/venue/bmc-store"]
    }
  ]
  $qa_paris_stores$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-01','source_urls',sources,
    'research_status','current_operator_registry_and_specialist_sources',
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
    or (s.name='Les Mots a la Bouche' and lower(trim(p.name)) in ('les mots a la bouche','les mots à la bouche'))
    or (s.name='Boxxman Paris' and lower(trim(p.name)) in ('boxxman','boxxman paris','boxx man'))
    or (s.name='IEM Distribution Le Marais' and lower(trim(p.name)) in ('iem','iem distribution','iem le marais','iem distribution le marais'))
    or (s.name='BMC Store' and lower(trim(p.name)) in ('b.m.c. store','b.m.c.','bmc','bmc store'))
  ) returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,
       array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s where not exists (
  select 1 from public.places p where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Les Mots a la Bouche' and lower(trim(p.name)) in ('les mots a la bouche','les mots à la bouche'))
    or (s.name='Boxxman Paris' and lower(trim(p.name)) in ('boxxman','boxxman paris','boxx man'))
    or (s.name='IEM Distribution Le Marais' and lower(trim(p.name)) in ('iem','iem distribution','iem le marais','iem distribution le marais'))
    or (s.name='BMC Store' and lower(trim(p.name)) in ('b.m.c. store','b.m.c.','bmc','bmc store'))
  )
);

select public.qa_refresh_city_seo_status('paris')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places where lower(trim(city))='paris'
and lower(trim(name)) in ('les mots a la bouche','boxxman paris','iem distribution le marais','bmc store')
order by name;
