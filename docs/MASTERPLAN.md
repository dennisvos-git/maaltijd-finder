# Maaltijd Finder — Masterplan en bindende ontwikkelafspraken

**Status:** leidend projectplan  
**Eigenaar uitvoering:** ChatGPT als technisch projectleider/CTO binnen de opdracht van de eigenaar  
**Repository:** `dennisvos-git/maaltijd-finder`  
**Laatste uitgangspunt:** voortbouwen op de bestaande Next.js-, Vercel- en Supabase-architectuur.

Dit document is de centrale bron van waarheid voor alle verdere ontwikkeling. De roadmap, de scopegrenzen en de acceptatiecriteria hieronder zijn leidend. Bij verschil tussen een losse technische ingeving en dit document gaat dit document voor, tenzij de eigenaar het plan uitdrukkelijk wijzigt.

---

## 1. Productvisie en eindresultaat

Maaltijd Finder wordt een onafhankelijke Nederlandse vergelijkingssite voor **individuele kant-en-klare diepvriesmaaltijden** van aanbieders die actief zijn in Nederland.

De website verkoopt zelf geen maaltijden. Bezoekers zoeken, filteren en vergelijken productinformatie en klikken voor een eventuele bestelling door naar de aanbieder.

Het eindresultaat bestaat uit vier samenhangende onderdelen:

1. **Bezoekerswebsite:** snelle, toegankelijke en mobielvriendelijke catalogus met zoeken, filters, sortering en productdetailpagina's.
2. **Beheeromgeving:** beveiligd dashboard voor productkwaliteit, leveranciers, controles, afwijkingen en beheer.
3. **Betrouwbare gegevenslaag:** duidelijke herkomst, actualiteit, validatie en prijshistorie; ontbrekende informatie blijft onbekend.
4. **Gecontroleerde automatisering:** waar bronnen dit betrouwbaar en toegestaan mogelijk maken, periodieke leverancierscontroles met logging, validatie en veilige verwerking.

## 2. Vaste scope en niet-doelen

### Binnen scope

- De bestaande website en catalogus verbeteren.
- Zoekfunctie, filters, sortering en mobiele bruikbaarheid verbeteren.
- Productdetailpagina's en prijshistorie betrouwbaar presenteren.
- Admin-dashboard en leveranciersbeheer verbeteren.
- Datakwaliteit, herkomst en controledatums verbeteren.
- Gecontroleerde product- en leveranciersvalidatie bouwen.
- Automatische controles ontwikkelen voor bronnen die technisch betrouwbaar en toegestaan zijn.
- SEO, toegankelijkheid, prestaties, beveiliging, monitoring en documentatie verbeteren.
- Bestaande gegevens behouden en beschermen.

### Buiten scope, tenzij de eigenaar het plan expliciet wijzigt

- Nieuwe maaltijden of productrecords toevoegen.
- Het assortiment vullen of uitbreiden.
- Een webwinkel, winkelmand, checkout, betalingssysteem of eigen bezorgdienst bouwen.
- Leveranciers benaderen of namens de eigenaar contact opnemen.
- Leveranciers opnemen die niet aantoonbaar actief zijn in Nederland.
- Niet-individuele maaltijden als kernassortiment toevoegen.
- Gegevens, prijzen, voedingswaarden, allergenen, ingrediënten, beoordelingen of beschikbaarheid verzinnen.
- Een crawler bouwen die beveiligingen, toegangsbeperkingen of gebruiksvoorwaarden omzeilt.
- Een externe dagelijkse crawl claimen zolang die niet aantoonbaar is gebouwd, geconfigureerd en getest.
- Een grote technische migratie uitvoeren zonder aantoonbare noodzaak.

### Gegevensregels

- Ontbrekende waarden blijven leeg/onbekend; er worden geen aannames ingevuld.
- Minimum bestelhoeveelheden zijn bezorgvoorwaarden en sluiten een aanbieder niet uit.
- Een databaseprijswijziging is niet hetzelfde als een extern geverifieerde prijswijziging.
- Een dashboardvernieuwing haalt gegevens opnieuw uit Supabase; dit is geen leverancierscrawl.
- Een product krijgt pas de status gecontroleerd wanneer de relevante bron daadwerkelijk is geraadpleegd en de controle is vastgelegd.
- Producten en leveranciers worden niet verwijderd of overschreven zonder expliciete, veilige reden en passende opdracht.

