import type { ProjectDocumentation, DocumentedSymbol } from "../../types/index.js";

export type ChangeType = "added" | "removed" | "changed";
export type Severity = "breaking" | "non-breaking";

export interface APIChange {
  type: ChangeType;
  severity: Severity;
  symbol: string;
  kind: string;
  file: string;
  detail: string;
}

export interface DiffReport {
  changes: APIChange[];
  summary: {
    breaking: number;
    nonBreaking: number;
    added: number;
    removed: number;
    changed: number;
  };
}

interface SymbolKey {
  name: string;
  kind: string;
  file: string;
  signature: string;
  exported: boolean;
}

function extractSymbolKeys(project: ProjectDocumentation): Map<string, SymbolKey> {
  const map = new Map<string, SymbolKey>();
  for (const file of project.files) {
    for (const sym of file.symbols) {
      if (!sym.exported) continue;
      const key = `${file.filePath}::${sym.name}`;
      map.set(key, {
        name: sym.name,
        kind: sym.kind,
        file: file.filePath,
        signature: sym.signature,
        exported: sym.exported,
      });
    }
  }
  return map;
}

/**
 * Compare two API snapshots and detect changes.
 * @param previous - Previous project documentation (from JSON)
 * @param current - Current project documentation
 * @returns Diff report with categorized changes
 */
export function diffAPI(
  previous: ProjectDocumentation,
  current: ProjectDocumentation,
): DiffReport {
  const prevSymbols = extractSymbolKeys(previous);
  const currSymbols = extractSymbolKeys(current);
  const changes: APIChange[] = [];

  // Detect removed symbols (breaking)
  for (const [key, prev] of prevSymbols) {
    if (!currSymbols.has(key)) {
      changes.push({
        type: "removed",
        severity: "breaking",
        symbol: prev.name,
        kind: prev.kind,
        file: prev.file,
        detail: `Exported ${prev.kind} "${prev.name}" was removed`,
      });
    }
  }

  // Detect added symbols (non-breaking)
  for (const [key, curr] of currSymbols) {
    if (!prevSymbols.has(key)) {
      changes.push({
        type: "added",
        severity: "non-breaking",
        symbol: curr.name,
        kind: curr.kind,
        file: curr.file,
        detail: `Exported ${curr.kind} "${curr.name}" was added`,
      });
    }
  }

  // Detect changed signatures (breaking)
  for (const [key, curr] of currSymbols) {
    const prev = prevSymbols.get(key);
    if (!prev) continue;

    if (prev.signature !== curr.signature) {
      changes.push({
        type: "changed",
        severity: "breaking",
        symbol: curr.name,
        kind: curr.kind,
        file: curr.file,
        detail: `Signature changed: "${prev.signature}" → "${curr.signature}"`,
      });
    }

    if (prev.kind !== curr.kind) {
      changes.push({
        type: "changed",
        severity: "breaking",
        symbol: curr.name,
        kind: curr.kind,
        file: curr.file,
        detail: `Kind changed: ${prev.kind} → ${curr.kind}`,
      });
    }
  }

  const summary = {
    breaking: changes.filter((c) => c.severity === "breaking").length,
    nonBreaking: changes.filter((c) => c.severity === "non-breaking").length,
    added: changes.filter((c) => c.type === "added").length,
    removed: changes.filter((c) => c.type === "removed").length,
    changed: changes.filter((c) => c.type === "changed").length,
  };

  return { changes, summary };
}
