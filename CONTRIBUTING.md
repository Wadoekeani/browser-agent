# Contributing

## Setup

```bash
npm install
npm run watch   # rebuilds extension/sidepanel.js on every save
```

Open `chrome://extensions`, enable **Developer mode**, **Load unpacked**, pick the `extension/` folder.
After `npm run watch` rebuilds, click the reload icon on the extension card (Chrome doesn't auto-reload extensions).

## Before opening a PR

```bash
npm run check      # unit self-checks for skills.js / memory.js / history.js
npm run test:e2e   # playwright, loads the built extension against a mocked Anthropic API
```

Both must pass. If you touched something `check.mjs`/the e2e suite doesn't cover, say so in the PR and describe how you tested it manually (steps + what you saw in the side panel).

## Adding a tool

See the *Project layout* table in the README. Two edits, always together:

1. Add the tool's JSON schema to `tools` in `src/shared.js`.
2. Add a matching `case` in `runTool` in `src/sidepanel.js`.

## Security

Page content is untrusted input — the model reads it, but never treat it as instructions from the user. Two things not to loosen without a strong reason and a review:

- **DOMPurify config** in `src/sidepanel.js` (strips images/media/forms/inline styles from model output). It exists specifically so a page can't smuggle the conversation out through an `<img src>`.
- Anything that decides whether a click/type is "irreversible enough" to confirm — false negatives here mean silent purchases/deletes on a page that talked the model into it.

## PRs

- Keep them small and focused; unrelated cleanups go in a separate PR.
- Describe what you tested: which `npm run check` / `test:e2e` cases cover it, or the manual steps if not.
- New tools, new permissions in `manifest.json`, or anything touching `host_permissions` — explain why in the description.

## License

By contributing, you agree your changes are licensed under the repo's [MIT license](LICENSE).
