# Extern Brein — CLAUDE.md

## Wat doet de app

Extern Brein is een persoonlijke taak- en notitiebeheerder, specifiek ontworpen voor iemand met ADD. De app werkt als een extern geheugen: je spreekt of typt een gedachte in, de AI analyseert en categoriseert het automatisch, en het item belandt als concept in de Inbox. Vanuit de Inbox keur je het goed waarna het in de juiste categorie en prioriteit terechtkomt.

Kernflow:
1. Spreek of typ een taak/notitie in
2. Claude Haiku analyseert de invoer, maakt een 5W+H-samenvatting en bepaalt type, categorie, prioriteit en tijdsduur
3. Item gaat als concept (`Goedgekeurd: false`) naar de Inbox
4. Gebruiker keurt goed vanuit de Inbox-tab → opgeslagen in Google Sheets

## Technologie

| Onderdeel | Technologie |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — één enkel bestand (`index.html`) |
| AI-analyse | Anthropic Claude API (`claude-haiku-4-5-20251001`) |
| Opslag backend | Google Apps Script + Google Sheets |
| Spraakherkenning | Web Speech API (`SpeechRecognition`) — Nederlands (`nl-NL`) |
| Lokale opslag | `localStorage` (fallback als Sheets niet bereikbaar is) |
| Hosting | GitHub (statische HTML, kan via GitHub Pages) |

## Projectstructuur

```
exterbrain/
├── index.html        # Volledige app (HTML + CSS + JS in één bestand)
└── apps-script.gs    # Google Apps Script backend (te plakken in script.google.com)
```

## Configuratie

- **Anthropic API-sleutel**: opgeslagen in `localStorage` onder `eb_api_key`. Instelbaar via ⚙️-knop in de header of automatisch gevraagd bij eerste gebruik.
- **Google Sheets URL**: hardcoded als `SHEETS_URL` in `index.html` (niet gevoelig — publiek endpoint).
- **Categorieën**: opgeslagen in `localStorage` onder `eb_cats`. Uitbreidbaar vanuit de Categorie-tab.

## Data-model (Google Sheet kolommen)

| Kolom | Type | Omschrijving |
|---|---|---|
| ID | string | Uniek ID (`Date.now().toString(36) + random`) |
| Datum | string | ISO-datumstring |
| Type | string | `"taak"` of `"notitie"` |
| Inhoud | string | De 5W+H-samenvatting |
| Categorie | string | Een van de 8 categorieën |
| Tijdsduur | string | `"7,5 min"`, `"15 min"`, `"30 min"`, `"1 uur"`, `"meer dan 1 uur"` of leeg |
| Prioriteit | string | `"hoog"`, `"gemiddeld"` of `"laag"` |
| Status | string | `"open"` of `"gedaan"` |
| Goedgekeurd | string | `"true"` of `"false"` |

## Functies

- **Inbox** — toont ongekeurde concepten (`Goedgekeurd: false`) met goedkeurknop
- **Alles** — alle goedgekeurde items
- **Duur** — filter op tijdsduur (7,5 min t/m meer dan 1 uur)
- **Categorie** — rasteroverzicht per categorie, doorklikbaar
- **Prioriteit** — items gesorteerd op hoog/gemiddeld/laag
- **Zoeken** — AI-gestuurde zoekfunctie via Claude over alle items
- **Bewerken** — overlay met microfoonknop per item (type, prioriteit, categorie, duur, tekst)
- **Spraak** — microfoon in hoofdinvoer, zoekbalk en bewerkscherm

## Huidige status

- ✅ Volledige CRUD via Google Sheets (getAll, add, update, delete)
- ✅ AI-analyse met 5W+H-samenvatting
- ✅ AI-categorisering met voorbeelden per categorie
- ✅ Spraakherkenning stopt direct na finaal resultaat (echo-fix)
- ✅ API-sleutel veilig in localStorage (niet in broncode)
- ✅ Lokale fallback via localStorage als Sheets niet bereikbaar is
- ✅ Inbox-flow: items starten als concept, worden handmatig goedgekeurd
- ✅ Bewerkscherm met microfoonknop (werkt ook op klein scherm)

## Bekende beperkingen

- **Spraakherkenning**: werkt alleen in Chrome/Edge (Web Speech API niet beschikbaar in Firefox/Safari op iOS)
- **CORS**: Apps Script POST-requests werken alleen zonder `Content-Type: application/json` header (simpele CORS-request) — de header is bewust weggelaten
- **Apps Script deployment**: na elke wijziging in het script moet een nieuwe versie worden gedeployed, anders blijft de oude code actief
- **Offline**: zonder internetverbinding valt de app terug op localStorage; wijzigingen worden dan niet gesynchroniseerd met Sheets

## Geplande verbeteringen

- [ ] Sync localStorage ↔ Sheets bij herstel internetverbinding
- [ ] Swipe-to-approve/delete op mobiel
- [ ] Herhaalbare taken (dagelijks, wekelijks)
- [ ] Notificaties / reminders
- [ ] Donker/licht thema schakelaar
- [ ] Export als CSV of PDF

## Apps Script deployen

1. Ga naar [sheets.google.com](https://sheets.google.com) → nieuw Sheet → **Extensies → Apps Script**
2. Plak de inhoud van `apps-script.gs`
3. **Implementeren → Nieuwe implementatie** → Type: Webtoepassing → Uitvoeren als: Ik → Toegang: Iedereen
4. Kopieer de deployment-URL en plak als waarde van `SHEETS_URL` in `index.html`
5. Na elke scriptwijziging: **Implementeren → Implementatie beheren → Nieuwe versie**
