# oxdoc

[![npm version](https://img.shields.io/npm/v/@jiji-hoon96/oxdoc)](https://www.npmjs.com/package/@jiji-hoon96/oxdoc)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[English](./README.md)

[OXC](https://oxc.rs/) 파서를 활용한 네이티브 속도 TypeScript/JavaScript API 문서 생성기.

## 왜 oxdoc인가?

TypeDoc은 TypeScript 컴파일러(tsc)에 의존하여 대형 프로젝트에서 심각한 문제가 있습니다:

- 대형 모노레포에서 **메모리 폭발** → OOM 크래시
- API 문서 생성에 **수십 분 소요**
- **tsc API에 결합** → TypeScript 7 (Go 포트) 출시 시 깨질 위험

oxdoc은 tsc 대신 OXC 파서(Rust NAPI)를 사용하여 이 문제를 해결하고, TypeDoc에 없는 기능(doc test, API 변경 감지, 커버리지 체크)을 내장합니다.

### 설계 트레이드오프

oxdoc은 타입 시그니처를 **소스 코드에 작성된 그대로** 추출합니다. TypeDoc처럼 타입 별칭을 확장하거나 제네릭을 해석하지 않습니다. 이 결정 덕분에 7-10배 빠르고 3-4배 적은 메모리를 사용합니다.

## 기능

- **OXC Parser** — Rust NAPI 바인딩, TypeDoc 대비 7-10x 빠름 (실측)
- **4개 출력 포맷** — JSON, Markdown, HTML (검색 + 다크 테마), llms.txt
- **문서 커버리지** — CI에서 문서화 비율 측정 및 강제
- **Doc Test** — `@example` 블록 실행 및 `// =>` assertion 검증
- **API Diff** — 릴리즈 간 API 변경 감지
- **10가지 심볼** — function, class, interface, type, enum, enum-member, getter, setter, namespace, variable
- **오버로드 지원** — 함수 오버로드를 `overloads` 배열로 병합
- **플러그인 시스템** — Transform, Output, Analyzer 훅으로 확장
- **Watch 모드** — 파일 변경 시 문서 자동 재생성

## 빠른 시작

```bash
# 설치
pnpm add -D @jiji-hoon96/oxdoc

# API 문서 생성
npx oxdoc generate ./src --format html --output ./api-docs

# 문서 커버리지 체크 (80% 미달 시 CI 실패)
npx oxdoc coverage ./src --threshold 80

# @example 블록 테스트
npx oxdoc doctest ./src

# API 변경 감지
npx oxdoc diff ./api-snapshot.json ./src --fail-on-breaking
```

## CLI 명령어

### `oxdoc generate`

소스 파일에서 JSDoc/TSDoc을 추출하여 API 문서를 생성합니다.

```bash
oxdoc generate [path] --format json|markdown|html|llms-txt --output <dir>
```

### `oxdoc coverage`

문서 커버리지를 측정합니다. `--threshold` 미달 시 exit code 1을 반환합니다.

```bash
oxdoc coverage [path] --threshold 80 --format text|json --badge badge.svg
```

### `oxdoc doctest`

`@example` 블록의 코드를 실행하여 assertion을 검증합니다.

```bash
oxdoc doctest [path] --bail --reporter text|json
```

### `oxdoc diff`

이전 JSON 스냅샷과 현재 API를 비교하여 변경 사항을 감지합니다.

```bash
oxdoc diff <snapshot.json> [path] --fail-on-breaking --format text|json
```

## 벤치마크

macOS (Apple Silicon), Node.js v22, 3회 측정 중앙값. TypeDoc 0.28에 `--skipErrorChecking` 적용.

### es-toolkit (603 파일, 1322 심볼)

| | oxdoc | TypeDoc 0.28 | 배율 |
|---|---|---|---|
| JSON 생성 | **0.24s** | 1.70s | 7x 빠름 |
| HTML 생성 | **0.25s** | 2.53s | 10x 빠름 |
| 피크 메모리 | **131MB** | 470MB | 3.6x 적음 |

### radashi (162 파일, 437 심볼)

| | oxdoc | TypeDoc 0.28 | 배율 |
|---|---|---|---|
| JSON 생성 | **0.13s** | 1.12s | 8.6x 빠름 |
| 피크 메모리 | **84MB** | 272MB | 3.2x 적음 |

### 합성 테스트 (생성된 fixture)

| 파일 수 | 심볼 수 | 시간 | 메모리 | 처리량 |
|--------:|--------:|-----:|-------:|-------:|
| 1,000 | 3,000 | 0.18s | 6MB | ~5,700/s |
| 5,000 | 15,000 | 0.81s | 33MB | ~6,200/s |

## 설정

프로젝트 루트에 `oxdoc.config.json`을 생성합니다:

```json
{
  "sourceRoot": "./src",
  "coverage": { "threshold": 80 },
  "output": { "format": "html", "dir": "./api-docs" },
  "repository": "https://github.com/user/repo"
}
```

## 라이선스

MIT
