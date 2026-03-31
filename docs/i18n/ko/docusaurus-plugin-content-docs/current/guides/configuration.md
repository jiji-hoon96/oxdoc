---
sidebar_position: 4
---

# 설정

oxdoc은 여러 설정 방법을 지원합니다. CLI 플래그는 항상 설정 파일 값보다 우선합니다.

## 설정 파일 탐색 순서

oxdoc은 다음 순서로 설정을 탐색합니다:

1. `oxdoc.config.json`
2. `oxdoc.config.js` / `oxdoc.config.mjs`
3. `package.json`의 `"oxdoc"` 필드

## 전체 스키마

```typescript
interface OxdocConfig {
  /** 소스 루트 디렉토리 (기본: "./src") */
  sourceRoot?: string;

  /** 포함 glob 패턴 (기본: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]) */
  include?: string[];

  /** 제외 glob 패턴 (기본: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/__tests__/**"]) */
  exclude?: string[];

  coverage?: {
    /** 최소 커버리지 임계값 (기본: 0, 비활성) */
    threshold?: number;
    /** export된 심볼만 포함 (기본: true) */
    exportedOnly?: boolean;
  };

  output?: {
    /** 출력 형식: "json" | "markdown" | "html" | "llms-txt" (기본: "json") */
    format?: string;
    /** 출력 디렉토리 (기본: "./docs-output") */
    dir?: string;
  };

  /** HTML 출력에서 소스 링크를 위한 저장소 URL (예: "https://github.com/user/repo") */
  repository?: string;

  /** 플러그인 목록 (기본: []) */
  plugins?: unknown[];
}
```

## 예제

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

## 기본값

| 필드 | 기본값 |
|------|--------|
| `sourceRoot` | `"./src"` |
| `include` | `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]` |
| `exclude` | `["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/__tests__/**"]` |
| `coverage.threshold` | `0` (비활성) |
| `coverage.exportedOnly` | `true` |
| `output.format` | `"json"` |
| `output.dir` | `"./docs-output"` |
| `repository` | `""` (비활성) |
| `plugins` | `[]` |
