import type { Prediction } from "../model/ngram";
import { probToColor } from "../util/color";
import { createEl } from "./dom";

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
    const tile = createEl("div", {
      className: "tile",
      attrs: {
        role: "listitem",
        "aria-label": `Next word ${pred.token}, probability ${formatPercent(pred.probability)}`,
        style: `background-color: ${probToColor(pred.probability, minP, maxP)}; animation-delay: ${index * 55}ms`,
      },
    });

    const wordSpan = createEl("span", {
      className: "tile-word",
      text: pred.token,
    });
    const probSpan = createEl("span", {
      className: "tile-prob",
      text: formatPercent(pred.probability),
    });

    tile.append(wordSpan, probSpan);
    container.append(tile);
  });
}
