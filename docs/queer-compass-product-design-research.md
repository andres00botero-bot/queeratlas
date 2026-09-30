# Queer Compass — produkt-, placerings- och designstudie

Datum: 10 september 2026  
Status: rekommenderad produktriktning före implementation

## Beslut i en mening

Queer Compass bör vara Queer Atlas gemensamma kunskapslager: en egen, sökbar hubb på `/compass`, men också finnas kontextuellt överallt där ett ord, ett pronomen, en målgrupp eller en communityetikett annars kan skapa osäkerhet.

Det ska inte kännas som en skolbok eller ett facit över människors identiteter. Det ska kännas som en lugn, trovärdig och levande fältguide som hjälper användaren att förstå, visa respekt och gå vidare till en konkret handling.

## Var funktionen ska finnas

### 1. Egen destination: `/compass`

Detta är den kanoniska platsen för sökning, bläddring, delning och indexering. Varje term får en permanent URL, exempelvis:

- `/compass/non-binary`
- `/compass/pronouns`
- `/compass/flinta`
- `/compass/queer`

Termens fulla artikel ska bara finnas på denna URL. Andra vyer visar korta utdrag och länkar hit. Det minskar dubbelt innehåll och gör källor, ändringshistorik och rättelser tydliga.

### 2. Startsidan: en kompakt ingång, inte en ny hero

Placera en sektion efter den primära sök-/upptäcktsytan men före community- och förtroendesektionerna:

> **Queer Compass**  
> Ord, identiteter och sammanhang — förklarade med omsorg.  
> Sök ett ord · Utforska teman

Visa tre aktuella eller vanligt missförstådda ämnen. Sektionen ska vara kompakt så att Queer Atlas fortfarande uppfattas som en plats- och communityprodukt, inte som en ordlista.

### 3. Global sökning

Compass-termer ska dyka upp i den befintliga söken under en egen resultatgrupp: **Ord & sammanhang**. Sökningen måste hantera:

- synonymer och olika språk, exempelvis `ickebinär`, `icke-binär`, `nonbinary`, `non-binary`;
- akronymer, exempelvis `HBTQI`, `LGBTQIA+` och `FLINTA`;
- vanliga frågor, exempelvis “vilka pronomen använder jag?”;
- stavfel och böjningar.

### 4. Kontextuellt i hela appen

När en term används på en event-, plats-, city- eller communitysida kan användaren öppna en kort definition utan att lämna sin uppgift. På mobil visas en bottom sheet; på desktop en popover. Den innehåller:

- en definition på högst två meningar;
- en viktig nyans eller regional markering;
- länken **Läs hela förklaringen**.

Termen ska inte göras till en dold hover-funktion. Använd en tydlig separat informationsknapp eller en textlänk med synlig fokusmarkering. W3C rekommenderar att ovanliga ord och jargong kan identifieras och förklaras, och pekar uttryckligen på länkade definitioner eller popup-förklaringar som fungerande mekanismer.

Exempel:

- Ett event märkt **FLINTA*** får länken “Vad betyder detta här?”.
- Profilens pronomenfält får “Om pronomen”.
- Ett venue som använder “all-gender restroom” kan förklara begreppet och samtidigt beskriva vad platsen faktiskt erbjuder.

### 5. Formulär och community-onboarding

Compass ska ge hjälp i stunden när en person väljer etiketter eller beskriver ett event. Men appen ska inte kräva att användaren accepterar en enda definition för sin egen identitet. Självidentifikation går före ordlistans formulering.

### 6. Sekundär navigation och footer

Lägg Queer Compass under “Discover paths”/guider och i footern. På desktop kan den finnas i sekundär navigation eller en framtida “Explore”-meny.

### 7. Inte i mobilens primära bottennavigation i MVP

Den nuvarande bottennavigationen bär kärnuppgifter som Home, Nearby/Search, Events, Cities och News. Compass bör först bevisa återkommande användning via startsida, sök och kontextuella ingångar. Om den senare når hög direkttrafik och stark återkomst kan den testas som huvudnav, men den ska inte tränga undan en kärnuppgift från dag ett.

## Informationsarkitektur

Compass ska ha tre sätt att hitta rätt, eftersom människor inte alltid känner till ordet de söker.

### Sök efter ord

Snabbaste vägen för användaren som redan har sett en term.

### Utforska efter situation

