# Bigram Bonanza

A minimal, client-only web app: paste or upload a text corpus, train a character bigram model in the browser, then type a word or sentence to see the **top 20** next-character predictions as a green (likely) → red (less likely) tile map.

All processing stays in your browser. Nothing is sent to a server.

## Requirements

- [Node.js](https://nodejs.org/) LTS (includes npm)

## Quick start

On some **corporate networks**, `npm install` fails with certificate errors until Node uses the Windows trust store. In PowerShell or Git Bash:

```bash
export NODE_OPTIONS=--use-system-ca   # Git Bash
# $env:NODE_OPTIONS = "--use-system-ca"   # PowerShell

npm install
npm run dev
```

Opening this project in **Cursor/VS Code** sets `NODE_OPTIONS=--use-system-ca` for integrated terminals via [`.vscode/settings.json`](.vscode/settings.json). For a permanent fix outside the editor, add a user environment variable `NODE_OPTIONS` = `--use-system-ca` in Windows.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

Static files are written to `dist/`. Deploy that folder to any static host (Netlify, GitHub Pages, S3, etc.).

If the site is hosted in a **subfolder** (e.g. GitHub Pages project site), set `base` in [`vite.config.ts`](vite.config.ts) to your path (e.g. `'/bigram_prediction_site/'`). The project default is `./` for relative asset paths.

## How to use

The app has **two pages**:

1. **Corpus (page 1)** — Paste text or upload a `.txt` file (max 5 MB), then click **Train**. Training is **case-sensitive** (`T` and `t` are different). After a successful train, you move to the predict page automatically.
2. **Predict (page 2)** — Type in the prediction field. The app uses the **last character** of your input as context and shows the top successors from your corpus.
3. **Edit corpus** — Returns to page 1 with your textarea and trained model intact. Use **Continue to predictions** to skip re-training, or click **Train** again after editing the corpus to rebuild the model.
4. **Reset** (page 2) — Clears the prediction input and tile map only.

## Project structure

- `src/model/` — Bigram training and prediction
- `src/ui/` — DOM helpers and tile rendering
- `src/util/` — Color scale and file upload helpers
- `src/styles/global.css` — Layout, theme, motion

## Errors and troubleshooting

| Error / symptom | Likely cause | Fix |
|-----------------|--------------|-----|
| `npm install` — `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `unable to verify the first certificate` | Corporate HTTPS inspection; Node does not trust the proxy CA | Set `NODE_OPTIONS=--use-system-ca` and retry; if it still fails, add IT’s root CA via `NODE_EXTRA_CA_CERTS` or `cafile` in [`.npmrc.example`](.npmrc.example) |
| `'vite' is not recognized` when running `npm run dev` | Dependencies not installed (`node_modules` missing) | Fix `npm install` first (often the TLS issue above), then run `npm run dev` again |
| `npm install` fails (ENOENT, permission) | Node/npm not installed or wrong directory | Install LTS Node; run commands from the project root |
| `npm` / `node` not recognized | Node not on PATH | Reinstall Node LTS with “Add to PATH”; restart the terminal and Cursor |
| `npm run dev` — port in use | Another process on port 5173 | Stop the other process or run `npx vite --port 5174` |
| Train: “Corpus too short” | Fewer than two characters or no adjacent pairs | Paste longer text; you need at least one bigram |
| Train: “No valid characters” | Empty textarea | Add text or choose a non-empty `.txt` file |
| Upload: “File too large” | File over 5 MB | Split the corpus or raise `MAX_UPLOAD_BYTES` in `src/util/fileReader.ts` |
| Upload: garbled text | Wrong encoding (e.g. UTF-16) | Re-save the file as UTF-8 |
| Predict: empty tiles | Prediction input is empty | Type at least one character |
| Predict: “No predictions for …” | Last character never appears in the corpus as a context | Use that character in the corpus or type a different ending |
| Predict: only one tile | Corpus has only one successor for that character | Expected behavior |
| Colors all similar | Nearly flat distribution | Common with random or uniform text; try a richer corpus |
| Reset doesn’t clear corpus | By design | Clear the corpus textarea manually |
| Production blank page | Incorrect `base` for subfolder hosting | Set `base` in `vite.config.ts` |
| `npm run build` TypeScript errors | Strict typing issues | Fix reported files (often null checks on empty maps) |
| Safari file upload no-op | Empty or delayed iCloud file | Re-select the file; ensure non-zero size |

## License

Private / use as you like for this project.
