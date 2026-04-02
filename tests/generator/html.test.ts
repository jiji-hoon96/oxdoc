import { describe, it, expect } from "vitest";
import { generateHTML } from "../../src/lib/generator/html.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

function createProject(
  overrides?: Partial<ProjectDocumentation>,
): ProjectDocumentation {
  return {
    files: [
      {
        filePath: "math.ts",
        fileDoc: null,
        symbols: [
          {
            name: "add",
            kind: "function",
            doc: {
              description: "두 수를 더한다",
              tags: [
                { tag: "param", name: "a", type: "number", description: "첫 번째 수", optional: false },
                { tag: "param", name: "b", type: "number", description: "두 번째 수", optional: false },
                { tag: "returns", name: "", type: "number", description: "합계", optional: false },
                {
                  tag: "example",
                  name: "",
                  type: "",
                  description: "```ts\nadd(1, 2) // => 3\n```",
                  optional: false,
                },
              ],
              range: { start: 0, end: 100 },
            },
            signature: "function add(a: number, b: number): number",
            exported: true,
            location: { file: "math.ts", line: 5, column: 1 },
          },
        ],
      },
    ],
    metadata: {
      generatedAt: "2026-03-31",
      version: "0.1.0",
      sourceRoot: "/src",
      errors: [],
    },
    ...overrides,
  };
}

describe("generateHTML", () => {
  it("유효한 HTML 문서를 생성한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
    expect(html).toContain("oxdoc");
  });

  it("심볼 이름과 시그니처를 포함한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("add");
    expect(html).toContain("function add(a: number, b: number): number");
  });

  it("JSDoc 설명을 렌더링한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("두 수를 더한다");
  });

  it("파라미터 테이블을 생성한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("Parameters");
    expect(html).toContain("첫 번째 수");
    expect(html).toContain("두 번째 수");
  });

  it("returns 정보를 렌더링한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("Returns");
    expect(html).toContain("합계");
  });

  it("@example 코드 블록을 렌더링한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("Example");
    expect(html).toContain("add(1, 2) // =&gt; 3");
  });

  it("사이드바 네비게이션을 생성한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("sidebar");
    expect(html).toContain("math.ts");
    expect(html).toContain("search");
  });

  it("빈 프로젝트를 처리한다", () => {
    const html = generateHTML(
      createProject({ files: [] }),
    );

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("0 symbols");
  });

  it("HTML 특수문자를 이스케이프한다", () => {
    const project = createProject();
    project.files[0].symbols[0].signature = "function get<T>(arr: T[]): T";
    const html = generateHTML(project);

    expect(html).toContain("&lt;T&gt;");
    expect(html).not.toContain("<T>");
  });

  it("kind badge를 표시한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("kind-badge");
    expect(html).toContain("function");
  });

  it("deprecated 태그를 렌더링한다", () => {
    const project = createProject();
    project.files[0].symbols[0].doc!.tags.push({
      tag: "deprecated",
      name: "",
      type: "",
      description: "Use subtract instead",
      optional: false,
    });
    const html = generateHTML(project);

    expect(html).toContain("Deprecated");
    expect(html).toContain("Use subtract instead");
  });

  it("since 태그를 렌더링한다", () => {
    const project = createProject();
    project.files[0].symbols[0].doc!.tags.push({
      tag: "since",
      name: "",
      type: "",
      description: "1.0.0",
      optional: false,
    });
    const html = generateHTML(project);

    expect(html).toContain("Since");
    expect(html).toContain("1.0.0");
  });

  it("children 멤버를 렌더링한다", () => {
    const project = createProject();
    project.files[0].symbols[0].children = [
      {
        name: "helper",
        kind: "method",
        doc: { description: "헬퍼 함수", tags: [], range: { start: 0, end: 10 } },
        signature: "helper(): void",
        exported: false,
        location: { file: "math.ts", line: 10, column: 1 },
      },
    ];
    const html = generateHTML(project);

    expect(html).toContain("Members");
    expect(html).toContain("helper(): void");
    expect(html).toContain("헬퍼 함수");
  });

  it("fileDoc description을 렌더링한다", () => {
    const project = createProject();
    project.files[0].fileDoc = {
      description: "수학 유틸리티 모듈",
      tags: [],
      range: { start: 0, end: 10 },
    };
    const html = generateHTML(project);

    expect(html).toContain("수학 유틸리티 모듈");
  });

  it("internal(비export) 심볼을 렌더링한다", () => {
    const project = createProject();
    project.files[0].symbols.push({
      name: "internalHelper",
      kind: "function",
      doc: { description: "내부 함수", tags: [], range: { start: 0, end: 10 } },
      signature: "function internalHelper()",
      exported: false,
      location: { file: "math.ts", line: 20, column: 1 },
    });
    const html = generateHTML(project);

    expect(html).toContain("Internal");
    expect(html).toContain("internalHelper");
  });

  it("repository URL로 소스 링크를 생성한다", () => {
    const project = createProject();
    const html = generateHTML(project, { repository: "https://github.com/user/repo" });

    expect(html).toContain("https://github.com/user/repo/blob/main/math.ts#L5");
  });

  it("메타데이터를 포함한다", () => {
    const html = generateHTML(createProject());

    expect(html).toContain("v0.1.0");
    expect(html).toContain("2026-03-31");
  });
});
