# Dice Defense V7 — Authoritative Multiplayer

V7 ist der nächste technische Multiplayer-Schritt.

## Neu
- server-authoritativer Run-State
- 20 Hz Game-Loop
- serverseitige Wellen
- serverseitige Gegnerbewegung
- serverseitige HP/Schaden/Rewards
- serverseitige Tower-Platzierung
- serverseitige Fusion
- serverseitige Ultimate-Fähigkeit
- 2–4 Spieler pro Lobby
- Live-Synchronisation der Spieler, Gegner, Türme, Welle, Leben, Gold und Energie
- Boss-Wellen bis Welle 50
- Sieg/Niederlage wird vom Server entschieden

## Start
```bash
npm install
npm start
```
Dann `http://localhost:8080` öffnen.

## Multiplayer
Spieler 1 erstellt einen Raum. Die anderen geben den Raumcode ein.
Für öffentliches Online-Koop muss `server.js` auf einem Node-fähigen Host laufen.

## Produktionshinweis
V7 ist eine technische Gameplay-/Netcode-Grundlage, kein fertiger kommerzieller Backend-Stack. Für Release fehlen u.a. Auth, Datenbank, Matchmaking, Reconnect, Persistenz, Rate-Limits, Anti-Cheat, skalierbare Room-Verwaltung und vollständige serverseitige Regeln für jede einzelne Fähigkeit.
