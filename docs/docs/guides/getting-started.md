---
sidebar_position: 1
---

# 시작하기

## 설치

```bash
# npm
npm install -D oxdoc

# pnpm
pnpm add -D oxdoc

# 또는 npx로 직접 실행
npx oxdoc --help
```

## 요구사항

- Node.js 20 이상
- TypeScript/JavaScript 프로젝트

## 기본 사용법

### 1. API 문서 생성

소스 코드에서 JSDoc/TSDoc 주석을 추출하여 문서를 생성합니다.

```bash
# JSON 형식 (기본)
npx oxdoc generate ./src

# Markdown 형식
npx oxdoc generate ./src --format markdown

# 출력 디렉토리 지정
npx oxdoc generate ./src --format markdown --output ./api-docs
```

### 2. 문서 커버리지 체크

export된 심볼 중 JSDoc이 있는 비율을 측정합니다.

```bash
# 커버리지 확인
npx oxdoc coverage ./src

# 임계값 설정 (CI용 - 미달 시 exit code 1)
npx oxdoc coverage ./src --threshold 80

# JSON 형식으로 출력
npx oxdoc coverage ./src --format json

# 비export 심볼도 포함
npx oxdoc coverage ./src --all
```

### 3. Doc Test 실행

`@example` 블록의 코드가 실제로 동작하는지 검증합니다.

```bash
npx oxdoc doctest ./src

# 첫 실패 시 중단
npx oxdoc doctest ./src --bail
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

| 종류 | 예시 | 추출 |
|------|------|------|
| 함수 | `export function foo()` | O |
| 클래스 | `export class Foo` | O (멤버 포함) |
| 인터페이스 | `export interface IFoo` | O (프로퍼티 포함) |
| 타입 별칭 | `export type Foo = ...` | O |
| 열거형 | `export enum Foo` | O |
| 변수 | `export const FOO = ...` | O |

## 지원하는 JSDoc 태그

`@param`, `@returns`, `@example`, `@typeParam`, `@throws`, `@since`, `@deprecated`, `@see` 및 커스텀 태그
