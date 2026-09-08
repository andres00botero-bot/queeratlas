-- Queer Atlas Venue Intelligence: London generic-copy repair.
-- Research rechecked 2026-08-30. Replaces generic text for exactly 29 records.
-- Vault 139 (ID 161) and the two newer hand-written profiles are intentionally untouched.

begin;

with researched(id, profile) as (
  values
  (113, $qa${
    "queue_wait":"Heaven alternates early live concerts with late club events, so use the ticket's actual door time. G-A-Y Saturday runs can queue heavily after midnight; bring physical photo ID and arrive before the last-entry window rather than treating the venue as open all day.",
    "best_nights":"Choose the production: a ticketed concert offers the multi-level live venue, while G-A-Y Saturday is the large pop-and-drag LGBTQ+ club version. The official calendar extends into 2027; weekday alone does not predict the experience.",
    "crowd_mix":"Concert audiences follow the artist and may be fully mixed; G-A-Y nights bring young LGBTQ+ Londoners, gay men, lesbians, students and international visitors. Never infer the crowd from Heaven's name without checking the event.",
    "dress_code":"Concert clothing or expressive pop-club wear both work, but the event and age rule control entry. Carry valid physical ID, avoid large bags and dress for a searched, high-capacity railway-arch venue rather than a casual Soho pub.",
    "staff_inclusivity":"Heaven has named general, bar and production managers plus security and stewards, providing clear escalation routes. Its long LGBTQ+ history is real, but door or conduct issues should still be reported to the duty manager rather than excused as crowd pressure.",
    "source_urls":["https://g-a-yandheaven.co.uk/","https://g-a-yandheaven.co.uk/contact/","https://g-a-yandheaven.co.uk/wp-content/uploads/2026/02/Heaven-Tech-Spec-Jan-2026.pdf"]
  }$qa$::jsonb),
  (114, $qa${
    "queue_wait":"Eagle is at 349 Kennington Lane, not Goswell Road. Thursday is free and low-pressure; ticketed Friday/Saturday nights and Horse Meat Disco Sunday peak later. Current events publish last entry around 00:30 or 02:30, so check the selected listing.",
    "best_nights":"Thursday is a social late bar; Friday rotates Bear Bash and other parties; Saturday carries pop or 1980s formats; Sunday is the long-running Horse Meat Disco. Pick by music and community rather than assuming every night is leather cruising.",
    "crowd_mix":"Gay men remain central, with bears, older regulars, disco dancers and wider LGBTQ+ groups shifting by event. Horse Meat Disco and 80:20 are deliberately broad queer dance nights; this is an independent gay bar/club, not a men-only cruise club.",
    "dress_code":"Denim, leather, bear-night looks, retro styling and ordinary dancewear all appear according to the event. No permanent fetish code applies. Bring physical ID and follow a named party's theme without converting Eagle's leather history into a rule.",
    "staff_inclusivity":"The operator explicitly describes evolution from a leather/fetish haven into a space for all LGBTQ+ people and allies. Door, bar and garden staff are present; report conduct to the duty manager and use the published event contact for advance needs.",
    "source_urls":["https://www.eaglelondon.com/about-us","https://www.eaglelondon.com/opening-hours","https://www.eaglelondon.com/our-nights"]
  }$qa$::jsonb),
  (153, $qa${
    "queue_wait":"Dalston Superstore is free earlier, with typical £7–10 club entry from about 22:00. Friday/Saturday capacity is only 230 and includes consent-based bag/body searches; arriving before club conversion avoids the tightest door and basement pressure.",
    "best_nights":"Daytime weekend table service, weekday drag/community formats and Friday/Saturday two-DJ club nights are different products. Use the live programme; choose a trans+, QTBIPOC or promoter-specific date when that community focus matters.",
    "crowd_mix":"East London queer and trans regulars, QTBIPOC creatives, drag audiences, brunch diners and late clubbers share the venue. Upstairs remains broader and conversational; the stairs-only basement becomes younger, denser and promoter-led.",
    "dress_code":"Expressive Hackney casual, drag, clubwear and everyday brunch clothing are all valid. Security should offer a guard of the guest's chosen gender for body searches. Avoid bulky bags and prepare for smoke, strobe and a hot basement.",
    "staff_inclusivity":"This venue documents unusually specific practice: Friday/Saturday welfare workers in pink, non-judgmental drug and anxiety support, gender-choice searches, PA/concession entry and neurodiversity contact. The material limitation is no accessible toilet or basement lift.",
    "source_urls":["https://dalstonsuperstore.com/accessibility/","https://dalstonsuperstore.com/contact/"]
  }$qa$::jsonb),
  (154, $qa${
    "queue_wait":"Fabric uses mandatory ID scanning, metal-detector and bag/body searches. Ticket entry slots and last entry one hour before finish are enforced; major lineups can still wait at capacity. Fabricfirst gives priority, not guaranteed instant admission.",
    "best_nights":"Follow the room and lineup: FABRICLIVE, techno and house programmes draw different specialists, and marathon events require a separate arrival plan. A strong Friday booking can be more relevant than Saturday; read the ticket's exact entry slot.",
    "crowd_mix":"Dedicated electronic-music listeners, London ravers and international club tourists form a mixed music-first crowd. Some queer events are explicit, but the regular venue is not a gay club; audience safety comes from policy, not identity exclusivity.",
    "dress_code":"The club encourages self-expression but excludes business suits, glow wear and flags from the dance floor. Comfortable dance shoes and minimal bags are practical. Camera stickers implement a zero-photo rule; use phones only for logistics and safety.",
    "staff_inclusivity":"A welfare WhatsApp, trained staff, medic team, free water, drink lids, quiet seating and PA tickets provide concrete support. Wheelchair ramps exist, but the lift can fail; contact accessibility staff before travel and report harassment immediately.",
    "source_urls":["https://www.fabriclondon.com/faq","https://www.fabriclondon.com/posts/no-photo-policy","https://www.fabriclondon.com/info/privacy-policy"]
  }$qa$::jsonb),
  (155, $qa${
    "queue_wait":"FOLD is a remote Canning Town destination with physical-ID checks and event-specific tickets. UNFOLD is 21+, door-sale only, lineup-unannounced and explicitly discretionary; arrive near the afternoon opening, but understand that waiting does not guarantee entry.",
    "best_nights":"Choose by promoter. UNFOLD is the queer-centred Sunday community session; a Friday extended techno booking may be music-first and mixed. Check hours, age and last entry for every event because the warehouse has no useful generic weekly schedule.",
    "crowd_mix":"UNFOLD centres queer and trans electronic communities, serious dancers and regulars who understand its door culture. Other events attract broader techno audiences. International visitors are visible, but connection to the programme matters more than tourist status.",
    "dress_code":"For UNFOLD, 'dress to sweat' means intentional, practical dancewear rather than costume; casual groups who cannot explain the night may struggle at the door. Other promoters set their own brief. Physical ID is mandatory and cameras stay covered.",
    "staff_inclusivity":"FOLD publishes zero tolerance for racism, sexism, homophobia, transphobia and ableism, and UNFOLD's entrance team protects a community-specific room. That policy coexists with a selective door; guests should ask for welfare or management when inside.",
    "source_urls":["https://www.fold.london/tickets/unfold-ci","https://www.fold.london/","https://www.fold.london/contact"]
  }$qa$::jsonb),
  (156, $qa${
    "queue_wait":"Circa Soho now operates at 62 Frith Street, not the database's Gerrard Street address. The compact room is bookable for tables and becomes standing-room social later; reserve for a group and arrive before the Friday/Saturday DJ peak.",
    "best_nights":"Use the current event programme for DJs and special parties; early evening suits cocktails and conversation, while late Friday/Saturday produces the densest gay bar experience. Circa Embankment is a separate venue and must not be confused with Soho.",
    "crowd_mix":"Gay men, mixed LGBTQ+ friendship groups, Soho workers and international visitors form a polished central crowd. It can skew younger and male later, while early tables are broader; the venue describes itself as community-led and inclusive.",
    "dress_code":"Smart casual, fitted nightlife clothing and expressive queer style suit the polished bar, but no formal code is published. Bring ID, keep bags small and dress for a busy standing room rather than an all-night warehouse floor.",
    "staff_inclusivity":"Circa states that inclusivity is central and provides direct booking/event contact at the current Frith Street site. For access, identity or service needs, contact that team before arrival and escalate an incident to the floor manager.",
    "source_urls":["https://www.circasoho.com/about","https://www.circasoho.com/contact"]
  }$qa$::jsonb),
  (157, $qa${
    "queue_wait":"Ku's flagship at 30 Lisle Street opens daily from 13:00 and combines terrace, bar and downstairs Klub. Terrace capacity tightens before its 22:45 close and drag/DJ sessions fill later; book groups and do not rely on a late walk-in.",
    "best_nights":"Monday karaoke, Tuesday Ruby, cabaret, Thursday Vibe and weekend DJ sessions each create a different room. Start on the terrace for conversation, then use the named programme when you want drag or Klub dancing.",
    "crowd_mix":"Gay men are highly visible alongside mixed LGBTQ+ groups, tourists, after-work visitors and drag audiences. The Leicester Square location creates more first-time and international traffic than a neighbourhood queer pub.",
    "dress_code":"Central-London smart casual, colourful partywear and drag-show looks all fit; there is no published formal code. Dress for a terrace-to-basement transition, carry ID and use footwear suitable for stairs and dancing.",
    "staff_inclusivity":"Ku Group runs multiple LGBTQ+ venues and publishes direct booking and head-office contacts. Its queer programming is concrete, but specific access or search needs should be confirmed with the Lisle Street team rather than inferred from the brand.",
    "source_urls":["https://ku-bar.co.uk/ku-bar/","https://ku-bar.co.uk/contact-us/"]
  }$qa$::jsonb),
  (158, $qa${
    "queue_wait":"G-A-Y Bar is closed. Its Old Compton Street home shut in October 2025 and reopened in June 2026 as COVEN: Headquarters under a different operator. Do not send visitors to Newport Court or use Heaven's schedule as evidence that this bar still exists.",
    "best_nights":"There is no current night to recommend for G-A-Y Bar. Use the separate Heaven record for active G-A-Y club programming or create a properly researched COVEN record; preserving an imaginary schedule would mislead visitors and duplicate a changed venue.",
    "crowd_mix":"This closed record has no present audience. The former bar served a young pop-oriented LGBTQ+ Soho crowd, but that history must not be assigned to COVEN's current five-floor queer cultural and nightlife operation.",
    "dress_code":"No current dress policy belongs to G-A-Y Bar. Consult Heaven for its events or COVEN for the replacement venue's door brief. Old wristband and cheap-entry advice is obsolete.",
    "staff_inclusivity":"There is no active G-A-Y Bar team to assess. Service or access information must come from Heaven or COVEN, each with a distinct operator and reporting route. Deindexing prevents a historical brand from masquerading as current inclusion evidence.",
    "source_urls":["https://www.sohoestates.co.uk/news-1/statement-on-the-closure-of-g-a-y-bar","https://pressreleases.responsesource.com/newsroom/COVEN/release/107352/a-new-queer-sanctuary-rises-on-old-compton-street-as/"]
  }$qa$::jsonb),
  (160, $qa${
    "queue_wait":"Pleasuredrome is walk-in 24/7 with reception rather than club ticketing. Under-30 pricing requires ID; lockers and entry can slow after nearby bars close. There is no re-entry, so store luggage only if reception confirms space and bring what you need.",
    "best_nights":"After-work, post-club and weekend periods are social peaks; daytime is calmer for spa facilities or a first visit. The venue never closes, so choose intensity deliberately rather than assuming the busiest hour is automatically best.",
    "crowd_mix":"Men over 18 of varied ages, bodies and backgrounds are explicitly welcomed; tourists mix with London regulars because Waterloo is one minute away. This is a men-only adult spa, not an all-gender LGBTQ+ wellness venue.",
    "dress_code":"Inside, towels, swimwear or nudity are normal; outdoor clothes and shoes are excluded. Bring flip-flops or buy them, use the two supplied towels and respect consent. A private room or pod never changes another guest's boundaries.",
    "staff_inclusivity":"The FAQ documents respectful-behaviour rules, step-free access, an accessible toilet and a staff-operated wheelchair ramp. Advance assistance can be arranged. Reception is the route for consent, safety or access issues; illegal drugs have zero tolerance.",
    "source_urls":["https://www.pleasuredrome.com/faqs","https://www.pleasuredrome.com/"]
  }$qa$::jsonb),
  (162, $qa${
    "queue_wait":"This row cannot support a visit: its 10 Old Bailey address is unrelated to the historic Vauxhall after-hours club, while the linked website is an obsolete shell. Do not rely on the listed weekly times or travel until an operator, address and dated event are verified.",
    "best_nights":"No current recurring night is sufficiently verified. Old listings for Vauxhall after-hours sessions and unrelated Soho Union Club results must not be combined. Keep the record deindexed until a primary 2026 programme establishes a real operation.",
    "crowd_mix":"There is no responsible current crowd claim. Historic Vauxhall after-hours audiences included gay and mixed electronic clubbers, but an unverified operator cannot inherit that community or safety reputation.",
    "dress_code":"No current door brief is available. Ignore archived advice and never present at the City address in clubwear expecting a Vauxhall venue. A future promoter must supply age, ID, search and dress rules before reactivation.",
    "staff_inclusivity":"No current welfare, security or management route could be verified, so the database cannot promise inclusion. This absence is operational evidence: deindex the listing rather than convert historic queer attendance into a present staff claim.",
    "source_urls":["https://www.clubunion.co.uk/","https://www.gov.uk/find-licences/premises-licence"]
  }$qa$::jsonb),
  (1109, $qa${
    "queue_wait":"Sailors uses reception entry, closes at 23:00 and stops admission at 21:00. Monday's Big and Cuddly format and promoted sessions can pressure lockers; Tuesday–Friday early bird ends around 13:00/13:30 and limits the stay to eight hours.",
    "best_nights":"Monday explicitly centres bigger men; other special events are published separately. A weekday early arrival is best for price and a calmer first orientation, while weekend afternoons bring more social traffic before the hard last-entry cutoff.",
    "crowd_mix":"Gay and bisexual men, East London locals, older regulars, bears and visitors outside the Soho circuit form the core. Named events adjust age and body-type balance; this is a men-focused adult sauna, not a general spa.",
    "dress_code":"Use the supplied locker and follow towel/nudity rules explained at reception. Bring flip-flops and physical ID when using an age offer. Keep phones and street clothes out of intimate areas and treat every interaction as consent-dependent.",
    "staff_inclusivity":"The official site provides current price, hours, phone and service-update fields, giving reception a clear accountability route. Inclusion is men-focused rather than all-gender; ask staff about access, trans admission or assistance before paying if relevant.",
    "source_urls":["https://sailorssauna.com/entry-price-hours.html","https://sailorssauna.com/"]
  }$qa$::jsonb),
  (1110, $qa${
    "queue_wait":"Rupert Street is a reservable Soho bar, not a club door. Friday/Saturday standing traffic and the pavement-facing room make service slower after work; book a table for groups or arrive before the evening DJ crowd, especially before midnight close.",
    "best_nights":"Weekday happy-hour conversation and weekend DJ energy serve different visits. Choose an announced event when programming matters; Sunday closes at 22:30 and is better for an early social drink than a late party.",
    "crowd_mix":"Gay men, broader LGBTQ+ groups, Soho workers, dates and international visitors share a polished but accessible bar. Early terrace tables are mixed and conversational; late weekend density skews more male and nightlife-led.",
    "dress_code":"Smart casual, work-to-drinks clothing and expressive Soho style all fit without a formal door code. Dress for a compact standing bar and London weather if using outside space; large bags make the busy room harder to navigate.",
    "staff_inclusivity":"The bar is an established LGBTQ+ venue with direct email, telephone, booking and feedback routes at 50 Rupert Street. Bring a conduct or service problem to the floor manager; contact the team ahead for seating or access requirements.",
    "source_urls":["https://www.rupert-street.com/london/opening-times","https://www.rupert-street.com/london/contact-us"]
  }$qa$::jsonb),
  (1111, $qa${
    "queue_wait":"CGH Spa is walk-in from noon, with lower prices before 14:00 and after 20:00 on eligible days. Wednesday's free under-25 offer requires physical ID and can increase reception and locker pressure; private-event early closures are published by date.",
    "best_nights":"Wednesday serves the under-25 offer; Saturday stays open until 02:00; weekday afternoons are calmer and cheaper. Check the events page for themed sessions and early closures instead of applying one crowd prediction to every visit.",
    "crowd_mix":"Adult gay and bisexual men, central-London workers, tourists and age-offer visitors use this men-only West End sauna. Wednesday can skew younger; ordinary daytime sessions are more mixed in age and less nightlife-driven.",
    "dress_code":"Reception supplies the spa entry framework; use towels and suitable wet-area footwear, secure belongings and keep phones away from intimate spaces. A massage is professional treatment and must not be described as a sexual service.",
    "staff_inclusivity":"Current operator pages publish pricing, qualified massage booking and direct reception contact. Staff can handle consent, health and facility issues, but no detailed trans or mobility policy is published; confirm those needs before purchase.",
    "source_urls":["https://www.cghspa.uk/events-rates-times/","https://www.cghspa.uk/contact/"]
  }$qa$::jsonb),
  (1112, $qa${
    "queue_wait":"Halfway to Heaven is a compact pub with free recurring cabaret, so the real constraint is sightline and standing capacity. Saturday acts begin around 16:30 and Friday shows around 20:30; arrive before the first performer if seeing the stage matters.",
    "best_nights":"Monday competition, Tuesday drag, Wednesday cabaret, Thursday karaoke, Friday multi-act shows, Saturday all-day cabaret and Sunday Sips are distinct formats. Use the current performer list rather than defaulting to Saturday.",
    "crowd_mix":"Drag regulars, gay men, mixed LGBTQ+ groups, theatre visitors and older cabaret fans share a broad central audience. Earlier shows support conversation and varied ages; late Friday/Saturday becomes denser and louder.",
    "dress_code":"Everyday pubwear, work clothes and full drag are equally at home; no formal code is published. Choose comfort for standing downstairs and carry ID. Elaborate looks should account for the small room and stairs.",
    "staff_inclusivity":"A seven-day queer cabaret roster gives hosts and bar staff visible responsibility for the room. Performer or audience conduct issues should go to the host or duty manager; guests needing seating should contact the venue before a busy show.",
    "source_urls":["https://www.halfway2heaven.net/london/events","https://www.halfway2heaven.net/london/events/saturday-2026?d=26-09-2026"]
  }$qa$::jsonb),
  (1113, $qa${
    "queue_wait":"Locker Room opens 11:00–23:00 daily and uses reception, not tickets. The £10 Monday/Tuesday after-18:00 and under-25 rates can create a sharper local peak; weekday arrival before 13:00 is cheaper and usually easier for lockers.",
    "best_nights":"Monday/Tuesday evening discounts bring value and more movement; daytime suits a quieter first visit and use of sauna, steam and lounge. There is no verified club-style weekly theme, so choose by price and desired density.",
    "crowd_mix":"Adult gay and bisexual men, Kennington/Vauxhall locals, older regulars and price-sensitive younger visitors form a neighbourhood mix. It is smaller and calmer than the 24-hour Soho options, not an all-gender community sauna.",
    "dress_code":"Use towel or venue-approved nudity in wet and relaxation areas, bring flip-flops and lock away street items. Free tea and coffee belong in the lounge. Physical ID is necessary for age pricing and consent remains mandatory everywhere.",
    "staff_inclusivity":"The operator publishes exact pricing, facilities, phone and address, making reception the direct route for safety or service concerns. No detailed accessibility or trans-admission policy is published; confirm either with staff before travelling.",
    "source_urls":["https://lockerroomsauna.co.uk/"]
  }$qa$::jsonb),
  (1115, $qa${
    "queue_wait":"Sweatbox is open 24/7 and walk-in, but after-work, pub closing and weekends are its admitted peaks. App passes allow repeat visits but cap each stay at eight hours with a two-hour gap; door purchases are single entry and the business is card-only.",
    "best_nights":"Hard Up Monday and Thursday offer free entry to eligible under-25 guests and change the age mix. Quieter daytime supports gym and facilities; post-club hours are busiest. Daily jacuzzi and wet-area cleaning temporarily closes parts of the venue.",
    "crowd_mix":"Adult men, Soho locals, tourists, gym users and post-bar visitors mix across three floors. Discount periods skew younger; other sessions span ages and body types. It is explicitly male-only, not an all-gender LGBTQ+ sauna.",
    "dress_code":"The gym is clothing-optional but requires suitable footwear; elsewhere towels or nudity follow house rules. Put needed items in the smaller lockbox because returning to the main locker is restricted, and keep cameras away from private areas.",
    "staff_inclusivity":"Weekly 56 Dean Street sexual-health checks, free condoms/lube and published respect rules are concrete support. Management can remove disrespectful guests. Ask reception before paying about trans admission or mobility because detailed policies are absent.",
    "source_urls":["https://www.sweatboxsoho.com/faq/","https://www.sweatboxsoho.com/membership/"]
  }$qa$::jsonb),
  (1116, $qa${
    "queue_wait":"Two Brewers combines front bar, cabaret and late dance space; Friday/Saturday entry tightens after shows and Clapham arrivals converge. Use advance tickets when offered, arrive before the headline act and request an access arrangement before peak hours.",
    "best_nights":"Choose the actual drag, cabaret, karaoke or club programme. Early evening supports conversation and show viewing; Friday/Saturday until 04:00 is the full dance version, while Sunday offers a shorter community finish.",
    "crowd_mix":"South London gay men, lesbians, trans and non-binary guests, drag fans, young first-timers and long-standing Clapham regulars overlap. Show audiences are broad; the late dance floor often skews younger.",
    "dress_code":"Casual pubwear, sequins, drag and practical club clothing all fit without a permanent code. Bring physical ID and choose shoes for standing and dancing. Event themes may invite stronger looks but ordinary clothing is not exclusionary.",
    "staff_inclusivity":"The venue has served Clapham's LGBTQ+ community since 1981 and offers identifiable performers, door staff and managers. Current community reports note an accessible toilet; confirm step-free route, seating or PA arrangements directly before a busy event.",
    "source_urls":["https://www.the2brewers.com/","https://www.visitlondon.com/things-to-do/place/45455977-two-brewers"]
  }$qa$::jsonb),
  (1117, $qa${
    "queue_wait":"Comptons is walk-in from noon, but Friday/Saturday and major Soho dates fill both floors and the pavement frontage. Book for sports or a group, or arrive before the evening DJ; it is 18+ and guests who look under 21 need ID.",
    "best_nights":"Monday Mike Menace, Wednesday DJ Barbara, Thursday Thump n Groove, Friday throwbacks and Saturday Haus Down are current recurring choices. Rugby screenings offer a distinct queer sports-pub audience; match the visit to the programme.",
    "crowd_mix":"Gay men and long-time Soho regulars remain prominent, joined by LGBTQ+ tourists, sports fans and mixed groups. Daytime has traditional pub conversation; weekend DJ nights become standing, louder and more male-skewed.",
    "dress_code":"Pints-and-pub casual, workwear and polished Soho nightlife clothing all fit; there is no fashion gate. Physical ID matters more than outfit. Dress for packed standing space and use a smaller bag on event nights.",
    "staff_inclusivity":"Comptons explicitly presents a safe, inclusive LGBTQ+ setting for rugby and daily trade, with booking, email and feedback routes. Bring harassment to bar staff or the duty manager; the operator's claim creates an accountable standard, not immunity from problems.",
    "source_urls":["https://www.comptonsofsoho.co.uk/comptons","https://www.comptonsofsoho.co.uk/comptons/events","https://www.comptonsofsoho.co.uk/comptons/watch-six-nations"]
  }$qa$::jsonb),
  (1118, $qa${
    "queue_wait":"RVT is almost entirely programme-led. Cabaret can mix seats and standing; Friday–Sunday club formats are standing only and ticketed dates sell out. Buy the exact event, arrive at listed doors and request reserved seating or a PA ticket in advance.",
    "best_nights":"Thursday performance, Friday club, Saturday promoter nights and Sunday cabaret produce radically different rooms. BeefMince, Push The Button, panto and a Sunday D.E. Experience are not interchangeable; the official calendar is the decision tool.",
    "crowd_mix":"The whole LGBTQ+ community is explicitly served: gay men, lesbians, trans and non-binary people, cabaret loyalists, club dancers, artists and visitors shift by production. RVT is historic but still locally programmed.",
    "dress_code":"Follow the named party; ordinary theatre wear, drag, fetish-informed looks and sweat-ready club clothing can all be correct on different dates. There is no venue-wide costume rule. Expect haze, loud sound, flashes and standing.",
    "staff_inclusivity":"RVT names its operations and programme managers, offers limited free assistant tickets, a small wheelchair ramp and advance seating help. Toilets are step-free but not wheelchair accessible; contact Dave for access and report conduct to the duty team.",
    "source_urls":["https://www.vauxhalltavern.com/visit-us/","https://www.vauxhalltavern.com/whats-on/","https://www.vauxhalltavern.com/about/"]
  }$qa$::jsonb),
  (1119, $qa${
    "queue_wait":"The Yard is a courtyard-and-loft bar where weather and table occupancy matter more than club selection. Reserve for dates or groups and arrive before late Friday/Saturday density; the tucked Rupert Street entrance can be easy to miss on a first visit.",
    "best_nights":"An early courtyard drink is the distinctive product; weekend evenings become louder and flirtier without turning into a large dance club. Use current social posts for DJs or special events and choose another venue for after-hours dancing.",
    "crowd_mix":"Gay men, dates, small LGBTQ+ groups, Soho regulars and international visitors form a social male-skewing crowd. Daylight courtyard trade is broader and calmer; late weekend standing traffic is more nightlife-focused.",
    "dress_code":"Polished casual, date-night clothing and expressive Soho looks fit, with no published formal code. Dress for the semi-outdoor courtyard and stairs; a coat or umbrella matters more than fashionable footwear in bad weather.",
    "staff_inclusivity":"The Yard operates as an established LGBTQ+ social venue with table booking and direct contact. Ask hosts about seating or access before entering the loft, and report unwanted conduct to bar staff or the manager rather than relying on the intimate layout.",
    "source_urls":["https://www.yardbar.co.uk/","https://www.yardbar.co.uk/contact"]
  }$qa$::jsonb),
  (1120, $qa${
    "queue_wait":"Admiral Duncan is a small 18+ pub where the issue is standing capacity and stage sightline. Saturday cabaret begins from 17:00 and Soho crowds build later; arrive before the first act, carry physical ID and expect little personal space at peak.",
    "best_nights":"Monday karaoke and cabaret Tuesday–Sunday make performer choice useful. Saturday offers several acts and maximum energy; a weekday afternoon preserves the local-pub character and makes conversation with regulars easier.",
    "crowd_mix":"Gay men, drag regulars, older Soho locals, tourists and mixed LGBTQ+ groups share a historically important small pub. Day trade spans ages; cabaret peaks become louder, broader and more visitor-heavy.",
    "dress_code":"Everyday pub clothes, workwear and cabaret sparkle all fit; there is no formal dress code. Carry accepted 18+ ID and keep bags minimal because the single narrow room becomes extremely compressed.",
    "staff_inclusivity":"The venue publishes a welcoming all-audiences message, regular LGBTQ+ entertainment and direct staff contact. Its history makes respectful handling especially important; service or harassment concerns should go immediately to the duty manager.",
    "source_urls":["https://www.admiral-duncan.co.uk/soho","https://www.admiral-duncan.co.uk/soho/events"]
  }$qa$::jsonb),
  (1852, $qa${
    "queue_wait":"Z Soho has 24-hour reception with check-in from 15:00. The predictable wait is afternoon room turnover, not nightlife; leave bags with reception if permitted and confirm an accessible room rather than assuming every compact Georgian conversion room works.",
    "best_nights":"Stay for immediate Theatreland, Chinatown and Soho LGBTQ+ nightlife access, not hotel programming. Weekends maximise nearby venues but street noise and rates; weekdays better suit theatre and a short compact-room city stay.",
    "crowd_mix":"West End tourists, couples, solo travellers, theatre visitors and LGBTQ+ nightlife guests form a mainstream hotel mix. The operator calls Soho the epicentre of London's LGBT scene, but the property is not a queer social venue.",
    "dress_code":"No hotel dress code applies. Travel clothes are fine; carry separate outfits and physical ID for nearby bars. Rooms can be only 8–12 square metres and some have no window, so pack compactly and select the room type knowingly.",
    "staff_inclusivity":"The hotel offers a documented accessible queen room with specialist shower, grab rails and turning circle, plus direct reception contact. No current source supports calling it queer-exclusive; put chosen name, partner and access needs on the booking.",
    "source_urls":["https://www.thezhotels.com/hotels/soho/","https://www.thezhotels.com/frequently-asked-questions/"]
  }$qa$::jsonb),
  (1853, $qa${
    "queue_wait":"STG Oxford Street is a large central hotel, so peak check-in and tour groups create the relevant queue. Bring booking ID and payment card, confirm luggage storage and use the current STG operator—not old St Giles branding—for arrival instructions.",
    "best_nights":"Use the hotel for Tottenham Court Road, West End and Soho access rather than recurring queer events. Friday/Saturday favour nightlife but raise street and lobby pressure; weekdays work better for shopping, theatre and business.",
    "crowd_mix":"International tourists, families, groups, business guests and LGBTQ+ city-break visitors create a large mainstream hotel audience. Its location near Soho is useful, but an online friendly label does not make the lobby community programming.",
    "dress_code":"There is no reception dress rule. Ordinary travel clothing is appropriate; restaurants or outside clubs may ask for smarter clothing and photo ID. Pack for a busy central property rather than a boutique queer hotel.",
    "staff_inclusivity":"A staffed hotel operation provides formal reception and management escalation, but no current property-specific trans or queer training statement was verified. Record chosen name, couple setup and exact access feature in writing before arrival.",
    "source_urls":["https://stghotel.com/","https://stghotel.com/contact-us/"]
  }$qa$::jsonb),
  (1854, $qa${
    "queue_wait":"Generator has 24-hour reception and substantial dorm turnover. Afternoon check-in can bunch groups; prepare physical ID, booking details and a card, and use luggage storage for early arrival. Bar entry and hostel room access are separate controls.",
    "best_nights":"Choose it for organised social events and Shuffleboard Bar, open daily from 21:00, or as a King's Cross/Bloomsbury base. A programmed hostel event helps solo travellers; it is not a substitute for London's dedicated queer nightlife.",
    "crowd_mix":"International backpackers, school and tour groups, solo travellers, students, private-room guests and LGBTQ+ visitors form a young mainstream hostel mix. Female-only dorms exist, but no permanent queer-only room is advertised.",
    "dress_code":"Casual hostel, bar and sightseeing clothes fit. Bring shower shoes and a lock as directed, and keep nightlife outfits separate. Only registered guests should enter sleeping areas; a social bar does not relax dorm consent or security.",
    "staff_inclusivity":"The property documents wheelchair access, side-entry lift, accessible rooms/toilets, roll-in showers, vibrating alarms, tactile signs and trained assistance staff. That is concrete inclusion infrastructure; confirm the needed feature before booking.",
    "source_urls":["https://staygenerator.com/hostels/london","https://staygenerator.com/accessibility/london"]
  }$qa$::jsonb),
  (1855, $qa${
    "queue_wait":"Park Plaza Riverbank has 645 rooms, so 15:00 check-in, conferences and family turnover can pressure reception and lifts. Book an accessible room explicitly and confirm parking or luggage arrangements; this is managed hotel arrival, not a club line.",
    "best_nights":"Stay for Thames views, pool, fitness centre, Westminster and a practical Vauxhall-adjacent base—not hotel queer programming. Weekends favour sightseeing and nightlife; business dates and major events can fill the large property.",
    "crowd_mix":"Families, business travellers, tour groups, couples and LGBTQ+ visitors share a large upscale mainstream hotel. Proximity to RVT and Eagle is useful, but the hotel should not be represented as a dedicated queer community venue.",
    "dress_code":"No reception dress code applies. Swimwear belongs in the pool, smart casual suits dining, and ordinary travel wear is valid. External Vauxhall venues set their own ID, ticket and outfit rules.",
    "staff_inclusivity":"Accessible rooms and formal hotel management channels are documented, but no property-specific queer certification was verified. Put chosen name, partner treatment and the exact mobility feature on the reservation and escalate failures at reception.",
    "source_urls":["https://www.radissonhotels.com/en-us/hotels/park-plaza-london-riverbank/rooms","https://www.radissonhotels.com/en-us/hotels/park-plaza-london-riverbank"]
  }$qa$::jsonb),
  (1856, $qa${
    "queue_wait":"Balans No.60 accepts table bookings and serves from 09:00, with Thursday–Saturday trading to 04:30. Brunch, pre-theatre dinner and post-club food create different peaks; reserve normal meals and expect a wait when Soho venues empty overnight.",
    "best_nights":"Daytime brunch is relaxed; Thursday–Saturday late service is the distinctive queer-nightlife refuelling role; Sunday ends at 00:30. Choose by food and timing rather than treating the restaurant as a dance party.",
    "crowd_mix":"Soho residents, LGBTQ+ groups, dates, theatre audiences, hospitality workers and post-club diners share a broad restaurant crowd. Queer history and Old Compton Street context are strong, but service remains open to the general public.",
    "dress_code":"Everyday brunch clothes, theatre smart casual and full post-club looks all fit. There is no door-fashion rule; late visitors still need respectful restaurant behaviour. Bookable seating makes elaborate outfits easier than in a packed bar.",
    "staff_inclusivity":"Three decades serving Old Compton Street and very late queer nightlife provide venue-specific familiarity, while bookings and direct email create accountability. Ask the floor manager about harassment, dietary needs or service instead of relying on a generic safe-space claim.",
    "source_urls":["https://balans.co.uk/locations/soho-no-60/","https://balans.co.uk/menus/soho-no-60/"]
  }$qa$::jsonb),
  (1857, $qa${
    "queue_wait":"Common Press Shoreditch is a bookshop/café with event capacity rather than a club queue. Browse during Tuesday–Sunday 11:00–18:30 hours; reserve or arrive early for readings, trans+ socials, launches and evening events because the community room is finite.",
    "best_nights":"Choose the actual reading, workshop, zine launch, book club or identity-specific social. Ordinary daytime rewards quiet browsing and coffee; an evening programme is more social but must not be invented from the retail schedule.",
    "crowd_mix":"Queer and trans readers, Black and other marginalised writers, disabled activists, students, families, artists and allies share an intentionally intersectional audience. Event topic changes who is centred; no purchase is needed to validate belonging.",
    "dress_code":"Everyday café clothes, expressive queer style and work/study wear are all appropriate. There is no door code. Bring only what fits around book displays and follow any mask, scent or access guidance for a specific community event.",
    "staff_inclusivity":"The not-for-profit shop explicitly curates gay, lesbian, trans, non-binary, Black, feminist and disability writing. Staff and event hosts have a clear community remit; direct concerns to the counter or named organiser and request access details in advance.",
    "source_urls":["https://www.commonpress.co.uk/the-common-press","https://www.commonpress.co.uk/events"]
  }$qa$::jsonb),
  (1858, $qa${
    "queue_wait":"The Gallery Café is a small cultural space open afternoons, with Wednesday MEETS as a separate ticketed evening programme. Ordinary browsing rarely queues; reserve the named talk and arrive before doors when a prominent queer artist or speaker appears.",
    "best_nights":"Wednesday MEETS is the strongest social and storytelling format; Tuesday, Thursday, Friday and Saturday afternoons allow longer gallery viewing. Sunday closes at 18:00. Choose by exhibition or guest, not generic weekend nightlife.",
    "crowd_mix":"Gay and queer photographers, collectors, artists, writers, Fitzrovia visitors and community talk audiences form a culture-led crowd. Gay male imagery is central, but the hub describes a broader queer art and culture mission.",
    "dress_code":"Gallery casual, creative workwear and polished talk-night style all fit. There is no admission fashion gate. Dress for close viewing and conversation rather than a dance floor, and respect artists' image and photography rules.",
    "staff_inclusivity":"The venue is explicitly built to promote queer art, culture and gay fine-art photography, with a weekly programme that gives the host direct responsibility. Ask café/gallery staff about access, language or conduct before the talk starts.",
    "source_urls":["https://boysboysboys.org/pages/boys-boys-boys-gallery-cafe-2","https://boysboysboys.org/pages/boys-boys-boys-meets"]
  }$qa$::jsonb),
  (1859, $qa${
    "queue_wait":"Village reopened after a June 2026 makeover at 81 Wardour Street. Early hours are relaxed, while DJs and bar-top performers create a compact late queue and slower bar service; book a table where available or arrive before the weekend peak.",
    "best_nights":"Use current karaoke, happy-hour and DJ listings. Afternoon/early evening suits conversation; Thursday/Friday until 03:00 and Saturday from 13:00 deliver the fullest party transition. Sunday ends at midnight.",
    "crowd_mix":"Gay men, mixed LGBTQ+ groups, Soho regulars, international tourists and go-go performance audiences share a central queer bar. It can skew male and younger late, while daytime remains broader and more conversational.",
    "dress_code":"Soho smart casual, colourful queer style and dance-ready outfits all work without a permanent code. Bring ID and keep bags small because the multi-level room compresses after dark; performer styling is invitation, not guest obligation.",
    "staff_inclusivity":"Village explicitly describes itself as a safe and inclusive LGBTQIA+ space and provides booking, email and telephone routes at the current address. Report harassment to bar or door staff and request seating or access information before arrival.",
    "source_urls":["https://www.villagesoho.co.uk/london-bar/contact","https://www.villagesoho.co.uk/london-bar/events"]
  }$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id=158 then jsonb_build_object('operating_status','closed_replaced_by_new_operator_deindexed')
       when id=162 then jsonb_build_object('operating_status','current_operation_and_location_unverified')
       when id in (154,155) then jsonb_build_object('operating_status','active_event_led_mainstream_venue')
       when id in (1852,1853,1854,1855) then jsonb_build_object('operating_status','active_mainstream_accommodation')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence',jsonb_build_object(
      'queue_wait',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'best_nights',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'crowd_mix',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'dress_code',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z'),
      'staff_inclusivity',jsonb_build_object('status','multi_source_summary','source_urls',profile->'source_urls','checked_at','2026-08-30T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_30',
    'updated_at','2026-08-30T00:00:00Z'
  ) as patch from researched
)
update public.places p set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch,updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Closed and unverifiable records must not remain indexed.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now()) where id in (158,162);

