# {{PROJECT_NAAM}}

{{PROJECT_BESCHRIJVING}}

## Wat is dit?
Een hybride webshop template voor bedrijven die zowel **verse producten** (met levertijd) als **materialen uit voorraad** (direct leverbaar) verkopen — bijvoorbeeld een bakkerij die taarten bakt op bestelling én keukenbenodigdheden verkoopt.

## Functionaliteit
- **Twee productcategorieën**: vers (met levertijd) en materiaal (voorraad)
- **Multi-categorie winkelwagen**: beide soorten producten in één bestelling
- **Leverplanner**: automatische berekening van de vroegst mogelijke leverdatum op basis van de langste levertijd van verse producten in de winkelwagen
- **Blokkeerbare leverdagen**: admin kan specifieke datums of vaste weekdagen (bv. zondag) uitsluiten van levering

## Structuur
frontend/

index.html       — hoofdpagina met productcatalogus + winkelwagen

cart.js          — winkelwagen logica + leverdatum berekening

styles/

theme.css         — kleuren/fonts (automatisch gegenereerd per stijl)

main.css          — layout

data/

products.json     — productcatalogus (vers + materiaal)

blocked_dates.json — admin-instelbare geblokkeerde leverdagen
## Admin: leverdagen blokkeren
Bewerk `data/blocked_dates.json`:
```json
{
  "blocked_dates": ["2026-12-25", "2026-01-01"],
  "blocked_weekdays": [0]
}
```
`blocked_weekdays`: 0=zondag, 1=maandag ... 6=zaterdag

## Admin: producten beheren
Bewerk `data/products.json`. Verse producten hebben `levertijd_dagen` (bepaalt leverplanner), materialen hebben `voorraad` (bepaalt beschikbaarheid).

## Gegenereerd door
ARC AI Agents Website Fabriek — Forge
