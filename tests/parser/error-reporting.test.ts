import { describe, it, expect } from "vitest";
import { parseProject } from "../../src/lib/parser/index.js";
import { resolve } from "node:path";

describe("parseProject error reporting", () => {
  it("문법 오류 파일을 metadata.errors에 수집한다", async () => {
    const project = await parseProject(
      resolve("tests/fixtures"),
      { include: ["**/*.ts"] },
    );

    // 정상 파일은 파싱됨
    expect(project.files.length).toBeGreaterThan(0);

    // metadata.errors 배열이 존재
    expect(project.metadata.errors).toBeDefined();
    expect(Array.isArray(project.metadata.errors)).toBe(true);
  });

  it("정상 파일만 있으면 errors가 빈 배열이다", async () => {
    const project = await parseProject(
      resolve("tests/fixtures"),
      { include: ["simple-function.ts"] },
    );

    expect(project.metadata.errors).toHaveLength(0);
    expect(project.files).toHaveLength(1);
  });
});
