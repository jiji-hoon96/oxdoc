import { describe, it, expect } from "vitest";
import { generateJSON } from "../../src/lib/generator/json.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

describe("generateJSON", () => {
  it("프로젝트 문서를 JSON으로 변환한다", () => {
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
                description: "더하기",
                tags: [{ tag: "param", name: "a", type: "number", description: "첫 번째", optional: false }],
                range: { start: 0, end: 10 },
              },
              signature: "function add(a: number, b: number): number",
              exported: true,
              location: { file: "math.ts", line: 1, column: 1 },
            },
          ],
        },
      ],
      metadata: { generatedAt: "2026-03-28", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const json = generateJSON(project);
    const parsed = JSON.parse(json);

    expect(parsed.files).toHaveLength(1);
    expect(parsed.files[0].symbols[0].name).toBe("add");
    expect(parsed.metadata.version).toBe("0.1.0");
  });

  it("빈 프로젝트를 처리한다", () => {
    const project: ProjectDocumentation = {
      files: [],
      metadata: { generatedAt: "2026-03-28", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const json = generateJSON(project);
    const parsed = JSON.parse(json);
    expect(parsed.files).toHaveLength(0);
  });
});
