<div align="center">

<img src="docs/logo.svg" width="72" alt="Logo di Browser Agent">

# Browser Agent

**Un agente IA nel pannello laterale di Chrome che legge e lavora sulla tua scheda — con la tua chiave o il tuo modello locale.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · Italiano · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Seleziona un paragrafo e usa /explain per spiegarlo, confronta i prezzi di alcuni laptop in un CSV, poi l'agente chiede conferma prima di cliccare Effettua ordine e l'utente nega">

</div>

## Perché

- **Funziona sulla pagina in cui ti trovi già.** Riassumi, estrai una tabella, compila un modulo o naviga tra alcune pagine — senza copiare e incollare in una scheda di chat.
- **Porta il tuo modello.** Anthropic, OpenAI, Gemini, OpenRouter, o qualsiasi cosa parli l'API di OpenAI — incluse Ollama, LM Studio e vLLM sul tuo computer.
- **Nessun server in mezzo.** Le richieste vanno direttamente dal tuo browser al provider che hai scelto. La tua chiave, le chat e le memorie restano in `chrome.storage.local`. Nessuna analitica, nessun account.
- **Le azioni rischiose aspettano il tuo consenso.** I clic e gli invii di moduli che sembrano irreversibili si fermano finché non premi *Consenti* nel pannello laterale. Questo controllo è imposto dal codice dell'estensione, non chiedendo gentilmente al modello.

## Funzionalità

**Agire sulla pagina**
- Strumenti: leggere la pagina, cliccare, digitare (inclusi i menu a tendina `<select>`), scorrere, aprire un URL. Il modello riceve un elenco numerato degli elementi interattivi e clicca `ref: 12` invece di indovinare i selettori CSS.
- Seleziona del testo sulla pagina e chiedi informazioni solo su quello; la selezione viene allegata al tuo messaggio invece dell'intera scheda.
- PDF: il testo viene estratto con pdf.js. Un visualizzatore integrato ti permette di selezionare il testo in un PDF come in qualsiasi pagina. I PDF scansionati (senza livello di testo) possono essere inviati ad Anthropic come documento, dopo aver confermato il costo.

**Nella conversazione**
- Risposte in streaming in Markdown con tabelle e blocchi di codice, oltre a riepiloghi di ragionamento comprimibili (Anthropic).
- Schede di domanda (`ask_user`): quando il modello ha bisogno di una decisione, chiede con opzioni cliccabili invece di indovinare.
- Schede file: risultati come file scaricabili `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` o `vcf`, con copia e anteprima.
- Ogni risposta mostra il suo utilizzo di token; ogni attività si ferma dopo 30 passaggi di strumenti.