## 3. Productdoelen

### 3.1 Bezoekerservaring

De bezoeker moet:
- direct begrijpen dat Maaltijd Finder vergelijkt en doorverwijst;
- producten kunnen zoeken en filteren op relevante kenmerken;
- actieve filters en het aantal resultaten kunnen zien;
- filters eenvoudig kunnen wissen;
- op desktop, tablet en mobiel prettig kunnen navigeren;
- productinformatie, prijs, gewicht, aanbieder en actualiteit kunnen beoordelen;
- doorklikken naar de juiste aanbieder;
- kunnen zien wanneer informatie ontbreekt of verouderd is.

De bestaande rustige vormgeving blijft de basis. Ontwerpverbeteringen zijn toegestaan als ze aantoonbaar de duidelijkheid, toegankelijkheid of bruikbaarheid verbeteren en binnen deze productvisie passen. Geen redesign om het redesign.

### 3.2 Productdetail

Waar gegevens beschikbaar zijn, toont een productdetailpagina:
- productnaam en afbeelding;
- aanbieder en link naar de aanbieder;
- prijs en gewicht;
- berekende prijs per kilogram wanneer prijs en gewicht bekend zijn;
- productsoort en relevante kenmerken;
- ingrediënten, voedingswaarden, allergenen en bereidingsinformatie uitsluitend als die bekend en onderbouwd zijn;
- beschikbaarheid en controledatum;
- prijshistorie met een correcte uitleg van de herkomst.

### 3.3 Beheeromgeving

De beheeromgeving moet uiteindelijk:
- product- en leverancierskwaliteit in één oogopslag tonen;
- ontbrekende en verouderde informatie herkennen;
- afwijkende of verdachte waarden signaleren;
- controle-uitkomsten en foutmeldingen tonen;
- een onderscheid maken tussen handmatig vernieuwen, gegevensvalidatie en externe broncontrole;
- alleen toegankelijk zijn voor geautoriseerde beheerders;
- geen onnodige of publieke schrijf- en verwijdermogelijkheden bieden.

## 4. Datakwaliteit en gegevensmodel

Het datakwaliteitsmodel wordt stapsgewijs ingevoerd. Het moet minimaal onderscheid kunnen maken tussen:
- compleet/gecontroleerd;
- gedeeltelijk/onvolledig;
- verouderd;
- controle nodig;
- niet beschikbaar;
- onbekend/niet vastgesteld.

Waar technisch passend worden herkomst en controlemoment per belangrijk veld bijgehouden, in plaats van uitsluitend één algemene productdatum. Denk aan prijs, gewicht, beschikbaarheid, ingrediënten en voedingsinformatie.

Een controle moet minimaal kunnen vastleggen:
- product en leverancier;
- gecontroleerde bron;
- controletijdstip;
- controlemethode;
- gecontroleerde velden;
- uitkomst;
- eventuele fout of afwijking;
- of een wijziging automatisch is verwerkt of handmatige beoordeling vereist.

Verdachte wijzigingen worden niet blind gepubliceerd. Voorbeelden zijn nulprijzen, extreme prijsverschillen, ontbrekende gewichten, ongeldige URL's en conflicterende beschikbaarheid.

## 5. Automatische leverancierscontroles

Automatische controles worden gefaseerd gebouwd. Niet iedere leverancier hoeft of kan automatisch worden gecontroleerd.

Per leverancier wordt eerst vastgesteld:
- of de aanbieder in Nederland actief is;
- welke officiële of anderszins betrouwbare productbron beschikbaar is;
- welke velden daaruit betrouwbaar kunnen worden gelezen;
- of de methode voldoet aan relevante gebruiksvoorwaarden en toegangsbeperkingen;
- hoe vaak een controle verantwoord is;
- hoe fouten en wijzigingen worden afgehandeld.

Eerst wordt één geschikte leverancier als proef aangesloten. Pas na aantoonbaar betrouwbare resultaten wordt de aanpak uitgebreid.

