---
sidebar_position: 7
---

# Benchmarks

All numbers are median of 3 runs on macOS (Apple Silicon), Node.js v22.17.0. TypeDoc 0.28.18 with `--skipErrorChecking` flag.

## Real-World: es-toolkit (603 files, 1322 symbols)

Measured against [es-toolkit](https://github.com/toss/es-toolkit).

| Metric | oxdoc | TypeDoc 0.28 | Speedup |
|--------|-------|-------------|---------|
| JSON Generation | **0.24s** | 1.70s | 7x faster |
| HTML Generation | **0.25s** | 2.53s | 10x faster |
| Peak Memory | **131MB** | 470MB | 3.6x less |

## Real-World: radashi (162 files, 437 symbols)

Measured against [radashi](https://github.com/radashi-org/radashi).

| Metric | oxdoc | TypeDoc 0.28 | Speedup |
|--------|-------|-------------|---------|
| JSON Generation | **0.13s** | 1.12s | 8.6x faster |
| Peak Memory | **84MB** | 272MB | 3.2x less |

## Synthetic Scale Test

Generated fixtures with increasing file counts, each file containing 3 documented symbols.

| Files | Symbols | Time | Memory | Throughput |
|------:|--------:|-----:|-------:|-----------:|
| 100 | 300 | 0.03s | 6MB | ~3,300/s |
| 500 | 1,500 | 0.10s | 10MB | ~5,100/s |
| 1,000 | 3,000 | 0.18s | 6MB | ~5,700/s |
| 5,000 | 15,000 | 0.81s | 33MB | ~6,200/s |

## Why the Performance Difference?

**TypeDoc** loads the full TypeScript compiler (tsc) to resolve types, build a program graph, and check types — even with `--skipErrorChecking`, it still initializes the full compiler pipeline. This has a fixed overhead of ~1s regardless of project size.

**oxdoc** uses OXC parser (Rust NAPI) which parses syntax only — no type checking, no program graph. The parser returns AST + comments synchronously via `parseSync()`, and all heavy work runs in native Rust.

| | TypeDoc | oxdoc |
|---|---|---|
| Parser | tsc (JavaScript) | OXC (Rust NAPI) |
| Type resolution | Full | None (signature as-is) |
| Fixed overhead | ~1s | ~0.05s |
| Per-file cost | ~2ms | ~0.15ms |

## Reproduce

```bash
git clone https://github.com/jiji-hoon96/oxdoc.git
cd oxdoc
pnpm install && pnpm build

# Synthetic benchmark
pnpm bench

# Real-world comparison (requires TypeDoc installed globally)
time node dist/cli/index.js generate --format json --output /tmp/oxdoc-out ./path/to/project/src
time npx typedoc --json /tmp/typedoc.json --entryPoints ./path/to/project/src/index.ts --skipErrorChecking
```
