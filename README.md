# Browser Agent

A Claude agent that lives in Chrome's side panel. It reads the page you're on, clicks, types and navigates for you — and shows its thinking along the way.

在 Chrome 側邊欄裡的 Claude agent：讀取目前分頁、幫你點擊、填表、換頁，並顯示思考過程。

<p>
  <img src="docs/onboard.png" width="300" alt="Onboarding">
  <img src="docs/chat.png" width="300" alt="Chat with markdown">
</p>

## Features

- Streams replies with Markdown (tables, code blocks with copy buttons) and collapsible thinking summaries
- Page tools: `read_page`, `navigate`, `click`, `type`
- Runs entirely in the extension — no server of your own
- Light and dark themes

## Getting a key

Paste either key into the side panel. The prefix decides where requests go:

| Key | Goes to | Billing |
|---|---|---|
| `sk-ant-…` | Anthropic API directly | Your Anthropic account |
| `relay-…` | [fluxRelay](https://ai-gateway.iosoftware.ai/) | Pay-as-you-go on fluxRelay |

The key is stored in `chrome.storage.local` on your machine only.

## Install (from source)

```bash
npm install
npm run build        # outputs extension/sidepanel.js; use `npm run watch` while developing
```

Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and pick the `extension/` folder. Click the toolbar icon to open the side panel.

## Security notes

- Web page content is untrusted. The system prompt tells the model to ignore instructions found on pages and to confirm before irreversible actions (submitting forms, payments, deleting), but prompt injection is not a solved problem — watch what it does on sensitive sites.
- Model output is sanitized with DOMPurify before rendering. Images, media, forms and inline styles are stripped, so a page can't trick the model into leaking the conversation through an image URL.

## Project layout

| Path | What |
|---|---|
| `src/sidepanel.js` | Agent loop, tool implementations, UI wiring |
| `src/shared.js` | System prompt and tool definitions |
| `extension/` | Manifest, side panel HTML/CSS, service worker (load this folder in Chrome) |

To add a tool: add its schema to `tools` in `src/shared.js` and a `case` in `runTool` in `src/sidepanel.js`.

## License

[MIT](LICENSE)