Een automatische controle moet:
1. toegestane broninformatie ophalen;
2. de gegevens normaliseren;
3. waarden valideren;
4. vergelijken met de bestaande gegevens;
5. verdachte wijzigingen tegenhouden;
6. betrouwbare wijzigingen gecontroleerd registreren;
7. prijshistorie correct laten vastleggen;
8. een controlelog opslaan;
9. fouten isoleren zodat één leverancier niet de hele run blokkeert;
10. zichtbaar rapporteren wat wel en niet is gecontroleerd.

Dagelijkse planning wordt pas geactiveerd nadat de proefcontrole betrouwbaar werkt. De planning en monitoring moeten aantoonbaar draaien voordat we spreken van dagelijkse automatisering.

## 6. Technische uitgangspunten

- Behoud Next.js, TypeScript, Vercel en Supabase zolang er geen concrete technische reden is om te migreren.
- Gebruik Supabase als centrale database en authenticatievoorziening.
- Houd server- en clientverantwoordelijkheden duidelijk gescheiden.
- Gebruik Row Level Security voor relevante tabellen en operaties.
- Plaats nooit service-role-sleutels of andere geheimen in browsercode, repository of zichtbare logs.
- Geef publieke bezoekers alleen de noodzakelijke leesrechten.
- Beperk admin-schrijfrechten tot expliciet geautoriseerde accounts.
- Geen verwijderrechten tenzij een afzonderlijke, onderbouwde eis dit noodzakelijk maakt.
- Databasewijzigingen komen als genummerde migraties in `supabase/migrations/`.
- Een Vercel-deployment voert geen Supabase SQL uit. Migraties worden afzonderlijk en gecontroleerd toegepast.
- Voer geen migratie uit die al op het project is toegepast.
- Maak geen nieuwe tabellen of services alleen voor mogelijke toekomstige wensen; eerst een concrete use-case en ontwerp.

Mogelijke toekomstige entiteiten zoals productcontroles, leverancierscontroles, gegevensbronnen en importlogs zijn ontwerpopties, geen toestemming om ze zonder fase- en acceptatiecontrole direct allemaal aan te maken.

## 7. SEO, toegankelijkheid en prestaties

Binnen scope vallen:
- correcte paginatitels, beschrijvingen, canonical URLs en sitemap;
- correcte indexering en uitsluiting van beheerpagina's;
- bruikbare interne links en relevante gestructureerde gegevens;
- unieke, inhoudelijk waardevolle overzichts- en productpagina's;
- geen lege of vrijwel identieke SEO-pagina's op grote schaal;
- toetsenbordbediening en zichtbare focus;
- semantische HTML en begrijpelijke fout-/statusmeldingen;
- responsieve layouts;
- geoptimaliseerde afbeeldingen en efficiënte databasequeries;
- meten vóór optimaliseren.

## 8. Uitvoeringsroadmap — vaste volgorde

### Fase 1 — Huidige staat veiligstellen
- Openstaande wijzigingen en pull requests controleren.
- Preview-build en checks controleren.
- Relevante beheerfunctionaliteit handmatig nalopen.
- Documentatie controleren op juistheid.
- Huidige productieversie en commit vastleggen.
- Een nulmeting maken van bestaande functionaliteit en bekende beperkingen.

**Exitcriteria:** productieversie en repositorystatus zijn bekend; openstaande wijzigingen zijn correct getest; niets wordt als live aangemerkt zonder succesvolle productiecheck.

### Fase 2 — Datakwaliteit ontwerpen en invoeren
- Bestaande tabellen en velden inventariseren.
- Verplichte, optionele en onbekende velden definiëren.
- Herkomst en controledatums ontwerpen.
- Kwaliteitsstatussen definiëren.
- Validatieregels en afwijkingsdetectie vastleggen.
- Migraties en terugvalplan voorbereiden.
- Testen met bestaande records, zonder productrecords toe te voegen.

**Exitcriteria:** kwaliteitsstatussen zijn eenduidig; onbekende waarden blijven onbekend; wijzigingen zijn getest en veilig terug te draaien.

