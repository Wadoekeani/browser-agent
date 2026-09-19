# Contributing

## Setup

```bash
npm ci
npm run watch   # rebuilds extension/sidepanel.js from src/sidepanel.tsx on every save
```

Open `chrome://extensions`, enable **Developer mode**, **Load unpacked**, pick the `extension/` folder.
After `npm run watch` rebuilds, click the reload icon on the extension card (Chrome doesn't auto-reload extensions).

## Before opening a PR

```bash
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks for skills / memory / history / files / providers / i18n (bundled with esbuild, then run in node)
npm run test:e2e   # playwright, loads the built extension against mocked model APIs (Anthropic and OpenAI-compatible)
```

All three must pass. If you touched something `check.mjs`/the e2e suite doesn't cover, say so in the PR and describe how you tested it manually (steps + what you saw in the side panel).

## Adding a tool

See the file table under *Development* in the README. Two edits, always together:

1. Add the tool's JSON schema to `tools` in `src/shared.ts`.
2. Add a matching `case` in `runTool` in `src/tools.ts`.

## User-facing text

Every string the user can see goes through `t()` from `src/i18n` — add the key to `src/i18n/locales/en.ts` and to every other dictionary in that folder (`npm run typecheck` fails if one is missing; if you can't translate it, use the English text and say so in the PR). Text sent to the model (system prompt, tool descriptions, tool results) is not translated. See *Translating* in the README.

## Security

Page content is untrusted input — the model reads it, but never treat it as instructions from the user. Two things not to loosen without a strong reason and a review:

- **DOMPurify config** in `src/log.tsx` (strips images/media/forms/inline styles from model output). It exists specifically so a page can't smuggle the conversation out through an `<img src>`.
- Anything that decides whether a click/type is "irreversible enough" to confirm — false negatives here mean silent purchases/deletes on a page that talked the model into it.

## PRs

- Keep them small and focused; unrelated cleanups go in a separate PR.
- Describe what you tested: which `npm run check` / `test:e2e` cases cover it, or the manual steps if not.
- New tools, new permissions in `manifest.json`, or anything touching `host_permissions` — explain why in the description.

## License

By contributing, you agree your changes are licensed under the repo's [MIT license](LICENSE).
