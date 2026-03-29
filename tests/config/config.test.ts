import { describe, it, expect } from "vitest";
import { loadConfig, mergeConfig, DEFAULT_CONFIG } from "../../src/lib/config/index.js";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("mergeConfig", () => {
  it("사용자 설정 없으면 기본값을 반환한다", () => {
    const result = mergeConfig(DEFAULT_CONFIG, {});
    expect(result.sourceRoot).toBe("./src");
    expect(result.output.format).toBe("json");
    expect(result.coverage.threshold).toBe(0);
  });

  it("사용자 설정으로 기본값을 오버라이드한다", () => {
    const result = mergeConfig(DEFAULT_CONFIG, {
      sourceRoot: "./lib",
      output: { format: "markdown" },
      coverage: { threshold: 80 },
    });
    expect(result.sourceRoot).toBe("./lib");
    expect(result.output.format).toBe("markdown");
    expect(result.output.dir).toBe("./docs-output"); // 기본값 유지
    expect(result.coverage.threshold).toBe(80);
    expect(result.coverage.exportedOnly).toBe(true); // 기본값 유지
  });

  it("부분 중첩 객체를 올바르게 병합한다", () => {
    const result = mergeConfig(DEFAULT_CONFIG, {
      coverage: { threshold: 50 },
    });
    expect(result.coverage.threshold).toBe(50);
    expect(result.coverage.exportedOnly).toBe(true);
  });
});

describe("loadConfig", () => {
  it("설정 파일이 없으면 기본값을 반환한다", async () => {
    const tmpDir = join(tmpdir(), `oxdoc-config-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    try {
      const config = await loadConfig(tmpDir);
      expect(config.sourceRoot).toBe("./src");
      expect(config.output.format).toBe("json");
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("oxdoc.config.json을 읽는다", async () => {
    const tmpDir = join(tmpdir(), `oxdoc-config-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    writeFileSync(
      join(tmpDir, "oxdoc.config.json"),
      JSON.stringify({
        sourceRoot: "./lib",
        output: { format: "markdown", dir: "./api" },
      }),
    );

    try {
      const config = await loadConfig(tmpDir);
      expect(config.sourceRoot).toBe("./lib");
      expect(config.output.format).toBe("markdown");
      expect(config.output.dir).toBe("./api");
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("package.json의 oxdoc 필드를 읽는다", async () => {
    const tmpDir = join(tmpdir(), `oxdoc-config-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({
        name: "test",
        oxdoc: { coverage: { threshold: 90 } },
      }),
    );

    try {
      const config = await loadConfig(tmpDir);
      expect(config.coverage.threshold).toBe(90);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
