---
sidebar_position: 1
---

# ADR-001: OXC 파서 선택

## 상태
Accepted

## 컨텍스트
TypeScript/JavaScript API 문서 생성을 위해 소스 코드를 파싱하는 도구가 필요하다. 후보:
- **TypeScript Compiler API (tsc)**: 완전한 타입 정보 제공, 하지만 느리고 메모리 소비 큼
- **Babel**: 성숙한 생태계, 하지만 느림 (~50ms/파일)
- **SWC**: Rust 기반, 빠르지만 JSDoc 파싱 지원 부족
- **OXC (oxc-parser)**: Rust NAPI 바인딩, 가장 빠른 JS/TS 파서, ESTree 호환 AST

## 결정
**oxc-parser**를 선택한다.

- Rust NAPI 바인딩으로 네이티브 속도 파싱 (Babel 대비 10-50x)
- `parseSync()` API로 AST + comments 배열을 동기적으로 반환
- ESTree 호환 AST 포맷
- 활발한 OXC 커뮤니티 (20K+ GitHub stars)

## 결과
- JSDoc 파싱은 별도 처리 필요 (OXC는 comments 배열만 제공)
- 타입 리졸빙 불가 (향후 tsgo 연동으로 해결 예정)
- 선언 시그니처는 소스 텍스트에서 직접 추출
