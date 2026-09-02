# Dice Defense V6 — Online Coop Foundation

V6 enthält zusätzlich zum Frontend einen echten kleinen Node.js-WebSocket-Server.

## Lokal starten
1. Node.js installieren.
2. Im Projektordner:
   `npm install`
3. Start:
   `npm start`
4. Browser öffnen:
   `http://localhost:8080`

## Online-Koop
- Raum erstellen
- Raumcode an Freunde schicken
- Bis zu 4 Spieler pro Raum
- Echtzeit-State über WebSockets
- Server hält Welle, Leben und Spieler-Liste
- Start eines Koop-Runs wird an alle Clients synchronisiert

## GitHub
Das Frontend kann weiterhin als GitHub-Pages-Website veröffentlicht werden. Für echtes Online-Koop muss `server.js` zusätzlich auf einem Node-fähigen Hosting laufen (z.B. Render, Railway, Fly.io, eigener VPS). GitHub Pages selbst führt den Node-WebSocket-Server nicht aus.

## Sicherheit / Produktionsstatus
Das ist eine spielbare Multiplayer-Grundlage, noch kein produktionsreifes Backend. Für einen Release fehlen u.a. Authentifizierung, persistente Accounts, Datenbank, Reconnect/Session-Recovery, serverseitige Tower-/Combat-Logik, Rate Limits und Anti-Cheat.
