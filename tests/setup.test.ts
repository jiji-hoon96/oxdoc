import { describe, it, expect } from "vitest";
import {
  parseFile,
  parseSource,
  parseProject,
  parseJSDoc,
  isJSDocComment,
  calculateCoverage,
  generateCoverageBadge,
  diffAPI,
  extractDocTests,
  runDocTests,
  generateJSON,
  generateMarkdown,
  generateLlmsTxt,
  generateHTML,
  loadConfig,
  mergeConfig,
  runPlugins,
} from "../src/lib/index.js";

describe("oxdoc setup", () => {
  it("프로젝트가 올바르게 설정되었는지 확인", () => {
    expect(true).toBe(true);
  });

  it("타입이 올바르게 export되는지 확인", async () => {
    const types = await import("../src/types/index.js");
    expect(types).toBeDefined();
  });
});

describe("lib/index barrel exports", () => {
  it("모든 public API가 export된다", () => {
    expect(parseFile).toBeDefined();
    expect(parseSource).toBeDefined();
    expect(parseProject).toBeDefined();
    expect(parseJSDoc).toBeDefined();
    expect(isJSDocComment).toBeDefined();
    expect(calculateCoverage).toBeDefined();
    expect(generateCoverageBadge).toBeDefined();
    expect(diffAPI).toBeDefined();
    expect(extractDocTests).toBeDefined();
    expect(runDocTests).toBeDefined();
    expect(generateJSON).toBeDefined();
    expect(generateMarkdown).toBeDefined();
    expect(generateLlmsTxt).toBeDefined();
    expect(generateHTML).toBeDefined();
    expect(loadConfig).toBeDefined();
    expect(mergeConfig).toBeDefined();
    expect(runPlugins).toBeDefined();
  });
});
