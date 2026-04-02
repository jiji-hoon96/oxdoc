import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { _testing, extractDocTests, runDocTests } from "../../src/lib/analyzer/doctest.js";
import { parseFile } from "../../src/lib/parser/index.js";
import type { DocTest, ProjectDocumentation } from "../../src/types/index.js";

const {
  extractCodeBlock,
  cleanCodeBlock,
  cleanExpectedValue,
  isValidExpectedValue,
  parseAssertions,
  detectNamespaceAlias,
  shouldSkipExample,
  isPseudoCodeError,
  isNondeterministicExample,
  generateTestCode,
  isUnclosedBracket,
  collectMultiLineExpected,
} = _testing;

// ─── extractCodeBlock ───

describe("extractCodeBlock", () => {
  it("코드 펜스에서 코드를 추출한다", () => {
    expect(extractCodeBlock("```ts\nadd(1, 2)\n```")).toBe("add(1, 2)");
  });

  it("js/javascript/typescript 언어도 지원한다", () => {
    expect(extractCodeBlock("```javascript\nfoo()\n```")).toBe("foo()");
    expect(extractCodeBlock("```js\nbar()\n```")).toBe("bar()");
  });

  it("언어 지정 없는 펜스를 처리한다", () => {
    expect(extractCodeBlock("```\ncode()\n```")).toBe("code()");
  });

  it("펜스 없는 코드를 그대로 반환한다", () => {
    expect(extractCodeBlock("add(1, 2) // => 3")).toBe("add(1, 2) // => 3");
  });

  it("빈 문자열은 null 반환", () => {
    expect(extractCodeBlock("")).toBeNull();
    expect(extractCodeBlock("   ")).toBeNull();
  });

  it("닫히지 않은 코드 펜스의 잔여 ```를 정리한다", () => {
    const result = extractCodeBlock("code here\n```");
    expect(result).toBe("code here");
  });
});

// ─── cleanCodeBlock ───

describe("cleanCodeBlock", () => {
  it("// => 패턴은 건드리지 않는다", () => {
    expect(cleanCodeBlock("foo() // => 3")).toBe("foo() // => 3");
  });

  it("`; => value` 패턴에서 bare => 를 제거한다", () => {
    expect(cleanCodeBlock("foo(); => 'bar'")).toBe("foo();");
  });

  it("정상 화살표 함수를 보존한다", () => {
    const code = "const fn = () => 'a'";
    expect(cleanCodeBlock(code)).toBe(code);
  });

  it("여러 줄을 올바르게 처리한다", () => {
    const input = "a(); => 1\nb() // => 2\nconst c = () => 3";
    const result = cleanCodeBlock(input);
    expect(result).toContain("a();");
    expect(result).toContain("b() // => 2");
    expect(result).toContain("const c = () => 3");
  });
});

// ─── cleanExpectedValue ───

describe("cleanExpectedValue", () => {
  it("괄호 주석을 제거한다", () => {
    expect(cleanExpectedValue("true (Object.is handles NaN)")).toBe("true");
  });

  it("괄호가 없으면 그대로 반환한다", () => {
    expect(cleanExpectedValue("42")).toBe("42");
    expect(cleanExpectedValue("[1, 2, 3]")).toBe("[1, 2, 3]");
  });

  it("빈 문자열은 원본 반환", () => {
    expect(cleanExpectedValue("")).toBe("");
  });
});

// ─── isValidExpectedValue ───

