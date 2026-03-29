import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const FIXTURE_DIR = join(import.meta.dirname, "fixtures");

const FUNCTION_TEMPLATES = [
  (i: number) => `
/**
 * Adds ${i} to the given number.
 * @param value - The input value
 * @returns The result of value + ${i}
 * @example
 * \`\`\`ts
 * add${i}(10) // => ${10 + i}
 * \`\`\`
 */
export function add${i}(value: number): number {
  return value + ${i};
}`,
  (i: number) => `
/**
 * Configuration interface for module ${i}.
 */
export interface Config${i} {
  /** Enable debug mode */
  debug: boolean;
  /** Port number */
  port: number;
  /** Module name */
  name: string;
}`,
  (i: number) => `
/**
 * Service class for handling module ${i} operations.
 */
export class Service${i} {
  /** Initialize the service */
  constructor(private config: { port: number }) {}

  /**
   * Start the service.
   * @returns true if started successfully
   */
  start(): boolean {
    return this.config.port > 0;
  }

  /** Stop the service */
  stop(): void {}
}`,
  (i: number) => `
/** Status type for module ${i} */
export type Status${i} = "idle" | "running" | "stopped";

/** Maximum retries for module ${i} */
export const MAX_RETRIES_${i} = ${i * 3};

export function process${i}(input: string): string {
  return input.toUpperCase();
}`,
];

export function generateFixtures(count: number): string {
  const dir = join(FIXTURE_DIR, `${count}`);
  if (existsSync(dir)) return dir;

  mkdirSync(dir, { recursive: true });

  for (let i = 0; i < count; i++) {
    const subdir = join(dir, `module-${Math.floor(i / 50)}`);
    mkdirSync(subdir, { recursive: true });

    const template = FUNCTION_TEMPLATES[i % FUNCTION_TEMPLATES.length];
    const content = [
      `// Auto-generated fixture file ${i}`,
      template(i),
      template(i + count),
    ].join("\n");

    writeFileSync(join(subdir, `file-${i}.ts`), content, "utf-8");
  }

  return dir;
}

// CLI 실행
if (process.argv[2]) {
  const count = parseInt(process.argv[2], 10);
  console.log(`Generating ${count} fixture files...`);
  const dir = generateFixtures(count);
  console.log(`Done: ${dir}`);
}
