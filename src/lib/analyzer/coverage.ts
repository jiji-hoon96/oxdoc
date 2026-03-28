import type {
  ProjectDocumentation,
  CoverageReport,
  DocumentedSymbol,
  SymbolKind,
} from "../../types/index.js";

export interface CoverageOptions {
  /** export된 심볼만 체크 (기본값: true) */
  exportedOnly?: boolean;
  /** 최소 커버리지 임계값 (%) */
  threshold?: number;
}

/**
 * 프로젝트의 문서 커버리지를 계산한다.
 * @param project - 프로젝트 문서 정보
 * @param options - 커버리지 옵션
 * @returns 커버리지 리포트
 */
export function calculateCoverage(
  project: ProjectDocumentation,
  options: CoverageOptions = {},
): CoverageReport {
  const exportedOnly = options.exportedOnly ?? true;

  const allSymbols: DocumentedSymbol[] = [];

  for (const file of project.files) {
    for (const symbol of file.symbols) {
      if (exportedOnly && !symbol.exported) continue;
      allSymbols.push(symbol);
    }
  }

  const documented = allSymbols.filter((s) => s.doc !== null);
  const undocumented = allSymbols.filter((s) => s.doc === null);
  const total = allSymbols.length;
  const coveragePercent = total === 0 ? 100 : (documented.length / total) * 100;

  // 종류별 통계
  const byKind: CoverageReport["byKind"] = {};
  for (const sym of allSymbols) {
    if (!byKind[sym.kind]) {
      byKind[sym.kind] = { total: 0, documented: 0 };
    }
    byKind[sym.kind]!.total++;
    if (sym.doc !== null) {
      byKind[sym.kind]!.documented++;
    }
  }

  // 파일별 통계
  const byFile: CoverageReport["byFile"] = [];
  for (const file of project.files) {
    const fileSymbols = file.symbols.filter(
      (s) => !exportedOnly || s.exported,
    );
    if (fileSymbols.length === 0) continue;

    const fileDocs = fileSymbols.filter((s) => s.doc !== null);
    byFile.push({
      file: file.filePath,
      total: fileSymbols.length,
      documented: fileDocs.length,
      percent:
        fileSymbols.length === 0
          ? 100
          : (fileDocs.length / fileSymbols.length) * 100,
    });
  }

  return {
    totalSymbols: total,
    documentedSymbols: documented.length,
    undocumentedSymbols: undocumented,
    coveragePercent: Math.round(coveragePercent * 10) / 10,
    byKind,
    byFile,
  };
}
