/** JSDoc 태그 하나를 나타내는 타입 */
export interface DocTag {
  tag: string;
  name: string;
  type: string;
  description: string;
  optional: boolean;
  default?: string;
}

/** 하나의 JSDoc 블록 */
export interface DocComment {
  description: string;
  tags: DocTag[];
  range: { start: number; end: number };
}

/** 심볼 종류 */
export type SymbolKind =
  | "function"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "variable"
  | "method"
  | "property"
  | "constructor";

/** 문서화된 심볼 */
export interface DocumentedSymbol {
  name: string;
  kind: SymbolKind;
  doc: DocComment | null;
  signature: string;
  exported: boolean;
  location: {
    file: string;
    line: number;
    column: number;
  };
  children?: DocumentedSymbol[];
}

/** 파일 문서 */
export interface FileDocumentation {
  filePath: string;
  symbols: DocumentedSymbol[];
  fileDoc: DocComment | null;
}

/** 파싱 에러 정보 */
export interface ParseError {
  file: string;
  message: string;
}

/** 프로젝트 전체 문서 */
export interface ProjectDocumentation {
  files: FileDocumentation[];
  metadata: {
    generatedAt: string;
    version: string;
    sourceRoot: string;
    errors: ParseError[];
  };
}

/** 문서 커버리지 리포트 */
export interface CoverageReport {
  totalSymbols: number;
  documentedSymbols: number;
  undocumentedSymbols: DocumentedSymbol[];
  coveragePercent: number;
  byKind: Partial<Record<SymbolKind, { total: number; documented: number }>>;
  byFile: Array<{
    file: string;
    total: number;
    documented: number;
    percent: number;
  }>;
}

/** Doc test 항목 */
export interface DocTest {
  symbolName: string;
  filePath: string;
  line: number;
  code: string;
  assertions: Array<{ expression: string; expected: string }>;
}
