-- USA stores batch 01: Los Angeles, Miami and Palm Springs.
-- San Francisco and New York are covered by their dedicated store migrations.
-- Researched 2026-09-14 from current operator and official destination sources.
-- Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select * from jsonb_to_recordset($qa_usa_stores_batch_01$
  [
    {
      "name":"Circus of Books",
      "city":"los_angeles","type":"store",
      "description":"West Hollywood's resurrected queer landmark pairs its famous adult-bookshop history with a sharp contemporary mix of LGBTQ+ art, books, fashion, toys and gallery shows. It still feels gloriously specific: part archive, part after-dark shop and part living monument to Santa Monica Boulevard.",
      "hours":"Sunday-Wednesday 11:00-20:00; Thursday-Saturday 11:00-23:00.",
      "link":"https://circusofbooks.com/","location":"8230 Santa Monica Boulevard, West Hollywood, CA 90046, United States","lat":34.09064,"lng":-118.36964,
      "vibe":"historic WeHo queer counterculture, polished up without sanding off the mischief",
      "what":"LGBTQ+ books and magazines, adult films, toys, underwear, fetish pieces, cheeky gifts and work by queer artists shown through The Gallery at Circus. The shop's value is the collision of cultural history and current nightlife retail rather than a generic adult-store assortment.",
      "best":"Go on a weekday afternoon to browse the books and gallery at an easy pace. Thursday through Saturday work better for a pre-bar stop because the original shop stays open until 23:00; use the separate Circus of Books West branch if shopping after midnight is the priority.",
      "online":"The web shop ships throughout the United States and US territories. Orders normally process in one to two business days; economy delivery is listed as five to eight business days and becomes free above the published USD 50 threshold. The operator does not advertise international shipping.",
      "payment":"The online shop accepts Visa, Mastercard, American Express, Discover and Cash App Pay. Treat those as verified web methods; ask at the register before relying on a specific mobile wallet in the physical store.",
      "privacy":"Online orders use plain brown boxes and tracking is sent separately, useful for adult purchases. In person, the shop is an openly queer cultural landmark and adult retailer, so expect explicit merchandise alongside books and art; contact the store directly for detailed step-free-access questions.",
      "hours_source":"https://circusofbooks.com/pages/map","sources":["https://circusofbooks.com/pages/map","https://circusofbooks.com/policies/shipping-policy","https://circusofbooks.com/"]
    },
    {
      "name":"The Ripped Bodice",
      "city":"los_angeles","type":"store",
      "description":"A candy-pink, woman- and queer-owned Culver City bookstore devoted entirely to romance. Its shelves treat queer love stories, historical swoons, paranormal chaos and high-heat reads as equal citizens, with author events and playful gifts turning a specialist bookshop into a genuine literary hangout.",
      "hours":"Monday-Friday 11:00-19:00; Saturday 10:00-20:00; Sunday 10:00-19:00.",
      "link":"https://therippedbodice.com/","location":"3806 Main Street, Culver City, CA 90232, United States","lat":34.025362,"lng":-118.394613,
      "vibe":"romance-reader fantasy in pink, proudly queer-owned and serious about inclusive happily-ever-afters",
      "what":"Romance fiction across contemporary, historical, fantasy, paranormal, erotic and LGBTQ+ subgenres, plus signed editions, stationery, candles, jewellery, tea and bookish gifts. The curation gives queer romance real shelf depth instead of isolating it as a seasonal display.",
      "best":"Weekday opening hours suit recommendation-heavy browsing; Saturday has the longest window but also attracts event traffic. Check the official event calendar before visiting if you want an author appearance, or avoid the listed start time when you want the shelves with fewer people around you.",
      "online":"The full catalogue supports online ordering, signed-book preorders and tracked shipping notifications. Availability and fulfilment differ for signed editions and events, so use the live product page rather than assuming every Culver City shelf copy can ship immediately.",
      "payment":"The live checkout determines supported cards and accelerated payment options. In-store sources report card and contactless acceptance, but the operator does not publish a durable complete register-method list; confirm directly when a particular wallet or foreign card is essential.",
      "privacy":"This is an all-ages bookshop that explicitly identifies as woman- and queer-owned. The event guide publishes venue accessibility information and nearby public parking options; customers who need seating or event accommodations should use the official event instructions before booking.",
      "hours_source":"https://therippedbodice.com/","sources":["https://therippedbodice.com/about","https://therippedbodice.com/general-event-information","https://therippedbodice.com/"]
    },
    {
      "name":"Out of the Closet - Biscayne",
      "city":"miami","type":"store",
      "description":"Miami's Biscayne branch turns a thrift run into direct community support: second-hand fashion, vintage surprises, furniture and home pieces fund AIDS Healthcare Foundation services, while free HIV testing gives the bright pink shop a practical health role beyond retail.",
      "hours":"Monday-Saturday 10:00-19:00; Sunday 10:00-18:00.",
      "link":"https://outofthecloset.org/locations/biscayne-thrift-store/","location":"2400 Biscayne Boulevard, Miami, FL 33137, United States","lat":25.80034,"lng":-80.18968,
      "vibe":"colourful community thrift with treasure-hunt energy and HIV care built into the mission",
      "what":"Donated adult clothing, shoes, books, records, home decor, kitchenware, small appliances and furniture, with stock changing daily. The branch also accepts donations and offers free, discreet HIV testing; 96 cents of every retail dollar supports HIV care and services.",
      "best":"Arrive near 10:00 for the freshest pass through newly placed racks and easier furniture browsing. Donation stock is inherently unpredictable, so this rewards an open-ended hunt more than a mission for one exact size; Sunday closes an hour earlier than the rest of the week.",
      "online":"Selected chain inventory is sold through the official Poshmark storefront, but the Biscayne shop's changing floor stock is primarily in-person. Miami-area large-item donation pickup can be scheduled separately; pickup criteria and appointment windows are published on the donation page.",
      "payment":"The official location listing shows cash, Visa, Mastercard and Discover. Donation receipts are available for accepted goods. Contact the branch before relying on American Express or a mobile wallet because neither is confirmed on the current location page.",
      "privacy":"Out of the Closet describes every branch as an LGBTQIA+ safe space. HIV testing is free and designed to be discreet and stigma-free; retail browsing remains separate and open to everyone. Call ahead for branch-specific testing hours, mobility access or pharmacy services, which can differ from shop hours.",
      "hours_source":"https://outofthecloset.org/locations/biscayne-thrift-store/","sources":["https://outofthecloset.org/locations/biscayne-thrift-store/","https://outofthecloset.org/about/","https://outofthecloset.org/donate/"]
    },
    {
      "name":"gaymaRT",
      "city":"palm_springs","type":"store",
      "description":"The Arenas District's unapologetically gay superstore has dressed Palm Springs for pool decks and Pride nights since 1996. It is bright, cheeky and wonderfully literal: swimwear, underwear, rainbow gear and gifts packed into a late-opening queer retail landmark.",
      "hours":"Sunday-Thursday 10:00-22:00; Friday-Saturday 10:00-00:00.",
      "link":"https://shopgaymart.com/","location":"305 East Arenas Road, Palm Springs, CA 92262, United States","lat":33.82374,"lng":-116.54310,
      "vibe":"maximalist Arenas District pride shop for pool looks, party fits and souvenirs with a wink",
      "what":"Men's casualwear, swimwear, underwear, Pride shirts, hats, jewellery, rainbow accessories and gay-themed gifts. The selection is tuned to Palm Springs resort life and nightlife, making it more useful for an emergency pool look or celebratory keepsake than a conventional department-store visit.",
      "best":"Daytime is easiest for comparing sizes; after dinner the shop becomes a convenient pre-bar stop and stays open until midnight on Friday and Saturday. Pride and major resort weekends push the most popular swimwear sizes and themed pieces first, so shop earlier in the visit when fit matters.",
      "online":"The operator now has an online storefront, but it does not publish a sufficiently detailed stable dispatch, destination or return summary on accessible pages. Use live checkout for current availability and shipping, and contact the shop before assuming international delivery.",
      "payment":"The current operator pages do not publish a complete durable list of accepted cards, cash or wallets. Verify a required method directly at the shop or in live checkout; do not rely on older third-party listings for payment details.",
      "privacy":"This is an explicitly LGBTQ+ retail environment in the heart of the gay nightlife district, with some revealing apparel but a broader gift-store feel. The city visitor bureau lists it as locally owned; contact the operator for step-free-access or fitting-room details not published online.",
      "hours_source":"https://visitpalmsprings.com/listing/gaymart/225/","sources":["https://shopgaymart.com/","https://visitpalmsprings.com/listing/gaymart/225/"]
    },
    {
      "name":"Destination PSP",
      "city":"palm_springs","type":"store",
      "description":"A love letter to desert modernism disguised as a gift shop. Destination PSP builds original Palm Springs graphics into swimwear, shirts, homeware and cocktail-ready objects, with Pride collections and community collaborations that make the souvenirs feel designed rather than stamped.",
      "hours":"Sunday-Wednesday 10:00-18:00; Thursday 10:00-20:30; Friday-Saturday 10:00-20:00.",
      "link":"https://destinationpsp.com/","location":"170 North Palm Canyon Drive, Palm Springs, CA 92262, United States","lat":33.82525,"lng":-116.54654,
      "vibe":"mid-century desert glamour with smart Pride colour and a martini-cart sense of humour",
      "what":"Original Palm Springs apparel, men's swimwear, Pride designs, home and pool pieces, barware, architectural miniatures, gifts and event collections. Collaborations support local organisations including The LGBTQ Community Center of the Desert, DAP Health and Cinema Diverse.",
      "best":"Weekday mornings leave room to compare design collections and sizes; Thursday's later closing pairs well with the downtown VillageFest rhythm. Modernism Week and Pride collections can be seasonal, so check the web shop or contact the flagship before travelling for one limited design.",
      "online":"The shop ships worldwide, offers free US shipping above its published threshold, and supports flagship pickup and local delivery by arrangement. International rates vary by destination and free shipping does not apply; returns are requested within 30 days of delivery.",
      "payment":"Online payment options are determined in the secure live checkout. Pickup orders are paid with applicable California sales tax. The operator does not publish a fixed complete in-store wallet list, so confirm directly if a particular payment method matters.",
      "privacy":"An all-ages Palm Springs lifestyle store with prominent LGBTQ Pride collections rather than adult merchandise. The company is locally owned, supports queer community partners and offers order pickup; contact staff for precise entrance or mobility accommodations before a visit.",
      "hours_source":"https://destinationpsp.com/pages/contact","sources":["https://destinationpsp.com/pages/contact","https://destinationpsp.com/pages/about-destination-psp","https://destinationpsp.com/pages/faq","https://destinationpsp.com/collections"]
    },
    {
      "name":"Peepa's",
      "city":"palm_springs","type":"store",
      "description":"A jubilant downtown cabinet of caftans, resort shirts, local art and gifts that refuses beige. Peepa's mixes its own Palm Springs designs with independent labels, feminist wit and queer-owned energy, creating the kind of shop where a pool outfit and an outrageous card arrive in the same bag.",
      "hours":"Monday-Saturday 10:00-21:00; Sunday 10:00-18:00.",
      "link":"https://peepasgiftstore.com/","location":"120 North Palm Canyon Drive, Palm Springs, CA 92262, United States","lat":33.82468,"lng":-116.54655,
      "vibe":"retro colour bomb for caftans, resort wear and gifts with sharp feminist humour",
      "what":"Men's and women's resort clothing, swimwear, caftans, jewellery, sunglasses, fragrance, local art, puzzles, cards and Palm Springs-designed gifts. Its own products and local-maker focus give the assortment a personal desert signature instead of airport-souvenir sameness.",
      "best":"Late morning is relaxed for clothing and gift browsing; Monday through Saturday hours stretch to 21:00 for an after-dinner visit. New and seasonal resort pieces can have shallow size runs, so use online stock and the four-hour pickup indicator before crossing town for one exact item.",
      "online":"The live store sells clothing and gifts with shipping calculated at checkout. Eligible products offer Palm Springs pickup, normally ready in about four hours. Availability is product-specific, so verify the pickup message on the exact size and colour rather than assuming the whole order qualifies.",
      "payment":"The Shopify checkout exposes current card and accelerated payment choices at purchase time. Third-party listings report contactless and mobile payments in store, but the operator does not publish a fixed register list; live checkout or a quick call is the reliable check.",
      "privacy":"Peepa's is an LGBTQ-owned, all-ages fashion and gift store rather than an adult shop. Published local listings report wheelchair access and an open-to-all welcome; ask staff about fitting-room or entrance needs when those details are essential.",
      "hours_source":"https://peepasgiftstore.com/","sources":["https://peepasgiftstore.com/","https://peepasgiftstore.com/products/take-no-shit-empowerment-card"]
    }
  ] $qa_usa_stores_batch_01$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-14','source_urls',sources,
    'research_status','current_operator_and_official_destination_sources',
    'updated_at','2026-09-14T00:00:00Z'
  ) intel from raw_stores s
), updated as (
  update public.places p set
    name=s.name,type=s.type,description=s.description,hours=s.hours,link=s.link,
    location=s.location,lat=s.lat,lng=s.lng,vibe=s.vibe,vibe_tags=array['store']::text[],
    venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||s.intel,seo_indexable=true,
    seo_quality_status='approved',updated_at=timezone('utc',now())
  from stores s
  where public.qa_city_slug(p.city)=s.city and lower(trim(p.name))=lower(trim(s.name))
  returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,
       array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s
where not exists (
  select 1 from public.places p
  where public.qa_city_slug(p.city)=s.city and lower(trim(p.name))=lower(trim(s.name))
);

select public.qa_refresh_city_seo_status(city_slug)
from (values ('los_angeles'),('miami'),('palm_springs')) v(city_slug)
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select city,name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places
where public.qa_city_slug(city) in ('los_angeles','miami','palm_springs')
  and type='store'
order by city,name;
