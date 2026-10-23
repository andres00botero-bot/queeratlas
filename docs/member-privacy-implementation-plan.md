# Medlemsintegritet: genomförande- och designplan

Datum: 2026-10-23. Ursprunglig genomförandeplan. Implementation och faktisk
produktionsstatus dokumenteras i `member-privacy-verification.md`.

## Mål och produktprincip

Medlemmen ska kunna spara platser, planera resor och använda sitt Atlas utan
att bli upptäckbar. Social synlighet är ett separat, aktivt och återkalleligt val.
Primär målgrupp är både nya medlemmar och befintliga medlemmar vars identitet,
sociala kontakter eller platsuppgifter kan medföra risk.

Hypotes: begriplig kontroll över synlighet ger fler meningsfulla kontakter och
bättre fortsatt användning av Atlas. Andelen synliga profiler är inget tillväxtmål.
Primärt utfall: accepterade kontaktförfrågningar, följt av fortsatt användning.
Skyddsmått: obehöriga utlämningar, blockeringsfel, rapporter om oönskad kontakt,
tid till hanterat säkerhetsärende och förmåga att förstå vem som ser profilen.
Mät aggregerat utan profil-ID, sökningar, kontaktgraf eller risklandssegment i
produktanalysen. Säkerhetsloggar har separat åtkomst och gallring.

## Utgångsläge vid planeringen (före implementationen)

- `src/lib/memberProfile.js` och profil-SQL använder standarden `members`.
- `supabase/community-member-search-v1.sql` saknar synlighetsfilter i sökningen.
  Funktionen är SECURITY DEFINER; dess explicita åtkomstvillkor måste granskas.
- Den konsoliderade SELECT-policyn behandlar ensidigt följande som `friends`.
- `isMember` i `src/lib/auth.js` är Boolean(user), inte särskild katalogbehörighet.
- Katalogen visar bland annat hemstad, land, pronomen och aktivitetsinformation.
- Klienten använder offentliga avatar-URL:er. Bucketens faktiska åtkomst är okänd.
- Sökningen har rankingfallback och lokal cache. Båda måste omfattas av skyddet.
- Fullständig kontoradering och blockering mellan alla ytor är inte verifierade.

## Fastställd målmodell

| Profilval | Åtkomst |
| --- | --- |
| Dold, standard | Ingen katalogpost; endast ägaren ser sin privata profil |
| Godkända kontakter | Delad profil endast till uttryckligen accepterade kontakter |
| Upptäckbar i communityn | Begränsad profil för katalogbehöriga medlemmar |

Inga offentliga vanliga medlemsprofiler. Eventuella offentliga författarsidor
hanteras separat med uttryckligt publiceringsval. Dold profil döljer inte
automatiskt redan publicerade kommentarer eller meddelanden; varje yta har
egen publik och tydlig förhandsinformation.

Katalogbehörighet är skild från profilens synlighet. En dold medlem kan få
katalogåtkomst utan att behöva publicera sig själv. Bekräftad e-post, accepterade
regler och missbrukskontroller är åtkomstvillkor, ingen garanti om god avsikt.
Ålderspolicy och skydd för minderåriga ska beslutas före lansering av sociala
kontakter; blanda inte vuxna och minderåriga i en obegränsad katalog.

## Etapp 1 — inventering, hotmodell och driftkontroll

1. Läs faktiska RLS-policyer, grants, RPC-definitioner, vyer och storage-regler
   i testmiljö och produktion utan att exportera verkliga medlemsprofiler.
2. Dokumentera flödet: registrering, OAuth, katalog, profil, ranking, avatar,
   följningar, meddelanden, kommentarer, recensioner, sparningar och minnen.
3. Kontrollera e-postbekräftelse, återställning, sessionscache, realtime,
   indexering, loggning, externa analyssystem och alternativa API-vägar.
4. Hotmodellera falska konton, massinsamling, stalking, kontokapning, delad
   enhet, auktoriserad mottagare som kopierar innehåll samt missbruk av adminåtkomst.
5. Upprätta dataskyddskonsekvensbedömning och bedöm rättslig grund, stöd för
   känsliga uppgifter, gallring, leverantörer och internationella överföringar.
