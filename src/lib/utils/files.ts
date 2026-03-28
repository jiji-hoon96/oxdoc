import { glob } from "fast-glob";
import { readFile } from "node:fs/promises";

const DEFAULT_INCLUDE = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"];
const DEFAULT_EXCLUDE = [
  "**/*.test.*",
  "**/*.spec.*",
  "**/node_modules/**",
  "**/dist/**",
  "**/__tests__/**",
];

export interface FileSearchOptions {
  include?: string[];
  exclude?: string[];
}

export async function findSourceFiles(
  sourceRoot: string,
  options: FileSearchOptions = {},
): Promise<string[]> {
  const include = options.include ?? DEFAULT_INCLUDE;
  const exclude = options.exclude ?? DEFAULT_EXCLUDE;

  return glob(include, {
    cwd: sourceRoot,
    ignore: exclude,
    absolute: true,
  });
}

export async function readSourceFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf-8");
}
