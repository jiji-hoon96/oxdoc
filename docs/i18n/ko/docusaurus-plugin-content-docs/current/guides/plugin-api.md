---
sidebar_position: 5
---

# 플러그인 API

oxdoc은 3가지 실행 훅을 갖춘 확장 가능한 플러그인 시스템을 제공합니다.

## 플러그인 인터페이스

```typescript
interface OxdocPlugin {
  /** 플러그인 이름 */
  name: string;

  /** 심볼 목록을 변환한다 (필터, 정렬, 그룹핑 등) */
  transformSymbols?(symbols: DocumentedSymbol[]): DocumentedSymbol[];

  /** 커스텀 출력 파일을 생성한다 */
  generateOutput?(project: ProjectDocumentation): OutputFile[];

  /** 프로젝트를 분석하고 결과를 반환한다 */
  analyzeProject?(project: ProjectDocumentation): AnalysisResult;
}
```

## 훅 종류

### transformSymbols

출력 생성 전에 호출됩니다. 심볼 목록을 수정, 필터링, 정렬할 수 있습니다.

```typescript
const sortPlugin: OxdocPlugin = {
  name: 'sort-alphabetically',
  transformSymbols(symbols) {
    return symbols.sort((a, b) => a.name.localeCompare(b.name));
  },
};
```

### generateOutput

커스텀 출력 파일을 생성합니다. `OutputFile` 배열을 반환합니다.

```typescript
interface OutputFile {
  filename: string;
  content: string;
}

const csvPlugin: OxdocPlugin = {
  name: 'csv-export',
  generateOutput(project) {
    const rows = project.files.flatMap(f =>
      f.symbols.map(s => `${s.name},${s.kind},${f.filePath}`)
    );
    return [{
      filename: 'symbols.csv',
      content: ['Name,Kind,File', ...rows].join('\n'),
    }];
  },
};
```

### analyzeProject

프로젝트에 대해 커스텀 분석을 실행합니다. 이슈를 포함한 `AnalysisResult`를 반환합니다.

```typescript
interface AnalysisResult {
  pluginName: string;
  summary: string;
  issues: AnalysisIssue[];
}

interface AnalysisIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
}

const todoPlugin: OxdocPlugin = {
  name: 'todo-checker',
  analyzeProject(project) {
    const issues: AnalysisIssue[] = [];
    for (const file of project.files) {
      for (const symbol of file.symbols) {
        if (symbol.doc?.description?.includes('TODO')) {
          issues.push({
            severity: 'warning',
            message: `${symbol.name}에서 TODO 발견`,
            file: file.filePath,
            line: symbol.location.line,
          });
        }
      }
    }
    return {
      pluginName: 'todo-checker',
      summary: `문서에서 ${issues.length}개의 TODO를 발견했습니다`,
      issues,
    };
  },
};
```

## 플러그인 등록

설정 파일에 플러그인을 추가합니다:

```json
// oxdoc.config.json
{
  "plugins": ["./plugins/my-plugin.js"]
}
```

또는 라이브러리 API를 통해 프로그래밍 방식으로 사용:

```typescript
import { parseProject } from '@jiji-hoon96/oxdoc';
import { runPlugins } from '@jiji-hoon96/oxdoc';

const project = await parseProject('./src');
const results = await runPlugins([myPlugin], project);
```
