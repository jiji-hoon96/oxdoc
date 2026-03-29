import { Command } from "commander";
import { resolve } from "node:path";
import { parseProject } from "../../lib/parser/index.js";
import { calculateCoverage } from "../../lib/analyzer/coverage.js";
import { loadConfig } from "../../lib/config/index.js";
import { logger } from "../../lib/utils/logger.js";
import { reportParseErrors } from "../../lib/utils/report-errors.js";
import chalk from "chalk";

export const coverageCommand = new Command("coverage")
  .description("Check documentation coverage")
  .argument("[path]", "Source directory path")
  .option("-t, --threshold <percent>", "Minimum coverage threshold (%)")
  .option("--all", "Include non-exported symbols", false)
  .option("--format <format>", "Output format (text, json)", "text")
  .action(async (sourcePath: string | undefined, options) => {
    const config = await loadConfig();
    const sourceRoot = resolve(sourcePath ?? config.sourceRoot);
    const threshold = options.threshold != null ? parseFloat(options.threshold) : config.coverage.threshold;

    const project = await parseProject(sourceRoot);
    reportParseErrors(project.metadata.errors);
    const report = calculateCoverage(project, {
      exportedOnly: !options.all,
      threshold,
    });

    if (options.format === "json") {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    // Text 출력
    console.log("");
    console.log(chalk.bold("  Documentation Coverage Report"));
    console.log(chalk.gray("  " + "─".repeat(35)));
    console.log(
      `  Total symbols:      ${report.totalSymbols}`,
    );
    console.log(
      `  Documented:         ${report.documentedSymbols}  (${report.coveragePercent}%)`,
    );
    console.log(
      `  Undocumented:       ${report.undocumentedSymbols.length}`,
    );
    console.log("");

    // 종류별 통계
    if (Object.keys(report.byKind).length > 0) {
      console.log(chalk.bold("  By kind:"));
      for (const [kind, stats] of Object.entries(report.byKind)) {
        if (!stats) continue;
        const pct = stats.total === 0 ? 100 : (stats.documented / stats.total) * 100;
        const pctStr = pct.toFixed(1);
        const color = pct >= 80 ? chalk.green : pct >= 50 ? chalk.yellow : chalk.red;
        console.log(
          `    ${kind.padEnd(14)} ${stats.documented}/${stats.total}  ${color(`(${pctStr}%)`)}`,
        );
      }
      console.log("");
    }

    // 미문서화 심볼 목록
    if (report.undocumentedSymbols.length > 0) {
      console.log(chalk.bold("  Undocumented symbols:"));
      for (const sym of report.undocumentedSymbols) {
        console.log(
          `    ${chalk.yellow("⚠")} ${sym.location.file}:${sym.location.line}  ${chalk.gray(sym.kind)}  ${sym.name}`,
        );
      }
      console.log("");
    }

    // 임계값 체크
    if (threshold > 0) {
      if (report.coveragePercent >= threshold) {
        logger.success(
          `Coverage ${report.coveragePercent}% meets threshold ${threshold}%`,
        );
      } else {
        logger.error(
          `Coverage ${report.coveragePercent}% is below threshold ${threshold}%`,
        );
        process.exit(1);
      }
    }
  });