6. Identifiera ansvarig för säkerhetsärenden, incidenter och lanseringsbeslut.

Leverans: åtkomstkarta, riskregister och granskad målmodell.
Om driftkontrollen bekräftar obehörigt utlämnande: begränsa den berörda
åtkomstvägen först och hantera eventuell incident separat. Vänta inte på design.

## Etapp 2 — säker datamodell och omställning av befintliga konton

1. Inför privat standardprofil och versionerat publiceringsval med tidpunkt.
   Saknat eller ogiltigt val betyder dold. Registrering ger aldrig automatiskt opt-in.
2. Separera kontouppgifter från den tillåtna katalogprojektionen. E-post,
   telefon, födelsedatum, hemort, resor och privata sparningar lämnas inte ut
   bara för att en profil är läsbar. RLS på rader ersätter inte fältbegränsning.
3. Skapa godkända kontaktrelationer med pending/accepted/declined/revoked.
   Befintligt ensidigt följande uppgraderas aldrig automatiskt till godkännande.
4. Separera profilpublik, upptäckbarhet, fältpublik och katalogbehörighet.
   Alias är obligatoriskt först vid delning; foto, pronomen och plats är frivilliga.
5. Migrera gamla profiler till dold när dokumenterat giltigt publiceringsval
   saknas. Gamla värdet `public` konverteras inte till offentligt publicerat.
6. Gör återaktivering i appen; skicka inte automatiskt känsliga e-postutskick.
   Publicerade bidrag bedöms separat från katalogprofilen.

Leverans: additiva migrationer, migreringsrapport med aggregerade antal och
syntetiska testdata. Bevara privata Atlas-data vid omställningen.

## Etapp 3 — genomgående behörighet, bilder och blockering

1. Samma centrala beslut används av sökning, direktprofil, kontaktförfrågan,
   ranking och bildåtkomst. Alla SECURITY DEFINER-funktioner kontrollerar
   avsändare, målprofil, publik, blockering och katalogbehörighet explicit.
2. Ta bort läckande fallback från ranking. Vid fel visas generiskt fel eller
   tomt tillstånd; inga alternativa bredare medlemslistor hämtas.
3. Inför blockering i båda riktningar över samtliga berörda ytor. Bekräfta inte
   för motparten att den blockerats. Använd samma neutrala otillgänglighetssvar.
4. Skydda avatarer och minnesbilder med privat storage och kortlivad,
   behörighetskontrollerad åtkomst. Granska även bildoptimering och CDN-cache.
   Bearbeta nya bilder för att ta bort platsmetadata och onödiga original.
   Inventera gamla publika objekt; nya privata URL:er gör inte gamla kopior privata.
5. Återkontrollera åtkomst för öppna profiler och töm klient-/servercache vid
   ändrad publik, blockering och utloggning. Realtime får inte ge en bakväg.
6. Rate limits och sökbudget per konto samt proportionerliga missbrukssignaler;
   enbart IP-begränsning är otillräcklig och får inte utestänga delade nätverk.
7. Inga profiluppgifter i URL-parametrar, publika sidförhandsvisningar,
   sitemap eller produktanalys. Noindex/no-store kompletterar riktig åtkomstkontroll.

Leverans: testad backend före att gränssnittet lovar att en profil är dold.

## Etapp 4 — design och texter för integritetsflöden

Återanvänd Midnight Atlas, befintliga komponenter och designsystemets tokens.
Gör en sammanhängande, återanvändbar komponentuppsättning: VisibilitySummary,
AudienceChoice, SharedProfilePreview, PrivacyHelp och BlockReportActions.
Namnen är arbetsnamn, inte nya tekniska krav.

| Token | Färg | Användning |
| --- | --- | --- |
| Grund | #0B1220 | Sidbakgrund |
| Yta | #141E2C | Kompakta paneler |
| Kant | #2B3949 | Diskret avgränsning |
| Primär text | #F5F1E8 | Rubriker och viktig information |
| Sekundär text | #BCC7D2 | Förklaringar |
| Mint | #80D4C4 | Primär handling och fokus |
| Lavendel | #B9AAF0 | Publikval, kontakter och små symboler |
| Isblå | #67D4F1 | Hjälp och information |
| Aprikos | #F2B38B | Viktig information före delning |
| Mjuk röd | #FDA4AF | Blockering/radering, inte dekorativ varning |

