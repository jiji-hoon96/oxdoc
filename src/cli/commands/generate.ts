import { Command } from "commander";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { generateJSON } from "../../lib/generator/json.js";
import { generateMarkdown } from "../../lib/generator/markdown.js";
import { generateLlmsTxt } from "../../lib/generator/llms-txt.js";
import { generateHTML } from "../../lib/generator/html.js";
import { loadConfig } from "../../lib/config/index.js";
import { runPlugins } from "../../lib/plugins/index.js";
import { watchDirectory } from "../../lib/utils/watcher.js";
import type { OxdocPlugin } from "../../types/plugin.js";
import { logger } from "../../lib/utils/logger.js";
import { reportParseErrors } from "../../lib/utils/report-errors.js";

interface GenerateOptions {
  sourceRoot: string;
  outputDir: string;
  format: string;
  include?: string[];
  exclude?: string[];
  repository: string;
  plugins: OxdocPlugin[];
}

async function runGenerate(opts: GenerateOptions): Promise<void> {
  const project = await parseProject(opts.sourceRoot, {
    include: opts.include,
    exclude: opts.exclude,
  });
  reportParseErrors(project.metadata.errors);

  const totalSymbols = project.files.reduce(
    (sum, f) => sum + f.symbols.length,
    0,
  );
  logger.info(
    `Found ${project.files.length} files, ${totalSymbols} symbols`,
  );

  // 플러그인 실행
  if (opts.plugins.length > 0) {
    logger.info(`Running ${opts.plugins.length} plugin(s)...`);
    const pluginResults = runPlugins(opts.plugins, project);

    if (pluginResults.outputFiles.length > 0) {
      mkdirSync(opts.outputDir, { recursive: true });
      for (const file of pluginResults.outputFiles) {
        const outPath = join(opts.outputDir, file.filename);
        writeFileSync(outPath, file.content, "utf-8");
        logger.success(`Plugin output: ${outPath}`);
      }
    }

    for (const result of pluginResults.analysisResults) {
      logger.info(`[${result.pluginName}] ${result.summary}`);
      for (const issue of result.issues) {
        const prefix = issue.severity === "error" ? "✗" : issue.severity === "warning" ? "⚠" : "ℹ";
        console.log(`  ${prefix} ${issue.message}`);
      }
    }
  }

  mkdirSync(opts.outputDir, { recursive: true });

  const format = opts.format;
  if (format === "json") {
    const output = generateJSON(project);
    const outPath = join(opts.outputDir, "api.json");
    writeFileSync(outPath, output, "utf-8");
    logger.success(`JSON documentation written to ${outPath}`);
  } else if (format === "markdown" || format === "md") {
    const output = generateMarkdown(project);
    const outPath = join(opts.outputDir, "api.md");
    writeFileSync(outPath, output, "utf-8");
    logger.success(`Markdown documentation written to ${outPath}`);
  } else if (format === "llms-txt" || format === "llms") {
    const output = generateLlmsTxt(project);
    const outPath = join(opts.outputDir, "llms.txt");
    writeFileSync(outPath, output, "utf-8");
    logger.success(`llms.txt documentation written to ${outPath}`);
  } else if (format === "html") {
    const output = generateHTML(project, { repository: opts.repository || undefined });
    const outPath = join(opts.outputDir, "index.html");
    writeFileSync(outPath, output, "utf-8");
    logger.success(`HTML documentation written to ${outPath}`);
  } else {
    logger.error(`Unknown format: ${format}. Use 'json', 'markdown', 'html', or 'llms-txt'.`);
    process.exit(1);
  }
}

export const generateCommand = new Command("generate")
  .description("Generate API documentation from source files")
  .argument("[path]", "Source directory path")
  .option("-f, --format <format>", "Output format (json, markdown, llms-txt)")
  .option("-o, --output <dir>", "Output directory")
  .option("-w, --watch", "Watch for file changes and regenerate", false)
  .option("--include <patterns...>", "Include glob patterns")
  .option("--exclude <patterns...>", "Exclude glob patterns")
  .action(async (sourcePath: string | undefined, options) => {
    const config = await loadConfig();

    const opts: GenerateOptions = {
      sourceRoot: resolve(sourcePath ?? config.sourceRoot),
      outputDir: resolve(options.output ?? config.output.dir),
      format: (options.format ?? config.output.format).toLowerCase(),
      include: options.include ?? config.include,
      exclude: options.exclude ?? config.exclude,
      repository: config.repository,
      plugins: (config.plugins ?? []) as OxdocPlugin[],
    };

    logger.info(`Parsing source files from ${opts.sourceRoot}...`);
    await runGenerate(opts);

    if (options.watch) {
      logger.info("Watching for changes... (Ctrl+C to stop)");
      await watchDirectory(opts.sourceRoot, async (filename) => {
        logger.info(`File changed: ${filename ?? "unknown"}`);
        await runGenerate(opts);
      });
    }
  });
