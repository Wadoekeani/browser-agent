<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser-Agent-Logo">

# Browser Agent

**Ein KI-Agent in Chromes Seitenleiste, der Ihren Tab liest und darauf agiert — mit Ihrem eigenen Schlüssel oder Ihrem eigenen lokalen Modell.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · Deutsch · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Ein Absatz wird ausgewählt und mit /explain erklärt, Laptop-Preise werden in einer CSV verglichen, dann fragt der Agent vor dem Klick auf Place order nach und der Nutzer lehnt ab">

</div>

## Warum

- **Es arbeitet auf der Seite, die Sie gerade offen haben.** Zusammenfassen, eine Tabelle extrahieren, ein Formular ausfüllen oder sich durch ein paar Seiten klicken — ohne in einen separaten Chat-Tab zu kopieren.
- **Bringen Sie Ihr eigenes Modell mit.** Anthropic, OpenAI, Gemini, OpenRouter oder alles, was die OpenAI-API spricht — einschließlich Ollama, LM Studio und vLLM auf Ihrem eigenen Rechner.
- **Kein Server dazwischen.** Anfragen gehen direkt von Ihrem Browser zum gewählten Anbieter. Ihr Schlüssel, Ihre Chats und Erinnerungen bleiben in `chrome.storage.local`. Keine Analytics, kein Konto.
- **Riskante Aktionen warten auf Sie.** Klicks und Formularabsendungen, die irreversibel wirken, werden angehalten, bis Sie in der Seitenleiste auf *Erlauben* klicken. Diese Prüfung erzwingt der Code der Erweiterung — sie wird dem Modell nicht nur freundlich vorgeschlagen.

## Funktionen

**Auf der Seite handeln**
- Werkzeuge: Seite lesen, klicken, tippen (auch `<select>`-Dropdowns), scrollen, eine URL öffnen. Das Modell erhält eine nummerierte Liste interaktiver Elemente und klickt `ref: 12`, statt CSS-Selektoren zu erraten.
- Text auf der Seite markieren und nur dazu fragen; die Auswahl wird Ihrer Nachricht angehängt, nicht der ganze Tab.
- PDF: Text wird mit pdf.js extrahiert. Ein integrierter Viewer lässt Sie Text in einem PDF wie auf jeder anderen Seite markieren. Gescannte PDFs (ohne Textebene) können nach Bestätigung der Kosten als Dokument an Anthropic gesendet werden.

**In der Unterhaltung**
- Gestreamte Markdown-Antworten mit Tabellen und Codeblöcken, plus einklappbare Denk-Zusammenfassungen (Anthropic).
- Frage-Karten (`ask_user`): Wenn das Modell eine Entscheidung braucht, fragt es mit klickbaren Optionen, statt zu raten.
- Datei-Karten: Ergebnisse als herunterladbare `csv`-, `json`-, `md`-, `txt`-, `tsv`-, `xml`-, `yaml`-, `ics`- oder `vcf`-Dateien, mit Kopieren und Vorschau.
- Jede Antwort zeigt ihren Token-Verbrauch; jede Aufgabe stoppt nach 30 Werkzeugschritten.

**Was bei Ihnen bleibt**
- Gedächtnis: Sagen Sie „merk dir …“, und der Agent behält kurze Fakten über Sie chatübergreifend. Ansehen, bearbeiten oder abschalten in den Einstellungen.
- Verlauf: die letzten 30 Unterhaltungen, nach Datum gruppiert. Eine wieder öffnen und weitermachen, oder als Markdown exportieren.
- 12 eingebaute Skills und `/`-Befehle; schreiben Sie Ihre eigenen im selben `SKILL.md`-Format wie Claude Code.
- Oberfläche in 15 Sprachen; heller und dunkler Modus folgen Ihrem System.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Anbieterauswahl: Anthropic, OpenAI, Google Gemini, OpenRouter, Benutzerdefiniert (OpenAI-kompatibel)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Eingabe von / öffnet das Skill-Menü"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Eine Frage-Karte mit drei Optionen, eine davon empfohlen"></td>
  </tr>
  <tr>
    <td align="center">Anbieter wählen</td>
    <td align="center"><code>/</code> für Skills eingeben</td>
    <td align="center">Fragt nach, statt zu raten</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Integrierter PDF-Viewer mit einem ausgewählten Satz, und die Seitenleiste erklärt ihn">

## Schnellstart

Browser Agent ist noch nicht im Chrome Web Store (folgt bald). Installieren Sie bis dahin den Release-Build — kein Node.js oder Build-Schritt nötig. Erfordert Chrome 122+.

