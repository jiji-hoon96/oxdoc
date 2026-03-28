import { Command } from "commander";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { generateJSON } from "../../lib/generator/json.js";
import { generateMarkdown } from "../../lib/generator/markdown.js";
import { logger } from "../../lib/utils/logger.js";

export const generateCommand = new Command("generate")
  .description("Generate API documentation from source files")
  .argument("[path]", "Source directory path", "./src")
  .option("-f, --format <format>", "Output format (json, markdown)", "json")
  .option("-o, --output <dir>", "Output directory", "./docs-output")
  .option("--include <patterns...>", "Include glob patterns")
  .option("--exclude <patterns...>", "Exclude glob patterns")
  .action(async (sourcePath: string, options) => {
    const sourceRoot = resolve(sourcePath);
    const outputDir = resolve(options.output);

    logger.info(`Parsing source files from ${sourceRoot}...`);

    const project = await parseProject(sourceRoot, {
      include: options.include,
      exclude: options.exclude,
    });

    const totalSymbols = project.files.reduce(
      (sum, f) => sum + f.symbols.length,
      0,
    );
    logger.info(
      `Found ${project.files.length} files, ${totalSymbols} symbols`,
    );

    mkdirSync(outputDir, { recursive: true });

    const format = options.format.toLowerCase();

    if (format === "json") {
      const output = generateJSON(project);
      const outPath = join(outputDir, "api.json");
      writeFileSync(outPath, output, "utf-8");
      logger.success(`JSON documentation written to ${outPath}`);
    } else if (format === "markdown" || format === "md") {
      const output = generateMarkdown(project);
      const outPath = join(outputDir, "api.md");
      writeFileSync(outPath, output, "utf-8");
      logger.success(`Markdown documentation written to ${outPath}`);
    } else {
      logger.error(`Unknown format: ${format}. Use 'json' or 'markdown'.`);
      process.exit(1);
    }
  });
