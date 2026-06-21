# GROW · KI-Büro

Interaktives 3D-Büro (Three.js, Low Poly) mit den GROW-KI-Mitarbeitern. Klick auf eine Figur
öffnet einen Chat. Hosting: Netlify (statische Seite + eine Serverless-Funktion).

## Mitarbeiter

- **Emilia** (Social Media Managerin) → `/emilia`
- **Timo** (Video Cutter) → `/timo`

Neue Figur ergänzen: in `index.html` im Array `AGENTS` einen Eintrag hinzufügen (Name, Rolle,
Look, Route, Slash-Command) und in `netlify/functions/chat.js` unter `AGENTS` eine Persönlichkeit.

## Chat-Funktion

- **In-App-Chat:** redet mit Emilias/Timos Persönlichkeit + Wissen (Briefing, Fragen, Entwürfe).
  Führt KEINE echten Tools aus (kein Schnitt, kein Upload, keine Notion-Tasks).
- **In Claude Code übernehmen:** kopiert den Slash-Command samt Chat-Verlauf und öffnet
  claude.ai/code. Dort arbeitet der echte Agent mit allen Tools, und der Verlauf bleibt findbar.
- **Verlauf:** wird pro Mitarbeiter im Browser (localStorage) gespeichert.

## Deploy auf Netlify

1. Repo in Netlify als neue Site verbinden (Build-Command leer, Publish-Verzeichnis `.`).
2. **API-Key setzen** (sonst antwortet der In-App-Chat nicht):
   Netlify → Site configuration → Environment variables → `ANTHROPIC_API_KEY` = dein Anthropic-Key.
3. Deploy auslösen. Die Funktion liegt unter `/.netlify/functions/chat`.

Ohne gesetzten `ANTHROPIC_API_KEY` läuft das 3D-Büro normal, der In-App-Chat zeigt aber einen
Hinweis und der Handoff-Button nach Claude Code funktioniert weiterhin.

## Lokal ansehen

```bash
# nur die 3D-Szene (ohne Chat-Funktion):
python3 -m http.server 4173
# mit Chat-Funktion (braucht Netlify CLI + ANTHROPIC_API_KEY):
netlify dev
```
