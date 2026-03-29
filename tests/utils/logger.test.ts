import { describe, it, expect, vi } from "vitest";
import { logger } from "../../src/lib/utils/logger.js";

describe("logger", () => {
  it("info 메시지를 출력한다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test info");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toBe("test info");
    spy.mockRestore();
  });

  it("success 메시지를 출력한다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.success("done");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("warn 메시지를 출력한다", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.warn("warning");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("error 메시지를 출력한다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("err");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
