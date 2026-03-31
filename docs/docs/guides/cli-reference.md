---
sidebar_position: 2
---

# CLI Reference

## oxdoc generate

Generates API documentation from source files.

```bash
oxdoc generate [path] [options]
```

| Argument/Option | Description | Default |
|-----------------|-------------|---------|
| `[path]` | Source directory path | `./src` |
| `-f, --format <format>` | Output format (`json`, `markdown`, `html`, `llms-txt`) | `json` |
| `-o, --output <dir>` | Output directory | `./docs-output` |
| `-w, --watch` | Auto-regenerate on file changes | `false` |
| `--include <patterns...>` | Include glob patterns | `**/*.{ts,tsx,js,jsx}` |
| `--exclude <patterns...>` | Exclude glob patterns | `**/*.test.*`, `**/node_modules/**` |

### Examples

```bash
# Basic usage
oxdoc generate ./src

# Markdown output to a specific directory
oxdoc generate ./lib --format markdown --output ./api-docs

# Standalone HTML documentation with sidebar, search, and dark theme
oxdoc generate ./src --format html --output ./api-docs

# Include specific files only
oxdoc generate ./src --include "**/*.ts" --exclude "**/*.internal.*"

# AI-friendly llms.txt format
oxdoc generate ./src --format llms-txt

# Watch mode (auto-regenerate on file changes)
oxdoc generate ./src --format markdown --watch
```

---

## oxdoc coverage

Measures documentation coverage.

```bash
oxdoc coverage [path] [options]
```

| Argument/Option | Description | Default |
|-----------------|-------------|---------|
| `[path]` | Source directory path | `./src` |
| `-t, --threshold <percent>` | Minimum coverage threshold (%) | `0` |
| `--all` | Include non-exported symbols | `false` |
| `--format <format>` | Output format (`text`, `json`) | `text` |
| `--badge <path>` | Generate SVG coverage badge at the given path | - |

### Output Example

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

  Undocumented symbols:
    ⚠ src/utils.ts:15  function  formatDate
    ⚠ src/config.ts:3  variable  DEFAULT_CONFIG

  ✓ Coverage 83.3% meets threshold 80%
```

### CI Integration

Returns exit code 1 when below threshold, making it directly usable in CI:

```yaml
# GitHub Actions
- name: Check documentation coverage
  run: npx @jiji-hoon96/oxdoc coverage ./src --threshold 80
```

---

## oxdoc doctest

Executes `@example` code blocks and validates them.

```bash
oxdoc doctest [path] [options]
```

| Argument/Option | Description | Default |
|-----------------|-------------|---------|
| `[path]` | Source directory path | `./src` |
| `--bail` | Stop on first failure | `false` |
| `--reporter <format>` | Output format (`text`, `json`) | `text` |

### Output Example

```
  ✓ add (math.ts:5) - 2 assertion(s) passed
  ✓ subtract (math.ts:18) - 1 assertion(s) passed
  ✗ multiply (math.ts:31) - assertion failed
    Expected 6, got undefined

  Results: 2 passed, 1 failed, 3 total
```

---

## oxdoc diff

Detects API changes between a previous JSON snapshot and the current source.

```bash
oxdoc diff <snapshot> [path] [options]
```

| Argument/Option | Description | Default |
|-----------------|-------------|---------|
| `<snapshot>` | Path to previous `api.json` snapshot | (required) |
| `[path]` | Source directory path | `./src` |
| `--fail-on-breaking` | Exit with code 1 if breaking changes found | `false` |
| `--format <format>` | Output format (`text`, `json`) | `text` |

### Usage

```bash
# 1. Generate a baseline snapshot
oxdoc generate ./src --format json --output ./baseline

# 2. Make changes to your code...

# 3. Detect API changes
oxdoc diff ./baseline/api.json ./src

# 4. Use in CI to block breaking changes
oxdoc diff ./baseline/api.json ./src --fail-on-breaking
```

### Output Example

```
  API Diff Report
  ───────────────────────────────────
  Added:     2
  Removed:   1
  Changed:   1

  ⚠ 2 breaking change(s) detected

  − [BREAKING] Exported function "oldHelper" was removed
    src/utils.ts (function)
  ~ [BREAKING] Signature changed: "function parse(input: string)" → "function parse(input: string, options: Options)"
    src/parser.ts (function)
  + [safe] Exported function "newHelper" was added
    src/utils.ts (function)
  + [safe] Exported interface "Options" was added
    src/parser.ts (interface)
```
