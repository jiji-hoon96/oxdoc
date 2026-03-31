# oxdoc

[![npm version](https://img.shields.io/npm/v/@jiji-hoon96/oxdoc)](https://www.npmjs.com/package/@jiji-hoon96/oxdoc)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[한국어](./README.ko.md)

Native-speed TypeScript/JavaScript API documentation generator powered by [OXC](https://oxc.rs/).

## Features

- **OXC Parser** - Blazing-fast parsing via Rust NAPI bindings (10-50x faster than Babel)
- **JSDoc/TSDoc Extraction** - Auto-generate API docs from source code (JSON, Markdown, HTML, llms.txt)
- **Documentation Coverage** - Measure doc coverage of exported symbols (CI integration)
- **Doc Test** - Execute and validate `@example` code blocks
- **HTML Docs** - Standalone single-page API docs with sidebar, search, and dark theme
- **Plugin System** - Extensible via Transform, Output, and Analyzer hooks
- **Watch Mode** - Auto-regenerate docs on file changes

## Quick Start

```bash
# Install
pnpm add -D @jiji-hoon96/oxdoc

# Generate API docs
npx @jiji-hoon96/oxdoc generate ./src --format markdown --output ./api-docs

# Check documentation coverage (CI fails if below 80%)
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# Test @example blocks
npx @jiji-hoon96/oxdoc doctest ./src
```

## CLI Commands

### `oxdoc generate`

```bash
oxdoc generate [path] --format json|markdown|html|llms-txt --output <dir>
```

Extracts JSDoc/TSDoc from source files and generates API documentation.

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --format` | Output format (`json`, `markdown`, `html`, `llms-txt`) | `json` |
| `-o, --output` | Output directory | `./docs-output` |
| `-w, --watch` | Auto-regenerate on file changes | `false` |
| `--include` | Include glob patterns | `**/*.{ts,tsx,js,jsx}` |
| `--exclude` | Exclude glob patterns | `**/*.test.*`, `**/node_modules/**` |

### `oxdoc coverage`

```bash
oxdoc coverage [path] --threshold 80 --format text|json
```

Measures documentation coverage. Returns exit code 1 when below threshold for CI usage.

```
  Documentation Coverage Report
  ───────────────────────────────────
  Total symbols:      42
  Documented:         35  (83.3%)
  Undocumented:        7

  By kind:
    function       12/15  (80.0%)
    class           5/5   (100.0%)
    interface       8/10  (80.0%)
```

### `oxdoc doctest`

```bash
oxdoc doctest [path] --bail --reporter text|json
```

Executes `@example` code blocks and validates `// =>` assertions.

```typescript
/**
 * @example
 * ```ts
 * add(1, 2) // => 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## Benchmarks

### es-toolkit (603 files)

| | oxdoc | TypeDoc | Improvement |
|---|---|---|---|
| HTML Generation | **0.27s** | 2.36s | 8.7x faster |
| JSON Generation | **0.25s** | 1.46s | 5.8x faster |
| Memory Usage | **117MB** | 445MB | 3.8x less |

### Large Scale (5,000 files / 15,000 symbols)

| | oxdoc | TypeDoc | Improvement |
|---|---|---|---|
| Total Time | **0.9s** | ~60s+ | ~66x faster |
| Memory Usage | **22MB** | ~2GB+ | ~90x less |

## Configuration

Create `oxdoc.config.json` in your project root:

```json
{
  "sourceRoot": "./src",
  "coverage": {
    "threshold": 80
  },
  "output": {
    "format": "html",
    "dir": "./api-docs"
  }
}
```

See the [Configuration Guide](https://oxdoc.vercel.app/docs/guides/configuration) for all options.

## Architecture

```
oxc-parser (Rust NAPI)  ← Native-speed parsing
       ↓
oxdoc (TypeScript)      ← JSDoc matching, analysis, output generation
```

Parsing (the heaviest operation) is handled by OXC's Rust binary, while the analysis/output layer is flexibly extensible in TypeScript.

## Why oxdoc?

TypeDoc relies on tsc, causing serious issues in large projects:
- Requires **12GB of memory** in a 110K LOC monorepo
- **OOM crashes** in large projects
- Search index initialization takes **35+ seconds**

oxdoc solves this with the OXC parser.

## Documentation

Visit the [documentation site](https://oxdoc.vercel.app) for detailed guides.

## License

MIT
