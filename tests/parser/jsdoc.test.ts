import { describe, it, expect } from "vitest";
import { parseJSDoc, isJSDocComment } from "../../src/lib/parser/jsdoc.js";

// OXC의 comment.value는 /* 와 */ 사이의 내용이다.
// /** 두 숫자를 더합니다. */ → value: "* 두 숫자를 더합니다. "
// /**\n * 설명\n */ → value: "*\n * 설명\n "

describe("parseJSDoc", () => {
  it("한 줄 설명문을 파싱한다", () => {
    const result = parseJSDoc(
      "* 두 숫자를 더합니다. ",
      { start: 0, end: 25 },
    );
    expect(result.description).toBe("두 숫자를 더합니다.");
    expect(result.tags).toHaveLength(0);
  });

  it("여러 줄 설명문을 파싱한다", () => {
    const result = parseJSDoc(
      "*\n * 두 숫자를 더합니다.\n ",
      { start: 0, end: 30 },
    );
    expect(result.description).toBe("두 숫자를 더합니다.");
  });

  it("@param 태그를 파싱한다", () => {
    const result = parseJSDoc(
      "*\n * @param a - 첫 번째 숫자\n * @param b - 두 번째 숫자\n ",
      { start: 0, end: 60 },
    );
    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toMatchObject({
      tag: "param",
      name: "a",
      description: "첫 번째 숫자",
    });
    expect(result.tags[1]).toMatchObject({
      tag: "param",
      name: "b",
      description: "두 번째 숫자",
    });
  });

  it("@returns 태그를 파싱한다", () => {
    const result = parseJSDoc(
      "*\n * @returns 두 숫자의 합\n ",
      { start: 0, end: 30 },
    );
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0]).toMatchObject({
      tag: "returns",
      description: "두 숫자의 합",
    });
  });

  it("@example 태그를 파싱한다", () => {
    const result = parseJSDoc(
      "*\n * @example\n * ```ts\n * add(1, 2) // 3\n * ```\n ",
      { start: 0, end: 50 },
    );
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].tag).toBe("example");
  });

  it("설명문과 여러 태그를 함께 파싱한다", () => {
    const result = parseJSDoc(
      "*\n * 함수 설명\n * @param x - 입력값\n * @returns 결과값\n ",
      { start: 0, end: 50 },
    );
    expect(result.description).toBe("함수 설명");
    expect(result.tags).toHaveLength(2);
  });

  it("빈 JSDoc을 처리한다", () => {
    const result = parseJSDoc("* ", { start: 0, end: 4 });
    expect(result.description).toBe("");
    expect(result.tags).toHaveLength(0);
  });

  it("range 정보를 보존한다", () => {
    const result = parseJSDoc("* test ", { start: 10, end: 20 });
    expect(result.range).toEqual({ start: 10, end: 20 });
  });
});

describe("isJSDocComment", () => {
  it("JSDoc 주석을 식별한다", () => {
    expect(isJSDocComment("* description")).toBe(true);
    expect(isJSDocComment("*\n * @param x")).toBe(true);
  });

  it("일반 블록 주석을 거부한다", () => {
    expect(isJSDocComment(" normal comment")).toBe(false);
    expect(isJSDocComment("")).toBe(false);
  });
});
