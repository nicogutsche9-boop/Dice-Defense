# Dice Defense V9 — Real WebGL 3D

V9 bringt eine echte 3D-Rendering-Schicht ins Spiel.

## 3D
- Three.js/WebGL
- echte 3D-Geometrie und Beleuchtung
- frei drehbare Kamera
- Zoom
- animierte Würfel-Türme
- animierte Gegner
- Boss-Modell mit Aura-Ring
- 3D Arena/Crystal-Rift-Bühne
- prozedurale Materialien und Emissive-Effekte
- responsive Stage

Die Modelle sind in V9 prozedural aus 3D-Geometrie aufgebaut. Dadurch bleibt das Repository klein und die Assets sind sofort browserfähig. Die Geometrien können später 1:1 durch echte GLB/GLTF-Modelle ersetzt werden.

## Multiplayer
Die V7/V8 WebSocket-Grundlage bleibt enthalten.

## Start
```bash
npm install
npm start
```
Danach `http://localhost:8080`.

## Hinweis
Three.js wird aktuell vom jsDelivr-CDN geladen. Für einen komplett autarken Build kann die Library später lokal ins Repository gelegt werden. Für hochwertige Produktionsmodelle wären als nächster Asset-Schritt echte GLB/GLTF-Dateien, Texturen, Rigging und Animation-Clips sinnvoll.
