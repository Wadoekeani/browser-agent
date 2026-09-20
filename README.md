<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser Agent logo">

# Browser Agent

**An AI agent in Chrome's side panel that reads and works on your tab — with your own key or your own local model.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

English · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Select a paragraph and /explain it, compare laptop prices into a CSV, then the agent asks before clicking Place order and the user denies">

</div>

## Why

- **It works on the page you're already on.** Summarize, pull out a table, fill in a form, or click through a few pages — without copy-pasting into a chat tab.
- **Bring your own model.** Anthropic, OpenAI, Gemini, OpenRouter, or anything that speaks the OpenAI API — including Ollama, LM Studio and vLLM on your own machine.
- **No server in between.** Requests go straight from your browser to the provider you picked. Your key, chats and memories stay in `chrome.storage.local`. No analytics, no account.
- **Risky actions wait for you.** Clicks and form submissions that look irreversible stop until you press *Allow* in the side panel. That check is enforced by the extension's code, not by asking the model nicely.

## Features

**Acting on the page**
- Tools: read the page, click, type (including `<select>` dropdowns), scroll, open a URL. The model gets a numbered list of interactive elements and clicks `ref: 12` instead of guessing CSS selectors.
- Select text on the page and ask about just that; the selection is attached to your message instead of the whole tab.
- PDFs: text is extracted with pdf.js. A built-in viewer lets you select text in a PDF like on any page. Scanned PDFs (no text layer) can be sent to Anthropic as a document, after you confirm the cost.

**In the conversation**
- Streaming Markdown replies with tables and code blocks, plus collapsible thinking summaries (Anthropic).
- Question cards (`ask_user`): when the model needs a decision, it asks with clickable options instead of guessing.
- File cards: results as downloadable `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` or `vcf` files, with copy and preview.
- Every reply shows its token usage; each task stops after 30 tool steps.

**Yours to keep**
- Memory: say "remember …" and it keeps short facts about you across chats. View, edit or turn it off in Settings.
- History: the last 30 conversations, grouped by date. Reopen one and keep going, or export it as Markdown.
- 12 built-in skills and `/` commands; write your own in the same `SKILL.md` format as Claude Code.
- Interface in 15 languages; light and dark theme follow your system.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Provider picker: Anthropic, OpenAI, Google Gemini, OpenRouter, Custom (OpenAI-compatible)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Typing / opens the skill menu"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="A question card with three options, one recommended"></td>
  </tr>
  <tr>
    <td align="center">Pick a provider</td>
    <td align="center">Type <code>/</code> for skills</td>
    <td align="center">It asks instead of guessing</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Built-in PDF viewer with a selected sentence, and the side panel explaining it">

## Quick start

Browser Agent isn't on the Chrome Web Store yet (coming soon). Until then, install the release build — no Node.js or build step needed. Requires Chrome 122+.

