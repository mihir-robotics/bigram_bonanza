# Bigram Bonanza

A minimal, client-only web app: paste or upload a text corpus, train a **word n-gram** model (N = 2–4) in the browser, then type words to see the **top 20** next-word predictions as a green (likely) → red (less likely) tile map.

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

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build and test

```bash
npm run build
npm run preview
npm test
```

Static files are written to `dist/`. Deploy that folder to any static host (Netlify, GitHub Pages, S3, etc.).

If the site is hosted in a **subfolder** (e.g. GitHub Pages project site), set `base` in [`vite.config.ts`](vite.config.ts) to your path (e.g. `'/bigram_prediction_site/'`). The project default is `./` for relative asset paths.

## How to use

The app has **two pages**:

1. **Corpus (page 1)** — Choose **N-gram size** (2, 3, or 4), optional **Ignore case** (default on), paste text or upload a `.txt` file (max 5 MB), then click **Train**. After success, you move to the predict page.
2. **Predict (page 2)** — Type words. The app uses the last **N−1 words** as context and shows likely **next words** from your corpus.
3. **Edit corpus** — Returns to page 1 with your textarea and trained model intact. Use **Continue to predictions** or **Train** again after edits.
4. **Reset** (page 2) — Clears the prediction input and tile map only.

## Testing

- **Automated:** `npm test` runs [Vitest](https://vitest.dev/) unit tests for tokenization, `NgramModel`, and color scaling (`src/**/*.test.ts`).
- **Manual QA checklist:**
  - Train with N=2, 3, and 4 on a short paragraph; confirm transition to predict page.
  - Type enough words for context; tiles update and greenest = highest %.
  - **Edit corpus** / **Continue** without forced re-train.
  - Upload a `.txt` file; **Reset** on predict page.
  - Resize to ~375px width: readable tiles, no horizontal scroll, inputs usable.

## Security

See [SECURITY.md](SECURITY.md) for threat model, XSS/file-upload notes, and deployment guidance (CSP, fonts, dependencies).

## Project structure

- `src/model/` — Word n-gram training and prediction
- `src/ui/` — DOM helpers, views, tile rendering
- `src/util/` — Color scale and file upload helpers
- `src/styles/global.css` — Layout, theme, motion, mobile

## Errors and troubleshooting

| Error / symptom | Likely cause | Fix |
|-----------------|--------------|-----|
| `npm install` — `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Corporate HTTPS inspection | Set `NODE_OPTIONS=--use-system-ca`; see [`.npmrc.example`](.npmrc.example) |
| `'vite' is not recognized` | `node_modules` missing | Run `npm install` successfully first |
| Train: “Need at least N words” | Corpus too short for chosen N | Add more words or lower N |
| Train: “No valid words” | Empty textarea | Add text or upload a non-empty `.txt` |
| Predict: “Type at least … words” | Not enough words for context | Type N−1 or more words (for N=3, at least 2 words) |
| Predict: “No predictions for …” | Context never appears in corpus | Use that phrase in the corpus or change ending |
| Upload: “File too large” | Over 5 MB | Split corpus or raise cap in `fileReader.ts` |
| Production blank page | Wrong `base` for subfolder hosting | Set `base` in `vite.config.ts` |

## License

Private / use as you like for this project.
