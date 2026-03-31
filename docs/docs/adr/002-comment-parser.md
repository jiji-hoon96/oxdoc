---
sidebar_position: 2
---

# ADR-002: comment-parser Selection

## Status
Accepted

## Context
JSDoc comment blocks (`/** ... */`) returned by the OXC parser need to be parsed into structured data. Candidates:
- **@microsoft/tsdoc**: Microsoft's TSDoc standard parser, strict standard compliance, but heavy (2.3MB)
- **comment-parser**: Lightweight JSDoc parser, 0 dependencies (379KB)
- **Custom implementation**: Full control, but maintenance burden

## Decision
We chose **comment-parser**.

- 0 dependencies for minimal bundle size
- Full support for JSDoc standard tags (@param, @returns, @example, etc.)
- 6x lighter than @microsoft/tsdoc
- Extensible with custom tag support

## Consequences
- Some TSDoc-specific tags (@typeParam, etc.) require mapping
- Does not provide TSDoc strict mode validation
- Delivers sufficient functionality with minimal overhead
