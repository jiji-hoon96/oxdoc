import { describe, it, expect } from "vitest";

describe("oxdoc setup", () => {
  it("프로젝트가 올바르게 설정되었는지 확인", () => {
    expect(true).toBe(true);
  });

  it("타입이 올바르게 export되는지 확인", async () => {
    const types = await import("../src/types/index.js");
    expect(types).toBeDefined();
  });
});
