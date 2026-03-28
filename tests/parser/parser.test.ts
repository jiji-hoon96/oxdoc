import { describe, it, expect } from "vitest";
import { parseSource } from "../../src/lib/parser/index.js";

describe("parseSource", () => {
  it("export 함수를 추출한다", () => {
    const result = parseSource(
      `/**
 * 더하기 함수
 * @param a - 첫 번째
 * @param b - 두 번째
 * @returns 합
 */
export function add(a: number, b: number): number {
  return a + b;
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const sym = result.symbols[0];
    expect(sym.name).toBe("add");
    expect(sym.kind).toBe("function");
    expect(sym.exported).toBe(true);
    expect(sym.doc).not.toBeNull();
    expect(sym.doc!.description).toBe("더하기 함수");
    expect(sym.doc!.tags).toHaveLength(3);
  });

  it("JSDoc이 없는 함수를 doc: null로 처리한다", () => {
    const result = parseSource(
      `export function noDoc(x: number): number { return x; }`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].doc).toBeNull();
  });

  it("클래스와 메서드를 추출한다", () => {
    const result = parseSource(
      `/**
 * 계산기 클래스
 */
export class Calculator {
  /** 더하기 */
  add(a: number): void {}

  // JSDoc 없음
  reset(): void {}
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const cls = result.symbols[0];
    expect(cls.name).toBe("Calculator");
    expect(cls.kind).toBe("class");
    expect(cls.doc!.description).toBe("계산기 클래스");
    expect(cls.children).toHaveLength(2);
    expect(cls.children![0].name).toBe("add");
    expect(cls.children![0].kind).toBe("method");
    expect(cls.children![0].doc!.description).toBe("더하기");
    expect(cls.children![1].name).toBe("reset");
    expect(cls.children![1].doc).toBeNull();
  });

  it("인터페이스를 추출한다", () => {
    const result = parseSource(
      `/**
 * 사용자 인터페이스
 */
export interface User {
  /** 사용자 ID */
  id: string;
  /** 이름 */
  name: string;
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const iface = result.symbols[0];
    expect(iface.name).toBe("User");
    expect(iface.kind).toBe("interface");
    expect(iface.children).toHaveLength(2);
    expect(iface.children![0].doc!.description).toBe("사용자 ID");
  });

  it("타입 별칭을 추출한다", () => {
    const result = parseSource(
      `/** API 응답 타입 */
export type ApiResponse<T> = { data: T; status: number };`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("ApiResponse");
    expect(result.symbols[0].kind).toBe("type");
  });

  it("열거형을 추출한다", () => {
    const result = parseSource(
      `/** HTTP 메서드 */
export enum HttpMethod { GET, POST, PUT, DELETE }`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("HttpMethod");
    expect(result.symbols[0].kind).toBe("enum");
  });

  it("변수 선언을 추출한다", () => {
    const result = parseSource(
      `/** 최대값 */
export const MAX_VALUE = 100;`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("MAX_VALUE");
    expect(result.symbols[0].kind).toBe("variable");
    expect(result.symbols[0].exported).toBe(true);
  });

  it("export되지 않은 심볼을 exported: false로 처리한다", () => {
    const result = parseSource(
      `function internal(): void {}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].exported).toBe(false);
  });

  it("여러 심볼을 포함한 파일을 올바르게 파싱한다", () => {
    const result = parseSource(
      `/** 함수 A */
export function a(): void {}

/** 함수 B */
export function b(): void {}

export function c(): void {}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(3);
    expect(result.symbols[0].doc!.description).toBe("함수 A");
    expect(result.symbols[1].doc!.description).toBe("함수 B");
    expect(result.symbols[2].doc).toBeNull();
  });

  it("위치 정보를 올바르게 계산한다", () => {
    const result = parseSource(
      `export function hello(): void {}`,
      "test.ts",
    );

    expect(result.symbols[0].location).toMatchObject({
      file: "test.ts",
      line: 1,
    });
  });
});

describe("parseSource - fixture 파일 테스트", () => {
  it("simple-function.ts 픽스처를 파싱한다", async () => {
    const { parseFile } = await import("../../src/lib/parser/index.js");
    const result = parseFile("tests/fixtures/simple-function.ts");

    expect(result.symbols.length).toBeGreaterThanOrEqual(3);

    const add = result.symbols.find((s) => s.name === "add");
    expect(add).toBeDefined();
    expect(add!.doc).not.toBeNull();
    expect(add!.doc!.tags.some((t) => t.tag === "example")).toBe(true);

    const multiply = result.symbols.find((s) => s.name === "multiply");
    expect(multiply).toBeDefined();
    expect(multiply!.doc).toBeNull();
  });

  it("class-with-jsdoc.ts 픽스처를 파싱한다", async () => {
    const { parseFile } = await import("../../src/lib/parser/index.js");
    const result = parseFile("tests/fixtures/class-with-jsdoc.ts");

    const calculator = result.symbols.find((s) => s.name === "Calculator");
    expect(calculator).toBeDefined();
    expect(calculator!.kind).toBe("class");
    expect(calculator!.children!.length).toBeGreaterThanOrEqual(3);
  });

  it("no-docs.ts 픽스처: 모든 심볼이 doc: null이다", async () => {
    const { parseFile } = await import("../../src/lib/parser/index.js");
    const result = parseFile("tests/fixtures/no-docs.ts");

    expect(result.symbols.length).toBeGreaterThan(0);
    for (const sym of result.symbols) {
      expect(sym.doc).toBeNull();
    }
  });
});
