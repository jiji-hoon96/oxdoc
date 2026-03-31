---
sidebar_position: 7
---

# Benchmarks

oxdoc achieves significant performance improvements over TypeDoc by offloading parsing to OXC's Rust NAPI bindings.

## Real-World: es-toolkit (603 files)

Measured against the [es-toolkit](https://github.com/toss/es-toolkit) library (603 source files).

| Metric | oxdoc | TypeDoc | Improvement |
|--------|-------|---------|-------------|
| HTML Generation | **0.27s** | 2.36s | 8.7x faster |
| JSON Generation | **0.25s** | 1.46s | 5.8x faster |
| Memory Usage | **117MB** | 445MB | 3.8x less |

## Large Scale (5,000 files / 15,000 symbols)

Stress test with generated fixtures containing 5,000 files and 15,000 symbols.

| Metric | oxdoc | TypeDoc | Improvement |
|--------|-------|---------|-------------|
| Total Time | **0.9s** | ~60s+ | ~66x faster |
| Memory Usage | **22MB** | ~2GB+ | ~90x less |

## Why the Performance Difference?

TypeDoc relies on the full TypeScript Compiler (tsc) for parsing, which:
- Loads the entire type system
- Resolves all type references
- Builds a complete program graph

oxdoc uses OXC parser (Rust NAPI) which:
- Parses syntax only — no type checking
- Runs in native Rust, not JavaScript
- Uses batch processing (50 files per batch) for memory efficiency
- Returns AST + comments synchronously via `parseSync()`

## Scalability

oxdoc's performance scales linearly with file count:

| Files | Parse Time | Memory |
|-------|-----------|--------|
| 100 | ~0.02s | ~5MB |
| 500 | ~0.09s | ~10MB |
| 1,000 | ~0.18s | ~12MB |
| 5,000 | ~0.9s | ~22MB |

## Reproduce

Run the benchmarks yourself:

```bash
git clone https://github.com/jiji-hoon96/oxdoc.git
cd oxdoc
pnpm install
pnpm bench
```

The benchmark suite generates reproducible fixtures and measures parse time, coverage analysis time, total time, and memory usage across multiple scales.
