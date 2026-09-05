import type { Prediction } from "../model/bigram";
import { probToColor } from "../util/color";
import { createEl } from "./dom";

function displayChar(char: string): { label: string; extraClass: string } {
  if (char === " ") return { label: "space", extraClass: "tile-char--space" };
  if (char === "\n") return { label: "↵", extraClass: "tile-char--space" };
  if (char === "\t") return { label: "tab", extraClass: "tile-char--space" };
  return { label: char, extraClass: "" };
}

function formatPercent(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

export function renderTiles(
  container: HTMLElement,
  predictions: Prediction[] | null,
): void {
  container.replaceChildren();

  if (!predictions || predictions.length === 0) {
    return;
  }

  const minP = predictions[predictions.length - 1]!.probability;
  const maxP = predictions[0]!.probability;

  predictions.forEach((pred, index) => {
    const { label, extraClass } = displayChar(pred.char);
    const tile = createEl("div", {
      className: "tile",
      attrs: {
        role: "listitem",
        "aria-label": `Next character ${label}, probability ${formatPercent(pred.probability)}`,
        style: `background-color: ${probToColor(pred.probability, minP, maxP)}; animation-delay: ${index * 55}ms`,
      },
    });

    const charSpan = createEl("span", {
      className: `tile-char ${extraClass}`.trim(),
      text: label,
    });
    const probSpan = createEl("span", {
      className: "tile-prob",
      text: formatPercent(pred.probability),
    });

    tile.append(charSpan, probSpan);
    container.append(tile);
  });
}
