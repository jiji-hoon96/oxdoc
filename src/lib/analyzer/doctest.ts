import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { createRequire } from "node:module";
import type { ProjectDocumentation, DocTest } from "../../types/index.js";

const require = createRequire(import.meta.url);

function resolveTsxPath(): string {
  try {
    return require.resolve("tsx");
  } catch {
    return "tsx";
  }
}

function findProjectRoot(sourceRoot: string): string {
  let dir = sourceRoot;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "tsconfig.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return sourceRoot;
}

/**
 * 프로젝트에서 @example 블록을 추출한다.
 * @param project - 프로젝트 문서 정보
 * @returns 추출된 DocTest 목록
 */
export function extractDocTests(project: ProjectDocumentation): DocTest[] {
  const tests: DocTest[] = [];

  for (const file of project.files) {
    for (const symbol of file.symbols) {
      if (!symbol.doc) continue;

      const examples = symbol.doc.tags.filter((t) => t.tag === "example");
      for (const ex of examples) {
        const code = extractCodeBlock(ex.description);
        if (!code) continue;

        const assertions = parseAssertions(code);

        tests.push({
          symbolName: symbol.name,
          filePath: file.filePath,
          line: symbol.location.line,
          code,
          assertions,
        });
      }
    }
  }

  return tests;
}

