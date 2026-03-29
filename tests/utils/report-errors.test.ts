import { describe, it, expect, vi } from "vitest";
import { reportParseErrors } from "../../src/lib/utils/report-errors.js";

describe("reportParseErrors", () => {
  it("에러가 없으면 아무것도 출력하지 않는다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    reportParseErrors([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("에러가 있으면 경고를 출력한다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    reportParseErrors([
      { file: "broken.ts", message: "Unexpected token" },
      { file: "bad.ts", message: "Syntax error\nmore details" },
    ]);
    expect(spy).toHaveBeenCalled();
    // 첫 번째 호출: "2 file(s) failed to parse:"
    // 이후: 각 파일 경고
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
    spy.mockRestore();
  });

  it("멀티라인 에러 메시지에서 첫 줄만 표시한다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    reportParseErrors([
      { file: "test.ts", message: "Error line 1\nError line 2\nError line 3" },
    ]);
    const output = spy.mock.calls.map((c) => c.join(" ")).join(" ");
    expect(output).toContain("Error line 1");
    expect(output).not.toContain("Error line 2");
    spy.mockRestore();
  });
});
