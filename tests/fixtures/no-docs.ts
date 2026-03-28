export function undocumentedFn(x: number): number {
  return x * 2;
}

export const MAGIC_NUMBER = 42;

export interface Config {
  debug: boolean;
  port: number;
}

export type Callback = (err: Error | null, result: unknown) => void;
