---
sidebar_position: 2
---

# CLI 레퍼런스

## oxdoc generate

소스 파일에서 API 문서를 생성합니다.

```bash
oxdoc generate [path] [options]
```

| 인자/옵션 | 설명 | 기본값 |
|-----------|------|--------|
| `[path]` | 소스 디렉토리 경로 | `./src` |
| `-f, --format <format>` | 출력 형식 (`json`, `markdown`, `llms-txt`) | `json` |
| `-o, --output <dir>` | 출력 디렉토리 | `./docs-output` |
| `-w, --watch` | 파일 변경 감지 시 자동 재생성 | `false` |
| `--include <patterns...>` | 포함할 glob 패턴 | `**/*.{ts,tsx,js,jsx}` |
| `--exclude <patterns...>` | 제외할 glob 패턴 | `**/*.test.*`, `**/node_modules/**` |

### 예시

```bash
# 기본 사용
oxdoc generate ./src

# Markdown으로 특정 디렉토리에 출력
oxdoc generate ./lib --format markdown --output ./api-docs

# 특정 파일만 포함
oxdoc generate ./src --include "**/*.ts" --exclude "**/*.internal.*"

# AI 친화적 llms.txt 형식으로 생성
oxdoc generate ./src --format llms-txt

# Watch 모드 (파일 변경 시 자동 재생성)
oxdoc generate ./src --format markdown --watch
```

---

## oxdoc coverage

문서 커버리지를 측정합니다.

```bash
oxdoc coverage [path] [options]
```

| 인자/옵션 | 설명 | 기본값 |
|-----------|------|--------|
| `[path]` | 소스 디렉토리 경로 | `./src` |
| `-t, --threshold <percent>` | 최소 커버리지 임계값 (%) | `0` |
| `--all` | 비export 심볼도 포함 | `false` |
| `--format <format>` | 출력 형식 (`text`, `json`) | `text` |

### 출력 예시

```
  Documentation Coverage Report
  ───────────────────────────────────
  Total symbols:      42
  Documented:         35  (83.3%)
  Undocumented:        7

  By kind:
    function       12/15  (80.0%)
    class           5/5   (100.0%)
    interface       8/10  (80.0%)

  Undocumented symbols:
    ⚠ src/utils.ts:15  function  formatDate
    ⚠ src/config.ts:3  variable  DEFAULT_CONFIG

  ✓ Coverage 83.3% meets threshold 80%
```

### CI 연동

임계값 미달 시 exit code 1을 반환하므로 CI에서 바로 사용 가능합니다:

```yaml
# GitHub Actions
- name: Check documentation coverage
  run: npx oxdoc coverage ./src --threshold 80
```

---

## oxdoc doctest

`@example` 블록의 코드를 실행하여 검증합니다.

```bash
oxdoc doctest [path] [options]
```

| 인자/옵션 | 설명 | 기본값 |
|-----------|------|--------|
| `[path]` | 소스 디렉토리 경로 | `./src` |
| `--bail` | 첫 번째 실패 시 중단 | `false` |

### 출력 예시

```
  ✓ add (math.ts:5) - 2 assertion(s) passed
  ✓ subtract (math.ts:18) - 1 assertion(s) passed
  ✗ multiply (math.ts:31) - assertion failed
    Expected 6, got undefined

  Results: 2 passed, 1 failed, 3 total
```
