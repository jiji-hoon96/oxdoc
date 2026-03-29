# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project initialization with TypeScript, tsup, vitest
- Core type definitions (DocumentedSymbol, DocComment, CoverageReport, DocTest)
- Test fixtures for parser testing (simple-function, class, interface, no-docs)
- `.claude` configuration with CLAUDE.md and skills (commit, test, changelog, documentation)
- Docusaurus documentation site with ADRs
- JSDoc parser using OXC (`parseSync`) and comment-parser
- `parseFile()` and `parseSource()` for single file parsing
- `parseProject()` for multi-file project parsing
- JSDoc-to-AST node matching with whitespace-aware proximity detection
- Support for function, class, interface, type, enum, variable symbol extraction
- CLI tool with `oxdoc generate` command (JSON and Markdown output)
- JSON generator (`generateJSON`)
- Markdown generator with parameter tables, returns, examples (`generateMarkdown`)
- Documentation coverage checker (`calculateCoverage`) with by-kind and by-file stats
- `oxdoc coverage` CLI command with threshold check and text/json output
- Doc test runner: `extractDocTests()` for @example block extraction
- `runDocTests()` for executing code blocks with `// =>` assertion support
- `oxdoc doctest` CLI command with --bail option
- Docusaurus usage guides: getting-started, CLI reference, CI integration
- Batch parallel file processing in `parseProject()` (50 files per batch)

- Configuration file system: oxdoc.config.json, .js, .mjs, package.json "oxdoc" field
- `loadConfig()` and `mergeConfig()` with CLI flag override support
- Plugin system: `OxdocPlugin` interface with transformSymbols, generateOutput, analyzeProject hooks
- `runPlugins()` runner with ordered execution (transform → output → analyze)
- llms.txt output format for AI/LLM-friendly documentation (`--format llms-txt`)
- Watch mode: `oxdoc generate --watch` with 300ms debounced file change detection
- Benchmark suite: `pnpm bench` with 100/500/1K/5K file scale tests
- Benchmark fixture generator for reproducible performance testing
- Error reporting: `metadata.errors` collects parse failures with file path and message
- `reportParseErrors()` utility for CLI warning output
- npm publish preparation: files field, publishConfig, prepublishOnly script

### Changed
- README.md expanded with full CLI documentation and architecture diagram
- tsup config split to apply shebang only to CLI entry point
- Deployment: GitHub Pages → Vercel (`vercel.json` added)
- All yarn references replaced with pnpm across documentation
- Documentation URL updated to `https://oxdoc.vercel.app`
