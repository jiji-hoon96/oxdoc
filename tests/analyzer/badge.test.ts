import { describe, it, expect } from "vitest";
import { generateCoverageBadge } from "../../src/lib/analyzer/badge.js";

describe("generateCoverageBadge", () => {
  it("should generate valid SVG string", () => {
    const svg = generateCoverageBadge(85);
    expect(svg).toContain("<svg");
    expect(svg).toContain("85%");
    expect(svg).toContain("doc coverage");
  });

  it("should use green color for >= 80%", () => {
    const svg = generateCoverageBadge(80);
    expect(svg).toContain("#4c1");
  });

  it("should use yellow color for 60-79%", () => {
    const svg = generateCoverageBadge(70);
    expect(svg).toContain("#dfb317");
  });

  it("should use red color for < 60%", () => {
    const svg = generateCoverageBadge(40);
    expect(svg).toContain("#e05d44");
  });

  it("should handle 0%", () => {
    const svg = generateCoverageBadge(0);
    expect(svg).toContain("0%");
  });

  it("should handle 100%", () => {
    const svg = generateCoverageBadge(100);
    expect(svg).toContain("100%");
  });
});
