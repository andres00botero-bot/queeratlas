-- USA stores batch 04: Boston, Dallas, Denver, Austin, Fire Island.
-- Researched 2026-09-14 from current operators and official destination/community sources.
-- Idempotent by normalized city/name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_stores as (
  select * from jsonb_to_recordset($qa_usa_stores_batch_04$
  [
  {
    "name": "All She Wrote Books",
    "city": "boston",
    "type": "store",
    "description": "Somerville’s queer-owned feminist bookstore gives underrepresented writers the whole room: intersectional fiction, politics and children’s books live beside author talks and community conversations.",
    "hours": "Monday closed; Tuesday-Wednesday 11:00-18:00; Thursday-Saturday 11:00-19:00; Sunday 12:00-17:00.",
    "link": "https://www.allshewrotebooks.com/",
    "location": "75 Washington Street, Somerville, MA 02143, United States",
    "lat": 42.3868,
    "lng": -71.0836,
    "vibe": "warm East Somerville reading room with a radical spine",
    "what": "Intersectional feminist and queer books across genres, gifts, events and community resources.",
    "best": "Visit midweek for thoughtful recommendations; event nights trade quiet browsing for lively conversation.",
    "online": "The web catalogue, gift cards and ordering extend the shop beyond Boston; checkout sets delivery terms.",
    "payment": "Online checkout and the Washington Street register expose their current methods; ask about institutional orders.",
    "privacy": "Queer-owned, survivor-informed and explicitly designed as a safe, supportive all-ages gathering space.",
    "hours_source": "https://www.allshewrotebooks.com/",
    "sources": [
      "https://www.allshewrotebooks.com/"
    ]
  },
  {
    "name": "Good Vibrations Brookline",
    "city": "boston",
    "type": "store",
    "description": "Brookline’s sex-positive boutique replaces adult-shop awkwardness with informed conversation, body-safe pleasure products and an educational tradition shaped by women and queer communities.",
    "hours": "Monday-Thursday 11:00-19:00; Friday-Saturday 12:30-20:30; Sunday 12:00-18:00.",
    "link": "https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/",
    "location": "308A Harvard Street, Brookline, MA 02446, United States",
    "lat": 42.3427,
    "lng": -71.1215,
    "vibe": "bright, expert pleasure shopping without shame or sleaze",
    "what": "Toys, lubricants, safer-sex supplies, books, lingerie and practical product education.",
    "best": "Early weekday hours offer the calmest window for private questions and side-by-side product comparison.",
    "online": "The full web store ships separately from branch inventory; verify pickup and delivery in checkout.",
    "payment": "Current cards and wallets appear at checkout; opened intimate products can carry hygiene restrictions.",
    "privacy": "The operator marks Brookline wheelchair accessible and builds service around inclusive, nonjudgmental education.",
    "hours_source": "https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/",
    "sources": [
      "https://www.goodvibes.com/content/c/Good-Vibes-Store-Locations/"
    ]
  },
  {
    "name": "Out of the Closet - Dallas",
    "city": "dallas",
    "type": "store",
    "description": "At the heart of Oak Lawn, this thrift store turns rotating vintage racks and home finds into funding for HIV prevention, treatment and free testing through AIDS Healthcare Foundation.",
    "hours": "Monday-Saturday 10:00-19:00; Sunday 10:00-18:00.",
    "link": "https://outofthecloset.org/locations/dallas-thrift-store/",
    "location": "3920 Cedar Springs Road, Dallas, TX 75219, United States",
    "lat": 32.8114,
    "lng": -96.8095,
    "vibe": "Cedar Springs bargain hunt with healthcare built into the mission",
    "what": "Second-hand clothing, shoes, books, records, decor and household goods plus donation intake and health services.",
    "best": "Arrive near opening for fresh rails; phone first when testing or a large furniture donation is the priority.",
    "online": "Selected chain finds appear on Poshmark, while Dallas floor stock remains an in-person surprise.",
    "payment": "Bring a mainstream card and confirm branch cash or wallet support; donations use a separate receipt process.",
    "privacy": "An official LGBTQIA+ safe space with discreet HIV testing; branch clinical schedules should be confirmed.",
    "hours_source": "https://outofthecloset.org/locations/dallas-thrift-store/",
    "sources": [
      "https://outofthecloset.org/locations/dallas-thrift-store/"
    ]
  },
  {
    "name": "Skivvies",
    "city": "dallas",
    "type": "store",
    "description": "A long-running Cedar Springs outfitter where designer underwear, jocks, club shirts and cheeky gifts are selected for the gay Dallas calendar rather than a generic menswear floor.",
    "hours": "Sunday 11:00-22:00; Monday-Thursday 10:00-22:00; Friday-Saturday 10:00-23:00.",
    "link": "https://skivviesdallas.myshopify.com/",
    "location": "4001 Cedar Springs Road, Unit C, Dallas, TX 75219, United States",
    "lat": 32.8122,
    "lng": -96.8088,
    "vibe": "Oak Lawn confidence shop with late hours and serious underwear range",
    "what": "Designer underwear, swimwear, casual shirts, Pride pieces, adult novelties, caps and home gifts.",
    "best": "Go before Friday evening for sizing help; Pride and party weekends reward buying the essential look early.",
    "online": "The Shopify storefront supports advance browsing; stock and collection options are finalized online.",
    "payment": "Apple Pay, contactless and credit cards are reported in store; review intimate-apparel return limits first.",
    "privacy": "Gay-community specialist with wheelchair access reported; adult items share space with ordinary apparel.",
    "hours_source": "https://skivviesdallas.myshopify.com/",
    "sources": [
      "https://skivviesdallas.myshopify.com/"
    ]
  },
  {
    "name": "(dis)obedience",
    "city": "denver",
    "type": "store",
    "description": "Denver’s queer-owned adult shop edits out needless gender labels and fills the shelves with trans-inclusive, size-inclusive pleasure products, safer materials and patient education.",
    "hours": "Wednesday-Saturday 12:00-19:00; Sunday-Tuesday closed.",
    "link": "https://www.disobediencedenver.com/",
    "location": "3605 West Colfax Avenue, Denver, CO 80204, United States",
    "lat": 39.7402,
    "lng": -105.0352,
    "vibe": "West Colfax resistance, body safety and playful kink in one affirming room",
    "what": "Gender-neutral toys, packers, harnesses, apparel, lubricants, BDSM gear and queer-maker products.",
    "best": "Wednesday afternoon is best for unhurried education; the four-day week makes advance planning worthwhile.",
    "online": "Tracked USPS Priority shipping is standard and orders over USD 70 qualify for free shipping.",
    "payment": "Afterpay is advertised online; sealed returns may receive exchange or credit within fourteen days.",
    "privacy": "Queer-owned, trans and nonbinary centred; orders ship in discreet, nondescript packaging.",
    "hours_source": "https://www.disobediencedenver.com/",
    "sources": [
      "https://www.disobediencedenver.com/"
    ]
  },
  {
    "name": "Vanilla Kink",
    "city": "denver",
    "type": "store",
    "description": "Upstairs in the METLO, this queer-owned fetish emporium mixes upscale presentation with Colorado-made rope, leather and imaginative equipment for shoppers from curious beginner to committed kinkster.",
    "hours": "Monday-Saturday 11:00-20:00; Sunday 12:00-18:00.",
    "link": "https://www.vanillakinkdenver.com/",
    "location": "1111 Broadway, Suite 209, Denver, CO 80203, United States",
    "lat": 39.7341,
    "lng": -104.9874,
    "vibe": "Golden Triangle boutique polish with community-powered kink knowledge",
    "what": "Bondage, impact gear, fetishwear, lingerie, furniture, rope, queer gear and locally made equipment.",
    "best": "Weekday daylight leaves space for detailed material and safety questions; allow time to find the second-floor suite.",
    "online": "The online shop carries broad collections, though oversized furniture and local makers may follow special fulfilment.",
    "payment": "Checkout shows current cards; ask before purchase about strict hygiene rules for intimate merchandise.",
    "privacy": "A shame-free queer shop focused on informed exploration; contact staff about lift and mobility access.",
    "hours_source": "https://www.vanillakinkdenver.com/",
    "sources": [
      "https://www.vanillakinkdenver.com/"
    ]
  },
  {
    "name": "The Little Gay Shop",
    "city": "austin",
    "type": "store",
    "description": "Austin’s compact queer culture store packs books, art, magazines and sharp political gifts from hundreds of LGBTQ+ makers into a space that also powers markets and free book clubs.",
    "hours": "Sunday-Thursday 11:00-18:00; Friday-Saturday 11:00-19:00.",
    "link": "https://thelittlegayshop.com/pages/austin",
    "location": "1902 East 12th Street, Austin, TX 78702, United States",
    "lat": 30.2744,
    "lng": -97.7198,
    "vibe": "East Austin rainbow cabinet of curiosities made by the community itself",
    "what": "Queer books by identity and genre, original art, apparel, pins, magazines and work from independent makers.",
    "best": "Browse weekday afternoons for conversation; markets and club dates are better when meeting creators is the goal.",
    "online": "The web shop carries books and maker goods beyond the physical selection; checkout confirms shipping.",
    "payment": "Secure checkout lists online methods; use free street parking and avoid the tow-prone dirt lot nearby.",
    "privacy": "Queer-owned and community-first, supporting hundreds of makers and hosting inclusive market programmes.",
    "hours_source": "https://thelittlegayshop.com/pages/austin",
    "sources": [
      "https://thelittlegayshop.com/pages/austin"
    ]
  },
  {
    "name": "BookWoman",
    "city": "austin",
    "type": "store",
    "description": "Austin’s LGBTQ-owned feminist bookstore has spent more than four decades pairing fearless shelves with poetry, open mics and hybrid discussions that keep Texas literary resistance social.",
    "hours": "Monday-Friday 10:00-19:00; Saturday 10:00-18:00; Sunday 12:00-16:00.",
    "link": "https://ebookwoman.com/",
    "location": "5501 North Lamar Boulevard, Suite A-105, Austin, TX 78751, United States",
    "lat": 30.3275,
    "lng": -97.7273,
    "vibe": "old-school feminist bookselling with a live Austin poetry pulse",
    "what": "Feminist and queer fiction, poetry, politics, spirituality and children’s books plus readings and groups.",
    "best": "A weekday morning suits deep browsing; second-Thursday poetry is the choice for local voices and community.",
    "online": "The official catalogue supports ordering and event titles; availability and delivery resolve at checkout.",
    "payment": "Web methods appear in secure checkout; call for phone orders or a book needed for same-day pickup.",
    "privacy": "LGBTQ-owned, all-ages and openly progressive, with hybrid events extending access beyond the room.",
    "hours_source": "https://ebookwoman.com/",
    "sources": [
      "https://ebookwoman.com/"
    ]
  },
  {
    "name": "TOLA. Fire Island Pines",
    "city": "fireisland",
    "type": "store",
    "description": "The Pines harbour boutique translates island life into swimwear, jewellery, home objects and locally branded pieces, including the Boys of Fire Island collection that helps fund island nonprofits.",
    "hours": "Seasonal spring-autumn opening; daily hours shift through the Fire Island season.",
    "link": "https://tolanewyork.com/",
    "location": "Main Harbor, Fire Island Pines, NY 11782, United States",
    "lat": 40.6644,
    "lng": -73.0694,
    "vibe": "salt-air treasure hunt at the social centre of the Pines",
    "what": "Swimwear, apparel, jewellery, gifts, home accessories and exclusive Fire Island Pines merchandise.",
    "best": "Stop just after the ferry before popular sizes disappear; confirm hours in shoulder season or rough weather.",
    "online": "Digital gift cards work across locations, but much Pines-specific stock is best discovered on the island.",
    "payment": "The harbour register controls seasonal methods; confirm gift-card use and returns before leaving by ferry.",
    "privacy": "A warm local fixture inside a historic queer enclave; part of partner merchandise proceeds supports nonprofits.",
    "hours_source": "https://tolanewyork.com/",
    "sources": [
      "https://tolanewyork.com/"
    ]
  },
  {
    "name": "FIG - Fire Island Goods",
    "city": "fireisland",
    "type": "store",
    "description": "Cherry Grove’s seasonal design shop turns mermaids, beach nostalgia and unapologetic Pride into house-label tees, swim pieces and accessories that feel born on the boardwalk.",
    "hours": "Seasonal May-October; daily hours vary with the ferry season and weather.",
    "link": "https://www.fireislandgoods.com/",
    "location": "160 Main Walk, Cherry Grove, NY 11782, United States",
    "lat": 40.6613,
    "lng": -73.0908,
    "vibe": "playful Grove iconography, beach colour and collectable queer-island style",
    "what": "Original FIG apparel, Pride wear, swimwear, beach accessories and Cherry Grove graphic designs.",
    "best": "Shop early in a weekend for size choice; ferry traffic, weather and season edges can alter opening times.",
    "online": "The official site sells signature designs online, useful after the island shop closes for winter.",
    "payment": "Online checkout sets cards and shipping; ask in store about exchanges that would otherwise require another ferry.",
    "privacy": "Located in the historic LGBTQ+ community of Cherry Grove; the boardwalk route is car-free and seasonal.",
    "hours_source": "https://www.fireislandgoods.com/",
    "sources": [
      "https://www.fireislandgoods.com/"
    ]
  }
]
  $qa_usa_stores_batch_04$) s(
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
from (values ('boston'),('dallas'),('denver'),('austin'),('fireisland')) v(city_slug)
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select city,name,type,hours,location,venue_intel->>'research_status' as research_status
from public.places
where public.qa_city_slug(city) in ('boston','dallas','denver','austin','fireisland')
  and type='store'
order by city,name;
