# Dice Defense V11 — GLB Gameplay Integration

V11 verwendet die mitgelieferten echten GLB-Assets jetzt nicht mehr nur in der Galerie, sondern direkt im Gameplay.

## Neu
- echte GLB-Würfelmodelle auf den Tower-Slots
- echte GLB-Bossmodelle in Boss-Wellen
- gemeinsamer transparenter WebGL-Layer über der Arena
- animierte 3D-Tower
- schwebende/rotierende 3D-Bosse
- Kamera, Licht und Schatteneffekte
- Zuordnung von Würfel-Fähigkeiten zu Asset-Dateien
- Zuordnung der wichtigsten Bossnamen zu Asset-Dateien
- Asset-Library aus V10 bleibt erhalten
- V7/V8 Multiplayer-Grundlage bleibt enthalten

## Start
```bash
npm install
npm start
```
Dann `http://localhost:8080`.

## Hinweis
Die GLB-Modelle werden im Browser über Three.js/GLTFLoader geladen. Für die nächste Ausbaustufe können wir die einzelnen GLB-Assets noch mit echten Angriffseffekten, Projektilen, Animation-Clips, Hitboxen, Stats und Boss-Phasen verbinden.
