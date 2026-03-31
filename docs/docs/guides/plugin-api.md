---
sidebar_position: 5
---

# Plugin API

oxdoc provides an extensible plugin system with 3 execution hooks.

## Plugin Interface

```typescript
interface OxdocPlugin {
  /** Plugin name */
  name: string;

  /** Transform the symbol list (filter, sort, group, etc.) */
  transformSymbols?(symbols: DocumentedSymbol[]): DocumentedSymbol[];

  /** Generate custom output files */
  generateOutput?(project: ProjectDocumentation): OutputFile[];

  /** Analyze the project and return results */
  analyzeProject?(project: ProjectDocumentation): AnalysisResult;
}
```

## Hook Types

### transformSymbols

Called before output generation. Modify, filter, or sort the symbol list in place.

```typescript
const sortPlugin: OxdocPlugin = {
  name: 'sort-alphabetically',
  transformSymbols(symbols) {
    return symbols.sort((a, b) => a.name.localeCompare(b.name));
  },
};
```

### generateOutput

Create custom output files. Returns an array of `OutputFile` objects.

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

Run custom analysis on the project. Returns an `AnalysisResult` with optional issues.

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
            message: `TODO found in ${symbol.name}`,
            file: file.filePath,
            line: symbol.location.line,
          });
        }
      }
    }
    return {
      pluginName: 'todo-checker',
      summary: `Found ${issues.length} TODOs in documentation`,
      issues,
    };
  },
};
```

## Registering Plugins

Add plugins to your config file:

```json
// oxdoc.config.json
{
  "plugins": ["./plugins/my-plugin.js"]
}
```

Or programmatically via the library API:

```typescript
import { parseProject } from '@jiji-hoon96/oxdoc';
import { runPlugins } from '@jiji-hoon96/oxdoc';

const project = await parseProject('./src');
const results = await runPlugins([myPlugin], project);
```
