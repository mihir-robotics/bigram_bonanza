/** Iterate adjacent character pairs in a corpus string. */
export function* bigramPairs(corpus: string): Generator<[string, string]> {
  if (corpus.length < 2) return;
  for (let i = 0; i < corpus.length - 1; i++) {
    yield [corpus[i]!, corpus[i + 1]!];
  }
}

export function validateCorpusLength(corpus: string): string | null {
  const trimmed = corpus.trim();
  if (trimmed.length === 0) {
    return "No valid characters. Add text or choose a non-empty .txt file.";
  }
  if (trimmed.length < 2) {
    return "Corpus too short. Paste longer text — you need at least one character pair.";
  }
  return null;
}
