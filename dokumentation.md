# Zeit lernen

Eine Progressive Web App (PWA) zum Erlernen und Trainieren deutscher Uhrzeiten.

## Übersicht

Die App bietet drei Trainingsmodi, in denen Nutzer verschiedene Aspekte der deutschen Zeitangaben üben:

1. **Tageszeit** - Ordne einer Uhrzeit die passende Tageszeit zu (morgens, vormittags, mittags, nachmittags, abends, nachts)
2. **24h-Format** - Wandle zwischen 12-Stunden- und 24-Stunden-Format um (bidirektional)
3. **Umgangssprache** - Wandle zwischen Uhrzeit und Alltagssprache um, z.B. "halb vier", "viertel nach drei" (bidirektional)

## Features

### Übungsmodi
- Jeder Modus beginnt mit einer **Beispielseite**, die typische Umwandlungen zeigt
- Bidirektionale Modi (24h, Umgangssprache) fragen in beide Richtungen ab
- Eingabe per **Scroll-Wheel-Picker** (Touch-optimiert), alle 20 Fragen per Texteingabe
- **Analoge Uhr** visualisiert die angezeigte Zeit

### 10er-Einheiten (Branch: stats)
- Übungen sind in Blöcke von 10 Fragen aufgeteilt
- Nach jeder Runde: Resultat-Bildschirm mit Trefferquote
- Fehlerliste zeigt Aufgabe und richtige Antwort
- Falsch beantwortete Fragen können gezielt wiederholt werden

### Statistiken (Branch: stats)
- Session-basierte Erfolgsstatistiken pro Modus
- Gesamtübersicht: Trefferquote, Anzahl Sessions, Aufgaben, beste Serie
- Trend der letzten 5 Sessions
- Verlauf-Tabelle aller abgeschlossenen Sessions
- Historie pro Modus löschbar

### PWA
- Installierbar auf Mobilgeräten (Add to Homescreen)
- Offline-fähig dank Service Worker
- Network-first Caching-Strategie für automatische Updates

## Technologie

- **Reines HTML, CSS, JavaScript** - keine Frameworks oder Build-Tools
- **Service Worker** für Offline-Funktionalität
- **localStorage** für Statistik-Daten
- **Web App Manifest** für PWA-Installation

## Dateistruktur

```
zeit-lernen/
├── index.html        Hauptseite (HTML-Struktur)
├── style.css         Gesamtes Styling
├── app.js            Gesamte App-Logik
├── sw.js             Service Worker (Caching)
├── manifest.json     PWA-Manifest
├── icon-192.png      App-Icon (192x192)
└── icon-512.png      App-Icon (512x512)
```

## Branches

- **main** - Produktions-Branch, deployed via GitHub Pages
- **dev** - Entwicklungs-Branch
- **stats** - Feature-Branch für Statistiken und 10er-Einheiten

## Deployment

Die App wird über GitHub Pages deployed. Der Workflow:

1. Änderungen auf `dev` entwickeln und committen
2. `dev` nach `main` mergen
3. `main` pushen - GitHub Pages deployed automatisch

## Lokale Entwicklung

```bash
npx serve . -l 8090
```

Dann im Browser `http://localhost:8090` öffnen.

**Hinweis:** Bei Änderungen ggf. den Service Worker deregistrieren (DevTools > Application > Service Workers > Unregister) und mit `Cmd+Shift+R` hart neu laden. Alternativ die Cache-Version in `sw.js` hochzählen.

## Tageszeiten-Zuordnung

| Uhrzeit     | Tageszeit     |
|-------------|---------------|
| 0:00 - 4:59 | nachts        |
| 5:00 - 9:59 | morgens       |
| 10:00 - 11:59 | vormittags  |
| 12:00 - 13:59 | mittags     |
| 14:00 - 17:59 | nachmittags |
| 18:00 - 21:59 | abends      |
| 22:00 - 23:59 | nachts      |

## Umgangssprache-Zuordnung

| Minuten | Ausdruck              | Beispiel (3 Uhr)     |
|---------|-----------------------|-----------------------|
| :00     | [Stunde] Uhr         | drei Uhr              |
| :05     | fünf nach             | fünf nach drei        |
| :10     | zehn nach             | zehn nach drei        |
| :15     | viertel nach          | viertel nach drei     |
| :20     | zwanzig nach          | zwanzig nach drei     |
| :25     | fünf vor halb         | fünf vor halb vier    |
| :30     | halb                  | halb vier             |
| :35     | fünf nach halb        | fünf nach halb vier   |
| :40     | zwanzig vor           | zwanzig vor vier      |
| :45     | viertel vor           | viertel vor vier      |
| :50     | zehn vor              | zehn vor vier         |
| :55     | fünf vor              | fünf vor vier         |
