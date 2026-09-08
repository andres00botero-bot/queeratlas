-- Queer Atlas: Europe hotel batch 1
-- 28 destinations; exactly three researched LGBTQ+-focused or LGBTQ+-welcoming hotels each.
-- Editorial, live-property and individual map-point check: 2026-08-23.
-- No ratings or review totals are manufactured. Safe to run repeatedly (city + hotel name).

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_hotels as (
  select * from jsonb_to_recordset($hotels$
[
{"name":"Grand Hôtel de l'Opéra","city":"toulouse","location":"1 Place du Capitole, 31000 Toulouse, France","lat":43.6035313,"lng":1.4440139,"link":"https://www.grand-hotel-opera.com/","source":"https://www.travelgay.com/gay-toulouse-hotels","class":"Historic upscale city hotel","focus":"Capitole access and a polished central base","evidence":"Current LGBTQ+ specialist hotel listing plus live official property record.","tags":"luxury,cultural,mixed"},
{"name":"Hôtel des Arts","city":"toulouse","location":"1 bis Rue Cantegril, 31000 Toulouse, France","lat":43.6015850,"lng":1.4471901,"link":"https://www.hoteldesartstoulouse.fr/en","source":"https://www.travelgay.com/gay-toulouse-hotels","class":"Independent boutique hotel","focus":"arts-led character in the historic centre","evidence":"Current LGBTQ+ specialist coverage identifies the hotel as gay-friendly.","tags":"cozy,cultural,mixed"},
{"name":"Hôtel Le Père Léon","city":"toulouse","location":"2 Place Esquirol, 31000 Toulouse, France","lat":43.6006102,"lng":1.4439093,"link":"https://www.pere-leon.com/","source":"https://www.travelgay.com/gay-toulouse-hotels","class":"Central independent hotel","focus":"Esquirol transport, food and city-night access","evidence":"Current LGBTQ+ specialist coverage identifies the hotel as gay-friendly.","tags":"cozy,social,mixed"},

{"name":"east Hotel Hamburg","city":"hamburg","location":"Simon-von-Utrecht-Straße 31, 20359 Hamburg, Germany","lat":53.5512744,"lng":9.9659858,"link":"https://www.east-hamburg.de/startseite","source":"https://www.travelgay.com/gay-hamburg-hotels","class":"Design lifestyle hotel","focus":"St. Pauli nightlife and bold social spaces","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,social,mixed"},
{"name":"ARCOTEL Onyx Hamburg","city":"hamburg","location":"Reeperbahn 1A, 20359 Hamburg, Germany","lat":53.5493995,"lng":9.9677297,"link":"https://www.arcotelhotels.com/en/onyx_hotel_hamburg/","source":"https://www.travelgay.com/gay-hamburg-hotels","class":"Upscale design city hotel","focus":"Reeperbahn access with a calm contemporary base","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"social,cultural,mixed"},
{"name":"Reichshof Hamburg","city":"hamburg","location":"Kirchenallee 34-36, 20099 Hamburg, Germany","lat":53.5548076,"lng":10.0085908,"link":"https://www.reichshof-hotel-hamburg.de/","source":"https://www.travelgay.com/gay-hamburg-hotels","class":"Historic grand hotel","focus":"St. Georg, central station and city culture","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cultural,mixed"},

{"name":"Hotel Deutsche Eiche","city":"munich","location":"Reichenbachstraße 13, 80469 Munich, Germany","lat":48.1327393,"lng":11.5763595,"link":"https://www.deutsche-eiche.de/","source":"https://www.travelgay.com/munich-gay-rated-hotels","class":"Queer landmark hotel and sauna","focus":"Gärtnerplatz queer life and an on-site gay sauna","evidence":"The property is an established gay landmark with first-party hotel and sauna operations.","tags":"social,men_only,relax"},
{"name":"Cocoon Sendlinger Tor","city":"munich","location":"Lindwurmstraße 35, 80337 Munich, Germany","lat":48.1309127,"lng":11.5617837,"link":"https://cocoon-hotels.com/en/cocoon-sendlinger-tor/","source":"https://www.travelgay.com/munich-gay-rated-hotels","class":"Design city hotel","focus":"Sendlinger Tor and walkable central Munich","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cozy,cultural,mixed"},
{"name":"The Charles Hotel","city":"munich","location":"Sophienstraße 28, 80333 Munich, Germany","lat":48.1428924,"lng":11.5625182,"link":"https://www.roccofortehotels.com/hotels-and-resorts/the-charles-hotel/","source":"https://www.travelgay.com/munich-gay-rated-hotels","class":"Five-star luxury hotel","focus":"museum district luxury, spa and discreet service","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,relax,mixed"},

{"name":"AxelBeach Mykonos","city":"mykonos","location":"Vrysi, Mykonos 84600, Greece","lat":37.4355556,"lng":25.3313889,"link":"https://www.axelhotels.com/en/axel-beach-mykonos/hotel","source":"https://www.travelgay.com/mykonos-gay-rated-hotels","class":"Adults-only LGBTQ+-focused resort","focus":"queer-centred pool, Skybar, wellness and Mykonos Town access","evidence":"First-party Axel identity, conduct guidance and current LGBTQ+ specialist listing.","tags":"social,luxury,relax"},
{"name":"Myconian Kyma Resort","city":"mykonos","location":"Vryssi, Mykonos 84600, Greece","lat":37.4370000,"lng":25.3297500,"link":"https://www.myconiankyma.gr/","source":"https://www.travelgay.com/mykonos-gay-rated-hotels","class":"Five-star design resort","focus":"hilltop luxury close to Mykonos Town nightlife","evidence":"Current Travel Gay Approved coverage plus live official property record.","tags":"luxury,relax,mixed"},
{"name":"Mykonos Theoxenia Hotel","city":"mykonos","location":"Kato Mili, Mykonos 84600, Greece","lat":37.4435141,"lng":25.3265213,"link":"https://www.mykonostheoxenia.com/","source":"https://www.travelgay.com/mykonos-gay-rated-hotels","class":"Historic design boutique hotel","focus":"windmills, waterfront and Mykonos Town walkability","evidence":"Current Travel Gay Approved coverage plus live official property record.","tags":"luxury,cultural,mixed"},

{"name":"Perivolas Lifestyle Houses","city":"santorini","location":"Oia, Santorini 84702, Greece","lat":36.4612196,"lng":25.3882401,"link":"https://www.perivolas.gr/","source":"https://www.travelgay.com/santorini-hotels","class":"Adults-oriented cliffside luxury hotel","focus":"quiet Oia caldera living and high-touch privacy","evidence":"Current Travel Gay Approved coverage plus live official and Michelin property records.","tags":"luxury,relax,cozy"},
{"name":"Villa Katikies","city":"santorini","location":"Oia, Santorini 84702, Greece","lat":36.4668000,"lng":25.3928000,"link":"https://www.katikies.com/","source":"https://www.travelgay.com/santorini-hotels","class":"Small luxury villa hotel","focus":"intimate Oia suites and caldera views","evidence":"Current Travel Gay Approved coverage plus live official property record.","tags":"luxury,relax,cozy"},
{"name":"Andromeda Villas & Spa Resort","city":"santorini","location":"Imerovigli, Santorini 84700, Greece","lat":36.4351095,"lng":25.4212370,"link":"https://www.andromeda-villas.com/","source":"https://www.travelgay.com/santorini-hotels","class":"Cliffside spa resort","focus":"Imerovigli views, pools and wellness","evidence":"Current Travel Gay Approved coverage plus live official property record.","tags":"luxury,relax,mixed"},

{"name":"Mercure Budapest Korona Hotel","city":"budapest","location":"Kecskeméti utca 14, 1053 Budapest, Hungary","lat":47.4899602,"lng":19.0611429,"link":"https://all.accor.com/hotel/1765/index.en.shtml","source":"https://www.travelgay.com/gay-budapest-hotels","class":"Four-star central hotel","focus":"Kálvin Square transport and Pest-side city access","evidence":"Current Travel Gay Approved listing plus official Accor property record.","tags":"social,relax,mixed"},
{"name":"Hotel Clark Budapest","city":"budapest","location":"Clark Ádám tér 1, 1013 Budapest, Hungary","lat":47.4986112,"lng":19.0400357,"link":"https://hotelclarkbudapest.hu/","source":"https://www.travelgay.com/gay-budapest-hotels","class":"Adults-only design hotel","focus":"Chain Bridge views and gay-managed dining evidence","evidence":"Current specialist coverage documents gay-managed restaurants and a warm welcome for gay guests.","tags":"luxury,social,mixed"},
{"name":"Queen's Court Hotel & Residence","city":"budapest","location":"Dob utca 63, 1074 Budapest, Hungary","lat":47.5014989,"lng":19.0667521,"link":"https://queenscourthotelbudapest.com/","source":"https://www.travelgay.com/gay-budapest-hotels","class":"Suite hotel and residence","focus":"Jewish Quarter access, pool and apartment-style stays","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"relax,social,mixed"},

{"name":"Eyja Guldsmeden Hotel","city":"reykjavik","location":"Brautarholt 10-14, 105 Reykjavík, Iceland","lat":64.1418514,"lng":-21.9074962,"link":"https://guldsmedenhotels.com/eyja/","source":"https://www.travelgay.com/gay-reykjavik-hotels","class":"Eco-conscious boutique hotel","focus":"warm design between Hlemmur and central Reykjavík","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cozy,cultural,mixed"},
{"name":"City Center Hotel","city":"reykjavik","location":"Austurstræti 6, 101 Reykjavík, Iceland","lat":64.1477504,"lng":-21.9404835,"link":"https://www.citycenterhotel.is/","source":"https://www.travelgay.com/gay-reykjavik-hotels","class":"Compact central city hotel","focus":"Old Town, harbour and queer-nightlife walkability","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cozy,social,mixed"},
{"name":"Canopy by Hilton Reykjavik City Centre","city":"reykjavik","location":"Smiðjustígur 4, 101 Reykjavík, Iceland","lat":64.1463424,"lng":-21.9304200,"link":"https://www.hilton.com/en/hotels/rekcapy-canopy-reykjavik-city-centre/","source":"https://www.travelgay.com/gay-reykjavik-hotels","class":"Upscale lifestyle hotel","focus":"central design, food and walkable nightlife","evidence":"Current LGBTQ+ specialist hotel coverage plus live official Hilton property record.","tags":"luxury,cultural,mixed"},

{"name":"The Westin Excelsior Florence","city":"florence","location":"Piazza Ognissanti 3, 50123 Florence, Italy","lat":43.7720185,"lng":11.2457642,"link":"https://www.marriott.com/en-us/hotels/flrwi-the-westin-excelsior-florence/overview/","source":"https://www.travelgay.com/gay-florence-hotels","class":"Five-star historic luxury hotel","focus":"Arno views and central Renaissance sightseeing","evidence":"Current Travel Gay Approved listing plus live official Marriott property record.","tags":"luxury,cultural,mixed"},
{"name":"Borghese Palace Art Hotel","city":"florence","location":"Via Ghibellina 174R, 50122 Florence, Italy","lat":43.7705437,"lng":11.2594524,"link":"https://www.borghesepalace.it/","source":"https://www.travelgay.com/gay-florence-hotels","class":"Art boutique hotel","focus":"historic-centre art, character and walkability","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cultural,cozy,mixed"},
{"name":"Palazzo Vecchietti","city":"florence","location":"Via degli Strozzi 4, 50123 Florence, Italy","lat":43.7716724,"lng":11.2529787,"link":"https://www.palazzovecchietti.com/","source":"https://www.travelgay.com/gay-florence-hotels","class":"Luxury historic residence","focus":"private suites in the heart of Florence","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,cultural,cozy"},

{"name":"ibis Milano Centro","city":"milano","location":"Via Camillo Finocchiaro Aprile 2, 20124 Milan, Italy","lat":45.4782928,"lng":9.2017763,"link":"https://all.accor.com/hotel/0933/index.en.shtml","source":"https://www.travelgay.com/milan-gay-rated-hotels","class":"Large mid-range city hotel","focus":"Porta Venezia access and practical central transport","evidence":"Current Travel Gay Approved listing plus official Accor property record.","tags":"massive,social,mixed"},
{"name":"Hotel Berna","city":"milano","location":"Via Napo Torriani 18, 20124 Milan, Italy","lat":45.4826479,"lng":9.2034008,"link":"https://www.hotelberna.com/","source":"https://www.travelgay.com/milan-gay-rated-hotels","class":"Independent four-star hotel","focus":"Central Station convenience and thoughtful service","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cozy,cultural,mixed"},
{"name":"Maison Milano UNA Esperienze","city":"milano","location":"Via Giuseppe Mazzini 4, 20123 Milan, Italy","lat":45.4632901,"lng":9.1884072,"link":"https://www.gruppouna.it/en/esperienze/maison-milano","source":"https://www.travelgay.com/milan-gay-rated-hotels","class":"Luxury boutique hotel","focus":"Duomo-centred fashion and culture access","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,cultural,cozy"},

{"name":"ROMEO Napoli","city":"naples","location":"Via Cristoforo Colombo 45, 80133 Naples, Italy","lat":40.8409371,"lng":14.2561755,"link":"https://theromeocollection.com/en/romeo-napoli/","source":"https://www.travelgay.com/gay-naples-hotels","class":"Five-star design hotel","focus":"harbour views, spa and Old Town access","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,relax,mixed"},
{"name":"Hotel Le Orchidee","city":"naples","location":"Corso Umberto I 7, 80138 Naples, Italy","lat":40.8439957,"lng":14.2563768,"link":"https://www.hotelleorchidee.com/","source":"https://www.travelgay.com/gay-naples-hotels","class":"Gay-managed budget hotel","focus":"central value near the port and historic core","evidence":"Current LGBTQ+ specialist coverage explicitly identifies the hotel as gay-managed.","tags":"cozy,social,mixed"},
{"name":"Eurostars Hotel Excelsior","city":"naples","location":"Via Partenope 48, 80121 Naples, Italy","lat":40.8304417,"lng":14.2446836,"link":"https://www.eurostarshotels.com/eurostars-hotel-excelsior.html","source":"https://www.travelgay.com/gay-naples-hotels","class":"Historic seafront luxury hotel","focus":"Lungomare views and central Naples culture","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cultural,mixed"},

{"name":"Roma Luxus Hotel","city":"rome","location":"Largo Angelicum 4, 00184 Rome, Italy","lat":41.8958579,"lng":12.4872050,"link":"https://www.romaluxushotel.com/","source":"https://www.travelgay.com/rome-gay-rated-hotels","class":"Luxury boutique hotel","focus":"Monti, ancient Rome and central queer-night access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cultural,mixed"},
{"name":"The Fifteen Keys Hotel","city":"rome","location":"Via Urbana 6-7, 00184 Rome, Italy","lat":41.8977378,"lng":12.4954987,"link":"https://www.fifteenkeys.com/","source":"https://www.travelgay.com/rome-gay-rated-hotels","class":"Independent boutique hotel","focus":"quiet Monti character and local neighbourhood life","evidence":"Current LGBTQ+ specialist coverage identifies it as gay-friendly.","tags":"cozy,cultural,mixed"},
{"name":"Hotel Artemide","city":"rome","location":"Via Nazionale 22, 00184 Rome, Italy","lat":41.9008284,"lng":12.4936066,"link":"https://www.hotelartemide.it/","source":"https://www.travelgay.com/rome-gay-rated-hotels","class":"Four-star spa hotel","focus":"Via Nazionale convenience, rooftop and wellness","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,relax,mixed"},

{"name":"Hotel Dock Milano","city":"turin","location":"Via Cernaia 46, 10122 Turin, Italy","lat":45.0735814,"lng":7.6688261,"link":"https://www.hoteldockmilano.it/","source":"https://www.travelgay.com/gay-turin-hotels","class":"Historic central hotel","focus":"Porta Susa transport and walkable Turin","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cultural,cozy,mixed"},
{"name":"Diplomatic Hotel Turin","city":"turin","location":"Via Cernaia 42, 10122 Turin, Italy","lat":45.0734243,"lng":7.6695012,"link":"https://www.hotel-diplomatic.it/","source":"https://www.travelgay.com/gay-turin-hotels","class":"Four-star city hotel","focus":"Porta Susa access and central shopping","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cultural,social,mixed"},
{"name":"Best Quality Hotel Gran Mogol","city":"turin","location":"Via Guarino Guarini 2, 10123 Turin, Italy","lat":45.0632135,"lng":7.6812090,"link":"https://granmogol.bqhotel.it/en/","source":"https://www.travelgay.com/gay-turin-hotels","class":"Central boutique hotel","focus":"Porta Nuova, dining and compact city access","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cozy,cultural,mixed"},

{"name":"Grand Poet Hotel by Semarah","city":"riga","location":"Raiņa bulvāris 5/6, Riga LV-1050, Latvia","lat":56.9535671,"lng":24.1107132,"link":"https://grandpoet.semarahhotels.com/","source":"https://www.travelgay.com/destination/gay-latvia/gay-riga","class":"Five-star design and spa hotel","focus":"parks, Old Town and refined wellness","evidence":"Current LGBTQ+ destination hotel coverage plus live official property record.","tags":"luxury,relax,cultural"},
{"name":"Wellton Centrum Hotel & SPA","city":"riga","location":"Kalēju iela 33, Riga LV-1050, Latvia","lat":56.9471149,"lng":24.1125758,"link":"https://www.wellton.com/en/hotels/wellton-centrum-hotel-and-spa","source":"https://www.travelgay.com/destination/gay-latvia/gay-riga","class":"Old Town spa hotel","focus":"walkable Riga nightlife, market and wellness","evidence":"Current LGBTQ+ destination hotel coverage plus live official property record.","tags":"relax,social,mixed"},
{"name":"Radisson Blu Latvija Conference & Spa Hotel","city":"riga","location":"Elizabetes iela 55, Riga LV-1010, Latvia","lat":56.9550177,"lng":24.1177516,"link":"https://www.radissonhotels.com/en-us/hotels/radisson-blu-conference-riga-latvija","source":"https://www.travelgay.com/destination/gay-latvia/gay-riga","class":"Large upscale city hotel","focus":"central skyline, spa and broad city access","evidence":"Current LGBTQ+ destination hotel coverage plus live official property record.","tags":"massive,relax,mixed"},

{"name":"Artis Centrum Hotels","city":"vilnius","location":"Totorių g. 23, LT-01120 Vilnius, Lithuania","lat":54.6833416,"lng":25.2822945,"link":"https://artis.centrumhotels.com/","source":"https://www.travelgay.com/destination/gay-lithuania/gay-vilnius","class":"Four-star Old Town hotel","focus":"historic-centre culture and compact walkability","evidence":"Current LGBTQ+ destination hotel coverage plus live official property record.","tags":"cultural,relax,mixed"},
{"name":"Novotel Vilnius Centre","city":"vilnius","location":"Gedimino prospektas 16, LT-01103 Vilnius, Lithuania","lat":54.6867450,"lng":25.2806250,"link":"https://all.accor.com/hotel/5209/index.en.shtml","source":"https://www.travelgay.com/destination/gay-lithuania/gay-vilnius","class":"Four-star central hotel","focus":"Gediminas Avenue and easy Old Town access","evidence":"Current LGBTQ+ destination coverage plus official Accor address and GPS record.","tags":"social,cultural,mixed"},
{"name":"Radisson Blu Hotel Lietuva","city":"vilnius","location":"Konstitucijos pr. 20, LT-09308 Vilnius, Lithuania","lat":54.6950854,"lng":25.2747589,"link":"https://www.radissonhotels.com/en-us/hotels/radisson-blu-vilnius-lietuva","source":"https://www.travelgay.com/destination/gay-lithuania/gay-vilnius","class":"High-rise upscale hotel","focus":"river views, business district and city connectivity","evidence":"Current LGBTQ+ destination hotel coverage plus live official property record.","tags":"luxury,massive,mixed"},

{"name":"The Gomerino Hotel","city":"malta","location":"247 Saint Paul Street, Valletta VLT 1215, Malta","lat":35.8977074,"lng":14.5148916,"link":"https://thegomerinohotel.com/","source":"https://www.travelgay.com/gay-malta-hotels","class":"Luxury heritage hotel","focus":"Valletta rooftops, pool and historic streets","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,cultural,relax"},
{"name":"La Falconeria Hotel","city":"malta","location":"62 Melita Street, Valletta VLT 1122, Malta","lat":35.8982398,"lng":14.5099591,"link":"https://www.lafalconeria.com/","source":"https://www.travelgay.com/gay-malta-hotels","class":"Boutique heritage hotel","focus":"central Valletta culture and intimate design","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cozy,cultural,mixed"},
{"name":"Palais Le Brun","city":"malta","location":"101 Old Bakery Street, Valletta VLT 1426, Malta","lat":35.9006141,"lng":14.5142167,"link":"https://palaislebrun.com/","source":"https://www.travelgay.com/gay-malta-hotels","class":"Luxury palace hotel","focus":"historic Valletta, rooftop pool and suite privacy","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,cultural,relax"},

{"name":"Radisson Blu Plaza Hotel Oslo","city":"oslo","location":"Sonja Henies plass 3, 0185 Oslo, Norway","lat":59.9124815,"lng":10.7565370,"link":"https://www.radissonhotels.com/en-us/hotels/radisson-blu-oslo","source":"https://www.travelgay.com/gay-oslo-hotels","class":"High-rise city hotel","focus":"central station, skyline and rapid city access","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"massive,luxury,mixed"},
{"name":"Scandic Grensen","city":"oslo","location":"Grensen 20, 0159 Oslo, Norway","lat":59.9143770,"lng":10.7412730,"link":"https://www.scandichotels.com/hotels/norway/oslo/scandic-grensen","source":"https://www.travelgay.com/gay-oslo-hotels","class":"Compact design hotel","focus":"central shopping, culture and queer-night walkability","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cozy,cultural,mixed"},
{"name":"Thon Hotel Opera","city":"oslo","location":"Dronning Eufemias gate 4, 0191 Oslo, Norway","lat":59.9095860,"lng":10.7533615,"link":"https://www.thonhotels.com/hotels/norway/oslo/thon-hotel-opera/","source":"https://www.travelgay.com/gay-oslo-hotels","class":"Upscale station and opera hotel","focus":"Bjørvika, opera, rail and waterfront access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cultural,luxury,mixed"},

{"name":"Metropol Hotel Moscow","city":"moscow","location":"Teatralny Proezd 2, Moscow 109012, Russia","lat":55.7584264,"lng":37.6214880,"link":"https://metropol-moscow.ru/en/","source":"https://www.travelgay.com/gay-moscow-hotels","class":"Historic five-star hotel","focus":"Kremlin, theatre and discreet central service","evidence":"Live official property record and current LGBTQ+ specialist Moscow guidance, which explicitly advises discretion in Russia.","tags":"luxury,cultural,mixed"},
{"name":"Hotel National Moscow","city":"moscow","location":"Mokhovaya Street 15/1, Moscow 125009, Russia","lat":55.7567867,"lng":37.6137945,"link":"https://national.ru/en/","source":"https://www.travelgay.com/gay-moscow-hotels","class":"Historic five-star hotel","focus":"Kremlin-facing central location and discreet full service","evidence":"Live official property record and current LGBTQ+ specialist Moscow guidance, which explicitly advises discretion in Russia.","tags":"luxury,cultural,mixed"},
{"name":"StandArt Hotel Moscow","city":"moscow","location":"Strastnoy Boulevard 2, Moscow 125009, Russia","lat":55.7686476,"lng":37.6093185,"link":"https://en.standarthotel.com/","source":"https://www.travelgay.com/gay-moscow-hotels","class":"Independent design luxury hotel","focus":"Tverskoy design, culture and central transport","evidence":"Live official property record and current LGBTQ+ specialist Moscow guidance, which explicitly advises discretion in Russia.","tags":"luxury,cultural,mixed"},

{"name":"Akyan Saint Petersburg","city":"saint_petersburg","location":"Ulitsa Vosstaniya 19, Saint Petersburg 191036, Russia","lat":59.9353571,"lng":30.3604699,"link":"https://akyanhotel.com/en/","source":"https://www.travelgay.com/gay-map-of-moscow","class":"Historic boutique hotel","focus":"Nevsky-area access in a smaller central property","evidence":"Current LGBTQ+ specialist map listing plus live official property record; destination-level discretion remains essential.","tags":"cultural,cozy,mixed"},
{"name":"Petro Palace Hotel","city":"saint_petersburg","location":"Malaya Morskaya Street 14, Saint Petersburg 190000, Russia","lat":59.9346081,"lng":30.3116856,"link":"https://www.petropalacehotel.com/","source":"https://www.travelgay.com/gay-map-of-moscow","class":"Four-star historic-centre hotel","focus":"Hermitage, Admiralty and central cultural access","evidence":"Current LGBTQ+ specialist map listing plus live official property record; destination-level discretion remains essential.","tags":"luxury,cultural,mixed"},
{"name":"Hotel Saint Petersburg","city":"saint_petersburg","location":"Pirogovskaya Embankment 5/2, Saint Petersburg 194044, Russia","lat":59.9569446,"lng":30.3413796,"link":"https://www.hotel-spb.ru/en/","source":"https://www.travelgay.com/gay-map-of-moscow","class":"Large riverside city hotel","focus":"Neva views, events and broad city connectivity","evidence":"Current LGBTQ+ specialist map listing plus live official property record; destination-level discretion remains essential.","tags":"massive,cultural,mixed"},

{"name":"Belgrade City Hotel","city":"belgrade","location":"Savski trg 7, 11000 Belgrade, Serbia","lat":44.8084965,"lng":20.4575394,"link":"https://www.belgradecityhotel.com/","source":"https://www.travelgay.com/gay-belgrade-hotels","class":"Four-star central hotel","focus":"Savski Square transport and nearby nightlife","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"social,cultural,mixed"},
{"name":"Hotel Moskva Belgrade","city":"belgrade","location":"Terazije 20, 11000 Belgrade, Serbia","lat":44.8128760,"lng":20.4604199,"link":"https://hotelmoskva.rs/","source":"https://www.travelgay.com/gay-belgrade-hotels","class":"Historic landmark hotel","focus":"Terazije architecture and central city access","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"luxury,cultural,mixed"},
{"name":"Mercure Belgrade Excelsior","city":"belgrade","location":"Kneza Miloša 5, 11000 Belgrade, Serbia","lat":44.8097804,"lng":20.4656295,"link":"https://all.accor.com/hotel/B1E1/index.en.shtml","source":"https://www.travelgay.com/gay-belgrade-hotels","class":"Four-star city hotel","focus":"Stari Dvor, Republic Square and nightlife walkability","evidence":"Current Travel Gay Approved listing plus official Accor property record.","tags":"social,cultural,mixed"},

{"name":"Hotel Tatra","city":"bratislava","location":"Námestie 1. mája 5, 81106 Bratislava, Slovakia","lat":48.1497360,"lng":17.1094144,"link":"https://hoteltatra.sk/en/","source":"https://www.travelgay.com/gay-bratislava-hotels","class":"Historic four-star hotel","focus":"Old Town access and established city hospitality","evidence":"Current Travel Gay Approved listing plus live official property record.","tags":"cultural,social,mixed"},
{"name":"Hotel Devín","city":"bratislava","location":"Riečna 4, 81102 Bratislava, Slovakia","lat":48.1401870,"lng":17.1072709,"link":"https://www.hoteldevin.sk/?lang=en","source":"https://www.travelgay.com/gay-bratislava-hotels","class":"Gay-friendly riverside luxury hotel","focus":"Danube views, Old Town and classic wellness","evidence":"Current specialist coverage explicitly describes Hotel Devín as gay-friendly.","tags":"luxury,relax,mixed"},
{"name":"Marrol's Boutique Hotel","city":"bratislava","location":"Tobrucká 4, 81102 Bratislava, Slovakia","lat":48.1412847,"lng":17.1134333,"link":"https://www.hotelmarrols.sk/","source":"https://www.travelgay.com/gay-bratislava-hotels","class":"Luxury boutique hotel","focus":"quiet Old Town edge and intimate service","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cozy,mixed"},

{"name":"Vander Urbani Resort","city":"ljubljana","location":"Krojaška ulica 6-8, 1000 Ljubljana, Slovenia","lat":46.0495480,"lng":14.5059952,"link":"https://vanderhotel.com/","source":"https://www.travelgay.com/gay-ljubljana-hotels","class":"Design boutique hotel","focus":"riverfront Old Town design and rooftop life","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cultural,social,cozy"},
{"name":"City Hotel Ljubljana","city":"ljubljana","location":"Dalmatinova ulica 15, 1000 Ljubljana, Slovenia","lat":46.0538172,"lng":14.5079398,"link":"https://www.cityhotel.si/","source":"https://www.travelgay.com/gay-ljubljana-hotels","class":"Large central city hotel","focus":"Old Town walkability and practical city access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"massive,cultural,mixed"},
{"name":"Grand Plaza Hotel Ljubljana","city":"ljubljana","location":"Slovenska cesta 60, 1000 Ljubljana, Slovenia","lat":46.0570946,"lng":14.5062290,"link":"https://www.grandplazahotel.si/","source":"https://www.travelgay.com/gay-ljubljana-hotels","class":"Five-star city hotel","focus":"central luxury, views and transport access","evidence":"Current LGBTQ+ specialist destination coverage plus live official property record.","tags":"luxury,massive,mixed"},

{"name":"Canopy by Hilton Zagreb City Centre","city":"zagreb","location":"Ulica kneza Branimira 29, 10000 Zagreb, Croatia","lat":45.8058411,"lng":15.9850673,"link":"https://www.hilton.com/en/hotels/zagcapy-canopy-zagreb-city-centre/","source":"https://www.travelgay.com/gay-zagreb-hotels","class":"Lifestyle design hotel","focus":"Branimir district design, food and city access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official Hilton property record.","tags":"cultural,social,mixed"},
{"name":"Esplanade Zagreb Hotel","city":"zagreb","location":"Mihanovićeva ulica 1, 10000 Zagreb, Croatia","lat":45.8052410,"lng":15.9758883,"link":"https://esplanade.hr/","source":"https://www.travelgay.com/gay-zagreb-hotels","class":"Five-star heritage hotel","focus":"railway-era glamour and central culture","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cultural,mixed"},
{"name":"Hotel Dubrovnik Zagreb","city":"zagreb","location":"Ljudevita Gaja 1, 10000 Zagreb, Croatia","lat":45.8124201,"lng":15.9766508,"link":"https://www.hotel-dubrovnik.hr/","source":"https://www.travelgay.com/gay-zagreb-hotels","class":"Central four-star hotel","focus":"Ban Jelačić Square and maximum walkability","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"social,cultural,mixed"},

{"name":"W Istanbul","city":"istanbul","location":"Süleyman Seba Caddesi 22, Beşiktaş, 34357 Istanbul, Türkiye","lat":41.0422396,"lng":29.0024836,"link":"https://www.marriott.com/en-us/hotels/istwh-w-istanbul/overview/","source":"https://www.travelgay.com/gay-istanbul-hotels","class":"Five-star lifestyle hotel","focus":"Akaretler design, social spaces and Bosphorus access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official Marriott property record.","tags":"luxury,social,mixed"},
{"name":"The Marmara Taksim","city":"istanbul","location":"Osmanlı Sokak 1B, Taksim, 34437 Istanbul, Türkiye","lat":41.0364373,"lng":28.9863444,"link":"https://www.themarmarahotels.com/taksim","source":"https://www.travelgay.com/gay-istanbul-hotels","class":"Five-star landmark city hotel","focus":"Taksim Square, transit and mixed nightlife","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,massive,mixed"},
{"name":"CVK Park Bosphorus Hotel Istanbul","city":"istanbul","location":"Gümüşsuyu Mahallesi, İnönü Caddesi 8, 34437 Istanbul, Türkiye","lat":41.0348640,"lng":28.9881559,"link":"https://www.cvkhotelsandresorts.com/park-bosphorus-hotel-istanbul/","source":"https://www.travelgay.com/gay-istanbul-hotels","class":"Five-star luxury hotel","focus":"Bosphorus views, spa and Taksim access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,relax,mixed"},

{"name":"Legends Hotel Brighton","city":"brighton","location":"31-34 Marine Parade, Brighton BN2 1TR, United Kingdom","lat":50.8196898,"lng":-0.1328750,"link":"https://www.legendsbrighton.com/","source":"https://www.travelgay.com/gay-brighton-hotels","class":"LGBTQ+-focused seafront hotel and bar","focus":"Kemptown queer nightlife with an on-site gay bar and club","evidence":"First-party LGBTQ+ operation plus current specialist gay-hotel listing.","tags":"social,drag,mixed"},
{"name":"Amsterdam Hotel Brighton","city":"brighton","location":"11-12 Marine Parade, Brighton BN2 1TL, United Kingdom","lat":50.8201177,"lng":-0.1349278,"link":"https://www.amsterdamhotelbrighton.com/","source":"https://www.travelgay.com/gay-brighton-hotels","class":"Gay seafront hotel and bar","focus":"Kemptown queer scene, terrace and sea views","evidence":"The property operates and is currently listed as a gay hotel and bar.","tags":"social,cozy,mixed"},
{"name":"Drakes Hotel Brighton","city":"brighton","location":"43-44 Marine Parade, Brighton BN2 1PE, United Kingdom","lat":50.8194431,"lng":-0.1313299,"link":"https://drakeshotel.com/","source":"https://www.travelgay.com/gay-brighton-hotels","class":"Luxury seafront boutique hotel","focus":"Kemptown, intimate design and sea views","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cozy,mixed"},

{"name":"Hotel du Vin Bristol","city":"bristol","location":"Narrow Lewins Mead, Bristol BS1 2NU, United Kingdom","lat":51.4568592,"lng":-2.5963996,"link":"https://www.hotelduvin.com/locations/bristol-city-centre/","source":"https://www.travelgay.com/gay-bristol-hotels","class":"Upscale heritage boutique hotel","focus":"Old City dining, character and central nightlife","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cultural,mixed"},
{"name":"Bristol Marriott Royal Hotel","city":"bristol","location":"College Green, Bristol BS1 5TA, United Kingdom","lat":51.4517879,"lng":-2.5993035,"link":"https://www.marriott.com/en-us/hotels/brsry-bristol-marriott-royal-hotel/overview/","source":"https://www.travelgay.com/gay-bristol-hotels","class":"Historic four-star hotel","focus":"College Green, harbour and city culture","evidence":"Current LGBTQ+ specialist hotel coverage plus live official Marriott property record.","tags":"luxury,cultural,mixed"},
{"name":"Radisson Blu Hotel Bristol","city":"bristol","location":"Broad Quay, Bristol BS1 4BY, United Kingdom","lat":51.4525204,"lng":-2.5966090,"link":"https://www.radissonhotels.com/en-us/hotels/radisson-blu-bristol","source":"https://www.travelgay.com/gay-bristol-hotels","class":"High-rise city hotel","focus":"harbour, Old City and mixed nightlife walkability","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"social,massive,mixed"},

{"name":"Axel Hotel Barcelona","city":"barcelona","location":"Carrer d'Aribau 33, 08011 Barcelona, Spain","lat":41.3873794,"lng":2.1604124,"link":"https://www.axelhotels.com/en/axel-hotel-barcelona/hotel","source":"https://www.travelgay.com/barcelona-gay-rated-hotels","class":"LGBTQ+-focused adults-only hotel","focus":"Gaixample, Sky Bar and queer-centred social life","evidence":"First-party Axel LGBTQ+ identity plus current specialist gay-hotel coverage.","tags":"social,luxury,mixed"},
{"name":"TWO Hotel Barcelona by Axel","city":"barcelona","location":"Carrer de Calàbria 90-92, 08015 Barcelona, Spain","lat":41.3826579,"lng":2.1511293,"link":"https://www.axelhotels.com/en/axel-two-barcelona/hotel","source":"https://www.travelgay.com/barcelona-gay-rated-hotels","class":"LGBTQ+-focused adults-only hotel","focus":"Gaixample access, rooftop pool and modern social design","evidence":"First-party Axel LGBTQ+ identity plus current specialist gay-hotel coverage.","tags":"social,relax,mixed"},
{"name":"Kimpton Vividora Barcelona","city":"barcelona","location":"Carrer del Duc 15, 08002 Barcelona, Spain","lat":41.3852978,"lng":2.1722188,"link":"https://www.hotelvividora.com/","source":"https://www.travelgay.com/barcelona-gay-rated-hotels","class":"Luxury lifestyle hotel","focus":"Gothic Quarter design, rooftop and inclusive service","evidence":"Current LGBTQ+ specialist hotel coverage plus Kimpton's first-party inclusive hospitality programme.","tags":"luxury,social,cultural"},

{"name":"Hotel Rival","city":"stockholm","location":"Mariatorget 3, 11848 Stockholm, Sweden","lat":59.3182338,"lng":18.0637690,"link":"https://www.rival.se/en/","source":"https://www.travelgay.com/gay-stockholm-hotels","class":"Independent design hotel","focus":"Södermalm culture and queer-friendly neighbourhood life","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cultural,social,mixed"},
{"name":"Berns Hotel","city":"stockholm","location":"Näckströmsgatan 8, 11147 Stockholm, Sweden","lat":59.3322770,"lng":18.0733569,"link":"https://berns.se/en/hotel/","source":"https://www.travelgay.com/gay-stockholm-hotels","class":"Historic boutique and nightlife hotel","focus":"city-centre culture, dining and event energy","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,social,cultural"},
{"name":"Nordic Light Hotel","city":"stockholm","location":"Vasaplan 7, 11120 Stockholm, Sweden","lat":59.3325806,"lng":18.0571438,"link":"https://nordiclighthotel.com/","source":"https://www.travelgay.com/gay-stockholm-hotels","class":"Nordic design hotel","focus":"Central Station convenience and contemporary city access","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cultural,relax,mixed"},

{"name":"Hotel N'vY","city":"geneva","location":"Rue de Richemont 18, 1202 Geneva, Switzerland","lat":46.2154216,"lng":6.1486633,"link":"https://www.hotelnvygeneva.com/","source":"https://www.travelgay.com/gay-geneva-hotels","class":"Art and lifestyle hotel","focus":"Pâquis design, lake access and mixed nightlife","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"cultural,social,mixed"},
{"name":"Eastwest Hotel","city":"geneva","location":"Rue des Pâquis 6, 1201 Geneva, Switzerland","lat":46.2097968,"lng":6.1482154,"link":"https://www.eastwesthotel.ch/","source":"https://www.travelgay.com/gay-geneva-hotels","class":"Luxury boutique hotel","focus":"quiet Pâquis elegance near the lake and station","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"luxury,cozy,mixed"},
{"name":"citizenM Geneva","city":"geneva","location":"Rue de la Rôtisserie 31-33, 1204 Geneva, Switzerland","lat":46.2025964,"lng":6.1476041,"link":"https://www.citizenm.com/hotels/europe/geneva/geneva-hotel","source":"https://www.travelgay.com/gay-geneva-hotels","class":"Contemporary lifestyle hotel","focus":"Old Town, communal design and central walkability","evidence":"Current LGBTQ+ specialist hotel coverage plus live official property record.","tags":"social,cultural,mixed"}
]
$hotels$) h(
  name text, city text, location text, lat double precision, lng double precision,
  link text, source text, class text, focus text, evidence text, tags text
  )
), source_hotels as (
  select h.*,
    h.name || ' is a researched ' || lower(h.class) || ' at ' || h.location ||
      '. Best suited to ' || lower(h.focus) || '. No rating or review total is inferred.' as description,
    h.focus as vibe,
    jsonb_build_object(
      'queue_wait', 'Hotel check-in; confirm current reception, late-arrival and access arrangements directly.',
      'best_nights', h.focus,
      'crowd_mix', 'LGBTQ+ travellers and a broader respectful hotel audience; this is not an audience restriction unless the property states one.',
      'dress_code', 'No hotel-wide nightlife dress code; restaurants, pools, spas and events may publish their own practical rules.',
      'staff_inclusivity', h.evidence,
      'inclusion_basis', h.evidence,
      'hotel_class', h.class,
      'coordinate_source', 'Individual hotel-property point checked against the published address; never a city-centre fallback.',
      'source_urls', jsonb_build_array(h.source, h.link),
      'research_status', 'researched_sources_live_property_and_exact_location',
      'updated_at', '2026-08-23T00:00:00Z'
    ) ||
    case when h.city in ('moscow','saint_petersburg') then
      jsonb_build_object(
        'destination_context',
        'A hotel listing is not a destination safety endorsement. Russia criminalises broad LGBTQ+ expression; travellers should review current official advice and use discretion.'
      )
    else '{}'::jsonb end as intel
  from raw_hotels h
), updated as (
  update public.places p
  set type = 'hotel',
      description = h.description,
      vibe = h.vibe,
      vibe_tags = string_to_array(h.tags, ','),
      hours = 'Hotel accommodation; confirm live reception, check-in and facility schedules directly.',
      link = h.link,
      location = h.location,
      lat = h.lat,
      lng = h.lng,
      venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || h.intel,
      seo_indexable = true,
      seo_quality_status = 'approved',
      updated_at = timezone('utc', now())
  from source_hotels h
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) = lower(trim(h.name))
  returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location,
  lat, lng, venue_intel, seo_indexable, seo_quality_status, updated_at
)
select h.name, h.city, 'hotel', h.description, h.vibe,
  string_to_array(h.tags, ','),
  'Hotel accommodation; confirm live reception, check-in and facility schedules directly.',
  h.link, h.location, h.lat, h.lng, h.intel, true, 'approved', timezone('utc', now())
from source_hotels h
where not exists (
  select 1 from public.places p
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) = lower(trim(h.name))
);

commit;

-- Expected: 3 complete rows for each of the 28 destinations.
select city,
  count(*) filter (
    where type = 'hotel'
      and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
  ) as batch_hotels,
  count(*) filter (
    where type = 'hotel'
      and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
      and coalesce(venue_intel->>'queue_wait', '') <> ''
      and coalesce(venue_intel->>'best_nights', '') <> ''
      and coalesce(venue_intel->>'crowd_mix', '') <> ''
      and coalesce(venue_intel->>'dress_code', '') <> ''
      and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
      and jsonb_array_length(coalesce(venue_intel->'source_urls', '[]'::jsonb)) >= 2
      and lat between -90 and 90 and lng between -180 and 180
      and coalesce(location, '') <> '' and coalesce(link, '') <> ''
  ) as complete_rows
from public.places
where lower(trim(city)) in (
  'toulouse','hamburg','munich','mykonos','santorini','budapest','reykjavik',
  'florence','milano','naples','rome','turin','riga','vilnius','malta','oslo',
  'moscow','saint_petersburg','belgrade','bratislava','ljubljana','zagreb',
  'istanbul','brighton','bristol','barcelona','stockholm','geneva'
)
group by city
order by city;

select name, city, location,
  round(lat::numeric, 6) as lat,
  round(lng::numeric, 6) as lng,
  venue_intel->>'inclusion_basis' as inclusion_basis
from public.places
where type = 'hotel'
  and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
  and lower(trim(city)) in (
    'toulouse','hamburg','munich','mykonos','santorini','budapest','reykjavik',
    'florence','milano','naples','rome','turin','riga','vilnius','malta','oslo',
    'moscow','saint_petersburg','belgrade','bratislava','ljubljana','zagreb',
    'istanbul','brighton','bristol','barcelona','stockholm','geneva'
  )
order by city, name;
