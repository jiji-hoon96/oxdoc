---
sidebar_position: 2
---

# ADR-002: comment-parser 선택

## 상태
Accepted

## 컨텍스트
OXC 파서가 반환하는 JSDoc 주석 블록(`/** ... */`)을 구조화된 데이터로 파싱해야 한다. 후보:
- **@microsoft/tsdoc**: Microsoft의 TSDoc 표준 파서, 엄격한 표준 준수, 하지만 무겁다 (2.3MB)
- **comment-parser**: 경량 JSDoc 파서, 0 dependencies (379KB)
- **직접 구현**: 완전한 제어, 하지만 유지보수 부담

## 결정
**comment-parser**를 선택한다.

- 0 dependencies로 번들 크기 최소화
- JSDoc 표준 태그 완전 지원 (@param, @returns, @example 등)
- @microsoft/tsdoc 대비 6x 가벼움
- 커스텀 태그 지원으로 확장 가능

## 결과
- TSDoc 전용 태그 (@typeParam 등)는 일부 매핑 작업 필요
- TSDoc strict 모드의 유효성 검사는 제공하지 않음
- 충분한 기능을 최소한의 오버헤드로 제공
