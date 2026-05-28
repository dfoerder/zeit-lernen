# Projektkontext: Zeit lernen

## Was ist das?

Eine Progressive Web App zum Trainieren deutscher Uhrzeiten. Zielgruppe: Deutschlerner. Läuft auf Mobilgeräten als installierbare PWA, komplett offline-fähig.

## Tech-Stack

- **Reines HTML/CSS/JS** – kein Framework, kein Bundler, kein Build-Schritt
- **Service Worker** (`sw.js`) für Offline-Caching (network-first Strategie)
- **localStorage** für Statistik-Daten (`zeit-stats` Key)
- **PWA Manifest** (`manifest.json`) für Installation

## Dateistruktur

```
zeit-lernen/
├── index.html        # Einzige HTML-Seite (SPA-artiges Umschalten per JS)
├── style.css         # Gesamtes Styling, keine CSS-Frameworks
├── app.js            # Gesamte Logik (700+ Zeilen)
├── sw.js             # Service Worker, Cache-Version manuell hochzählen
├── manifest.json     # PWA-Manifest
├── icon-192.png      # App-Icon
├── icon-512.png      # App-Icon
├── DOKUMENTATION.md  # Menschenlesbare Doku
└── claude.md         # Diese Datei
```

## Drei Übungsmodi

| Modus | Was wird geübt | Richtung |
|---|---|---|
| **Tageszeit** | Uhrzeit → Tageszeit (morgens, vormittags, ...) | Einseitig |
| **24h-Format** | 12h ↔ 24h Umwandlung | Bidirektional |
| **Umgangssprache** | Uhrzeit ↔ Alltagssprache (halb vier, viertel nach...) | Bidirektional |

### Tageszeiten-Zuordnung

```
0:00 - 4:59   → nachts
5:00 - 9:59   → morgens
10:00 - 11:59 → vormittags
12:00 - 13:59 → mittags
14:00 - 17:59 → nachmittags
18:00 - 21:59 → abends
22:00 - 23:59 → nachts
```

### Umgangssprache-Muster

```
:00 → [Stunde] Uhr          :35 → fünf nach halb [nächste]
:05 → fünf nach              :40 → zwanzig vor [nächste]
:10 → zehn nach              :45 → viertel vor [nächste]
:15 → viertel nach           :50 → zehn vor [nächste]
:20 → zwanzig nach           :55 → fünf vor [nächste]
:25 → fünf vor halb [nächste]
:30 → halb [nächste]
```

**Wichtig:** Bei halb/viertel vor/nach etc. wird die *nächste* Stunde referenziert (z.B. 3:30 = "halb vier").

## Architektur-Entscheidungen

### Eingabe
- Standard: **Scroll-Wheel-Picker** (Touch-optimiert, Custom-gebaut)
- Alle 20 Fragen: **Texteingabe** (erzwingt aktives Tippen)
- Bei Umgangssprache-Reverse: Uhr wird versteckt (würde Antwort verraten)

### Antwort-Validierung
- Case-insensitiv, Whitespace-tolerant
- Akzeptiert mehrere Schreibweisen (z.B. "3:00" und "03:00" und "3 uhr")
- Punkte statt Doppelpunkte akzeptiert (3.00 = 3:00)
- Zahlwörter und Ziffern gleichwertig ("drei" = "3" in Umgangssprache)

### Kein AM/PM
- Die App verwendet durchgehend **deutsche Tageszeiten** statt AM/PM
- `format12hTageszeit(h, m)` gibt z.B. "3:00 nachmittags" zurück
- Im Reverse-Picker für 24h gibt es noch AM/PM (TODO: sollte auch auf Tageszeiten umgestellt werden)

## State-Objekt (dev Branch)

```javascript
const state = {
  mode: '24h',           // Aktiver Modus
  hour: 0, minute: 0,   // Aktuelle Aufgabe
  correct: 0, total: 0, // Score
  streak: 0,            // Aktuelle Serie
  answered: false,       // Wurde aktuelle Frage beantwortet?
  showingExamples: true, // Beispiel-Ansicht aktiv?
  questionCount: 0,      // Fragen-Zähler (für Texteingabe-Trigger)
  useTyping: false,      // Texteingabe statt Picker?
  reverse: false,        // Rückrichtung aktiv?
  wheels: []             // Aktive Picker-Wheels
};
```

### Zusätzliche State-Felder (stats Branch)

```javascript
bestStreak: 0,          // Beste Serie der Session
showingStats: false,    // Stats-Ansicht aktiv?
roundIndex: 0,          // Position innerhalb 10er-Runde
sessionActive: false,   // Läuft eine Session?
mistakes: [],           // Fehler der aktuellen Runde [{hour, minute, reverse}]
roundQuestions: [],      // Fragen der aktuellen Runde
isRepeatRound: false    // Ist es eine Fehler-Wiederholungsrunde?
```

## Branches

| Branch | Status | Inhalt |
|---|---|---|
| `main` | Produktion | Deployed via GitHub Pages |
| `dev` | Entwicklung | Alle Basis-Features, deutsche Tageszeiten |
| `stats` | Feature | Basiert auf dev + Statistiken + 10er-Einheiten |

### Merge-Richtung
```
stats → dev → main
```

### Noch nicht gemergt
- `stats` enthält 2 zusätzliche Commits gegenüber `dev`:
  - Session-basierte Erfolgsstatistiken pro Modus
  - 10er-Übungseinheiten mit Fehlerwiederholung

## Deployment

```bash
# Lokal entwickeln
npx serve . -l 8090

# Service Worker loswerden bei Problemen:
# DevTools (Cmd+Option+I) > Application > Service Workers > Unregister
# Dann Cmd+Shift+R (Hard Reload)
# ODER: Cache-Version in sw.js hochzählen
```

**Deployment-Workflow:**
1. Auf `dev` (oder Feature-Branch) entwickeln
2. Nach `dev` mergen, testen
3. `dev` → `main` mergen
4. Push → GitHub Pages deployed automatisch

## Konventionen

- **Sprache im Code:** Variablen/Funktionen auf Englisch, UI-Texte auf Deutsch
- **Commit-Messages:** Deutsch, beschreibend (z.B. "AM/PM durch deutsche Tageszeiten ersetzen")
- **CSS:** Custom Properties in `:root`, keine externen Frameworks
- **Kein Build-Step:** Dateien direkt editierbar, kein Transpiling
- **Touch-first:** `touch-action: manipulation` auf Buttons, `min-height: 48px` für Touch-Targets
- **Safe Areas:** CSS `env(safe-area-inset-*)` für Notch-Geräte

## Bekannte Eigenheiten

- `reversePickerConfigs['24h']` verwendet noch AM/PM statt Tageszeiten im Picker
- Service Worker Cache-Version muss bei Änderungen manuell in `sw.js` hochgezählt werden (aktuell: v2 auf dev, v3 auf stats)
- `getDisplayAnswers()` im Umgangssprache-Modus filtert Duplikate über Index-Modulo (jeder zweite Eintrag ist Zahl statt Wort)
- `getTageszeitAnswers()` akzeptiert an Grenzstunden auch die benachbarte Tageszeit (z.B. 4:00 → "nachts" UND "morgens")