describe("isValidExpectedValue", () => {
  it("리터럴을 유효하다고 판단한다", () => {
    expect(isValidExpectedValue("true")).toBe(true);
    expect(isValidExpectedValue("false")).toBe(true);
    expect(isValidExpectedValue("null")).toBe(true);
    expect(isValidExpectedValue("undefined")).toBe(true);
    expect(isValidExpectedValue("NaN")).toBe(true);
    expect(isValidExpectedValue("42")).toBe(true);
    expect(isValidExpectedValue("-3.14")).toBe(true);
    expect(isValidExpectedValue("6n")).toBe(true);
    expect(isValidExpectedValue("'hello'")).toBe(true);
    expect(isValidExpectedValue('"world"')).toBe(true);
  });

  it("배열/객체를 유효하다고 판단한다", () => {
    expect(isValidExpectedValue("[1, 2, 3]")).toBe(true);
    expect(isValidExpectedValue("{ a: 1 }")).toBe(true);
  });

  it("bare identifier 배열을 유효하지 않다고 판단한다", () => {
    expect(isValidExpectedValue("[Bass, Trout, Marlin]")).toBe(false);
  });

  it("텍스트 설명을 유효하지 않다고 판단한다", () => {
    expect(isValidExpectedValue("logs 'sup'")).toBe(false);
    expect(isValidExpectedValue("no logs")).toBe(false);
    expect(isValidExpectedValue("Calls the function")).toBe(false);
  });

  it("함수 호출을 유효하다고 판단한다", () => {
    expect(isValidExpectedValue("new Date()")).toBe(true);
    expect(isValidExpectedValue("foo()")).toBe(true);
  });
});

// ─── isUnclosedBracket ───

describe("isUnclosedBracket", () => {
  it("닫히지 않은 bracket을 감지한다", () => {
    expect(isUnclosedBracket("[")).toBe(true);
    expect(isUnclosedBracket("{")).toBe(true);
    expect(isUnclosedBracket("[1, {")).toBe(true);
  });

  it("닫힌 bracket은 false", () => {
    expect(isUnclosedBracket("[]")).toBe(false);
    expect(isUnclosedBracket("[1, 2]")).toBe(false);
    expect(isUnclosedBracket("{ a: 1 }")).toBe(false);
  });
});

// ─── collectMultiLineExpected ───

describe("collectMultiLineExpected", () => {
  it("주석 줄을 합쳐서 완성된 값을 반환한다", () => {
    const lines = [
      "//   { a: 1 },",
      "//   { b: 2 }",
      "// ]",
      "next line",
    ];
    const result = collectMultiLineExpected(lines, 0, "[");
    expect(result).toContain("{ a: 1 }");
    expect(result).toContain("]");
  });

  it("주석이 아닌 줄에서 중단한다", () => {
    const lines = ["code line", "//   more"];
    const result = collectMultiLineExpected(lines, 0, "[");
    expect(result).toBe("[");
  });
});

// ─── parseAssertions ───

describe("parseAssertions", () => {
  it("inline assertion을 파싱한다", () => {
    const result = parseAssertions("add(1, 2) // => 3");
    expect(result).toHaveLength(1);
    expect(result[0].expression).toBe("add(1, 2)");
    expect(result[0].expected).toBe("3");
  });

  it("next-line assertion을 파싱한다", () => {
    const result = parseAssertions("add(1, 2)\n// => 3");
    expect(result).toHaveLength(1);
    expect(result[0].expression).toBe("add(1, 2)");
    expect(result[0].expected).toBe("3");
  });

  it("변수 선언에서 expression을 추출한다", () => {
    const result = parseAssertions("const x = foo() // => 5");
    expect(result[0].expression).toBe("foo()");
  });

  it("console.log assertion을 skip한다", () => {
    const result = parseAssertions("console.log(x) // => 3");
    expect(result).toHaveLength(0);
  });

  it("불완전한 expression을 skip한다", () => {
    const result = parseAssertions(") // => 3");
    expect(result).toHaveLength(0);
  });

  it("텍스트 설명 expected를 skip한다", () => {
    const result = parseAssertions("foo() // => logs something");
    expect(result).toHaveLength(0);
  });

  it("괄호 주석을 정리한다", () => {
    const result = parseAssertions("foo() // => true (some note)");
    expect(result[0].expected).toBe("true");
  });

  it("multi-line expected를 수집한다", () => {
    const code = "listify(a)\n// => [\n//   { a: 1 },\n//   { b: 2 }\n// ]";
    const result = parseAssertions(code);
    expect(result).toHaveLength(1);
    expect(result[0].expected).toContain("[");
    expect(result[0].expected).toContain("]");
  });

  it("여러 assertion을 파싱한다", () => {
    const code = "a() // => 1\nb() // => 2\nc() // => 3";
    const result = parseAssertions(code);
    expect(result).toHaveLength(3);
  });

  it("세미콜론을 제거한다", () => {
    const result = parseAssertions("foo(); // => 5");
    expect(result[0].expression).toBe("foo()");
  });
});

