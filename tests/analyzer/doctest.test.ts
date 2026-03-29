import { describe, it, expect } from "vitest";
import { extractDocTests } from "../../src/lib/analyzer/doctest.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

function makeProjectWithExample(
  symbolName: string,
  exampleDescription: string,
): ProjectDocumentation {
  return {
    files: [
      {
        filePath: "math.ts",
        fileDoc: null,
        symbols: [
          {
            name: symbolName,
            kind: "function",
            doc: {
              description: "test function",
              tags: [
                {
                  tag: "example",
                  name: "",
                  type: "",
                  description: exampleDescription,
                  optional: false,
                },
              ],
              range: { start: 0, end: 10 },
            },
            signature: `function ${symbolName}()`,
            exported: true,
            location: { file: "math.ts", line: 5, column: 1 },
          },
        ],
      },
    ],
    metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
  };
}

describe("extractDocTests", () => {
  it("코드 펜스가 있는 @example을 추출한다", () => {
    const project = makeProjectWithExample(
      "add",
      "```ts\nadd(1, 2) // => 3\n```",
    );

    const tests = extractDocTests(project);
    expect(tests).toHaveLength(1);
    expect(tests[0].symbolName).toBe("add");
    expect(tests[0].code).toBe("add(1, 2) // => 3");
    expect(tests[0].assertions).toHaveLength(1);
    expect(tests[0].assertions[0]).toEqual({
      expression: "add(1, 2)",
      expected: "3",
    });
  });

  it("여러 assertion을 파싱한다", () => {
    const project = makeProjectWithExample(
      "add",
      "```ts\nadd(1, 2) // => 3\nadd(-1, 1) // => 0\n```",
    );

    const tests = extractDocTests(project);
    expect(tests[0].assertions).toHaveLength(2);
  });

  it("assertion이 없는 예제도 추출한다", () => {
    const project = makeProjectWithExample(
      "greet",
      "```ts\nconst msg = greet('world');\nconsole.log(msg);\n```",
    );

    const tests = extractDocTests(project);
    expect(tests).toHaveLength(1);
    expect(tests[0].assertions).toHaveLength(0);
    expect(tests[0].code).toContain("greet('world')");
  });

  it("코드 블록이 없으면 직접 코드로 처리한다", () => {
    const project = makeProjectWithExample("add", "add(1, 2) // => 3");

    const tests = extractDocTests(project);
    expect(tests).toHaveLength(1);
    expect(tests[0].code).toBe("add(1, 2) // => 3");
  });

  it("@example이 없는 심볼은 건너뛴다", () => {
    const project: ProjectDocumentation = {
      files: [
        {
          filePath: "test.ts",
          fileDoc: null,
          symbols: [
            {
              name: "foo",
              kind: "function",
              doc: { description: "no example", tags: [], range: { start: 0, end: 10 } },
              signature: "function foo()",
              exported: true,
              location: { file: "test.ts", line: 1, column: 1 },
            },
          ],
        },
      ],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const tests = extractDocTests(project);
    expect(tests).toHaveLength(0);
  });

  it("doc이 null인 심볼은 건너뛴다", () => {
    const project: ProjectDocumentation = {
      files: [
        {
          filePath: "test.ts",
          fileDoc: null,
          symbols: [
            {
              name: "bar",
              kind: "function",
              doc: null,
              signature: "function bar()",
              exported: true,
              location: { file: "test.ts", line: 1, column: 1 },
            },
          ],
        },
      ],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const tests = extractDocTests(project);
    expect(tests).toHaveLength(0);
  });
});
