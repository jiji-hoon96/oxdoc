import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ProjectDocumentation, DocTest } from "../../types/index.js";

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

/**
 * @example의 description에서 코드 블록을 추출한다.
 */
function extractCodeBlock(description: string): string | null {
  const trimmed = description.trim();

  // ```ts ... ``` 또는 ``` ... ``` 형태
  const fenceMatch = trimmed.match(/```(?:ts|typescript|js|javascript)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // 코드 블록 없이 직접 코드가 있는 경우
  if (trimmed.length > 0 && !trimmed.startsWith("```")) {
    return trimmed;
  }

  return null;
}

/**
 * 코드에서 `// => value` 패턴의 assertion을 파싱한다.
 */
function parseAssertions(
  code: string,
): Array<{ expression: string; expected: string }> {
  const assertions: Array<{ expression: string; expected: string }> = [];
  const lines = code.split("\n");

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*\/\/\s*=>\s*(.+)$/);
    if (match) {
      assertions.push({
        expression: match[1].trim(),
        expected: match[2].trim(),
      });
    }
  }

  return assertions;
}

export interface DocTestResult {
  symbolName: string;
  filePath: string;
  line: number;
  passed: boolean;
  assertionCount: number;
  error?: string;
}

/**
 * 추출된 DocTest를 실행한다.
 * @param tests - 실행할 DocTest 목록
 * @param sourceRoot - 소스 루트 (import 경로 해석용)
 * @returns 테스트 결과
 */
export function runDocTests(
  tests: DocTest[],
  sourceRoot: string,
): DocTestResult[] {
  const results: DocTestResult[] = [];
  const tmpDir = join(tmpdir(), `oxdoc-doctest-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = runSingleDocTest(test, sourceRoot, tmpDir, i);
      results.push(result);
    }
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // 정리 실패 무시
    }
  }

  return results;
}

function runSingleDocTest(
  test: DocTest,
  sourceRoot: string,
  tmpDir: string,
  index: number,
): DocTestResult {
  const testFile = join(tmpDir, `doctest_${index}.mts`);

  // assertion이 있으면 assert 코드 생성
  let testCode: string;

  if (test.assertions.length > 0) {
    const importPath = join(sourceRoot, test.filePath);
    const assertLines = test.assertions.map(
      (a) =>
        `{ const __result = ${a.expression}; const __expected = ${a.expected}; if (JSON.stringify(__result) !== JSON.stringify(__expected)) { throw new Error(\`Expected \${JSON.stringify(__expected)}, got \${JSON.stringify(__result)}\`); } }`,
    );

    testCode = `import { ${test.symbolName} } from "${importPath}";\n${assertLines.join("\n")}`;
  } else {
    // assertion 없이 코드 실행만 확인
    const importPath = join(sourceRoot, test.filePath);
    testCode = `import { ${test.symbolName} } from "${importPath}";\n${test.code}`;
  }

  writeFileSync(testFile, testCode, "utf-8");

  try {
    execSync(`node --import tsx ${testFile}`, {
      timeout: 10000,
      stdio: "pipe",
      cwd: sourceRoot,
    });

    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: true,
      assertionCount: Math.max(test.assertions.length, 1),
    };
  } catch (err) {
    const error = err as { stderr?: Buffer; message?: string };
    const stderr = error.stderr?.toString() || error.message || "Unknown error";
    // 에러 메시지에서 핵심만 추출
    const errorLine =
      stderr.split("\n").find((l: string) => l.includes("Error:")) || stderr.split("\n")[0];

    return {
      symbolName: test.symbolName,
      filePath: test.filePath,
      line: test.line,
      passed: false,
      assertionCount: Math.max(test.assertions.length, 1),
      error: errorLine.trim(),
    };
  }
}
