# Dice Defense V8 — Crystal Rift 3D Art Edition

V8 bringt den Prototyp in Richtung einer fertigen Mobile-Game-Präsentation.

## V8
- neue „Crystal Rift“-Art-Direction
- pseudo-3D/3D-look für Würfel, Gegner und Bosse
- 3D Showcase mit modellartigen Würfelkarten
- detailliertere Arena mit Licht-/Depth-Layern
- ausgearbeitete Tower-Slots
- Boss-Auren und stärkere Trefferoptik
- Online-Koop-Grundlage aus V7 bleibt erhalten
- server-authoritative State, Wellen, Gegner, Tower, Fusion und Ultimate
- Deck Builder, Talentbaum, Meisterschaft, Sammlung und alle bisherigen Menüs

## Hinweis zu echten 3D-Dateien
Die V8-Webversion nutzt bewusst eine leichtgewichtige, browserfertige 3D-Illusion ohne externe Asset-Abhängigkeiten. Für echte GLB/GLTF-Modelle, Rigging, Animationen und vollständige 3D-Kamera können in einem nächsten Schritt konkrete 3D-Assets integriert werden.

## Start
```bash
npm install
npm start
```
Dann `http://localhost:8080` öffnen.

## Online
Der WebSocket-Server muss für echtes Internet-Koop auf Node-fähigem Hosting laufen. GitHub Pages kann nur das statische Frontend hosten.
