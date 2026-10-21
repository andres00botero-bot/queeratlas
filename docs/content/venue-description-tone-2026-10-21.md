# Venue description tone audit — 21 October 2026

Audited all 4,078 database venue listings. Found 1,663 descriptions containing the requested promotional terms or emoji, across 176 cities. Emoji appeared in 73 descriptions.

The change set contains 1,696 descriptions: 357 received individual editorial rewrites (including Berlin, Brussels and every emoji-bearing description); 1,339 received targeted language edits that retain the existing description's structure. Another 33 descriptions in the core-city review were rewritten for consistency despite not matching the initial terms. The JSON manifest contains every original and replacement for review and rollback.

These are copy edits to existing information, not a new verification of opening hours, operations, awards, door policies, facilities or safety. The review removed unsupported promotional guarantees from the individually rewritten descriptions. Other existing factual claims need their normal evidence review. No venue intelligence, user reviews, identity, location, links or moderation status is changed. The proper name **Iconic Bar** is preserved.

Four malformed descriptions contained copied conversation history: Le Poli (1523), The Green Mango Club (1534), Samui Mojito Lab (1535) and Indie Lounge (1963). They now describe only the named venue, using the corresponding venue-specific part of the existing text.

## Verified result

Applied all 1,696 changes to the live database on 21 October 2026 and read them back against the manifest. A fresh audit of all 4,078 rows returned zero promotional-term or emoji flags, allowing the proper name Iconic Bar. No new identical-description pairs were introduced: the same three existing duplicate groups remain. Public HTTP checks for K6, The Agenda and Le Poli returned 200, contained the new descriptions and did not contain the old opening text. The manifest, emoji/conflict/rollback checks, database-source regression and targeted ESLint checks passed.

## Editorial standard

- Lead with the venue type and location, then give concrete details: music, layout, programme or facilities.
- Prefer a few readable sentences to a sales pitch. Avoid superlatives, mascots, pet names for readers, invented familiarity and emoji.
- Describe LGBTQ+ focus, accessibility, entry restrictions and adult facilities directly when supported; do not turn them into stereotypes or promises about visitors.
- Do not call a venue safe, certified, the best, the oldest or universally welcoming without current, scoped evidence.
- Preserve proper names and meaningful cultural references; flag language for review rather than blindly rewriting user content.
- Keep practical and safety notes useful and qualified. A copy edit is not a fact-check timestamp.

## Apply and verify

Run with Node and the existing .env.local variables; do not put credentials in arguments.

- Dry run: `node --use-system-ca --env-file=.env.local scripts/apply-venue-description-tone.mjs`
- Apply: same command with `--apply`.
- Verify whole catalogue: `node --use-system-ca --env-file=.env.local scripts/audit-venue-description-tone.mjs`.
- Restore original text: apply command with `--rollback --apply`. Conflicting descriptions are refused.

The updater preflights all descriptions, compares identities and expected text, skips already-applied changes, and guards each update with the row's current updated_at value. updated_at records the copy change; verification fields are untouched. Re-run verification after applying. Venue pages declare a five-minute revalidation interval; existing browser caches may retain earlier content.

## Affected venues

