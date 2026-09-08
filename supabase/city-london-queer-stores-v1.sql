-- London queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-01. Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select *
  from jsonb_to_recordset($qa_london_stores$
  [
    {
      "name":"Gay's The Word",
      "city":"london",
      "type":"store",
      "description":"The UK's oldest LGBT+ bookshop and a living Bloomsbury community landmark, founded in 1979. Its shelves span queer fiction, history, memoir, politics, poetry, plays, young-adult writing, rare books and coming-out resources, alongside events and community groups.",
      "hours":"Monday closed; Tuesday-Saturday 11:00-18:00; Sunday 13:00-18:00; bank holidays closed.",
      "link":"https://www.gaystheword.co.uk/",
      "location":"66 Marchmont Street, Bloomsbury, London WC1N 1AB, United Kingdom",
      "lat":51.525417,
      "lng":-0.125232,
      "vibe":"historic all-community queer bookshop with exceptional human recommendations",
      "what":"Queer literary fiction and non-fiction, classics, history, memoir, biography, poetry, plays, young-adult and coming-out books, rare titles, LGSM merchandise and bookseller-curated recommendations. The shop can also special-order in-print LGBTQ+ and non-LGBTQ+ books not shown online.",
      "best":"Tuesday-Thursday is best for a relaxed browse and bookseller conversation. The shop is very small and explicitly warns that Friday-Sunday can become extremely busy; groups and school visits must arrange at least three weeks ahead and should avoid those peak days.",
      "online":"Online orders usually take 2-3 working days to process. UK parcels use untracked Royal Mail; the shop currently cannot ship to the EU or Northern Ireland under GPSR rules, but ships to listed non-EU European countries and can quote at-cost international shipping elsewhere by email.",
      "payment":"The shop sells and accepts National Book Tokens and its own gift vouchers. A full current card/cash list is not published on the accessible official pages; special-order non-LGBTQ+ books require advance payment, so confirm a specific method before travelling if necessary.",
      "privacy":"The shop serves the broader LGBT+ community and hosts community activity, not only gay men. Staff can turn off background music on request, communicate by pen and paper, provide a chair or stool and offer a ground-floor toilet; there is no hearing loop or BSL-speaking staff member, and the toilet is not wheelchair accessible.",
      "hours_source":"https://www.gaystheword.co.uk/visit",
      "sources":["https://www.gaystheword.co.uk/visit","https://www.gaystheword.co.uk/aboutthebookshop","https://www.gaystheword.co.uk/contact","https://www.gaystheword.co.uk/copy-of-privacy-policy"]
    },
    {
      "name":"Prowler Soho",
      "city":"london",
      "type":"store",
      "description":"Prowler's long-running Soho flagship combines gay men's underwear, clubwear and gifts with a large adult range of toys, condoms, lubricants, aromas and fetish and bondage gear, staying open later than most specialist London shops.",
      "hours":"Monday-Thursday 10:30-21:30; Friday-Saturday 10:30-22:30; Sunday 12:00-20:00.",
      "link":"https://www.prowler.co.uk/pages/store-locator-page",
      "location":"5-7 Brewer Street, Soho, London W1F 0RF, United Kingdom",
      "lat":51.512499,
      "lng":-0.133900,
      "vibe":"late-opening Soho gay superstore mixing fashion, gifts and adult essentials",
      "what":"Prowler and other gay men's underwear, fashion and clubwear, books and gifts, plus condoms, lube, aromas, cock rings, plugs, dildos, prostate toys, pumps and bondage gear. It suits a broad one-stop purchase better than a custom leather fitting.",
      "best":"Weekday daytime gives the easiest browsing; Friday and Saturday evenings have the strongest Soho energy and the store stays open until 22:30. Use the official locator rather than older guides because Sunday hours and the separate Prowler RED branch differ.",
      "online":"The UK shop offers tracked Royal Mail delivery, normally 1-2 working days for Tracked 24 or 3-5 for Tracked 48, with free standard UK delivery over the published threshold. Prowler RED also has a separate North American operation; verify other international destinations at checkout rather than assuming UK delivery terms apply worldwide.",
      "payment":"The official web shop accepts Visa, Visa Debit, Visa Delta, Visa Connect, Mastercard, Electron, Maestro and JCB, with encrypted processing. The researched page does not promise that every web method is available at the Soho till, so check locally if one card is essential.",
      "privacy":"Online orders use plain, unbranded packaging with only an address label. Prowler is openly gay-focused, but its customer policy notes that opened or used intimate goods, consumables, lingerie and latex clothing may be excluded from returns for hygiene reasons.",
      "hours_source":"https://www.prowler.co.uk/pages/store-locator-page",
      "sources":["https://www.prowler.co.uk/pages/store-locator-page","https://www.prowler.co.uk/pages/customer-service","https://www.prowler.co.uk/pages/delivery","https://www.patroc.com/gay/london/gayguide.html"]
    },
    {
      "name":"Clonezone Soho",
      "city":"london",
      "type":"store",
      "description":"Clonezone's Old Compton Street flagship is a large gay adult department store for underwear, clubwear, sex toys, lubricants, bondage and leather and fetish gear, with especially late Friday and Saturday trading.",
      "hours":"Monday-Tuesday 11:00-21:00; Wednesday-Thursday 11:00-22:00; Friday-Saturday 11:00-23:00; Sunday 12:00-20:00.",
      "link":"https://www.clonezonedirect.co.uk/shops/",
      "location":"35 Old Compton Street, Soho, London W1D 5JX, United Kingdom",
      "lat":51.512917,
      "lng":-0.131620,
      "vibe":"big central Soho range with late-night access and fast click-and-collect",
      "what":"Gay men's underwear, T-shirts and clubwear alongside lubricants, condoms, toys for anal and prostate play, cock gear, bondage equipment, leather and fetish clothing. The scale and long hours make it useful for comparing brands or replacing essentials just before a night out.",
      "best":"Monday or Tuesday afternoon is calmer for comparing products. Wednesday-Saturday stays open progressively later, reaching 23:00 on Friday and Saturday, which is ideal for a last-minute Soho purchase but brings more nightlife footfall.",
      "online":"The London warehouse dispatches UK orders by Royal Mail, and click-and-collect is generally ready at the selected Clonezone store within 48 weekday hours. International availability and cost are destination-dependent at checkout, so verify restricted products and customs before treating an item as deliverable abroad.",
      "payment":"The current site displays Klarna, Apple Pay, Google Pay, Visa and Mastercard, with online card payments handled through a secure payment provider. Apple Maps also reports contactless and card acceptance at the Soho branch, but checkout eligibility can vary by order and country.",
      "privacy":"Clonezone explicitly promotes discreet packaging and offers click-and-collect as an alternative to home delivery. It is a gay-focused adult store; sealed and hygiene-sensitive product rules still apply, so inspect sizing and compatibility information before opening intimate goods.",
      "hours_source":"https://www.clonezonedirect.co.uk/shops/",
      "sources":["https://www.clonezonedirect.co.uk/shops/","https://www.clonezonedirect.co.uk/order-info","https://maps.apple.com/place?place-id=I2E597BA6430D980B","https://www.patroc.com/guiagay/londres/d/clonezone-flagshipstore.html"]
    },
    {
      "name":"REGULATION Soho",
      "city":"london",
      "type":"store",
      "description":"REGULATION's two-floor licensed Soho flagship specialises in locally developed leather and latex clothing, men's fetishwear, bondage equipment and gay sex toys, with spacious changing rooms, made-to-measure consultations and a dedicated London workshop.",
      "hours":"Monday-Saturday 11:00-19:00; Sunday and bank holidays 12:00-17:00; closed Christmas Day, Boxing Day and New Year's Day.",
      "link":"https://regulation.co.uk/pages/visit-us",
      "location":"13a Bateman Street, Soho, London W1D 3AF, United Kingdom",
      "lat":51.513881,
      "lng":-0.132305,
      "vibe":"polished two-floor fetish flagship for expert fitting and made-to-measure gear",
      "what":"High-quality leather and latex clothing, men's fetishwear, restraints and bondage equipment, gay sex toys, lube and Fetters products. Spacious changing rooms and bookable made-to-measure appointments distinguish it from Soho's more general adult shops.",
      "best":"Book a dedicated measurement appointment for bespoke Rufstok leather; the published consultation lasts about 60 minutes and carries a deposit credited to the garment. For ordinary browsing, weekday opening hours are calmer than Saturday and major London fetish-event periods.",
      "online":"REGULATION ships throughout the UK and worldwide. It collects EU tax for qualifying orders under EUR 150; higher-value EU and non-EU orders can incur local tax and clearance fees. International delivery is typically 10-14 days, while made-to-order leather or rubber commonly needs 2-4 weeks before dispatch.",
      "payment":"Current payment choices are displayed at checkout and paid links may be issued for support-assisted orders. Bespoke consultations require a GBP 50 deposit that is deducted from the garment purchase; confirm final balance and accepted in-store methods when booking custom work.",
      "privacy":"Orders ship in plain, unbranded packaging and the return address excludes the company name. The Soho team explicitly offers advice on toys, lube and event gear; note that insertables, personal lubricants and bespoke products have tighter return exclusions than standard unused goods.",
      "hours_source":"https://regulation.co.uk/pages/visit-us",
      "sources":["https://regulation.co.uk/pages/visit-us","https://regulation.co.uk/pages/about-regulation","https://regulation.co.uk/pages/customer-service","https://booking.page/en/company/grocery_store/page/bookregulation"]
    },
    {
      "name":"Fetish Freak",
      "city":"london",
      "type":"store",
      "description":"A tiny independent Oval shop packed with London-made and made-to-measure men's leather and rubber, pre-loved gear, boots, restraints, toys, lube and specialist accessories, shaped by decades of hands-on scene knowledge rather than chain-store polish.",
      "hours":"Monday 11:00-18:30; Tuesday closed; Wednesday-Saturday 11:00-18:30; Sunday 12:00-17:00. Some Tuesdays may open by announcement.",
      "link":"https://www.fetishfreak.co.uk/store.php",
      "location":"76 Bolton Crescent, Oval, London SE5 0SE, United Kingdom",
      "lat":51.488981,
      "lng":-0.121038,
      "vibe":"tiny fiercely independent fetish cave with honest custom-fit expertise",
      "what":"London-made leather and rubber in regular through elite ranges, made-to-measure jeans, breeches, chaps, harnesses and shorts, pre-loved gear, used army boots, restraints, masks, hoods, toys, plugs, dildos, cock and ball gear, condoms, lube and aromas.",
      "best":"Visit Monday or Wednesday-Friday soon after 11:00 for the owner's detailed advice or a made-to-measure discussion. Tuesday is normally closed and occasional openings are announced online; call before travelling for a specific pre-loved item, boot size or custom consultation.",
      "online":"The independent online shop accepts UK and overseas orders, normally dispatching in-stock items within 36 hours; made-to-measure work is usually produced in about two weeks. Postage is calculated during ordering and the owner states that material overcharges are refunded, but destination restrictions and customs should be confirmed directly.",
      "payment":"Online orders accept most major credit and debit cards except American Express. The physical shop additionally accepts cash and sterling cheques drawn on a UK bank with proof of address; card statements show the comparatively neutral descriptor 'FF Retail Ltd'.",
      "privacy":"Fetish Freak states that buyer details are not disclosed beyond parties required to fulfil the order, and billing appears as FF Retail Ltd. The LGBTQ+-owned shop is known for non-judgmental, experienced advice and custom sizing; because it is very small, call ahead if physical space or a quiet appointment matters.",
      "hours_source":"https://www.fetishfreak.co.uk/store.php",
      "sources":["https://www.fetishfreak.co.uk/store.php","https://www.fetishfreak.co.uk/onlinestore/terms.php","https://fetishfreak.co.uk/onlinestore/index.php","https://www.patroc.com/gay/london/d/fetishfreak.html"]
    }
  ]
  $qa_london_stores$) s(
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
    'research_status', 'current_first_party_and_current_specialist_sources',
    'updated_at', '2026-09-01T00:00:00Z'
  ) as intel
  from raw_stores s
), updated as (
  update public.places p
  set name=s.name, type=s.type, description=s.description, hours=s.hours,
      link=s.link, location=s.location, lat=s.lat, lng=s.lng, vibe=s.vibe,
      vibe_tags=array['store']::text[],
      venue_intel=coalesce(p.venue_intel, '{}'::jsonb) || s.intel,
      seo_indexable=true, seo_quality_status='approved',
      updated_at=timezone('utc', now())
  from stores s
  where lower(trim(p.city))=s.city
    and (
      lower(trim(p.name))=lower(trim(s.name))
      or (s.name='Gay''s The Word' and lower(trim(p.name)) in ('gays the word', 'gay''s the word'))
      or (s.name='Prowler Soho' and lower(trim(p.name)) in ('prowler', 'prowler soho'))
      or (s.name='Clonezone Soho' and lower(trim(p.name)) in ('clonezone', 'clone zone', 'clonezone soho'))
      or (s.name='REGULATION Soho' and lower(trim(p.name)) in ('regulation', 'regulation london', 'regulation soho'))
      or (s.name='Fetish Freak' and lower(trim(p.name)) in ('fetish freak', 'fetish freak london'))
    )
  returning p.id
)
insert into public.places(
  name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,
  venue_intel,seo_indexable,seo_quality_status,updated_at
)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,
       s.vibe,array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s
where not exists (
  select 1 from public.places p
  where lower(trim(p.city))=s.city
    and (
      lower(trim(p.name))=lower(trim(s.name))
      or (s.name='Gay''s The Word' and lower(trim(p.name)) in ('gays the word', 'gay''s the word'))
      or (s.name='Prowler Soho' and lower(trim(p.name)) in ('prowler', 'prowler soho'))
      or (s.name='Clonezone Soho' and lower(trim(p.name)) in ('clonezone', 'clone zone', 'clonezone soho'))
      or (s.name='REGULATION Soho' and lower(trim(p.name)) in ('regulation', 'regulation london', 'regulation soho'))
      or (s.name='Fetish Freak' and lower(trim(p.name)) in ('fetish freak', 'fetish freak london'))
    )
);

select public.qa_refresh_city_seo_status('london')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places
where lower(trim(city))='london'
  and lower(trim(name)) in ('gay''s the word','prowler soho','clonezone soho','regulation soho','fetish freak')
order by name;
