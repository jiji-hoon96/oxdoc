import { performance } from "node:perf_hooks";
import { generateFixtures } from "./generate-fixtures.js";

// 동적 import로 parseProject를 가져옴
const { parseProject } = await import("../src/lib/parser/index.js");
const { calculateCoverage } = await import("../src/lib/analyzer/coverage.js");

const SCALES = [100, 500, 1000, 5000];

interface BenchResult {
  scale: number;
  parseTime: number;
  coverageTime: number;
  totalTime: number;
  fileCount: number;
  symbolCount: number;
  memoryMB: number;
}

async function benchmarkScale(scale: number): Promise<BenchResult> {
  // 픽스처 생성 (캐시됨)
  const dir = generateFixtures(scale);

  // GC 힌트
  if (global.gc) global.gc();
  const memBefore = process.memoryUsage().heapUsed;

  // Parse
  const parseStart = performance.now();
  const project = await parseProject(dir);
  const parseTime = performance.now() - parseStart;

  // Coverage
  const covStart = performance.now();
  calculateCoverage(project, { exportedOnly: true });
  const coverageTime = performance.now() - covStart;

  const memAfter = process.memoryUsage().heapUsed;
  const memoryMB = Math.round((memAfter - memBefore) / 1024 / 1024 * 10) / 10;

  const symbolCount = project.files.reduce(
    (sum, f) => sum + f.symbols.length,
    0,
  );

  return {
    scale,
    parseTime: Math.round(parseTime),
    coverageTime: Math.round(coverageTime),
    totalTime: Math.round(parseTime + coverageTime),
    fileCount: project.files.length,
    symbolCount,
    memoryMB,
  };
}

async function main() {
  console.log("oxdoc Benchmark");
  console.log("═".repeat(75));
  console.log("");

  console.log("Generating fixtures...");
  for (const scale of SCALES) {
    generateFixtures(scale);
  }
  console.log("Done.\n");

  const results: BenchResult[] = [];

  for (const scale of SCALES) {
    process.stdout.write(`Running ${scale} files... `);
    const result = await benchmarkScale(scale);
    results.push(result);
    console.log(`${result.totalTime}ms`);
  }

  console.log("");
  console.log("Results:");
  console.log("─".repeat(75));
  console.log(
    "Files".padEnd(8) +
    "Parsed".padEnd(10) +
    "Symbols".padEnd(10) +
    "Parse(ms)".padEnd(12) +
    "Cover(ms)".padEnd(12) +
    "Total(ms)".padEnd(12) +
    "Memory(MB)",
  );
  console.log("─".repeat(75));

  for (const r of results) {
    console.log(
      String(r.scale).padEnd(8) +
      String(r.fileCount).padEnd(10) +
      String(r.symbolCount).padEnd(10) +
      String(r.parseTime).padEnd(12) +
      String(r.coverageTime).padEnd(12) +
      String(r.totalTime).padEnd(12) +
      String(r.memoryMB),
    );
  }

  console.log("─".repeat(75));
  console.log("");

  // 파일당 처리 속도 계산
  if (results.length >= 2) {
    const last = results[results.length - 1];
    const filesPerSec = Math.round(
      (last.fileCount / last.parseTime) * 1000,
    );
    console.log(`Throughput: ~${filesPerSec} files/sec at ${last.scale} file scale`);
  }
}

main().catch(console.error);
