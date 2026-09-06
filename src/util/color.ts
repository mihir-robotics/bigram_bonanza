/** Green (high) to red (low) in OKLCH for perceptually even steps. */
export function probToColor(probability: number, minP: number, maxP: number): string {
  if (maxP <= minP) {
    return "oklch(0.72 0.17 145)";
  }
  const t = (probability - minP) / (maxP - minP);
  const hue = 25 + t * 115;
  const chroma = 0.14 + t * 0.06;
  const lightness = 0.78 - t * 0.08;
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
}
