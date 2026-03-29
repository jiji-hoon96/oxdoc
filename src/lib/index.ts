export { parseFile, parseSource, parseProject } from "./parser/index.js";
export { parseJSDoc, isJSDocComment } from "./parser/jsdoc.js";
export { calculateCoverage } from "./analyzer/coverage.js";
export { extractDocTests, runDocTests } from "./analyzer/doctest.js";
export { generateJSON } from "./generator/json.js";
export { generateMarkdown } from "./generator/markdown.js";
export { loadConfig, mergeConfig } from "./config/index.js";
export type { OxdocConfig } from "./config/index.js";
export type * from "../types/index.js";
