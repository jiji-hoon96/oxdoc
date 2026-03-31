---
sidebar_position: 1
---

# ADR-001: OXC Parser Selection

## Status
Accepted

## Context
A tool for parsing source code is needed for TypeScript/JavaScript API documentation generation. Candidates:
- **TypeScript Compiler API (tsc)**: Provides full type information, but slow and memory-intensive
- **Babel**: Mature ecosystem, but slow (~50ms/file)
- **SWC**: Rust-based and fast, but lacking JSDoc parsing support
- **OXC (oxc-parser)**: Rust NAPI bindings, the fastest JS/TS parser, ESTree-compatible AST

## Decision
We chose **oxc-parser**.

- Native-speed parsing via Rust NAPI bindings (10-50x faster than Babel)
- `parseSync()` API returns AST + comments array synchronously
- ESTree-compatible AST format
- Active OXC community (20K+ GitHub stars)

## Consequences
- JSDoc parsing requires separate handling (OXC only provides a comments array)
- No type resolving (planned to be addressed via tsgo integration in the future)
- Declaration signatures are extracted directly from source text
