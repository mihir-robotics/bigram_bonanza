import { describe, expect, it } from "vitest";
import { tokenizeWords, validateCorpusForNgram } from "./tokenizer";

describe("tokenizeWords", () => {
  it("splits on whitespace", () => {
    expect(tokenizeWords("the cat sat", false)).toEqual(["the", "cat", "sat"]);
  });

  it("lowercases when ignoreCase is true", () => {
    expect(tokenizeWords("The Cat", true)).toEqual(["the", "cat"]);
  });

  it("returns empty for whitespace-only", () => {
    expect(tokenizeWords("   ", true)).toEqual([]);
  });
});

describe("validateCorpusForNgram", () => {
  it("requires at least order tokens", () => {
    expect(validateCorpusForNgram("one two", 3, true)).toMatch(/at least 3 words/);
    expect(validateCorpusForNgram("one two three", 3, true)).toBeNull();
  });
});
