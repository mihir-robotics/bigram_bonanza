import { NgramModel } from "./model/ngram";
import { tokenizeWords, validateCorpusForNgram } from "./model/tokenizer";
import { createEl } from "./ui/dom";
import { renderTiles } from "./ui/renderTiles";
import { showView, type ViewName } from "./ui/views";
import { readFileAsText } from "./util/fileReader";

const TOP_K = 30;
const DEBOUNCE_MS = 150;

const model = new NgramModel();
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function setStatus(
  el: HTMLElement,
  message: string,
  variant: "success" | "error" | "muted",
): void {
  el.textContent = message;
  el.className = `status status--${variant}`;
}

function displayTitle(
  parts: { text: string; accent?: boolean }[],
  small = false,
): HTMLElement {
  const h1 = createEl("h1", {
    className: small ? "display-title display-title--sm" : "display-title",
  });
  for (const part of parts) {
    if (part.accent) {
      const span = createEl("span", { className: "accent", text: part.text });
      h1.append(span);
    } else {
      h1.append(document.createTextNode(part.text));
    }
  }
  return h1;
}

function parseOrder(select: HTMLSelectElement): number {
  return Number.parseInt(select.value, 10);
}

function buildApp(): void {
  const root = document.querySelector("#app") as HTMLElement | null;
  if (!root) return;
  const appRoot = root;

  const trainView = createEl("section", {
    className: "view view--train",
    attrs: { "aria-label": "Train on corpus" },
  });
  trainView.append(
    displayTitle([
      { text: "Bigram " },
      { text: "Bonanza", accent: true },
    ]),
    createEl("p", {
      className: "body-hint",
      text: "Word n-grams — paste or upload text, choose N (2–4), then train. Predict the next word from your corpus.",
    }),
  );

  const trainOptions = createEl("div", { className: "train-options" });

  const orderLabel = createEl("label", {
    className: "field-label train-options__label",
    text: "N-gram size",
    attrs: { for: "ngram-order" },
  });
  const orderSelect = createEl("select", {
    className: "train-options__select",
    attrs: { id: "ngram-order", name: "ngram-order" },
  }) as HTMLSelectElement;
  for (const n of [2, 3, 4]) {
    const opt = createEl("option", {
      text: String(n),
      attrs: { value: String(n) },
    });
    orderSelect.append(opt);
  }

  const ignoreCaseWrap = createEl("label", { className: "train-options__check" });
  const ignoreCaseInput = createEl("input", {
    attrs: { type: "checkbox", id: "ignore-case", checked: "true" },
  }) as HTMLInputElement;
  ignoreCaseWrap.append(ignoreCaseInput, document.createTextNode(" Ignore case"));

  trainOptions.append(orderLabel, orderSelect, ignoreCaseWrap);

  const corpusLabel = createEl("label", {
    className: "field-label",
    text: "Corpus",
    attrs: { for: "corpus" },
  });
  const corpusInput = createEl("textarea", {
    attrs: {
      id: "corpus",
      name: "corpus",
      placeholder: "Paste your corpus here…",
      spellcheck: "false",
    },
  }) as HTMLTextAreaElement;

  const trainActions = createEl("div", { className: "row-actions" });
  const fileWrap = createEl("div", { className: "file-input-wrap" });
  const fileInput = createEl("input", {
    attrs: {
      type: "file",
      id: "corpus-file",
      accept: "text/plain,.txt",
    },
  }) as HTMLInputElement;
  const fileLabel = createEl("label", {
    className: "btn-pill",
    attrs: { for: "corpus-file" },
  });
  fileLabel.textContent = "Upload .txt";
  fileWrap.append(fileInput, fileLabel);

  const trainBtn = createEl("button", {
    className: "btn-pill",
    text: "Train",
    attrs: { type: "button" },
  });
  const continueBtn = createEl("button", {
    className: "btn-pill btn-pill--ghost hidden",
    text: "Continue to predictions",
    attrs: { type: "button" },
  });
  trainActions.append(fileWrap, trainBtn, continueBtn);

  const trainStatus = createEl("div", {
    className: "status status--muted",
    attrs: { role: "status", "aria-live": "polite" },
  });

  trainView.append(trainOptions, corpusLabel, corpusInput, trainActions, trainStatus);

  const predictView = createEl("section", {
    className: "view view--predict",
    attrs: { "aria-label": "Predict next word", "aria-hidden": "true", inert: "" },
  });
  predictView.append(
    displayTitle(
      [
        { text: "What comes " },
        { text: "next", accent: true },
        { text: "?" },
      ],
      true,
    ),
    createEl("p", {
      className: "legend",
      text: "Greener = more likely next word (given your corpus).",
    }),
  );

  const predictBlock = createEl("div", { className: "predict-block" });
  const predictLabel = createEl("label", {
    className: "field-label",
    text: "Words or sentence",
    attrs: { for: "predict-input" },
  });
  const predictInput = createEl("input", {
    attrs: {
      type: "text",
      id: "predict-input",
      name: "predict",
      placeholder: "Start typing…",
      autocomplete: "off",
    },
  }) as HTMLInputElement;

  const predictStatus = createEl("div", {
    className: "status status--muted",
    attrs: { role: "status", "aria-live": "polite" },
  });

  const tileGrid = createEl("div", {
    className: "tile-grid",
    attrs: { role: "list", "aria-label": "Top next-word predictions" },
  });

  const footerActions = createEl("div", { className: "footer-actions" });
  const resetBtn = createEl("button", {
    className: "btn-pill btn-pill--ghost",
    text: "Reset",
    attrs: { type: "button" },
  });
  const editCorpusBtn = createEl("button", {
    className: "btn-pill",
    text: "Edit corpus",
    attrs: { type: "button" },
  });
  footerActions.append(resetBtn, editCorpusBtn);

  predictBlock.append(predictLabel, predictInput, predictStatus, tileGrid);
  predictView.append(predictBlock, footerActions);

  appRoot.append(trainView, predictView);

  const views = { train: trainView, predict: predictView };

  function getTrainOptions() {
    return {
      order: parseOrder(orderSelect),
      ignoreCase: ignoreCaseInput.checked,
    };
  }

  function syncContinueButton(): void {
    if (model.isReady()) {
      continueBtn.classList.remove("hidden");
    } else {
      continueBtn.classList.add("hidden");
    }
  }

  function goTo(view: ViewName, focus?: string): void {
    showView(appRoot, views, view, focus ? { focusSelector: focus } : undefined);
    if (view === "train") {
      syncContinueButton();
    }
  }

  function formatContext(words: string[]): string {
    return words.join(" ");
  }

  function updatePredictions(): void {
    if (!model.isReady()) return;

    const order = model.getOrder();
    const contextLen = order - 1;
    const ignoreCase = model.getIgnoreCase();
    const value = predictInput.value;

    if (value.trim().length === 0) {
      renderTiles(tileGrid, null);
      setStatus(predictStatus, "Type words to see predictions.", "muted");
      return;
    }

    const tokens = tokenizeWords(value, ignoreCase);
    if (tokens.length < contextLen) {
      renderTiles(tileGrid, null);
      const need =
        contextLen === 1 ? "1 word" : `${contextLen} words`;
      setStatus(
        predictStatus,
        `Type at least ${need} for context (${order}-gram model).`,
        "muted",
      );
      return;
    }

    const context = tokens.slice(-contextLen);
    const preds = model.getPredictions(context, TOP_K);

    if (!preds) {
      renderTiles(tileGrid, null);
      setStatus(
        predictStatus,
        `No predictions for “${formatContext(context)}” in this corpus.`,
        "error",
      );
      return;
    }

    renderTiles(tileGrid, preds);
    setStatus(
      predictStatus,
      `Top ${preds.length} next words after “${formatContext(context)}”.`,
      "muted",
    );
  }

  function schedulePredictions(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePredictions, DEBOUNCE_MS);
  }

  trainBtn.addEventListener("click", () => {
    const corpus = corpusInput.value;
    const options = getTrainOptions();
    const validation = validateCorpusForNgram(
      corpus,
      options.order,
      options.ignoreCase,
    );
    if (validation) {
      setStatus(trainStatus, validation, "error");
      return;
    }

    trainBtn.disabled = true;
    const result = model.train(corpus, options);
    trainBtn.disabled = false;

    if (!result.ok) {
      setStatus(trainStatus, result.error, "error");
      return;
    }

    setStatus(
      trainStatus,
      `${result.order}-gram ready — ${result.contextCount} contexts, ${result.transitionCount} transitions.`,
      "success",
    );
    syncContinueButton();
    goTo("predict", "#predict-input");
    setStatus(predictStatus, "Model loaded. Start typing below.", "muted");
    updatePredictions();
  });

  continueBtn.addEventListener("click", () => {
    goTo("predict", "#predict-input");
    updatePredictions();
  });

  editCorpusBtn.addEventListener("click", () => {
    goTo("train");
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const read = await readFileAsText(file);
    fileInput.value = "";
    if (!read.ok) {
      setStatus(trainStatus, read.error, "error");
      return;
    }
    corpusInput.value = read.text;
    setStatus(
      trainStatus,
      `Loaded “${file.name}”. Click Train to build the model.`,
      "muted",
    );
  });

  predictInput.addEventListener("input", schedulePredictions);

  resetBtn.addEventListener("click", () => {
    predictInput.value = "";
    renderTiles(tileGrid, null);
    setStatus(predictStatus, "Type words to see predictions.", "muted");
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  setStatus(trainStatus, "Paste or upload a corpus, then click Train.", "muted");
  showView(appRoot, views, "train");
}

buildApp();