**Tuo da conservare**
- Memoria: di' "ricorda …" e l'agente conserva brevi informazioni su di te tra le chat. Visualizzale, modificale o disattivale in Impostazioni.
- Cronologia: le ultime 30 conversazioni, raggruppate per data. Riaprine una e continua, oppure esportala come Markdown.
- 12 skill integrate e comandi `/`; scrivi le tue nello stesso formato `SKILL.md` di Claude Code.
- Interfaccia in 15 lingue; il tema chiaro e scuro segue il tuo sistema.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Selettore del provider: Anthropic, OpenAI, Google Gemini, OpenRouter, Personalizzato (compatibile con OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Digitando / si apre il menu delle skill"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Una scheda di domanda con tre opzioni, una consigliata"></td>
  </tr>
  <tr>
    <td align="center">Scegli un provider</td>
    <td align="center">Digita <code>/</code> per le skill</td>
    <td align="center">Chiede invece di indovinare</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Visualizzatore PDF integrato con una frase selezionata, e il pannello laterale che la spiega">

## Avvio rapido

Browser Agent non è ancora sul Chrome Web Store (in arrivo). Nel frattempo, installa la build di rilascio — non serve Node.js né una fase di build. Richiede Chrome 122+.

1. Scarica `browser-agent-<version>.zip` dall'[ultima release](https://github.com/Wadoekeani/browser-agent/releases/latest) ed estrailo.
2. Apri `chrome://extensions` e attiva **Modalità sviluppatore** (in alto a destra).
3. Clicca **Carica non pacchettizzata** e scegli la cartella estratta.
4. Clicca l'icona nella barra degli strumenti per aprire il pannello laterale, accetta il breve avviso sui dati, scegli un provider e incolla una chiave (o un endpoint locale).

Per aggiornare, scarica il nuovo zip, sostituisci il contenuto della stessa cartella e clicca l'icona di ricaricamento sulla scheda dell'estensione. Le tue impostazioni, chat e memorie vengono conservate. Caricarlo da una cartella diversa installa una copia separata che parte vuota.

### Compilare dai sorgenti

Ti serve Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Poi carica la cartella `extension/` con **Carica non pacchettizzata** come nel passaggio 3.

## Provider

| Provider | Cosa ti serve | Note |
|---|---|---|
| Anthropic | [Chiave API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; selettore di impegno; riepiloghi di ragionamento; PDF scansionati |
| OpenAI | [Chiave API](https://platform.openai.com/api-keys) | L'elenco dei modelli viene recuperato dal provider |
| Google Gemini | [Chiave API](https://aistudio.google.com/apikey) | Usa l'endpoint di Gemini compatibile con OpenAI |
| OpenRouter | [Chiave API](https://openrouter.ai/keys) | Qualsiasi modello con supporto agli strumenti su OpenRouter |
| Personalizzato (compatibile con OpenAI) | URL di base, chiave opzionale | Ollama, LM Studio, vLLM, llama.cpp — qualsiasi cosa con `/chat/completions` |

I server locali bloccano le estensioni del browser per impostazione predefinita:

- **Ollama:** imposta `OLLAMA_ORIGINS=chrome-extension://*` e riavvia Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). URL di base `http://localhost:11434/v1`.
- **LM Studio:** avvia il server con CORS attivo, `lms server start --cors`. URL di base `http://localhost:1234/v1`.

Scegli un modello che supporti le chiamate a strumenti; l'agente non può agire sulla pagina senza di esse. L'utilizzo è fatturato dal tuo provider; l'estensione è gratuita.

## Skill

Digita `/` nel campo di composizione per sceglierne una, oppure lascia che il modello ne carichi una quando è adatta.

| Comando | Cosa fa |
|---|---|
| `/summarize` | Riassunto in una riga, punti chiave e azioni da intraprendere per la pagina corrente |
| `/translate` | Traduce la pagina nella tua lingua, mantenendo intestazioni e paragrafi |
| `/extract` | Estrae i dati della pagina in una tabella Markdown; un file CSV o JSON quando ce ne sono molti |
| `/compare` | Crea una tabella di confronto di prezzi, piani o specifiche ed evidenzia le differenze |
| `/explain` | Spiega la pagina, un termine o un frammento di codice in parole semplici |
| `/thread` | Riassume una discussione: argomenti principali, ogni posizione, consenso, commenti da leggere |
| `/reply` | Redige una risposta all'email o al messaggio sulla pagina; può compilare il campo di risposta, non invia mai |
| `/fill-form` | Compila il modulo con i tuoi dati; chiede ciò che manca, si ferma prima dell'invio |
| `/review-pr` | Analizza una pull request di GitHub ed elenca i problemi per gravità, con file e riga |
| `/checklist` | Trasforma un tutorial in un elenco di passaggi da seguire |
| `/decide` | Espone le opzioni, chiede le tue esigenze una alla volta, poi ne consiglia una |
| `/grill-me` | Mette alla prova il tuo piano (o la proposta sulla pagina) con una domanda a scelta multipla alla volta |

`/clear` avvia una nuova conversazione.

### Scrivi la tua

Una skill è un file Markdown con il frontmatter `name` e `description`, seguito dalle istruzioni:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Gestisci le skill in **Impostazioni → Skill**: crea, modifica, importa file `.md`, esporta. I file `SKILL.md` di Claude Code vengono importati così come sono. Una riga opzionale `model:` (per esempio `model: haiku`) esegue quella skill su un modello Claude più economico quando usi Anthropic.

Solo i nomi e le descrizioni vengono inseriti nel prompt di sistema; il modello chiama `use_skill` per caricare le istruzioni complete quando ne ha bisogno, e digitare `/nome` le allega direttamente. Le skill sono prompt — leggine una prima di importarla.

## Sicurezza e privacy

**Flusso dei dati.** Il tuo browser parla con un solo posto: il provider o l'endpoint che hai configurato. Una richiesta contiene i tuoi messaggi, il contenuto della pagina che l'agente ha letto (o solo la tua selezione, o il PDF), le tue memorie salvate e i nomi delle tue skill. La tua chiave API, le conversazioni, le memorie e le skill sono memorizzate solo in `chrome.storage.local`. Non esiste un server di Browser Agent, nessuna analitica e nessun codice remoto. Niente viene inviato prima che tu accetti l'avviso sui dati al primo avvio. Dettagli completi: [informativa sulla privacy](store/privacy-policy.md).

**Cosa richiede il tuo *Consenti*.** Queste azioni mostrano una scheda nel pannello laterale e non vengono eseguite finché non premi *Consenti*. La scheda vive nella pagina propria dell'estensione, che un sito web non può cliccare al posto tuo:

- clic e invii di moduli che sembrano irreversibili: il testo visibile del pulsante, `aria-label`, titolo o valore assomiglia a paga, acquista, ordina, elimina, invia, spedisci, pubblica, autorizza, salva, condividi, installa e simili (in tutte le 15 lingue dell'interfaccia); un modulo con diversi campi o un campo password; un pulsante con solo icona dentro un modulo; premere Invio in un campo che non è in un modulo (caselle di chat). Se il testo visibile di un pulsante e il suo `aria-label` non coincidono, la scheda ti avvisa;
- andare su un altro sito, navigando o cliccando un link, a meno che non sia il sito su cui è iniziata l'attività, un sito che hai nominato nel tuo messaggio, o uno che hai già consentito in questa attività. La scheda mostra l'URL completo, query string inclusa;
- salvare una memoria una volta che la conversazione contiene contenuto web (una pagina che ha letto, un PDF, una selezione).

Cliccare un suggerimento lo invia subito. I suggerimenti generati dalla pagina vengono scritti dopo aver letto il contenuto della pagina, quindi una pagina può influenzarli: i siti che menzionano non contano come siti che hai nominato tu, e ciò che attivano passa comunque attraverso le stesse schede di conferma. I link nelle risposte mostrano il loro dominio reale accanto al testo.

**Output e file.** Le risposte del modello vengono renderizzate con DOMPurify. Immagini, media, SVG, iframe, moduli e stili inline vengono rimossi, così una pagina non può indurre il modello a far trapelare la tua conversazione tramite l'URL di un'immagine. I file generati sono solo in formati di puro testo (`csv`, `json`, `md`, …), e le celle CSV/TSV che iniziano come una formula di foglio di calcolo vengono neutralizzate.

### Limitazioni note

- **L'iniezione di prompt non è risolta.** L'agente legge e agisce su siti web con la tua sessione autenticata. Una pagina malevola può cercare di indirizzarlo a inviare la tua conversazione, le memorie o dati di altri siti da qualche parte, o a fare cose per tuo conto. Le schede di conferma coprono le azioni ad alto rischio sopra descritte; non sono una protezione completa.
- Non usarlo su pagine non affidabili mentre hai aperte schede con la tua banca, email o amministrazione aziendale, e sorveglialo mentre un'attività è in corso.
- Rilevare i clic rischiosi è un'euristica basata su parole chiave e forma del modulo. Alcuni pulsanti gli sfuggiranno.
- Digitare in un campo sullo stesso sito non chiede conferma. Una pagina malevola può leggere ciò che l'agente digita (per esempio con un listener `input`) e inviarlo al proprio server.
- Un file `SKILL.md` importato è un'istruzione fidata. Importa solo skill che hai letto.
- Le memorie e le conversazioni sono memorizzate non cifrate nel tuo browser e inviate al provider che hai scelto come parte di ogni richiesta.
- Ogni attività si ferma dopo 30 passaggi di strumenti, e ogni risposta mostra il suo utilizzo di token, quindi un ciclo fuori controllo è limitato e visibile.

## Lingue

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. La lingua predefinita segue il tuo browser; cambiala in **Impostazioni → Lingua**. Il modello risponde nella lingua della tua interfaccia a meno che tu non scriva in un'altra.

## Sviluppo

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Il pannello laterale è React + TypeScript pacchettizzato da esbuild in `extension/`. Non c'è un backend: `src/agent.ts` esegue il ciclo dell'agente nel pannello laterale, chiamando Anthropic tramite l'SDK ufficiale o qualsiasi API compatibile con OpenAI tramite `src/providers.ts`. Gli strumenti in `src/tools.ts` vengono eseguiti nella scheda attiva con `chrome.scripting`; `src/elements.ts` costruisce l'elenco numerato degli elementi e il controllo delle azioni irreversibili. La suite e2e non richiede alcuna chiave API e non spende nulla.

| Percorso | Cosa fa |
|---|---|
| `src/sidepanel.tsx` | Punto di ingresso e interfaccia principale (onboarding, chat, composer, menu `/`) |
| `src/agent.ts` | Ciclo dell'agente, caricamento delle impostazioni, skill predefinite, salvataggio/ripristino della cronologia |
| `src/providers.ts` | Elenco dei provider e l'adattatore compatibile con OpenAI |
| `src/tools.ts` | Implementazioni degli strumenti (`runTool`) e il gate di conferma |
| `src/shared.ts` | Prompt di sistema e definizioni degli strumenti |
| `src/elements.ts` | Elementi interattivi numerati (`data-ba` refs) e il controllo del rischio |
| `src/log.tsx` | Log della chat, schede, rendering Markdown con DOMPurify |
| `src/pages.tsx` | Impostazioni, cronologia ed editor delle skill |
| `src/pdf.ts`, `src/viewer.ts` | Estrazione del testo dai PDF e il visualizzatore integrato |
| `src/selection.ts` | Chip del testo selezionato |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Parsing di `SKILL.md`, memoria, cronologia, schede file |
| `src/i18n/` | `t()` e i 15 dizionari (`en.ts` è la fonte di verità) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — carica questa cartella in Chrome |

Per aggiungere uno strumento: aggiungi il suo schema a `tools` in `src/shared.ts` e un `case` in `runTool` in `src/tools.ts`.

### Tradurre

Copia `src/i18n/locales/en.ts` in ad es. `nl.ts`, dichiaralo come `const nl: Dict = { … }`, traduci i valori (mantieni ogni `{placeholder}`), e aggiungilo a `LANGS` e ai loader in `src/i18n/index.ts`. `npm run typecheck` fallisce su una chiave mancante o in eccesso; `npm run check` fallisce su un placeholder non corrispondente. I prompt e le descrizioni degli strumenti inviati al modello restano intenzionalmente in una sola lingua. Per il nome e la descrizione nel Chrome Web Store, aggiungi `extension/_locales/<code>/messages.json` (Chrome usa i trattini bassi, ad es. `pt_BR`).

## Contribuire

Issue e PR sono benvenute — vedi [CONTRIBUTING.md](CONTRIBUTING.md). Mantieni le PR piccole, esegui i tre controlli sopra, e spiega come hai testato ciò che non coprono.

## Licenza

[MIT](LICENSE). Browser Agent è un progetto indipendente, non affiliato ad Anthropic, OpenAI o Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supportato da io Software" height="32"></a></p>
