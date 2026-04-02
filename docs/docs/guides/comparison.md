---
sidebar_position: 8
---

# Comparison with Other Tools

How does oxdoc compare with other TypeScript/JavaScript documentation tools?

## Feature Comparison

| Feature | oxdoc | TypeDoc | JSDoc | documentation.js | deno doc | ESDoc |
|---------|:-----:|:-------:|:-----:|:----------------:|:--------:|:-----:|
| TypeScript support | Yes | Yes | No | Partial | Yes | No |
| JSDoc extraction | Yes | Yes | Yes | Yes | Yes | Yes |
| Doc coverage | **Built-in** | Plugin | No | No | No | Built-in |
| Doc testing | **Built-in** | No | No | No | No | No |
| Coverage badge (SVG) | **Built-in** | Plugin | No | No | No | No |
| API diff / change detection | **Built-in** | No | No | No | No | No |
| HTML output | Yes | Yes | Yes | Yes | Yes | Yes |
| Markdown output | Yes | No | No | Yes | No | No |
| llms.txt (AI-friendly) | **Yes** | No | No | No | No | No |
| JSON output | Yes | Yes | No | Yes | Yes | No |
| Source links in HTML | Yes | Yes | No | No | Yes | No |
| Plugin system | Yes | Yes | Yes | No | No | Yes |
| Watch mode | Yes | Yes | No | No | No | No |
| Native speed (Rust) | **Yes** | No | No | No | Yes | No |
| Actively maintained | Yes | Yes | Yes | Low | Yes | No |

## Performance Comparison

### vs TypeDoc

TypeDoc relies on the full TypeScript Compiler (tsc), which means it loads the entire type system, resolves all type references, and builds a complete program graph. This gives TypeDoc deep type information but comes at a significant performance cost.

oxdoc uses OXC parser (Rust NAPI) for syntax-only parsing — no type checking, native Rust execution, and batch processing for memory efficiency.

Measured on macOS (Apple Silicon), Node.js v22, median of 3 runs. TypeDoc 0.28 with `--skipErrorChecking`.

| Metric (es-toolkit, 603 files) | oxdoc | TypeDoc 0.28 | Speedup |
|--------------------------------|-------|-------------|---------|
| JSON Generation | **0.24s** | 1.70s | 7x faster |
| HTML Generation | **0.25s** | 2.53s | 10x faster |
| Peak Memory | **131MB** | 470MB | 3.6x less |

| Metric (radashi, 162 files) | oxdoc | TypeDoc 0.28 | Speedup |
|-----------------------------|-------|-------------|---------|
| JSON Generation | **0.13s** | 1.12s | 8.6x faster |
| Peak Memory | **84MB** | 272MB | 3.2x less |

### vs JSDoc

JSDoc is the classic documentation generator for JavaScript. It doesn't support TypeScript natively and lacks modern features like documentation coverage checking and doc testing. Performance is moderate for JavaScript-only projects.

### vs deno doc

deno doc is also Rust-based (uses SWC internally) and offers comparable parsing speed. However, it lacks:
- Documentation coverage measurement
- Doc testing
- Coverage badge generation
- API change detection
- Plugin system
- Multiple output formats (Markdown, llms.txt)

### vs ESDoc

ESDoc was one of the few tools with built-in documentation coverage, but the project is **no longer maintained** (last significant update was years ago). It only supports JavaScript, not TypeScript.

## When to Use What

| Use Case | Recommended Tool |
|----------|-----------------|
| Large TS/JS projects needing speed | **oxdoc** |
| Need deep type resolution & inference | TypeDoc |
| JavaScript-only, legacy projects | JSDoc |
| Deno projects | deno doc |
| Angular/NestJS projects | Compodoc |
| CI doc quality gates (coverage + testing) | **oxdoc** |
| API change detection in PRs | **oxdoc** |
| AI/LLM-optimized documentation | **oxdoc** |

## What TypeDoc Does Better

To be fair, TypeDoc has advantages in specific areas:

- **Deep type resolution** — TypeDoc resolves type aliases, follows imports, and expands complex types. oxdoc extracts signatures as-written in source code.
- **Mature plugin ecosystem** — TypeDoc has a large ecosystem of community plugins.
- **Cross-file type linking** — TypeDoc can link type references across files.

These trade-offs are by design: oxdoc prioritizes speed and simplicity over type-system depth.