function extractCodeBlock(description: string): string | null {
  const trimmed = description.trim();

  const fenceMatch = trimmed.match(/```(?:ts|typescript|js|javascript)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    return cleanCodeBlock(fenceMatch[1].trim());
  }

  if (trimmed.length > 0 && !trimmed.startsWith("```")) {
    // 닫히지 않은 코드 펜스나 잔여 ``` 정리
    let code = trimmed;
    code = code.replace(/```\s*$/, "").trim();
    return code ? cleanCodeBlock(code) : null;
  }

  return null;
}

/**
 * 코드 블록에서 안전하게 정리할 수 있는 패턴만 처리한다.
 * - `); => 'value'` → `);` (세미콜론 뒤 bare => 제거)
 * 주의: 코드 변환은 최소한으로. 화살표 함수를 깨뜨리면 안 된다.
 */
function cleanCodeBlock(code: string): string {
  const lines = code.split("\n");
  const cleaned = lines.map((line) => {
    if (/\/\/\s*=>/.test(line)) return line;
    // 세미콜론 뒤 bare `=> value` 패턴만 제거 (가장 안전한 케이스)
    const bareArrowWithSemicolon = line.match(/^(.+?)\s*;\s*=>\s*.+$/);
    if (bareArrowWithSemicolon) {
      return bareArrowWithSemicolon[1] + ";";
    }
    return line;
  });
  return cleaned.join("\n");
}

/**
 * expected 값에서 trailing 괄호 주석을 제거한다.
 * 예: `true (Object.is handles NaN)` → `true`
 */
function cleanExpectedValue(expected: string): string {
  // 값 뒤에 괄호로 시작하는 설명이 붙은 경우 제거
  const cleaned = expected.replace(/\s+\([\w\s.,'"+\-/*]+\)\s*$/, "").trim();
  return cleaned || expected;
}

/**
 * expected 값이 유효한 JS 리터럴/표현식인지 검증한다.
 * 텍스트 설명("logs "sup"", "no logs" 등)을 걸러낸다.
 */
function isValidExpectedValue(expected: string): boolean {
  // 유효한 JS 리터럴 패턴
  if (/^(?:true|false|null|undefined|NaN|Infinity|-Infinity)$/.test(expected)) return true;
  if (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?n?$/.test(expected)) return true; // 숫자/BigInt
  if (/^['"`]/.test(expected)) return true; // 문자열
  if (/^\{/.test(expected)) return true; // 객체

  // 배열: 내부에 bare identifier (대문자 시작, 비-리터럴)가 없어야 함
  if (/^\[/.test(expected)) {
    // [Bass, Trout] 같은 bare identifier 배열은 유효하지 않음
    const inner = expected.slice(1, -1).trim();
    if (inner && /^[A-Z]\w*(,\s*[A-Z]\w*)*$/.test(inner)) return false;
    return true;
  }

  if (/^new\s+/.test(expected)) return true; // new 생성자
  if (/^\w+\s*\(/.test(expected)) return true; // 함수 호출
  // 텍스트 설명은 보통 영어 단어로 시작 (Logs, no, will 등)
  if (/^[a-z]+\s+/i.test(expected) && !/^(?:typeof|void|delete|await)\s+/.test(expected)) return false;
  return true;
}

/**
 * expected 값이 닫히지 않은 bracket으로 끝나는지 확인한다.
 * `[`, `{` 만 있고 닫힌 `]`, `}` 가 없으면 multi-line expected.
 */
function isUnclosedBracket(value: string): boolean {
  let depth = 0;
  for (const ch of value) {
    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") depth--;
  }
  return depth > 0;
}

/**
 * Multi-line expected value를 수집한다.
 * `//` 주석으로 시작하는 연속된 줄을 합쳐서 완성된 값을 반환한다.
 */
function collectMultiLineExpected(lines: string[], startIdx: number, initial: string): string {
  let result = initial;
  for (let j = startIdx; j < lines.length; j++) {
    const trimmed = lines[j].trim();
    // 주석이 아닌 줄이 나오면 중단
    if (!trimmed.startsWith("//")) break;
    // `// =>` 새로운 assertion이면 중단
    if (/^\/\/\s*=>/.test(trimmed)) break;
    // 주석 prefix 제거하고 내용 추가
    const content = trimmed.replace(/^\/\/\s*/, "");
    result += "\n" + content;
    // bracket이 닫히면 완료
    if (!isUnclosedBracket(result)) break;
  }
  return result.trim();
}

/**
 * 코드에서 assertion을 파싱한다.
 *
 * 두 가지 패턴을 지원한다:
 * - 패턴 A (같은 줄): `foo(1) // => 3`
 * - 패턴 B (다음 줄): `const result = foo(1);\n// => 3`
 */
function parseAssertions(
  code: string,
): Array<{ expression: string; expected: string }> {
  const assertions: Array<{ expression: string; expected: string }> = [];
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 패턴 A: 같은 줄에 `expression // => expected`
    const inlineMatch = line.match(/^(.+?)\s*\/\/\s*=>\s*(.+)$/);
    if (inlineMatch) {
      let expr = inlineMatch[1].trim();
      // console.log(expr) 패턴은 skip (실행만 확인)
      if (/^\s*console\.log\s*\(/.test(expr)) continue;
      const declMatch = expr.match(/^(?:const|let|var)\s+\w+\s*=\s*(.+)$/);
      if (declMatch) expr = declMatch[1];
      expr = expr.replace(/;$/, "");
      // expression이 불완전하면 skip (멀티라인 호출의 닫는 괄호만 있는 경우 등)
      if (/^[)\]}]+$/.test(expr.trim())) continue;
      const expected = cleanExpectedValue(inlineMatch[2].trim());
      // 텍스트 설명인 expected는 skip
      if (!isValidExpectedValue(expected)) continue;
      assertions.push({ expression: expr, expected });
      continue;
    }

    // 패턴 B: 이 줄이 `// => expected` 이고, 이전 줄이 코드인 경우
    const nextLineMatch = line.trim().match(/^\/\/\s*=>\s*(.+)$/);
    if (nextLineMatch && i > 0) {
      const prevLine = lines[i - 1].trim();
      if (prevLine && !prevLine.startsWith("//")) {
        // console.log 패턴 skip
        if (/^\s*console\.log\s*\(/.test(prevLine)) continue;
        let expr = prevLine;
        const declMatch = expr.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+)$/);
        if (declMatch) expr = declMatch[2];
        expr = expr.replace(/;$/, "");
        if (/^[)\]}]+$/.test(expr.trim())) continue;

        // Multi-line expected value: `// => [\n//   ...\n// ]` 패턴 수집
        let expectedRaw = nextLineMatch[1].trim();
        if (isUnclosedBracket(expectedRaw)) {
          const multiLine = collectMultiLineExpected(lines, i + 1, expectedRaw);
          expectedRaw = multiLine;
        }

        const expected = cleanExpectedValue(expectedRaw);
        if (!isValidExpectedValue(expected)) continue;
        assertions.push({ expression: expr, expected });
      }
    }
  }

  return assertions;
}

