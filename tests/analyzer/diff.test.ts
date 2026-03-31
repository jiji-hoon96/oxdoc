import { describe, it, expect } from "vitest";
import { diffAPI } from "../../src/lib/analyzer/diff.js";
import type { ProjectDocumentation } from "../../src/types/index.js";

function makeProject(symbols: Array<{ name: string; kind: string; signature: string; file?: string }>): ProjectDocumentation {
  const byFile = new Map<string, typeof symbols>();
  for (const s of symbols) {
    const file = s.file ?? "src/index.ts";
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file)!.push(s);
  }

  return {
    files: [...byFile.entries()].map(([filePath, syms]) => ({
      filePath,
      fileDoc: null,
      symbols: syms.map((s) => ({
        name: s.name,
        kind: s.kind as any,
        signature: s.signature,
        exported: true,
        doc: null,
        location: { file: filePath, line: 1, column: 0 },
      })),
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      version: "0.1.0",
      sourceRoot: "./src",
      errors: [],
    },
  };
}

describe("diffAPI", () => {
  it("should detect no changes for identical APIs", () => {
    const project = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
    ]);
    const report = diffAPI(project, project);
    expect(report.changes).toHaveLength(0);
    expect(report.summary.breaking).toBe(0);
  });

  it("should detect added symbols as non-breaking", () => {
    const prev = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
    ]);
    const curr = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
      { name: "subtract", kind: "function", signature: "function subtract(a: number, b: number): number" },
    ]);
    const report = diffAPI(prev, curr);
    expect(report.summary.added).toBe(1);
    expect(report.summary.breaking).toBe(0);
    expect(report.changes[0].type).toBe("added");
    expect(report.changes[0].severity).toBe("non-breaking");
  });

  it("should detect removed symbols as breaking", () => {
    const prev = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
      { name: "subtract", kind: "function", signature: "function subtract(a: number, b: number): number" },
    ]);
    const curr = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
    ]);
    const report = diffAPI(prev, curr);
    expect(report.summary.removed).toBe(1);
    expect(report.summary.breaking).toBe(1);
    expect(report.changes[0].type).toBe("removed");
    expect(report.changes[0].severity).toBe("breaking");
  });

  it("should detect signature changes as breaking", () => {
    const prev = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number): number" },
    ]);
    const curr = makeProject([
      { name: "add", kind: "function", signature: "function add(a: number, b: number, c: number): number" },
    ]);
    const report = diffAPI(prev, curr);
    expect(report.summary.changed).toBe(1);
    expect(report.summary.breaking).toBe(1);
    expect(report.changes[0].type).toBe("changed");
  });

  it("should detect kind changes as breaking", () => {
    const prev = makeProject([
      { name: "Config", kind: "interface", signature: "interface Config" },
    ]);
    const curr = makeProject([
      { name: "Config", kind: "type", signature: "type Config" },
    ]);
    const report = diffAPI(prev, curr);
    expect(report.summary.breaking).toBeGreaterThan(0);
  });

  it("should handle empty projects", () => {
    const empty = makeProject([]);
    const report = diffAPI(empty, empty);
    expect(report.changes).toHaveLength(0);
  });
});
