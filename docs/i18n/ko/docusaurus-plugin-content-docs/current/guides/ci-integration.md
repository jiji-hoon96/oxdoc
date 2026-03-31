---
sidebar_position: 3
---

# CI/CD 연동

oxdoc은 CI 환경에서 문서 품질을 자동으로 검증할 수 있습니다.

## GitHub Actions

```yaml
name: Documentation Check

on: [push, pull_request]

jobs:
  doc-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: pnpm install

      # 문서 커버리지 80% 이상 유지
      - name: Check doc coverage
        run: npx @jiji-hoon96/oxdoc coverage ./src --threshold 80

      # @example 블록이 실제로 동작하는지 검증
      - name: Run doc tests
        run: npx @jiji-hoon96/oxdoc doctest ./src

      # API 문서 생성 (선택)
      - name: Generate API docs
        run: npx @jiji-hoon96/oxdoc generate ./src --format markdown --output ./api-docs
```

## Pre-commit Hook

```json
// package.json
{
  "scripts": {
    "doc:check": "oxdoc coverage ./src --threshold 80",
    "doc:test": "oxdoc doctest ./src"
  }
}
```

```bash
# lint-staged와 함께 사용
npx @jiji-hoon96/oxdoc coverage ./src --threshold 80
```
