import { Command } from "commander";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { generateJSON } from "../../lib/generator/json.js";
import { generateMarkdown } from "../../lib/generator/markdown.js";
import { loadConfig } from "../../lib/config/index.js";
import { logger } from "../../lib/utils/logger.js";

export const generateCommand = new Command("generate")
  .description("Generate API documentation from source files")
  .argument("[path]", "Source directory path")
  .option("-f, --format <format>", "Output format (json, markdown)")
  .option("-o, --output <dir>", "Output directory")
  .option("--include <patterns...>", "Include glob patterns")
  .option("--exclude <patterns...>", "Exclude glob patterns")
  .action(async (sourcePath: string | undefined, options) => {
    const config = await loadConfig();

    const sourceRoot = resolve(sourcePath ?? config.sourceRoot);
    const outputDir = resolve(options.output ?? config.output.dir);
    const format = (options.format ?? config.output.format).toLowerCase();
    const include = options.include ?? config.include;
    const exclude = options.exclude ?? config.exclude;

    logger.info(`Parsing source files from ${sourceRoot}...`);

    const project = await parseProject(sourceRoot, { include, exclude });

    const totalSymbols = project.files.reduce(
      (sum, f) => sum + f.symbols.length,
      0,
    );
    logger.info(
      `Found ${project.files.length} files, ${totalSymbols} symbols`,
    );

    mkdirSync(outputDir, { recursive: true });

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
