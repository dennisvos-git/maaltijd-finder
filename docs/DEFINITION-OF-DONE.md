# Maaltijd Finder — Definition of Done

**Status:** bindend acceptatiedocument  
**Bijgewerkt:** 26 november 2026  
**Bron:** [MASTERPLAN.md](./MASTERPLAN.md) en [ROADMAP.md](./ROADMAP.md)

Een taak is pas afgerond wanneer de toepasselijke controles hieronder aantoonbaar zijn uitgevoerd. Een merge, groene preview of succesvolle deployment alleen is niet voldoende om werk als Live of volledig afgerond te bestempelen.

## 1. Scope en plan

- [ ] De wijziging ondersteunt een expliciete taak uit de actuele roadmap.
- [ ] De wijziging blijft binnen de visie en niet-doelen uit het masterplan.
- [ ] Er is geen ongevraagde functionaliteit of zijpad toegevoegd.
- [ ] Er zijn geen maaltijden of productrecords toegevoegd, verwijderd of gewijzigd.
- [ ] De bestaande Next.js-, TypeScript-, Vercel- en Supabase-architectuur is behouden, tenzij een aantoonbare en vooraf goedgekeurde noodzaak bestaat.
- [ ] Eventuele gevolgen voor bestaande functionaliteit, gegevens, beveiliging en kosten zijn beoordeeld.

## 2. Codekwaliteit en tests

Voer uit wat voor de betreffende wijziging van toepassing is en noteer de concrete uitkomst:

- [ ] Lint slaagt.
- [ ] TypeScript/typecheck slaagt.
- [ ] Importvalidatie slaagt wanneer importfunctionaliteit is geraakt.
- [ ] Productiebuild slaagt.
- [ ] Relevante unit-, integratie- en functionele tests slagen.
- [ ] Relevante gebruikersroutes zijn handmatig gecontroleerd.
- [ ] Bestaande functionaliteit is op regressies gecontroleerd.
- [ ] Fout-, laad-, lege en randgevallen zijn getest waar van toepassing.

Als een test niet bestaat of niet uitvoerbaar is, wordt dat expliciet vermeld; een niet-uitgevoerde test wordt nooit als geslaagd gerapporteerd.

## 3. Database en gegevensveiligheid

- [ ] Databasewijzigingen zijn opgenomen als genummerde migratie in `supabase/migrations/`.
- [ ] De migratie is gecontroleerd op bestaande schema- en dataconsequenties.
- [ ] Er is een terugval- of herstelplan waar de wijziging dat vereist.
- [ ] Migraties zijn afzonderlijk en gecontroleerd toegepast; een Vercel-deployment geldt niet als SQL-uitvoering.
- [ ] Reeds toegepaste migraties worden niet opnieuw uitgevoerd.
- [ ] RLS en autorisatie zijn getest voor relevante lees- en schrijfpaden.
- [ ] Onbekende waarden blijven onbekend; er zijn geen gegevens verzonnen.
- [ ] Geen geheimen, service-role-sleutels of tokens zijn toegevoegd aan browsercode, repository of logs.

## 4. Documentatie en pull request

- [ ] Relevante technische documentatie is bijgewerkt.
- [ ] De roadmapstatus is bijgewerkt en komt overeen met het echte werk.
- [ ] De pull request beschrijft doel, scope, wijzigingen, tests en eventuele migraties.
- [ ] De diff is gecontroleerd op onbedoelde bestanden of productdatawijzigingen.
- [ ] Preview-build en relevante previewroutes zijn gecontroleerd.
- [ ] De pull request is pas gemerged nadat de vereiste controles zijn uitgevoerd en eventuele blokkades zijn opgelost.

## 5. Productieacceptatie

Voor status **Live** zijn alle volgende punten verplicht:

- [ ] De bedoelde commit staat op de productiebranch.
- [ ] De productie-deployment heeft een succesvolle status.
- [ ] De actieve productie-URL is gecontroleerd.
- [ ] De relevante productiegebruikersroutes zijn handmatig gecontroleerd.
- [ ] Er zijn geen kritieke fouten of regressies waargenomen.
- [ ] De gerapporteerde live-status verwijst naar de daadwerkelijk gecontroleerde commit/deployment.

## 6. Aanvullende acceptatie voor datakwaliteit en automatisering

Wanneer een taak datakwaliteit of leverancierscontroles raakt:

- [ ] Herkomst, controlemethode en controletijdstip zijn duidelijk.
- [ ] Databasewijzigingen worden niet verward met externe bronverificatie.
- [ ] Statussen compleet/gecontroleerd, gedeeltelijk/onvolledig, verouderd, controle nodig, niet beschikbaar en onbekend zijn eenduidig toegepast.
- [ ] Verdachte waarden worden tegengehouden voor handmatige beoordeling.
- [ ] Fouten van één leverancier blokkeren niet onnodig controles van andere leveranciers.
- [ ] Logging toont wat wel en niet gecontroleerd is.
- [ ] Automatische verwerking en prijshistorie zijn getest met normale én foutieve scenario's.
- [ ] Een geplande of dagelijkse controle wordt pas als actief beschreven wanneer planning, uitvoering en monitoring aantoonbaar werken.

## 7. Verplichte opleverrapportage

Iedere afgeronde taak wordt kort gerapporteerd met:

1. roadmapfase en taak;
2. concrete code- en documentatiewijzigingen;
3. uitgevoerde tests en exacte uitkomsten;
4. databasehandelingen en eventuele handmatige actie van de eigenaar;
5. PR-, preview-, merge- en productiestatus;
6. resterende beperkingen of blokkades;
7. eerstvolgende taak volgens de roadmap.

## 8. Statusdefinities

| Status | Betekenis |
|---|---|
| Gepland | Nog niet ontwikkeld. |
| In ontwikkeling | Code of documentatie wordt aangepast. |
| Preview klaar | Preview-build is succesvol; nog niet noodzakelijk gemerged of live. |
| Gemerged | Code staat op `main`; productiegedrag is daarmee nog niet bewezen. |
| Live | Productie-deployment is succesvol én relevante productiefunctionaliteit is gecontroleerd. |
| Geblokkeerd | Een fout, afhankelijkheid of noodzakelijke beslissing verhindert veilige voortgang. |

**Bindende regel:** ontbrekend bewijs betekent niet afgerond. Rapporteer altijd wat daadwerkelijk is uitgevoerd en laat niet-uitgevoerde controles openstaan.
