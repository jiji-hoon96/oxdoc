---
sidebar_position: 1
---

# Introduction to oxdoc

**oxdoc** is a native-speed TypeScript/JavaScript API documentation generator powered by the [OXC](https://oxc.rs/) parser.

## Why oxdoc?

TypeDoc relies on the TypeScript Compiler (tsc), which causes serious performance issues in large projects:

- Requires **12GB of memory** in a 110K LOC monorepo
- **OOM (Out of Memory)** crashes in large projects
- Search index initialization takes **35+ seconds**

oxdoc uses OXC parser with Rust NAPI bindings to deliver **10-100x faster parsing speed**.

## Key Features

- **JSDoc/TSDoc Extraction** - Automatically generates API docs from source code
- **Documentation Coverage** - Measures the documentation ratio of exported symbols
- **Doc Test** - Executes and validates `@example` code blocks
- **Multiple Output Formats** - JSON, Markdown, HTML, llms.txt (AI-friendly)
- **Plugin System** - Extensible via Transform, Output, and Analyzer hooks
- **Watch Mode** - Auto-regenerates docs on file changes
- **Configuration** - `oxdoc.config.json` or `package.json` `oxdoc` field

## Quick Start

```bash
# Generate API docs
npx @jiji-hoon96/oxdoc generate ./src --format markdown

# Check documentation coverage
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

# Run doc tests
npx @jiji-hoon96/oxdoc doctest ./src
```
