import type { DocumentedSymbol, ProjectDocumentation } from "./index.js";

export interface OxdocPlugin {
  name: string;
  /** 심볼 목록을 변환한다 (필터, 정렬, 그룹핑 등) */
  transformSymbols?(symbols: DocumentedSymbol[]): DocumentedSymbol[];
  /** 커스텀 출력 파일을 생성한다 */
  generateOutput?(project: ProjectDocumentation): OutputFile[];
  /** 프로젝트를 분석하고 결과를 반환한다 */
  analyzeProject?(project: ProjectDocumentation): AnalysisResult;
}

export interface OutputFile {
  filename: string;
  content: string;
}

export interface AnalysisResult {
  pluginName: string;
  summary: string;
  issues: AnalysisIssue[];
}

export interface AnalysisIssue {
  severity: "error" | "warning" | "info";
  message: string;
  file?: string;
  line?: number;
}
