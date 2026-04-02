# oxdoc

[![npm version](https://img.shields.io/npm/v/@jiji-hoon96/oxdoc)](https://www.npmjs.com/package/@jiji-hoon96/oxdoc)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[한국어](./README.ko.md)

Native-speed TypeScript/JavaScript API documentation generator powered by [OXC](https://oxc.rs/).

## Why oxdoc?

TypeDoc relies on the TypeScript compiler (tsc), which causes serious problems in large projects:

- **12GB+ memory** in 110K LOC monorepos → OOM crashes
- **Minutes of build time** just for API docs
- **Coupled to tsc API** → breaks when TypeScript 7 (Go port) ships

oxdoc replaces tsc with the OXC parser (Rust NAPI), solving all three problems while adding features TypeDoc lacks: doc testing, API change detection, and coverage checking.

### Design Trade-off

oxdoc extracts type signatures **as written in source code**. It does not expand type aliases or resolve generics like TypeDoc does. This is intentional — it's what makes oxdoc 10-60x faster with 4-90x less memory. For most projects, the source signature is the most accurate and readable form of documentation.

## Features

- **OXC Parser** — Rust NAPI bindings, 10-60x faster than tsc-based tools
- **4 Output Formats** — JSON, Markdown, HTML (with search & dark theme), llms.txt
- **Doc Coverage** — Measure and enforce documentation coverage in CI
- **Doc Test** — Execute `@example` blocks and validate `// =>` assertions
- **API Diff** — Detect breaking API changes between releases
- **10 Symbol Kinds** — function, class, interface, type, enum, enum-member, getter, setter, namespace, variable
- **Overload Support** — Function overloads merged with `overloads` array
- **Plugin System** — Extensible via Transform, Output, and Analyzer hooks
- **Watch Mode** — Auto-regenerate docs on file changes

## Quick Start

```bash
# Install
pnpm add -D @jiji-hoon96/oxdoc

# Generate API docs
npx oxdoc generate ./src --format html --output ./api-docs

# Check documentation coverage (CI fails if below 80%)
npx oxdoc coverage ./src --threshold 80

# Test @example blocks
npx oxdoc doctest ./src

# Detect breaking API changes
npx oxdoc diff ./api-snapshot.json ./src --fail-on-breaking
```

## CLI Commands

### `oxdoc generate`

```bash
oxdoc generate [path] --format json|markdown|html|llms-txt --output <dir>
```

Extracts JSDoc/TSDoc from source files and generates API documentation.

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --format` | Output format | `json` |
| `-o, --output` | Output directory | `./docs-output` |
| `-w, --watch` | Auto-regenerate on file changes | `false` |
| `--include` | Include glob patterns | `**/*.{ts,tsx,js,jsx}` |
| `--exclude` | Exclude glob patterns | `**/*.test.*`, `**/node_modules/**` |

### `oxdoc coverage`

```bash
oxdoc coverage [path] --threshold 80 --format text|json --badge badge.svg
```

Measures documentation coverage. Returns exit code 1 when below threshold.

### `oxdoc doctest`

```bash
oxdoc doctest [path] --bail --reporter text|json
```

Executes `@example` code blocks and validates assertions:

```typescript
/**
 * @example
 * ```ts
 * add(1, 2) // => 3
 * add(-1, 1) // => 0
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

### `oxdoc diff`

```bash
oxdoc diff <snapshot.json> [path] --fail-on-breaking --format text|json
```

Compares current API surface against a previous JSON snapshot. Detects added, removed, and changed symbols. Use `--fail-on-breaking` in CI to block breaking changes.

## Benchmarks

### es-toolkit (603 files, 1322 symbols)

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
  },
  "repository": "https://github.com/user/repo"
}
```

## Architecture

```
Source Files  →  OXC Parser (Rust NAPI)  →  Symbol Extraction  →  Output Generation
                                                    ↓
                                         Coverage / DocTest / Diff
```

The heaviest operation (parsing) runs in native Rust. Analysis and output generation are in TypeScript for extensibility.

## Extracted Symbol Information

| Symbol Kind | Extracted Data |
|-------------|----------------|
| function | signature, JSDoc, overloads, parameters, return type |
| class | signature, JSDoc, methods, properties, getters/setters, static members |
| interface | signature, JSDoc, properties |
| type | signature, JSDoc |
| enum | signature, JSDoc, members with values |
| namespace | signature, JSDoc, exported children |
| variable | signature, JSDoc |

## License

MIT
