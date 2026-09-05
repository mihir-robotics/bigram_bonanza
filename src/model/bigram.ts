import { bigramPairs } from "./tokenizer";

export type Prediction = {
  char: string;
  count: number;
  probability: number;
};

export type TrainResult =
  | { ok: true; contextCount: number; transitionCount: number }
  | { ok: false; error: string };

export class BigramModel {
  private counts = new Map<string, Map<string, number>>();

  train(corpus: string): TrainResult {
    this.counts.clear();
    let transitionCount = 0;

    for (const [a, b] of bigramPairs(corpus)) {
      let next = this.counts.get(a);
      if (!next) {
        next = new Map();
        this.counts.set(a, next);
      }
      next.set(b, (next.get(b) ?? 0) + 1);
      transitionCount++;
    }

    if (transitionCount === 0) {
      return {
        ok: false,
        error:
          "Corpus too short. Paste longer text — you need at least one character pair.",
      };
    }

    return {
      ok: true,
      contextCount: this.counts.size,
      transitionCount,
    };
  }

  isReady(): boolean {
    return this.counts.size > 0;
  }

  getPredictions(contextChar: string, k: number): Prediction[] | null {
    const successors = this.counts.get(contextChar);
    if (!successors || successors.size === 0) {
      return null;
    }

    let total = 0;
    for (const count of successors.values()) {
      total += count;
    }

    const all: Prediction[] = [];
    for (const [char, count] of successors) {
      all.push({ char, count, probability: count / total });
    }

    all.sort((x, y) => y.probability - x.probability);
    return all.slice(0, Math.max(1, k));
  }
}
