---
sidebar_position: 7
---

# 벤치마크

모든 수치는 macOS (Apple Silicon), Node.js v22.17.0 환경에서 3회 측정 중앙값입니다. TypeDoc 0.28.18에 `--skipErrorChecking` 플래그를 적용했습니다.

## 실제 프로젝트: es-toolkit (603 파일, 1322 심볼)

[es-toolkit](https://github.com/toss/es-toolkit)을 대상으로 측정했습니다.

| 측정 항목 | oxdoc | TypeDoc 0.28 | 배율 |
|----------|-------|-------------|------|
| JSON 생성 | **0.24s** | 1.70s | 7x 빠름 |
| HTML 생성 | **0.25s** | 2.53s | 10x 빠름 |
| 피크 메모리 | **131MB** | 470MB | 3.6x 적음 |

## 실제 프로젝트: radashi (162 파일, 437 심볼)

[radashi](https://github.com/radashi-org/radashi)를 대상으로 측정했습니다.

| 측정 항목 | oxdoc | TypeDoc 0.28 | 배율 |
|----------|-------|-------------|------|
| JSON 생성 | **0.13s** | 1.12s | 8.6x 빠름 |
| 피크 메모리 | **84MB** | 272MB | 3.2x 적음 |

## 합성 스케일 테스트

파일 수를 늘려가며 측정한 합성 벤치마크입니다. 각 파일에 문서화된 심볼 3개를 포함합니다.

| 파일 수 | 심볼 수 | 시간 | 메모리 | 처리량 |
|--------:|--------:|-----:|-------:|-------:|
| 100 | 300 | 0.03s | 6MB | ~3,300/s |
| 500 | 1,500 | 0.10s | 10MB | ~5,100/s |
| 1,000 | 3,000 | 0.18s | 6MB | ~5,700/s |
| 5,000 | 15,000 | 0.81s | 33MB | ~6,200/s |

## 성능 차이의 이유

**TypeDoc**은 파싱에 전체 TypeScript Compiler(tsc)를 사용합니다. `--skipErrorChecking`을 사용해도 전체 컴파일러 파이프라인을 초기화해야 하므로 ~1초의 고정 오버헤드가 있습니다.

**oxdoc**은 OXC 파서(Rust NAPI)를 사용하여 구문만 파싱합니다 — 타입 체킹 없이, 네이티브 Rust에서 실행됩니다.

| | TypeDoc | oxdoc |
|---|---|---|
| 파서 | tsc (JavaScript) | OXC (Rust NAPI) |
| 타입 해석 | 완전 | 없음 (시그니처 그대로) |
| 고정 오버헤드 | ~1초 | ~0.05초 |
| 파일당 비용 | ~2ms | ~0.15ms |

## 재현 방법

```bash
git clone https://github.com/jiji-hoon96/oxdoc.git
cd oxdoc
pnpm install && pnpm build

# 합성 벤치마크
pnpm bench

# 실제 프로젝트 비교 (TypeDoc 글로벌 설치 필요)
time node dist/cli/index.js generate --format json --output /tmp/oxdoc-out ./path/to/project/src
time npx typedoc --json /tmp/typedoc.json --entryPoints ./path/to/project/src/index.ts --skipErrorChecking
```
