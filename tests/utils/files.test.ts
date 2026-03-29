import { describe, it, expect } from "vitest";
import { findSourceFiles } from "../../src/lib/utils/files.js";
import { resolve } from "node:path";

describe("findSourceFiles", () => {
  it("기본 패턴으로 TS 파일을 찾는다", async () => {
    const files = await findSourceFiles(resolve("tests/fixtures"));
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => /\.(ts|tsx|js|jsx)$/.test(f))).toBe(true);
  });

  it("커스텀 include 패턴을 적용한다", async () => {
    const files = await findSourceFiles(resolve("tests/fixtures"), {
      include: ["simple-function.ts"],
    });
    expect(files).toHaveLength(1);
    expect(files[0]).toContain("simple-function.ts");
  });

  it("exclude 패턴으로 파일을 제외한다", async () => {
    const files = await findSourceFiles(resolve("tests/fixtures"), {
      exclude: ["**/class-*"],
    });
    expect(files.every((f) => !f.includes("class-"))).toBe(true);
  });

  it("빈 디렉토리에서 빈 배열을 반환한다", async () => {
    const files = await findSourceFiles(resolve("tests/fixtures"), {
      include: ["**/*.nonexistent"],
    });
    expect(files).toHaveLength(0);
  });
});