-- Operational and classification corrections verified during this review.
update public.places set hours='Event-specific; use the ticket for doors, age and last entry.',link='https://g-a-yandheaven.co.uk/',updated_at=timezone('utc',now()) where id=113;
update public.places set name='Eagle London',type='bar',location='349 Kennington Lane, London SE11 5QY, United Kingdom',hours='Thu 20:00-02:00; Fri-Sat 21:00-04:00; Sun 20:00-03:00; events may vary.',link='https://www.eaglelondon.com/',updated_at=timezone('utc',now()) where id=114;
update public.places set location='117 Kingsland High Street, London E8 2PB, United Kingdom',hours='Mon 17:00-00:00; Tue 16:00-00:00; Wed-Thu 16:00-02:30; Fri 16:00-04:00; Sat 12:00-04:00; Sun 12:00-01:00.',updated_at=timezone('utc',now()) where id=153;
update public.places set location='77A Charterhouse Street, London EC1M 6HJ, United Kingdom',hours='Event-specific; ticket entry slots and last entry are enforced.',link='https://www.fabriclondon.com/',updated_at=timezone('utc',now()) where id=154;
update public.places set location='Gillian House, Stephenson Street, London E16 4SA, United Kingdom',hours='Event-specific; verify age, doors, last entry and promoter policy.',updated_at=timezone('utc',now()) where id=155;
update public.places set location='62 Frith Street, London W1D 3JN, United Kingdom',hours='Event and booking-led; verify current daily hours before travel.',link='https://www.circasoho.com/',updated_at=timezone('utc',now()) where id=156;
update public.places set hours='Mon-Sat 13:00-01:00; Sun 13:00-22:30; terrace closes earlier.',link='https://ku-bar.co.uk/ku-bar/',updated_at=timezone('utc',now()) where id=157;
update public.places set hours='Permanently closed in October 2025; former site now operates as COVEN under a different owner.',description='Historical record for the former G-A-Y Bar. The Old Compton Street venue closed in October 2025 and was replaced by COVEN: Headquarters in June 2026; do not use this row as a current destination.',updated_at=timezone('utc',now()) where id=158;
update public.places set hours='Open 24 hours daily; maximum stay 18 hours; no re-entry.',link='https://www.pleasuredrome.com/',updated_at=timezone('utc',now()) where id=160;
update public.places set hours='Current operation and location unverified; do not travel from this listing.',description='A deindexed historical club record whose City address conflicts with the former Vauxhall operation. No reliable current operator, address or dated 2026 programme was verified.',updated_at=timezone('utc',now()) where id=162;
update public.places set location='570-574 Commercial Road, London E14 7JD, United Kingdom',hours='Mon 13:00-23:00; Tue-Fri 12:00-23:00; Sat-Sun 13:00-23:00; last entry 21:00.',link='https://sailorssauna.com/entry-price-hours.html',updated_at=timezone('utc',now()) where id=1109;
update public.places set hours='Mon-Tue 16:00-23:00; Wed-Thu 16:00-23:30; Fri 16:00-00:00; Sat 12:00-00:00; Sun 12:00-22:30.',updated_at=timezone('utc',now()) where id=1110;
update public.places set hours='Mon-Fri 12:00-23:30; Sat 12:00-02:00; Sun 12:00-22:30; check private-event early closures.',link='https://www.cghspa.uk/events-rates-times/',updated_at=timezone('utc',now()) where id=1111;
update public.places set hours='Daily from 12:00; closing and cabaret schedule vary by day.',link='https://www.halfway2heaven.net/london/events',updated_at=timezone('utc',now()) where id=1112;
update public.places set hours='Daily 11:00-23:00.',link='https://lockerroomsauna.co.uk/',updated_at=timezone('utc',now()) where id=1113;
update public.places set hours='Open 24 hours daily; maximum eight-hour stay per entry.',link='https://www.sweatboxsoho.com/',updated_at=timezone('utc',now()) where id=1115;
update public.places set link='https://www.the2brewers.com/',updated_at=timezone('utc',now()) where id=1116;
update public.places set hours='Mon-Thu 12:00-23:30; Fri-Sat 12:00-00:00; Sun 12:00-22:30.',updated_at=timezone('utc',now()) where id=1117;
update public.places set hours='Programme-led: Thu 19:00-00:00; Fri-Sat commonly 21:00/22:00-03:00/04:00; Sun 16:00-22:30.',updated_at=timezone('utc',now()) where id=1118;
update public.places set link='https://www.yardbar.co.uk/',updated_at=timezone('utc',now()) where id=1119;
update public.places set hours='Mon-Thu 13:00-23:30; Fri-Sat 12:00-00:00; Sun 12:00-22:30.',updated_at=timezone('utc',now()) where id=1120;
update public.places set hours='24-hour reception; check-in from 15:00, checkout by 11:00.',updated_at=timezone('utc',now()) where id=1852;
update public.places set hours='24-hour hotel operation; confirm current check-in and checkout with the booking.',updated_at=timezone('utc',now()) where id=1853;
update public.places set hours='24-hour reception; accommodation and bar use separate schedules.',updated_at=timezone('utc',now()) where id=1854;
update public.places set hours='24-hour hotel operation; check-in from 15:00, checkout by 12:00.',link='https://www.radissonhotels.com/en-us/hotels/park-plaza-london-riverbank',updated_at=timezone('utc',now()) where id=1855;
update public.places set hours='Mon-Wed 09:00-22:30; Thu-Sat 09:00-04:30; Sun 09:00-00:30.',updated_at=timezone('utc',now()) where id=1856;
update public.places set hours='Shoreditch bookshop/café Tue-Sun 11:00-18:30; event hours vary.',updated_at=timezone('utc',now()) where id=1857;
update public.places set hours='Tue, Thu-Sat 14:00-19:00; Wed and Sun 14:00-18:00; Wednesday MEETS is separately ticketed.',updated_at=timezone('utc',now()) where id=1858;
update public.places set type='bar',hours='Mon 16:00-01:00; Tue-Wed 16:00-02:00; Thu-Fri 16:00-03:00; Sat 13:00-03:00; Sun 16:00-00:00.',link='https://www.villagesoho.co.uk/london-bar/contact',updated_at=timezone('utc',now()) where id=1859;

