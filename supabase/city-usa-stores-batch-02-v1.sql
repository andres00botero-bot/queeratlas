-- USA stores batch 02: Provincetown, Chicago, Las Vegas, San Diego, Philadelphia.
-- Researched 2026-09-14 from current operators and official destination/community sources.
-- Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select * from jsonb_to_recordset($qa_usa_stores_batch_02$
  [
    {
      "name":"Womencrafts",
      "city":"provincetown","type":"store",
      "description":"Provincetown's lesbian landmark has been putting women's words, art and politics in the window since 1976. The tiny feminist book-and-gift shop is equal parts reading room, activist nerve centre and treasure box, with queer and gender studies forming the heart of the shelves instead of a token corner.",
      "hours":"Summer: open daily; winter: Saturday-Sunday, often Friday. Exact seasonal hours vary—check with the shop before travelling.",
      "link":"https://www.womencraftsptown.com/","location":"376 Commercial Street, Provincetown, MA 02657, United States","lat":42.05608,"lng":-70.18298,
      "vibe":"sapphic history, intersectional feminism and glorious protest-button energy under one roof",
      "what":"Books by women, lesbian fiction, queer and gender studies, work by women of colour and trans authors, feminist history, local art, pottery, jewellery, political stickers, cards and Womencrafts originals. Every object is chosen through a women-centred, activist lens.",
      "best":"A weekday summer morning leaves space for a real bookseller conversation; Women's Week and anniversary events turn the shop into a community destination. Winter opening is deliberately limited, so confirm the day rather than trusting a generic map schedule.",
      "online":"The operator runs a focused web shop for original apparel, posters, books, prints, jewellery and gift certificates. It does not publish a stable, complete shipping-geography summary on accessible pages; confirm delivery and timing at checkout before ordering internationally.",
      "payment":"The live online checkout determines current card and wallet choices. Independent listings report credit-card acceptance in store, but Womencrafts does not publish a fixed register-method list; contact the shop if cashless or foreign-card acceptance is essential.",
      "privacy":"Lesbian-owned and operated, explicitly intersectional and described by the operator as a hub for activism and community. It is an all-ages shop, though political merchandise is frank. The historic Commercial Street premises do not have a detailed published access statement, so ask about mobility needs.",
      "hours_source":"https://www.womencraftsptown.com/","sources":["https://www.womencraftsptown.com/","https://www.womencraftsptown.com/about","https://www.womencraftsptown.com/store"]
    },
    {
      "name":"Full Kit Gear Provincetown",
      "city":"provincetown","type":"store",
      "description":"A compact Commercial Street command post for gay resort dressing and serious fetish gear. Full Kit moves easily from swim briefs and club shirts to leather, rubber, restraints and toys, with staff who understand that the right harness fit can matter as much as the colour.",
      "hours":"Monday-Sunday 11:00-20:00; occasional extended holiday and event hours.",
      "link":"https://www.fullkit.com/pages/our-stores","location":"192 Commercial Street, Provincetown, MA 02657, United States","lat":42.04953,"lng":-70.19093,
      "vibe":"holiday flirtation meets knowledgeable gay gear shop on the busiest queer street in town",
      "what":"Swimwear, underwear, streetwear, leather, rubber, harnesses, restraints, pup gear, lubricants, toys and body jewellery. The physical shop gives visitors the fitting help and material feel that are difficult to judge through an adult-gear product page.",
      "best":"Visit before late afternoon for unhurried sizing and gear questions. Carnival, Bear Week and holiday weekends compress demand into a small town, so shop early in the week or arrange store pickup when a particular brand, colour or size is non-negotiable.",
      "online":"US orders normally leave within two business days, with tracked flat-rate shipping below USD 99 and free Priority Mail at or above that threshold. The operator currently ships only within the United States and offers Provincetown store pickup on eligible orders.",
      "payment":"The secure checkout controls current cards and accelerated payment options; prices are in US dollars and paid in advance. Confirm physical-store wallets directly. Personal, intimate, swim and underwear items have strict hygiene-based return limits even when other unused goods qualify for 30-day return.",
      "privacy":"Orders use nondescript packaging with FKG, Inc. as the return name. Full Kit is an adult gay gear specialist; online purchasers must be at least 18 or the legal age where they live. Contact the shop for exact step-free-access or private-fitting arrangements.",
      "hours_source":"https://www.fullkit.com/pages/our-stores","sources":["https://www.fullkit.com/pages/our-stores","https://www.fullkit.com/pages/shipping-returns/","https://www.fullkit.com/pages/terms-and-conditions"]
    },
    {
      "name":"Women & Children First",
      "city":"chicago","type":"store",
      "description":"Andersonville's feminist literary institution has spent more than 45 years making room for voices mainstream shelves overlook. Queer fiction, trans writing, politics, children's books and packed author events share a warm neighbourhood shop that still feels intellectually alive rather than preserved in amber.",
      "hours":"Monday 12:00-18:00; Tuesday-Saturday 11:00-18:00; Sunday 11:00-18:00. Event closures may alter hours.",
      "link":"https://womenandchildrenfirst.com/","location":"5233 North Clark Street, Chicago, IL 60640, United States","lat":41.97737,"lng":-87.66846,
      "vibe":"feminist Andersonville living room with deep queer shelves and a fiercely current events calendar",
      "what":"Fiction, poetry, memoir, politics, gender studies, LGBTQ+ writing, children's and young-adult books, magazines, cards, gifts and store merchandise. Staff curation and book groups make it especially strong for finding new queer voices rather than only familiar bestsellers.",
      "best":"Arrive shortly after opening for recommendations and slow browsing. Evening launches and book groups are a major part of the shop, so consult the official calendar: attend for community, or choose another window if an event crowd would make browsing difficult.",
      "online":"The official catalogue supports shipped orders, preorders, audiobooks and ebooks. Event titles and signed stock can follow special fulfilment rules, so read the individual listing. The operator's live checkout is the source of truth for destination, rate and delivery estimate.",
      "payment":"Online methods are shown in the secure checkout and may differ from the Clark Street register. The operator does not publish a durable complete card-and-wallet list on the accessible store page; contact staff when a specific method or institutional purchase is required.",
      "privacy":"A queer-owned feminist bookstore and all-ages community space. Masks are strongly encouraged for ordinary shopping and required for most in-store events, with free masks at the entrance. The website reports an ADA review; request event accommodations in advance when needed.",
      "hours_source":"https://womenandchildrenfirst.com/","sources":["https://womenandchildrenfirst.com/","https://www.choosechicago.com/blog/lgbtq/transgender-gender-diverse-and-nonbinary-owned-businesses-in-chicago/"]
    },
    {
      "name":"Full Kit Gear Chicago",
      "city":"chicago","type":"store",
      "description":"Andersonville's expansive gay gear flagship can build a whole night out from the skin up: underwear and streetwear first, then leather, rubber, pup kit and serious play equipment. The mood is specialist without being cryptic, so curious newcomers and seasoned IML shoppers can both get useful fitting advice.",
      "hours":"Sunday 11:00-20:00; Monday-Wednesday 12:00-20:00; Thursday 12:00-21:00; Friday 12:00-22:00; Saturday 11:00-22:00.",
      "link":"https://www.fullkit.com/pages/our-stores","location":"5021 North Clark Street, Chicago, IL 60640, United States","lat":41.97315,"lng":-87.66836,
      "vibe":"deep fetish expertise with enough fashion and humour to keep the first harness fitting relaxed",
      "what":"Gay men's streetwear, underwear, swimwear, leather and rubber clothing, harnesses, restraints, pup equipment, adult toys, lubricants and body jewellery. The Chicago flagship's breadth is particularly useful for comparing materials and getting sizing help before a major event.",
      "best":"Weekday afternoons are best for detailed fitting help. International Mr. Leather, Market Days and Pride bring event energy and fast-moving stock, so use online pickup or visit before the main weekend if you need one exact size rather than a spontaneous find.",
      "online":"Tracked US orders normally dispatch within two business days. Shipping costs USD 9.99 below USD 99 and becomes free at USD 99; international and APO delivery are currently unavailable. Eligible orders can be collected at the Chicago store.",
      "payment":"Online purchases are prepaid in US dollars using methods exposed by the live checkout. Ask the Chicago register about mobile wallets. Underwear, swimwear, intimate apparel, toys and body jewellery cannot normally be returned for hygiene reasons; other unused items have a 30-day window.",
      "privacy":"Web orders arrive in nondescript packaging under the FKG, Inc. name. The shop is explicitly adult and gay-focused, with an 18-or-legal-age condition online. Staff expertise reduces guesswork around fit and materials; contact them for detailed physical-access needs.",
      "hours_source":"https://www.fullkit.com/pages/our-stores","sources":["https://www.fullkit.com/pages/our-stores","https://www.fullkit.com/pages/shipping-returns/","https://www.fullkit.com/pages/terms-and-conditions"]
    },
    {
      "name":"The Writer's Block",
      "city":"las_vegas","type":"store",
      "description":"Downtown Vegas swaps casino carpet for books, coffee and a miniature artificial-bird sanctuary at this proudly odd independent shop. Its queer-friendly shelves, readings and workshops offer a thoughtful daytime counterpoint to the Strip, with enough theatrical charm to make browsing feel like entering a story.",
      "hours":"Monday-Thursday 10:00-19:00; Friday and Sunday 10:00-20:00; Saturday 10:00-21:00.",
      "link":"https://www.thewritersblock.org/","location":"519 South 6th Street, Suite 100, Las Vegas, NV 89101, United States","lat":36.16491,"lng":-115.14036,
      "vibe":"bookish downtown escape where queer readers, writers and imaginary birds all get shelf space",
      "what":"New fiction, poetry, graphic novels, children's books, literary gifts and more than 20,000 titles, alongside a café and programme of readings, signings, book clubs and creative-writing workshops. It is a broad indie bookstore with a visible queer welcome, not an LGBTQ-only retailer.",
      "best":"Weekday mornings are calmest for browsing and café time; Saturday's longer hours suit a slow downtown circuit. Check the events programme before arrival if you want a reading or workshop, and avoid its start time if you prefer the shop without a gathering.",
      "online":"The official website supports catalogue browsing and ordering, but shipping rates and delivery coverage are finalized in live checkout rather than summarized in a stable public policy page. Call the shop when timing matters for a hotel delivery or signed event title.",
      "payment":"Current map information reports credit cards, Apple Pay and contactless payments. Online methods depend on checkout. Treat the café and bookstore as potentially separate transactions, and confirm at the counter if a specific international card or cash option matters.",
      "privacy":"An all-ages independent bookstore with wheelchair access, gender-neutral restrooms and an LGBTQ-friendly reputation. It is suitable for quiet solo browsing and youth visits; event accessibility can vary with furniture layout, so contact the shop for seating or mobility arrangements.",
      "hours_source":"https://maps.apple.com/place?place-id=I919E9359880EBF20","sources":["https://www.thewritersblock.org/","https://maps.apple.com/place?place-id=I919E9359880EBF20"]
    },
    {
      "name":"Nikki Woods Switch Closet",
      "city":"las_vegas","type":"store",
      "description":"A free gender-affirming styling boutique inside The LGBTQ Center of Southern Nevada, built for trans and gender-diverse people to try possibilities without retail pressure. Clothes, accessories and one-to-one support turn a community donation closet into a dignified place to experiment, prepare and be seen.",
      "hours":"Appointments Thursday 10:00-18:00; walk-ins Friday 12:00-14:00 and 15:00-18:00; youth and family walk-ins Tuesday 16:30-19:00. Closed Monday and weekends.",
      "link":"https://thecenterlv.org/news-post/the-nikki-woods-switch-closet-a-styling-boutique-for-the-trans-gender-diverse-community","location":"401 South Maryland Parkway, Las Vegas, NV 89101, United States","lat":36.16341,"lng":-115.13536,
      "vibe":"affirming styling room where identity comes first and the price tag is zero",
      "what":"Gently used clothing, accessories and personalised styling for trans and gender-diverse community members, including looks for everyday life, job interviews and gender exploration. It is a community resource rather than a conventional commercial shop, and access is free.",
      "best":"Book Thursday for a private, guided session; Friday suits spontaneous adult browsing. Tuesday evening is reserved for ages 13-18 and families. The closet processes donations on Wednesday, so do not arrive then expecting shopping access.",
      "online":"There is no ecommerce or shipping service because garments are fitted and distributed through the physical programme. Use the official appointment route for a styling session; prospective donors should follow the current donation-needs guidance rather than mailing items unannounced.",
      "payment":"No payment is required for closet access or clothing. This is a free programme supported by community donations. Other services inside The Center may follow their own registration rules, so do not infer fees or eligibility from the boutique schedule.",
      "privacy":"Designed specifically as a safe, affirming environment for trans and gender-diverse adults and youth. Appointments offer more privacy than walk-ins. Youth sessions have dedicated times; contact The Center about confidentiality, accessibility or support-person arrangements before the visit.",
      "hours_source":"https://thecenterlv.org/news-post/the-nikki-woods-switch-closet-a-styling-boutique-for-the-trans-gender-diverse-community","sources":["https://thecenterlv.org/news-post/the-nikki-woods-switch-closet-a-styling-boutique-for-the-trans-gender-diverse-community","https://thecenterlv.org/news-post/trans-gender-diversity-resource-guide"]
    },
    {
      "name":"Libélula Books & Co.",
      "city":"san_diego","type":"store",
      "description":"Barrio Logan's queer, BIPOC-centred bookshop reads like a hand-built manifesto: bilingual shelves, poetry, art, grassroots organising and strange little discoveries selected with intention. Talks, teach-ins and music make the store a creative community room rather than a silent retail box.",
      "hours":"Monday-Sunday 11:00-18:00.",
      "link":"https://www.libelulabooksandco.com/","location":"950 South 26th Street, San Diego, CA 92113, United States","lat":32.69832,"lng":-117.13699,
      "vibe":"Barrio Logan radical book nook: bilingual, queer, handmade and happily resistant to bland shelves",
      "what":"New and used books in English and Spanish, queer literature, poetry, art publications, graphic novels, feminist and social-justice nonfiction, with emphasis on Indigenous, Black and Chicanx histories. The calendar adds readings, workshops, teach-ins and small music shows.",
      "best":"Early afternoon offers time to follow the hand-labelled sections and ask for a recommendation. Check the event calendar when community is the goal; during talks or class visits, the intimate shop can feel full quickly, so browse earlier if you want quiet.",
      "online":"The operator focuses on the physical, hand-selected shop and event space; a comprehensive shipping catalogue and stable delivery policy are not published on the accessible homepage. Contact the store for remote purchase or event-book arrangements rather than assuming ecommerce availability.",
      "payment":"The official site does not publish a complete current payment-method list. Bring a commonly accepted card and confirm cash or mobile-wallet needs directly with the shop. Event registration, when required, may be handled separately from book purchases.",
      "privacy":"The shop explicitly centres queer and BIPOC people, treats young visitors as participants and states that all are welcome. It is an all-ages space with political and identity-focused material. Contact staff ahead for step-free access, seating or sensory needs during intimate events.",
      "hours_source":"https://www.libelulabooksandco.com/","sources":["https://www.libelulabooksandco.com/","https://www.sandiego.gov/sites/default/files/san_diego_lgbtq_historic_context_final.pdf"]
    },
    {
      "name":"Out of the Closet - San Diego",
      "city":"san_diego","type":"store",
      "description":"Hillcrest's bright-pink thrift stop makes second-hand treasure hunting pay forward: vintage clothes, home pieces and daily surprises help fund AIDS Healthcare Foundation care, while the chain's free HIV testing mission keeps community health visibly connected to the retail floor.",
      "hours":"Monday-Sunday 09:00-18:00.",
      "link":"https://outofthecloset.org/locations/san-diego-thrift-store/","location":"3580 Fifth Avenue, San Diego, CA 92103, United States","lat":32.74313,"lng":-117.16032,
      "vibe":"Hillcrest thrift roulette in signature pink, with every good find feeding HIV services",
      "what":"Changing racks of donated clothing, shoes and vintage pieces plus books, records, home decor and selected household goods. The location accepts donations, and purchases support HIV prevention and treatment through AIDS Healthcare Foundation.",
      "best":"Arrive near 09:00 for first pass through newly placed stock and easier browsing; thrift inventory cannot guarantee a size or item. Weekends draw Hillcrest foot traffic, so weekday mornings suit furniture or donation drop-off questions better.",
      "online":"Selected chain inventory appears through the official Poshmark shop, but San Diego floor stock is mainly an in-person hunt. Donation pickup and accepted-item rules are handled through the chain's donation programme and should be checked before preparing a large load.",
      "payment":"Current map data reports credit cards, Apple Pay and contactless payments. The chain's individual location pages can list methods differently, so confirm cash or a required wallet at the register rather than generalising from another branch.",
      "privacy":"Out of the Closet identifies its stores as LGBTQIA+ safe spaces and ties the chain to discreet, stigma-free HIV testing. This Hillcrest shop is reported to have street parking and a lot; call for branch-specific testing times and detailed mobility access.",
      "hours_source":"https://maps.apple.com/place?place-id=I6443925243FAA78C","sources":["https://outofthecloset.org/locations/san-diego-thrift-store/","https://outofthecloset.org/about/","https://maps.apple.com/place?place-id=I6443925243FAA78C","https://www.sandiego.org/members/out-of-the-closet-san-diego/7613"]
    },
    {
      "name":"Philly AIDS Thrift at Giovanni's Room",
      "city":"philadelphia","type":"store",
      "description":"The country's longest-running queer and feminist bookstore still glows from its historic Gayborhood rowhouse, now powered by Philly AIDS Thrift. New and used LGBTQ+ books, rare magazines and proudly local merchandise keep fifty years of literary resistance useful, browsable and very much alive.",
      "hours":"Monday-Saturday 11:00-20:00; Sunday 11:00-19:00.",
      "link":"https://queerbooks.com/","location":"345 South 12th Street, Philadelphia, PA 19107, United States","lat":39.94529,"lng":-75.16188,
      "vibe":"living queer archive in a Gayborhood townhouse, equal parts history lesson and excellent book hunt",
      "what":"New and used queer and feminist fiction, nonfiction, memoir, poetry, history, horror, rare backlist and magazines, plus Giovanni's Room and Philly Pride merchandise. A monthly queer book club and anniversary programming deepen its role beyond sales.",
      "best":"Weekday afternoons are best for exploring the dense rooms and asking about older titles. The Philly Queer Book Club meets on the first Thursday evening each month; join for conversation or choose a different day if you prefer a quieter historical browse.",
      "online":"The official web shop sells selected books and branded merchandise, while the physical store holds much more used and archival stock. Shipping availability and rates are determined at checkout; contact staff for a rare title that does not appear online.",
      "payment":"Online payment choices appear in the secure checkout. The store does not publish a stable complete register-method list on its accessible pages, so verify cash, mobile wallet or foreign-card requirements directly when one method is necessary.",
      "privacy":"An explicitly queer and feminist all-ages bookstore managed by a nonprofit thrift organisation. Purchases help support people living with HIV/AIDS. The multi-level historic rowhouse may present access constraints; contact the store about step-free entry or retrieving a title from another floor.",
      "hours_source":"https://queerbooks.com/","sources":["https://queerbooks.com/","https://www.visitphilly.com/articles/philadelphia/essential-lgbt-sites-things-to-do-philadelphia/"]
    },
    {
      "name":"Philly AIDS Thrift",
      "city":"philadelphia","type":"store",
      "description":"A sprawling, eccentric charity department store where a vintage jacket, record player, kitchen oddity and piece of furniture can all appear in one lap. The joyful clutter has a clear purpose: profits and direct grants support Philadelphia organisations fighting HIV/AIDS.",
      "hours":"Monday-Thursday 11:00-20:00; Friday-Saturday 11:00-21:00; Sunday 11:00-19:00. Donation intake Tuesday-Saturday 12:00-19:00.",
      "link":"https://www.phillyaidsthrift.com/","location":"710 South 5th Street, Philadelphia, PA 19147, United States","lat":39.94069,"lng":-75.15108,
      "vibe":"multi-floor thrift chaos with a huge heart, fabulous prices and something bizarre around every corner",
      "what":"Second-hand clothing, shoes, books, records, art, jewellery, kitchenware, electronics, furniture and home goods spread across a large, idiosyncratic shop. Proceeds fund local HIV/AIDS organisations, and a private rapid-testing space operates on the second floor on scheduled dates.",
      "best":"Weekday opening time gives the clearest run at newly sorted stock and the narrowest aisles. Give yourself at least an hour: this is a dig, not a curated rack. Donation drop-off starts at noon Tuesday-Saturday and follows stricter intake hours than shopping.",
      "online":"The main experience is physical and inventory changes too quickly for a full ecommerce catalogue. Donation guidance is published online, including accepted-condition rules. Contact the store for a specific high-value item rather than assuming it can be reserved or shipped.",
      "payment":"The operator does not publish a complete durable list of cards, cash and wallets on the accessible pages. Bring a common payment card and confirm large-item or cash needs before checkout; donation receipts and retail transactions follow separate processes.",
      "privacy":"The store is a queer-rooted nonprofit and the second-floor rapid HIV testing room is described as private and confidential, with certified counsellors and linkage to care. The crowded multi-floor layout can affect mobility, so call ahead about access or assistance with larger goods.",
      "hours_source":"https://www.phillyaidsthrift.com/","sources":["https://www.phillyaidsthrift.com/","https://www.phillyaidsthrift.com/contact/","https://www.phillyaidsthrift.com/get-tested/","https://www.phillyaidsthrift.com/wp-content/uploads/2025/05/Philly-AIDS-Thrift-Donation-Info-Pamphlet.pdf"]
    }
  ] $qa_usa_stores_batch_02$) s(
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
from (values ('provincetown'),('chicago'),('las_vegas'),('san_diego'),('philadelphia')) v(city_slug)
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select city,name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places
where public.qa_city_slug(city) in ('provincetown','chicago','las_vegas','san_diego','philadelphia')
  and type='store'
order by city,name;
