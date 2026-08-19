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

## Workflows (Live-Sync mit GitHub)

Klick auf einen Mitarbeiter zeigt seine **Workflows** als Buttons. Klick auf einen Button kopiert
einen Start-Prompt (Slash-Command + Opener) in die Zwischenablage und öffnet claude.ai/code, sodass
der richtige KI-Agent mit dem richtigen Workflow geladen wird.

Die Workflows kommen aus der `workflows.md` jedes Agenten auf GitHub:
- Emilia: `grow-hq-disziplin-content/ai-team/agents/emilia-social-media/workflows.md`
- Timo: `grow-hq-disziplin-video/ai-team/agents/timo-video-cutter/workflows.md`
- (Julia/Katja: noch keine workflows.md; Mapping in `netlify/functions/workflows.js` ergänzen, sobald vorhanden.)

Geparst werden die `## WF-NN · Titel` Überschriften. **Erweitert ein Agent seine workflows.md,
erscheinen neue Workflows automatisch im Office, ohne Redeploy** (Live-Sync via Netlify-Funktion).

- **Live-Sync aktivieren:** Umgebungsvariable `GITHUB_TOKEN` in Netlify setzen (fein-granularer
  Read-only-Token mit Zugriff auf Repository-Contents der Agenten-Repos). Dann zieht die Funktion
  `/.netlify/functions/workflows` die Workflows bei jedem Laden frisch von GitHub (Badge "live").
- **Ohne Token:** Das Office nutzt die mitgelieferte `workflows.json` (Stand beim letzten ZIP-Build).
  Funktioniert sofort, spiegelt aber nur den damaligen Stand.

## Deploy auf Netlify

1. Repo in Netlify als neue Site verbinden (Build-Command leer, Publish-Verzeichnis `.`).
2. **API-Key setzen** (sonst antwortet der In-App-Chat nicht):
   Netlify → Site configuration → Environment variables → `ANTHROPIC_API_KEY` = dein Anthropic-Key.
3. Deploy auslösen. Die Funktion liegt unter `/.netlify/functions/chat`.

Ohne gesetzten `ANTHROPIC_API_KEY` läuft das 3D-Büro normal, der In-App-Chat zeigt aber einen
Hinweis und der Handoff-Button nach Claude Code funktioniert weiterhin.

## 3D-Modelle

Die Möbel sind das **Kenney "Furniture Kit"** (CC0 / Public Domain, kenney.nl), liegen als
glTF/GLB unter `models/` und werden zur Laufzeit per GLTFLoader geladen. CC0 heißt frei nutzbar,
keine Attribution nötig. Wände, Glas, Whiteboard, Pinnwand, Ringlicht und Wandbilder sind custom.

## Lokal ansehen

```bash
# nur die 3D-Szene (ohne Chat-Funktion):
python3 -m http.server 4173
# mit Chat-Funktion (braucht Netlify CLI + ANTHROPIC_API_KEY):
netlify dev
```
