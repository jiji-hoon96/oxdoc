import { Command } from "commander";
import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { parseProject } from "../../lib/parser/index.js";
import { diffAPI } from "../../lib/analyzer/diff.js";
import { loadConfig } from "../../lib/config/index.js";
import { logger } from "../../lib/utils/logger.js";
import { reportParseErrors } from "../../lib/utils/report-errors.js";
import type { ProjectDocumentation } from "../../types/index.js";
import chalk from "chalk";

export const diffCommand = new Command("diff")
  .description("Detect API changes between a previous snapshot and current source")
  .argument("<snapshot>", "Path to previous api.json snapshot")
  .argument("[path]", "Source directory path")
  .option("--fail-on-breaking", "Exit with code 1 if breaking changes found", false)
  .option("--format <format>", "Output format (text, json)", "text")
  .action(async (snapshotPath: string, sourcePath: string | undefined, options) => {
    const config = await loadConfig();
    const sourceRoot = resolve(sourcePath ?? config.sourceRoot);
    const resolvedSnapshot = resolve(snapshotPath);

    if (!existsSync(resolvedSnapshot)) {
      logger.error(`Snapshot file not found: ${resolvedSnapshot}`);
      process.exit(1);
    }

    let previous: ProjectDocumentation;
    try {
      previous = JSON.parse(readFileSync(resolvedSnapshot, "utf-8"));
    } catch {
      logger.error(`Failed to parse snapshot file: ${resolvedSnapshot}`);
      process.exit(1);
    }

    const current = await parseProject(sourceRoot, {
      include: config.include,
      exclude: config.exclude,
    });
    reportParseErrors(current.metadata.errors);

    const report = diffAPI(previous, current);

    if (options.format === "json") {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("");
      console.log(chalk.bold("  API Diff Report"));
      console.log(chalk.gray("  " + "─".repeat(35)));
      console.log(
        `  Added:     ${chalk.green(String(report.summary.added))}`,
      );
      console.log(
        `  Removed:   ${chalk.red(String(report.summary.removed))}`,
      );
      console.log(
        `  Changed:   ${chalk.yellow(String(report.summary.changed))}`,
      );
      console.log("");

      if (report.summary.breaking > 0) {
        console.log(chalk.red.bold(`  ⚠ ${report.summary.breaking} breaking change(s) detected`));
        console.log("");
      }

      for (const change of report.changes) {
        const icon = change.type === "added" ? chalk.green("+")
          : change.type === "removed" ? chalk.red("−")
          : chalk.yellow("~");
        const severityLabel = change.severity === "breaking"
          ? chalk.red("[BREAKING]")
          : chalk.green("[safe]");
        console.log(`  ${icon} ${severityLabel} ${change.detail}`);
        console.log(`    ${chalk.gray(`${change.file} (${change.kind})`)}`);
      }

      if (report.changes.length === 0) {
        logger.success("No API changes detected");
      }
      console.log("");
    }

    if (options.failOnBreaking && report.summary.breaking > 0) {
      logger.error(`${report.summary.breaking} breaking change(s) found`);
      process.exit(1);
    }
  });