### Fase 3 — Beheeromgeving professionaliseren
- Productkwaliteitsdashboard verbeteren.
- Filters en sortering voor beheer toevoegen waar nodig.
- Product- en leveranciersinformatie inzichtelijk maken.
- Controlehistorie en bronverwijzingen tonen.
- Fout-, laad- en lege toestanden verbeteren.
- Admin-toegang en RLS opnieuw testen.

**Exitcriteria:** een beheerder kan problemen vinden en begrijpen zonder rechtstreeks databasewerk voor normale controles.

### Fase 4 — Leveranciersbronnen inventariseren
- Bestaande Nederlandse leveranciers nalopen.
- Betrouwbare bronnen per leverancier vaststellen.
- Beschikbare productvelden documenteren.
- Technische en gebruiksvoorwaarden beoordelen.
- Automatische, handmatige of niet-geschikte controlemethode kiezen.

**Exitcriteria:** er is een onderbouwde bronmatrix; er wordt niet gegokt over de beschikbaarheid of betrouwbaarheid van bronnen.

### Fase 5 — Eerste automatische controle bouwen
- Eén geschikte leverancier selecteren.
- Ophalen, normaliseren en valideren implementeren.
- Vergelijking met bestaande gegevens bouwen.
- Afwijkingen in quarantaine/handmatige beoordeling plaatsen.
- Logging en foutafhandeling toevoegen.
- Prijshistorie-integratie testen.
- Herhaald uitvoeren met normale en foutieve scenario's.

**Exitcriteria:** de proefcontrole levert reproduceerbare, aantoonbaar juiste uitkomsten en verwerkt geen onbetrouwbare wijzigingen automatisch.

### Fase 6 — Geplande controles activeren
- Scheduler kiezen en configureren.
- Dubbele runs voorkomen.
- Time-outs en beperkte retries instellen.
- Resultaten en fouten zichtbaar maken.
- Monitoring en rapportage testen.
- Gefaseerd leveranciers toevoegen.

**Exitcriteria:** geplande uitvoering is aantoonbaar actief, meetbaar en herstelbaar. Pas dan mag dagelijkse automatische controle als opgeleverd worden beschreven.

### Fase 7 — Bezoekerservaring, SEO en prestaties
- Zoek- en filtergedrag testen.
- Mobiele schermformaten controleren.
- Productdetail en prijshistorie verbeteren.
- SEO en indexering controleren.
- Afbeeldingen en laadtijden meten en optimaliseren.
- Toegankelijkheid testen.

**Exitcriteria:** belangrijkste gebruikersroutes werken op gangbare schermformaten; SEO en prestaties zijn gecontroleerd met concrete resultaten.

### Fase 8 — Productiehardening en oplevering
- Functionele regressietests uitvoeren.
- RLS en autorisatie controleren.
- Back-up- en herstelprocedure vastleggen en testen.
- Monitoring controleren.
- Documentatie afronden.
- Productiebuild en deployment controleren.
- Productiegedrag nalopen.

**Exitcriteria:** alle P0/P1-eisen zijn afgevinkt, bekende beperkingen zijn gedocumenteerd en productie is daadwerkelijk gecontroleerd.

## 9. Prioriteiten

- **P0:** productie veiligstellen, bestaande wijzigingen afronden, datakwaliteit en beveiliging.
- **P1:** beheeromgeving, leveranciersbronnen, eerste betrouwbare automatische controle, logging en foutafhandeling.
- **P2:** dagelijkse planning, uitbreiding naar geschikte leveranciers, SEO, monitoring en prestaties.
- **P3:** verdere verfijning die aantoonbaar waarde toevoegt binnen de productvisie.

Een hogere prioriteit wordt eerst afgerond of expliciet geblokkeerd voordat lager geprioriteerd werk start.

## 10. Definition of Done

Een werkpakket is pas afgerond wanneer:
- het een expliciet onderdeel van deze roadmap ondersteunt;
- de scope en gevolgen vooraf duidelijk zijn;
- bestaande functionaliteit niet onbedoeld is beschadigd;
- importvalidatie, lint, TypeScript en productiebuild slagen voor zover van toepassing;
- relevante functionele en beveiligingstests zijn uitgevoerd;
- databasewijzigingen als migratie zijn gedocumenteerd en afzonderlijk toegepast indien nodig;
- documentatie is bijgewerkt;
- de pull request en preview zijn gecontroleerd;
- de productie-deployment succesvol is wanneer het werk als live wordt aangeduid;
- de echte productiefunctionaliteit is gecontroleerd;
- geen maaltijden of productgegevens buiten de opdracht zijn toegevoegd of gewijzigd.

