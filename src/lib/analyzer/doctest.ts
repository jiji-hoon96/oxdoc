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
    return fenceMatch[1].trim();
  }

  if (trimmed.length > 0 && !trimmed.startsWith("```")) {
    return trimmed;
  }

  return null;
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
      const declMatch = expr.match(/^(?:const|let|var)\s+\w+\s*=\s*(.+)$/);
      if (declMatch) expr = declMatch[1];
      // 세미콜론 제거
      expr = expr.replace(/;$/, "");
      assertions.push({ expression: expr, expected: inlineMatch[2].trim() });
      continue;
    }

    // 패턴 B: 이 줄이 `// => expected` 이고, 이전 줄이 코드인 경우
    const nextLineMatch = line.trim().match(/^\/\/\s*=>\s*(.+)$/);
    if (nextLineMatch && i > 0) {
      const prevLine = lines[i - 1].trim();
      if (prevLine && !prevLine.startsWith("//")) {
        let expr = prevLine;
        const declMatch = expr.match(/^(?:const|let|var)\s+\w+\s*=\s*(.+)$/);
        if (declMatch) expr = declMatch[1];
        expr = expr.replace(/;$/, "");
        assertions.push({ expression: expr, expected: nextLineMatch[1].trim() });
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
 * 추출된 DocTest를 실행한다.
 */
export function runDocTests(
  tests: DocTest[],
  sourceRoot: string,
): DocTestResult[] {
  const results: DocTestResult[] = [];
  const projectRoot = findProjectRoot(sourceRoot);
  const tmpDir = join(projectRoot, ".oxdoc-doctest-tmp");
  mkdirSync(tmpDir, { recursive: true });

  try {
    for (let i = 0; i < tests.length; i++) {
      const result = runSingleDocTest(tests[i], sourceRoot, projectRoot, tmpDir, i);
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
  const underscoreMatch = code.match(/\b_\.(\w+)\s*\(/);
  if (underscoreMatch) return "_";

  const nsMatch = code.match(/\b([a-zA-Z]\w+)\.(\w+)\s*\(/);
  if (nsMatch) {
    const ns = nsMatch[1];
    if (!code.includes(`const ${ns}`) && !code.includes(`let ${ns}`) && !code.includes(`var ${ns}`)) {
      return ns;
    }
  }
  return null;
}

const BROWSER_APIS = ["document", "window", "localStorage", "sessionStorage", "navigator", "location", "history", "XMLHttpRequest"];
const SKIP_PATTERNS = [/\bfetch\s*\(/, /\bnew\s+URL\s*\(/];

function shouldSkipExample(code: string, error?: string): boolean {
  for (const api of BROWSER_APIS) {
    if (code.includes(`${api}.`) || code.includes(`${api}[`)) return true;
  }
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(code)) return true;
  }
  if (error) {
    if (error.includes("fetch failed") || error.includes("Failed to parse URL")) return true;
    if (BROWSER_APIS.some((api) => error.includes(`${api} is not defined`))) return true;
  }
  return false;
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
function generateTestCode(test: DocTest, importPath: string): string {
  const code = test.code;
  const lines = code.split("\n");
  const nsAlias = detectNamespaceAlias(code);

  let importLine: string;
  if (nsAlias) {
    importLine = `import * as ${nsAlias} from "${importPath}";`;
  } else {
    importLine = `import { ${test.symbolName} } from "${importPath}";`;
  }

  if (test.assertions.length === 0) {
    // assertion 없음 — 코드 실행만 확인. const 중복 방지를 위해 let으로 변환
    const safeCode = lines.map(constToLet).join("\n");
    return `${importLine}\n${safeCode}`;
  }

  // 줄을 분류: setup / assertion-expr / assertion-marker(다음줄 패턴) / 빈줄·주석
  interface ParsedLine {
    type: "setup" | "assertion" | "skip";
    raw: string;
    expression?: string;
    expected?: string;
  }

  const parsed: ParsedLine[] = [];
  const assertionLineSet = new Set<number>(); // assertion으로 소비된 줄 인덱스

  // 먼저 assertion 줄을 식별
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // 패턴 A: 같은 줄 `expr // => expected`
    const inlineMatch = trimmed.match(/^(.+?)\s*\/\/\s*=>\s*(.+)$/);
    if (inlineMatch) {
      let expr = inlineMatch[1].trim().replace(/;$/, "");
      const declMatch = expr.match(/^(?:const|let|var)\s+\w+\s*=\s*(.+)$/);
      if (declMatch) expr = declMatch[1];
      parsed.push({ type: "assertion", raw: lines[i], expression: expr, expected: inlineMatch[2].trim() });
      assertionLineSet.add(i);
      continue;
    }

    // 패턴 B: `// => expected` (다음줄)
    const nextLineMatch = trimmed.match(/^\/\/\s*=>\s*(.+)$/);
    if (nextLineMatch && i > 0 && !assertionLineSet.has(i - 1)) {
      const prevTrimmed = lines[i - 1].trim();
      if (prevTrimmed && !prevTrimmed.startsWith("//")) {
        let expr = prevTrimmed.replace(/;$/, "");
        const declMatch = expr.match(/^(?:const|let|var)\s+\w+\s*=\s*(.+)$/);
        if (declMatch) expr = declMatch[1];
        // 이전 줄의 parsed를 assertion으로 교체
        const prevIdx = parsed.length - 1;
        if (prevIdx >= 0 && parsed[prevIdx].raw === lines[i - 1]) {
          parsed[prevIdx] = { type: "assertion", raw: lines[i - 1], expression: expr, expected: nextLineMatch[1].trim() };
        }
        parsed.push({ type: "skip", raw: lines[i] }); // // => 줄 자체는 skip
        assertionLineSet.add(i);
        assertionLineSet.add(i - 1);
        continue;
      }
    }

    // 빈 줄이나 일반 주석
    if (!trimmed || (trimmed.startsWith("//") && !trimmed.includes("// =>"))) {
      parsed.push({ type: "skip", raw: lines[i] });
      continue;
    }

    // 일반 setup 코드
    parsed.push({ type: "setup", raw: lines[i] });
  }

  // 공통 setup 찾기: 첫 번째 assertion 이전의 모든 setup 줄
  const firstAssertIdx = parsed.findIndex((p) => p.type === "assertion");
  const commonSetup = firstAssertIdx > 0
    ? parsed.slice(0, firstAssertIdx).filter((p) => p.type === "setup").map((p) => p.raw)
    : [];

  // 코드 조립
  const parts: string[] = [importLine, ""];

  // 공통 setup
  for (const line of commonSetup) {
    parts.push(constToLet(line));
  }
  if (commonSetup.length > 0) parts.push("");

  // assertion 블록들 생성
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
      parts.push(`  const __result = ${p.expression};`);
      parts.push(`  const __expected = ${p.expected};`);
      parts.push(
        `  if (JSON.stringify(__result) !== JSON.stringify(__expected)) { throw new Error(\`Expected \${JSON.stringify(__expected)}, got \${JSON.stringify(__result)}\`); }`,
      );
      parts.push("}");
      currentExtraSetup = [];
    }
  }

  return parts.join("\n");
}

function constToLet(line: string): string {
  return line.replace(/^(\s*)const\s+/, "$1let ");
}

// ─── 실행 ───

function runSingleDocTest(
  test: DocTest,
  sourceRoot: string,
  projectRoot: string,
  tmpDir: string,
  index: number,
): DocTestResult {
  if (shouldSkipExample(test.code)) {
    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      skipped: true,
      assertionCount: 0,
      error: "Skipped: browser/external API dependency detected",
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

  const testFile = join(tmpDir, `doctest_${index}.ts`);
  const absoluteFilePath = join(sourceRoot, test.filePath);
  const relativeFromTmp = relative(tmpDir, absoluteFilePath);
  const importPath = relativeFromTmp.replace(/\.(ts|tsx|js|jsx)$/, "");

  const testCode = generateTestCode(test, importPath);
  writeFileSync(testFile, testCode, "utf-8");

  try {
    const tsxPath = resolveTsxPath();
    execSync(`node --import ${tsxPath} ${testFile}`, {
      timeout: 10000,
      stdio: "pipe",
      cwd: projectRoot,
    });

    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: true,
      skipped: false,
      assertionCount: Math.max(test.assertions.length, 1),
    };
  } catch (err) {
    const error = err as { stderr?: Buffer; message?: string };
    const stderr = error.stderr?.toString() || error.message || "Unknown error";
    const errorLine =
      stderr.split("\n").find((l: string) => l.includes("Error:")) || stderr.split("\n")[0];
    const errorMsg = errorLine.trim();

    if (shouldSkipExample(test.code, errorMsg)) {
      return {
        symbolName: test.symbolName,
        filePath: test.filePath,
        line: test.line,
        passed: false,
        skipped: true,
        assertionCount: 0,
        error: `Skipped: ${errorMsg}`,
      };
    }

    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      skipped: false,
      assertionCount: Math.max(test.assertions.length, 1),
      error: errorMsg,
    };
  }
}
