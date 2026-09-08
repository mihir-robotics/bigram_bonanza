import { contextKey, tokenizeWords } from "./tokenizer";

export type Prediction = {
  token: string;
  count: number;
  probability: number;
};

export type TrainOptions = {
  order: number;
  ignoreCase: boolean;
};

export type TrainResult =
  | { ok: true; contextCount: number; transitionCount: number; order: number }
  | { ok: false; error: string };

export class NgramModel {
  private counts = new Map<string, Map<string, number>>();
  private order = 0;
  private ignoreCase = true;

  train(corpus: string, options: TrainOptions): TrainResult {
    const { order, ignoreCase } = options;
    if (order < 2 || order > 4) {
      return { ok: false, error: "N-gram size must be between 2 and 4." };
    }

    this.counts.clear();
    this.order = order;
    this.ignoreCase = ignoreCase;

    const words = tokenizeWords(corpus, ignoreCase);
    if (words.length < order) {
      return {
        ok: false,
        error: `Corpus too short. Need at least ${order} words for an ${order}-gram model.`,
      };
    }

    let transitionCount = 0;
    for (let i = 0; i <= words.length - order; i++) {
      const context = words.slice(i, i + order - 1);
      const next = words[i + order - 1]!;
      const key = contextKey(context);

      let successors = this.counts.get(key);
      if (!successors) {
        successors = new Map();
        this.counts.set(key, successors);
      }
      successors.set(next, (successors.get(next) ?? 0) + 1);
      transitionCount++;
    }

    if (transitionCount === 0) {
      return {
        ok: false,
        error: `Corpus too short. Need at least ${order} words for an ${order}-gram model.`,
      };
    }

    return {
      ok: true,
      contextCount: this.counts.size,
      transitionCount,
      order,
    };
  }

  isReady(): boolean {
    return this.counts.size > 0 && this.order >= 2;
  }

  getOrder(): number {
    return this.order;
  }

  getIgnoreCase(): boolean {
    return this.ignoreCase;
  }

  getPredictions(contextWords: string[], k: number): Prediction[] | null {
    if (!this.isReady()) return null;
    if (contextWords.length !== this.order - 1) return null;

    const key = contextKey(contextWords);
    const successors = this.counts.get(key);
    if (!successors || successors.size === 0) return null;

    let total = 0;
    for (const count of successors.values()) {
      total += count;
    }

    const all: Prediction[] = [];
    for (const [token, count] of successors) {
      all.push({ token, count, probability: count / total });
    }

    all.sort((a, b) => b.probability - a.probability);
    return all.slice(0, Math.max(1, k));
  }
}