Statussen worden nauwkeurig gebruikt:
- **Gepland:** nog niet ontwikkeld.
- **In ontwikkeling:** code wordt aangepast.
- **Preview klaar:** preview-build is succesvol; niet automatisch live.
- **Gemerged:** code staat op main; niet automatisch bewezen live.
- **Live:** productie-deployment is succesvol én relevante productiecontrole is uitgevoerd.
- **Geblokkeerd:** afhankelijkheid, fout of externe beperking verhindert voortgang.

## 11. Vaste ontwikkelregels — geen zijpaden

1. Dit masterplan is de bron van waarheid.
2. Werk uitsluitend aan de eerstvolgende openstaande roadmapstap met de hoogste prioriteit.
3. Voeg geen ongevraagde functionaliteit toe.
4. Verander de productvisie, scope of prioriteiten niet stilzwijgend.
5. Als een technisch probleem een kleine, planconforme oplossing heeft, kies die oplossing.
6. Als een oplossing scope, kosten, beveiliging, gegevensmodel of externe afhankelijkheden wezenlijk verandert, leg het probleem en de kleinste opties voor aan de eigenaar voordat je die keuze uitvoert.
7. Parkeer ideeën buiten scope in een aparte lijst; voer ze niet uit.
8. Bundel samenhangende wijzigingen in één werkpakket en één pull request waar mogelijk. Vermijd onnodige commits en deployments.
9. Gebruik geen fictieve gegevens om een functie te demonstreren in productie.
10. Voeg geen producten of maaltijden toe; wijzig bestaande productgegevens niet als onderdeel van ontwikkelwerk.
11. Vraag niet opnieuw naar informatie die al in de repository of projectcontext aanwezig is.
12. Vraag alleen om input wanneer een noodzakelijke beslissing niet veilig of feitelijk uit beschikbare informatie kan worden afgeleid.
13. Vraag nooit om wachtwoorden, tokens, service-role-sleutels of andere geheimen.
14. Communiceer voortgang kort en feitelijk: wat is gedaan, wat is aantoonbaar getest, wat staat nog open en wat is de eerstvolgende stap.
15. Claim nooit dat iets live, automatisch of geverifieerd is zonder aantoonbaar bewijs.

## 12. Omgaan met nieuwe ideeën en wijzigingen

Nieuwe ideeën worden niet automatisch onderdeel van het werk. Ze worden:
- afgewezen als ze strijdig zijn met de vaste scope;
- geparkeerd als ze mogelijk later nuttig zijn;
- alleen aan het masterplan toegevoegd na expliciete opdracht van de eigenaar.

Een noodzakelijke afwijking wordt eerst beschreven met:
- reden;
- betrokken roadmapfase;
- gevolgen voor bestaande functionaliteit, data, beveiliging en kosten;
- kleinste planconforme oplossing;
- eventuele beslissing die de eigenaar moet nemen.

## 13. Voortgangsrapportage

Na ieder afgerond werkpakket rapporteer ik:
1. roadmapfase en taak;
2. concrete wijzigingen;
3. tests en uitkomsten;
4. databasehandelingen die de eigenaar eventueel zelf moet uitvoeren;
5. PR-, preview- en productie-status;
6. openstaande blokkades;
7. de eerstvolgende taak volgens de roadmap.

Geen lange lijst met nieuwe ideeën aan het einde van iedere update. De uitvoering gaat door volgens de vastgestelde volgorde.

---

**Leidend besluit:** Maaltijd Finder wordt ontwikkeld als betrouwbare Nederlandse vergelijkingssite voor individuele kant-en-klare diepvriesmaaltijden. Betrouwbaarheid, datakwaliteit, beveiliging en gecontroleerde automatisering gaan vóór snelheid of extra functies. Afwijken van dit plan gebeurt alleen na expliciete wijziging door de eigenaar.
