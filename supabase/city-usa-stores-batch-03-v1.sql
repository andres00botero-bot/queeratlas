-- USA stores batch 03: New Orleans, Orlando, Washington DC, Seattle, Atlanta.
-- Researched 2026-09-14 from current operators and official destination/community sources.
-- Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select * from jsonb_to_recordset($qa_usa_stores_batch_03$
  [
    {
      "name":"Tubby & Coo's Book Shop at The Good Shop",
      "city":"new_orleans","type":"store",
      "description":"New Orleans' queer liberationist bookshop now works as a pocket bookstore inside The Good Shop. Its sharply curated shelves favour speculative fiction, romance, horror and radical nonfiction by voices traditional book retail too often leaves outside the room.",
      "hours":"The Good Shop host hours vary; consult Tubby & Coo's current locations and events before travelling.",
      "link":"https://tubbyandcoos.com/","location":"Inside The Good Shop, 1114 Josephine Street, New Orleans, LA 70130, United States","lat":29.93973,"lng":-90.07111,
      "vibe":"a tiny decentralised queer bookstore with a giant political imagination tucked into a neighbourhood makers' shop",
      "what":"A focused pocket selection of queer and diverse science fiction, fantasy, horror, romance and social-justice books. The decentralised model also appears at events and partner spaces, so the Josephine Street shelf is intentionally tighter than a conventional full-line bookstore.",
      "best":"Treat this as a discovery stop rather than a hunt for one guaranteed title. Check Tubby & Coo's calendar and social updates before visiting: a pop-up or community event may offer a larger themed selection than the permanent pocket bookstore.",
      "online":"The official site carries books, themed lists and merchandise for delivery, while the operator also curates physical pocket bookstores. Available destinations, rates and delivery estimates are calculated at checkout; use email for a title that is not listed.",
      "payment":"Web orders use the live secure checkout. The Good Shop controls payment methods for purchases made at the hosted shelf, so confirm a required wallet or cash option with the host rather than assuming the travelling shop's event setup applies.",
      "privacy":"Queer-owned, explicitly trans-affirming and built around liberation and underrepresented voices. This is an all-ages book selection within a shared retail space; ask the host about step-free access or a quieter collection time if either matters.",
      "hours_source":"https://tubbyandcoos.com/","sources":["https://tubbyandcoos.com/","https://www.axios.com/local/new-orleans/2023/06/20/local-bookstores-new-orleans"]
    },
    {
      "name":"Out of the Closet - New Orleans",
      "city":"new_orleans","type":"store",
      "description":"Magazine Street's pink-fronted thrift store turns the pleasure of an unpredictable vintage score into direct support for HIV care. Clothing, home pieces and one-off curios rotate quickly, while the AIDS Healthcare Foundation mission remains the constant behind the register.",
      "hours":"Monday-Saturday 10:00-19:00; Sunday 10:00-18:00. Confirm holiday hours with the branch.",
      "link":"https://outofthecloset.org/","location":"2900 Magazine Street, New Orleans, LA 70115, United States","lat":29.92352,"lng":-90.08351,
      "vibe":"colourful Magazine Street thrift hunting where a lucky rack find also funds community health",
      "what":"Donated clothing, shoes, accessories, books, records, home decor, kitchenware and occasional furniture, with stock changing throughout the week. Purchases and donations support AIDS Healthcare Foundation prevention, testing and treatment services.",
      "best":"Go close to opening for calmer rails and the first look at newly placed pieces. This is true thrift inventory, so browse with flexible colour and size expectations; call ahead before carrying furniture or a large donation to the shop.",
      "online":"Selected chain items are sold through the official Poshmark storefront, but Magazine Street stock is mainly an in-person hunt. Large-item pickup follows the chain's published quantity, condition and scheduling rules and is not guaranteed by a shop visit.",
      "payment":"The operator does not publish a durable branch-level list of cards, cash and mobile wallets. Bring a mainstream card and verify a required method at the register. Donation receipts are handled separately from retail payment.",
      "privacy":"Out of the Closet calls its stores LGBTQIA+ safe spaces and directs 96 cents of every dollar earned to HIV services. Free, discreet testing is part of the chain model; contact this branch for current testing times and detailed mobility access.",
      "hours_source":"https://outofthecloset.org/","sources":["https://outofthecloset.org/","https://outofthecloset.org/about/","https://outofthecloset.org/donate/"]
    },
    {
      "name":"MojoMan Swimwear & Clothing",
      "city":"orlando","type":"store",
      "description":"Orlando's gay-owned men's style warehouse makes holiday packing wonderfully less sensible: walls of swim briefs and underwear lead into clubwear, resort shirts, shoes and accessories. The 4,000-square-foot shop is built for comparison, colour and a proper try-on rather than guesswork online.",
      "hours":"Monday-Saturday 10:00-20:00; Sunday 12:00-18:00. Holiday hours may differ.",
      "link":"https://mojomanstyle.com/","location":"633 Commonwealth Avenue, Orlando, FL 32803, United States","lat":28.56373,"lng":-81.36479,
      "vibe":"bold gay resort style, hundreds of cuts and enough fitting-room confidence to rescue a pool-party suitcase",
      "what":"More than 250 swimwear styles and 200 underwear styles alongside shirts, shorts, club pieces, footwear, fan gear and accessories. The large physical range is the point: customers can compare brands, rises and fits with staff help in one visit.",
      "best":"Weekday late morning gives the most room for sizing help. Shop before Orlando Pride, pool weekends or a cruise departure rather than en route to the party; popular cuts and sizes can move fast even when the overall selection looks enormous.",
      "online":"The official store supports product browsing, shipping and a free rewards programme with purchase and birthday perks. Delivery options and eligibility are finalized at checkout; call the shop for time-sensitive hotel delivery or pickup questions.",
      "payment":"The secure checkout displays current online card and accelerated-payment choices. Ask the physical register about a particular foreign card or wallet. Swimwear and underwear may carry hygiene restrictions, so read the current return terms before removing protection or tags.",
      "privacy":"Proudly gay-owned and operated since 2012, with a shop designed around gay men's clothing and fitting needs. The operator publishes exterior and interior views to make arrival easier; contact staff directly for mobility access or private fitting assistance.",
      "hours_source":"https://mojomanstyle.com/","sources":["https://mojomanstyle.com/"]
    },
    {
      "name":"BookBurn Cafe and Social",
      "city":"orlando","type":"store",
      "description":"A Filipino queer-owned Milk District sanctuary folds a cultural mercantile and rebellious little bookshop into a café that grows livelier after dark. Banned books, local writing, Filipino products and community programming make every shelf feel connected to a larger argument about who gets seen.",
      "hours":"Monday 11:00-15:00; Tuesday-Thursday 11:00-22:00; Friday-Sunday 11:00-23:00.",
      "link":"https://bookburnofficial.com/","location":"2425 East South Street, Orlando, FL 32803, United States","lat":28.53823,"lng":-81.34957,
      "vibe":"Filipino flavour, queer defiance and banned-book energy moving from coffeehouse daylight into social evening",
      "what":"A curated shop of banned and challenged books, work by local authors, cultural goods, statement apparel and Filipino coffee products, sharing space with food, coffee and a 16-tap bar. Performances and community events are integral to the concept.",
      "best":"Choose lunchtime for shelves and conversation at a quieter tempo; arrive later for the venue's social side and scheduled performances. Monday is deliberately short, so another weekday offers more margin if the retail browse is your priority.",
      "online":"The official website presents the venue, programme and contact channels, but does not expose a comprehensive mail-order catalogue or fixed shipping policy. Contact the team for merchandise availability instead of assuming everything on the physical shelves can be dispatched.",
      "payment":"Payment methods are not published as a stable complete list. A café tab, bar order and retail item may be handled through the same service flow, but confirm split payments, cash or a specific wallet with staff before ordering.",
      "privacy":"The operator describes BookBurn as a radical community sanctuary and Filipino gay-owned business. Daytime is the easiest all-ages-style visit; alcohol and late programming change the evening context. Ask directly about event age limits and access needs.",
      "hours_source":"https://bookburnofficial.com/contact/","sources":["https://bookburnofficial.com/contact/","https://bookburnofficial.com/bookburn-grand-opening/","https://www.inclusivity.org/business/bookburn-cafe-and-social"]
    },
    {
      "name":"Little District Books",
      "city":"washington_dc","type":"store",
      "description":"DC's queer bookstore gives LGBTQ+ stories the whole shop instead of a seasonal table. Its expanded Capitol Hill home ranges across romance, politics, horror, comics and children's books, with book clubs and author nights turning the shelves into an active neighbourhood commons.",
      "hours":"Monday-Friday 11:00-19:00; Saturday-Sunday 11:00-18:00. Special-event and Pride hours may differ.",
      "link":"https://littledistrictbooks.com/","location":"631 Pennsylvania Avenue SE, Washington, DC 20003, United States","lat":38.88463,"lng":-76.99668,
      "vibe":"bright Capitol Hill literary clubhouse where every genre gets read through a proudly queer lens",
      "what":"Books by LGBTQ+ authors and stories with queer themes across literary fiction, romance, fantasy, science fiction, horror, comics, nonfiction and children's sections, plus gifts, subscriptions, curated surprise boxes and several genre book clubs.",
      "best":"Browse on a weekday afternoon for staff recommendations, or use the calendar to pair a visit with one of the six recurring clubs or an author event. The newer 2,000-square-foot shop can host substantial gatherings, so event nights feel social rather than hushed.",
      "online":"The web shop offers books, preorders, subscriptions, curated boxes and selected gifts. Shipping cost, timing and destination are determined in checkout. Call when you need a title from the physical shelf immediately, particularly around an event or signed release.",
      "payment":"Current ecommerce methods appear in the secure checkout, while the Capitol Hill register may support a different mix. Confirm institutional orders, foreign cards or a required mobile wallet directly; event registration and book purchases may be separate.",
      "privacy":"Queer-owned and operated, all-ages and explicit about trans and Indigenous liberation. Street entry to the main room is step-free, but part of the split-level shop requires three steps and the public restroom is not ADA compliant.",
      "hours_source":"https://littledistrictbooks.com/pages/store-information","sources":["https://littledistrictbooks.com/pages/store-information","https://littledistrictbooks.com/pages/community","https://washington.org/dei/lgbtq-businesses-washington-dc"]
    },
    {
      "name":"Loyalty Bookstores",
      "city":"washington_dc","type":"store",
      "description":"Petworth's Black, queer and Asian-owned independent bookstore curates the city as it actually reads: intersectional fiction, children's books, politics and gifts share room with a relentless programme of authors and neighbourhood gatherings. The result feels precise, generous and deeply local.",
      "hours":"Monday closed; Tuesday-Thursday 11:00-19:00; Friday 11:00-20:00; Saturday 09:00-20:00; Sunday 10:00-18:00.",
      "link":"https://loyaltybookstores.com/","location":"4203 9th Street NW, Washington, DC 20011, United States","lat":38.94272,"lng":-77.02418,
      "vibe":"intersectional Petworth bookselling with brilliant staff curation and a calendar that keeps the neighbourhood talking",
      "what":"New books for adults and children with particular depth in work by BIPOC, queer, disabled and other marginalised writers, plus stationery, home goods, gifts, events and the Leap of Faith surprise-box programme.",
      "best":"Saturday opens earliest and suits a morning neighbourhood circuit; weekday afternoons leave more space for recommendations. Check the stacked event calendar before visiting—join when an author conversation appeals, or browse earlier to avoid the busiest room changeover.",
      "online":"The official catalogue supports shipping, store pickup and curated programmes. Inventory shown online may not describe every object in the physical gift selection. Delivery costs and eligible destinations are set during checkout; email the team for order-specific questions.",
      "payment":"The live checkout controls current online payment methods, and the store does not publish a permanent full register list. Ask before a large institutional order or when one wallet, cash option or overseas card is essential.",
      "privacy":"Black, queer and Asian owned, with a majority queer and woman-powered staff and an all-ages mission centred on diverse communities. The website reports an ADA compliance review; request specific seating, sensory or event accommodation in advance.",
      "hours_source":"https://loyaltybookstores.com/contact-us","sources":["https://loyaltybookstores.com/contact-us","https://loyaltybookstores.com/about-us","https://washington.org/dei/lgbtq-businesses-washington-dc"]
    },
    {
      "name":"Charlie's Queer Books",
      "city":"seattle","type":"store",
      "description":"Fremont's unapologetically pink queer bookstore fills every genre with LGBTQ+ lives, from picture books and graphic novels to romance, history and poetry. An upstairs reading nook, clubs and craft nights make the compact shop feel like the sober queer third place its founder set out to build.",
      "hours":"Monday-Saturday 11:00-19:00; Sunday 11:00-17:00. Check the operator for event or holiday changes.",
      "link":"https://www.charliesqueerbooks.com/","location":"465 North 36th Street, Seattle, WA 98103, United States","lat":47.65224,"lng":-122.35161,
      "vibe":"joyfully pink Fremont book haven with queer stories everywhere and zero obligation to order a drink",
      "what":"LGBTQ+ fiction, nonfiction, romance, history, poetry, graphic novels, young-adult and children's books, plus zines, stickers, apparel, tote bags, craft kits and jewellery. Book clubs, author talks and workshops keep the selection in motion.",
      "best":"Weekday opening hours suit relaxed browsing and the upstairs nook. Consult the events feed for clubs and workshops; these deepen the third-place atmosphere but can fill the intimate rooms, so arrive early when a particular programme matters.",
      "online":"The operator runs a web shop alongside the Fremont store, useful for browsing queer categories and gifts before arrival. Current shipping regions, cost and speed are resolved at checkout; contact staff when you need local pickup on a tight schedule.",
      "payment":"Online payment choices appear at secure checkout, while the physical shop controls register options. Confirm a required wallet or overseas card directly. Event tickets or workshop materials can have their own purchase path separate from ordinary books.",
      "privacy":"Trans-owned and explicitly created as a queer third place outside the bar scene. The shop welcomes readers across ages and identities; its upstairs nook may affect mobility, so contact the team for exact step-free browsing and event arrangements.",
      "hours_source":"https://www.seattlebookstoreday.com/","sources":["https://www.charliesqueerbooks.com/","https://www.seattlebookstoreday.com/","https://www.inclusivity.org/business/charlies-queer-books","https://www.sgn.org/story/330854"]
    },
    {
      "name":"Babeland Seattle",
      "city":"seattle","type":"store",
      "description":"The Capitol Hill original approaches pleasure like informed design: colourful, body-positive and refreshingly free of the old adult-shop gloom. Toys, safer-sex supplies, books and education sit in an accessible storefront where first questions receive the same respect as expert ones.",
      "hours":"Monday-Sunday 12:00-20:00.",
      "link":"https://www.babeland.com/content/c/Babeland_Store_Locations/","location":"707 East Pike Street, Seattle, WA 98122, United States","lat":47.61410,"lng":-122.32306,
      "vibe":"sex-positive Capitol Hill institution: playful colour, serious product knowledge and no shame at the door",
      "what":"Body-safe pleasure products, vibrators, dildos, harnesses, lubricants, safer-sex supplies, lingerie, books and gifts, backed by educational guidance. The physical store is especially valuable for comparing materials and asking fit or use questions privately.",
      "best":"Early afternoon is best for a low-pressure consultation before Capitol Hill's evening traffic. Workshops and promotions can make the shop busier, so check current events when education is the goal and choose a standard weekday for discreet one-to-one help.",
      "online":"The full ecommerce store ships products separately from the local retail floor, with current rates, destinations and delivery choices calculated during checkout. Stock and promotions can differ between web and Seattle, so call if pickup of one exact item is essential.",
      "payment":"Secure checkout exposes current online cards and accelerated options. The Seattle register may offer a different set of wallets. Product hygiene rules can make opened intimate items final sale, so ask about exchange eligibility before opening packaging.",
      "privacy":"Babeland's mission is inclusive, empowering and sex-positive. The operator marks the Seattle store as wheelchair accessible; shoppers wanting quieter assistance can visit early. Ask staff about discreet packaging and age requirements for a particular order or event.",
      "hours_source":"https://www.babeland.com/content/c/Babeland_Store_Locations/","sources":["https://www.babeland.com/content/c/Babeland_Store_Locations/","https://www.babeland.com/content/c/about-us/"]
    },
    {
      "name":"Charis Books & More",
      "city":"atlanta","type":"store",
      "description":"The South's oldest independent feminist bookstore remains a living queer institution after more than fifty years. Its Decatur rooms braid trans writing, sapphic romance, racial justice, disability studies and extraordinary children's shelves into a store that still behaves like an organising space.",
      "hours":"Monday-Saturday 10:00-19:00; Sunday 12:00-18:00.",
      "link":"https://charisbooksandmore.com/","location":"184 South Candler Street, Decatur, GA 30030, United States","lat":33.77033,"lng":-84.29361,
      "vibe":"historic Southern feminist nerve centre where queer books, radical care and porch conversations stay current",
      "what":"LGBTQIA+ and trans books woven throughout fiction, nonfiction and all-ages sections, alongside feminist theory, racial justice, disability writing, poetry and distinctive children's literature. Charis Circle adds readings, groups and social-justice programmes.",
      "best":"Allow time for staff picks rather than racing a shopping list. Weekday mornings are calm; readings and community programmes bring the house alive. Check whether an event is in person or streamed and request interpretation early when needed.",
      "online":"The website lists titles available to order, not a live mirror of books currently on the shelf. Most orders are processed within 48 hours and ship or become ready for pickup within one to seven business days; phone for immediate stock confirmation.",
      "payment":"Secure checkout shows current online methods, and the store can take phone orders. Confirm a required wallet or institutional process directly. Event admission and books may follow different arrangements, especially for nonprofit Charis Circle programming.",
      "privacy":"Independent, queer and feminist, all-ages and disability-justice informed. The building has van-accessible parking, two ramps, movable shelves, wheelchair-accessible gender-neutral bathrooms, braille signs and free ASL interpretation for most programmes by advance request.",
      "hours_source":"https://charisbooksandmore.com/location-directions-hours","sources":["https://charisbooksandmore.com/location-directions-hours","https://charisbooksandmore.com/about-us","https://atlgbtq.atlantaga.gov/assets/files/Atlanta%20LGBTQHistoricContextStatement.pdf"]
    },
    {
      "name":"Out of the Closet - Ansley",
      "city":"atlanta","type":"store",
      "description":"This Ansley thrift shop sits close to one of Atlanta's best-known gay gathering districts and connects every donated jacket, record and lamp to AIDS Healthcare Foundation services. The constantly shifting floor rewards curiosity more than planning, with community health built into the bargain hunt.",
      "hours":"Monday-Sunday from 10:00; closing time and holiday hours should be confirmed with the branch before travel.",
      "link":"https://outofthecloset.org/locations/ansley-thrift-store/","location":"1512 Piedmont Avenue NE, Atlanta, GA 30324, United States","lat":33.79739,"lng":-84.37000,
      "vibe":"friendly Ansley thrift lottery where retro Atlanta finds turn directly into HIV care and testing support",
      "what":"Rotating donated clothing, shoes, accessories, books, records, home decor, kitchenware and selected furniture. The shop accepts suitable donations, and chain proceeds fund HIV prevention and treatment through AIDS Healthcare Foundation.",
      "best":"Start near 10:00 for easier racks and first look at fresh stock. Phone before a large furniture drop or when onsite testing is the main reason for visiting; donation capacity and clinical schedules are more variable than retail opening.",
      "online":"The chain sells a selected stream of finds through Poshmark, while Ansley's floor inventory changes too quickly for a complete catalogue. Large donation pickup requires qualifying volume and a separately scheduled appointment through the official programme.",
      "payment":"Branch-specific payment methods are not completely published on the operator page. Bring a mainstream card and ask about cash or contactless needs at entry. Purchases, tax-deductible donations and healthcare services use separate processes.",
      "privacy":"The chain identifies every store as an LGBTQIA+ safe space and offers free, discreet HIV testing through trained staff, with services varying by location. Contact Ansley directly for testing hours, pharmacy details or exact physical-access support.",
      "hours_source":"https://outofthecloset.org/locations/ansley-thrift-store/","sources":["https://outofthecloset.org/locations/ansley-thrift-store/","https://outofthecloset.org/about/","https://outofthecloset.org/donate/"]
    }
  ] $qa_usa_stores_batch_03$) s(
    name text,city text,type text,description text,hours text,link text,location text,
    lat double precision,lng double precision,vibe text,what text,best text,
    online text,payment text,privacy text,hours_source text,sources jsonb
  )
), stores as (
  select s.*,jsonb_build_object(
    'queue_wait',what,'best_nights',best,'crowd_mix',online,'dress_code',payment,
    'staff_inclusivity',privacy,'hours_source_url',hours_source,
    'hours_checked_at','2026-09-14','source_urls',sources,
    'research_status','current_operator_official_destination_and_community_sources',
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
from (values ('new_orleans'),('orlando'),('washington_dc'),('seattle'),('atlanta')) v(city_slug)
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select city,name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places
where public.qa_city_slug(city) in ('new_orleans','orlando','washington_dc','seattle','atlanta')
  and type='store'
order by city,name;
