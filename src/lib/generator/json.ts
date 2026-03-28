import type { ProjectDocumentation } from "../../types/index.js";

/**
 * 프로젝트 문서를 JSON 문자열로 변환한다.
 * @param project - 프로젝트 문서 정보
 * @returns 포맷팅된 JSON 문자열
 */
export function generateJSON(project: ProjectDocumentation): string {
  return JSON.stringify(project, null, 2);
}