1. Laden Sie `browser-agent-<version>.zip` vom [neuesten Release](https://github.com/Wadoekeani/browser-agent/releases/latest) herunter und entpacken Sie es.
2. Öffnen Sie `chrome://extensions` und aktivieren Sie oben rechts den **Entwicklermodus**.
3. Klicken Sie auf **Entpackte Erweiterung laden** und wählen Sie den entpackten Ordner.
4. Klicken Sie auf das Symbol in der Symbolleiste, um die Seitenleiste zu öffnen, stimmen Sie dem kurzen Datenhinweis zu, wählen Sie einen Anbieter und fügen Sie einen Schlüssel ein (oder einen lokalen Endpunkt).

Zum Aktualisieren laden Sie das neue Zip herunter, ersetzen den Inhalt desselben Ordners und klicken auf das Neuladen-Symbol auf der Erweiterungskarte. Ihre Einstellungen, Chats und Erinnerungen bleiben erhalten. Das Laden aus einem anderen Ordner installiert eine separate Kopie, die leer beginnt.

### Aus dem Quellcode bauen

Sie benötigen Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Laden Sie dann den Ordner `extension/` wie in Schritt 3 mit **Entpackte Erweiterung laden**.

## Anbieter

| Anbieter | Was Sie brauchen | Hinweise |
|---|---|---|
| Anthropic | [API-Schlüssel](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; Effort-Auswahl; Denk-Zusammenfassungen; gescannte PDFs |
| OpenAI | [API-Schlüssel](https://platform.openai.com/api-keys) | Die Modellliste wird vom Anbieter abgerufen |
| Google Gemini | [API-Schlüssel](https://aistudio.google.com/apikey) | Nutzt Geminis OpenAI-kompatiblen Endpunkt |
| OpenRouter | [API-Schlüssel](https://openrouter.ai/keys) | Jedes werkzeugfähige Modell auf OpenRouter |
| Benutzerdefiniert (OpenAI-kompatibel) | Basis-URL, Schlüssel optional | Ollama, LM Studio, vLLM, llama.cpp — alles mit `/chat/completions` |

Lokale Server blockieren Browser-Erweiterungen standardmäßig:

- **Ollama:** `OLLAMA_ORIGINS=chrome-extension://*` setzen und Ollama neu starten (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). Basis-URL `http://localhost:11434/v1`.
- **LM Studio:** Server mit aktiviertem CORS starten, `lms server start --cors`. Basis-URL `http://localhost:1234/v1`.

Wählen Sie ein Modell, das Tool Calling unterstützt; ohne das kann der Agent nicht auf der Seite handeln. Die Nutzung wird von Ihrem Anbieter abgerechnet; die Erweiterung ist kostenlos.

## Skills

Tippen Sie `/` im Nachrichtenfeld, um einen auszuwählen, oder lassen Sie das Modell einen laden, wenn er passt.

| Befehl | Was er tut |
|---|---|
| `/summarize` | Ein-Zeilen-Fazit, Kernpunkte und Handlungsempfehlungen zur aktuellen Seite |
| `/translate` | Übersetzt die Seite in Ihre Sprache, Überschriften und Absätze bleiben erhalten |
| `/extract` | Zieht die Daten der Seite in eine Markdown-Tabelle; bei viel Inhalt eine CSV- oder JSON-Datei |
| `/compare` | Erstellt eine Vergleichstabelle von Preisen, Tarifen oder Spezifikationen und hebt die Unterschiede hervor |
| `/explain` | Erklärt die Seite, einen Begriff oder ein Stück Code in einfachen Worten |
| `/thread` | Fasst einen Kommentar-Thread zusammen: Hauptargumente, jede Seite, Konsens, lesenswerte Kommentare |
| `/reply` | Entwirft eine Antwort auf die E-Mail oder Nachricht auf der Seite; kann das Antwortfeld ausfüllen, sendet aber nie |
| `/fill-form` | Füllt das Formular mit Ihren Angaben aus; fragt nach Fehlendem, stoppt vor dem Absenden |
| `/review-pr` | Überprüft einen GitHub Pull Request und listet Probleme nach Schweregrad, mit Datei und Zeile |
| `/checklist` | Verwandelt ein Tutorial in eine abhakbare Schritt-für-Schritt-Liste |
| `/decide` | Legt die Optionen dar, fragt nacheinander nach Ihren Bedürfnissen und empfiehlt dann eine |
| `/grill-me` | Stellt Ihren Plan (oder den Vorschlag auf der Seite) mit jeweils einer Multiple-Choice-Frage auf die Probe |

`/clear` startet eine neue Unterhaltung.

### Eigene Skills schreiben

Ein Skill ist eine Markdown-Datei mit `name`- und `description`-Frontmatter, gefolgt von Anweisungen:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Skills verwalten Sie unter **Einstellungen → Skills**: erstellen, bearbeiten, `.md`-Dateien importieren, exportieren. Claude-Code-`SKILL.md`-Dateien werden unverändert importiert. Eine optionale `model:`-Zeile (zum Beispiel `model: haiku`) lässt diesen Skill bei Anthropic auf einem günstigeren Claude-Modell laufen.

Nur Namen und Beschreibungen gehen in den System-Prompt; das Modell ruft `use_skill` auf, um die vollständigen Anweisungen bei Bedarf zu laden, und `/name` eingeben hängt sie direkt an. Skills sind Prompts — lesen Sie einen, bevor Sie ihn importieren.

## Sicherheit & Datenschutz

**Datenfluss.** Ihr Browser spricht mit genau einer Stelle: dem von Ihnen konfigurierten Anbieter oder Endpunkt. Eine Anfrage enthält Ihre Nachrichten, den vom Agenten gelesenen Seiteninhalt (oder nur Ihre Auswahl, oder das PDF), Ihre gespeicherten Erinnerungen und Ihre Skill-Namen. Ihr API-Schlüssel, Unterhaltungen, Erinnerungen und Skills werden ausschließlich in `chrome.storage.local` gespeichert. Es gibt keinen Browser-Agent-Server, keine Analytics und keinen Remote-Code. Nichts wird gesendet, bevor Sie dem Datenhinweis beim ersten Start zustimmen. Vollständige Details: [Datenschutzrichtlinie](store/privacy-policy.md).

**Was Ihr *Erlauben* braucht.** Diese Aktionen zeigen eine Karte in der Seitenleiste und laufen erst, wenn Sie auf *Erlauben* klicken. Die Karte lebt auf der eigenen Seite der Erweiterung, die eine Website nicht für Sie anklicken kann:

- Klicks und Formularabsendungen, die irreversibel wirken: der sichtbare Text des Buttons, `aria-label`, Titel oder Wert liest sich wie zahlen, kaufen, bestellen, löschen, absenden, senden, veröffentlichen, autorisieren, speichern, teilen, installieren und Ähnliches (in allen 15 Oberflächensprachen); ein Formular mit mehreren Feldern oder einem Passwortfeld; ein Button nur mit Symbol innerhalb eines Formulars; Enter drücken in einem Feld, das nicht in einem Formular liegt (Chat-Boxen). Stimmen der sichtbare Text eines Buttons und sein `aria-label` nicht überein, warnt die Karte;
- zu einer anderen Website wechseln, durch Navigation oder Linkklick, außer es ist die Website, auf der die Aufgabe begann, eine in Ihrer Nachricht genannte Website, oder eine bereits in dieser Aufgabe erlaubte. Die Karte zeigt die vollständige URL inklusive Query-String;
- eine Erinnerung speichern, sobald die Unterhaltung Webinhalte enthält (eine gelesene Seite, ein PDF, eine Auswahl).

Ein Klick auf einen Vorschlag sendet ihn sofort. Aus der Seite erzeugte Vorschläge werden nach dem Lesen des Seiteninhalts geschrieben, eine Seite kann sie also beeinflussen: darin genannte Websites zählen nicht als von Ihnen genannte Websites, und was sie auslösen, durchläuft trotzdem dieselben Bestätigungskarten. Links in Antworten zeigen ihre echte Domain neben dem Text.

**Ausgabe und Dateien.** Modellantworten werden mit DOMPurify gerendert. Bilder, Medien, SVG, iFrames, Formulare und Inline-Styles werden entfernt, sodass eine Seite das Modell nicht dazu bringen kann, Ihre Unterhaltung über eine Bild-URL preiszugeben. Erzeugte Dateien sind nur reine Textformate (`csv`, `json`, `md`, …), und CSV/TSV-Zellen, die wie der Beginn einer Tabellenkalkulationsformel aussehen, werden neutralisiert.

### Bekannte Einschränkungen

- **Prompt Injection ist nicht gelöst.** Der Agent liest Websites mit Ihrer eingeloggten Sitzung und handelt darauf. Eine bösartige Seite kann versuchen, ihn dazu zu bringen, Ihre Unterhaltung, Erinnerungen oder Daten anderer Seiten irgendwohin zu senden oder Dinge in Ihrem Namen zu tun. Die Bestätigungskarten decken die oben genannten Hochrisiko-Aktionen ab; sie sind kein vollständiger Schutz.
- Nutzen Sie es nicht auf nicht vertrauenswürdigen Seiten, während Tabs zu Ihrer Bank, E-Mail oder Firmenverwaltung offen sind, und beobachten Sie es, während eine Aufgabe läuft.
- Die Erkennung riskanter Klicks ist eine Heuristik aus Schlüsselwörtern und Formularform. Manche Buttons werden übersehen.
- Tippen in ein Feld auf derselben Website fragt nicht nach. Eine bösartige Seite kann lesen, was der Agent tippt (zum Beispiel mit einem `input`-Listener) und es an ihren eigenen Server senden.
- Eine importierte `SKILL.md` gilt als vertrauenswürdige Anweisung. Importieren Sie nur Skills, die Sie gelesen haben.
- Erinnerungen und Unterhaltungen werden unverschlüsselt in Ihrem Browser gespeichert und als Teil jeder Anfrage an den gewählten Anbieter gesendet.
- Jede Aufgabe stoppt nach 30 Werkzeugschritten, und jede Antwort zeigt ihren Token-Verbrauch, sodass eine außer Kontrolle geratene Schleife begrenzt und sichtbar ist.

## Sprachen

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. Die Standardsprache folgt Ihrem Browser; ändern Sie sie unter **Einstellungen → Sprache**. Das Modell antwortet in Ihrer Oberflächensprache, außer Sie schreiben in einer anderen.

## Entwicklung

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Die Seitenleiste ist React + TypeScript, gebündelt mit esbuild in `extension/`. Es gibt kein Backend: `src/agent.ts` führt die Agentenschleife in der Seitenleiste aus und ruft Anthropic über das offizielle SDK oder jede OpenAI-kompatible API über `src/providers.ts` auf. Werkzeuge in `src/tools.ts` laufen im aktiven Tab mit `chrome.scripting`; `src/elements.ts` erstellt die nummerierte Elementliste und die Prüfung auf irreversible Aktionen. Die E2E-Suite braucht keinen API-Schlüssel und kostet nichts.

| Pfad | Was |
|---|---|
| `src/sidepanel.tsx` | Einstiegspunkt und Haupt-UI (Onboarding, Chat, Nachrichtenfeld, `/`-Menü) |
| `src/agent.ts` | Agentenschleife, Laden der Einstellungen, Standard-Skills, Speichern/Wiederherstellen des Verlaufs |
| `src/providers.ts` | Anbieterliste und der OpenAI-kompatible Adapter |
| `src/tools.ts` | Werkzeug-Implementierungen (`runTool`) und die Bestätigungssperre |
| `src/shared.ts` | System-Prompt und Werkzeugdefinitionen |
| `src/elements.ts` | Nummerierte interaktive Elemente (`data-ba`-Referenzen) und die Risikoprüfung |
| `src/log.tsx` | Chat-Verlauf, Karten, Markdown-Rendering mit DOMPurify |
| `src/pages.tsx` | Einstellungen, Verlauf und Skill-Editor |
| `src/pdf.ts`, `src/viewer.ts` | PDF-Textextraktion und der integrierte Viewer |
| `src/selection.ts` | Chip für ausgewählten Text |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | `SKILL.md`-Parsing, Gedächtnis, Verlauf, Datei-Karten |
| `src/i18n/` | `t()` und die 15 Wörterbücher (`en.ts` ist die Quelle der Wahrheit) |
| `extension/` | Manifest, `_locales/`, HTML, Service Worker — diesen Ordner in Chrome laden |

Um ein Werkzeug hinzuzufügen: sein Schema zu `tools` in `src/shared.ts` hinzufügen und einen `case` in `runTool` in `src/tools.ts`.

### Übersetzen

Kopieren Sie `src/i18n/locales/en.ts` z. B. nach `nl.ts`, deklarieren Sie es als `const nl: Dict = { … }`, übersetzen Sie die Werte (jeden `{placeholder}` beibehalten) und fügen Sie es zu `LANGS` und den Loadern in `src/i18n/index.ts` hinzu. `npm run typecheck` schlägt bei einem fehlenden oder zusätzlichen Schlüssel fehl; `npm run check` schlägt bei einem nicht übereinstimmenden Platzhalter fehl. Prompts und Werkzeugbeschreibungen, die an das Modell gesendet werden, bleiben absichtlich in einer Sprache. Für Name und Beschreibung im Chrome Web Store fügen Sie `extension/_locales/<code>/messages.json` hinzu (Chrome nutzt Unterstriche, z. B. `pt_BR`).

## Mitwirken

Issues und PRs sind willkommen — siehe [CONTRIBUTING.md](CONTRIBUTING.md). Halten Sie PRs klein, führen Sie die drei obigen Prüfungen aus und beschreiben Sie, wie Sie getestet haben, was sie nicht abdecken.

## Lizenz

[MIT](LICENSE). Browser Agent ist ein unabhängiges Projekt und nicht mit Anthropic, OpenAI oder Google verbunden.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
