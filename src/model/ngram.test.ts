import { describe, expect, it } from "vitest";
import { NgramModel } from "./ngram";
import { contextKey } from "./tokenizer";

describe("NgramModel", () => {
  it("predicts next word for bigram", () => {
    const model = new NgramModel();
    const result = model.train("the cat sat the mat", {
      order: 2,
      ignoreCase: true,
    });
    expect(result.ok).toBe(true);

    const preds = model.getPredictions(["cat"], 5);
    expect(preds).not.toBeNull();
    expect(preds![0]!.token).toBe("sat");
    expect(preds![0]!.probability).toBeGreaterThan(0);
  });

  it("predicts for trigram context", () => {
    const model = new NgramModel();
    model.train("a b c d", { order: 3, ignoreCase: true });
    const preds = model.getPredictions(["a", "b"], 5);
    expect(preds![0]!.token).toBe("c");
  });

  it("merges case when ignoreCase is true", () => {
    const model = new NgramModel();
    model.train("The cat the Cat", { order: 2, ignoreCase: true });
    const preds = model.getPredictions(["the"], 5);
    expect(preds!.some((p) => p.token === "cat")).toBe(true);
    const catPred = preds!.find((p) => p.token === "cat");
    expect(catPred!.count).toBe(2);
  });

  it("returns null for unknown context", () => {
    const model = new NgramModel();
    model.train("a b c", { order: 2, ignoreCase: true });
    expect(model.getPredictions(["z"], 5)).toBeNull();
  });

  it("normalizes probabilities over all successors", () => {
    const model = new NgramModel();
    model.train("a b a c", { order: 2, ignoreCase: true });
    const preds = model.getPredictions(["a"], 10);
    const sum = preds!.reduce((s, p) => s + p.probability, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("uses contextKey for storage", () => {
    expect(contextKey(["a", "b"])).toBe(`a\x1fb`);
  });
});
