import { describe, it, expect } from "vitest";
import { runPlugins } from "../../src/lib/plugins/index.js";
import type { OxdocPlugin } from "../../src/types/plugin.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

function makeProject(): ProjectDocumentation {
  return {
    files: [
      {
        filePath: "test.ts",
        fileDoc: null,
        symbols: [
          {
            name: "publicFn",
            kind: "function",
            doc: { description: "public", tags: [], range: { start: 0, end: 10 } },
            signature: "function publicFn()",
            exported: true,
            location: { file: "test.ts", line: 1, column: 1 },
          },
          {
            name: "internalFn",
            kind: "function",
            doc: null,
            signature: "function internalFn()",
            exported: false,
            location: { file: "test.ts", line: 5, column: 1 },
          },
        ],
      },
    ],
    metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
  };
}

describe("runPlugins", () => {
  it("transformer 플러그인이 심볼을 필터링한다", () => {
    const plugin: OxdocPlugin = {
      name: "export-only",
      transformSymbols: (symbols) => symbols.filter((s) => s.exported),
    };

    const project = makeProject();
    runPlugins([plugin], project);

    expect(project.files[0].symbols).toHaveLength(1);
    expect(project.files[0].symbols[0].name).toBe("publicFn");
  });

  it("output 플러그인이 파일을 생성한다", () => {
    const plugin: OxdocPlugin = {
      name: "custom-output",
      generateOutput: (project) => [
        {
          filename: "custom.txt",
          content: `Symbols: ${project.files.reduce((s, f) => s + f.symbols.length, 0)}`,
        },
      ],
    };

    const project = makeProject();
    const result = runPlugins([plugin], project);

    expect(result.outputFiles).toHaveLength(1);
    expect(result.outputFiles[0].filename).toBe("custom.txt");
    expect(result.outputFiles[0].content).toContain("Symbols: 2");
  });

  it("analyzer 플러그인이 결과를 반환한다", () => {
    const plugin: OxdocPlugin = {
      name: "undoc-checker",
      analyzeProject: (project) => {
        const undoc = project.files.flatMap((f) =>
          f.symbols.filter((s) => s.doc === null),
        );
        return {
          pluginName: "undoc-checker",
          summary: `${undoc.length} undocumented symbols`,
          issues: undoc.map((s) => ({
            severity: "warning" as const,
            message: `${s.name} has no documentation`,
            file: s.location.file,
            line: s.location.line,
          })),
        };
      },
    };

    const project = makeProject();
    const result = runPlugins([plugin], project);

    expect(result.analysisResults).toHaveLength(1);
    expect(result.analysisResults[0].summary).toBe("1 undocumented symbols");
    expect(result.analysisResults[0].issues).toHaveLength(1);
  });

  it("여러 플러그인을 순서대로 실행한다", () => {
    const order: string[] = [];

    const plugin1: OxdocPlugin = {
      name: "first",
      transformSymbols: (symbols) => {
        order.push("transform-1");
        return symbols;
      },
    };

    const plugin2: OxdocPlugin = {
      name: "second",
      transformSymbols: (symbols) => {
        order.push("transform-2");
        return symbols;
      },
      generateOutput: () => {
        order.push("output-2");
        return [];
      },
    };

    const project = makeProject();
    runPlugins([plugin1, plugin2], project);

    expect(order).toEqual(["transform-1", "transform-2", "output-2"]);
  });

  it("훅이 없는 플러그인은 에러 없이 통과한다", () => {
    const plugin: OxdocPlugin = { name: "noop" };
    const project = makeProject();

    expect(() => runPlugins([plugin], project)).not.toThrow();
  });
});
