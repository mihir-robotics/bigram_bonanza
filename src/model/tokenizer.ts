export const CONTEXT_SEP = "\x1f";

export function tokenizeWords(text: string, ignoreCase: boolean): string[] {
  const parts = text.trim().split(/\s+/).filter((w) => w.length > 0);
  if (!ignoreCase) return parts;
  return parts.map((w) => w.toLowerCase());
}

export function validateCorpusForNgram(
  corpus: string,
  order: number,
  ignoreCase: boolean,
): string | null {
  if (order < 2 || order > 4) {
    return "N-gram size must be between 2 and 4.";
  }
  const tokens = tokenizeWords(corpus, ignoreCase);
  if (tokens.length === 0) {
    return "No valid words. Add text or choose a non-empty .txt file.";
  }
  if (tokens.length < order) {
    return `Corpus too short. Need at least ${order} words for an ${order}-gram model.`;
  }
  return null;
}

export function contextKey(words: string[]): string {
  return words.join(CONTEXT_SEP);
}