- **Förstå mig själv** — identitet, attraktion, kön, uttryck och utforskande.
- **Stötta någon** — pronomen, bemötande, coming out, misstag och allierat handlande.
- **Skapa ett tryggare rum** — events, arbetsplats, resor, tillgänglighet och inkluderande språk.

Dessa är filter/ingångar, inte separata kopior av samma artiklar.

### Utforska efter tema

- Kön & könsidentitet
- Sexualitet & romantisk orientering
- Pronomen & språk
- Community & kultur
- Relationer & familj
- Trygghet, rättigheter & vård
- Allierat handlande
- Regionala och kulturella ord

## Design och utseende

### Designidé: “en varm nattöppen läsesal”

Behåll Queer Atlas mörka, premiumpräglade grund men gör Compass lugnare och mer redaktionell än stad-, venue- och eventytorna.

- Bakgrund: djup aubergine/svart, inte rent svart.
- Text: varm benvit för mjukare långläsning.
- Accentfärger: sea-glass cyan för språk, mjuk lavendel för identitet, varm amber för sammanhang och rosa bara för små signaler.
- Ytor: tunna linjer, låga kontrastskillnader och mindre glow än på nightlife-sidor.
- Form: stora rundningar kan behållas, men artikelytor ska kännas plana och läsbara.
- Typografi: Queer Atlas befintliga Geist-baserade system; tydliga rubriker, generös radlängd på högst cirka 65–72 tecken och minst 16 px brödtext på mobil.
- Ikoner: kompass, bokmärke, länk, historik och extern källa — inte flaggor som dekorativa kategorisymboler.

### Hubbsidans struktur

1. Liten identitet: “Queer Compass / Learn without judgement”.
2. Rubrik: “What would you like to understand?”
3. Stor sökruta med exempelfrågor.
4. Tre situationsingångar.
5. Temafilter.
6. Utvalda termer och “nyligen uppdaterat”.
7. Kort förklaring av redaktionell metod och länk till rättelser.

### Termssidans struktur

Ovanför vikningen:

1. Term + uttal där det behövs.
2. En begriplig definition på 1–2 meningar.
3. Statusetikett: exempelvis “identitet”, “regional term” eller “kan betyda olika saker”.
4. Senast sakgranskad och språk/region.

Fördjupning:

1. **Kort sagt** — enkelt språk.
2. **Hur ordet används** — verkliga, respektfulla exempel.
3. **Viktiga nyanser** — variation, omstridd användning och vad man inte ska anta.
4. **Så kan du visa respekt** — konkret handling.
5. **Relaterade ord** — navigerbart kunskapsnät.
6. **Källor och granskning** — primärkällor, sakkunnig/community-granskare, datum och ändringslogg.
7. **Föreslå en rättelse** — låg tröskel, med möjlighet att beskriva regional eller kulturell variation.

## Innehållsmodell för varje term

Varje post bör innehålla:

- `canonicalName`
- `slug`
- `aliases[]`
- `languages[]`
- `regions[]`
- `summaryPlain`
- `definition`
- `usageExamples[]`
- `nuances[]`
- `avoidAssuming[]`
- `respectActions[]`
- `relatedTerms[]`
- `audiences[]`
- `categories[]`
- `sources[]`
- `reviewedBy[]`
- `publishedAt`, `reviewedAt`, `nextReviewAt`
- `changeLog[]`
- `sensitivity` och eventuell varning om återtaget/skadligt språk

Sökindexet ska väga kanoniskt namn högst, sedan alias, frågor och artikeltext. Definiera hela samlingen med Schema.org `DefinedTermSet` och varje artikel med `DefinedTerm`. Det hjälper maskiner att förstå strukturen, men ska inte säljas som en garanti för särskilda Google-resultat.

## Redaktionell ton

Compass ska säga:

- “Ordet används ofta för …” hellre än “Ordet betyder alltid …”
- “Vissa personer …” hellre än “Alla …”
- “Fråga personen hur de vill bli beskrivna” när användning varierar.

Undvik:

- identitetstest som lovar att tala om “vad du är”;
- rangordning av rätt och fel identitetsspråk utan kontext;
- att blanda medicinsk vägledning med allmän begreppsförklaring;
- AI-genererade definitioner utan namngivna källor och mänsklig granskning;
- exempel som avslöjar eller antar en persons identitet.