| City | Venue | Database ID | Edit | Initial flags |
| --- | --- | --- | --- | --- |
| albania | Radio Bar Tirana | 1647 | editorial-rewrite | absolute, crown jewel, legendary, fiercely |
| algarve | Casa Amêndoa | 3631 | tone-edit | absolute |
| algarve | Casa Risa House & Spa | 3630 | editorial-rewrite | wonderland |
| algarve | CONNECTION Bar | 1754 | tone-edit | ultimate |
| algarve | Dona Benta - Tasca Chique | 1756 | tone-edit | legendary |
| algarve | Edon Villas Gay Resort | 3629 | tone-edit | ultimate |
| algarve | Espelho | 1755 | tone-edit | legendary |
| algarve | Madalena Bar | 3627 | tone-edit | ultimate, pure, iconic |
| algarve | The Loft Portimao | 1752 | editorial-rewrite | legendary, crown jewel, pure |
| amsterdam | Amistad Hotel Amsterdam | 1924 | tone-edit | absolute |
| amsterdam | Bears Amsterdam | 1122 | editorial-rewrite | emoji |
| amsterdam | Blend | 1123 | editorial-rewrite | crown jewel, emoji |
| amsterdam | Club Church | 164 | editorial-rewrite | pure, fiercely |
| amsterdam | Club NYX | 103 | editorial-rewrite | legendary, wonderland |
| amsterdam | Club Panama | 172 | tone-edit | legendary, iconic |
| amsterdam | Cuckoo's Nest | 3612 | tone-edit | legendary |
| amsterdam | De Trut | 168 | tone-edit | legendary, fiercely |
| amsterdam | Eagle Amsterdam | 1930 | tone-edit | absolute, legendary |
| amsterdam | Free Willie | 3613 | tone-edit | pure |
| amsterdam | Hotel CC Amsterdam | 1925 | tone-edit | absolute |
| amsterdam | Lellebel | 174 | tone-edit | iconic |
| amsterdam | Montmartre XL | 1124 | tone-edit | legendary, pure |
| amsterdam | Nieuwezijds Sauna | 171 | tone-edit | legendary |
| amsterdam | Pamela | 1125 | tone-edit | fiercely, absolutely |
| amsterdam | Radion | 173 | tone-edit | fiercely, legendary |
| amsterdam | RAUM | 1929 | tone-edit | fiercely |
| amsterdam | Room Mate Aitana | 1926 | tone-edit | absolute |
| amsterdam | Saarein | 169 | tone-edit | legendary, fiercely |
| amsterdam | Spijkerbar | 1126 | editorial-rewrite | absolute, legendary, emoji |
| amsterdam | Taboo | 1127 | editorial-rewrite | emoji |
| amsterdam | The Queen's Head | 1128 | editorial-rewrite | iconic, emoji |
| antwerp | Bonaparte | 3756 | tone-edit | ultimate, legendary |
| antwerp | Cafe DeLux | 1213 | tone-edit | ultimate |
| antwerp | Cafe den Draak | 1215 | tone-edit | pure |
| antwerp | Cargo Club | 1220 | tone-edit | absolute, legendary, pure, ultimate |
| antwerp | Club Random | 1207 | tone-edit | pure |
| antwerp | Hotel Julien | 2278 | tone-edit | absolute |
| antwerp | Hotel Rubens - Grote Markt | 3758 | tone-edit | absolute |
| antwerp | Red & Blue Club | 3755 | tone-edit | absolute, legendary, pure, ultimate |
| antwerp | The Boots | 1203 | tone-edit | legendary, absolute, iconic, pure |
| antwerp | YUST Antwerp | 2277 | tone-edit | ultimate |
| asuncion | El Grillo Canto Bar | 4143 | tone-edit | legendary |
| asuncion | Factoria Hotel | 2495 | tone-edit | pure |
| asuncion | La Abadía | 4141 | tone-edit | fiercely |
| asuncion | La Serafina (Espacio Cultural Feminista) | 2500 | tone-edit | absolute, ultimate, legendary |
| asuncion | Menstetic Sauna | 926 | tone-edit | ultimate, absolute, pure |
| asuncion | O'Leary Club | 4142 | tone-edit | absolute |
| asuncion | Paseo Carmelitas | 4144 | tone-edit | absolute |
| asuncion | Rebellion Sauna | 2499 | tone-edit | absolute |
| asuncion | Sauna 945 Spa | 2498 | tone-edit | absolute |
| athens | Barrett | 3895 | tone-edit | iconic, legendary |
| athens | BeQueer | 320 | editorial-rewrite | crown jewel, fiercely, ultimate |
| athens | Flex Sauna | 328 | tone-edit | pure |
| athens | Koukles Club | 322 | tone-edit | legendary |
| athens | Limanakia Beach | 1881 | editorial-rewrite | legendary, absolutely, emoji |
| athens | Moe Club | 3893 | tone-edit | pure |
| athens | Noiz | 3329 | tone-edit | pure |
| athens | Pedion Areos Park | 856 | editorial-rewrite | emoji |
| athens | Romantso | 326 | tone-edit | iconic |
| athens | S-Cape Club | 330 | editorial-rewrite | fiercely, emoji |
| athens | SMUT ATHENS | 426 | tone-edit | ultimate |
| athens | Sodade | 321 | tone-edit | legendary, absolute |
| atlanta | Atlanta Eagle | 3170 | tone-edit | ultimate, legendary, iconic |
| atlanta | Marquette Restaurant & Lounge | 4046 | tone-edit | pure |
| atlanta | My Sister's Room | 3167 | tone-edit | pure |
| atlanta | Sister Louisa's Church of the Living Room & Ping Pong Emporium | 4409 | tone-edit | ultimate |
| atlanta | The Heretic | 3451 | tone-edit | legendary, pure, iconic |
| atlanta | X Midtown | 3180 | editorial-rewrite | iconic, absolute, pure, crown jewel, legendary |
| auckland | Cordis | 2512 | tone-edit | absolute, ultimate |
| auckland | Omahanui Guesthouse | 2510 | tone-edit | absolute |
| auckland | The Great Ponsonby Arthotel | 2511 | tone-edit | absolute, iconic |
| austin | Barbarella | 3186 | tone-edit | ultimate, pure |
| austin | Canopy by Hilton Austin Downtown | 4411 | tone-edit | ultimate, legendary |
| austin | Coconut Club | 2551 | tone-edit | iconic, pure |
| austin | Highland Lounge | 1937 | editorial-rewrite | pure, absolute, crown jewel |
| austin | Oilcan Harry's | 3184 | editorial-rewrite | absolute, legendary, wonderland, pure, iconic, ultimate |
| austin | Rain on 4th | 3183 | tone-edit | iconic |
| austin | The Brewtorium | 4308 | tone-edit | fiercely, legendary |
| austin | The Iron Bear | 1935 | tone-edit | fiercely, legendary |
| bangkok | Blu Cabin Ari Stylish Gay Poshtel | 1952 | tone-edit | ultimate |
| bangkok | BRB Hostel Bangkok Silom | 1953 | tone-edit | ultimate |
| bangkok | Decommune | 2050 | tone-edit | fiercely |
| bangkok | Pride Bar & Circus | 1948 | tone-edit | pure, legendary, ultimate, absolute |
| bangkok | Pullman Bangkok King Power | 1951 | tone-edit | absolute, legendary |
| bangkok | The Standard, Bangkok Mahanakhon | 1950 | tone-edit | iconic |
| bangkok | The Stranger Bar | 1947 | editorial-rewrite | ultimate, crown jewel, absolute, legendary |
| barcelona | Apolo | 185 | tone-edit | absolute, legendary |
| barcelona | Bacon Bear Bar | 1291 | tone-edit | legendary, absolute, ultimate |
| barcelona | Boris Club Barcelona | 1663 | editorial-rewrite | crown jewel |
| barcelona | ClubOpenMind | 3572 | tone-edit | legendary |
| barcelona | El Cangrejo | 1296 | tone-edit | iconic, legendary |
| barcelona | HBB (Honey Bears Barcelona) | 1662 | tone-edit | ultimate, absolutely |
| barcelona | Ken Barcelona | 1661 | tone-edit | pure, legendary |
| barcelona | La Casa de la Pradera | 3568 | tone-edit | fiercely |
| barcelona | Les Enfants Brillants | 1665 | tone-edit | absolute |
| barcelona | Madame Jasmine | 4265 | tone-edit | legendary |
| barcelona | Punto BCN | 108 | editorial-rewrite | ultimate, crown jewel |
| barcelona | Safari Disco | 177 | editorial-rewrite | legendary, pure, ultimate, absolute |
| barcelona | Sauna Casanova | 182 | tone-edit | legendary, pure, absolute |
| beirut | B 018 | 1782 | tone-edit | legendary |
| beirut | Basterma Mano | 1786 | tone-edit | legendary |
| beirut | Ego Beirut at Projekt | 1787 | tone-edit | legendary, absolute |
| beirut | L Abeille D Or | 1788 | tone-edit | legendary, iconic |
| beirut | Om Bar Room | 1785 | tone-edit | fiercely, iconic, legendary, pure |
| belfast | Kremlin | 1584 | tone-edit | iconic |
| belfast | Limelight | 4475 | tone-edit | legendary, iconic, fiercely, pure |
| belfast | Muriel's Cafe Bar | 1586 | tone-edit | fiercely |
| belfast | Paperxclips Books | 4291 | tone-edit | ultimate, fiercely |
| belfast | The Maverick | 1580 | tone-edit | fiercely |
| belfast | The Spaniard | 1581 | tone-edit | legendary, fiercely |
| belfast | The Sunflower Public House | 4474 | tone-edit | absolute, legendary |
| belfast | The Tipsy Bird | 4290 | tone-edit | ultimate, pure, absolute |
| belfast | Union Street Bar | 1585 | tone-edit | ultimate |
| belgrade | 20/44 | 2011 | tone-edit | legendary |
| bergen | Fincken | 3029 | tone-edit | absolute, iconic |
| bergen | Folk & Røvere | 3722 | tone-edit | ultimate, fiercely |
| bergen | Rebel | 3723 | tone-edit | absolute |
| berlin | ArtHotel Connection | 85 | editorial-rewrite | iconic, pure, emoji |
| berlin | Ashoor Bar | 4344 | editorial-rewrite | core-city tone review |
| berlin | Axel Hotel Berlin | 84 | editorial-rewrite | emoji |
| berlin | B:EAST Party | 1064 | editorial-rewrite | core-city tone review |
| berlin | BarbieBar | 4346 | editorial-rewrite | iconic, pure |
| berlin | Berghain | 1 | editorial-rewrite | ultimate, legendary, pure, emoji |
| berlin | Besenkammer | 4345 | editorial-rewrite | legendary, absolute |
| berlin | Betty F*** | 1108 | editorial-rewrite | core-city tone review |
| berlin | Blond | 33 | editorial-rewrite | pure, emoji |
| berlin | Boyberry Berlin | 48 | editorial-rewrite | legendary, emoji |
| berlin | BULL | 3319 | editorial-rewrite | core-city tone review |
| berlin | Bärenhöhle | 1099 | editorial-rewrite | core-city tone review |
| berlin | Bärenhöhle | 3320 | editorial-rewrite | core-city tone review |
| berlin | Böse Buben e.V. | 4349 | editorial-rewrite | absolute |
| berlin | Café / Bar Marienhof | 4338 | tone-edit | ultimate, legendary |
| berlin | Cafe Fatal @ SO36 | 963 | editorial-rewrite | core-city tone review |
| berlin | Café-Bar Himmelreich | 4339 | tone-edit | ultimate, pure |
| berlin | Capture | 1107 | editorial-rewrite | core-city tone review |
| berlin | Club Culture Houze | 965 | editorial-rewrite | core-city tone review |
| berlin | Curly Bar | 4347 | editorial-rewrite | ultimate |
| berlin | Der Boiler | 27 | editorial-rewrite | ultimate, emoji |
| berlin | Der neue Oldtimer | 1101 | editorial-rewrite | core-city tone review |
| berlin | Dreizehn | 36 | editorial-rewrite | emoji |
| berlin | Ficken 3000 | 966 | editorial-rewrite | core-city tone review |
| berlin | FLAX Bar | 4343 | editorial-rewrite | legendary, iconic |
| berlin | Grosse Freiheit 114 | 4350 | editorial-rewrite | legendary |
| berlin | HAFEN | 32 | editorial-rewrite | legendary, iconic, ultimate, emoji |
| berlin | Heile Welt | 34 | editorial-rewrite | ultimate |
| berlin | ILOsBAR | 1105 | editorial-rewrite | core-city tone review |
| berlin | K6 | 37 | editorial-rewrite | emoji |
| berlin | Kurhaus Korsakow | 41 | editorial-rewrite | ultimate, emoji |
| berlin | Lab.oratory @ Berghain | 964 | editorial-rewrite | core-city tone review |
| berlin | Mercure Hotel Berlin Zentrum | 87 | editorial-rewrite | emoji |
| berlin | Mutschmann's | 29 | editorial-rewrite | emoji |
| berlin | Möbel-Olfe | 7 | editorial-rewrite | legendary, absolute |
| berlin | New Action | 3317 | editorial-rewrite | core-city tone review |
| berlin | OXI | 3532 | editorial-rewrite | fiercely |
| berlin | OYA Kollektiv CaféKneipe | 4340 | editorial-rewrite | legendary, fiercely |
| berlin | Prinzknecht | 3 | editorial-rewrite | legendary, emoji |
| berlin | Pussycat | 4342 | editorial-rewrite | absolute, legendary |
| berlin | Rastlos | 4351 | editorial-rewrite | ultimate, legendary |
| berlin | Rauschgold | 49 | editorial-rewrite | core-city tone review |
| berlin | Revolver Party @ KitKatClub | 4168 | editorial-rewrite | core-city tone review |
| berlin | Romeo & Romeo | 40 | editorial-rewrite | pure, emoji |
| berlin | Roses Bar | 8 | editorial-rewrite | wonderland, legendary, absolute, emoji |
| berlin | Salon Zur Wilden Renate | 1992 | editorial-rewrite | core-city tone review |
| berlin | Scheune | 3318 | editorial-rewrite | core-city tone review |
| berlin | SchwuZ | 4169 | editorial-rewrite | core-city tone review |
| berlin | SilverFuture | 1102 | editorial-rewrite | core-city tone review |
| berlin | Sissi | 42 | editorial-rewrite | ultimate, emoji |
| berlin | Sisyphos | 3533 | editorial-rewrite | absolute, wonderland, legendary, fiercely |
| berlin | Sofia | 4341 | editorial-rewrite | core-city tone review |
| berlin | Südblock | 43 | editorial-rewrite | emoji |
| berlin | Südblock | 3534 | editorial-rewrite | core-city tone review |
| berlin | Tabasco | 1100 | editorial-rewrite | core-city tone review |
| berlin | The Coven | 1104 | editorial-rewrite | core-city tone review |
| berlin | Tipsy Bear | 1103 | editorial-rewrite | core-city tone review |
| berlin | Tom's Hotel | 3355 | editorial-rewrite | iconic |
| berlin | Tramp's | 38 | editorial-rewrite | ultimate |
| berlin | Tresor & Ohm | 1993 | editorial-rewrite | legendary |
| berlin | Triebwerk | 4348 | editorial-rewrite | fiercely |
| berlin | Vabali Spa | 31 | editorial-rewrite | ultimate, pure, emoji |
| berlin | Wilde Renate | 3531 | editorial-rewrite | wonderland, legendary, fiercely |
| berlin | WOOF Berlin | 3316 | editorial-rewrite | core-city tone review |
| berlin | XXL-Berlin | 4352 | editorial-rewrite | absolute, wonderland, pure |
| berlin | Zum schmutzigen Hobby | 1106 | editorial-rewrite | core-city tone review |
| berlin | Zum Schmutzigen Hobby | 3535 | editorial-rewrite | legendary, wonderland |
| bilbao | Bar LUZGAS | 4272 | tone-edit | absolute, pure, legendary |
| bilbao | La Revenge | 4270 | tone-edit | ultimate, iconic |
| bilbao | La Sinsorga | 3639 | editorial-rewrite | absolute, wonderland, ultimate, iconic |
| bilbao | Lamiak Casco Viejo | 4271 | tone-edit | legendary |
| bilbao | Mount Cobetas (Kobetamendi) | 4277 | tone-edit | legendary |
| bilbao | Pavoneo | 4266 | tone-edit | pure |
| bilbao | Pepe por Dios | 4267 | tone-edit | ultimate, absolute, pure |
| bilbao | PUB KEY | 4274 | editorial-rewrite | crown jewel, legendary |
| bilbao | Santuario Pub Bilbao | 4268 | tone-edit | pure, fiercely |
| bilbao | The Santu Bear | 3640 | tone-edit | absolute |
| bilbao | Zinegoak Community Hub | 3459 | tone-edit | ultimate, legendary |
| bogota | A Seis Manos | 1683 | tone-edit | legendary |
| bogota | Angel's / The Boys | 4062 | tone-edit | pure |
| bogota | Bar Chiquita Bogota | 1195 | editorial-rewrite | pure, wonderland |
| bogota | Brokeback Mountain LGBT Bar | 1202 | editorial-rewrite | ultimate, wonderland, iconic, absolute |
| bogota | Bulto | 4061 | tone-edit | absolute |
| bogota | Capri Club | 1674 | editorial-rewrite | fiercely, pure, emoji |
| bogota | Disco Jaguar | 1194 | tone-edit | ultimate |
| bogota | El Coq | 1673 | editorial-rewrite | legendary, emoji |
| bogota | El Mozo | 587 | tone-edit | legendary, absolute |
| bogota | El Recreo de Adán | 2224 | tone-edit | iconic |
| bogota | Federal Rooftop | 1669 | editorial-rewrite | legendary, iconic, emoji |
| bogota | Kinder Club | 1672 | editorial-rewrite | legendary, fiercely, emoji |
| bogota | La Estación Café Chapinero | 1682 | tone-edit | absolute, legendary |
| bogota | Living 55 | 1676 | tone-edit | ultimate |
| bogota | Mad Radio Bogotá | 1671 | editorial-rewrite | ultimate, fiercely, emoji |
| bogota | Marino Submarino | 2221 | tone-edit | iconic |
| bogota | Octava | 1670 | editorial-rewrite | fiercely, ultimate, emoji |
| bogota | Polo.El | 2223 | tone-edit | absolute, legendary |
| bogota | The Ghetto Project | 2222 | tone-edit | legendary, iconic, fiercely |
| bogota | The Nudist Mansion | 1677 | editorial-rewrite | ultimate, absolutely, absolute, emoji |
| bogota | Theatron | 586 | tone-edit | legendary |
| bologna | Art Hotel Commercianti | 2213 | tone-edit | absolute, pure |
| bologna | Cosmos Club | 1465 | tone-edit | ultimate, pure |
| bologna | Estravagario | 4358 | tone-edit | absolute |
| bologna | Hotel San Donato | 2212 | tone-edit | absolute, iconic, legendary |
| bologna | IGOR Libreria | 4359 | tone-edit | ultimate, fiercely |
| bologna | Il Barattolo | 1469 | tone-edit | fiercely, ultimate |
| bologna | NOBODY Queer Bar | 3594 | tone-edit | absolute |
| bologna | Red Club | 1471 | editorial-rewrite | absolutely, crown jewel |
| bologna | Senape Vivaio Urbano | 4357 | tone-edit | legendary, iconic |
| bologna | Steam Sauna Bologna | 1466 | tone-edit | absolute |
| bologna | Via della Manifattura | 4356 | tone-edit | legendary, ultimate |
| bologna | Via Zanardi | 4355 | tone-edit | legendary, ultimate |
| bordeaux | Club l'Entrepôt | 3588 | tone-edit | pure |
| bordeaux | Le Singe Vert | 3587 | tone-edit | absolute |
| bratislava | Bukowski Bar | 4076 | tone-edit | ultimate |
| bratislava | Club Sauna Expert | 3385 | tone-edit | ultimate, pure |
| bratislava | Fach Bratislava | 4075 | tone-edit | absolute, ultimate |
| bratislava | Hotel Arcadia | 3976 | editorial-rewrite | wonderland, absolute, pure |
| bratislava | Hotel Devín | 2403 | tone-edit | ultimate |
| bratislava | Nová Cvernovka | 4077 | tone-edit | fiercely |
| bratislava | Pink Whale | 3974 | tone-edit | ultimate |
| bratislava | Sauna Lubo | 3973 | tone-edit | pure |
| bratislava | Urban House | 3972 | tone-edit | ultimate |
| brighton | Affinity Bar | 3739 | tone-edit | ultimate |
| brighton | Bar Broadway | 401 | tone-edit | ultimate |
| brighton | Bar Revenge | 4292 | tone-edit | absolute, iconic, ultimate, legendary |
| brighton | Bearly Awake | 3746 | tone-edit | ultimate |
| brighton | Brighton Dungeon | 4481 | tone-edit | ultimate, absolute |
| brighton | Brighton Naturist Beach | 4294 | tone-edit | legendary |
| brighton | Club Revenge Basement | 402 | editorial-rewrite | crown jewel, pure, legendary |
| brighton | Duke's Mound Gardens | 399 | tone-edit | legendary |
| brighton | Legends Hotel | 4174 | tone-edit | iconic |
| brighton | LUST! | 4480 | tone-edit | legendary, ultimate, absolute |
| brighton | Nautilus Lounge | 4477 | tone-edit | absolute |
| brighton | Pussy Home Boutique | 4479 | tone-edit | absolute, ultimate, iconic, pure |
| brighton | The Actors | 3737 | tone-edit | legendary |
| brighton | The Basement Club at Legends | 115 | editorial-rewrite | pure |
| brighton | The Bedford Tavern | 3740 | tone-edit | ultimate, legendary, fiercely, iconic, absolutely |
| brighton | The Boiler Room Sauna | 3744 | tone-edit | fiercely |
| brighton | The Grosvenor Bar | 3741 | tone-edit | ultimate, fiercely |
| brighton | The Ledward Centre | 3747 | tone-edit | legendary, ultimate |
| brighton | The Marine Tavern | 4476 | tone-edit | absolute |
| brighton | The Queens Arms | 395 | tone-edit | legendary, pure, legendary |
| brighton | The Village Brighton | 4293 | tone-edit | ultimate |
| brighton | The Zone Bar | 3742 | tone-edit | ultimate, pure |
| brighton | Volks Club | 397 | tone-edit | legendary |
| brisbane | Crystalbrook Vincent | 4130 | tone-edit | iconic, fiercely |
| brisbane | Fluffy | 3087 | tone-edit | legendary, absolute, iconic |
| brisbane | Hotel X Brisbane Fortitude Valley | 2518 | tone-edit | absolute, iconic, fiercely, ultimate |
| brisbane | Little Black Pug | 3091 | tone-edit | ultimate, absolute |
| brisbane | The Beat Megaclub | 3084 | tone-edit | absolute, pure, absolutely |
| brisbane | The Calile Hotel | 2517 | editorial-rewrite | absolute, crown jewel, pure, ultimate |
| brisbane | The Sportsman Hotel | 3086 | tone-edit | fiercely |
| brisbane | The Wickham | 3085 | editorial-rewrite | crown jewel, legendary |
| brisbane | The Wickham Kitchen & Sporties Bistro | 4129 | tone-edit | fiercely, absolute |
| bristol | Chance & Counters | 4296 | tone-edit | ultimate, pure |
| bristol | Lakota | 4467 | tone-edit | pure, legendary |
| bristol | Lost Horizon Arts Centre & Bar | 4468 | tone-edit | legendary |
| bristol | The Bootlegger | 4470 | tone-edit | fiercely, legendary, absolute |
| bristol | The Bristol Folk House Cafe | 4472 | tone-edit | ultimate |
| bristol | The Cocktail Club | 4469 | tone-edit | pure |
| bristol | The Downs (Clifton Down / Durdham Down) | 4297 | tone-edit | legendary |
| bristol | Watershed Cafe & Bar | 4471 | tone-edit | absolute, fiercely |
| brno | Café MonRo | 3883 | tone-edit | pure |
| brno | DarkCat | 3885 | tone-edit | absolute |
| brno | Freedom Nights | 3882 | tone-edit | pure, legendary |
| brno | Las Palmas | 3884 | tone-edit | pure |
| brno | Metro Music Club | 3881 | tone-edit | legendary |
| brussels | Bedford Hotel & Congress Centre | 2282 | editorial-rewrite | absolute |
| brussels | C12 | 2040 | editorial-rewrite | absolute |
| brussels | Café Fontainas | 205 | editorial-rewrite | ultimate, legendary, iconic |
| brussels | Chez Maman | 201 | editorial-rewrite | legendary, ultimate, pure |
| brussels | Fuse | 207 | editorial-rewrite | pure, legendary, fiercely |
| brussels | Homo Erectus | 203 | editorial-rewrite | absolute |
| brussels | Hotel Alma Grand Place | 2283 | editorial-rewrite | absolute |
| brussels | La Reserve | 202 | editorial-rewrite | ultimate, iconic, pure |
| brussels | Le Baroque | 3749 | editorial-rewrite | pure |
| brussels | Le Belgica | 95 | editorial-rewrite | fiercely, ultimate |
| brussels | Le Dolores | 3750 | editorial-rewrite | core-city tone review |
| brussels | Macho Sauna | 3751 | editorial-rewrite | core-city tone review |
| brussels | Motel One Brussels | 2280 | editorial-rewrite | core-city tone review |
| brussels | Oasis Sauna | 3752 | editorial-rewrite | core-city tone review |
| brussels | Parc de Bruxelles (Warandepark) | 3753 | editorial-rewrite | legendary |
| brussels | Stammbar | 206 | editorial-rewrite | core-city tone review |
| brussels | Station BXL | 96 | editorial-rewrite | ultimate, iconic |
| brussels | The Agenda | 208 | editorial-rewrite | crown jewel, fiercely, pure, absolutely |
| brussels | The Dominican | 2281 | editorial-rewrite | absolute |
| brussels | The QueeR-Code / Rainbowhouse Brussels | 3754 | editorial-rewrite | fiercely |
| brussels | The Usual Brussels | 2279 | editorial-rewrite | core-city tone review |
| bucharest | Control Club | 4001 | tone-edit | legendary |
| bucharest | Heavy Yard | 4003 | tone-edit | pure |
| bucharest | Iub Bar | 752 | tone-edit | ultimate |
| bucharest | Lente | 4005 | tone-edit | ultimate |
| bucharest | The Q Club | 749 | editorial-rewrite | crown jewel, absolute |
| budapest | Habroló | 493 | tone-edit | ultimate, legendary |
| budapest | Magnum Sauna | 459 | tone-edit | iconic |
| budapest | Why Not Cafe & Bar | 458 | tone-edit | ultimate, legendary |
| buenos_aires | Bosques de Palermo (Cruising Area) | 838 | tone-edit | ultimate |
| buenos_aires | Boys Bar / Grupo Los Fiesteros | 4036 | tone-edit | iconic, absolute, fiercely, ultimate |
| buenos_aires | Buenos Aires A Full | 4037 | tone-edit | pure, legendary |
| buenos_aires | Casa Brandon | 4034 | tone-edit | absolute |
| buenos_aires | Club 69 | 420 | tone-edit | legendary |
| buenos_aires | Cocoliche | 1133 | editorial-rewrite | emoji |
| buenos_aires | Contramano | 4032 | tone-edit | absolute, legendary |
| buenos_aires | Fiesta Nix | 421 | editorial-rewrite | fiercely |
| buenos_aires | Fiesta Plop | 4031 | editorial-rewrite | absolute, wonderland |
| buenos_aires | Fiesta Puerca | 1130 | editorial-rewrite | absolutely, legendary, absolute, pure, emoji |
| buenos_aires | Fiesta y Bar Jolie | 1129 | editorial-rewrite | emoji |
| buenos_aires | Glam | 418 | tone-edit | legendary |
| buenos_aires | Ilum Experience Home | 4041 | tone-edit | pure |
| buenos_aires | Le Petit Palais | 4040 | tone-edit | legendary |
| buenos_aires | Madison Club de Hombres | 4035 | tone-edit | pure |
| buenos_aires | Maricafé | 4038 | tone-edit | ultimate, absolute |
| buenos_aires | Pride Café | 417 | tone-edit | ultimate, legendary |
| buenos_aires | Zoom | 419 | tone-edit | pure |
| busan | Banana Busan | 4122 | tone-edit | ultimate, legendary, pure |
| busan | Busan BUNKER | 1772 | tone-edit | pure |
| busan | DACK BUSAN CLUB | 4120 | tone-edit | absolute, legendary |
| busan | G-men Bar | 4123 | tone-edit | ultimate |
| busan | HQ Gwangan | 4124 | tone-edit | legendary, absolute |
| busan | K-Sauna | 4126 | tone-edit | absolute |
| busan | Rock | 4121 | tone-edit | absolute |
| busan | TightHall | 1769 | tone-edit | absolute |
| busan | TOOL | 1766 | tone-edit | legendary |
| calgary | Alt Hotel Calgary East Village | 2525 | tone-edit | absolute |
| calgary | The Dorian, Autograph Collection | 2524 | tone-edit | ultimate |
| cali | Amaranta Bar | 2613 | editorial-rewrite | pure, ultimate, wonderland |
| cali | Ladies Night | 2615 | editorial-rewrite | crown jewel |
| cali | Macondo Café | 2623 | tone-edit | fiercely |
| cali | Metropolis Club de Hombres | 2622 | tone-edit | pure, legendary |
| cali | Mundano Bar | 2617 | tone-edit | pure |
| cali | NOW Hotel | 2624 | editorial-rewrite | ultimate, absolute, crown jewel |
| cali | Phisicus 21 Sauna | 2619 | tone-edit | pure |
| cali | Queens | 2618 | editorial-rewrite | crown jewel, absolute |
| cali | Regia Bar | 2614 | tone-edit | ultimate |
| cali | Relax Men | 2620 | tone-edit | pure |
| cali | SIXTH HOUSE SUITE | 2625 | tone-edit | absolute, iconic |
| canberra | 88mph | 3092 | tone-edit | ultimate, pure |
| canberra | Fiction Club | 4131 | tone-edit | fiercely |
| canberra | Smith's Alternative | 3093 | editorial-rewrite | wonderland |
| canberra | The Dickson Tradies | 4132 | tone-edit | fiercely |
| canberra | The Ranch | 2937 | tone-edit | absolute |
| canberra | Tilley's Divine Cafe | 3095 | tone-edit | legendary, iconic |
| cancun | MERO 18 | 3954 | tone-edit | fiercely |
| cancun | Onda Café | 3955 | tone-edit | ultimate, pure |
| cape_town | Club Tai Pan | 1316 | tone-edit | legendary |
| cape_town | Crew Bar | 667 | tone-edit | absolute |
| cape_town | Duchess Lounge | 1311 | tone-edit | fiercely, ultimate, absolute |
| cape_town | Evol | 1312 | tone-edit | ultimate, fiercely |
| cape_town | Gat Party | 1310 | tone-edit | legendary, pure |
| cape_town | Harringtons Cocktail Lounge | 1305 | tone-edit | pure, legendary |
| cape_town | Honey & Dora | 4057 | editorial-rewrite | absolute, crown jewel |
| cape_town | Modular | 2064 | tone-edit | absolute, pure |
| cape_town | Sandy Bay | 4056 | tone-edit | pure, legendary |
| cape_town | StarGayzers | 1309 | tone-edit | legendary, pure |
| cape_town | The Boardhouse | 1308 | tone-edit | legendary, pure |
| cape_town | The Glen Toilets | 4055 | tone-edit | pure |
| cape_town | The Sunshine Food Sprouting Co | 1313 | tone-edit | legendary |
| cape_town | Zero21 | 3334 | tone-edit | iconic, absolutely |
| caracas | Dos Barras | 2239 | tone-edit | absolute, legendary, iconic |
| caracas | Melia Caracas | 2235 | tone-edit | iconic |
| cardiff | Bute Park | 4298 | tone-edit | legendary |
| cardiff | Eclipse Cardiff | 2822 | tone-edit | pure, fiercely |
| cardiff | Pulse Cardiff | 2824 | tone-edit | absolute |
| chania | Ababa | 2990 | tone-edit | pure |
| chania | Da Vinci Bar Club on Apollo Party nights | 2992 | tone-edit | pure |
| chania | Elia Zampeliou | 3906 | tone-edit | iconic |
| chania | Garage Nightclub | 3900 | tone-edit | legendary |
| chania | Vazaki Reloaded | 3899 | tone-edit | pure, fiercely |
| chiang_mai | Ram Bar | 1504 | tone-edit | absolutely |
| chicago | Big Chicks | 3201 | tone-edit | legendary |
| chicago | Cell Block | 4573 | tone-edit | pure |
| chicago | Fantasy Nightclub | 4571 | tone-edit | legendary |
| chicago | Hydrate | 437 | tone-edit | absolute |
| chicago | Roscoe's Tavern | 4572 | tone-edit | legendary, absolute |
| chicago | The Closet | 959 | tone-edit | legendary |
| cluj_napoca | After Eight Cocktail Club | 4009 | tone-edit | legendary, pure |
| cluj_napoca | Enigma | 4012 | tone-edit | absolute |
| cluj_napoca | Flying Circus Cluj | 2945 | tone-edit | ultimate, legendary |
| cluj_napoca | Insomnia Pub | 4010 | tone-edit | absolute |
| cluj_napoca | MATTER | 2932 | tone-edit | pure |
| cluj_napoca | OUTside / Q Club | 4008 | tone-edit | pure |
| cluj_napoca | Urania Social Hub | 2929 | tone-edit | ultimate, pure |
| cologne | Artheater | 245 | tone-edit | legendary |
| cologne | Backstage Diaries | 4505 | tone-edit | legendary |
| cologne | Bootshaus | 101 | editorial-rewrite | absolute, legendary |
| cologne | Café RICO | 4516 | tone-edit | ultimate |
| cologne | Club Bahnhof Ehrenfeld | 237 | tone-edit | pure |
| cologne | Cranachwäldchen (Nippes) | 1828 | tone-edit | legendary |
| cologne | Die Mumu | 236 | tone-edit | iconic |
| cologne | Die Wohngemeinschaft Hostel | 1826 | tone-edit | fiercely, absolute |
| cologne | ExCorner | 102 | editorial-rewrite | legendary |
| cologne | Gewölbe | 2038 | tone-edit | absolute |
| cologne | Hotel Flandrischer Hof | 1822 | tone-edit | absolute, legendary |
| cologne | Hotel The Circle | 1825 | tone-edit | legendary |
| cologne | Kattwinkel Bar & Cafe | 4507 | tone-edit | ultimate |
| cologne | Kinkz | 4514 | tone-edit | legendary |
| cologne | Maritim Hotel | 1827 | tone-edit | absolutely |
| cologne | My Lord by Olli | 4511 | tone-edit | ultimate, iconic, pure, legendary |
| cologne | Nachteule | 4506 | tone-edit | legendary |
| cologne | Odonien | 2039 | tone-edit | legendary |
| cologne | Phoenix Sauna | 240 | editorial-rewrite | crown jewel, legendary, absolute |
| cologne | Pullermanns | 3322 | tone-edit | legendary |
| cologne | Schaafenstraße | 244 | tone-edit | legendary |
| cologne | Schampanja | 4510 | tone-edit | legendary |
| cologne | Yuca Club | 246 | tone-edit | legendary, iconic, ultimate |
| cologne | Zum Pitter | 4513 | tone-edit | legendary, absolute |
| copenhagen | Amigo Sauna | 81 | editorial-rewrite | pure, emoji |
| copenhagen | Body Bio | 83 | editorial-rewrite | emoji |
| copenhagen | Centralhjørnet | 73 | editorial-rewrite | legendary, emoji |
| copenhagen | Centre Stage | 227 | tone-edit | ultimate |
| copenhagen | DAS (Den Anden Side) | 79 | editorial-rewrite | crown jewel, legendary, pure, emoji |
| copenhagen | Essence | 2210 | tone-edit | pure |
| copenhagen | Jailhouse CPH | 75 | editorial-rewrite | ultimate, emoji |
| copenhagen | Jolene Bar | 2003 | tone-edit | fiercely |
| copenhagen | MEN's Bar | 74 | editorial-rewrite | ultimate, pure, legendary, emoji |
| copenhagen | Module | 2201 | tone-edit | fiercely, iconic, legendary |
| copenhagen | Oscar Bar | 233 | tone-edit | ultimate |
| copenhagen | Rust | 80 | editorial-rewrite | legendary, emoji |
| copenhagen | Scandinavian Leather Men (SLM) Copenhagen | 82 | editorial-rewrite | ultimate, pure, legendary, emoji |
| copenhagen | Ørstedsparken | 941 | editorial-rewrite | iconic, legendary, emoji |
| cordoba | Club Paraguay | 2890 | tone-edit | legendary |
| cordoba | Clubb 466 | 2881 | tone-edit | fiercely |
| cordoba | Europa Disco | 2889 | tone-edit | pure, iconic |
| cordoba | H. Edon Spa | 2901 | tone-edit | ultimate |
| cordoba | Housing Club | 2900 | tone-edit | absolute |
| cordoba | Solutto Bar | 2871 | tone-edit | legendary |
| cordoba | X Bar | 2897 | tone-edit | legendary, fiercely |
| cordoba | Zen Disco | 2902 | tone-edit | legendary, ultimate |
| corfu | 54 Dreamy Nights | 3908 | editorial-rewrite | wonderland, pure |
| corfu | Ambelonas Corfu | 3913 | tone-edit | fiercely |
| corfu | Iznogood Rock Bar | 3910 | tone-edit | fiercely |
| corfu | Myrtiotissa Beach | 3912 | tone-edit | iconic, legendary |
| corfu | Polytechno | 3907 | tone-edit | ultimate |
| cork | The Silly Goose | 3729 | tone-edit | pure |
| crete | Apollo Party Crete | 1462 | editorial-rewrite | crown jewel |
| crete | Kavros Beach | 1460 | tone-edit | absolute |
| crete | Sarandari Nude Beach | 3916 | tone-edit | absolute |
| crete | Taverna Harakas | 3917 | tone-edit | legendary |
| crete | Y.O.L.O Bar | 3914 | tone-edit | pure, legendary |
| cyprus | Governor's Gay Beach | 1478 | tone-edit | pure |
| dallas | Barbara's Pavilion | 4564 | tone-edit | legendary, ultimate |
| dallas | Deep Vellum Books | 4570 | editorial-rewrite | fiercely, crown jewel |
| dallas | EatZi's Market & Bakery | 4566 | tone-edit | iconic |
| dallas | Havana | 4561 | tone-edit | pure, absolute, legendary |
| dallas | Little Ruby's Cafe | 4567 | tone-edit | iconic |
| dallas | Pekers Bar | 4563 | tone-edit | ultimate, legendary |
| dallas | ReView Lounge Dallas | 4565 | tone-edit | iconic, absolutely |
| dallas | The Tin Room | 4562 | tone-edit | fiercely, ultimate |
| denver | R&R Lounge | 4486 | tone-edit | absolute, legendary, iconic |
| denver | The Rose Room Cafe | 4488 | tone-edit | absolute, ultimate |
| denver | Trade | 4487 | tone-edit | iconic, absolute |
| dublin | Basic Instincts | 4484 | tone-edit | iconic, fiercely |
| dublin | Dollymount Strand | 4485 | tone-edit | iconic |
| dublin | DV8 | 303 | tone-edit | ultimate, fiercely |
| dublin | Generator Dublin | 1549 | tone-edit | absolute |
| dublin | Mother Club | 298 | tone-edit | ultimate, pure |
| dublin | Pantibar Terrace | 305 | tone-edit | legendary |
| dublin | Pennylane Bar | 3158 | tone-edit | iconic |
| dublin | Ruby Molly Hotel | 1548 | tone-edit | absolutely, ultimate, pure |
| dublin | Spinster | 300 | tone-edit | ultimate, iconic |
| dublin | Street 66 | 297 | tone-edit | ultimate |
| dublin | Sweatbox | 4482 | tone-edit | legendary, fiercely, pure |
| dublin | The College Green Hotel | 1547 | tone-edit | fiercely, absolute, pure |
| dublin | The George | 128 | editorial-rewrite | iconic, pure |
| dublin | The Temple Bar Hotel | 3728 | tone-edit | absolute |
| dublin | Wigwam | 2048 | editorial-rewrite | wonderland |
| dusseldorf | Bar Studio 1 | 2879 | tone-edit | fiercely |
| dusseldorf | Comeback | 2873 | tone-edit | ultimate, pure |
| dusseldorf | Globus | 3575 | tone-edit | legendary |
| dusseldorf | K1 Club | 2895 | tone-edit | ultimate |
| dusseldorf | Ludwigs Bier und Brot | 2872 | tone-edit | legendary |
| dusseldorf | Queenz | 2886 | tone-edit | ultimate, pure |
| dusseldorf | SCHAMLOS | 4517 | tone-edit | ultimate, iconic, legendary, absolute |
| dusseldorf | Volksgarten / Südpark | 3576 | tone-edit | legendary |
| dusseldorf | Zum Kwadrat | 3577 | tone-edit | ultimate |
| edinburgh | Alva House | 4465 | tone-edit | ultimate, iconic, absolute |
| edinburgh | Bistro Coco | 4462 | tone-edit | pure |
| edinburgh | CC Blooms | 772 | editorial-rewrite | iconic, absolute, crown jewel, legendary |
| edinburgh | DILF | 3150 | tone-edit | absolute, legendary |
| edinburgh | Fir Espresso Bar | 4463 | tone-edit | ultimate |
| edinburgh | Hot Mess | 4299 | tone-edit | legendary, pure |
| edinburgh | House of Gods Edinburgh | 2522 | tone-edit | ultimate, pure |
| edinburgh | Paradise Palms | 776 | editorial-rewrite | absolute, wonderland, iconic, legendary |
| edinburgh | Paradise Palms | 4302 | editorial-rewrite | wonderland, fiercely, ultimate |
| edinburgh | Planet Bar | 774 | tone-edit | pure |
| edinburgh | Sneaky Pete's | 2046 | tone-edit | fiercely, absolute |
| edinburgh | The Dog House | 4300 | tone-edit | legendary, ultimate |
| edinburgh | The Glasshouse, Autograph Collection | 2520 | tone-edit | ultimate |
| edinburgh | The Subway Cowgate | 4459 | tone-edit | ultimate, pure, absolute |
| edinburgh | The Theatre Royal Bar | 4301 | tone-edit | ultimate, iconic |
| edinburgh | The Wee Red Bar | 4458 | tone-edit | ultimate, pure |
| edinburgh | Tigerlily | 2521 | tone-edit | pure, absolute, ultimate |
| florence | Bossy @ Soul Kitchen | 3593 | tone-edit | legendary |
| florence | BOSSY @ Soul Kitchen | 4360 | tone-edit | ultimate, iconic |
| florence | Cascine Park | 4361 | tone-edit | ultimate, legendary |
| florence | Circolo Fabrik | 983 | tone-edit | pure |
| florence | Crisco | 969 | tone-edit | iconic |
| florence | Crisco Club Firenze | 982 | tone-edit | legendary |
| florence | Pink Street Club | 3591 | tone-edit | iconic |
| florence | Plus Florence | 4364 | tone-edit | ultimate |
| florence | Queer Factory | 967 | tone-edit | absolute, iconic, legendary |
| florence | Todo Modo bookstore | 4362 | tone-edit | ultimate |
| florence | Viktoria Lounge Bar | 3592 | tone-edit | absolute |
| florence | YAB Firenze | 984 | tone-edit | ultimate |
| florianopolis | Bar do Deca | 3110 | tone-edit | absolute, legendary, iconic |
| florianopolis | For Homme | 3116 | tone-edit | fiercely |
| florianopolis | Jivago Social Club | 1226 | tone-edit | legendary, pure |
| florianopolis | Sapateco Bar & Cultura | 3111 | tone-edit | fiercely |
| florianopolis | UNDR Floripa | 3112 | tone-edit | absolute, pure, iconic, fiercely |
| frankfurt | 25hours Hotel Frankfurt The Trip | 3121 | tone-edit | absolute |
| frankfurt | Bar Central | 3578 | tone-edit | legendary |
| frankfurt | Bar.Café.Kultur. Switchboard | 3124 | tone-edit | legendary, fiercely |
| frankfurt | Club Bizarre | 4519 | tone-edit | fiercely |
| frankfurt | Comeback Bar & Lounge | 3581 | tone-edit | iconic |
| frankfurt | Grande Opera | 4521 | tone-edit | ultimate |
| frankfurt | Karlson | 3580 | tone-edit | pure, legendary |
| frankfurt | Lucky's | 433 | tone-edit | absolute, legendary, pure |
| frankfurt | Metropol Sauna | 435 | tone-edit | legendary |
| frankfurt | Na Und | 4520 | tone-edit | ultimate, fiercely |
| frankfurt | PINK Frankfurt | 434 | tone-edit | pure |
| frankfurt | Saunawerk | 473 | tone-edit | pure |
| frankfurt | Tanzhaus West | 2035 | tone-edit | fiercely, legendary |
| frankfurt | TWIST Bar | 3579 | tone-edit | ultimate |
| frankfurt | Zum Schwejk | 3123 | editorial-rewrite | legendary, wonderland |
| geneva | 360 Fever | 620 | tone-edit | legendary, iconic |
| geneva | Club Duplexx | 625 | tone-edit | pure |
| geneva | L'Usine / PTR | 3858 | tone-edit | legendary, ultimate, iconic, fiercely |
| geneva | Le Declic Bar | 619 | tone-edit | absolute, legendary, ultimate |
| geneva | Le Phare | 621 | tone-edit | absolute |
| geneva | Nathan Cafe | 618 | tone-edit | pure |
| glasgow | AXM Club Glasgow | 1359 | tone-edit | iconic |
| glasgow | Category Is Books | 3555 | tone-edit | fiercely |
| glasgow | Club X | 4303 | tone-edit | legendary, absolute |
| glasgow | Delmonicas | 1350 | tone-edit | absolute |
| glasgow | Katie's Bar | 1349 | tone-edit | ultimate |
| glasgow | La Cheetah Club | 2044 | tone-edit | ultimate |
| glasgow | Merchant Pride | 1354 | tone-edit | ultimate |
| glasgow | Sub Club | 1998 | tone-edit | legendary, pure |
| glasgow | The Corset Club | 1357 | tone-edit | pure |
| glasgow | The Gallery Bar | 1356 | editorial-rewrite | absolute |
| glasgow | The Glad Cafe CIC | 4306 | tone-edit | legendary |
| glasgow | The Polo Lounge | 1351 | editorial-rewrite | crown jewel |
| glasgow | The Waterloo Bar | 1361 | tone-edit | iconic, pure, legendary |
| glasgow | Woody's | 1352 | tone-edit | legendary, pure |
| gothenburg | Gretas | 2089 | editorial-rewrite | crown jewel, pure, ultimate |
| gothenburg | Park Lane | 2093 | tone-edit | legendary, pure |
| gran_canaria | Adonis | 506 | tone-edit | legendary |
| gran_canaria | Birdcage Gay Resort | 3644 | tone-edit | ultimate |
| gran_canaria | Bohemia Suites Rooftop | 361 | tone-edit | pure |
| gran_canaria | Bärenhöhle | 507 | tone-edit | legendary |
| gran_canaria | Centre Stage Bar | 3650 | tone-edit | ultimate, iconic |
| gran_canaria | Cruise Bar | 3648 | editorial-rewrite | absolute, legendary, wonderland, pure |
| gran_canaria | Fahana Men Only Hotel | 3351 | editorial-rewrite | pure, crown jewel, ultimate |
| gran_canaria | Funny Boys | 365 | tone-edit | pure, absolute |
| gran_canaria | Macho Macho bei Andre | 3659 | tone-edit | ultimate, legendary, pure |
| gran_canaria | Mantrix Club | 112 | editorial-rewrite | iconic |
| gran_canaria | Maspalomas Dunes | 363 | tone-edit | ultimate, legendary |
| gran_canaria | Mykonos Bar GC | 366 | tone-edit | legendary |
| gran_canaria | Reds Club | 3654 | tone-edit | absolute |
| gran_canaria | Ritz Club | 362 | tone-edit | ultimate |
| gran_canaria | Sauna Enjoy | 505 | tone-edit | ultimate, pure |
| gran_canaria | Seven Hotel & Wellness | 3350 | tone-edit | absolute |
| gran_canaria | Sparkles Show Bar | 357 | tone-edit | pure, absolute |
| gran_canaria | Terry Show Bar | 3643 | tone-edit | pure, absolute |
| gran_canaria | The Factory Cruising Bar | 3652 | tone-edit | pure |
| gran_canaria | Tom's Cruising Bar | 3653 | tone-edit | absolute |
| gran_canaria | Vista Bonita Gay Resort | 3646 | tone-edit | ultimate |
| gran_canaria | WunderBar | 3649 | tone-edit | pure, ultimate, legendary, iconic |
| gran_canaria | Yumbo Center | 355 | tone-edit | legendary |
| gran_canaria | Zoo Mens Bar | 3655 | tone-edit | legendary |
| granada | ECLIPSE BAR & PUB | 3020 | tone-edit | absolute |
| granada | Industrial Copera | 3026 | tone-edit | absolutely, legendary |
| granada | Perfíl | 4278 | tone-edit | absolute |
| granada | Pub La Sal | 2729 | tone-edit | ultimate, legendary |
| granada | Pub TicTac Granada | 3021 | tone-edit | pure |
| granada | Sala El Tren | 3027 | tone-edit | legendary, fiercely |
| granada | Six Colours | 2725 | editorial-rewrite | pure, wonderland |
| guadalajara | Babel | 842 | editorial-rewrite | pure, crown jewel |
| guadalajara | Caudillos Disco | 778 | tone-edit | absolute |
| guadalajara | Circus Bar | 3959 | tone-edit | pure |
| guadalajara | Club California | 3957 | tone-edit | legendary, absolute |
| guadalajara | Club183 | 844 | editorial-rewrite | wonderland |
| guadalajara | Eagle GDL | 781 | tone-edit | pure, ultimate, legendary |
| guadalajara | El Gato Cafe | 847 | tone-edit | iconic |
| guadalajara | Envy Guadalajara | 3956 | tone-edit | pure, legendary |
| guadalajara | Equilibrio Discotheque | 779 | tone-edit | ultimate |
| guadalajara | Galeón | 3958 | editorial-rewrite | wonderland, pure |
| guadalajara | Riilax Sauna | 843 | tone-edit | pure, ultimate |
| guadalajara | Voltio guadalajara | 3960 | tone-edit | pure |
| hamburg | 136 Grad | 3133 | editorial-rewrite | crown jewel |
| hamburg | BABYLON @ Club Bahnhof Pauli | 468 | tone-edit | absolute |
| hamburg | Babylon Hamburg | 4524 | tone-edit | ultimate |
| hamburg | Bellini Bar | 3132 | tone-edit | ultimate |
| hamburg | Café Gnosa | 3129 | tone-edit | absolute, pure |
| hamburg | Café Uhrlaub | 3130 | tone-edit | absolute, fiercely, legendary |
| hamburg | Extratour | 466 | tone-edit | ultimate |
| hamburg | Furiosa Party | 4523 | tone-edit | ultimate, iconic, legendary |
| hamburg | Hotel Wedina | 3127 | tone-edit | ultimate |
| hamburg | Kyti Voo | 4526 | tone-edit | legendary, absolute, ultimate |
| hamburg | M&V Bar | 467 | tone-edit | legendary, iconic |
| hamburg | Olivia Jones Bar | 427 | tone-edit | ultimate, iconic, legendary |
| hamburg | Pick Up | 3131 | tone-edit | ultimate |
| hamburg | PiNK INC. | 469 | tone-edit | legendary, iconic, pure |
| hamburg | Sparta Junior Gay Sex Kino | 4525 | tone-edit | legendary, pure, ultimate |
| hamburg | TOM'S Hamburg | 3136 | tone-edit | legendary, ultimate |
| hamburg | WunderBar | 428 | tone-edit | iconic, legendary |
| havana | Cabaret Las Vegas | 1028 | tone-edit | pure, legendary |
| havana | Fabrica de Arte Cubano | 1001 | tone-edit | iconic |
| havana | La Gruta | 1030 | tone-edit | legendary |
| helsinki | Hercules Gay Nightclub | 758 | tone-edit | absolute |
| helsinki | Kaiku | 2005 | tone-edit | pure |
| helsinki | Keltainen Ruusu / Yellow Rose | 3726 | tone-edit | absolute, ultimate, legendary, pure |
| helsinki | Mann's Street | 760 | tone-edit | legendary, pure |
| helsinki | Pub Fairytale | 3724 | tone-edit | pure, ultimate |
| helsinki | Sauna Con Hombres | 762 | tone-edit | legendary |
| helsinki | Street Pride Bar | 761 | tone-edit | ultimate |
| helsinki | Ääniwalli | 3725 | tone-edit | legendary, ultimate |
| ho_chi_minh | The Observatory | 2051 | tone-edit | absolute |
| houston | 13 Celsius | 4315 | tone-edit | pure, absolute |
| houston | Crocker Bar | 4310 | tone-edit | fiercely, legendary |
| houston | Crystal Nightclub | 4312 | tone-edit | legendary, pure, iconic |
| houston | JR's Bar & Grill | 2663 | tone-edit | absolute, legendary, fiercely, ultimate |
| houston | Los Robles | 4311 | editorial-rewrite | absolute, fiercely, wonderland |
| houston | Neon Boots Dancehall & Saloon | 2667 | editorial-rewrite | pure, legendary, crown jewel |
| houston | Pearl Bar Houston | 2649 | tone-edit | iconic |
| houston | Rich’s Houston | 4313 | editorial-rewrite | absolute, legendary, wonderland |
| houston | South Beach Houston | 2647 | tone-edit | legendary, pure, iconic, absolute |
| houston | The Montrose Country Club | 4314 | tone-edit | legendary |
| houston | Varsity Bar | 4309 | tone-edit | iconic, absolute, legendary |
| houston | Wanderstay Boutique Hotel | 4316 | tone-edit | pure, ultimate |
| ibiza | Bar 22 | 3664 | tone-edit | legendary, ultimate |
| ibiza | Bar Monalisa | 686 | tone-edit | fiercely |
| ibiza | Bar Nini | 3673 | tone-edit | pure |
| ibiza | DADO Bar | 688 | editorial-rewrite | pure, legendary, wonderland |
| ibiza | Exis Bar | 4279 | tone-edit | fiercely, absolute, legendary |
| ibiza | Flash | 3669 | tone-edit | ultimate, legendary, fiercely, pure |
| ibiza | Glitterbox | 3668 | tone-edit | absolute, legendary |
| ibiza | Hotel Marigna | 4282 | tone-edit | legendary |
| ibiza | La Nada | 4280 | tone-edit | iconic, legendary |
| ibiza | Lady D. | 687 | tone-edit | absolute, legendary, iconic |
| ibiza | Lolas Club Ibiza | 3667 | tone-edit | absolute, legendary |
| ibiza | Sunrise Ibiza | 3663 | editorial-rewrite | legendary, wonderland, ultimate |
| ibiza | The Deep Club | 4281 | tone-edit | ultimate |
| innsbruck | Bacchus | 3079 | editorial-rewrite | fiercely, crown jewel |
| innsbruck | Funkraum on Queer Attack nights | 2998 | tone-edit | iconic, absolute |
| innsbruck | Hawaii-Strand (Kranebitter Innauen) | 3865 | tone-edit | legendary |
| innsbruck | M+M Bar | 3081 | tone-edit | ultimate, legendary, fiercely |
| innsbruck | Tante Emma Club | 3082 | editorial-rewrite | pure, fiercely, wonderland |
| johannesburg | And Club | 2065 | tone-edit | absolute |
| johannesburg | Enter Bar | 4059 | tone-edit | ultimate, pure |
| johannesburg | Kitchener's Carvery Bar | 1601 | tone-edit | absolutely, ultimate |
| johannesburg | Liquid Blue | 1593 | tone-edit | absolute, legendary, ultimate |
| johannesburg | Pablo Dos Manos | 1597 | tone-edit | absolutely |
| johannesburg | Ratz Bar | 1596 | tone-edit | absolute |
| johannesburg | Sky Club | 4058 | tone-edit | pure |
| johannesburg | The Factory | 1604 | tone-edit | pure, ultimate |
| koh_samui | SALA Samui Chaweng Beach Resort | 1538 | tone-edit | pure, ultimate |
| koh_samui | Samui Mojito Lab | 1535 | editorial-rewrite | absolute, emoji |
| koh_samui | The Green Mango Club | 1534 | editorial-rewrite | absolute |
| koh_samui | The Road Less Travelled. The RLT | 1536 | tone-edit | fiercely |
| krakow | Ciemnia Club | 1904 | tone-edit | legendary |
| krakow | Club Papuga | 1903 | tone-edit | absolute |
| krakow | SLAY SPACE | 1900 | editorial-rewrite | absolute, crown jewel, iconic |
| krakow | The Little Havana Party Hostel | 1898 | tone-edit | absolute |
| krakow | ZOO Klub | 1902 | tone-edit | absolute, pure |
| kyoto | Ace Hotel | 4099 | editorial-rewrite | absolute, crown jewel, legendary |
| kyoto | Apple | 3485 | tone-edit | fiercely, legendary, iconic, absolute |
| kyoto | BAR LOOK ME Kyoto | 4092 | tone-edit | fiercely, absolute |
| kyoto | Bell Kyoto | 3486 | tone-edit | absolute |
| kyoto | Calcium House | 4094 | tone-edit | legendary, iconic |
| kyoto | CLUB METRO | 3489 | tone-edit | absolute, legendary |
| kyoto | Macho Bar | 4095 | tone-edit | absolutely, pure, absolute |
| kyoto | Mr. Maurice’s Italian | 4098 | editorial-rewrite | absolute |
| kyoto | Piopiko | 4097 | tone-edit | absolute |
| la_paz | Club la Clave | 2188 | tone-edit | legendary |
| la_paz | Club Nocturno La Nuit | 2186 | tone-edit | legendary, absolute, fiercely, pure |
| la_paz | El Consulado | 2480 | tone-edit | pure |
| la_paz | OPEN MIND CLUB | 2185 | tone-edit | absolute, pure |
| la_paz | Punto G | 2190 | tone-edit | absolute |
| la_paz | Sátiros | 2189 | tone-edit | absolute |
| la_paz | Socialtel La Paz | 2478 | tone-edit | ultimate |
| leipzig | Clara Zetkin Park ("Die Nonne") | 4552 | tone-edit | legendary |
| leipzig | Elipamanoke | 4550 | tone-edit | iconic |
| leipzig | INO Café | 4556 | tone-edit | ultimate |
| leipzig | Juicy leipzig | 4560 | tone-edit | pure, ultimate |
| leipzig | KISSKISSBANGBANG | 4548 | tone-edit | ultimate |
| leipzig | The Fall Of Patriarchy | 4549 | editorial-rewrite | legendary, pure, emoji |
| lille | Le Privilège | 2982 | tone-edit | pure |
| lille | Lokarria | 2996 | tone-edit | ultimate, fiercely |
| lima | JW Marriott Hotel Lima | 2488 | tone-edit | pure, absolute, ultimate |
| lima | La Cueva | 2490 | editorial-rewrite | pure, legendary, fiercely |
| lima | OPEN DECK BAR | 2491 | tone-edit | pure, absolute |
| lima | Radisson RED Miraflores | 2486 | tone-edit | pure |
| lima | Sauna Assia Spa for Men | 2494 | tone-edit | pure |
| lima | Second Home Peru | 2485 | tone-edit | ultimate |
| lima | Selina Miraflores Lima | 2487 | tone-edit | ultimate, absolute |
| lisbon | Bar 106 | 1284 | tone-edit | legendary |
| lisbon | Beach 19 | 3623 | editorial-rewrite | ultimate, wonderland |
| lisbon | Browns Central Hotel | 3625 | editorial-rewrite | wonderland, absolute, iconic, ultimate |
| lisbon | Construction | 1286 | tone-edit | ultimate, legendary |
| lisbon | Construction Bar | 1288 | tone-edit | legendary, ultimate |
| lisbon | Espaço 40e1 | 1281 | tone-edit | ultimate, pure, legendary |
| lisbon | Finalmente Club | 106 | editorial-rewrite | legendary |
| lisbon | Friends Bairro Alto | 1290 | tone-edit | pure |
| lisbon | Lux Frágil | 2032 | editorial-rewrite | crown jewel, legendary, absolute |
| lisbon | LX Boutique Hotel | 3624 | tone-edit | absolute |
| lisbon | MARA | 3621 | tone-edit | iconic |
| lisbon | Parque Eduardo VII (Cruising Area) | 820 | tone-edit | legendary |
| lisbon | Posh Club | 1287 | tone-edit | absolute, iconic |
| lisbon | Purex | 1289 | tone-edit | legendary, fiercely |
| lisbon | Sauna Olisipo | 3622 | tone-edit | pure, ultimate |
| lisbon | SaunApolo 56 | 1282 | tone-edit | fiercely, ultimate |
| lisbon | Shelter Bar | 3335 | tone-edit | fiercely, pure |
| lisbon | Side Bar | 1285 | editorial-rewrite | absolute, legendary, ultimate, pure, wonderland |
| lisbon | Trombeta Bath | 817 | editorial-rewrite | crown jewel |
| lisbon | Trumps | 105 | editorial-rewrite | crown jewel, iconic, pure |
| lisbon | Woof X | 1283 | tone-edit | fiercely |
| liverpool | Abercromby Square | 4440 | editorial-rewrite | legendary, crown jewel |
| liverpool | Campus Liverpool | 4436 | tone-edit | legendary |
| liverpool | DysCo Liverpool / The Haus of Fun | 3734 | editorial-rewrite | iconic, wonderland |
| liverpool | FunnyBoyz Liverpool | 3735 | tone-edit | absolute, legendary |
| liverpool | GBar Liverpool | 1421 | editorial-rewrite | absolute, legendary, crown jewel |
| liverpool | HEAVEN | 1423 | tone-edit | legendary, absolute |
| liverpool | Liverpool Naval Club | 4439 | tone-edit | legendary, pure |
| liverpool | Lovelocks Coffee Shop | 4442 | tone-edit | fiercely, pure, iconic |
| liverpool | Navy Bar 2.1 | 4437 | tone-edit | iconic |
| liverpool | News From Nowhere | 4443 | tone-edit | legendary, fiercely, absolute |
| liverpool | OMG | 3733 | tone-edit | iconic, legendary |
| liverpool | Poste House | 1427 | tone-edit | legendary, absolutely |
| liverpool | Pride Coffee | 4441 | editorial-rewrite | crown jewel, absolute |
| liverpool | Sonic Yootha | 3146 | tone-edit | legendary, fiercely |
| liverpool | Superstar Boudoir | 1424 | tone-edit | ultimate, pure, fiercely, absolute, absolutely |
| liverpool | The Benidorm Bar | 4438 | tone-edit | ultimate, absolute |
| liverpool | The Lisbon | 1426 | tone-edit | absolute, legendary, iconic |
| liverpool | The Masquerade | 1425 | tone-edit | legendary |
| liverpool | The Shankly Hotel | 3148 | tone-edit | absolute |
| ljubljana | Klub Gromka | 3977 | tone-edit | pure |
| ljubljana | Klub Monokel | 1518 | tone-edit | legendary, iconic |
| ljubljana | Klub Tiffany | 1517 | tone-edit | fiercely, iconic, legendary |
| london | Balans Soho, No.60 | 1856 | tone-edit | absolute, iconic, legendary |
| london | Bethnal Green Working Men's Club | 4429 | tone-edit | legendary |
| london | Colour Factory | 1994 | tone-edit | fiercely |
| london | Corner New Cross | 4434 | tone-edit | pure, ultimate |
| london | Dalston Superstore | 153 | editorial-rewrite | absolute, fiercely |
| london | Duke of Wellington | 4421 | tone-edit | legendary |
| london | Eagle London | 114 | editorial-rewrite | fiercely, ultimate |
| london | Fabric | 154 | editorial-rewrite | legendary |
| london | Fire Nightclub | 4426 | tone-edit | legendary |
| london | Fold | 155 | editorial-rewrite | fiercely |
| london | Friendly Society | 4423 | editorial-rewrite | wonderland, pure |
| london | Hazlitt's | 3361 | tone-edit | iconic |
| london | La Camionera | 4431 | tone-edit | pure |
| london | Park Plaza London Riverbank | 1855 | tone-edit | absolute |
| london | Retro Bar | 4422 | tone-edit | legendary |
| london | Royal Vauxhall Tavern (RVT) | 4425 | tone-edit | absolute, iconic |
| london | SHE Soho | 4420 | tone-edit | legendary |
| london | STG Hotel Oxford Street | 1853 | tone-edit | iconic |
| london | TBPOC-only Trans Sauna | 4432 | tone-edit | fiercely, absolute |
| london | The Common Press Shoreditch | 1857 | editorial-rewrite | emoji |
| london | The Divine | 4428 | tone-edit | legendary |
| london | The Hoxton Shoreditch | 4435 | tone-edit | fiercely |
| london | The Z Hotel Soho | 1852 | tone-edit | legendary |
| london | TOAD Bakery | 4433 | tone-edit | fiercely |
| london | Vault 139 | 161 | editorial-rewrite | legendary |
| london | Village Soho | 1859 | tone-edit | legendary |
| los_angeles | "Vaseline Alley" | 4586 | tone-edit | iconic, legendary |
| los_angeles | Brick & Mortar | 4591 | tone-edit | pure, ultimate |
| los_angeles | Bullet Bar | 4583 | tone-edit | legendary |
| los_angeles | Club Cobra | 4576 | tone-edit | ultimate |
| los_angeles | El Cid | 4577 | editorial-rewrite | legendary, crown jewel |
| los_angeles | Fan Girl Cafe | 4589 | tone-edit | ultimate, iconic |
| los_angeles | Hamburger Mary’s WeHo | 4588 | tone-edit | ultimate, legendary, pure |
| los_angeles | Jasons II Adult Books | 4585 | tone-edit | legendary |
| los_angeles | Jungle Hollywood | 4575 | tone-edit | fiercely |
| los_angeles | Mattie's WeHo | 4579 | tone-edit | iconic |
| los_angeles | Micky's WeHo | 4578 | tone-edit | legendary, iconic, ultimate |
| los_angeles | Precinct | 823 | tone-edit | absolute |
| los_angeles | Reunion & Company | 4590 | tone-edit | legendary |
| los_angeles | Roosterfish | 4582 | tone-edit | iconic, legendary |
| los_angeles | Silver Lake Reservoir | 4587 | tone-edit | iconic |
| los_angeles | The Abbey | 3239 | editorial-rewrite | legendary, pure |
| los_angeles | The Bayou | 4580 | tone-edit | ultimate, legendary |
| los_angeles | The Chapel at The Abbey | 4574 | tone-edit | absolute, pure |
| los_angeles | The Tangerine - a Burbank Hotel | 4592 | tone-edit | iconic |
| los_angeles | Tiki Theatre | 4584 | tone-edit | absolute, iconic, legendary |
| lyon | L Bar Lyon | 1262 | tone-edit | ultimate, pure |
| lyon | Le Marais Lyon | 1259 | tone-edit | legendary |
| lyon | Le Sucre | 2043 | tone-edit | absolute |
| lyon | Queen Club Lyon | 1255 | tone-edit | pure |
| lyon | XS Bar Lyon | 1269 | tone-edit | pure, legendary |
| madrid | BOXER Madrid | 3541 | tone-edit | pure |
| madrid | Mondo Disko | 2016 | tone-edit | absolute |
| madrid | Room Mate Oscar | 1871 | editorial-rewrite | crown jewel |
| malaga | Kipfer & Lover | 4284 | tone-edit | ultimate |
| mallorca | Bar Flexas | 1217 | tone-edit | absolute, iconic, legendary |
| mallorca | Fucktory Mallorca | 1223 | tone-edit | pure |
| mallorca | La Dama de ELLA | 3676 | editorial-rewrite | crown jewel, absolute, fiercely |
| mallorca | La Demence Palma | 4285 | tone-edit | legendary, absolute |
| mallorca | Luna Dance Club | 4286 | tone-edit | legendary |
| mallorca | Marcela | 3675 | tone-edit | absolute |
| mallorca | Muro forest | 3683 | tone-edit | fiercely, absolute, iconic |
| mallorca | Platja des Trenc | 3682 | editorial-rewrite | crown jewel, legendary |
| mallorca | Sauna Spartacus | 3681 | tone-edit | absolute |
| mallorca | Sirocco | 3678 | tone-edit | legendary, pure |
| mallorca | The2 Palma Gay Bar | 3674 | tone-edit | legendary |
| mallorca | Trantor Gay Party | 3679 | tone-edit | absolute, pure |
| mallorca | Wave Club Mallorca | 1219 | tone-edit | pure |
| malmo | Inkonst | 1726 | tone-edit | ultimate, legendary |
| malmo | Lernacken | 1733 | tone-edit | legendary |
| malmo | Plan B | 1718 | tone-edit | fiercely |
| malta | NERVE Party | 639 | tone-edit | absolutely |
| malta | Sensual Erotic Tantra Massage | 640 | tone-edit | absolutely |
| manchester | Bar Pop | 4446 | tone-edit | legendary, pure, iconic |
| manchester | Centre Stage | 4448 | tone-edit | pure, iconic, absolute |
| manchester | Club Tropicana | 4444 | tone-edit | pure |
| manchester | Cruz 101 | 407 | editorial-rewrite | absolute, fiercely, ultimate, pure |
| manchester | Eagle Manchester | 118 | editorial-rewrite | ultimate, legendary, absolute |
| manchester | Feel Good Club | 822 | tone-edit | absolute |
| manchester | G-A-Y Manchester | 117 | editorial-rewrite | iconic, fiercely, ultimate, pure, legendary |
| manchester | Gay Pride Shop | 4457 | editorial-rewrite | pure, ultimate, wonderland |
| manchester | Hidden Club | 411 | tone-edit | absolute, pure, fiercely, legendary |
| manchester | Iconic Bar | 4450 | editorial-rewrite | iconic, pure, legendary |
| manchester | Leven Manchester | 3144 | tone-edit | absolute, legendary |
| manchester | New Frontier / The New Union | 3145 | tone-edit | legendary, absolute, fiercely |
| manchester | New York New York | 408 | tone-edit | ultimate, absolute, iconic, pure |
| manchester | On Bar Manchester | 4445 | tone-edit | legendary, iconic |
| manchester | Oscars Bar | 4451 | tone-edit | ultimate, legendary, absolute |
| manchester | REM Bar | 4453 | tone-edit | pure, ultimate, fiercely |
| manchester | REM Hotel | 2628 | tone-edit | fiercely, pure, ultimate |
| manchester | Social Refuge / Queer Lit | 4456 | tone-edit | absolute |
| manchester | The Goose | 4447 | tone-edit | iconic, fiercely |
| manchester | The Molly House | 406 | tone-edit | legendary, fiercely |
| manchester | The New Union | 4454 | tone-edit | absolute, legendary |
| manchester | The Thompsons Arms | 4452 | tone-edit | ultimate, absolute, fiercely |
| manchester | Ville Hotel | 2629 | tone-edit | ultimate |
| manchester | Warehouse Project | 412 | editorial-rewrite | crown jewel, pure |
| manchester | YES Manchester | 414 | tone-edit | fiercely |
| manila | APOLLO Male Entertainment & KTV Bar | 1020 | tone-edit | ultimate, pure, legendary, absolutely |
| manila | Apotheka | 1021 | tone-edit | ultimate |
| manila | Club Bath Philippines | 1024 | tone-edit | ultimate, legendary, pure |
| manila | D'Mansion Transient House Exclusive | 1025 | tone-edit | legendary, ultimate |
| manila | Fred's Revolucion - Escolta | 1018 | tone-edit | legendary |
| manila | Halxyon Club | 3590 | editorial-rewrite | crown jewel, ultimate |
| manila | Hoesik | 1019 | tone-edit | absolute, iconic, ultimate |
| manila | O BAR | 3589 | tone-edit | absolute |
| manila | Rampa Club | 1022 | tone-edit | iconic |
| manila | Rapture Cafe Bar | 1017 | tone-edit | legendary |
| manila | The One 690 Entertainment Bar | 1016 | tone-edit | pure |
| marrakech | La Mamounia | 2519 | editorial-rewrite | ultimate, legendary, absolute, crown jewel |
| marseille | Alex Hôtel & Spa | 2338 | tone-edit | absolute, pure |
| marseille | BOUM | 1527 | tone-edit | fiercely |
| marseille | Hôtel Belle-Vue Marseille | 2337 | tone-edit | iconic |
| marseille | L'Annexe Bar | 1525 | tone-edit | absolute, legendary |
| marseille | Le Poli | 1523 | editorial-rewrite | ultimate, crown jewel, fiercely, absolute, pure, absolutely, legendary, absolutely, legendary, iconic, emoji |
| marseille | Le Pulse | 1522 | tone-edit | ultimate, iconic |
| marseille | Mama Shelter Marseille | 2336 | tone-edit | legendary |
| marseille | Plage de Montredon / Plage de la Verrerie | 3761 | editorial-rewrite | wonderland |
| marseille | Sauna Club Salvator | 1528 | tone-edit | pure |
| medellin | Club Oráculo | 2475 | tone-edit | absolute |
| medellin | Hotel Casa Laureles | 2474 | editorial-rewrite | emoji |
| medellin | Hotel NH Collection Medellin Royal | 2471 | editorial-rewrite | emoji |
| medellin | Industry Club | 593 | tone-edit | absolute, pure, ultimate |
| medellin | Mad Radio | 2476 | tone-edit | absolute, ultimate |
| medellin | MUTE | 2477 | tone-edit | ultimate, pure, legendary |
| medellin | Patio del Mundo | 2470 | editorial-rewrite | pure, emoji |
| medellin | The Charlee Hotel | 2469 | editorial-rewrite | pure, crown jewel |
| medellin | Viajero Hostel  & Rooftop Bar | 2472 | editorial-rewrite | ultimate, emoji |
| melbourne | Adelphi Hotel | 2513 | editorial-rewrite | wonderland, absolute |
| melbourne | DT's Hotel | 4139 | tone-edit | absolute, legendary |
| melbourne | Ovolo South Yarra | 2514 | tone-edit | absolute, pure |
| melbourne | Poof Doof | 455 | tone-edit | legendary |
| melbourne | Pride of Our Footscray | 491 | tone-edit | fiercely |
| melbourne | Smith St Hotel | 4137 | tone-edit | legendary, ultimate |
| melbourne | St Kilda Beach & West Beach | 4140 | tone-edit | iconic |
| melbourne | The Fox Hotel | 4135 | tone-edit | fiercely |
| melbourne | The Laird | 4138 | tone-edit | legendary, absolute |
| melbourne | The Lyall Hotel and Spa | 2515 | tone-edit | ultimate |
| melbourne | The Night Cat | 2001 | editorial-rewrite | absolute, crown jewel, legendary |
| melbourne | The Peel Hotel | 4133 | tone-edit | fiercely, legendary |
| melbourne | The Rainbow Hotel | 4136 | tone-edit | pure |
| mendoza | Anna Bistro | 4044 | tone-edit | ultimate, absolute |
| mendoza | Christopher St. Café | 2718 | tone-edit | iconic |
| mendoza | La Reserva | 1248 | tone-edit | legendary |
| mendoza | Mod Hotels Mendoza | 4045 | tone-edit | absolute |
| mendoza | Parque General San Martín | 4043 | tone-edit | ultimate |
| mendoza | Queen Disco | 1238 | tone-edit | absolute, legendary |
| mendoza | Templo Spa Mendoza | 2730 | tone-edit | pure |
| merida | Banana's Club | 2807 | editorial-rewrite | ultimate, pure, legendary, emoji |
| merida | Bernardette Show Bar | 2803 | editorial-rewrite | iconic, emoji |
| merida | DIX BAR | 2802 | editorial-rewrite | absolute, emoji |
| merida | La Inventada Cantina | 2804 | editorial-rewrite | ultimate, absolute, legendary, emoji |
| merida | Papis | 2805 | editorial-rewrite | absolutely, emoji |
| merida | XOXO Club | 2806 | editorial-rewrite | ultimate, emoji |
| mexico_city | Baby | 3301 | tone-edit | absolute, ultimate, fiercely |
| mexico_city | Baños San Ciprian | 3952 | tone-edit | legendary, pure, absolute |
| mexico_city | Blow Bar | 3948 | tone-edit | absolute, ultimate |
| mexico_city | Cabaretito Fusión | 1685 | tone-edit | legendary |
| mexico_city | Cafe Nin | 881 | tone-edit | absolute |
| mexico_city | Club Olimpo Bathhouse | 3951 | tone-edit | pure |
| mexico_city | El Taller | 517 | tone-edit | iconic, legendary |
| mexico_city | Eurostars Zona Rosa Suites | 1553 | tone-edit | legendary, ultimate |
| mexico_city | Hotel Geneve | 1552 | tone-edit | absolute, ultimate |
| mexico_city | Kinky Bar | 514 | tone-edit | pure |
| mexico_city | La Casita CDMX | 3302 | tone-edit | ultimate |
| mexico_city | Malva Club | 3949 | tone-edit | pure, legendary |
| mexico_city | Nicho Bears & Bar | 502 | tone-edit | legendary, iconic |
| mexico_city | Rico Club | 3947 | tone-edit | pure |
| mexico_city | Vaqueros Bar | 3299 | tone-edit | legendary |
| mexico_city | Yu Yu / YuYu Cine Club | 1686 | tone-edit | ultimate, pure, legendary |
| miami | 321 Slammer | 4331 | tone-edit | absolute, legendary |
| miami | Azucar Nightclub | 644 | tone-edit | fiercely, legendary, ultimate |
| miami | Boardwalk Bar | 4326 | tone-edit | absolute, legendary |
| miami | Club Aqua Miami | 645 | tone-edit | absolute, legendary, pure |
| miami | Club Space (Ground Zero / Floyd) | 2589 | editorial-rewrite | crown jewel, legendary |
| miami | CLUBBOI | 648 | tone-edit | absolute, ultimate, fiercely |
| miami | Eagle Wilton Manors | 4322 | tone-edit | iconic, ultimate |
| miami | Gaythering Sauna | 646 | tone-edit | absolute |
| miami | Georgie's Alibi Monkey Bar | 4319 | tone-edit | absolute |
| miami | Haulover Park | 4206 | tone-edit | legendary |
| miami | Hunters Nightclub | 4317 | editorial-rewrite | crown jewel, legendary |
| miami | Johnsons Fort Lauderdale | 4325 | tone-edit | absolute, pure |
| miami | LeBoy | 4327 | tone-edit | absolute, legendary |
| miami | Mona's Cocktail Bar | 4330 | tone-edit | absolute, pure |
| miami | Out of the Closet Thrift Store | 4335 | editorial-rewrite | ultimate, wonderland |
| miami | Palace Bar | 641 | tone-edit | absolute, ultimate |
| miami | Pride Factory | 4334 | editorial-rewrite | ultimate, wonderland, pure |
| miami | Ramrod | 4321 | tone-edit | iconic, absolute, legendary |
| miami | Rosie's Bar & Grill | 4333 | editorial-rewrite | ultimate, absolute, crown jewel, legendary |
| miami | Sebastian Street Beach | 4332 | editorial-rewrite | crown jewel, iconic, ultimate |
| miami | The Corner Pub | 4329 | tone-edit | ultimate, legendary |
| miami | The Manor Complex | 4320 | editorial-rewrite | absolute, crown jewel, ultimate |
| miami | The Pub | 4323 | tone-edit | ultimate |
| miami | Twist | 642 | tone-edit | ultimate, legendary |
| milano | Afterline | 4374 | tone-edit | legendary, iconic |
| milano | Company Club | 3599 | tone-edit | ultimate |
| milano | Company Club | 4372 | tone-edit | legendary, pure |
| milano | Depot Milano | 124 | editorial-rewrite | absolute, pure |
| milano | District 272 | 265 | tone-edit | ultimate |
| milano | Don't Tell Mama | 4370 | tone-edit | ultimate |
| milano | ES Collection / Addicted Milano | 4381 | tone-edit | legendary, absolute |
| milano | Fenix Sauna Milano | 4378 | tone-edit | iconic |
| milano | Giardini Indro Montanelli | 4380 | tone-edit | legendary |
| milano | Il Borgo delle Perse | 4371 | tone-edit | ultimate, legendary |
| milano | Illumined Bar | 4375 | tone-edit | pure |
| milano | La Boum | 3598 | tone-edit | legendary, absolute, ultimate |
| milano | LeccoMilano | 123 | editorial-rewrite | iconic, ultimate |
| milano | Libreria Antigone | 4382 | tone-edit | fiercely, absolute |
| milano | Lola | 4365 | tone-edit | pure |
| milano | LOVE | 4366 | tone-edit | ultimate, legendary |
| milano | Metro Club Milano | 268 | tone-edit | legendary |
| milano | Metro Club Milano | 4377 | tone-edit | ultimate, absolute, pure |
| milano | Mono Bar | 261 | tone-edit | legendary, ultimate |
| milano | Noloso | 4367 | tone-edit | legendary |
| milano | ONEWAY Discoclub | 4376 | tone-edit | legendary, absolute, ultimate |
| milano | Pop \| cocktail bar | 3595 | tone-edit | ultimate, fiercely |
| milano | Q Club | 4369 | tone-edit | ultimate, legendary |
| milano | Red Cafè | 3597 | tone-edit | absolute, legendary |
| milano | Rocket Club | 266 | tone-edit | legendary |
| milano | Sui Generis | 3596 | tone-edit | legendary, ultimate |
| milano | TBlue Sauna | 4379 | tone-edit | ultimate |
| milano | Tempio del Futuro Perduto | 270 | tone-edit | fiercely |
| milano | Toilet Club | 4368 | editorial-rewrite | legendary, wonderland, absolute |
| minneapolis | Black Hart of Saint Paul | 4596 | tone-edit | ultimate, legendary, iconic |
| minneapolis | Ground Zero Nightclub | 4593 | tone-edit | ultimate, legendary |
| minneapolis | Jetset Underground | 4594 | tone-edit | legendary |
| minneapolis | LUSH Lounge & Theater | 4600 | editorial-rewrite | ultimate, crown jewel, legendary |
| minneapolis | PORTAL° Thermaculture | 4597 | tone-edit | ultimate |
| minneapolis | Roxy's Cabaret | 4599 | tone-edit | absolutely, pure |
| minneapolis | The Brass Rail Lounge | 4595 | editorial-rewrite | absolute, crown jewel, legendary |
| minneapolis | Theodore Wirth Park | 4598 | tone-edit | legendary |
| montevideo | Bar Brecha | 2241 | tone-edit | absolute, legendary |
| montevideo | Parque Batlle (Parque de los Aliados) | 2243 | tone-edit | legendary |
| montevideo | Radisson Montevideo Victoria Plaza Hotel | 2246 | tone-edit | ultimate |
| montevideo | Sauna Toronto | 718 | tone-edit | legendary, ultimate |
| montevideo | Terminal Tres Cruces | 2244 | tone-edit | legendary |
| montevideo | Viajeros Disco | 2240 | tone-edit | absolute, legendary |
| montpellier | Le Café de la Mer | 2928 | tone-edit | absolute |
| montpellier | Le Coxx Montpellier | 2941 | tone-edit | absolute, ultimate |
| montpellier | Madrediosa | 2927 | tone-edit | ultimate |
| montpellier | One Sauna | 2942 | tone-edit | ultimate, pure |
| montreal | Bar Campus | 4489 | editorial-rewrite | legendary, iconic, wonderland |
| montreal | Bar Diamant Rouge | 4490 | tone-edit | legendary |
| montreal | Bar Le Stud | 1652 | editorial-rewrite | legendary, pure, emoji |
| montreal | Cabaret Mado | 520 | tone-edit | iconic, legendary, fiercely |
| montreal | Café La Graine Brûlée (Le Village) | 1887 | editorial-rewrite | wonderland, pure, ultimate, fiercely |
| montreal | Café Reine Garçon | 1888 | tone-edit | fiercely, pure |
| montreal | Café Titanic (Old Montreal) | 1889 | tone-edit | legendary |
| montreal | Complexe Sky | 518 | tone-edit | iconic |
| montreal | District Video Lounge | 1059 | editorial-rewrite | emoji |
| montreal | Fairmont The Queen Elizabeth | 1434 | editorial-rewrite | emoji |
| montreal | La Loggia Art B&B | 1657 | tone-edit | ultimate |
| montreal | Le Belmont | 1433 | editorial-rewrite | legendary, emoji |
| montreal | Le Date Karaoke | 1653 | editorial-rewrite | crown jewel, iconic, pure, absolutely, ultimate, emoji |
| montreal | Le Saloon | 1058 | tone-edit | absolute, ultimate |
| montreal | Le Weiser | 1654 | editorial-rewrite | absolutely, fiercely, ultimate, emoji |
| montreal | M Montreal | 1660 | tone-edit | ultimate |
| montreal | Maison Des Jardins | 1656 | editorial-rewrite | ultimate, fiercely, absolute, crown jewel |
| montreal | Motel Motel | 1655 | editorial-rewrite | legendary, emoji |
| montreal | Restaurant Tendresse | 1886 | tone-edit | absolute |
| montreal | Sauna Centre-Ville | 4492 | tone-edit | iconic, pure |
| montreal | Stereo | 1061 | editorial-rewrite | pure, emoji |
| montreal | Stock Bar | 1432 | editorial-rewrite | legendary, pure, emoji |
| montreal | Taverne Normandie | 1060 | editorial-rewrite | absolute, legendary, emoji |
| mumbai | The Taj Mahal Palace Mumbai | 1837 | tone-edit | iconic |
| munich | Bar Rendezvous | 4531 | editorial-rewrite | wonderland, ultimate |
| munich | beisl \| bar & cafe | 4535 | tone-edit | iconic, ultimate |
| munich | Blitz Club | 2037 | tone-edit | absolute |
| munich | Café Glück | 4546 | tone-edit | ultimate, absolute, fiercely |
| munich | Café Nil | 3141 | tone-edit | legendary |
| munich | Café NiL | 470 | tone-edit | legendary |
| munich | diversity Café | 4541 | tone-edit | ultimate |
| munich | Drei Glöcklein | 4532 | tone-edit | ultimate, pure |
| munich | Englischer Garten | 4539 | tone-edit | ultimate, legendary |
| munich | Fesch Wirtshaus und Stehausschank | 4545 | tone-edit | legendary |
| munich | Garry Klein | 4530 | tone-edit | absolute, legendary, iconic |
| munich | Herrensauna Schwabing | 4536 | tone-edit | legendary |
| munich | Isarauen (Flaucher) | 3584 | editorial-rewrite | legendary, wonderland |
| munich | Mint Club | 4528 | tone-edit | legendary |
| munich | MLC (Münchner Löwen Club) / UnderGround | 4538 | editorial-rewrite | wonderland |
| munich | NY.Club | 431 | tone-edit | legendary |
| munich | Ochsengarten | 3143 | tone-edit | absolute, iconic |
| munich | Palais Club | 4529 | tone-edit | legendary |
| munich | Pimpernel | 3142 | tone-edit | fiercely, legendary, ultimate |
| munich | Prosecco Bar | 430 | tone-edit | ultimate, legendary |
| munich | Restaurant Deutsche Eiche | 4540 | tone-edit | legendary, ultimate |
| munich | Rote Sonne | 2036 | tone-edit | fiercely |
| munich | Sauna Deutsche Eiche | 472 | editorial-rewrite | absolute, crown jewel |
| munich | SpeXter | 4543 | tone-edit | absolute |
| munich | Sub Cafe | 4542 | tone-edit | ultimate, iconic |
| munich | Toy-Versand & Diburnium Store | 4544 | tone-edit | ultimate, pure |
| munich | Zum Wolf | 4534 | tone-edit | pure |
| mykonos | 54 Cocktail Bar & Sunset Lounge | 3920 | tone-edit | pure, iconic |
| mykonos | Astra Club | 316 | tone-edit | legendary |
| mykonos | Cavo Paradiso | 130 | editorial-rewrite | legendary |
| mykonos | Cosma Bar | 3921 | tone-edit | legendary |
| mykonos | Elia Beach | 313 | tone-edit | legendary, ultimate |
| mykonos | JackieO Drag Shows | 318 | tone-edit | iconic, legendary, pure |
| mykonos | JackieO Town | 310 | tone-edit | fiercely, legendary |
| mykonos | Katerina's Bar & Restaurant | 3923 | editorial-rewrite | legendary, crown jewel |
| mykonos | Lola Mykonos | 3919 | tone-edit | legendary |
| mykonos | Paradise Club | 314 | tone-edit | iconic |
| mykonos | Porta Bar | 309 | tone-edit | legendary, pure |
| naples | Anatema | 4385 | tone-edit | legendary, pure |
| naples | Bar Fiorillo | 4383 | tone-edit | ultimate, legendary |
| naples | Cactus | 3476 | editorial-rewrite | crown jewel, ultimate |
| naples | Depot Napoli | 2633 | tone-edit | legendary, pure |
| naples | KCarre | 3479 | tone-edit | pure |
| naples | La Mamada | 3601 | tone-edit | ultimate, legendary |
| naples | Le Streghe | 3478 | tone-edit | legendary |
| naples | MUTATION @ Duel Club | 3600 | tone-edit | legendary |
| naples | Piazza Bellini | 3602 | tone-edit | ultimate |
| naples | SAME | 4384 | tone-edit | pure, legendary, absolute |
| naples | Vault 21 | 3477 | tone-edit | ultimate, pure |
| new_orleans | Bourbon Pub & Parade | 448 | tone-edit | iconic |
| new_orleans | Cafe Lafitte in Exile | 2591 | tone-edit | legendary |
| new_orleans | Clover Grill | 4605 | tone-edit | ultimate, legendary, iconic |
| new_orleans | Corner Pocket | 485 | tone-edit | legendary |
| new_orleans | Golden Lantern | 487 | tone-edit | legendary |
| new_orleans | Le CaBARet | 3253 | tone-edit | ultimate, fiercely |
| new_orleans | Mona Lisa | 4606 | tone-edit | ultimate, fiercely |
| new_orleans | Oz New Orleans | 449 | tone-edit | legendary |
| new_orleans | QiQi | 4603 | tone-edit | absolute |
| new_orleans | The Country Club | 4604 | tone-edit | ultimate, pure |
| new_orleans | The Friendly Bar | 4602 | tone-edit | absolute, ultimate, fiercely, iconic, legendary |
| new_york | Abarat / Athena Keke's | 4610 | tone-edit | ultimate, absolute |
| new_york | Albatross Bar | 4612 | tone-edit | ultimate, legendary, iconic |
| new_york | Babeland | 3530 | tone-edit | absolute |
| new_york | Branded Saloon | 4611 | tone-edit | absolute |
| new_york | C'mon Everybody | 4609 | tone-edit | ultimate, fiercely, pure |
| new_york | Club Cumming | 945 | tone-edit | legendary |
| new_york | Cubbyhole | 947 | tone-edit | legendary, fiercely |
| new_york | FLEX | 4608 | editorial-rewrite | wonderland |
| new_york | Fresco's Grand Cantina | 1545 | tone-edit | ultimate, pure, absolutely, legendary |
| new_york | Gansevoort Meatpacking NYC | 1539 | editorial-rewrite | legendary, absolute, ultimate, pure, iconic, crown jewel |
| new_york | Ginger's Bar | 3526 | tone-edit | iconic, fiercely |
| new_york | Gym Sportsbar | 3523 | tone-edit | absolute, fiercely |
| new_york | Henrietta Hudson (West Village) | 1895 | tone-edit | absolute, fiercely, iconic |
| new_york | HUSH HK | 1894 | editorial-rewrite | crown jewel, fiercely |
| new_york | Icon | 4613 | tone-edit | absolute |
| new_york | Jacob Riis Park Beach | 3528 | tone-edit | ultimate, iconic |
| new_york | Metropolitan | 3524 | tone-edit | absolute |
| new_york | NoMo SoHo | 1540 | tone-edit | ultimate, legendary, absolutely |
| new_york | Nowadays | 1988 | tone-edit | legendary |
| new_york | Pieces | 3522 | tone-edit | iconic, legendary, absolute |
| new_york | Playhouse Bar | 1893 | tone-edit | ultimate, absolute, pure, absolutely, legendary |
| new_york | Prospect Park (Brooklyn) | 1891 | editorial-rewrite | crown jewel, legendary, iconic |
| new_york | Purple Passion / Kink NYC | 4617 | tone-edit | legendary, absolute |
| new_york | Red Eye NY | 4607 | tone-edit | pure, ultimate, legendary |
| new_york | Rise Bar | 572 | tone-edit | pure |
| new_york | The Duplex | 3521 | tone-edit | absolute, iconic, legendary |
| new_york | The High Line Hotel | 4616 | tone-edit | ultimate |
| new_york | The Marshal | 1544 | tone-edit | fiercely, absolute, legendary |
| new_york | The Monster | 950 | tone-edit | legendary, pure |
| new_york | The Standard, High Line | 1542 | tone-edit | absolute, pure, legendary, iconic, fiercely, ultimate |
| new_york | The Townhouse | 4614 | tone-edit | ultimate, iconic |
| new_york | The West Side Club | 3527 | tone-edit | legendary, absolute |
| new_york | Wall Street Sauna | 4615 | tone-edit | absolute |
| newcastle | Leonardo Hotel Newcastle | 4419 | tone-edit | legendary, iconic |
| newcastle | Scotswood Showbar | 4416 | tone-edit | legendary, pure |
| newcastle | The Singing Canary | 4417 | editorial-rewrite | wonderland |
| odense | Comwell H.C. Andersen Odense Dolce by Wyndham | 2573 | tone-edit | absolute, legendary |
| odense | Gertruds Petit Hotel | 2575 | tone-edit | absolute |
| odense | Hotel Odéon | 2574 | tone-edit | absolute |
| odense | Lambda | 2576 | tone-edit | legendary, pure |
| odense | No Stress Odense | 2577 | tone-edit | absolute, pure |
| odense | Slagteriet | 2627 | tone-edit | fiercely |
| odense | Studenterhus | 2578 | tone-edit | absolute, ultimate, pure |
| orlando | AC Hotel Orlando Downtown | 2594 | editorial-rewrite | crown jewel, absolute |
| orlando | Bamboo Oasis | 4652 | tone-edit | absolute |
| orlando | BarCodes | 488 | tone-edit | ultimate, legendary, fiercely |
| orlando | Chef Art Smith's Homecomin | 4649 | tone-edit | legendary |
| orlando | Hamburger Mary’s Orlando | 4645 | tone-edit | iconic |
| orlando | Outpost Neighborhood Tavern | 4647 | tone-edit | ultimate, iconic |
| orlando | Renaissance Theatre Company | 4642 | tone-edit | fiercely |
| orlando | Sapphire Lounge | 2597 | tone-edit | legendary |
| orlando | Savoy Orlando | 451 | tone-edit | legendary |
| orlando | Se7enBites | 4646 | tone-edit | legendary |
| orlando | Secrets Hideaway Resort & Spa / Club Secret | 4644 | tone-edit | ultimate, pure |
| orlando | Southern Nights Orlando | 489 | tone-edit | fiercely |
| orlando | The Barcodes Boutique | 4653 | tone-edit | ultimate, absolute |
| orlando | The Dust | 4643 | tone-edit | legendary |
| orlando | The Glass Knife | 4651 | editorial-rewrite | wonderland, absolute |
| orlando | White Wolf Cafe | 4648 | tone-edit | legendary, pure, fiercely |
| osaka | Aco's Bar | 4101 | tone-edit | ultimate |
| osaka | Bacchus | 2939 | tone-edit | legendary, fiercely |
| osaka | Club Karma | 4103 | tone-edit | legendary |
| osaka | Daikichi Sauna | 4107 | tone-edit | ultimate |
| osaka | Do With Cafe | 4105 | tone-edit | absolutely, legendary, iconic, fiercely |
| osaka | Dungaree | 2938 | tone-edit | legendary, absolute |
| osaka | EAGLE OSAKA | 2944 | tone-edit | iconic, legendary |
| osaka | FrenZ FrenZY | 2947 | tone-edit | legendary |
| osaka | GuLf | 2951 | tone-edit | absolute |
| osaka | HIGEBUN | 2956 | tone-edit | legendary |
| osaka | Hug | 2934 | tone-edit | ultimate |
| osaka | SPORTS MEN'S CLUB OSAKA | 4108 | tone-edit | pure, legendary |
| osaka | TAIYO Men's Spa | 4106 | tone-edit | absolute, pure |
| oslo | Blå | 287 | editorial-rewrite | wonderland, fiercely, iconic |
| oslo | Bob's Pub | 3719 | tone-edit | ultimate, legendary |
| oslo | Clarion Hotel The Hub | 3721 | tone-edit | ultimate |
| oslo | Ingensteds | 293 | tone-edit | legendary |
| oslo | Jaeger | 286 | tone-edit | fiercely |
| oslo | London Pub & Club | 3371 | tone-edit | legendary |
| oslo | Radisson Blu Plaza Hotel Oslo | 2466 | tone-edit | absolute |
| oslo | Salt | 289 | editorial-rewrite | wonderland |
| oslo | Scandic Grensen | 2453 | tone-edit | ultimate |
| oslo | SLM Oslo | 3373 | tone-edit | legendary |
| oslo | Storgata 26 | 2004 | tone-edit | iconic |
| oslo | The AGENDA | 3374 | editorial-rewrite | legendary, crown jewel |
| oslo | The Villa | 288 | tone-edit | legendary, ultimate |
| ottawa | Bridgehead Roastery and Coffeehouse | 1568 | tone-edit | ultimate, iconic |
| ottawa | House of TARG | 1578 | editorial-rewrite | ultimate, wonderland |
| ottawa | Pour Boy Pub | 1575 | tone-edit | ultimate, absolute |
| ottawa | Swizzles Bar & Grill | 1570 | tone-edit | pure, absolute, legendary |
| ottawa | T's Pub | 1573 | tone-edit | ultimate |
| ottawa | The Lookout Bar | 1577 | tone-edit | pure, absolute |
| oxford | Lynrace Spirit & Cocktail Bar | 4412 | tone-edit | pure |
| oxford | Tap Social Movement (Botley Taproom) | 4413 | tone-edit | absolute |
| oxford | The Mad Hatter | 4414 | editorial-rewrite | wonderland |
| oxford | The Mad Hatter hotel | 4415 | tone-edit | iconic, ultimate |
| palermo | Ariston Hotel & BB | 2631 | tone-edit | pure, legendary |
| palermo | EXIT10&LOVE @ Fabric | 2125 | tone-edit | ultimate, iconic, absolute |
| palermo | Hotel NH Collection Palermo Palazzo Sitano | 2632 | tone-edit | ultimate |
| palermo | I Candelai | 4389 | tone-edit | ultimate, iconic |
| palermo | Laguna Blu Caterina Pub | 4388 | editorial-rewrite | legendary, pure |
| palermo | Palazzo Planeta | 2630 | tone-edit | fiercely, pure, iconic |
| palermo | QUIR Fattoamano | 4391 | tone-edit | pure, legendary |
| palm_springs | Bear Wear | 4407 | tone-edit | pure, ultimate |
| palm_springs | Blackbook | 2600 | tone-edit | iconic |
| palm_springs | Casa Oliver Hotel & Resort | 4405 | tone-edit | absolute |
| palm_springs | CCBC Resort Hotel | 665 | tone-edit | iconic |
| palm_springs | Dick's on Arenas | 2601 | tone-edit | fiercely, iconic, legendary |
| palm_springs | Gear Leather and Fetish | 4408 | editorial-rewrite | ultimate, wonderland |
| palm_springs | Inndulge Palm Springs | 4404 | tone-edit | ultimate |
| palm_springs | Oscar's Downtown | 2602 | tone-edit | iconic |
| palm_springs | QUADZ Palm Springs | 703 | tone-edit | legendary, pure, iconic |
| palm_springs | Santiago Resort | 4403 | tone-edit | pure, absolute |
| palm_springs | The Hacienda at Warm Sands | 2321 | tone-edit | absolute, legendary |
| palm_springs | Tool Shed | 4406 | editorial-rewrite | iconic, legendary |
| palm_springs | Toucans Tiki Lounge | 661 | editorial-rewrite | legendary, iconic |
| palm_springs | Triangle Inn Palm Springs | 2328 | tone-edit | legendary, absolute |
| palm_springs | Vista Grande Resort | 2335 | tone-edit | legendary, ultimate |
| pamplona | Bar Malkoa | 4288 | tone-edit | fiercely |
| pamplona | Qwerty | 4289 | tone-edit | legendary |
| panama_city | Discoteca BLG Lips | 2506 | tone-edit | absolute |
| panama_city | Hyatt Place Panama City/Downtown | 2504 | tone-edit | pure |
| panama_city | Las Clementinas | 2502 | tone-edit | ultimate |
| panama_city | Selina Casco Viejo Panama City & Cowork | 2503 | tone-edit | ultimate |
| paris | Amphibi | 4253 | tone-edit | fiercely, absolute |
| paris | Banana Café | 100 | editorial-rewrite | legendary |
| paris | Bois de Vincennes | 4260 | tone-edit | ultimate |
| paris | Boulangerie Legay Choc | 4264 | tone-edit | absolute |
| paris | Chez Mylène | 4248 | tone-edit | legendary, iconic, ultimate |
| paris | Cox | 99 | editorial-rewrite | crown jewel, legendary, ultimate |
| paris | CUD Bar | 148 | editorial-rewrite | legendary |
| paris | Duplex Bar in Le Marais | 4243 | tone-edit | legendary |
| paris | Essaim | 2219 | tone-edit | legendary, iconic, fiercely, absolutely |
| paris | FVTVR | 2218 | tone-edit | iconic |
| paris | Gibus Club | 4249 | tone-edit | ultimate |
| paris | Gigi's Paradisco | 4247 | editorial-rewrite | wonderland |
| paris | IDM Sauna | 2215 | tone-edit | legendary, ultimate |
| paris | L'Impact | 3314 | tone-edit | ultimate |
| paris | La Mutinerie | 1990 | tone-edit | fiercely |
| paris | La Station – Gare des Mines | 2217 | tone-edit | absolute |
| paris | Le Keller | 4255 | tone-edit | legendary |
| paris | Le Tango (La Boîte à Frissons) | 2220 | tone-edit | legendary |
| paris | Les Bains d'Odessa | 4250 | tone-edit | ultimate |
| paris | Mensch | 4256 | tone-edit | ultimate |
| paris | Moncoeur Belleville | 1866 | editorial-rewrite | crown jewel |
| paris | One Way | 4244 | tone-edit | legendary |
| paris | Quetzal Bar | 4241 | tone-edit | legendary |
| paris | Raidd Bar | 140 | editorial-rewrite | legendary, absolute |
| paris | Rosa Bonheur | 4263 | tone-edit | ultimate, legendary |
| paris | Tata Burger | 1865 | tone-edit | legendary, ultimate |
| paris | The Labo | 4245 | tone-edit | iconic |
| paris | WorkshoW Paris | 4246 | tone-edit | absolute |
| paris | Xkboys | 4257 | tone-edit | absolute |
| philadelphia | Dirty Franks | 4619 | tone-edit | iconic |
| philadelphia | FDR Park (The Lakes) | 4620 | tone-edit | legendary |
| philadelphia | Knock Restaurant & Bar | 4618 | tone-edit | ultimate, legendary |
| phnom_penh | Arthur & Paul hotel | 1044 | editorial-rewrite | crown jewel |
| phnom_penh | The L Bar | 1777 | tone-edit | iconic |
| phoenix | AZ Chute | 4627 | editorial-rewrite | wonderland |
| phoenix | FLEX Spas Phoenix | 4626 | tone-edit | absolute |
| phoenix | Karamba Nightclub | 4621 | tone-edit | iconic, fiercely |
| phoenix | Nu Towne Saloon | 4623 | tone-edit | legendary, fiercely |
| phoenix | Pat O's Bunkhouse Saloon | 4624 | tone-edit | legendary |
| phuket | Blue Dolphin Men's Massage | 555 | tone-edit | absolutely |
| phuket | OK Karaoke | 552 | tone-edit | pure |
| podgorica | Cafe Berlin | 4336 | tone-edit | pure, legendary |
| portland | Badlands Border Bar | 4629 | editorial-rewrite | iconic, legendary, wonderland, pure |
| portland | Darcelle XV Showplace | 4631 | tone-edit | iconic, pure |
| portland | Either/Or | 4640 | tone-edit | legendary |
| portland | Peacock | 4632 | tone-edit | legendary, fiercely |
| portland | Sanctuary Club | 4635 | tone-edit | pure |
| portland | Steam Portland | 4633 | editorial-rewrite | crown jewel |
| portland | The Society Hotel | 4641 | tone-edit | iconic, fiercely |
| porto | Bar of Soap | 3632 | tone-edit | ultimate |
| porto | Cafe Lusitano | 1270 | tone-edit | absolute |
| porto | Conceicao 35 | 1264 | tone-edit | ultimate |
| porto | Fabrik Bar | 3633 | tone-edit | ultimate |
| porto | Invictus Cafe Bar | 1272 | tone-edit | iconic, pure |
| porto | MOVE CLUB | 3634 | tone-edit | pure |
| porto | Pride Bar Porto | 1250 | tone-edit | pure, absolute |
| porto | Sauna Camoes | 1254 | tone-edit | ultimate, absolute |
| porto | Sauna Thermas | 3635 | tone-edit | ultimate, absolute |
| prague | Ankali | 218 | tone-edit | legendary |
| prague | Boudoir Bar | 220 | tone-edit | ultimate, pure |
| prague | Club TerMAX | 222 | tone-edit | iconic |
| prague | Club TerMIX | 3307 | tone-edit | legendary, ultimate |
| prague | Cross Club | 219 | editorial-rewrite | legendary, pure, fiercely, wonderland |
| prague | Drake Club | 215 | tone-edit | absolute |
| prague | EA Hotel Tosca | 2290 | tone-edit | absolute |
| prague | Heaven Club Prague | 214 | editorial-rewrite | wonderland |
| prague | Hotel Claris | 2291 | tone-edit | ultimate |
| prague | Letná-park | 3880 | tone-edit | ultimate |
| prague | OMG Party | 221 | tone-edit | legendary, absolute, ultimate, pure |
| prague | Piano Bar | 3304 | tone-edit | fiercely, legendary |
| prague | Sauna David | 3311 | tone-edit | legendary, iconic |
| prague | The Emblem | 2292 | tone-edit | absolute, iconic |
| prague | U Rudolfa Club | 3877 | tone-edit | absolute, legendary |
| prague | UP & DOWN | 3308 | editorial-rewrite | wonderland |
| providence | Alchemy | 4654 | tone-edit | fiercely |
| providence | Cafe Zoey | 4664 | editorial-rewrite | wonderland, iconic |
| providence | Eagle's Nest | 4658 | tone-edit | legendary, pure, absolute |
| providence | Kimi's | 4656 | tone-edit | ultimate |
| providence | LIVEPVD Night Club | 4655 | tone-edit | fiercely |
| providence | Prospect Terrace Park | 4660 | tone-edit | legendary |
| providence | Small Format | 4662 | tone-edit | fiercely, pure |
| providence | Small Point Café | 4663 | tone-edit | ultimate, absolutely |
| providence | The Mega-Plex | 4659 | tone-edit | ultimate, legendary |
| provincetown | Aqua Bar | 4671 | tone-edit | ultimate |
| provincetown | Boatslip Resort (The Deck) | 4667 | tone-edit | absolute, iconic, ultimate, legendary |
| provincetown | The Atlantic House | 4665 | tone-edit | legendary, iconic, ultimate |
| provincetown | The Paramount | 4666 | editorial-rewrite | legendary, ultimate, iconic, absolute |
| puerto_vallarta | A Page in the Sun | 3445 | tone-edit | ultimate, legendary |
| puerto_vallarta | Anonimo Video Bar | 3962 | editorial-rewrite | legendary, wonderland |
| puerto_vallarta | Blue Chairs Beachfront Resort | 3968 | tone-edit | absolute, legendary, pure, iconic |
| puerto_vallarta | Cafe San Angel | 899 | tone-edit | ultimate, absolute |
| puerto_vallarta | Casa Cupula Boutique | 3969 | tone-edit | legendary, absolute, iconic |
| puerto_vallarta | CC Slaughters | 3961 | tone-edit | ultimate, legendary |
| puerto_vallarta | Hotel La Iguana Vallarta | 3970 | tone-edit | absolute, ultimate |
| puerto_vallarta | Industry | 583 | tone-edit | absolute, legendary |
| puerto_vallarta | La Noche | 582 | tone-edit | ultimate, absolutely |
| puerto_vallarta | Langostino’s Restaurant & Bar | 3967 | tone-edit | absolute, iconic |
| puerto_vallarta | Los Otros Blondies PV | 3963 | tone-edit | absolutely, legendary |
| puerto_vallarta | Mantamar Beach Club Bar | 584 | editorial-rewrite | absolute, pure, crown jewel, ultimate |
| puerto_vallarta | Mr. Flamingo | 580 | tone-edit | absolute |
| puerto_vallarta | One Six One PV | 585 | editorial-rewrite | crown jewel |
| puerto_vallarta | Paco's Ranch | 581 | editorial-rewrite | iconic, crown jewel, legendary |
| puerto_vallarta | Piñata PV Hotel | 3971 | editorial-rewrite | absolute, pure, crown jewel, ultimate |
| puerto_vallarta | Playa Los Muertos (Gay Beach Zone) | 897 | tone-edit | legendary, iconic |
| puerto_vallarta | Reinas Bar | 3964 | tone-edit | legendary |
| puerto_vallarta | Spartacus Spa & Sauna | 895 | tone-edit | ultimate, pure |
| puerto_vallarta | The Top Sky Bar | 3966 | editorial-rewrite | absolute, crown jewel |
| quito | Black & White | 742 | tone-edit | pure |
| rehoboth_beach | Lori's Oy Vey! Café | 4674 | tone-edit | legendary |
| reykjavik | 22 Bar | 764 | tone-edit | iconic |
| richmond | Fallout | 4675 | tone-edit | legendary |
| richmond | Lamplighter Coffee Roasters | 4679 | tone-edit | absolute, legendary |
| richmond | Philly Vegan | 4678 | tone-edit | pure |
| richmond | Texas Beach (James River Park System) | 4677 | tone-edit | ultimate |
| richmond | The Answer Brewpub | 4676 | tone-edit | pure, ultimate, iconic, legendary |
| riga | Bar 11 (Vienpadsmit) | 2206 | tone-edit | legendary, fiercely |
| riga | Bunker Cruising Bar | 4158 | tone-edit | ultimate, legendary |
| riga | Grand Hotel Kempinski Riga | 4161 | tone-edit | absolute |
| riga | Kaņepes Kultūras centrs (KKC) | 2205 | tone-edit | legendary |
| riga | Poseidons Club | 4157 | tone-edit | ultimate, fiercely, pure |
| riga | Skapis | 1178 | tone-edit | iconic |
| riga | Vērmanes dārzs (Wöhrmannsparken) | 4160 | tone-edit | legendary |
| riga | XXX | 2207 | tone-edit | absolute |
| rio_de_janeiro | Black Cat Party | 1909 | tone-edit | ultimate, pure |
| rio_de_janeiro | Boate La Cueva | 1908 | tone-edit | ultimate, legendary |
| rio_de_janeiro | Copacabana Palace | 1907 | editorial-rewrite | ultimate, crown jewel, absolute, legendary |
| rio_de_janeiro | Hotel Arpoador | 1906 | tone-edit | ultimate, iconic, legendary |
| rio_de_janeiro | Hotel Fasano | 1905 | tone-edit | legendary, iconic |
| rio_de_janeiro | Up Turn Bar | 1910 | tone-edit | absolute, iconic, fiercely, legendary |
| rome | 101 Club Rome | 4392 | tone-edit | ultimate, fiercely |
| rome | Adam Sauna Roma | 4396 | editorial-rewrite | ultimate, wonderland |
| rome | Alibi Club | 253 | tone-edit | pure |
| rome | Apollion Sauna | 257 | tone-edit | legendary |
| rome | Coming Out | 119 | editorial-rewrite | legendary, pure |
| rome | Company Club | 121 | editorial-rewrite | ultimate, legendary, pure |
| rome | Freni e Frizioni | 4398 | tone-edit | ultimate, legendary |
| rome | Frutta e Verdura | 3605 | tone-edit | ultimate, legendary |
| rome | GIAM (Good As You Manila/Roma) | 3604 | tone-edit | pure, ultimate, fiercely, absolute |
| rome | K Men Club | 4395 | tone-edit | absolute, legendary |
| rome | Muccassassina | 120 | editorial-rewrite | ultimate, iconic, legendary, pure, absolutely |
| rome | My Bar | 248 | tone-edit | ultimate |
| rome | Parco del Ninfeo | 4397 | tone-edit | legendary, iconic |
| rome | Skyline Club / Black Hole Roma | 4394 | tone-edit | legendary |
| rome | Spiaggia Il Buco | 1879 | editorial-rewrite | legendary, ultimate, emoji |
| rotterdam | Bar Elio | 3614 | tone-edit | legendary |
| rotterdam | Café Bonaparte | 3615 | tone-edit | legendary, pure |
| rotterdam | De Regenboog | 1735 | tone-edit | ultimate |
| rotterdam | FERRY Rotterdam | 1742 | tone-edit | absolute |
| rotterdam | KeerWeer | 1740 | tone-edit | legendary, ultimate, absolute |
| rotterdam | Now&Wow Club | 3616 | tone-edit | legendary |
| rotterdam | Strano | 1745 | tone-edit | fiercely, ultimate |
| rotterdam | WTF | 3617 | tone-edit | fiercely |
| salzburg | ARGEkultur on HOSI Fest nights | 3042 | tone-edit | legendary |
| salzburg | Dark Eagle | 3032 | tone-edit | ultimate |
| salzburg | The Single Oak | 3867 | tone-edit | legendary, iconic |
| salzburg | Volksgarten Salzburg | 3869 | tone-edit | absolute |
| san_francisco | Blackbird | 1074 | tone-edit | legendary |
| san_francisco | Midnight Sun | 1069 | tone-edit | pure |
| san_francisco | Moby Dick | 1067 | tone-edit | pure, ultimate, legendary |
| san_francisco | Public Works | 1078 | tone-edit | legendary, fiercely |
| san_francisco | The Edge | 1068 | tone-edit | ultimate, pure |
| san_francisco | The EndUp | 1073 | editorial-rewrite | legendary, emoji |
| san_francisco | Toad Hall | 1071 | tone-edit | legendary, ultimate |
| san_francisco | Twin Peaks Tavern | 558 | tone-edit | fiercely |
| san_francisco | Underground SF | 1076 | tone-edit | pure |
| santiago | Baños Monumental | 4021 | tone-edit | absolute |
| santiago | Blondie | 4013 | editorial-rewrite | legendary, ultimate, iconic, fiercely, crown jewel |
| santiago | Centro El Cerro | 4017 | tone-edit | iconic |
| santiago | CLUB CH 33 SPA | 701 | tone-edit | iconic |
| santiago | Club Soda | 4016 | tone-edit | absolute |
| santiago | Contramano Restobar | 698 | tone-edit | absolute, iconic |
| santiago | Contramano Restopub | 4018 | tone-edit | absolute, iconic |
| santiago | Dionisio | 695 | tone-edit | legendary |
| santiago | Farinelli | 4019 | tone-edit | legendary, absolutely |
| santiago | Fausto | 690 | tone-edit | legendary, iconic |
| santiago | HANGAR | 700 | tone-edit | legendary |
| santiago | Hotel Luciano K | 2481 | tone-edit | pure, fiercely |
| santiago | hotel Maison italia 1029 | 2483 | tone-edit | pure, absolute |
| santiago | Illuminati | 691 | tone-edit | fiercely, absolute, legendary, iconic |
| santiago | La Prohibida | 694 | tone-edit | fiercely |
| santiago | Lemon Lab | 4014 | tone-edit | legendary, pure, iconic, fiercely, ultimate |
| santiago | Moulin Bar Santiago | 699 | tone-edit | absolute, legendary |
| santiago | New Zero Discotheque | 4015 | tone-edit | absolute, pure |
| santiago | Roberta | 4023 | editorial-rewrite | absolute, crown jewel |
| santiago | Sauna Il Palatino Spa | 4020 | tone-edit | fiercely |
| santiago | W Santiago | 2484 | tone-edit | absolute |
| santo_domingo | Apolo Sauna | 2198 | tone-edit | absolute |
| santo_domingo | El Malecón | 2197 | tone-edit | iconic, legendary, absolute |
| santo_domingo | Esedeku Bar & Terraza | 2191 | tone-edit | absolute, legendary, fiercely |
| santo_domingo | Marlowe’s | 2194 | tone-edit | legendary, absolute |
| santo_domingo | Parque Duarte | 2196 | tone-edit | legendary |
| santo_domingo | Pop Cafe De Toi / Pop | 2195 | tone-edit | absolute, legendary, ultimate |
| santo_domingo | Queerium | 2193 | editorial-rewrite | absolute, crown jewel |
| santo_domingo | RIG Puerto Malecon | 2199 | tone-edit | absolute |
| santorini | Crystal Restaurant & Cocktail Bar santorini | 3925 | tone-edit | legendary, fiercely |
| santorini | Koo Club Santorini | 3472 | tone-edit | legendary |
| santorini | Murphy's Bar Santorini | 3474 | tone-edit | absolute |
| santorini | Naoussa Restaurant | 3471 | tone-edit | pure |
| santorini | Theros Wave Bar | 2200 | tone-edit | ultimate, iconic, legendary |
| santorini | Tropical Bar Santorini | 3473 | tone-edit | absolute, iconic |
| sao_paulo | Bar da Lôca | 1918 | tone-edit | ultimate |
| sao_paulo | Bella Paulista | 1923 | tone-edit | absolute, legendary, ultimate |
| sao_paulo | Blue Space | 858 | tone-edit | iconic |
| sao_paulo | Casa Fluida | 1922 | tone-edit | absolutely |
| sao_paulo | D-Edge | 2062 | tone-edit | iconic |
| sao_paulo | Espaço Lagoa Sauna | 1921 | tone-edit | absolute |
| sao_paulo | Ibirapuera Park | 944 | editorial-rewrite | crown jewel, legendary |
| sao_paulo | Igrejinha Bar | 1917 | tone-edit | absolute, ultimate |
| sao_paulo | Mamba Negra | 2063 | tone-edit | legendary, absolute |
| sao_paulo | Slim Hotel São Paulo Frei Caneca | 1914 | tone-edit | absolute, iconic |
| sao_paulo | Tunnel | 1920 | tone-edit | absolute, legendary |
| sao_paulo | Yacht Club | 1919 | tone-edit | absolute, legendary, iconic |
| sarajevo | Cinemas Sloga | 1618 | tone-edit | legendary |
| sarajevo | DKC Sarajevo | 4069 | tone-edit | fiercely |
| sarajevo | Kriterion | 4070 | tone-edit | ultimate, fiercely |
| sarajevo | The Bar Sarajevo | 1615 | tone-edit | fiercely |
| sarajevo | The Loft Club Sarajevo | 1614 | tone-edit | fiercely, legendary, pure, absolute |
| sarajevo | Zlatna Ribica | 1610 | tone-edit | ultimate, legendary |
| seattle | The Wildrose | 3450 | tone-edit | iconic |
| seoul | AMBITION | 4115 | editorial-rewrite | crown jewel |
| seoul | Bar Ahn seoul | 4116 | tone-edit | fiercely |
| seoul | Cakeshop | 2049 | editorial-rewrite | crown jewel, pure |
| seoul | CLUB TRANCHE | 4111 | tone-edit | legendary, fiercely, absolute |
| seoul | Equus | 680 | tone-edit | fiercely |
| seoul | Glam Lounge | 676 | tone-edit | absolute, pure |
| seoul | Kockiri | 4112 | tone-edit | absolute, fiercely |
| seoul | MICHIN | 4110 | tone-edit | ultimate, legendary, fiercely |
| seoul | MYHUNK | 4114 | editorial-rewrite | absolute, crown jewel, pure, ultimate |
| seoul | Queen | 675 | tone-edit | legendary |
| seoul | Rabbithole Arcade Pub | 678 | tone-edit | absolutely, legendary, fiercely |
| seoul | Shortbus & Friends | 4113 | tone-edit | absolute |
| seoul | Why Not | 672 | tone-edit | ultimate, iconic |
| siem_reap | MEN’s Sauna & Spa | 1043 | tone-edit | ultimate |
| sitges | Balmins Beach | 339 | editorial-rewrite | absolute, crown jewel, iconic, legendary |
| sitges | Bassa Rodona Beach | 340 | tone-edit | absolute, legendary |
| sitges | Bears Bar | 336 | tone-edit | absolute, iconic |
| sitges | Bunker | 3705 | tone-edit | iconic |
| sitges | Central Bar Café | 3703 | tone-edit | absolute, iconic |
| sitges | El Horno | 137 | editorial-rewrite | ultimate, absolute, iconic |
| sitges | Elite Hotel Sitges | 3354 | editorial-rewrite | pure, ultimate, crown jewel |
| sitges | Hotel Calipolis | 3707 | tone-edit | absolute |
| sitges | Hotel Medium Sitges Park | 835 | editorial-rewrite | ultimate, crown jewel |
| sitges | Man Bar | 3704 | tone-edit | pure, absolute |
| sitges | Montroig Cafe | 839 | tone-edit | absolute, iconic, legendary, ultimate |
| sitges | Organic Dance Club | 3701 | tone-edit | ultimate, legendary, pure, iconic |
| sitges | Parrots Sitges Hotel | 3353 | tone-edit | legendary |
| sitges | Parrots Terrace | 332 | tone-edit | legendary, absolute, iconic |
| sitges | Platja de l'Home Mort | 3706 | tone-edit | legendary |
| sitges | Queenz Dinner Show | 341 | editorial-rewrite | absolute, crown jewel |
| sitges | Sitges Sauna | 138 | editorial-rewrite | absolute |
| sitges | Trailer | 3702 | tone-edit | absolute, legendary, pure, iconic |
| sitges | XXL Club | 136 | editorial-rewrite | legendary, absolute, ultimate |
| sofia | CineRoom & Delfina SPA | 4067 | tone-edit | ultimate |
| sofia | City Park - Borisova Gradina | 888 | tone-edit | iconic |
| sofia | Club Asylum | 4065 | tone-edit | ultimate, fiercely |
| sofia | Club Barcode | 4064 | tone-edit | absolute |
| sofia | Club DOM | 714 | tone-edit | ultimate |
| sofia | Essence Center | 711 | tone-edit | ultimate, absolute, iconic, pure |
| sofia | From Barista Coffee and more | 890 | tone-edit | ultimate, pure |
| sofia | Grand Hotel Sofia | 4072 | tone-edit | iconic, ultimate |
| sofia | National Palace of Culture (NDK) Subways | 4068 | tone-edit | legendary |
| sofia | Sense Hotel Sofia | 4071 | editorial-rewrite | crown jewel, legendary |
| sofia | The Steps | 710 | tone-edit | legendary |
| sofia | VAULT - The Next Level | 4063 | tone-edit | absolute |
| split | Charlie's Bar Split | 3999 | tone-edit | legendary |
| split | Klub Kocka | 2754 | tone-edit | legendary, absolute |
| split | X Club | 3998 | tone-edit | absolute |
| stockholm | Bakfickan | 3608 | tone-edit | iconic, ultimate |
| stockholm | Chokladkoppen | 808 | tone-edit | legendary |
| stockholm | Frescati | 3164 | tone-edit | legendary |
| stockholm | Klubb Hångel | 807 | tone-edit | legendary |
| stockholm | Kärsön | 3165 | tone-edit | absolute |
| stockholm | Moxy | 3162 | tone-edit | absolute, iconic |
| stockholm | Patricia | 91 | editorial-rewrite | legendary |
| stockholm | Side Track | 382 | tone-edit | iconic |
| stockholm | The Hills | 3609 | editorial-rewrite | crown jewel, legendary, ultimate |
| sydney | Aarows | 883 | tone-edit | legendary |
| sydney | BARBA | 937 | tone-edit | absolute, legendary |
| sydney | Beresford Sundays | 934 | tone-edit | absolute, ultimate, iconic |
| sydney | BUNKER | 938 | tone-edit | absolute |
| sydney | Club 77 | 2052 | tone-edit | ultimate, legendary, absolute |
| sydney | Daywash | 935 | tone-edit | absolute, legendary, iconic |
| sydney | EXTRA Dirty | 936 | tone-edit | absolute |
| sydney | Ivy Pool Club | 940 | editorial-rewrite | absolute, crown jewel, pure, legendary, ultimate |
| sydney | Lady Jane Beach | 4153 | tone-edit | absolute, iconic |
| sydney | Newtown Hotel | 4148 | tone-edit | absolute |
| sydney | North Bondi Beach | 4152 | tone-edit | legendary, ultimate |
| sydney | Obelisk Beach | 884 | editorial-rewrite | absolute, crown jewel, iconic |
| sydney | Palms on Oxford | 3282 | tone-edit | fiercely |
| sydney | POOF DOOF Sydney | 933 | tone-edit | absolute, legendary, pure, iconic, fiercely |
| sydney | Pullman Sydney Hyde Park | 885 | editorial-rewrite | crown jewel |
| sydney | Sauna X by 357 | 4151 | tone-edit | absolute, legendary, ultimate |
| sydney | Stonewall Newtown | 423 | tone-edit | absolute, pure |
| sydney | The Bank Hotel | 4149 | tone-edit | absolute, legendary |
| sydney | The Colombian Hotel | 3284 | tone-edit | absolute, ultimate |
| sydney | The Criterion Hotel | 4156 | tone-edit | legendary, iconic |
| sydney | The Erko | 4150 | tone-edit | absolute |
| sydney | The Hive Bar | 4154 | tone-edit | pure |
| sydney | The Imperial | 3283 | tone-edit | legendary |
| sydney | The Medusa Boutique Hotel | 4155 | tone-edit | absolute, fiercely |
| sydney | The Rusty Rabbit | 886 | tone-edit | legendary, iconic |
| sydney | UNIVERSAL Sydney | 882 | editorial-rewrite | crown jewel, absolute, legendary |
| taipei | C.U.M Create Ur Mmmagic | 607 | tone-edit | absolutely |
| tallinn | Club Uus Laine | 977 | tone-edit | legendary |
| tallinn | HALL | 1999 | tone-edit | fiercely |
| tallinn | Heldeke! | 978 | editorial-rewrite | crown jewel |
| tallinn | HELLo! | 2202 | tone-edit | iconic |
| tallinn | Paws for a moment | 4080 | tone-edit | absolute, ultimate |
| tallinn | Pirita Beach | 2204 | tone-edit | iconic |
| tallinn | Sauna Club 69 | 976 | tone-edit | fiercely |
| tallinn | X-Baar | 975 | tone-edit | legendary, pure |
| tbilisi | Bassiani / Horoom Nights | 1941 | tone-edit | absolute, pure |
| tbilisi | Mozaika & Mimosa Bar | 1946 | tone-edit | legendary |
| tbilisi | Secret Place | 1944 | tone-edit | fiercely |
| tbilisi | TES | 1942 | tone-edit | legendary |
| tbilisi | Unholy Bar | 1945 | tone-edit | iconic |
| tegucigalpa | Imperio Dubai | 1964 | editorial-rewrite | crown jewel, iconic, legendary |
| tegucigalpa | Indie Lounge | 1963 | editorial-rewrite | absolute, pure |
| tel_aviv | Hilton Tel Aviv | 2384 | tone-edit | absolute, legendary |
| tel_aviv | Phi Garden | 2055 | tone-edit | ultimate |
| tenerife | Achamán Discopub | 3708 | tone-edit | legendary, fiercely, absolute, pure |
| tenerife | Exito gay club | 2259 | tone-edit | legendary |
| tenerife | Habasko | 3482 | tone-edit | legendary, pure |
| tenerife | Playa de la Tejita Route | 2261 | editorial-rewrite | crown jewel |
| tenerife | Stonewall Sauna | 3481 | tone-edit | pure |
| tenerife | Vampis Club | 2260 | tone-edit | absolute, legendary, ultimate, fiercely |
| thessaloniki | Big Bar Thess | 3928 | tone-edit | ultimate, legendary, absolute |
| thessaloniki | BLUE VISION | 3929 | editorial-rewrite | wonderland |
| thessaloniki | Egnatia Palace Hotel | 4503 | tone-edit | absolute, pure |
| thessaloniki | Hipsters Hotel | 3932 | tone-edit | fiercely, legendary |
| thessaloniki | ID Club | 3927 | tone-edit | ultimate |
| thessaloniki | The Caravan Cafe-Restaurant | 4502 | editorial-rewrite | wonderland |
| thessaloniki | Wonderwall Fun Bar | 4499 | tone-edit | pure, iconic, legendary |
| thessaloniki | Zeus is Loose Hostel | 3930 | editorial-rewrite | crown jewel, legendary |
| tirana | Colonial Cocktails Academy Tirana | 1650 | tone-edit | pure |
| tirana | Hemingway Bar Tirana | 1641 | tone-edit | ultimate |
| tirana | Nouvelle Vague Tirana | 1644 | tone-edit | iconic |
| tirana | Tulla Culture Center | 1645 | tone-edit | absolute, fiercely |
| tokyo | 24 Kaikan Hotel | 4091 | tone-edit | pure |
| tokyo | 24 Kaikan Shinjuku | 653 | tone-edit | legendary, pure |
| tokyo | ADEZAKURA | 4085 | tone-edit | fiercely |
| tokyo | AiiRO Cafe | 649 | tone-edit | ultimate, iconic, legendary, pure |
| tokyo | AiSOTOPE Lounge | 656 | editorial-rewrite | crown jewel, ultimate |
| tokyo | Arty Farty | 651 | tone-edit | legendary, pure |
| tokyo | BAR GOLD FINGER | 4084 | tone-edit | legendary |
| tokyo | BOILER ROOM | 4087 | tone-edit | pure |
| tokyo | Campy! Bar | 654 | tone-edit | legendary |
| tokyo | Contact / Enter | 2054 | tone-edit | legendary |
| tokyo | Eagle Tokyo Blue | 652 | editorial-rewrite | crown jewel |
| tokyo | Kanda Rokuten | 4090 | tone-edit | legendary |
| tokyo | marasite | 4088 | tone-edit | legendary |
| tokyo | Vent | 2053 | tone-edit | legendary |
| tokyo | 上野 cave (Ueno Cave) | 4089 | tone-edit | ultimate, iconic |
| toronto | Black Eagle Toronto | 529 | tone-edit | legendary |
| toronto | Boutique Bar | 2534 | tone-edit | ultimate |
| toronto | Bunker | 3982 | tone-edit | pure |
| toronto | Buvette Pacey | 3993 | tone-edit | ultimate |
| toronto | Coda | 2061 | tone-edit | legendary, iconic |
| toronto | Crews & Tangos | 527 | tone-edit | absolute, legendary |
| toronto | El Convento Rico | 2532 | tone-edit | absolute, legendary |
| toronto | Glad Day Bookshop | 2537 | tone-edit | absolute, legendary, iconic, fiercely, ultimate |
| toronto | Gladstone House | 2529 | tone-edit | ultimate, pure |
| toronto | Hair Of The Dog Pub | 3992 | editorial-rewrite | pure, crown jewel, absolute |
| toronto | Hair of the Dog Pub & Restaurant | 2538 | tone-edit | ultimate |
| toronto | Hanlan’s Point Beach (Toronto Islands) | 2536 | tone-edit | absolute, legendary |
| toronto | Lula Lounge | 4493 | tone-edit | absolute, fiercely |
| toronto | O'Grady's Bar and Grill | 4495 | editorial-rewrite | absolute, crown jewel |
| toronto | O'Grady's On Church | 3991 | tone-edit | absolute, legendary |
| toronto | Oasis Aqualounge | 3990 | editorial-rewrite | crown jewel |
| toronto | Out on the Street | 4496 | tone-edit | pure |
| toronto | Pegasus Bar Toronto | 528 | tone-edit | ultimate |
| toronto | Queen's Park | 531 | editorial-rewrite | absolutely |
| toronto | Splash Steam and Sauna | 3989 | tone-edit | fiercely |
| toronto | Steamworks Toronto | 530 | editorial-rewrite | absolute, crown jewel, legendary |
| toronto | Storm Crow Manor | 3994 | tone-edit | iconic, pure |
| toronto | Sweaty Betty's | 3987 | editorial-rewrite | ultimate, fiercely, wonderland |
| toronto | The Anndore House, part of JdV by Hyatt | 2526 | editorial-rewrite | ultimate, absolute |
| toronto | The Anndore House, part of JdV by Hyatt | 2527 | editorial-rewrite | ultimate, absolute |
| toronto | The Black Eagle | 2533 | tone-edit | absolute, iconic |
| toronto | The Churchmouse | 4494 | tone-edit | legendary |
| toronto | The Drake Hotel | 2530 | tone-edit | absolute |
| toronto | The Drake Underground | 3988 | tone-edit | ultimate, legendary, absolute |
| toronto | The Drink - Cocktail & Pizza Bar | 3983 | tone-edit | ultimate, absolute |
| toronto | The Lodge Bar TO | 3986 | tone-edit | ultimate |
| toronto | The Well | 3985 | editorial-rewrite | wonderland |
| toronto | Understory | 834 | tone-edit | absolutely |
| toronto | Woody's | 526 | editorial-rewrite | crown jewel, legendary, iconic |
| toronto | Woody's & Sailor | 2531 | editorial-rewrite | absolute, crown jewel, iconic |
| torremolinos | Aqua Club | 344 | tone-edit | absolute |
| torremolinos | Aqua Terraza | 1047 | tone-edit | ultimate, legendary, iconic |
| torremolinos | Atmósfera | 1048 | tone-edit | iconic |
| torremolinos | Baloó Bar | 1049 | tone-edit | ultimate |
| torremolinos | Cuero Cruising Club (QÜERO) | 2228 | tone-edit | legendary |
| torremolinos | Eden Beach Club | 345 | editorial-rewrite | crown jewel, ultimate |
| torremolinos | El Gato Lounge | 347 | tone-edit | legendary |
| torremolinos | Guadalmar Beach | 351 | tone-edit | ultimate |
| torremolinos | Maracuya Gay House | 2231 | tone-edit | absolute |
| torremolinos | Mariquita | 1054 | tone-edit | legendary, ultimate |
| torremolinos | Marta Cariño | 1055 | tone-edit | ultimate |
| torremolinos | Matraca Club | 349 | tone-edit | legendary |
| torremolinos | Meliá Costa del Sol | 2234 | tone-edit | legendary |
| torremolinos | Parthenon Club | 346 | tone-edit | pure |
| torremolinos | Pikante | 2229 | tone-edit | legendary, ultimate |
| torremolinos | SIRENO | 2230 | tone-edit | legendary |
| torremolinos | XXL | 1057 | tone-edit | ultimate |
| turin | Parco del Valentino | 4402 | tone-edit | ultimate, iconic |
| turin | Pausa Cafè | 4401 | tone-edit | ultimate |
| turin | Qimanji Disco | 4400 | tone-edit | legendary, pure |
| turin | Village - LGBT Turin Party | 4399 | tone-edit | ultimate, pure |
| valparaiso | Estación del Gato | 4028 | tone-edit | iconic, ultimate, absolute |
| valparaiso | Fauna Restaurant & Bar | 4030 | tone-edit | absolute, iconic |
| valparaiso | Pagano | 4025 | tone-edit | pure, absolute, legendary, ultimate |
| valparaiso | Templo Gay Spa | 4029 | tone-edit | pure |
| valparaiso | Trotamundos Valparaíso | 4027 | tone-edit | absolute, legendary |
| vancouver | Celebrities Nightclub | 1502 | tone-edit | iconic, pure |
| vancouver | F212 Steam | 536 | tone-edit | legendary |
| vancouver | Little Sister's Book & Art Emporium | 2541 | tone-edit | ultimate, legendary |
| vancouver | Numbers Cabaret | 532 | tone-edit | legendary, iconic |
| vancouver | Oasis at Wreck Beach | 537 | tone-edit | ultimate |
| vancouver | OPUS Vancouver | 1499 | tone-edit | fiercely, ultimate |
| vancouver | Paradox Hotel Vancouver | 2540 | tone-edit | absolute, ultimate, legendary |
| vancouver | Sandman Suites Vancouver ad Davie Street | 2539 | tone-edit | ultimate |
| vancouver | Score on Davie | 1500 | tone-edit | ultimate, iconic |
| vancouver | Steam1 | 3979 | tone-edit | absolute |
| vancouver | The Birdhouse | 3978 | tone-edit | absolute, legendary |
| vancouver | The Junction | 535 | tone-edit | ultimate, absolute, legendary |
| vancouver | The PumpJack | 533 | tone-edit | legendary |
| vienna | 25hours Hotel | 2285 | tone-edit | absolute |
| vienna | Boutique Hotel MOTTO | 2284 | editorial-rewrite | iconic, absolute |
| vienna | Club U | 192 | tone-edit | iconic |
| vienna | Donauinsel (FKK-Bereiche) | 3875 | tone-edit | absolute, legendary, iconic |
| vienna | Eagle Vienna | 3870 | tone-edit | legendary |
| vienna | Fett+Zucker | 3873 | tone-edit | pure, fiercely |
| vienna | Fluc | 198 | tone-edit | legendary |
| vienna | Grelle Forelle | 191 | tone-edit | fiercely, ultimate, legendary |
| vienna | Heaven Vienna | 190 | tone-edit | iconic, legendary |
| vienna | Hotel-Pension Wild | 2287 | tone-edit | legendary |
| vienna | Kaiserbründl Sauna | 194 | editorial-rewrite | ultimate, crown jewel |
| vienna | Ken Club | 193 | tone-edit | pure, legendary |
| vienna | Kolping Wien Zentral | 2288 | tone-edit | ultimate |
| vienna | Le Méridien Vienna | 2286 | tone-edit | iconic |
| vienna | Mango Bar | 189 | tone-edit | legendary, fiercely |
| vienna | Schweizer Garten | 943 | tone-edit | absolute |
| vienna | The Pit | 3871 | tone-edit | legendary |
| vienna | Village Bar | 94 | editorial-rewrite | absolute, pure |
| vienna | Why Not | 93 | editorial-rewrite | absolute, legendary |
| vilnius | Fabrika | 2012 | tone-edit | legendary |
| vilnius | Kalnų parkas | 4162 | tone-edit | ultimate |
| vilnius | SOHO Club Vilnius | 1176 | tone-edit | absolute, iconic |
| warsaw | Butero Bistro | 1846 | tone-edit | absolute |
| warsaw | Chmury | 281 | tone-edit | ultimate, pure, legendary, iconic |
| warsaw | Crush Club Warsaw | 3886 | tone-edit | legendary, absolute |
| warsaw | El Koktel | 1844 | tone-edit | pure |
| warsaw | Glam Club | 279 | tone-edit | pure |
| warsaw | Instytut Bar | 3887 | editorial-rewrite | crown jewel |
| warsaw | Jasna 1 | 276 | tone-edit | pure |
| warsaw | Klub Sauna Galla | 3888 | tone-edit | ultimate |
| warsaw | Klubojadalnia Młodsza Siostra | 3889 | tone-edit | ultimate |
| warsaw | LAMPA | 1843 | editorial-rewrite | emoji |
| warsaw | Metropolis | 132 | editorial-rewrite | pure, legendary |
| warsaw | Plan B | 275 | tone-edit | legendary, pure |
| warsaw | Polonia Palace Hotel | 1849 | tone-edit | legendary |
| warsaw | Ramona Bar | 133 | editorial-rewrite | iconic |
| warsaw | Vistula River Beach | 1851 | tone-edit | ultimate, pure |
| wellington | QT Wellington | 2507 | tone-edit | absolute |
| wellington | The Viv Hotel | 2509 | tone-edit | fiercely |
| wroc_aw | Cactus Club | 2638 | tone-edit | absolute |
| wroc_aw | Coffee Planet | 3890 | tone-edit | legendary, ultimate |
| wroc_aw | Hotel Patio Old Town | 3892 | editorial-rewrite | pure, iconic |
| wroc_aw | Korona Hotel Wroclaw Market Square | 2640 | tone-edit | iconic |
| wroc_aw | Odra River Islands & Wooded Banks | 3891 | tone-edit | ultimate |
| wroc_aw | Saunarium Aquapark Wrocław | 2637 | tone-edit | pure |
| wroc_aw | Surowiec | 2634 | tone-edit | legendary |
| wroc_aw | Wyndham Wroclaw Old Town | 2639 | tone-edit | ultimate |
| zagreb | AKC Medika | 3510 | tone-edit | ultimate, fiercely |
| zagreb | Denis | 3505 | tone-edit | ultimate |
| zagreb | Funk Club | 3509 | tone-edit | ultimate |
| zagreb | HotPot | 3503 | editorial-rewrite | ultimate, emoji |
| zagreb | Jarun Lake (Gay Nude Beach) | 3997 | tone-edit | ultimate |
| zagreb | KIC Klub | 3506 | tone-edit | pure, iconic |
| zagreb | Kolaz | 3508 | editorial-rewrite | ultimate, pure, legendary, wonderland |
| zagreb | Rush | 3504 | tone-edit | ultimate, legendary, absolute, iconic |
| zurich | Apollo Sauna | 2252 | tone-edit | absolute, legendary, iconic |
| zurich | BOYAHKASHA! | 614 | tone-edit | pure |
| zurich | Heldenbar | 2249 | tone-edit | legendary |
| zurich | Hotel Alexander | 2256 | tone-edit | ultimate, absolute |
| zurich | Kauz | 3859 | tone-edit | fiercely |
| zurich | Kweer Bar | 2248 | tone-edit | ultimate, pure |
| zurich | Marktgasse Hotel | 2255 | tone-edit | ultimate, absolute |
| zurich | Männerzone | 3330 | tone-edit | ultimate, legendary, fiercely |
| zurich | Platzspitz Park | 2253 | tone-edit | legendary |
| zurich | sauna mylord | 3861 | tone-edit | pure, fiercely, legendary |
