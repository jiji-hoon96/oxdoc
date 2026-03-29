import { Command } from "commander";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { generateJSON } from "../../lib/generator/json.js";
import { generateMarkdown } from "../../lib/generator/markdown.js";
import { generateLlmsTxt } from "../../lib/generator/llms-txt.js";
import { loadConfig } from "../../lib/config/index.js";
import { runPlugins } from "../../lib/plugins/index.js";
import type { OxdocPlugin } from "../../types/plugin.js";
import { logger } from "../../lib/utils/logger.js";
import { reportParseErrors } from "../../lib/utils/report-errors.js";

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
    reportParseErrors(project.metadata.errors);

    const totalSymbols = project.files.reduce(
      (sum, f) => sum + f.symbols.length,
      0,
    );
    logger.info(
      `Found ${project.files.length} files, ${totalSymbols} symbols`,
    );

    // 플러그인 실행
    const plugins = (config.plugins ?? []) as OxdocPlugin[];
    if (plugins.length > 0) {
      logger.info(`Running ${plugins.length} plugin(s)...`);
      const pluginResults = runPlugins(plugins, project);

      // 플러그인 출력 파일 저장
      if (pluginResults.outputFiles.length > 0) {
        mkdirSync(outputDir, { recursive: true });
        for (const file of pluginResults.outputFiles) {
          const outPath = join(outputDir, file.filename);
          writeFileSync(outPath, file.content, "utf-8");
          logger.success(`Plugin output: ${outPath}`);
        }
      }

      // 분석 결과 출력
      for (const result of pluginResults.analysisResults) {
        logger.info(`[${result.pluginName}] ${result.summary}`);
        for (const issue of result.issues) {
          const prefix = issue.severity === "error" ? "✗" : issue.severity === "warning" ? "⚠" : "ℹ";
          console.log(`  ${prefix} ${issue.message}`);
        }
      }
    }

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
    } else if (format === "llms-txt" || format === "llms") {
      const output = generateLlmsTxt(project);
      const outPath = join(outputDir, "llms.txt");
      writeFileSync(outPath, output, "utf-8");
      logger.success(`llms.txt documentation written to ${outPath}`);
    } else {
      logger.error(`Unknown format: ${format}. Use 'json', 'markdown', or 'llms-txt'.`);
      process.exit(1);
    }
  });
