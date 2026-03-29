import { describe, it, expect } from "vitest";
import { generateLlmsTxt } from "../../src/lib/generator/llms-txt.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

describe("generateLlmsTxt", () => {
  const project: ProjectDocumentation = {
    files: [
      {
        filePath: "math.ts",
        fileDoc: null,
        symbols: [
          {
            name: "add",
            kind: "function",
            doc: {
              description: "두 숫자를 더합니다.",
              tags: [
                { tag: "param", name: "a", type: "number", description: "첫 번째", optional: false },
                { tag: "param", name: "b", type: "number", description: "두 번째", optional: false },
                { tag: "returns", name: "", type: "number", description: "합", optional: false },
              ],
              range: { start: 0, end: 10 },
            },
            signature: "function add(a: number, b: number): number",
            exported: true,
            location: { file: "math.ts", line: 1, column: 1 },
          },
          {
            name: "internal",
            kind: "function",
            doc: null,
            signature: "function internal()",
            exported: false,
            location: { file: "math.ts", line: 10, column: 1 },
          },
        ],
      },
    ],
    metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
  };

  it("llms.txt 형식으로 출력한다", () => {
    const output = generateLlmsTxt(project);

    expect(output).toContain("# API Reference");
    expect(output).toContain("## math.ts");
    expect(output).toContain("### function add(a: number, b: number): number");
    expect(output).toContain("두 숫자를 더합니다.");
    expect(output).toContain("Parameters:");
    expect(output).toContain("- a (number): 첫 번째");
    expect(output).toContain("Returns (number): 합");
  });

  it("export된 심볼만 포함한다", () => {
    const output = generateLlmsTxt(project);
    expect(output).not.toContain("internal");
  });

  it("커스텀 제목과 설명을 지원한다", () => {
    const output = generateLlmsTxt(project, {
      title: "My Library",
      description: "Custom docs",
    });
    expect(output).toContain("# My Library");
    expect(output).toContain("> Custom docs");
  });

  it("빈 프로젝트를 처리한다", () => {
    const empty: ProjectDocumentation = {
      files: [],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };
    const output = generateLlmsTxt(empty);
    expect(output).toContain("# API Reference");
  });
});
