---
sidebar_position: 1
---

# oxdoc 소개

**oxdoc**은 [OXC](https://oxc.rs/) 파서를 활용한 네이티브 속도 TypeScript/JavaScript API 문서 생성기입니다.

## 왜 oxdoc인가?

TypeDoc은 TypeScript Compiler(tsc)에 의존하여 대형 프로젝트에서 심각한 성능 문제가 발생합니다:

- 110K LOC 모노레포에서 **12GB 메모리** 필요
- 대형 프로젝트에서 **OOM(Out of Memory)** 크래시
- 검색 인덱스 초기화에 **35초 이상** 소요

oxdoc은 Rust NAPI 바인딩 기반의 OXC 파서를 사용하여 **10-100x 빠른 파싱 속도**를 제공합니다.

## 주요 기능

- **JSDoc/TSDoc 추출** - 소스 코드에서 API 문서 자동 생성
- **문서 커버리지** - export된 심볼의 문서화 비율 측정
- **Doc Test** - `@example` 블록의 코드를 실제 실행하여 검증
- **다양한 출력** - JSON, Markdown, HTML, llms.txt (AI 친화) 포맷 지원
- **플러그인 시스템** - Transform, Output, Analyzer 훅으로 확장 가능
- **Watch 모드** - 파일 변경 감지 시 자동 문서 재생성
- **설정 파일** - `oxdoc.config.json` 또는 `package.json`의 `oxdoc` 필드

## 빠른 시작

```bash
# API 문서 생성
npx @jiji-hoon96/oxdoc generate ./src --format markdown

# 문서 커버리지 체크
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# Doc test 실행
npx @jiji-hoon96/oxdoc doctest ./src
```