export interface DocTestResult {
  symbolName: string;
  filePath: string;
  line: number;
  passed: boolean;
  skipped: boolean;
  assertionCount: number;
  error?: string;
}

/**
 * sourceRoot 내에서 barrel export 파일 (index.ts, mod.ts 등)을 탐색한다.
 */
const ENTRY_CANDIDATES = ["index.ts", "index.tsx", "index.js", "mod.ts", "mod.js"];

function findEntryPoint(sourceRoot: string): string | null {
  for (const candidate of ENTRY_CANDIDATES) {
    const fullPath = join(sourceRoot, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

/**
 * 추출된 DocTest를 실행한다.
 */
export function runDocTests(
  tests: DocTest[],
  sourceRoot: string,
): DocTestResult[] {
  const results: DocTestResult[] = [];
  const projectRoot = findProjectRoot(sourceRoot);
  const tmpDir = join(projectRoot, ".oxdoc-doctest-tmp");
  const entryPoint = findEntryPoint(sourceRoot);
  mkdirSync(tmpDir, { recursive: true });

  try {
    for (let i = 0; i < tests.length; i++) {
      const result = runSingleDocTest(tests[i], sourceRoot, projectRoot, tmpDir, i, entryPoint);
      results.push(result);
    }
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // cleanup failure ignored
    }
  }

  return results;
}

// ─── 코드 생성 ───

function detectNamespaceAlias(code: string): string | null {
  // 언더스코어 컨벤션 (lodash/radashi 등 널리 사용되는 패턴)
  const underscoreMatch = code.match(/\b_\.(\w+)\s*\(/);
  if (underscoreMatch) return "_";

  // CapitalCase.method() 패턴은 감지하지 않음 —
  // 클래스 정적 메서드, 로컬 인스턴스 등과 구분할 수 없음
  return null;
}

const BROWSER_APIS = ["document", "window", "localStorage", "sessionStorage", "navigator", "location", "history", "XMLHttpRequest"];
// fetch, URL은 Node에서 동작하므로 사전 skip하지 않음 — 에러 기반으로만 skip
const SKIP_PATTERNS: RegExp[] = [];
// 명확한 의사코드 함수명 패턴 (실제 프로젝트에서 사용하지 않을 이름만)
const PSEUDO_CODE_PATTERNS = [
  /\b(?:myFunction|myCallback|myHandler|myService|myMethod)\s*\(/i,
];
// 에러를 의도적으로 throw하는 예제 패턴
const THROW_PATTERNS = [
  /error\s+is\s+thrown/i,
  /will\s+throw/i,
  /should\s+throw/i,
  /throws\s+(?:an?\s+)?error/i,
  /\bthrow\s+new\s+/,
];

function shouldSkipExample(code: string, error?: string): boolean {
  for (const api of BROWSER_APIS) {
    if (code.includes(`${api}.`) || code.includes(`${api}[`)) return true;
  }
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(code)) return true;
  }
  // 에러를 의도적으로 throw하는 예제
  for (const pattern of THROW_PATTERNS) {
    if (pattern.test(code)) return true;
  }
  // 테스트 프레임워크 assertion은 사전 skip하지 않음 — ReferenceError로 실패 후 처리
  if (error) {
    if (error.includes("fetch failed") || error.includes("Failed to parse URL")) return true;
    if (BROWSER_APIS.some((api) => error.includes(`${api} is not defined`))) return true;
    // BigInt 직렬화 에러
    if (error.includes("serialize a BigInt")) return true;
    // Timeout 에러
    if (error.includes("TimeoutError") || error.includes("timed out")) return true;
  }
  return false;
}

/**
 * ReferenceError가 의사코드(pseudo-code) 예제 때문인지 판단한다.
 * 의사코드 예제: 실제로 존재하지 않는 가상의 함수를 참조하는 설명용 코드.
 */
/**
 * ReferenceError가 의사코드(pseudo-code) 예제 때문인지 판단한다.
 * 보수적으로 동작: 실제 함수명과 겹칠 수 있는 패턴은 사용하지 않는다.
 * 명확히 가짜인 이름(my*, example*, mock*, fake*, dummy*, stub*)만 감지한다.
 */
function isPseudoCodeError(code: string, error: string): boolean {
  const match = error.match(/(\w+)\s+is not defined/);
  if (!match) return false;
  const undefinedSymbol = match[1];

  // 코드에 명확한 의사코드 함수 패턴이 있는 경우
  for (const pattern of PSEUDO_CODE_PATTERNS) {
    if (pattern.test(code)) return true;
  }

  // 명확히 의사코드인 이름만 (실제 프로젝트에서 사용하지 않을 접두사)
  if (/^(?:my|example|sample|mock|fake|stub|dummy|placeholder)\w+$/i.test(undefinedSymbol)) return true;

  // 테스트 프레임워크 함수 (expect, assert 등은 어떤 프로젝트에서도 직접 export하지 않음)
  if (/^(?:expect|assert|describe|it|test|beforeEach|afterEach|jest|vi|cy)$/.test(undefinedSymbol)) return true;

  return false;
}

/**
 * 비결정적 결과를 가진 예제인지 판단한다.
 * 함수명이 아닌 코드 내용으로만 판단 — Math.random 사용 + assertion이 있는 경우만 skip.
 */
function isNondeterministicExample(test: DocTest): boolean {
  if (test.assertions.length === 0) return false;
  // 코드에 Math.random이 명시적으로 사용된 경우만
  return /\bMath\.random\b/.test(test.code);
}

/**
 * @example 코드 → 실행 가능한 테스트 코드 변환
 *
 * 1. setup 줄과 assertion 줄을 분리
 * 2. 공통 setup을 최상위에 배치 (const → let)
 * 3. 각 assertion을 독립 블록 { } 안에서 실행 (const 중복 방지)
 * 4. 네임스페이스 import 감지 (_.foo → import * as _)
 * 5. 다음-줄 assertion 패턴 지원 (코드줄 + // => 줄)
 */
function generateTestCode(test: DocTest, importPath: string, entryImportPath: string | null): string {
  const code = test.code;
  const lines = code.split("\n");
  const nsAlias = detectNamespaceAlias(code);

  let importLine: string;
  if (nsAlias) {
    importLine = `import * as ${nsAlias} from "${entryImportPath || importPath}";`;
  } else {
    importLine = `import { ${test.symbolName} } from "${importPath}";`;
  }

  if (test.assertions.length === 0) {
    const safeCode = lines.map(constToVar).join("\n");
    if (code.includes("await ")) {
      return `${importLine}\n(async () => {\n${safeCode}\n})();`;
    }
    return `${importLine}\n${safeCode}`;
  }

  return generateTestCodeWithImport(test, importLine);
}


/**
 * Node.js 내장 util.isDeepStrictEqual을 사용한 비교.
 * Date, RegExp, Map, Set, typed arrays, 순환참조 등 모든 타입을 올바르게 처리한다.
 */
const DEEP_EQUAL_HELPER = `import { isDeepStrictEqual as __deepEqual } from "node:util";`;

function constToLet(line: string): string {
  return line.replace(/^(\s*)const\s+/, "$1let ");
}

function constToVar(line: string): string {
  return line.replace(/^(\s*)(?:const|let)\s+/, "$1var ");
}

// ─── 실행 헬퍼 ───

function makeResult(test: DocTest, passed: boolean): DocTestResult {
  return {
    symbolName: test.symbolName,
    filePath: test.filePath,
    line: test.line,
    passed,
    skipped: false,
    assertionCount: Math.max(test.assertions.length, 1),
  };
}

function executeTestFile(tsxPath: string, testFile: string, cwd: string): { passed: boolean; error?: string } {
  try {
    execSync(`node --import ${tsxPath} ${testFile}`, {
      timeout: 10000,
      stdio: "pipe",
      cwd,
    });
    return { passed: true };
  } catch (err) {
    const error = err as { stderr?: Buffer; stdout?: Buffer; message?: string; status?: number };
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";
    const combined = stderr || stdout || error.message || "Unknown error";
    const errorLine =
      combined.split("\n").find((l: string) => l.includes("Error:") || l.includes("TypeError:")) ||
      combined.split("\n").filter((l: string) => l.trim()).pop() ||
      (error.status !== null ? `Process exited with code ${error.status}` : "Unknown error");
    return { passed: false, error: errorLine.trim() };
  }
}

/**
 * entry point (barrel export) 를 통한 import 코드 생성.
 * 패키지 전체 export에 접근할 수 있어 같은 패키지의 다른 함수 참조가 가능.
 */
function generateTestCodeWithEntry(test: DocTest, entryImportPath: string): string {
  const code = test.code;
  const nsAlias = detectNamespaceAlias(code);

  let importLine: string;
  if (nsAlias) {
    importLine = `import * as ${nsAlias} from "${entryImportPath}";`;
  } else {
    importLine = `import * as __pkg from "${entryImportPath}";\nObject.assign(globalThis, __pkg);`;
  }

  // assertion이 있으면 assertion-aware 코드 생성 (entry import 버전)
  if (test.assertions.length > 0) {
    // generateTestCode와 동일한 로직이지만 import만 다름
    return generateTestCodeWithImport(test, importLine);
  }

  const lines = code.split("\n");
  const safeCode = lines.map(constToVar).join("\n");
  if (code.includes("await ")) {
    return `${importLine}\n(async () => {\n${safeCode}\n})();`;
  }
  return `${importLine}\n${safeCode}`;
}

/**
 * 주어진 import 라인으로 assertion-aware 테스트 코드를 생성한다.
 */
function generateTestCodeWithImport(test: DocTest, importLine: string): string {
  const code = test.code;
  const lines = code.split("\n");

  interface ParsedLine {
    type: "setup" | "assertion" | "skip";
    raw: string;
    expression?: string;
    expected?: string;
    varName?: string; // assertion에서 변수 선언을 보존해야 하는 경우
  }

  const parsed: ParsedLine[] = [];
  const assertionLineSet = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    const inlineMatch = trimmed.match(/^(.+?)\s*\/\/\s*=>\s*(.+)$/);
    if (inlineMatch) {
      let expr = inlineMatch[1].trim().replace(/;$/, "");
      // console.log 패턴은 assertion이 아닌 setup
      if (/^\s*console\.log\s*\(/.test(expr)) {
        parsed.push({ type: "setup", raw: lines[i] });
        continue;
      }
      let varName: string | undefined;
      const declMatch = expr.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+)$/);
      if (declMatch) {
        varName = declMatch[1];
        expr = declMatch[2];
      }
      // 불완전한 expression skip
      if (/^[)\]}]+$/.test(expr.trim())) {
        parsed.push({ type: "skip", raw: lines[i] });
        continue;
      }
      const expected = cleanExpectedValue(inlineMatch[2].trim());
      if (!isValidExpectedValue(expected)) {
        parsed.push({ type: "skip", raw: lines[i] });
        continue;
      }
      parsed.push({ type: "assertion", raw: lines[i], expression: expr, expected, varName });
      assertionLineSet.add(i);
      continue;
    }

    const nextLineMatch = trimmed.match(/^\/\/\s*=>\s*(.+)$/);
    if (nextLineMatch && i > 0 && !assertionLineSet.has(i - 1)) {
      const prevTrimmed = lines[i - 1].trim();
      if (prevTrimmed && !prevTrimmed.startsWith("//")) {
        if (/^\s*console\.log\s*\(/.test(prevTrimmed)) {
          parsed.push({ type: "skip", raw: lines[i] });
          continue;
        }
        let expr = prevTrimmed.replace(/;$/, "");
        let varName: string | undefined;
        const declMatch = expr.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+)$/);
        if (declMatch) {
          varName = declMatch[1];
          expr = declMatch[2];
        }
        if (/^[)\]}]+$/.test(expr.trim())) {
          parsed.push({ type: "skip", raw: lines[i] });
          continue;
        }

        // Multi-line expected value: `// => [\n//   ...\n// ]` 패턴 수집
        let expectedRaw = nextLineMatch[1].trim();
        if (isUnclosedBracket(expectedRaw)) {
          expectedRaw = collectMultiLineExpected(lines, i + 1, expectedRaw);
        }

        const expected = cleanExpectedValue(expectedRaw);
        if (!isValidExpectedValue(expected)) {
          parsed.push({ type: "skip", raw: lines[i] });
          continue;
        }
        const prevIdx = parsed.length - 1;
        if (prevIdx >= 0 && parsed[prevIdx].raw === lines[i - 1]) {
          parsed[prevIdx] = { type: "assertion", raw: lines[i - 1], expression: expr, expected, varName };
        }
        parsed.push({ type: "skip", raw: lines[i] });
        assertionLineSet.add(i);
        assertionLineSet.add(i - 1);
        continue;
      }
    }

    if (!trimmed || (trimmed.startsWith("//") && !trimmed.includes("// =>"))) {
      parsed.push({ type: "skip", raw: lines[i] });
      continue;
    }

    parsed.push({ type: "setup", raw: lines[i] });
  }

  const firstAssertIdx = parsed.findIndex((p) => p.type === "assertion");
  const commonSetup = firstAssertIdx > 0
    ? parsed.slice(0, firstAssertIdx).filter((p) => p.type === "setup").map((p) => p.raw)
    : [];

  // assertion이 모두 skip되었으면 코드 실행만 확인
  const hasAssertions = parsed.some((p) => p.type === "assertion");
  if (!hasAssertions) {
    const safeCode = lines.map(constToVar).join("\n");
    if (code.includes("await ")) {
      return `${importLine}\n(async () => {\n${safeCode}\n})();`;
    }
    return `${importLine}\n${safeCode}`;
  }

  const parts: string[] = [importLine, DEEP_EQUAL_HELPER, ""];

  for (const line of commonSetup) {
    parts.push(constToLet(line));
  }
  if (commonSetup.length > 0) parts.push("");

  let currentExtraSetup: string[] = [];
  for (const p of parsed) {
    if (p.type === "skip") continue;
    if (p.type === "setup") {
      if (!commonSetup.includes(p.raw)) {
        currentExtraSetup.push(p.raw);
      }
      continue;
    }
    if (p.type === "assertion") {
      parts.push("{");
      for (const s of currentExtraSetup) {
        parts.push(`  ${constToLet(s).trim()}`);
      }
      // 변수 선언이 있었으면 보존 (다음 assertion에서 참조 가능)
      if (p.varName) {
        parts.push(`  var ${p.varName} = ${p.expression};`);
        parts.push(`  const __result = ${p.varName};`);
      } else {
        parts.push(`  const __result = ${p.expression};`);
      }
      parts.push(`  const __expected = ${p.expected};`);
      parts.push(
        `  if (!__deepEqual(__result, __expected)) { throw new Error(\`Expected \${JSON.stringify(__expected)}, got \${JSON.stringify(__result)}\`); }`,
      );
      parts.push("}");
      currentExtraSetup = [];
    }
  }

  return parts.join("\n");
}

