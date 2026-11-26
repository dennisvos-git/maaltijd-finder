# Maaltijd Finder — Roadmap

**Status:** leidend uitvoeringsdocument  
**Bijgewerkt:** 26 november 2026  
**Bron:** [MASTERPLAN.md](./MASTERPLAN.md)  
**Repository:** `dennisvos-git/maaltijd-finder`

Deze roadmap vertaalt het masterplan naar een vaste uitvoeringsvolgorde. Het masterplan blijft leidend voor visie, scope en uitgangspunten. Wijzigingen in volgorde of scope vereisen expliciete toestemming van de eigenaar.

## Voortgangsoverzicht

| Fase | Prioriteit | Status | Toelichting |
|---|---:|---|---|
| 1. Huidige staat veiligstellen | P0 | In uitvoering | PR #3 is gemerged; Vercel-check op main is succesvol. Handmatige controle van de live productiepagina's en vastlegging van de nulmeting staan nog open. |
| 2. Datakwaliteit ontwerpen en invoeren | P0 | Gepland | Start pas nadat fase 1 aantoonbaar is afgerond. |
| 3. Beheeromgeving professionaliseren | P1 | Gepland | Volgt fase 2. |
| 4. Leveranciersbronnen inventariseren | P1 | Gepland | Eerst bronnen en voorwaarden feitelijk inventariseren. |
| 5. Eerste automatische controle bouwen | P1 | Gepland | Eén geschikte leverancier als gecontroleerde pilot. |
| 6. Geplande controles activeren | P2 | Gepland | Alleen na succesvolle pilot uit fase 5. |
| 7. Bezoekerservaring, SEO en prestaties | P2 | Gepland | Meten en testen binnen bestaande productvisie. |
| 8. Productiehardening en oplevering | P0/P1 | Gepland | Integrale afronding en productiecontrole. |

## Eerstvolgende openstaande taak

**Fase 1 — Huidige staat veiligstellen**

1. Controleer de actuele main-branch, openstaande pull requests en relevante checks.
2. Controleer de productiehomepage, catalogus, productdetailroute en beheeromgeving op de relevante gebruikersroutes.
3. Leg de daadwerkelijk actieve productiecommit en deploymentstatus vast.
4. Maak een nulmeting van bestaande functionaliteit, bekende beperkingen en reeds toegepaste databasewijzigingen.
5. Werk deze roadmap bij met de uitkomsten en markeer fase 1 pas afgerond wanneer de exitcriteria uit het masterplan zijn bewezen.

### Bekende GitHub-status op 26 november 2026

- Standaardbranch: `main`.
- Main-commit bij controle: `d3e193becd50f9a8997cfd55d704c3815a62267b`.
- Pull request #3 is gemerged.
- De gecombineerde Vercel-status voor deze commit is `success`.
- Er waren bij controle geen open pull requests.
- Een geslaagde Vercel-check is op zichzelf geen bewijs dat de relevante productiepagina's handmatig zijn gecontroleerd. Daarom blijft fase 1 open totdat die controle is uitgevoerd.

## Uitvoeringsregels

- Werk alleen aan de eerstvolgende openstaande taak met de hoogste prioriteit.
- Sla geen fase over en start geen lagere fase zolang een hogere fase open of geblokkeerd is.
- Voeg geen maaltijden of productrecords toe en wijzig bestaande productgegevens niet.
- Behoud Next.js, TypeScript, Vercel en Supabase.
- Bundel samenhangende wijzigingen en beperk deployments.
- Werk deze roadmap en relevante documentatie bij na iedere afgeronde taak.
- Gebruik uitsluitend de statussen Gepland, In uitvoering, Preview klaar, Gemerged, Live en Geblokkeerd zoals gedefinieerd in het masterplan en de Definition of Done.
- Noem iets alleen Live nadat deployment én relevante productiecontrole zijn geslaagd.

## Geblokkeerd of te besluiten

Er zijn op dit moment geen scopewijzigingen of eigenaarbesluiten aangevraagd. Als een noodzakelijke stap buiten het masterplan valt of een wezenlijke keuze over beveiliging, data, architectuur, kosten of externe afhankelijkheden vereist, wordt het werk gepauzeerd en eerst voorgelegd.
