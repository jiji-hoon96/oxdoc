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

  it("getter/setter를 구분한다", () => {
    const result = parseSource(
      `export class Config {
  /** 이름 getter */
  get name(): string { return ""; }
  /** 이름 setter */
  set name(v: string) {}
  /** 일반 메서드 */
  reset(): void {}
}`,
      "test.ts",
    );

    const cls = result.symbols[0];
    expect(cls.children).toHaveLength(3);
    expect(cls.children![0].kind).toBe("getter");
    expect(cls.children![0].doc!.description).toBe("이름 getter");
    expect(cls.children![1].kind).toBe("setter");
    expect(cls.children![2].kind).toBe("method");
  });

  it("static 멤버를 구분한다", () => {
    const result = parseSource(
      `export class Utils {
  static VERSION = "1.0";
  static create(): Utils { return new Utils(); }
  instance(): void {}
}`,
      "test.ts",
    );

    const cls = result.symbols[0];
    expect(cls.children).toHaveLength(3);
    expect(cls.children![0].name).toBe("VERSION");
    expect(cls.children![0].isStatic).toBe(true);
    expect(cls.children![1].name).toBe("create");
    expect(cls.children![1].isStatic).toBe(true);
    expect(cls.children![2].name).toBe("instance");
    expect(cls.children![2].isStatic).toBeUndefined();
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

  it("열거형 멤버를 children으로 추출한다", () => {
    const result = parseSource(
      `export enum Direction {
  /** Up direction */
  Up = 'UP',
  /** Down direction */
  Down = 'DOWN',
  Left,
  Right = 3
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const enumSym = result.symbols[0];
    expect(enumSym.kind).toBe("enum");
    expect(enumSym.children).toHaveLength(4);
    expect(enumSym.children![0].name).toBe("Up");
    expect(enumSym.children![0].kind).toBe("enum-member");
    expect(enumSym.children![0].doc!.description).toBe("Up direction");
    expect(enumSym.children![0].defaultValue).toBe("'UP'");
    expect(enumSym.children![1].name).toBe("Down");
    expect(enumSym.children![1].defaultValue).toBe("'DOWN'");
    expect(enumSym.children![2].name).toBe("Left");
    expect(enumSym.children![2].defaultValue).toBeUndefined();
    expect(enumSym.children![3].defaultValue).toBe("3");
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

  it("default export를 추출한다", () => {
    const result = parseSource(
      `/** 기본 함수 */
export default function main(): void {}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("main");
    expect(result.symbols[0].exported).toBe(true);
    expect(result.symbols[0].isDefault).toBe(true);
  });

  it("named re-export를 추출한다", () => {
    const result = parseSource(
      `export { Foo, Bar as Baz } from './module';`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(2);
    expect(result.symbols[0].name).toBe("Foo");
    expect(result.symbols[0].signature).toBe("export { Foo } from './module'");
    expect(result.symbols[0].exported).toBe(true);
    expect(result.symbols[1].name).toBe("Baz");
    expect(result.symbols[1].signature).toBe("export { Bar as Baz } from './module'");
  });

  it("namespace를 추출한다", () => {
    const result = parseSource(
      `/** 유틸리티 네임스페이스 */
export namespace Utils {
  /** 헬퍼 함수 */
  export function helper(): void {}
  export const VERSION = "1.0";
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const ns = result.symbols[0];
    expect(ns.name).toBe("Utils");
    expect(ns.kind).toBe("namespace");
    expect(ns.doc!.description).toBe("유틸리티 네임스페이스");
    expect(ns.children).toHaveLength(2);
    expect(ns.children![0].name).toBe("helper");
    expect(ns.children![0].kind).toBe("function");
    expect(ns.children![0].exported).toBe(true);
    expect(ns.children![1].name).toBe("VERSION");
  });

  it("함수 오버로드를 병합한다", () => {
    const result = parseSource(
      `/** 인사 함수 */
export function greet(name: string): string;
export function greet(name: string, age: number): string;
export function greet(name: string, age?: number): string {
  return age ? name + age : name;
}`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    const fn = result.symbols[0];
    expect(fn.name).toBe("greet");
    expect(fn.kind).toBe("function");
    expect(fn.overloads).toHaveLength(2);
    expect(fn.overloads![0]).toContain("greet(name: string): string");
    expect(fn.overloads![1]).toContain("greet(name: string, age: number): string");
    expect(fn.doc!.description).toBe("인사 함수");
  });

  it("star re-export를 추출한다", () => {
    const result = parseSource(
      `export * from './utils';`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("*");
    expect(result.symbols[0].signature).toBe("export * from './utils'");
  });

  it("익명 default export를 추출한다", () => {
    const result = parseSource(
      `export default { a: 1, b: 2 };`,
      "test.ts",
    );

    expect(result.symbols).toHaveLength(1);
    expect(result.symbols[0].name).toBe("default");
    expect(result.symbols[0].kind).toBe("variable");
    expect(result.symbols[0].isDefault).toBe(true);
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
