import { parseSync } from "oxc-parser";
import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { parseJSDoc, isJSDocComment } from "./jsdoc.js";
import { findSourceFiles } from "../utils/files.js";
import type {
  DocumentedSymbol,
  FileDocumentation,
  ProjectDocumentation,
  SymbolKind,
  DocComment,
} from "../../types/index.js";

interface OxcComment {
  type: string;
  value: string;
  start: number;
  end: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AstNode = any;

/**
 * 단일 파일을 파싱하여 FileDocumentation을 반환한다.
 * @param filePath - 파싱할 파일 경로
 * @returns 파일 문서 정보
 */
export function parseFile(filePath: string): FileDocumentation {
  const absolutePath = resolve(filePath);
  const source = readFileSync(absolutePath, "utf-8");

  return parseSource(source, absolutePath);
}

/**
 * 소스 코드 문자열을 직접 파싱한다.
 * @param source - 소스 코드 문자열
 * @param filePath - 파일 경로 (위치 정보용)
 * @returns 파일 문서 정보
 */
export function parseSource(
  source: string,
  filePath: string,
): FileDocumentation {
  const result = parseSync(filePath, source);
  const comments: OxcComment[] = result.comments;
  const body: AstNode[] = result.program.body;

  // JSDoc 주석만 필터링하고 start 기준 정렬
  const jsdocComments = comments
    .filter((c) => c.type === "Block" && isJSDocComment(c.value))
    .sort((a, b) => a.start - b.start);

  const symbols: DocumentedSymbol[] = [];

  for (const node of body) {
    extractSymbols(node, source, filePath, jsdocComments, symbols);
  }

  // 파일 레벨 JSDoc: 첫 번째 주석이 첫 번째 선언보다 앞에 있고, 어떤 심볼에도 매칭되지 않은 경우
  let fileDoc: DocComment | null = null;
  if (jsdocComments.length > 0 && body.length > 0) {
    const firstComment = jsdocComments[0];
    const firstNodeStart = body[0].start;
    const isAttachedToSymbol = symbols.some(
      (s) =>
        s.doc !== null &&
        s.doc.range.start === firstComment.start &&
        s.doc.range.end === firstComment.end,
    );
    if (firstComment.end < firstNodeStart && !isAttachedToSymbol) {
      fileDoc = parseJSDoc(firstComment.value, {
        start: firstComment.start,
        end: firstComment.end,
      });
    }
  }

  return { filePath, symbols, fileDoc };
}

/**
 * 프로젝트 전체를 파싱한다.
 * @param sourceRoot - 소스 루트 디렉토리
 * @param options - 파일 검색 옵션
 * @returns 프로젝트 문서 정보
 */
export async function parseProject(
  sourceRoot: string,
  options?: { include?: string[]; exclude?: string[] },
): Promise<ProjectDocumentation> {
  const files = await findSourceFiles(sourceRoot, options);

  // 파일을 배치로 병렬 처리
  const BATCH_SIZE = 50;
  const fileDocs: FileDocumentation[] = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const doc = parseFile(file);
          doc.filePath = relative(sourceRoot, file);
          return doc;
        } catch {
          return null;
        }
      }),
    );
    for (const doc of results) {
      if (doc) fileDocs.push(doc);
    }
  }

  return {
    files: fileDocs,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: "0.1.0",
      sourceRoot,
    },
  };
}

// --- 내부 함수 ---

/**
 * AST 노드에서 심볼을 추출한다.
 */
function extractSymbols(
  node: AstNode,
  source: string,
  filePath: string,
  jsdocComments: OxcComment[],
  symbols: DocumentedSymbol[],
): void {
  if (node.type === "ExportNamedDeclaration" && node.declaration) {
    const decl = node.declaration;
    const doc = findLeadingJSDoc(node.start, jsdocComments, source);
    extractDeclaration(decl, source, filePath, jsdocComments, symbols, true, doc);
  } else if (node.type === "ExportDefaultDeclaration" && node.declaration) {
    const decl = node.declaration;
    const doc = findLeadingJSDoc(node.start, jsdocComments, source);
    extractDeclaration(decl, source, filePath, jsdocComments, symbols, true, doc);
  } else {
    const doc = findLeadingJSDoc(node.start, jsdocComments, source);
    extractDeclaration(node, source, filePath, jsdocComments, symbols, false, doc);
  }
}

/**
 * 선언 노드에서 심볼 정보를 추출한다.
 */