// ─── detectNamespaceAlias ───

describe("detectNamespaceAlias", () => {
  it("언더스코어 네임스페이스를 감지한다", () => {
    expect(detectNamespaceAlias("_.map(arr, fn)")).toBe("_");
  });

  it("일반 함수 호출은 감지하지 않는다", () => {
    expect(detectNamespaceAlias("Array.from(x)")).toBeNull();
    expect(detectNamespaceAlias("foo(bar)")).toBeNull();
  });

  it("네임스페이스가 없으면 null", () => {
    expect(detectNamespaceAlias("add(1, 2)")).toBeNull();
  });
});

// ─── shouldSkipExample ───

describe("shouldSkipExample", () => {
  it("browser API를 skip한다", () => {
    expect(shouldSkipExample("document.querySelector('div')")).toBe(true);
    expect(shouldSkipExample("window.location")).toBe(true);
    expect(shouldSkipExample("localStorage.getItem('key')")).toBe(true);
  });

  it("throw 패턴을 skip한다", () => {
    expect(shouldSkipExample("// will throw an error")).toBe(true);
    expect(shouldSkipExample("// should throw")).toBe(true);
    expect(shouldSkipExample("throw new Error('x')")).toBe(true);
  });

  it("일반 코드는 skip하지 않는다", () => {
    expect(shouldSkipExample("add(1, 2)")).toBe(false);
    expect(shouldSkipExample("const x = foo()")).toBe(false);
  });

  it("에러 기반 skip: BigInt 직렬화", () => {
    expect(shouldSkipExample("sum()", "TypeError: Do not know how to serialize a BigInt")).toBe(true);
  });

  it("에러 기반 skip: Timeout", () => {
    expect(shouldSkipExample("timeout()", "TimeoutError: Operation timed out")).toBe(true);
  });

  it("에러 기반 skip: fetch 실패", () => {
    expect(shouldSkipExample("getData()", "TypeError: fetch failed")).toBe(true);
  });

  it("에러 기반 skip: browser API not defined", () => {
    expect(shouldSkipExample("foo()", "ReferenceError: document is not defined")).toBe(true);
  });
});

// ─── isPseudoCodeError ───

describe("isPseudoCodeError", () => {
  it("명확한 의사코드 이름을 감지한다", () => {
    expect(isPseudoCodeError("myFunction()", "ReferenceError: myFunction is not defined")).toBe(true);
    expect(isPseudoCodeError("mockData()", "ReferenceError: mockData is not defined")).toBe(true);
    expect(isPseudoCodeError("fakeServer()", "ReferenceError: fakeServer is not defined")).toBe(true);
    expect(isPseudoCodeError("stubApi()", "ReferenceError: stubApi is not defined")).toBe(true);
    expect(isPseudoCodeError("dummyUser()", "ReferenceError: dummyUser is not defined")).toBe(true);
  });

  it("실제 함수 이름은 의사코드로 판단하지 않는다", () => {
    expect(isPseudoCodeError("fetchUsers()", "ReferenceError: fetchUsers is not defined")).toBe(false);
    expect(isPseudoCodeError("getUserById()", "ReferenceError: getUserById is not defined")).toBe(false);
    expect(isPseudoCodeError("createOrder()", "ReferenceError: createOrder is not defined")).toBe(false);
    expect(isPseudoCodeError("processItem()", "ReferenceError: processItem is not defined")).toBe(false);
  });

  it("테스트 프레임워크 함수를 감지한다", () => {
    expect(isPseudoCodeError("expect(x)", "ReferenceError: expect is not defined")).toBe(true);
    expect(isPseudoCodeError("assert(x)", "ReferenceError: assert is not defined")).toBe(true);
  });

  it("에러 형식이 맞지 않으면 false", () => {
    expect(isPseudoCodeError("code", "some other error")).toBe(false);
  });

  it("myFunction 스타일 PSEUDO_CODE_PATTERNS도 감지한다", () => {
    expect(isPseudoCodeError("myCallback(x)", "ReferenceError: someVar is not defined")).toBe(true);
  });
});

