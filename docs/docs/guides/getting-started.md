---
sidebar_position: 1
---

# Getting Started

## Installation

```bash
# npm
npm install -D @jiji-hoon96/oxdoc

# pnpm
pnpm add -D @jiji-hoon96/oxdoc

# Or run directly with npx
npx @jiji-hoon96/oxdoc --help
```

## Requirements

- Node.js 20 or higher
- TypeScript/JavaScript project

## Basic Usage

### 1. Generate API Docs

Extract JSDoc/TSDoc comments from source code and generate documentation.

```bash
# JSON format (default)
npx @jiji-hoon96/oxdoc generate ./src

# Markdown format
npx @jiji-hoon96/oxdoc generate ./src --format markdown

# HTML format (standalone single-page with sidebar, search, dark theme)
npx @jiji-hoon96/oxdoc generate ./src --format html

# Specify output directory
npx @jiji-hoon96/oxdoc generate ./src --format markdown --output ./api-docs
```

### 2. Check Documentation Coverage

Measures the ratio of exported symbols that have JSDoc documentation.

```bash
# Check coverage
npx @jiji-hoon96/oxdoc coverage ./src

# Set threshold (CI — returns exit code 1 if below)
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# JSON output
npx @jiji-hoon96/oxdoc coverage ./src --format json

# Include non-exported symbols
npx @jiji-hoon96/oxdoc coverage ./src --all
```

### 3. Run Doc Tests

Validates that `@example` code blocks actually work.

```bash
npx @jiji-hoon96/oxdoc doctest ./src

# Stop on first failure
npx @jiji-hoon96/oxdoc doctest ./src --bail
```

#### Writing Doc Tests

Use `// =>` to specify expected values, which become automatic assertions:

```typescript
/**
 * Adds two numbers.
 * @param a - First number
 * @param b - Second number
 * @returns The sum
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

## Supported Symbol Types

| Kind | Example | Extracted |
|------|---------|-----------|
| Function | `export function foo()` | Yes |
| Class | `export class Foo` | Yes (including members) |
| Interface | `export interface IFoo` | Yes (including properties) |
| Type Alias | `export type Foo = ...` | Yes |
| Enum | `export enum Foo` | Yes |
| Variable | `export const FOO = ...` | Yes |

## Supported JSDoc Tags

`@param`, `@returns`, `@example`, `@typeParam`, `@throws`, `@since`, `@deprecated`, `@see`, and custom tags