function extractDeclaration(
  decl: AstNode,
  source: string,
  filePath: string,
  jsdocComments: OxcComment[],
  symbols: DocumentedSymbol[],
  exported: boolean,
  parentDoc: DocComment | null,
): void {
  switch (decl.type) {
    case "FunctionDeclaration": {
      const name = decl.id?.name ?? "default";
      symbols.push({
        name,
        kind: "function",
        doc: parentDoc,
        signature: extractSignature(source, decl),
        exported,
        location: locationFromOffset(source, decl.start, filePath),
      });
      break;
    }

    case "ClassDeclaration": {
      const name = decl.id?.name ?? "default";
      const children: DocumentedSymbol[] = [];

      if (decl.body?.body) {
        for (const member of decl.body.body) {
          const memberDoc = findLeadingJSDoc(member.start, jsdocComments, source);
          const memberName = member.key?.name ?? "constructor";
          let kind: SymbolKind = "property";

          if (member.type === "MethodDefinition") {
            kind = member.kind === "constructor" ? "constructor" : "method";
          }

          children.push({
            name: memberName,
            kind,
            doc: memberDoc,
            signature: extractSignature(source, member),
            exported: false,
            location: locationFromOffset(source, member.start, filePath),
          });
        }
      }

      symbols.push({
        name,
        kind: "class",
        doc: parentDoc,
        signature: `class ${name}`,
        exported,
        location: locationFromOffset(source, decl.start, filePath),
        children,
      });
      break;
    }

    case "TSInterfaceDeclaration": {
      const name = decl.id?.name ?? "unknown";
      const children: DocumentedSymbol[] = [];

      if (decl.body?.body) {
        for (const member of decl.body.body) {
          const memberDoc = findLeadingJSDoc(member.start, jsdocComments, source);
          const memberName = member.key?.name ?? "unknown";

          children.push({
            name: memberName,
            kind: "property",
            doc: memberDoc,
            signature: extractSignature(source, member),
            exported: false,
            location: locationFromOffset(source, member.start, filePath),
          });
        }
      }

      symbols.push({
        name,
        kind: "interface",
        doc: parentDoc,
        signature: `interface ${name}`,
        exported,
        location: locationFromOffset(source, decl.start, filePath),
        children,
      });
      break;
    }

    case "TSTypeAliasDeclaration": {
      const name = decl.id?.name ?? "unknown";
      symbols.push({
        name,
        kind: "type",
        doc: parentDoc,
        signature: extractSignature(source, decl),
        exported,
        location: locationFromOffset(source, decl.start, filePath),
      });
      break;
    }

    case "TSEnumDeclaration": {
      const name = decl.id?.name ?? "unknown";
      symbols.push({
        name,
        kind: "enum",
        doc: parentDoc,
        signature: extractSignature(source, decl),
        exported,
        location: locationFromOffset(source, decl.start, filePath),
      });
      break;
    }

    case "VariableDeclaration": {
      for (const declarator of decl.declarations) {
        const name = declarator.id?.name ?? "unknown";
        const varDoc =
          decl.declarations.length === 1
            ? parentDoc
            : findLeadingJSDoc(declarator.start, jsdocComments, source);

        symbols.push({
          name,
          kind: "variable",
          doc: varDoc,
          signature: extractSignature(source, decl),
          exported,
          location: locationFromOffset(source, declarator.start, filePath),
        });
      }
      break;
    }
  }
}

/**
 * 노드의 start 위치 바로 앞에 있는 JSDoc 주석을 찾는다.
 * 주석의 end와 노드의 start 사이에 코드가 없어야 한다.
 */
function findLeadingJSDoc(
  nodeStart: number,
  jsdocComments: OxcComment[],
  source?: string,
): DocComment | null {
  for (let i = jsdocComments.length - 1; i >= 0; i--) {
    const comment = jsdocComments[i];
    if (comment.end > nodeStart) continue;
    if (nodeStart - comment.end > 100) return null;

    // 주석 끝(+2는 */ 길이)과 노드 시작 사이의 텍스트 확인
    if (source) {
      const between = source.slice(comment.end + 2, nodeStart);
      // 공백, 개행, 라인주석(//)만 허용. 코드가 있으면 매칭하지 않음.
      const cleaned = between.replace(/\/\/[^\n]*/g, "").trim();
      if (cleaned.length > 0) return null;
    }

    return parseJSDoc(comment.value, {
      start: comment.start,
      end: comment.end,
    });
  }
  return null;
}

/**
 * 소스에서 선언의 시그니처 부분만 추출한다 (body 제외).
 */
function extractSignature(source: string, node: AstNode): string {
  const start = node.start as number;
  let end = node.end as number;

  // 함수/클래스/메서드의 body 시작 전까지만 추출
  if (node.body && typeof node.body.start === "number") {
    end = node.body.start;
  }

  // VariableDeclaration은 전체를 포함하되 초기화 값은 잘라냄
  if (node.type === "VariableDeclaration") {
    const text = source.slice(start, end);
    const eqIndex = text.indexOf("=");
    if (eqIndex !== -1) {
      return text.slice(0, eqIndex).trim();
    }
  }

  return source.slice(start, end).trim().replace(/\s+/g, " ");
}

/**
 * 바이트 오프셋에서 라인/컬럼 정보를 계산한다.
 */
function locationFromOffset(
  source: string,
  offset: number,
  filePath: string,
): { file: string; line: number; column: number } {
  let line = 1;
  let column = 1;

  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { file: filePath, line, column };
}
