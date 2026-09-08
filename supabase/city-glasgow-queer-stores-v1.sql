-- Glasgow queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-02. Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_glasgow_stores$
  [
    {
      "name":"Category Is Books",
      "city":"glasgow",
      "type":"store",
      "description":"Glasgow's fiercely independent LGBTQIA+ bookshop in Govanhill, founded in 2018 as a place for queer books, history, art, activism and storytelling. Its compact Southside shelves mix new and second-hand fiction, nonfiction, poetry, comics, magazines and zines.",
      "hours":"Thursday-Sunday 11:00-17:00; Monday-Wednesday closed.",
      "link":"https://www.categoryisbooks.com/",
      "location":"34 Allison Street, Glasgow G42 8NN, United Kingdom",
      "lat":55.83688,
      "lng":-4.26828,
      "vibe":"small fiercely independent Govanhill queer bookshop with community solidarity",
      "what":"Queer-authored and LGBTQIA+-centred fiction, memoir, poetry, history, politics, healthcare and activism, alongside graphic novels, comics, magazines and independent zines. New and second-hand stock is joined by badges, cards and small queer gifts; the focused curation and personal recommendations are the point rather than supermarket-scale choice.",
      "best":"Thursday or Friday soon after 11:00 is best for a quiet browse and a conversation about recommendations. The shop is only open four days a week, so do not rely on older listings showing Wednesday or a 18:00 close. Watch its channels for readings and community activity if you want more than ordinary retail browsing.",
      "online":"The operator runs a local home-delivery service for queer books, comics and zines, with orders processed on Wednesdays. It does not publish a dependable blanket international-shipping promise or fixed overseas timetable on the current homepage, so contact the shop before ordering outside its normal delivery area.",
      "payment":"The shop is listed as accepting card payments and National Book Tokens, including paper vouchers and e-gift vouchers. Its current operator page does not expose a full list of cash, contactless or online checkout methods, so confirm directly when a particular voucher or wallet matters.",
      "privacy":"This is an all-ages LGBTQIA+ cultural bookshop, not an adult store, and explicitly welcomes people to learn from queer art, history and activism. Current guide information reports level access, while an accessibility directory notes there is no customer toilet; contact the small shop in advance for detailed mobility or sensory arrangements.",
      "hours_source":"https://www.categoryisbooks.com/",
      "sources":["https://www.categoryisbooks.com/","https://www.visitglasgow.com/explore-by-interest/local-and-independent-glasgow/top-bookshops-in-glasgow","https://www.nationalbooktokens.com/stockist/category-is-books-glasgow","https://new.opengreenmap.org/browse/sites/61889edd3944ce0100fae20e"]
    },
    {
      "name":"Luke & Jack",
      "city":"glasgow",
      "type":"store",
      "description":"An independent, LGBTQ+-owned Merchant City pleasure store operating since 2010, presenting sex toys, condoms, lubricants, lingerie, underwear, leather and bondage products in a warm general-adult retail setting rather than a men-only fetish shop.",
      "hours":"Monday-Saturday 11:00-18:00; Sunday 12:00-17:00.",
      "link":"https://www.lukeandjack.com/",
      "location":"45 Virginia Street, Glasgow G1 1TS, United Kingdom",
      "lat":55.85902,
      "lng":-4.24746,
      "vibe":"independent inclusive Merchant City pleasure shop with education and event links",
      "what":"A broad pleasure range for individuals and couples: vibrators, dildos, anal toys, masturbators, condoms, lubricants, strap-ons and gifts, plus underwear, lingerie, leather, fetish wear and bondage accessories. Its basement Virginia Gallery also gives the premises an event and workshop role beyond straightforward retail.",
      "best":"A weekday late morning is the calmest time for questions and product comparison. Friday and Saturday connect naturally with Merchant City and nearby queer nightlife. The shop also hosts or supports sex-positive events and beginner rope education; those are separately ticketed, and the basement event space is reported not wheelchair accessible.",
      "online":"The business is active in person and its listings describe online delivery across Europe, but the currently accessible website does not provide a sufficiently clear, current destination table, dispatch schedule or parcel-discretion policy. Use the live checkout or contact the shop before relying on international delivery or neutral packaging.",
      "payment":"Current local listings report that the physical shop accepts credit cards. A stable official list of accepted card networks, mobile wallets and online payment providers was not available in the researched site, so confirm a particular method directly rather than inferring it from the generic storefront checkout.",
      "privacy":"Luke & Jack describes its aim as changing expectations of adult shops through quality products, friendly service and a warm atmosphere for singles and couples; queer directories identify it as LGBTQ+-owned. The ground-floor retail area and basement must not be conflated: current event information explicitly reports the downstairs workshop venue as not wheelchair accessible.",
      "hours_source":"https://find-open.co.uk/glasgow/luke-jack-1568885",
      "sources":["https://www.lukeandjack.com/","https://find-open.co.uk/glasgow/luke-jack-1568885","https://www.thegayuk.com/listings/business-listing/uk/glasgow/luke-and-jack/","https://glasgow.gaycities.com/shops/305367-luke-jack","https://www.eventbrite.co.uk/e/casual-rope-beginners-rope-glasgow-afternoon-310526-tickets-1980705708092"]
    },
    {
      "name":"Gremlin Gear",
      "city":"glasgow",
      "type":"store",
      "description":"Glasgow's queer kink specialist on Parnie Street, opened by an active Scottish company in 2023. The bright physical shop and online catalogue centre underwear, harnesses, collars, pup and alternative clothing, toys and essentials, with a visible platform for local makers.",
      "hours":"Wednesday-Friday 12:00-19:00; Saturday 11:00-19:00; Sunday 12:00-18:00; Monday-Tuesday closed. Verify before travelling.",
      "link":"https://gremlingear.co.uk/",
      "location":"15 Parnie Street, Glasgow G1 5RJ, United Kingdom",
      "lat":55.85671,
      "lng":-4.24404,
      "vibe":"light welcoming queer kink shop with pup gear and local-maker personality",
      "what":"Harnesses, collars, kilts, underwear and alternative clothing sit beside chastity, dildos, plugs, pumps, strokers, vibrators, BDSM equipment, lubricants and cleaners. Pup and animal-play gear is a particular strength, with brands such as Weredog, Prowler and Furrjoi plus Glasgow-area makers including Woof & Wag and playful occult accessories.",
      "best":"Wednesday or Thursday afternoon gives the best chance to compare sizing and ask beginner questions before weekend traffic. Saturday has the longest 11:00-19:00 window and suits visitors combining Trongate shopping with nightlife. Because the operator does not currently publish store hours prominently, verify its social channels or call before a special journey.",
      "online":"The web shop advertises dispatch in five to ten business days and a 30-day return window for unopened, undamaged goods; hygiene, personal-care, poppers, gift cards and final-sale products have exceptions. No dependable country-by-country international table was found, so use checkout or contact the shop for overseas price, customs and availability.",
      "payment":"The website presents a secure checkout but does not expose a stable, complete card-and-wallet list in the accessible operator text. In-store refunds return to the original payment method. Verify any required mobile wallet or non-UK card before visiting, particularly for higher-value specialist gear.",
      "privacy":"Every web order is promised in plain outer packaging with neither the Gremlin Gear name nor branding visible on the label. The business calls itself Glasgow's queer kink specialist and deliberately presents a light, welcoming shop for both established kinksters and beginners; its size charts extend across multiple body and gendered ranges.",
      "hours_source":"https://gaytravelr.com/united-kingdom/glasgow/shopping/gremlin-gear",
      "sources":["https://gremlingear.co.uk/","https://gremlingear.co.uk/pages/returns-refunds","https://gremlingear.co.uk/products/le-wand-thrust","https://gaytravelr.com/united-kingdom/glasgow/shopping/gremlin-gear","https://find-and-update.company-information.service.gov.uk/company/SC784412"]
    }
  ]
  $qa_glasgow_stores$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-02','source_urls',sources,
    'research_status','current_operator_directory_registry_and_community_sources',
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
    or (s.name='Category Is Books' and lower(trim(p.name)) in ('category is','category is bookshop','category is books'))
    or (s.name='Luke & Jack' and lower(trim(p.name)) in ('luke and jack','luke + jack','luke&jack','luke & jack'))
    or (s.name='Gremlin Gear' and lower(trim(p.name)) in ('gremlin gear','gremlingear'))
  ) returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,
       array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s where not exists (
  select 1 from public.places p where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Category Is Books' and lower(trim(p.name)) in ('category is','category is bookshop','category is books'))
    or (s.name='Luke & Jack' and lower(trim(p.name)) in ('luke and jack','luke + jack','luke&jack','luke & jack'))
    or (s.name='Gremlin Gear' and lower(trim(p.name)) in ('gremlin gear','gremlingear'))
  )
);

select public.qa_refresh_city_seo_status('glasgow')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places where lower(trim(city))='glasgow'
and lower(trim(name)) in ('category is books','luke & jack','gremlin gear')
order by name;
