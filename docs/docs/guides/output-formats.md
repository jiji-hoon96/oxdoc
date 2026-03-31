---
sidebar_position: 6
---

# Output Formats

oxdoc supports 4 output formats, each suited for different use cases.

## JSON

Structured output with full metadata. Best for tooling and programmatic consumption.

```bash
oxdoc generate ./src --format json
```

Output contains the complete `ProjectDocumentation` structure:

```json
{
  "metadata": {
    "generatedAt": "2026-03-31T00:00:00.000Z",
    "version": "0.1.0",
    "sourceRoot": "./src"
  },
  "files": [
    {
      "filePath": "src/utils.ts",
      "symbols": [
        {
          "name": "formatDate",
          "kind": "function",
          "signature": "function formatDate(date: Date): string",
          "exported": true,
          "doc": {
            "description": "Formats a Date object to ISO string",
            "tags": [
              { "tag": "param", "name": "date", "description": "The date to format" },
              { "tag": "returns", "description": "Formatted date string" }
            ]
          }
        }
      ]
    }
  ]
}
```

## Markdown

Human-readable documentation, ideal for GitHub wikis or static site generators.

```bash
oxdoc generate ./src --format markdown
```

Generates Markdown files with:
- File-based sections with `##` headers
- Parameter tables (Name | Type | Description)
- Return type sections
- Example code blocks

## HTML

Standalone single-page documentation with built-in UI features.

```bash
oxdoc generate ./src --format html
```

Features:
- **Sidebar navigation** with collapsible file tree
- **Search functionality** for filtering symbols
- **Dark theme** support
- **Symbol badges** showing kind (function, class, interface, etc.)
- **Hash-based navigation** for direct linking to symbols
- No external dependencies — a single self-contained HTML file

## llms.txt

AI/LLM-optimized format following the [llmstxt.org](https://llmstxt.org) specification.

```bash
oxdoc generate ./src --format llms-txt
```

Designed for:
- GitHub Copilot context
- Claude and ChatGPT project knowledge
- AI-powered code assistants
- Minimal token usage with maximum information density

The output is simplified compared to Markdown, focusing on signatures, parameters, and return types in a compact format optimized for LLM context windows.