Språket förändras. Därför ska varje term kunna ha regional variation, versionshistorik och ett synligt granskningsdatum. RFSL är en viktig svensk startkälla, men Queer Compass behöver flera källor och communitygranskare där betydelser skiljer sig.

## Startinnehåll för MVP

Lansera inte med hundratals tunna poster. Börja med cirka 35–50 genomarbetade termer och 8–12 handlingsguider.

Prioriterade grupper:

- HBTQ, HBTQI, LGBTQIA+ och queer
- cis, trans, ickebinär/non-binary, genderqueer och könsfluid
- könsidentitet, könsuttryck, juridiskt kön och könsdysfori/könseufori
- pronomen, hen, de/dem och neopronomen
- lesbisk, bög/gay, bi, pan, asexuell, aromantisk och questioning
- intersex
- FLINTA* med tydlig not om att det är en tyskspråkigt präglad/regional akronym och att arrangören måste beskriva sin egen målgrupp
- chosen family/vald familj, deadname, misgendering och coming out
- ally/allierad, heteronormativitet, cisnormativitet och intersektionalitet

Handlingsguider:

- Hur frågar jag om pronomen respektfullt?
- Vad gör jag om jag använder fel pronomen?
- Hur skriver jag en inkluderande eventbeskrivning?
- Hur beskriver vi vem ett event är till för?
- Hur stöttar jag någon som kommer ut?
- Hur bedömer jag om en venue faktiskt är inkluderande?

## Koppling till Queer Atlas affär

Compass är i första hand en förtroende- och tillväxtmotor, inte en betalvägg.

- Organisk upptäckt: specifika term- och frågesidor kan få relevant söktrafik.
- Aktivering: varje relevant artikel leder vidare till platser, events, säkerhetsinformation eller communityresurser.
- B2B: senare kan verifierade venues/arrangörer få ett “inclusive listing toolkit” med checklistor, utbildningsmoduler och bättre eventdata. Betalningen gäller verktyg och synlighet — aldrig rätten att påverka definitioner.
- Sponsring: endast tydligt märkt och separerad från redaktionell text.

## Mätning

Viktigaste händelser:

- sökning → öppnad term;
- kontextuell definition → full artikel;
- termartikel → relevant plats/event/resurs;
- “hjälpte detta?” och typ av saknad information;
- nollresultat i sök;
- rättelseförslag;
- återbesök inom 30 dagar.

MVP:s huvudmått bör vara **andelen Compass-besök där användaren hittar ett svar och går vidare till en relevant handling**, inte sidvisningar ensamt.

## Rekommenderad leveransordning

### Fas 1 — 4 till 6 veckor

- Hubbsida, termsida, sök, kategorier och 35–50 granskade termer.
- Startsidesingång, footer-länk och sökresultatgruppen “Ord & sammanhang”.
- Kontextuell definition för 3–5 pilottermer.
- Källor, granskare, datum, ändringslogg och rättelseflöde.

### Fas 2

- Situationsguider och relaterade termnät.
- Svenska och engelska som separata redaktionella versioner, inte rå maskinöversättning.
- Kontextuella definitioner på events, venues, community och formulär.

### Fas 3

- Lokala/communitygranskare, fler språk och regioner.
- Personliga sparningar och lärstigar.
- B2B-verktyg för arrangörer och venues, tydligt separerade från redaktionen.

## Forskningsunderlag

- W3C, [Understanding Success Criterion 3.1.3: Unusual Words](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html)
- W3C, [Cognitive Accessibility Design Pattern: Use Clear Words](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/)
- RFSL, [Begreppsordlista](https://www.rfsl.se/hbtqi-fakta/begreppsordlista/)
- JMIR Formative Research, [Community-Engaged Participatory Methods to Address LGBTQ+ Young People’s Health Information Needs](https://formative.jmir.org/2023/1/e41682/)
- Schema.org, [DefinedTermSet](https://schema.org/DefinedTermSet)
- Google Search Central, [Introduction to structured data markup](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- Department for Education, [Guidance to meet the Plain Language standard](https://design.education.gov.uk/content-design/plain-language)

## Slutrekommendation

Bygg Queer Compass som **en central produkt med distribuerad närvaro**. Hubben gör den sökbar och trovärdig; de små förklaringarna ute i appen gör den användbar. Den kombinationen är mer värdefull än en isolerad ordlista och passar Queer Atlas kärna: att omvandla osäkerhet till förståelse och förståelse till tryggare verkliga val.
