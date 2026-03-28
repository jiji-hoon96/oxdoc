/**
 * 두 숫자를 더합니다.
 * @param a - 첫 번째 숫자
 * @param b - 두 번째 숫자
 * @returns 두 숫자의 합
 * @example
 * ```ts
 * add(1, 2) // => 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * 두 숫자를 뺍니다.
 * @param a - 피감수
 * @param b - 감수
 * @returns 뺄셈 결과
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

// JSDoc이 없는 함수
export function multiply(a: number, b: number): number {
  return a * b;
}
