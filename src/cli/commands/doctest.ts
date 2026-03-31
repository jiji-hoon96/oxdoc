import { Command } from "commander";
import { resolve } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { extractDocTests, runDocTests } from "../../lib/analyzer/doctest.js";
import { loadConfig } from "../../lib/config/index.js";
import { logger } from "../../lib/utils/logger.js";
import chalk from "chalk";

export const doctestCommand = new Command("doctest")
  .description("Run @example code blocks as tests")
  .argument("[path]", "Source directory path")
  .option("--bail", "Stop on first failure", false)
  .option("--reporter <format>", "Output format (text, json)", "text")
  .action(async (sourcePath: string | undefined, options) => {
    const config = await loadConfig();
    const sourceRoot = resolve(sourcePath ?? config.sourceRoot);

    logger.info(`Extracting doc tests from ${sourceRoot}...`);

    const project = await parseProject(sourceRoot, {
      include: config.include,
      exclude: config.exclude,
    });
    const tests = extractDocTests(project);

    if (tests.length === 0) {
      logger.warn("No @example blocks with code found.");
      return;
    }

    logger.info(`Found ${tests.length} doc test(s). Running...`);
    console.log("");

    const results = runDocTests(tests, sourceRoot);

    let passed = 0;
    let failed = 0;

    for (const result of results) {
      if (result.passed) passed++;
      else failed++;
    }

    if (options.reporter === "json") {
      console.log(JSON.stringify({ passed, failed, total: results.length, results }, null, 2));
      if (failed > 0) process.exit(1);
      return;
    }

    // Text reporter
    for (const result of results) {
      if (result.passed) {
        console.log(
          `  ${chalk.green("✓")} ${result.symbolName} (${result.filePath}:${result.line}) - ${result.assertionCount} assertion(s) passed`,
        );
      } else {
        console.log(
          `  ${chalk.red("✗")} ${result.symbolName} (${result.filePath}:${result.line})`,
        );
        if (result.error) {
          console.log(`    ${chalk.gray(result.error)}`);
        }
        if (options.bail) {
          console.log("");
          logger.error("Bailed on first failure.");
          process.exit(1);
        }
      }
    }

    console.log("");
    console.log(
      `  Results: ${chalk.green(`${passed} passed`)}, ${failed > 0 ? chalk.red(`${failed} failed`) : `${failed} failed`}, ${results.length} total`,
    );

    if (failed > 0) {
      process.exit(1);
    }
  });
