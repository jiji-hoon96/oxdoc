/**
 * 간단한 계산기 클래스
 * @example
 * ```ts
 * const calc = new Calculator();
 * calc.add(1);
 * calc.getResult() // => 1
 * ```
 */
export class Calculator {
  private result = 0;

  /**
   * 현재 결과에 값을 더합니다.
   * @param value - 더할 값
   */
  add(value: number): void {
    this.result += value;
  }

  /**
   * 현재 결과에서 값을 뺍니다.
   * @param value - 뺄 값
   */
  subtract(value: number): void {
    this.result -= value;
  }

  /** 현재 결과를 반환합니다. */
  getResult(): number {
    return this.result;
  }

  // JSDoc 없는 메서드
  reset(): void {
    this.result = 0;
  }
}
