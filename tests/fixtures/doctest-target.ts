/**
 * 두 수를 더한다.
 * @param a - 첫 번째 수
 * @param b - 두 번째 수
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

/**
 * 인사 메시지를 생성한다.
 * @example
 * ```ts
 * console.log(greet('world'));
 * ```
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * 브라우저 전용 함수.
 * @example
 * ```ts
 * document.querySelector('.foo');
 * ```
 */
export function browserOnly(): void {}
