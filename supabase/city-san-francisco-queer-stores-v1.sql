-- San Francisco queer stores: current store data and store-specific Venue Intelligence.
-- Researched 2026-09-02. Idempotent by normalized city/name.
--
-- Under One Roof is deliberately not inserted. The AIDS-benefit gift store
-- permanently closed its Castro retail operation in 2012 after 21 years.
-- Source: https://www.sfgate.com/bayarea/article/SF-Under-One-Roof-closing-up-shop-3870296.php

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select * from jsonb_to_recordset($qa_san_francisco_stores$
  [
    {
      "name":"Fabulosa Books",
      "city":"san_francisco","type":"store",
      "description":"A queer-owned Castro neighborhood bookstore opened by author Alvin Orloff in 2021 in the historic former A Different Light space. Bestsellers and general-interest books sit beside an unusually deep LGBTQ+ selection, readings, a queer book club and the Books Not Bans programme.",
      "hours":"Sunday-Thursday 10:00-21:00; Friday-Saturday 10:00-22:00.",
      "link":"https://www.fabulosabooks.com/","location":"489 Castro Street, San Francisco, CA 94114, United States","lat":37.761227,"lng":-122.434898,
      "vibe":"welcoming queer literary anchor in a historic Castro bookstore space",
      "what":"LGBTQ+ fiction and nonfiction across gay, lesbian, bisexual, trans, non-binary and asexual experience, plus poetry, sci-fi, progressive politics, cookbooks and wider literary bestsellers. The mix includes new and used books, e-books, offbeat treasures, gifts and vintage ephemera, with more than a token queer shelf.",
      "best":"Weekday mornings are calmest for recommendations and exploring the specialist sections. Evenings are unusually practical because the shop stays open until 21:00 or 22:00; check the events calendar for author readings and the monthly LGBT book club if you want a community visit rather than only shopping.",
      "online":"Fabulosa links to a full Bookshop.org storefront and sells e-books, so customers outside San Francisco can support the shop remotely. Bookshop.org controls eligible destinations, fulfilment, charges and timing; use that checkout for international availability rather than assuming every physical-store title can be shipped directly.",
      "payment":"Apple Maps reports credit cards, contactless payment and Apple Pay in the physical shop. Online book purchases use the linked Bookshop.org checkout, whose available methods can differ. Contact Fabulosa before relying on a particular gift certificate or arranging a special-order title.",
      "privacy":"This is an all-ages, queer-owned bookstore and a participant in Castro's Safe Zone network. Books Not Bans sends LGBTQ+ literature to communities facing censorship. Apple Maps reports wheelchair access and pets welcome, making it substantially different from the adult retailers elsewhere on this list.",
      "hours_source":"https://www.fabulosabooks.com/","sources":["https://www.fabulosabooks.com/","https://bookshop.org/shop/fabulosabooks","https://maps.apple.com/place?place-id=I1223FA0CFBD1FD2E","https://www.ebar.com/story/164757/News/Besties/The%202026%20Besties%20are%20here"]
    },
    {
      "name":"Cliff's Variety",
      "city":"san_francisco","type":"store",
      "description":"A family-run Castro institution dating to 1936, combining a serious neighborhood hardware store with the exuberant Cliff's Annex. It is the practical-and-camp stop for tools, housewares, fabric, costumes, wigs, decorations, art supplies, toys and unexpected gifts.",
      "hours":"Monday-Saturday 10:00-18:30; Sunday 10:00-18:00.",
      "link":"https://www.cliffsvariety.com/","location":"471-479 Castro Street, San Francisco, CA 94114, United States","lat":37.76108,"lng":-122.43487,
      "vibe":"old-school Castro hardware store colliding joyfully with costumes and camp variety",
      "what":"Two complementary worlds: proper hardware, tools, electrical, plumbing, garden and household supplies, plus fabrics, sewing notions, art materials, costumes, wigs, seasonal decorations, toys, novelty gifts and party goods. It is useful for both an apartment repair and the last missing element of a Pride or Halloween look.",
      "best":"Weekday mornings are best for project advice, fabric questions and navigating the unusually broad inventory. Before Pride, Halloween and major costume events, shop early in the day and well ahead of the date; seasonal sections become a destination and specific wigs, fabrics or decorations can move quickly.",
      "online":"Cliff's is primarily a physical neighborhood store rather than a conventional browse-and-checkout web shop. Staff explicitly offer to locate special items and arrange shipping by phone or email. Ask for destination, carrier, cost and international feasibility before treating an item as mail-order available.",
      "payment":"The operator does not publish a complete current list of cards, cash and mobile wallets on its accessible pages. Contact the store for a required payment method or remote invoice when arranging shipment; business credit applications are separately available and should not be confused with ordinary retail checkout.",
      "privacy":"Cliff's is an all-ages general retailer embedded in the Castro, not a sexuality-specific business, but its costume, fabric and creative ranges have long served queer neighborhood life. Advice is product- and project-focused. Contact the store about step-free navigation or other specific access needs in the combined historic premises.",
      "hours_source":"https://www.cliffsvariety.com/visit-us","sources":["https://www.cliffsvariety.com/visit-us","https://www.cliffsvariety.com/our-history","https://castromerchants.com/retail","https://www.axios.com/local/san-francisco/2025/12/01/san-francisco-holiday-gift-shopping-local"]
    },
    {
      "name":"Knobs SF",
      "city":"san_francisco","type":"store",
      "description":"A late-opening Castro men's fashion shop for expressive nightlife and festival dressing, ranging from easy tanks, tees and stretch shorts to mesh, lace, sequins, vinyl harnesses, glitter and Pride colour. Some designs are local or made in San Francisco.",
      "hours":"Monday-Thursday 12:00-22:00; Friday-Saturday 12:00-23:00; Sunday 12:00-22:00. Hours may change with staffing.",
      "link":"https://knobssf.com/","location":"432 Castro Street, San Francisco, CA 94114, United States","lat":37.76148,"lng":-122.43545,
      "vibe":"colourful late-night Castro menswear for Pride, clubs and unapologetic sparkle",
      "what":"Men's tanks, tees, crop tops, stretch denim and very short shorts alongside lace, fishnet and mesh pieces, sequin and glitter looks, swimwear, underwear, caps and fashion harnesses. This is primarily playful apparel and festival styling, not a specialist BDSM equipment or sex-toy shop.",
      "best":"Afternoon gives more room to compare fits and build an outfit; evening opening until 22:00 or 23:00 is valuable for a last-minute Castro nightlife look. Shop before Pride, Folsom and festival weekends when a specific colour or size matters, and check same-day hours because the operator flags staffing changes.",
      "online":"The web shop offers free shipping on orders of USD 35 or more and quotes arrival seven to ten days after ordering. Its current wholesale information says shipping is USA-only, so international visitors should buy in person or contact Knobs rather than assuming overseas fulfilment.",
      "payment":"Apple Maps reports credit cards, contactless payment and Apple Pay in the Castro shop. The live online checkout determines supported cards and accelerated wallets. Confirm any foreign card or cash requirement directly, especially for visitors purchasing shortly before departure.",
      "privacy":"Knobs is an openly gay-popular men's fashion shop where conservative basics and revealing clubwear share the same floor; browsing mesh or a harness does not imply entry to an adult venue. It publishes no detailed accessibility or fitting-room policy, so contact staff for mobility or private-fitting needs.",
      "hours_source":"https://knobssf.com/","sources":["https://knobssf.com/","https://knobssf.com/collections/all","https://knobssf.com/pages/become-a-reseller","https://maps.apple.com/place?place-id=IFA0C20DC42D19C92"]
    },
    {
      "name":"Mr. S Leather",
      "city":"san_francisco","type":"store",
      "description":"A landmark LGBTQ+-owned SoMa leather and fetish manufacturer-retailer founded in 1979 and operating in the Leather & LGBTQ Cultural District. Its large 8th Street base combines production, fitting and one of the deepest selections of bondage, kink and sex gear anywhere.",
      "hours":"Monday-Sunday 12:00-19:00; closed on listed major holidays and SF Pride Sunday.",
      "link":"https://store.gearleather.com/","location":"385 8th Street, San Francisco, CA 94103, United States","lat":37.77313,"lng":-122.40766,
      "vibe":"world-scale SoMa leather workshop and community home base with expert fitting",
      "what":"Mr. S-made leather, neoprene, rubber and sports clothing; harnesses, restraints, hoods, pup gear, boots and care products; plus anal toys, chastity, electro-play, pumping and extreme-bondage equipment. The in-house design and production knowledge makes it especially valuable for fit, materials and durable specialist gear.",
      "best":"A weekday shortly after noon gives staff more room for measurements, leather fitting and beginner questions. Folsom and Up Your Alley periods turn the store into a community destination and stock can move quickly, so order ahead for pickup or visit before the peak weekend when a particular size is essential.",
      "online":"UPS is the main US carrier, normally one to five business days in transit after dispatch; international postal service averages seven to fourteen days, with faster options depending on destination. Duties, taxes and customs fees belong to the recipient. In-store pickup is offered from the San Francisco shop.",
      "payment":"The live secure checkout controls available cards and payment options; a stable full method list was not published in the accessible help text. For custom or high-value gear, confirm payment and production timing with staff before ordering. Online and in-store gift options should likewise be checked for cross-channel use.",
      "privacy":"The business is historically LGBTQ+-owned and officially recognized as a refuge, community home base and partner of Folsom Street and the Leather & LGBTQ Cultural District. Newcomers and experienced players are both explicitly welcomed. Shipped gear uses private outer packaging, but international customs declarations cannot be assumed anonymous.",
      "hours_source":"https://store.gearleather.com/contact-us-customer-support","sources":["https://store.gearleather.com/contact-us-customer-support","https://store.gearleather.com/help/shipping-faq","https://store.gearleather.com/events","https://media.api.sf.gov/documents/Item_2i._LBR-2025-26-002_Mr._S_Leather.pdf","https://store.gearleather.com/material-care-information"]
    },
    {
      "name":"Does Your Mother Know",
      "city":"san_francisco","type":"store",
      "description":"A long-running, all-inclusive Castro adult shop now in a larger storefront at 450 Castro. Known for exceptionally late hours, it mixes toys, lubricants, body products and gifts with approachable advice for newcomers, couples and experienced customers across genders and orientations.",
      "hours":"Monday-Wednesday 10:00-22:00; Thursday and Sunday 10:00-00:00; Friday-Saturday 10:00-02:00.",
      "link":"https://dymkmedia.wixsite.com/does-your-mother-k-1","location":"450 Castro Street, San Francisco, CA 94114, United States","lat":37.76131,"lng":-122.43546,
      "vibe":"playful all-inclusive Castro adult shop with unusually useful late-night hours",
      "what":"Cock rings, lubricants and body cleansers, Magic Wand products, vibrators, plugs, masturbators and other toys spanning beginner basics and more specialist play. The selection is broader than a men-only gay shop, and the larger Castro Street space emphasizes guided discovery rather than anonymous shelves alone.",
      "best":"Daytime is best for longer beginner questions; Thursday and Sunday run to midnight, while Friday and Saturday reach 02:00 for genuine last-minute nightlife shopping. Because the shop moved from 4141 18th Street in 2025, navigate specifically to 450 Castro rather than an older directory address.",
      "online":"The operator displays products online, but no sufficiently clear current shipping geography, dispatch estimate, customs policy or discreet-parcel promise was available. Treat it primarily as a physical Castro shop and confirm delivery details directly before placing a privacy-sensitive or international order.",
      "payment":"A complete current in-store or online payment-method list is not published in the accessible operator text. Verify cards, cash and mobile wallets with the shop when one method is essential; the site also notes that some promotions do not apply to sale or buy-one-get-one products.",
      "privacy":"The operator explicitly welcomes men, women, gay and straight customers and people anywhere within or outside that spectrum, including newcomers shopping alone or with partners. Friendly product guidance is central to its positioning. No verified neutral-shipping or detailed accessibility policy was found, so ask before relying on either.",
      "hours_source":"https://dymkmedia.wixsite.com/does-your-mother-k-1","sources":["https://dymkmedia.wixsite.com/does-your-mother-k-1","https://hoodline.com/2025/01/castro-adult-gift-shop-does-your-mother-know-moves-to-former-body-space/","https://www.castropatrol.org/wp-content/uploads/2025/05/SAFE-ZONE-Locations.pdf","https://outxout.com/venue/doesyourmotherknowsanfrancisco"]
    },
    {
      "name":"Good Vibrations Valencia",
      "city":"san_francisco","type":"store",
      "description":"The Mission flagship of the pioneering San Francisco pleasure retailer founded in 1977. The wheelchair-accessible Valencia Street shop combines body-safe toys, lubricants, BDSM and safer-sex products with Good Vibrations' long-standing education-first, sex-positive approach.",
      "hours":"Sunday-Thursday 12:00-20:00; Friday-Saturday 12:00-21:00.",
      "link":"https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/","location":"603 Valencia Street, San Francisco, CA 94110, United States","lat":37.76218,"lng":-122.42169,
      "vibe":"education-led Mission flagship for inclusive body-safe pleasure shopping",
      "what":"Vibrators, dildos, anal toys, masturbators, app-controlled products, lubricants, safer-sex supplies, lingerie and BDSM gear selected across bodies, genders, orientations and experience levels. This is the Valencia flagship; the Polk and Downtown branches are separate stores with their own schedules.",
      "best":"Weekday early afternoon offers the most relaxed comparison and educator-style questions. Friday and Saturday remain open to 21:00 for after-work shopping. Choose the Polk branch instead if the Antique Vibrator Museum is the goal; Valencia is the larger flagship retail experience rather than the museum location.",
      "online":"Online orders usually dispatch in one to two business days through USPS, DHL, UPS or FedEx. International delivery is offered, but timing varies with destination and customs; insured, tracked service is safer than untracked global air mail. Buyers remain responsible for destination laws, duties and taxes.",
      "payment":"Online payment accepts Visa, Mastercard, American Express, Discover, JCB and PayPal. US-bank checks and money orders are possible by mail, but personal checks delay shipment by three weeks. Verify branch-specific mobile wallets in store rather than assuming the online list is identical.",
      "privacy":"Orders arrive in plain packaging with Barnaby LTD as the return-address name, and card charges show 'Barnaby LTD*1-833-475-1362'. The company states that it protects personal information and uses encrypted transactions. The official locations page specifically marks the Valencia flagship wheelchair accessible.",
      "hours_source":"https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/","sources":["https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/","https://www.goodvibes.com/help","https://www.goodvibes.com/customer-service/","https://www.sf.gov/sites/default/files/2024-05/3b.%20LBR-2016-17-041%20Good%20Vibrations_0.pdf"]
    }
  ] $qa_san_francisco_stores$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-02','source_urls',sources,
    'research_status','current_operator_legacy_business_and_specialist_sources',
    'updated_at','2026-09-02T00:00:00Z'
  ) intel from raw_stores s
), updated as (
  update public.places p set name=s.name,type=s.type,description=s.description,hours=s.hours,link=s.link,
    location=s.location,lat=s.lat,lng=s.lng,vibe=s.vibe,vibe_tags=array['store']::text[],
    venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||s.intel,seo_indexable=true,
    seo_quality_status='approved',updated_at=timezone('utc',now())
  from stores s where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Cliff''s Variety' and lower(trim(p.name)) in ('cliff''s','cliffs variety','cliff''s variety store'))
    or (s.name='Knobs SF' and lower(trim(p.name)) in ('knobs','knob''s','knobs sf'))
    or (s.name='Mr. S Leather' and lower(trim(p.name)) in ('mr s leather','mr. s leather','mister s leather','mr-s-leather'))
    or (s.name='Does Your Mother Know' and lower(trim(p.name)) in ('does your mother know','does your mother know sf'))
    or (s.name='Good Vibrations Valencia' and lower(trim(p.name)) in ('good vibrations','good vibrations valencia','good vibes valencia'))
  ) returning p.id
)
insert into public.places(name,city,type,description,hours,link,location,lat,lng,vibe,vibe_tags,venue_intel,seo_indexable,seo_quality_status,updated_at)
select s.name,s.city,s.type,s.description,s.hours,s.link,s.location,s.lat,s.lng,s.vibe,array['store']::text[],s.intel,true,'approved',timezone('utc',now())
from stores s where not exists (
  select 1 from public.places p where lower(trim(p.city))=s.city and (
    lower(trim(p.name))=lower(trim(s.name))
    or (s.name='Cliff''s Variety' and lower(trim(p.name)) in ('cliff''s','cliffs variety','cliff''s variety store'))
    or (s.name='Knobs SF' and lower(trim(p.name)) in ('knobs','knob''s','knobs sf'))
    or (s.name='Mr. S Leather' and lower(trim(p.name)) in ('mr s leather','mr. s leather','mister s leather','mr-s-leather'))
    or (s.name='Does Your Mother Know' and lower(trim(p.name)) in ('does your mother know','does your mother know sf'))
    or (s.name='Good Vibrations Valencia' and lower(trim(p.name)) in ('good vibrations','good vibrations valencia','good vibes valencia'))
  )
);

select public.qa_refresh_city_seo_status('san_francisco')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places where lower(trim(city))='san_francisco'
and lower(trim(name)) in ('fabulosa books','cliff''s variety','knobs sf','mr. s leather','does your mother know','good vibrations valencia')
order by name;
