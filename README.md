<h1 align="center">
  <img src="./icon.svg" width="72" height="72" alt="dsh-inline-branches icon"><br>
  dsh-inline-branches
</h1>

<p align="center"><strong>Nested turn folders and a tree navigator for DeepSeek Harness conversations — Finder-style, without creating a new Session.</strong></p>

<p align="center">
  <a href="./README.zh-CN.md">中文文档</a> ·
  <a href="#install">Install</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#limitations">Limitations</a>
</p>

<p align="center"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2f6fed"></p>

![Nested turn folders in the transcript and the conversation tree navigator](./docs/preview.svg)

> Illustration. In the app, colors, spacing, and text follow your theme and locale.

## Why

A Harness transcript is one flat list: every follow-up question lands in the same thread, and exploring a side question usually means starting a separate Session. This plugin takes a lighter route — any finished turn can own sub-conversations, drawn as folders inside the same transcript.

The parent/child relation is a **view** stored in your browser, not a fork. Turns, messages, tool cards, approvals, and the session log stay exactly as they are.

## Features

- **Turn folders** — a `+ Sub-conversation` row under every finished turn. Once a turn has children it becomes a `Sub-conversation · N` folder with a disclosure chevron.
- **Nest as deep as you need** — arm a folder, keep typing in the normal composer, and each new turn nests one level deeper.
- **Finder-style collapse** — collapse a folder to hide its whole subtree from the transcript; expand it to bring the turns back.
- **Tree navigator** — the header's **Tree** button opens the tree of the whole session. Click any row to jump to that turn; collapse state is shared with the transcript.
- **Native rendering** — messages, Markdown, tool cards, approvals, and images still come from the built-in Chat. Nothing is reimplemented.
- **Theme and locale aware** — built on `--dsw-alias-*` tokens, with English and Chinese UI strings.

## Requirements

- DeepSeek Harness Desktop with the Web UI, developed against **0.2.1-rc.3**.
- No build step, no runtime dependencies, no network access.

## Install

### From the Web UI

1. Open **Plugins** in the Harness sidebar.
2. Choose **Add plugin**.
3. Paste the repository URL, or the absolute path to a local checkout, and confirm.

The installer adds `dsh-inline-branches` to your profile and enables the bundle.

### From the CLI

```bash
git clone https://github.com/<your-username>/dsh-inline-branches.git
dsh plugin --profile desktop add "$PWD/dsh-inline-branches"
```

Or install straight from the repository:

```bash
dsh plugin --profile desktop add https://github.com/<your-username>/dsh-inline-branches
```

Replace `desktop` with your profile name if you use another one. Installation selects the bundle by default; if **Tree** does not appear in the session header, restart Harness.

The package is not published to npm — install it from this repository.

## Usage

1. Finish a turn. A **+ Sub-conversation** row appears under it.
2. Click it to arm that folder. A chip above the composer confirms that new messages will go into the sub-conversation under that turn.
3. Type in the normal composer. The next turn — and every following turn while the folder stays armed — nests under it, indented by depth.
4. Click the chevron on a folder row to expand or collapse its whole subtree. Collapsed turns disappear from the transcript, Finder-style.
5. Go deeper by arming a sub-turn's own **+ Sub-conversation**.
6. To return to the top level, click **Back to main** in the composer chip.
7. Click **Tree** in the session header to open the navigator. Rows are indented by depth, show the question and a preview of the latest answer, and jump to the turn when clicked. Chevrons there and in the transcript share one collapse state.

## How it works

Everything is a Client-side view over the existing session:

| Piece | Mechanism |
|---|---|
| Parent relation | `localStorage` key `dsh.inline-tree.v3` — `{ [sessionId]: { parents: { [turn]: parentTurn } } }` |
| Collapse state | `localStorage` key `dsh.inline-tree.collapsed.v1` |
| Ordering and indentation | One injected `<style>` per session: every `[data-chat-turn]` gets a pre-order `order`, a `margin-left` from its depth, and `display: none` when an ancestor is collapsed |
| Rendering surface | Native Chat flow slot, which is `display: contents`, so turns are flex items of the transcript |
| Entry points | Client slots `conversation.session.header.actions` (Tree button), `conversation.chat.turnTail` (folder rows), `conversation.input.dock` (armed chip), `shell.overlay` (navigator panel) |
| Host half | `index.js` only exports an empty `apply()`; the bundle patch needs a Host row, but no Host logic is involved |

While a folder is armed, the header component watches the session's turn list and records a parent edge for every turn that appears. That is why no fork or new session is needed. The relation is per browser because it lives in `localStorage`: the session log stays linear, and another device, or cleared storage, sees the same turns without the tree.

The plugin also hides the native **Branch into a new conversation** button (matched by its built-in English and Chinese `aria-label`s) so the two branching models do not compete.

## Data and privacy

- Only turn numbers and parent ids are stored, in the Web UI origin's `localStorage`.
- Nothing is written to the session log, and the plugin makes no network requests.
- Clearing site data removes the tree layout; the turns themselves are unaffected.

## Compatibility

The tree is pure CSS layered over the Chat DOM, so it depends on a few internals of the current DSH version:

- `data-chat-turn` attributes on turn elements;
- the Chat flow slot being `display: contents`, which makes turns flex items;
- `tnXGgG_*` CSS-module class names for the running and older rows;
- the slot names listed above, and the built-in English and Chinese `aria-label`s of the native branch button.

If a future DSH release changes them, nesting may stop working until the plugin is updated. The plugin never modifies session data. Adapting to new internals is welcome as a pull request.

## Limitations

- **No context isolation.** Sub-conversations are ordinary turns appended to the current session; the model sees them in chronological order, not spliced in under the parent turn. Not creating a Session is what makes this cheap, and this is its cost.
- **Presentation only.** The parent relation is a browser-side view; the log stays linear and the tree does not follow you to another device.
- **Linear turn numbers.** Sub-turns keep their normal turn numbers and appear in the session's context like any other turn.
- **Loaded turns only.** The navigator lists the turns currently loaded in the transcript; scroll the main conversation to load older ones.
- **In-memory arming.** The armed folder survives navigation within the page, but not a reload.
- **Hidden native branch button.** The built-in "Branch into a new conversation" action is hidden to avoid confusion with sub-conversations.

## Uninstall

- Remove the plugin from **Plugins**, or run `dsh plugin --profile desktop remove dsh-inline-branches`.
- Optionally clear `dsh.inline-tree.v3` and `dsh.inline-tree.collapsed.v1` from the Web UI origin's `localStorage`.

## Development

The plugin is plain JavaScript loaded as-is by the Client module loader — no bundler, no dependencies.

```
client.js           all UI: stores, tree model, injected CSS, React components
index.js            Host half: empty apply()
cordis.patch.yml    bundle patch that inserts the inline-branches row
locale/en.json      Plugin Manager metadata (title/description)
locale/zh.json
icon.svg            Plugin Manager icon
docs/preview.svg    README illustration
```

Point a profile at the checkout with **Add plugin → local path**, and restart or reinstall after editing `client.js` to load a fresh Client module.

## License

[MIT](./LICENSE)

Not affiliated with DeepSeek. "DeepSeek Harness" is used only to describe compatibility.
