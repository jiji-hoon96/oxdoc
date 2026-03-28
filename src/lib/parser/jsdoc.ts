import { parse as commentParse } from "comment-parser";
import type { DocComment, DocTag } from "../../types/index.js";

/**
 * JSDoc 주석 블록을 구조화된 DocComment로 파싱한다.
 * @param rawComment - OXC comments 배열의 value 필드 (/** 과 *\/ 제외된 내용)
 * @param range - 주석의 소스 위치
 * @returns 파싱된 DocComment
 */
export function parseJSDoc(
  rawComment: string,
  range: { start: number; end: number },
): DocComment {
  // OXC의 value는 /* 와 */ 사이의 내용이므로 다시 감싸준다
  const wrapped = `/*${rawComment}*/`;
  const parsed = commentParse(wrapped);

  if (parsed.length === 0) {
    return { description: "", tags: [], range };
  }

  const block = parsed[0];

  const tags: DocTag[] = block.tags.map((tag) => {
    let description = tag.description;
    let name = tag.name;

    // @returns, @example 등 name이 불필요한 태그에서
    // 첫 단어가 name으로 파싱되는 문제 보정
    const namelessTags = ["returns", "return", "example", "throws", "since", "deprecated", "see"];
    if (namelessTags.includes(tag.tag) && name) {
      description = name + (description ? " " + description : "");
      name = "";
    }

    // "@param a - 설명" 형태에서 description의 선행 "- "를 제거
    description = description.replace(/^-\s*/, "");

    return {
      tag: tag.tag,
      name,
      type: tag.type,
      description,
      optional: tag.optional,
      default: tag.default || undefined,
    };
  });

  return {
    description: block.description,
    tags,
    range,
  };
}

/**
 * OXC의 Block 주석이 JSDoc인지 판별한다.
 * JSDoc은 `/**`로 시작하므로 value가 `*`로 시작해야 한다.
 */
export function isJSDocComment(commentValue: string): boolean {
  return commentValue.startsWith("*");
}
