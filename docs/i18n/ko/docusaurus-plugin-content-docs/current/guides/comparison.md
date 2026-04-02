---
sidebar_position: 8
---

# 다른 도구와의 비교

oxdoc은 다른 TypeScript/JavaScript 문서화 도구와 어떻게 다를까요?

## 기능 비교

| 기능 | oxdoc | TypeDoc | JSDoc | documentation.js | deno doc | ESDoc |
|------|:-----:|:-------:|:-----:|:----------------:|:--------:|:-----:|
| TypeScript 지원 | O | O | X | 부분적 | O | X |
| JSDoc 추출 | O | O | O | O | O | O |
| 문서 커버리지 | **내장** | 플러그인 | X | X | X | 내장 |
| Doc 테스트 | **내장** | X | X | X | X | X |
| 커버리지 뱃지 (SVG) | **내장** | 플러그인 | X | X | X | X |
| API 변경 감지 | **내장** | X | X | X | X | X |
| HTML 출력 | O | O | O | O | O | O |
| Markdown 출력 | O | X | X | O | X | X |
| llms.txt (AI 친화) | **O** | X | X | X | X | X |
| JSON 출력 | O | O | X | O | O | X |
| HTML 소스 링크 | O | O | X | X | O | X |
| 플러그인 시스템 | O | O | O | X | X | O |
| Watch 모드 | O | O | X | X | X | X |
| 네이티브 속도 (Rust) | **O** | X | X | X | O | X |
| 활발한 유지보수 | O | O | O | 저활동 | O | X |

## 성능 비교

### vs TypeDoc

TypeDoc은 전체 TypeScript Compiler(tsc)에 의존하기 때문에 전체 타입 시스템을 로드하고, 모든 타입 참조를 해석하며, 완전한 프로그램 그래프를 구축합니다. 이를 통해 깊은 타입 정보를 제공하지만 상당한 성능 비용이 따릅니다.

oxdoc은 OXC 파서(Rust NAPI)를 사용하여 구문만 파싱합니다 — 타입 체킹 없이, 네이티브 Rust로 실행하며, 메모리 효율을 위한 배치 처리를 합니다.

macOS (Apple Silicon), Node.js v22, 3회 측정 중앙값. TypeDoc 0.28에 `--skipErrorChecking` 적용.

| 측정 항목 (es-toolkit, 603 파일) | oxdoc | TypeDoc 0.28 | 배율 |
|--------------------------------|-------|-------------|------|
| JSON 생성 | **0.24s** | 1.70s | 7x 빠름 |
| HTML 생성 | **0.25s** | 2.53s | 10x 빠름 |
| 피크 메모리 | **131MB** | 470MB | 3.6x 적음 |

| 측정 항목 (radashi, 162 파일) | oxdoc | TypeDoc 0.28 | 배율 |
|-----------------------------|-------|-------------|------|
| JSON 생성 | **0.13s** | 1.12s | 8.6x 빠름 |
| 피크 메모리 | **84MB** | 272MB | 3.2x 적음 |

### vs JSDoc

JSDoc은 JavaScript용 클래식 문서 생성기입니다. TypeScript를 네이티브로 지원하지 않으며 문서 커버리지 체크나 Doc 테스트 같은 현대적 기능이 없습니다.

### vs deno doc

deno doc도 Rust 기반(내부적으로 SWC 사용)으로 비슷한 파싱 속도를 제공합니다. 하지만 다음이 없습니다:
- 문서 커버리지 측정
- Doc 테스트
- 커버리지 뱃지 생성
- API 변경 감지
- 플러그인 시스템
- 다양한 출력 포맷 (Markdown, llms.txt)

### vs ESDoc

ESDoc은 내장 문서 커버리지를 제공하는 몇 안 되는 도구였지만, **더 이상 유지보수되지 않습니다**. JavaScript만 지원하고 TypeScript는 지원하지 않습니다.

## 언제 어떤 도구를 사용할까

| 사용 사례 | 추천 도구 |
|----------|----------|
| 속도가 필요한 대규모 TS/JS 프로젝트 | **oxdoc** |
| 깊은 타입 리졸빙 및 추론 필요 | TypeDoc |
| JavaScript 전용 레거시 프로젝트 | JSDoc |
| Deno 프로젝트 | deno doc |
| Angular/NestJS 프로젝트 | Compodoc |
| CI 문서 품질 게이트 (커버리지 + 테스트) | **oxdoc** |
| PR에서 API 변경 감지 | **oxdoc** |
| AI/LLM 최적화 문서 | **oxdoc** |

## TypeDoc이 더 나은 점

공정하게 말하면, TypeDoc이 더 나은 영역도 있습니다:

- **깊은 타입 리졸빙** — TypeDoc은 타입 별칭을 해석하고, import를 추적하며, 복잡한 타입을 확장합니다. oxdoc은 소스 코드에 작성된 그대로 시그니처를 추출합니다.
- **성숙한 플러그인 생태계** — TypeDoc에는 대규모 커뮤니티 플러그인 생태계가 있습니다.
- **파일 간 타입 링킹** — TypeDoc은 파일 간 타입 참조를 연결할 수 있습니다.

이러한 트레이드오프는 의도적인 것입니다: oxdoc은 타입 시스템의 깊이보다 속도와 단순함을 우선합니다.
