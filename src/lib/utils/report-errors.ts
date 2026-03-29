import type { ParseError } from "../../types/index.js";
import { logger } from "./logger.js";

export function reportParseErrors(errors: ParseError[]): void {
  if (errors.length === 0) return;
  logger.warn(`${errors.length} file(s) failed to parse:`);
  for (const err of errors) {
    logger.warn(`  ${err.file}: ${err.message.split("\n")[0]}`);
  }
}
