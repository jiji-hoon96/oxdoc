# oxdoc

[![npm version](https://img.shields.io/npm/v/@jiji-hoon96/oxdoc)](https://www.npmjs.com/package/@jiji-hoon96/oxdoc)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[English](./README.md)

[OXC](https://oxc.rs/) 파서를 활용한 네이티브 속도 TypeScript/JavaScript API 문서 생성기.

## 기능

- **OXC Parser** - Rust NAPI 바인딩 기반 초고속 파싱 (Babel 대비 10-50x)
- **JSDoc/TSDoc 추출** - 소스 코드에서 API 문서 자동 생성 (JSON, Markdown, HTML, llms.txt)
- **문서 커버리지** - export된 심볼의 문서화 비율 측정 (CI 연동)
- **Doc Test** - `@example` 블록의 코드를 실제 실행하여 검증
- **HTML 문서** - 사이드바, 검색, 다크 테마를 갖춘 단일 페이지 API 문서
- **플러그인 시스템** - Transform, Output, Analyzer 훅으로 확장 가능
- **Watch 모드** - 파일 변경 감지 시 문서 자동 재생성

## 빠른 시작

```bash
# 설치
pnpm add -D @jiji-hoon96/oxdoc

# API 문서 생성
npx @jiji-hoon96/oxdoc generate ./src --format markdown --output ./api-docs

# 문서 커버리지 체크 (80% 미달 시 CI 실패)
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# @example 블록 테스트
npx @jiji-hoon96/oxdoc doctest ./src
```

## CLI 명령어

### `oxdoc generate`

```bash
oxdoc generate [path] --format json|markdown|html|llms-txt --output <dir>
```

소스 파일에서 JSDoc/TSDoc을 추출하여 API 문서를 생성합니다.

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-f, --format` | 출력 형식 (`json`, `markdown`, `html`, `llms-txt`) | `json` |
| `-o, --output` | 출력 디렉토리 | `./docs-output` |
| `-w, --watch` | 파일 변경 시 자동 재생성 | `false` |
| `--include` | 포함 glob 패턴 | `**/*.{ts,tsx,js,jsx}` |
| `--exclude` | 제외 glob 패턴 | `**/*.test.*`, `**/node_modules/**` |

### `oxdoc coverage`

```bash
oxdoc coverage [path] --threshold 80 --format text|json
```

문서 커버리지를 측정합니다. `--threshold` 미달 시 exit code 1을 반환하여 CI에서 활용 가능합니다.

```
  Documentation Coverage Report
  ───────────────────────────────────
  Total symbols:      42
  Documented:         35  (83.3%)
  Undocumented:        7

  By kind:
    function       12/15  (80.0%)
    class           5/5   (100.0%)
    interface       8/10  (80.0%)
```

### `oxdoc doctest`

```bash
oxdoc doctest [path] --bail --reporter text|json
```

`@example` 블록의 코드를 실행하여 `// =>` assertion을 검증합니다.

```typescript
/**
 * @example
 * ```ts
 * add(1, 2) // => 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## 벤치마크

### es-toolkit (603 파일)

| | oxdoc | TypeDoc | 개선 |
|---|---|---|---|
| HTML 생성 | **0.27s** | 2.36s | 8.7x 빠름 |
| JSON 생성 | **0.25s** | 1.46s | 5.8x 빠름 |
| 메모리 | **117MB** | 445MB | 3.8x 적음 |

### 대규모 (5,000 파일 / 15,000 심볼)

| | oxdoc | TypeDoc | 개선 |
|---|---|---|---|
| 총 시간 | **0.9s** | ~60s+ | ~66x 빠름 |
| 메모리 | **22MB** | ~2GB+ | ~90x 적음 |

## 설정

프로젝트 루트에 `oxdoc.config.json`을 생성합니다:

```json
{
  "sourceRoot": "./src",
  "coverage": {
    "threshold": 80
  },
  "output": {
    "format": "html",
    "dir": "./api-docs"
  }
}
```

모든 옵션은 [설정 가이드](https://oxdoc.vercel.app/ko/docs/guides/configuration)를 참고하세요.

## 아키텍처

```
oxc-parser (Rust NAPI)  ← 네이티브 속도 파싱
       ↓
oxdoc (TypeScript)      ← JSDoc 매칭, 분석, 출력 생성
```

파싱(가장 무거운 연산)은 OXC의 Rust 바이너리가 처리하고, 분석/출력 레이어는 TypeScript로 유연하게 확장 가능합니다.

## 왜 oxdoc인가?

TypeDoc은 tsc에 의존하여 대형 프로젝트에서 심각한 문제가 발생합니다:
- 110K LOC 모노레포에서 **12GB 메모리** 필요
- 대형 프로젝트에서 **OOM 크래시**
- 검색 인덱스 초기화에 **35초+ 소요**

oxdoc은 OXC 파서로 이 문제를 해결합니다.

## 문서

[oxdoc 문서 사이트](https://oxdoc.vercel.app/ko)에서 상세 가이드를 확인하세요.

## 라이선스

MIT