Verifiera kontrast för varje faktiskt färgpar, inklusive hover, transparens och
felstatus. Mintknappar har mörk text. Färg kompletteras alltid med text/ikon.
Använd ingen grön ”safe”-stämpel eller glöd som antyder garanterad trygghet.

| Yta | Design och innehåll |
| --- | --- |
| Registrering | Kort text om dold standardprofil. Aliasfält; abstrakt avatar. Inga förvalda publiceringsrutor eller automatisk OAuth-bild/namnpublicering. |
| Profilinställningar | En kompakt synlighetspanel, tre tydliga publikval och länk till hjälp. |
| Före delning | Exakt förhandsvisning av serverns tillåtna profilprojektion för vald publik; aktiv knapp ”Gör profilen upptäckbar”. |
| Katalog | Lugna medlemsrader med alias, frivillig avatar och kort text. Ingen aktivitet, avstånd, hemstad eller kontaktgraf som standard. |
| Kontaktförfrågan | Alias och kort frivillig hälsning. Acceptera, avböj, blockera/rapportera; inga läskvitton som standard. |
| Dold profil | Ägaren ser ”Dold från medlemskatalogen” och vad som fortfarande syns i publicerade bidrag. Andra ser neutral otillgänglighet. |
| Dölj direkt | Lättillgänglig handling utan onödig bekräftelse. Framgång visas först efter serverbekräftelse; fel/offline lovar aldrig att ändringen genomförts. |
| Radering | Sober dialog med konkret omfattning, återautentisering och status; ingen emotionell övertalning. |
| Utloggad community | Introduktion och tydligt märkta exempel; inga verkliga medlemsförhandsvisningar. |

Telefon: en kolumn, 16 px mellan huvudblock, tydliga rubriker, 14–16 px lästext,
minst 44 px tryckytor, kompakt statusrad och fördjupning vid behov. Undvik
horisontella kortkaruseller, flera konkurrerande CTA och långa varningsblock.
Fokus, etiketter, radioknappar, dialoger och felmeddelanden ska fungera med
tangentbord och skärmläsare. Testa även textförstoring och reducerad rörelse.

Engelska och spanska levereras samtidigt via befintlig i18n. Exempel:

| Engelska | Spanska |
| --- | --- |
| Your profile starts hidden. | Tu perfil está oculto por defecto. |
| Hidden from the member directory | Oculto en el directorio de miembros |
| Approved contacts | Contactos aprobados |
| Discoverable in the community | Visible en la comunidad |
| Preview what others can see | Vista previa de lo que otras personas pueden ver |
| Hide my profile | Ocultar mi perfil |
| I need extra privacy | Necesito más privacidad |

Leverans: granskbara desktop-/mobilvyer och färdiga tillstånd för laddning,
tom lista, ingen behörighet, offline, sparfel, blockerad och borttagen profil.
Låt användare med relevanta erfarenheter testa begriplighet utan krav att
redovisa läggning, juridisk identitet eller känslig vistelseort.

## Etapp 5 — platsval och frivillig integritetsguide

1. Separera intressestad från hemstad och aktuell position. Inget GPS-krav,
   medlemskarta, närhetssortering eller automatiskt publicerad reseaktivitet.
2. Förklara att stad/land-filter är preferenser, inte skydd mot falska uppgifter.
   Publiker bygger på kontakter/gruppåtkomst, inte påstådd identitet eller land.
3. Erbjud ”Jag behöver extra integritet” till alla. Rekommendera dold profil,
   alias, valfri bild utan igenkänningsdetaljer, odelad plats och diskreta aviseringar.
4. Landsvägledning är frivillig, daterad och källbelagd, med lokala undantag.
   QARI ändrar aldrig automatiskt synlighet. Lagra ingen separat riskpersonetikett.
5. Påminn om delade enheter, kontosäkerhet, kopierat innehåll och gränsen för
   alias/dold profil. Snabbutgång får inte lova raderad historik.
6. E-post/push om social aktivitet kräver aktivt val; inga känsliga förhandsvisningar.

