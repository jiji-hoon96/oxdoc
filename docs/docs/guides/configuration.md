---
sidebar_position: 4
---

# Configuration

oxdoc supports multiple configuration methods. CLI flags always take precedence over config file values.

## Config File Discovery

oxdoc searches for configuration in this order:

1. `oxdoc.config.json`
2. `oxdoc.config.js` / `oxdoc.config.mjs`
3. `package.json` `"oxdoc"` field

## Full Schema

```typescript
interface OxdocConfig {
  /** Source root directory (default: "./src") */
  sourceRoot?: string;

  /** Include glob patterns (default: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]) */
  include?: string[];

  /** Exclude glob patterns (default: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/__tests__/**"]) */
  exclude?: string[];

  coverage?: {
    /** Minimum coverage threshold in percent (default: 0, disabled) */
    threshold?: number;
    /** Only count exported symbols (default: true) */
    exportedOnly?: boolean;
  };

  output?: {
    /** Output format: "json" | "markdown" | "html" | "llms-txt" (default: "json") */
    format?: string;
    /** Output directory (default: "./docs-output") */
    dir?: string;
  };

  /** Repository URL for source links in HTML output (e.g. "https://github.com/user/repo") */
  repository?: string;

  /** Plugin list (default: []) */
  plugins?: unknown[];
}
```

## Examples

### oxdoc.config.json

```json
{
  "sourceRoot": "./src",
  "include": ["**/*.ts"],
  "exclude": ["**/*.test.ts", "**/*.internal.ts"],
  "coverage": {
    "threshold": 80,
    "exportedOnly": true
  },
  "output": {
    "format": "html",
    "dir": "./api-docs"
  },
  "repository": "https://github.com/your-org/your-repo"
}
```

### oxdoc.config.js

```javascript
export default {
  sourceRoot: "./lib",
  output: {
    format: "markdown",
    dir: "./docs"
  },
  coverage: {
    threshold: 70
  }
};
```

### package.json

```json
{
  "oxdoc": {
    "sourceRoot": "./src",
    "output": {
      "format": "json"
    }
  }
}
```

## Default Values

| Field | Default |
|-------|---------|
| `sourceRoot` | `"./src"` |
| `include` | `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]` |
| `exclude` | `["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/__tests__/**"]` |
| `coverage.threshold` | `0` (disabled) |
| `coverage.exportedOnly` | `true` |
| `output.format` | `"json"` |
| `output.dir` | `"./docs-output"` |
| `repository` | `""` (disabled) |
| `plugins` | `[]` |
