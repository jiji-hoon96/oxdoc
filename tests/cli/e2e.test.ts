import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { resolve, join } from "node:path";
import { existsSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const CLI = resolve(__dirname, "../../dist/cli/index.js");
const FIXTURES = resolve(__dirname, "../fixtures");

function run(args: string, options?: { cwd?: string }): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI} ${args}`, {
      cwd: options?.cwd ?? process.cwd(),
      timeout: 30000,
      stdio: "pipe",
      encoding: "utf-8",
    });
    return { stdout, exitCode: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: (e.stdout ?? "") + (e.stderr ?? ""),
      exitCode: e.status ?? 1,
    };
  }
}

describe("CLI E2E", () => {
  // ─── generate ───

  describe("generate", () => {
    const outDir = resolve(__dirname, "../../.test-output");

    it("JSON 포맷으로 문서를 생성한다", () => {
      if (existsSync(outDir)) rmSync(outDir, { recursive: true });
      const result = run(`generate --format json --output ${outDir} ${FIXTURES}`);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(outDir, "api.json"))).toBe(true);

      const json = JSON.parse(readFileSync(join(outDir, "api.json"), "utf-8"));
      expect(json.files.length).toBeGreaterThan(0);
      expect(json.metadata.version).toBe("0.1.0");
      rmSync(outDir, { recursive: true });
    });

    it("Markdown 포맷으로 문서를 생성한다", () => {
      if (existsSync(outDir)) rmSync(outDir, { recursive: true });
      const result = run(`generate --format markdown --output ${outDir} ${FIXTURES}`);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(outDir, "api.md"))).toBe(true);

      const md = readFileSync(join(outDir, "api.md"), "utf-8");
      expect(md).toContain("# API Documentation");
      rmSync(outDir, { recursive: true });
    });

    it("HTML 포맷으로 문서를 생성한다", () => {
      if (existsSync(outDir)) rmSync(outDir, { recursive: true });
      const result = run(`generate --format html --output ${outDir} ${FIXTURES}`);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(outDir, "index.html"))).toBe(true);

      const html = readFileSync(join(outDir, "index.html"), "utf-8");
      expect(html).toContain("<!DOCTYPE html>");
      rmSync(outDir, { recursive: true });
    });
  });

  // ─── coverage ───

  describe("coverage", () => {
    it("커버리지를 출력한다", () => {
      const result = run(`coverage ${FIXTURES}`);
      // 문서화 비율에 따라 통과 또는 실패하지만, 실행은 됨
      expect(result.stdout).toMatch(/coverage|documented/i);
    });

    it("--format json으로 JSON 결과를 출력한다", () => {
      const result = run(`coverage --format json ${FIXTURES}`);
      expect(result.stdout).toContain("{");
      expect(result.stdout).toContain("totalSymbols");
    });

    it("--threshold 0으로 항상 통과한다", () => {
      const result = run(`coverage --threshold 0 ${FIXTURES}`);
      expect(result.exitCode).toBe(0);
    });
  });

  // ─── doctest ───

  describe("doctest", () => {
    it("@example 블록을 실행한다", () => {
      const result = run(`doctest ${FIXTURES}`);
      // doctest-target.ts의 add 함수가 포함됨
      expect(result.stdout).toMatch(/add|passed|failed|skipped/i);
    });

    it("--reporter json으로 JSON 결과를 출력한다", () => {
      const result = run(`doctest --reporter json ${FIXTURES}`);
      expect(result.stdout).toContain("passed");
      expect(result.stdout).toContain("total");
    });
  });

  // ─── diff ───

  describe("diff", () => {
    const snapshotDir = resolve(__dirname, "../../.test-output");
    const snapshotFile = join(snapshotDir, "snapshot.json");

    it("스냅샷 대비 API 변경을 감지한다", () => {
      // 먼저 스냅샷 생성
      mkdirSync(snapshotDir, { recursive: true });
      const genResult = run(`generate --format json --output ${snapshotDir} ${FIXTURES}`);
      expect(genResult.exitCode).toBe(0);

      // 스냅샷 파일명 변경
      const apiJson = join(snapshotDir, "api.json");
      if (existsSync(apiJson)) {
        const content = readFileSync(apiJson, "utf-8");
        writeFileSync(snapshotFile, content);
      }

      // diff 실행 (같은 소스 vs 같은 스냅샷 → 변경 없음)
      const diffResult = run(`diff ${snapshotFile} ${FIXTURES}`);
      expect(diffResult.exitCode).toBe(0);
      expect(diffResult.stdout).toMatch(/no.*change|0.*breaking/i);

      rmSync(snapshotDir, { recursive: true });
    });
  });

  // ─── --help / --version ───

  describe("기본 옵션", () => {
    it("--help를 표시한다", () => {
      const result = run("--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("generate");
      expect(result.stdout).toContain("coverage");
      expect(result.stdout).toContain("doctest");
      expect(result.stdout).toContain("diff");
    });

    it("--version을 표시한다", () => {
      const result = run("--version");
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe("0.1.0");
    });
  });
});
