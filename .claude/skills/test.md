# 테스트 워크플로우 스킬

## 테스트 구조
```
tests/
├── fixtures/          # 테스트용 TS/JS 소스 파일
│   ├── simple-function.ts
│   ├── class-with-jsdoc.ts
│   ├── interface-docs.ts
│   └── no-docs.ts
├── parser/            # 파서 테스트
├── analyzer/          # 분석기 테스트
├── generator/         # 생성기 테스트
└── setup.test.ts      # 프로젝트 설정 스모크 테스트
```

## 테스트 작성 규칙
- vitest 사용 (`describe`, `it`, `expect`)
- `tests/` 디렉토리가 `src/` 구조를 미러링
- 픽스처 파일은 `tests/fixtures/`에 실제 TS 파일로 작성
- 한글 테스트 설명 사용 가능

## 실행 명령
- `pnpm test` — 전체 실행
- `pnpm test:watch` — 워치 모드
- `pnpm test:coverage` — 커버리지 포함

## 커버리지 기준
- Lines: 80% 이상
- Branches: 70% 이상
- Functions: 80% 이상
