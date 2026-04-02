---
sidebar_position: 1
---

# 시작하기

## 설치

```bash
# npm
npm install -D @jiji-hoon96/oxdoc

# pnpm
pnpm add -D @jiji-hoon96/oxdoc

# 또는 npx로 직접 실행
npx @jiji-hoon96/oxdoc --help
```

## 요구사항

- Node.js 20 이상
- TypeScript/JavaScript 프로젝트

## 기본 사용법

### 1. API 문서 생성

소스 코드에서 JSDoc/TSDoc 주석을 추출하여 문서를 생성합니다.

```bash
# JSON 형식 (기본)
npx @jiji-hoon96/oxdoc generate ./src

# Markdown 형식
npx @jiji-hoon96/oxdoc generate ./src --format markdown

# HTML 형식 (사이드바, 검색, 다크 테마를 갖춘 단일 페이지)
npx @jiji-hoon96/oxdoc generate ./src --format html

# 출력 디렉토리 지정
npx @jiji-hoon96/oxdoc generate ./src --format markdown --output ./api-docs
```

### 2. 문서 커버리지 체크

export된 심볼 중 JSDoc이 있는 비율을 측정합니다.

```bash
# 커버리지 확인
npx @jiji-hoon96/oxdoc coverage ./src

# 임계값 설정 (CI용 - 미달 시 exit code 1)
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# JSON 형식으로 출력
npx @jiji-hoon96/oxdoc coverage ./src --format json

# 비export 심볼도 포함
npx @jiji-hoon96/oxdoc coverage ./src --all
```

### 3. Doc Test 실행

`@example` 블록의 코드가 실제로 동작하는지 검증합니다.

```bash
npx @jiji-hoon96/oxdoc doctest ./src

# 첫 실패 시 중단
npx @jiji-hoon96/oxdoc doctest ./src --bail
```

#### Doc Test 작성법

`// =>` 패턴으로 기대값을 명시하면 자동으로 assertion이 됩니다:

```typescript
/**
 * 두 숫자를 더합니다.
 * @param a - 첫 번째 숫자
 * @param b - 두 번째 숫자
 * @returns 합
 * @example
 * ```ts
 * add(1, 2) // => 3
 * add(-1, 1) // => 0
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## 지원하는 심볼 종류

| 종류 | 예시 | 추출 데이터 |
|------|------|------------|
| 함수 | `export function foo()` | 시그니처, JSDoc, 오버로드 |
| 클래스 | `export class Foo` | 메서드, 프로퍼티, getter/setter, static 멤버 |
| 인터페이스 | `export interface IFoo` | 프로퍼티 (JSDoc 포함) |
| 타입 별칭 | `export type Foo = ...` | 시그니처, JSDoc |
| 열거형 | `export enum Foo { A, B }` | 멤버 (값, JSDoc 포함) |
| 변수 | `export const FOO = ...` | 시그니처, JSDoc |
| 네임스페이스 | `export namespace Utils` | export된 자식 심볼 |
| Re-export | `export { X } from './y'` | 출처 모듈 추적 |
| Default Export | `export default function` | `isDefault` 플래그 |

## 지원하는 JSDoc 태그

`@param`, `@returns`, `@example`, `@typeParam`, `@throws`, `@since`, `@deprecated`, `@see` 및 커스텀 태그
