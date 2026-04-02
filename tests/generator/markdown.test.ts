import { describe, it, expect } from "vitest";
import { generateMarkdown } from "../../src/lib/generator/markdown.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

describe("generateMarkdown", () => {
  it("프로젝트 문서를 Markdown으로 변환한다", () => {
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
          ],
        },
      ],
      metadata: { generatedAt: "2026-03-28", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const md = generateMarkdown(project);

    expect(md).toContain("# API Documentation");
    expect(md).toContain("## math.ts");
    expect(md).toContain("두 숫자를 더합니다.");
    expect(md).toContain("**Parameters:**");
    expect(md).toContain("| a | `number` | 첫 번째 |");
    expect(md).toContain("**Returns:**");
  });

  it("심볼이 없는 파일은 건너뛴다", () => {
    const project: ProjectDocumentation = {
      files: [
        { filePath: "empty.ts", fileDoc: null, symbols: [] },
        {
          filePath: "has-symbols.ts",
          fileDoc: null,
          symbols: [
            {
              name: "foo",
              kind: "function",
              doc: null,
              signature: "function foo()",
              exported: true,
              location: { file: "has-symbols.ts", line: 1, column: 1 },
            },
          ],
        },
      ],
      metadata: { generatedAt: "2026-03-28", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const md = generateMarkdown(project);
    expect(md).not.toContain("## empty.ts");
    expect(md).toContain("## has-symbols.ts");
  });

  it("클래스의 children을 렌더링한다", () => {
    const project: ProjectDocumentation = {
      files: [
        {
          filePath: "calc.ts",
          fileDoc: null,
          symbols: [
            {
              name: "Calculator",
              kind: "class",
              doc: { description: "계산기", tags: [], range: { start: 0, end: 10 } },
              signature: "class Calculator",
              exported: true,
              location: { file: "calc.ts", line: 1, column: 1 },
              children: [
                {
                  name: "add",
                  kind: "method",
                  doc: { description: "더하기 메서드", tags: [], range: { start: 20, end: 30 } },
                  signature: "add(value: number): void",
                  exported: false,
                  location: { file: "calc.ts", line: 5, column: 3 },
                },
              ],
            },
          ],
        },
      ],
      metadata: { generatedAt: "2026-03-28", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };

    const md = generateMarkdown(project);
    expect(md).toContain("계산기");
    expect(md).toContain("더하기 메서드");
  });

  it("fileDoc description을 렌더링한다", () => {
    const project: ProjectDocumentation = {
      files: [{
        filePath: "utils.ts",
        fileDoc: { description: "유틸리티 모듈", tags: [], range: { start: 0, end: 10 } },
        symbols: [{
          name: "helper", kind: "function", doc: null,
          signature: "function helper()", exported: true,
          location: { file: "utils.ts", line: 1, column: 1 },
        }],
      }],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };
    const md = generateMarkdown(project);
    expect(md).toContain("유틸리티 모듈");
  });

  it("internal(비export) 심볼 섹션을 렌더링한다", () => {
    const project: ProjectDocumentation = {
      files: [{
        filePath: "lib.ts",
        fileDoc: null,
        symbols: [
          { name: "publicFn", kind: "function", doc: null, signature: "function publicFn()", exported: true, location: { file: "lib.ts", line: 1, column: 1 } },
          { name: "privateFn", kind: "function", doc: null, signature: "function privateFn()", exported: false, location: { file: "lib.ts", line: 5, column: 1 } },
        ],
      }],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };
    const md = generateMarkdown(project);
    expect(md).toContain("### Internal");
    expect(md).toContain("privateFn");
  });

  it("@example을 코드 블록으로 렌더링한다", () => {
    const project: ProjectDocumentation = {
      files: [{
        filePath: "math.ts",
        fileDoc: null,
        symbols: [{
          name: "add", kind: "function",
          doc: {
            description: "더하기", tags: [
              { tag: "example", name: "", type: "", description: "add(1, 2)", optional: false },
            ], range: { start: 0, end: 10 },
          },
          signature: "function add()", exported: true,
          location: { file: "math.ts", line: 1, column: 1 },
        }],
      }],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };
    const md = generateMarkdown(project);
    expect(md).toContain("**Example:**");
    expect(md).toContain("```ts");
    expect(md).toContain("add(1, 2)");
  });

  it("이미 코드 펜스로 감싸진 example은 그대로 유지한다", () => {
    const project: ProjectDocumentation = {
      files: [{
        filePath: "math.ts",
        fileDoc: null,
        symbols: [{
          name: "add", kind: "function",
          doc: {
            description: "더하기", tags: [
              { tag: "example", name: "", type: "", description: "```ts\nadd(1, 2)\n```", optional: false },
            ], range: { start: 0, end: 10 },
          },
          signature: "function add()", exported: true,
          location: { file: "math.ts", line: 1, column: 1 },
        }],
      }],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: "/src", errors: [] },
    };
    const md = generateMarkdown(project);
    expect(md).toContain("```ts\nadd(1, 2)\n```");
  });
});
