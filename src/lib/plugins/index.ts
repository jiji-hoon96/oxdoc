import type {
  OxdocPlugin,
  OutputFile,
  AnalysisResult,
} from "../../types/plugin.js";
import type { ProjectDocumentation } from "../../types/index.js";

export interface PluginResults {
  outputFiles: OutputFile[];
  analysisResults: AnalysisResult[];
}

/**
 * 등록된 플러그인을 순차적으로 실행한다.
 * 1. transformSymbols: 심볼을 변환 (in-place)
 * 2. generateOutput: 커스텀 출력 파일 수집
 * 3. analyzeProject: 분석 결과 수집
 *
 * @param plugins - 실행할 플러그인 배열
 * @param project - 프로젝트 문서 (transformer에 의해 수정될 수 있음)
 * @returns 출력 파일과 분석 결과
 */
export function runPlugins(
  plugins: OxdocPlugin[],
  project: ProjectDocumentation,
): PluginResults {
  // Phase 1: Transform symbols
  for (const plugin of plugins) {
    if (plugin.transformSymbols) {
      for (const file of project.files) {
        file.symbols = plugin.transformSymbols(file.symbols);
      }
    }
  }

  // Phase 2: Generate output
  const outputFiles: OutputFile[] = [];
  for (const plugin of plugins) {
    if (plugin.generateOutput) {
      const files = plugin.generateOutput(project);
      outputFiles.push(...files);
    }
  }

  // Phase 3: Analyze
  const analysisResults: AnalysisResult[] = [];
  for (const plugin of plugins) {
    if (plugin.analyzeProject) {
      const result = plugin.analyzeProject(project);
      analysisResults.push(result);
    }
  }

  return { outputFiles, analysisResults };
}