## Etapp 6 — rapportering, radering och driftansvar

1. Profil- och meddelandemeny erbjuder blockera respektive rapportera separat.
   Inkludera stalking, hot om outing, identitetsmissbruk och oönskad kontakt.
2. Rapportering kan kombineras med blockering, men rapporterarens identitet
   lämnas inte till den rapporterade personen. Dokumentera behörig handläggning.
3. Definiera prioritering, eskalering och realistiska svarstider före lansering.
   Lova ingen jour eller svarstid som organisationen inte kan upprätthålla.
4. Kontoradering spärrar synlighet och sessioner först. Hantera därefter profil,
   bilder, relationer, index, lokala data och leverantörer enligt beslutad policy.
5. Besluta separat hur skickade meddelanden, offentliga bidrag, missbruksbevis
   och säkerhetskopior hanteras. Visa verkliga tider och eventuella undantag.
   Återställning från backup får inte återpublicera raderade/dolda profiler.
6. Minimera och logga adminåtkomst. Integritetsinställningar skyddar mot andra
   medlemmar och är ingen utfästelse om anonymitet gentemot operatören.

## Etapp 7 — godkännandekriterier och säker lansering

Testa med syntetiska profiler: utloggad, ny/obehörig medlem, katalogbehörig,
ensidig följare, godkänd kontakt, blockerad i båda riktningar och begränsad admin.
För varje roll testas katalog, direktlänk, RPC, tabellfråga, bild-URL, ranking,
meddelanden, realtime och cache. Kontrollera även nekade profilers fält i nätverkssvar.

Obligatoriska scenarier:

- Dold profil dyker aldrig upp i katalog, sökning eller rankingfallback.
- Ensidigt följande ger inte profil- eller kontaktåtkomst.
- Blockerad relation stoppar relevant åtkomst även med sparad direktlänk.
- Återkallad kontakt och döljning fungerar när motpartens sida redan är öppen.
- Offline eller RPC-fel avslöjar inga gamla alternativa profiler och ger inget
  falskt besked om att synligheten sparats.
- Utloggning på delad enhet tömmer relevanta cacheposter och privat UI.
- Katalogåtkomst kräver aldrig att medlemmen själv blir upptäckbar.
- Privata Atlas-data blir inte publika genom en profilinställning.
- Radering och backupåterställning respekterar återkallad synlighet.
- Mobil 320/390/430 px, desktop, tangentbord och engelska/spanska fungerar.

Lanseringsordning: driftinventering → additiv datamodell → backendskydd och
testkonton → kompatibelt UI → kontrollerad omställning → begränsad pilot →
bredare öppning efter säkerhets- och begriplighetsgranskning.
Katalogen hålls stängd om beroenden eller migrationer saknas. Vanligt privat
Atlas fortsätter fungera så långt beroendena tillåter.

Återställningsregel: design kan återställas, men gamla öppnare RLS-regler,
publika bildvägar eller förval får aldrig återinföras som rollback. Vid problem
stängs upptäckbarhet; privata konton och sparade platser bevaras.

## Första kompletta leveransen

Etapp 1–4 samt nödvändig blockering, rapportering och radering från etapp 6,
med godkända tester från etapp 7. Ingen ny katalog öppnas innan dessa skydd
fungerar. Landsanpassad fördjupning kan följa, men grundläggande integritetshjälp
och tydliga gränser måste finnas i första leveransen.

## Forskningsunderlag från analysen

- ARTICLE 19, dokumenterade hot: https://www.article19.org/resources/apps-traps-dating-apps-must-protect-communities-middle-east-north-africa/
- ARTICLE 19, rekommendationer 2024: https://www.article19.org/wp-content/uploads/2024/07/LGBTQ-MENA-Report-3-Recommendations-1.pdf
- EDPB, dataskydd som standard: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201904_dataprotection_by_design_and_by_default_v2.0_en.pdf
- IMY, konsekvensbedömning: https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/konsekvensbedomning/
- ILGA, rättighetskartor: https://ilga.org/ilga-world-maps/

Kontrollera källornas aktualitet vid implementation av landsinformation och
rättsliga krav. Rapportens kodfynd är inte en bekräftelse av produktionsläckage.