// ─── isNondeterministicExample ───

describe("isNondeterministicExample", () => {
  const makeTest = (code: string, assertions: DocTest["assertions"] = []): DocTest => ({
    symbolName: "test",
    filePath: "test.ts",
    line: 1,
    code,
    assertions,
  });

  it("Math.random + assertion이 있으면 skip", () => {
    expect(isNondeterministicExample(
      makeTest("Math.random()", [{ expression: "x", expected: "0.5" }]),
    )).toBe(true);
  });

  it("assertion이 없으면 skip하지 않음", () => {
    expect(isNondeterministicExample(makeTest("Math.random()"))).toBe(false);
  });

  it("Math.random 없으면 skip하지 않음", () => {
    expect(isNondeterministicExample(
      makeTest("shuffle(arr)", [{ expression: "x", expected: "[1]" }]),
    )).toBe(false);
  });
});

// ─── generateTestCode ───

describe("generateTestCode", () => {
  const makeTest = (
    code: string,
    assertions: DocTest["assertions"] = [],
    name = "add",
  ): DocTest => ({
    symbolName: name,
    filePath: "math.ts",
    line: 1,
    code,
    assertions,
  });

  it("assertion 없는 코드를 실행만 하는 코드를 생성한다", () => {
    const result = generateTestCode(makeTest("add(1, 2)"), "./math", null);
    expect(result).toContain('import { add } from "./math"');
    expect(result).toContain("add(1, 2)");
  });

  it("assertion 있는 코드를 검증 코드로 생성한다", () => {
    const result = generateTestCode(
      makeTest("add(1, 2) // => 3", [{ expression: "add(1, 2)", expected: "3" }]),
      "./math",
      null,
    );
    expect(result).toContain('import { add } from "./math"');
    expect(result).toContain("__deepEqual");
    expect(result).toContain("__result");
    expect(result).toContain("__expected");
  });

  it("const → var 변환을 적용한다", () => {
    const result = generateTestCode(makeTest("const x = add(1, 2)"), "./math", null);
    expect(result).toContain("var x = add(1, 2)");
    expect(result).not.toContain("const x");
  });

  it("await가 있으면 async IIFE로 감싼다", () => {
    const result = generateTestCode(makeTest("await add(1, 2)"), "./math", null);
    expect(result).toContain("(async () => {");
    expect(result).toContain("})()");
  });

  it("namespace alias를 감지하여 import * as _를 생성한다", () => {
    const result = generateTestCode(
      makeTest("_.add(1, 2)", [], "add"),
      "./math",
      "./index",
    );
    expect(result).toContain('import * as _ from "./index"');
  });
});

// ─── runDocTests 통합 테스트 ───

describe("runDocTests", () => {
  // tests/fixtures 를 sourceRoot로 사용
  const fixtureDir = resolve(__dirname, "../fixtures");

  it("실제 파일에서 doctest를 실행한다", () => {
    const fileDoc = parseFile(resolve(fixtureDir, "doctest-target.ts"));
    const project: ProjectDocumentation = {
      files: [fileDoc],
      metadata: { generatedAt: "", version: "0.1.0", sourceRoot: fixtureDir, errors: [] },
    };

    const tests = extractDocTests(project);
    expect(tests.length).toBeGreaterThan(0);

    const results = runDocTests(tests, fixtureDir);
    expect(results.length).toBe(tests.length);

    // add 함수: assertion 2개, 통과 또는 실행됨
    const addResult = results.find((r) => r.symbolName === "add");
    expect(addResult).toBeDefined();
    expect(addResult!.skipped).toBe(false);

    // greet은 console.log만 있으므로 skip
    const greetResult = results.find((r) => r.symbolName === "greet");
    expect(greetResult).toBeDefined();
    expect(greetResult!.skipped).toBe(true);

    // browserOnly는 browser API이므로 skip
    const browserResult = results.find((r) => r.symbolName === "browserOnly");
    expect(browserResult).toBeDefined();
    expect(browserResult!.skipped).toBe(true);
  }, 30000);

  it("빈 테스트 배열을 처리한다", () => {
    const results = runDocTests([], fixtureDir);
    expect(results).toHaveLength(0);
  });
});
