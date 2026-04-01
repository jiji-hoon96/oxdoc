# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Coverage badge generation: `oxdoc coverage --badge coverage.svg` generates SVG badge
- HTML source links: `repository` config option adds "View Source" links to GitHub in HTML output
- API change detection: `oxdoc diff <snapshot> [path]` compares API surface against a previous JSON snapshot
- `--fail-on-breaking` flag for CI to block breaking API changes
- Documentation pages: Configuration, Plugin API, Output Formats, Benchmarks, Comparison guides
- Homepage benchmark visualization with CSS animations and tab-based scenario switching
- CTA section on homepage
- Korean i18n support via Docusaurus locale dropdown
- `README.ko.md` Korean README

### Security
- Add SECURITY.md with vulnerability reporting policy
- Add GitHub Actions CI workflow (test, build, typecheck on Node 20/22)
- Add GitHub Actions publish workflow with npm provenance attestation
- Add dependency security audit in CI pipeline
- Enable npm provenance in publishConfig

### Changed
- Default documentation locale switched from Korean to English
- Homepage fully translated to English with improved benchmark UI
- All documentation pages translated to English (Korean available via locale switcher)
- `README.md` rewritten in English with badges, expanded benchmarks, configuration section

### Fixed
- `OxdocConfig.output.format` type now includes `"html"` (was missing)
- CLI reference now lists `html` as a valid format for `oxdoc generate`
- Doctest: fix namespace alias detection — only detect `_.method()` (lodash convention), no longer matches JS built-in globals
- Doctest: fix code fence parsing for malformed/unclosed fences
- Doctest: preserve variable declarations in assertion expressions (`const x = expr // => value`)
- Doctest: support multi-line expected values (`// => [\n//   ...\n// ]`)
- Doctest: strip trailing parenthetical comments from expected values (`true (comment)` → `true`)
- Doctest: improved error message extraction for empty/truncated stderr output
- Doctest: use Node.js `util.isDeepStrictEqual` for assertion comparison (handles Date, RegExp, Map, Set, etc.)
- Doctest: auto-skip browser-only API examples (document, window, etc.)
- Doctest: auto-skip error-throwing examples ("should throw", "will throw")
- Doctest: barrel import fallback now supports assertion-aware code generation
- Doctest: filter out text-description assertions (non-JS expected values)
- Doctest: remove unused `splitIntoBlocks` dead code
- Doctest: remove overly aggressive pseudo-code detection — only skip obvious fake names (my*, mock*, stub*)

### Previously Added
- HTML output format: `oxdoc generate --format html` — single-page API docs with sidebar navigation, search, dark theme
- JSON reporter for doctest: `oxdoc doctest --reporter json` for CI pipeline parsing
- Doctest: resolve tsx from oxdoc's own dependencies (not target project)
- Doctest: generate test files in project root for tsconfig paths support

### Fixed
- Coverage/doctest commands now pass config `include`/`exclude` to `parseProject`
- Doctest no longer fails when target project doesn't have tsx installed
- Doctest supports projects with tsconfig `paths` aliases

### Previously Added
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

### Fixed
- JSDoc @example blocks now preserve newlines (`spacing: 'preserve'`)
- Method signatures no longer include function body (MethodDefinition body detection fix)
- JSDoc description/tag trailing whitespace trimmed
- Test data `metadata.errors` field added to all test helpers
- CLI reference docs updated for `--format llms-txt` and `--watch` options

### Changed
- Complete Docusaurus theme redesign: dark hero, terminal preview, feature cards, benchmark bars
- Custom CSS: Inter + JetBrains Mono fonts, blue color scheme, code-focused styling
- README.md expanded with full CLI documentation and architecture diagram
- tsup config split to apply shebang only to CLI entry point
- Deployment: GitHub Pages → Vercel (`vercel.json` added)
- All yarn references replaced with pnpm across documentation
- Documentation URL updated to `https://oxdoc.vercel.app`
