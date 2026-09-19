# Store listing — English

## Name (max 75)

Browser Agent

## Summary (max 132, plain text — also the manifest `description`)

An AI assistant in Chrome's side panel that reads and works on your tab. Use your own key: Claude, OpenAI, Gemini or a local model.

## Description

Browser Agent puts an AI assistant in Chrome's side panel that can see the page you're on and act on it: summarize, pull out tables, compare prices, fill in forms, translate, and more.

Just ask in plain language. It reads the current tab, clicks, types, scrolls and moves between pages for you, and shows each step it takes, so you always know what it did.

BRING YOUR OWN MODEL
Use your own API key for Claude (Anthropic), OpenAI, Google Gemini or OpenRouter, or point it at any OpenAI-compatible endpoint, including models you run yourself (Ollama, LM Studio, vLLM). Requests go straight from your browser to the provider you choose. There is no Browser Agent server in between, and usage is billed by your provider.

YOU STAY IN CONTROL
Before anything that looks irreversible (paying, placing an order, deleting, submitting a form), the extension itself stops and asks you to click "Allow". A web page can't talk the model out of asking. Each task also stops after 30 steps, and every reply shows how many tokens it used.

FEATURES
• Page tools: read the page, click, type (including dropdowns), scroll, open pages
• Selected text: select something on the page and ask about just that instead of the whole tab
• PDF reading: open a PDF and ask about it, including scanned PDFs with no text layer (sent to Anthropic as images, only after you allow it — see Privacy below)
• 12 built-in skills. Type / to pick one: /summarize, /translate, /extract, /compare, /explain, /thread, /reply, /fill-form, /review-pr, /checklist, /decide, /grill-me
• Write your own skills in Markdown (SKILL.md files import as-is)
• Question cards: when a choice is needed, it asks you with clickable options
• File downloads: get results as CSV, Markdown, JSON and other plain-text files
• Memory: say "remember…" and it keeps short facts about you. View, edit or turn it off in Settings
• History: your last 30 conversations are saved on your computer. Reopen one, keep going, or export it as Markdown
• Suggestions on the home screen based on the page you're on (off by default; turn on in Settings)
• Light and dark themes; interface in 15 languages

PRIVACY
Your API key, conversations, memories and skills are stored only in your browser (chrome.storage.local). No analytics, no tracking, no account. Page content, selected text and PDFs are sent only to the model provider you chose, to answer your request. Before you start, the extension shows a short screen explaining this and asks you to agree. Full privacy policy: https://github.com/Wadoekeani/browser-agent/blob/main/store/privacy-policy.md

OPEN SOURCE
MIT licensed. Source code: https://github.com/Wadoekeani/browser-agent

Browser Agent is an independent project, not affiliated with or endorsed by Anthropic, OpenAI or Google.

## FAQ

**Do I need to pay for anything?**
The extension is free. You pay your model provider for what you use, with your own API key, or nothing at all if you run a model locally.

**What does it send, and to whom?**
When you ask for something, the relevant page content (or the text you selected, or the PDF you're reading) and your conversation go to the model provider you picked (or your own endpoint). A scanned PDF with no text layer is only sent — as images, to Anthropic — after you click "Allow" on a confirmation card. If you turn on home suggestions (off by default), opening the side panel on a new chat also sends the page's title, address and first ~800 characters to that provider. Nothing goes to us: there is no Browser Agent server.

**Can it buy things or delete things on its own?**
Not without asking you first. These wait for you to click "Allow" in the side panel, and the card shows what will happen: clicks that look irreversible (pay, buy, delete, submit, authorize, send, post, share and similar words in 15 languages, checked against the button's visible text, accessibility label, title and value — with a warning when the visible text and the label disagree); text-less icon buttons in forms or on pages with a password field; pressing Enter to send outside a form (chat and comment boxes); forms with several fields or a password; opening a page on a site other than the one you started on or one you named in your message (the card shows the full address, since an address can carry data out); and, once it has read web content in a chat, saving something to memory. Home suggestions only fill in the input box — you press send.

Limits: this is a set of rules, not a guarantee. Within the same site it can type into fields without asking, so a malicious page could read what it types there; a malicious page can also try to talk the model into things that don't match these rules. Keep an eye on what it's doing on sensitive sites.