do $$
declare updated_count integer; invalid_fields integer; duplicate_fields integer;
begin
  select count(*) into updated_count from public.places where id in (113,114,153,154,155,156,157,158,160,162,1109,1110,1111,1112,1113,1115,1116,1117,1118,1119,1120,1852,1853,1854,1855,1856,1857,1858,1859) and venue_intel->>'updated_at'='2026-08-30T00:00:00Z';
  if updated_count<>29 then raise exception 'Expected 29 repaired London profiles, found %',updated_count; end if;
  select count(*) into invalid_fields from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (113,114,153,154,155,156,157,158,160,162,1109,1110,1111,1112,1113,1115,1116,1117,1118,1119,1120,1852,1853,1854,1855,1856,1857,1858,1859) and (length(f.value)<40 or length(f.value)>320);
  if invalid_fields<>0 then raise exception 'Expected every London intelligence field to be 40-320 chars, found % invalid',invalid_fields; end if;
  select count(*) into duplicate_fields from (select f.key,f.value,count(*) from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (113,114,153,154,155,156,157,158,160,162,1109,1110,1111,1112,1113,1115,1116,1117,1118,1119,1120,1852,1853,1854,1855,1856,1857,1858,1859) group by f.key,f.value having count(*)>1) d;
  if duplicate_fields<>0 then raise exception 'Expected no exact duplicate London intelligence fields, found %',duplicate_fields; end if;
end $$;

commit;
