import { describe, it, expect } from "vitest";
import { calculateCoverage } from "../../src/lib/analyzer/coverage.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

function makeProject(
  symbols: Array<{ name: string; kind: string; hasDoc: boolean; exported: boolean }>,
): ProjectDocumentation {
  return {
    files: [
      {
        filePath: "test.ts",
        fileDoc: null,
        symbols: symbols.map((s) => ({
          name: s.name,
          kind: s.kind as "function",
          doc: s.hasDoc
            ? { description: "doc", tags: [], range: { start: 0, end: 10 } }
            : null,
          signature: `${s.kind} ${s.name}`,
          exported: s.exported,
          location: { file: "test.ts", line: 1, column: 1 },
        })),
      },
    ],
    metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src" },
  };
}

describe("calculateCoverage", () => {
  it("전체 문서화된 프로젝트는 100%", () => {
    const project = makeProject([
      { name: "a", kind: "function", hasDoc: true, exported: true },
      { name: "b", kind: "function", hasDoc: true, exported: true },
    ]);

    const report = calculateCoverage(project);
    expect(report.coveragePercent).toBe(100);
    expect(report.totalSymbols).toBe(2);
    expect(report.documentedSymbols).toBe(2);
    expect(report.undocumentedSymbols).toHaveLength(0);
  });

  it("부분 문서화 시 올바른 퍼센트를 계산한다", () => {
    const project = makeProject([
      { name: "a", kind: "function", hasDoc: true, exported: true },
      { name: "b", kind: "function", hasDoc: false, exported: true },
      { name: "c", kind: "class", hasDoc: true, exported: true },
    ]);

    const report = calculateCoverage(project);
    expect(report.coveragePercent).toBe(66.7);
    expect(report.undocumentedSymbols).toHaveLength(1);
    expect(report.undocumentedSymbols[0].name).toBe("b");
  });

  it("exportedOnly=true (기본값): 비export 심볼을 제외한다", () => {
    const project = makeProject([
      { name: "pub", kind: "function", hasDoc: true, exported: true },
      { name: "priv", kind: "function", hasDoc: false, exported: false },
    ]);

    const report = calculateCoverage(project, { exportedOnly: true });
    expect(report.totalSymbols).toBe(1);
    expect(report.coveragePercent).toBe(100);
  });

  it("exportedOnly=false: 모든 심볼을 포함한다", () => {
    const project = makeProject([
      { name: "pub", kind: "function", hasDoc: true, exported: true },
      { name: "priv", kind: "function", hasDoc: false, exported: false },
    ]);

    const report = calculateCoverage(project, { exportedOnly: false });
    expect(report.totalSymbols).toBe(2);
    expect(report.coveragePercent).toBe(50);
  });

  it("byKind 통계를 올바르게 계산한다", () => {
    const project = makeProject([
      { name: "a", kind: "function", hasDoc: true, exported: true },
      { name: "b", kind: "function", hasDoc: false, exported: true },
      { name: "C", kind: "class", hasDoc: true, exported: true },
    ]);

    const report = calculateCoverage(project);
    expect(report.byKind.function).toEqual({ total: 2, documented: 1 });
    expect(report.byKind.class).toEqual({ total: 1, documented: 1 });
  });

  it("byFile 통계를 올바르게 계산한다", () => {
    const project = makeProject([
      { name: "a", kind: "function", hasDoc: true, exported: true },
      { name: "b", kind: "function", hasDoc: false, exported: true },
    ]);

    const report = calculateCoverage(project);
    expect(report.byFile).toHaveLength(1);
    expect(report.byFile[0].file).toBe("test.ts");
    expect(report.byFile[0].percent).toBe(50);
  });

  it("심볼이 없으면 커버리지 100%", () => {
    const project: ProjectDocumentation = {
      files: [],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src" },
    };

    const report = calculateCoverage(project);
    expect(report.coveragePercent).toBe(100);
    expect(report.totalSymbols).toBe(0);
  });
});
