# oxdoc

Native-speed TypeScript/JavaScript API documentation generator powered by [OXC](https://oxc.rs/).

## Features

- **OXC Parser** - Rust NAPI 바인딩 기반 초고속 파싱
- **JSDoc/TSDoc 추출** - 소스 코드에서 API 문서 자동 생성
- **문서 커버리지** - export된 심볼의 문서화 비율 측정
- **Doc Test** - `@example` 블록의 코드를 실제 실행하여 검증
- **다양한 출력** - JSON, Markdown 포맷 지원

## Quick Start

```bash
# 설치
pnpm add -D oxdoc

# API 문서 생성
npx oxdoc generate ./src --format markdown

# 문서 커버리지 체크
npx oxdoc coverage ./src --threshold 80

# Doc test 실행
npx oxdoc doctest ./src
```

## Why oxdoc?

TypeDoc은 tsc(TypeScript Compiler)에 의존하여 대형 프로젝트에서 OOM과 성능 문제가 발생합니다. oxdoc은 OXC의 Rust NAPI 파서를 사용하여 10-100x 빠른 파싱 속도를 제공합니다.

## License

MIT
