# Expedition Äquator

Lernspiel für Erdkunde, Klasse 7 (Gymnasium NRW): Klima- und Landschaftszonen, Klimadiagramme auswerten und zeichnen, tropischer Regenwald.

Paul reist vom Basislager Düsseldorf über Grönland, die Tundra, Sibirien, Athen, Assuan und Kano bis nach Manaus. An jeder Station gibt es eine Lernkarte und 6 bis 8 Aufgaben. Am Ende wartet der Wetterwirbel als Probetest.

## Spielen

`index.html` im Browser öffnen (für Tablets gemacht). Der Spielstand wird nur lokal im Browser gespeichert.

## Inhalt

- 8 Stationen mit gut 100 Aufgaben: Klimadiagramm-Detektiv, aride Monate antippen, Rechnen, Kartenaufgaben, Reihenfolgen, Zuordnen, Antworten in eigenen Worten
- Diagramm-Werkstatt: Klimadiagramm von Manaus (wie auf dem Arbeitsblatt) und Athen selbst zeichnen
- Tipps in drei Stufen, zweiter Versuch, Schwierigkeit passt sich an
- Forschertagebuch: falsch gelöste Aufgaben zum Wiederholen
- Bossfight als Probetest (1 Versuch pro Aufgabe, 3 Joker)
- Elternansicht mit Auswertung pro Zone

Klimawerte sind gerundet und vereinfacht.

## Bearbeiten

Die Aufgaben stehen in `src/data.js`, die Spiellogik in `src/app.js`, Layout und Farben in `src/shell.html`. Danach neu bauen:

```
node src/build.js
```

Die Weltkarte (`src/land.txt`) stammt aus Natural Earth (gemeinfrei) über das Paket world-atlas.