1. Download `browser-agent-<version>.zip` from the [latest release](https://github.com/Wadoekeani/browser-agent/releases/latest) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick the unzipped folder.
4. Click the toolbar icon to open the side panel, agree to the short data notice, choose a provider and paste a key (or a local endpoint).

To update, download the new zip, replace the contents of the same folder, and click the reload icon on the extension card. Your settings, chats and memories are kept. Loading it from a different folder installs a separate copy that starts empty.

### Build from source

You need Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Then load the `extension/` folder with **Load unpacked** as in step 3.

## Providers

| Provider | What you need | Notes |
|---|---|---|
| Anthropic | [API key](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; effort picker; thinking summaries; scanned PDFs |
| OpenAI | [API key](https://platform.openai.com/api-keys) | Model list is fetched from the provider |
| Google Gemini | [API key](https://aistudio.google.com/apikey) | Uses Gemini's OpenAI-compatible endpoint |
| OpenRouter | [API key](https://openrouter.ai/keys) | Any tool-capable model on OpenRouter |
| Custom (OpenAI-compatible) | Base URL, key optional | Ollama, LM Studio, vLLM, llama.cpp — anything with `/chat/completions` |

Local servers block browser extensions by default:

- **Ollama:** set `OLLAMA_ORIGINS=chrome-extension://*` and restart Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). Base URL `http://localhost:11434/v1`.
- **LM Studio:** start the server with CORS on, `lms server start --cors`. Base URL `http://localhost:1234/v1`.

Pick a model that supports tool calling; the agent can't act on the page without it. Usage is billed by your provider; the extension is free.

## Skills

Type `/` in the composer to pick one, or let the model load one when it fits.

| Command | What it does |
|---|---|
| `/summarize` | One-line takeaway, key points and action items for the current page |
| `/translate` | Translate the page into your language, keeping headings and paragraphs |
| `/extract` | Pull the data on the page into a Markdown table; a CSV or JSON file when there's a lot |
| `/compare` | Build a comparison table of prices, plans or specs and highlight the differences |
| `/explain` | Explain the page, a term or a piece of code in plain words |
| `/thread` | Sum up a comment thread: main arguments, each side, consensus, comments worth reading |
| `/reply` | Draft a reply to the email or message on the page; can fill the reply box, never sends |
| `/fill-form` | Fill in the form with your details; asks for anything missing, stops before submitting |
| `/review-pr` | Review a GitHub pull request and list problems by severity, with file and line |
| `/checklist` | Turn a tutorial into a checklist of steps |
| `/decide` | Lay out the options, ask about your needs one at a time, then recommend one |
| `/grill-me` | Stress-test your plan (or the proposal on the page) with one multiple-choice question at a time |

`/clear` starts a new conversation.

### Write your own

A skill is a Markdown file with `name` and `description` frontmatter, followed by instructions:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Manage skills in **Settings → Skills**: create, edit, import `.md` files, export. Claude Code `SKILL.md` files import as-is. An optional `model:` line (for example `model: haiku`) runs that skill on a cheaper Claude model when you use Anthropic.

Only names and descriptions go into the system prompt; the model calls `use_skill` to load the full instructions when it needs them, and typing `/name` attaches them directly. Skills are prompts — read one before importing it.

## Security & privacy

**Data flow.** Your browser talks to one place: the provider or endpoint you configured. A request contains your messages, the page content the agent read (or just your selection, or the PDF), your saved memories and your skill names. Your API key, conversations, memories and skills are stored only in `chrome.storage.local`. There is no Browser Agent server, no analytics and no remote code. Nothing is sent before you agree to the first-run data notice. Full details: [privacy policy](store/privacy-policy.md).

**What needs your *Allow*.** These actions show a card in the side panel and don't run until you press *Allow*. The card lives in the extension's own page, which a website can't click for you:

- clicks and form submissions that look irreversible: the button's visible text, `aria-label`, title or value reads like pay, buy, order, delete, submit, send, publish, authorize, save, share, install and similar (in all 15 interface languages); a form with several fields or a password field; an icon-only button inside a form; pressing Enter in a field that isn't in a form (chat boxes). If a button's visible text and its `aria-label` disagree, the card warns you;
- going to another site, by navigating or by clicking a link, unless it's the site the task started on, a site you named in your message, or one you already allowed in this task. The card shows the full URL, query string included;
- saving a memory once the conversation contains web content (a page it read, a PDF, a selection).

Clicking a suggestion sends it right away. Suggestions generated from the page are written after reading page content, so a page can influence them: sites they mention don't count as sites you named, and what they trigger still goes through the same confirmation cards. Links in replies show their real domain next to the text.

**Output and files.** Model replies are rendered with DOMPurify. Images, media, SVG, iframes, forms and inline styles are stripped, so a page can't get the model to leak your conversation through an image URL. Generated files are plain-text formats only (`csv`, `json`, `md`, …), and CSV/TSV cells that start like a spreadsheet formula are neutralized.

### Known limitations

- **Prompt injection is not solved.** The agent reads and acts on websites with your logged-in session. A malicious page can try to steer it into sending your conversation, memories or data from other sites somewhere, or into doing things for you. The confirmation cards cover the high-risk actions above; they are not complete protection.
- Don't run it on untrusted pages while tabs with your bank, email or company admin are open, and watch it while a task is running.
- Detecting risky clicks is a keyword and form-shape heuristic. It will miss some buttons.
- Typing into a field on the same site doesn't ask. A malicious page can read what the agent types (for example with an `input` listener) and send it to its own server.
- An imported `SKILL.md` is trusted instructions. Only import skills you've read.
- Memories and conversations are stored unencrypted in your browser and sent to the provider you chose as part of each request.
- Each task stops after 30 tool steps, and every reply shows its token usage, so a runaway loop is bounded and visible.

## Languages

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. The default follows your browser; change it in **Settings → Language**. The model answers in your interface language unless you write in another one.

## Development

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

The side panel is React + TypeScript bundled by esbuild into `extension/`. There is no backend: `src/agent.ts` runs the agent loop in the side panel, calling Anthropic through the official SDK or any OpenAI-compatible API through `src/providers.ts`. Tools in `src/tools.ts` run in the active tab with `chrome.scripting`; `src/elements.ts` builds the numbered element list and the irreversible-action check. The e2e suite needs no API key and spends nothing.

| Path | What |
|---|---|
| `src/sidepanel.tsx` | Entry point and main UI (onboarding, chat, composer, `/` menu) |
| `src/agent.ts` | Agent loop, settings loading, default skills, history save/restore |
| `src/providers.ts` | Provider list and the OpenAI-compatible adapter |
| `src/tools.ts` | Tool implementations (`runTool`) and the confirmation gate |
| `src/shared.ts` | System prompt and tool definitions |
| `src/elements.ts` | Numbered interactive elements (`data-ba` refs) and the risk check |
| `src/log.tsx` | Chat log, cards, Markdown rendering with DOMPurify |
| `src/pages.tsx` | Settings, history and skill editor |
| `src/pdf.ts`, `src/viewer.ts` | PDF text extraction and the built-in viewer |
| `src/selection.ts` | Selected-text chip |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | `SKILL.md` parsing, memory, history, file cards |
| `src/i18n/` | `t()` and the 15 dictionaries (`en.ts` is the source of truth) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — load this folder in Chrome |

To add a tool: add its schema to `tools` in `src/shared.ts` and a `case` in `runTool` in `src/tools.ts`.

### Translating

Copy `src/i18n/locales/en.ts` to e.g. `nl.ts`, declare it as `const nl: Dict = { … }`, translate the values (keep every `{placeholder}`), and add it to `LANGS` and the loaders in `src/i18n/index.ts`. `npm run typecheck` fails on a missing or extra key; `npm run check` fails on a mismatched placeholder. Prompts and tool descriptions sent to the model stay in one language on purpose. For the Chrome Web Store name and description, add `extension/_locales/<code>/messages.json` (Chrome uses underscores, e.g. `pt_BR`).

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Keep PRs small, run the three checks above, and say how you tested anything they don't cover.

## License

[MIT](LICENSE). Browser Agent is an independent project, not affiliated with Anthropic, OpenAI or Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