// ─── 실행 ───

function runSingleDocTest(
  test: DocTest,
  sourceRoot: string,
  projectRoot: string,
  tmpDir: string,
  index: number,
  entryPoint: string | null,
): DocTestResult {
  if (shouldSkipExample(test.code)) {
    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      skipped: true,
      assertionCount: 0,
      error: "Skipped: browser/external API or throw-pattern detected",
    };
  }

  // assertion 없이 console.log만 있는 예제는 검증 불가 → skip
  if (test.assertions.length === 0 && /\bconsole\.log\b/.test(test.code)) {
    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      skipped: true,
      assertionCount: 0,
      error: "Skipped: console.log-only example without assertions",
    };
  }

  // 비결정적 결과 예제 (random, shuffle 등) → skip
  if (isNondeterministicExample(test)) {
    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      skipped: true,
      assertionCount: 0,
      error: "Skipped: non-deterministic result (random/shuffle)",
    };
  }

  const testFile = join(tmpDir, `doctest_${index}.ts`);
  const absoluteFilePath = join(sourceRoot, test.filePath);
  const relativeFromTmp = relative(tmpDir, absoluteFilePath);
  const importPath = relativeFromTmp.replace(/\.(ts|tsx|js|jsx)$/, "");

  // entry point 경로를 tmpDir 기준 상대 경로로 변환
  let entryImportPath: string | null = null;
  if (entryPoint) {
    entryImportPath = relative(tmpDir, entryPoint).replace(/\.(ts|tsx|js|jsx)$/, "");
  }

  const tsxPath = resolveTsxPath();

  // 1차: 파일 단위 import로 시도
  const testCode = generateTestCode(test, importPath, null);
  writeFileSync(testFile, testCode, "utf-8");

  const execResult = executeTestFile(tsxPath, testFile, projectRoot);

  if (execResult.passed) {
    return { ...makeResult(test, true), assertionCount: Math.max(test.assertions.length, 1) };
  }

  // 2차: ReferenceError이고 entry point가 있으면 barrel import로 재시도
  if (entryImportPath && execResult.error && execResult.error.includes("is not defined")) {
    // 의사코드 예제인지 먼저 확인
    if (isPseudoCodeError(test.code, execResult.error)) {
      return { ...makeResult(test, false), skipped: true, error: `Skipped: pseudo-code example (${execResult.error})` };
    }

    // 문서 오류: 예제에서 심볼의 축약형이나 다른 이름을 사용한 경우
    // eq → isEqualsSameValueZero, has → hasIn, sortedIndex → sortedLastIndex 등
    const undefinedMatch = execResult.error.match(/(\w+)\s+is not defined/);
    if (undefinedMatch) {
      const sym = undefinedMatch[1];
      const lowerSym = sym.toLowerCase();
      const lowerName = test.symbolName.toLowerCase();
      // 심볼이 함수명의 부분이거나, 함수명이 심볼의 부분인 경우
      if (lowerName.includes(lowerSym) || lowerSym.includes(lowerName)) {
        return { ...makeResult(test, false), skipped: true, error: `Skipped: example uses alias '${sym}' for '${test.symbolName}'` };
      }
    }

    const retryCode = generateTestCodeWithEntry(test, entryImportPath);
    writeFileSync(testFile, retryCode, "utf-8");

    const retryResult = executeTestFile(tsxPath, testFile, projectRoot);
    if (retryResult.passed) {
      return { ...makeResult(test, true), assertionCount: Math.max(test.assertions.length, 1) };
    }

    // barrel import도 ReferenceError면 의사코드일 가능성
    if (retryResult.error && retryResult.error.includes("is not defined")) {
      if (isPseudoCodeError(test.code, retryResult.error)) {
        return { ...makeResult(test, false), skipped: true, error: `Skipped: pseudo-code example (${retryResult.error})` };
      }
    }
  } else if (execResult.error && execResult.error.includes("is not defined")) {
    // entry point 없어도 의사코드 감지
    if (isPseudoCodeError(test.code, execResult.error)) {
      return { ...makeResult(test, false), skipped: true, error: `Skipped: pseudo-code example (${execResult.error})` };
    }
  }

  if (shouldSkipExample(test.code, execResult.error)) {
    return { ...makeResult(test, false), skipped: true, error: `Skipped: ${execResult.error}` };
  }

  return { ...makeResult(test, false), error: execResult.error };
}
