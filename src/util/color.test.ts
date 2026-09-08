import { describe, expect, it } from "vitest";
import { probToColor } from "./color";

function parseHue(oklch: string): number {
  const match = oklch.match(/oklch\([\d.]+ [\d.]+ ([\d.]+)\)/);
  return match ? Number.parseFloat(match[1]!) : 0;
}

describe("probToColor", () => {
  it("uses higher hue (greener) for higher probability", () => {
    const low = probToColor(0.1, 0.1, 0.9);
    const high = probToColor(0.9, 0.1, 0.9);
    expect(parseHue(high)).toBeGreaterThan(parseHue(low));
  });
});
