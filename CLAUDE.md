# oxdoc - Claude Context

## 프로젝트 개요
OXC 파서(Rust NAPI)를 활용한 네이티브 속도 TypeScript/JavaScript API 문서 생성기.
TypeDoc의 성능/메모리 한계를 해결하고, 문서 커버리지 체크, doc test, 다양한 출력 포맷을 제공한다.

## 아키텍처
```
src/
├── lib/           # 핵심 라이브러리 (npm 패키지로 export)
│   ├── parser/    # OXC 파서 래퍼 + JSDoc 파싱 (comment-parser)
│   ├── analyzer/  # 심볼 분석, 문서 커버리지 계산
│   ├── generator/ # JSON, Markdown 출력 생성
│   └── utils/     # 파일 탐색, 로거
├── cli/           # CLI 진입점 (commander 기반)
└── types/         # 공유 타입 정의
```

## 핵심 의존성
- `oxc-parser`: Rust NAPI 바인딩, AST 파싱 (parseSync 사용)
- `comment-parser`: JSDoc 블록 주석 파싱 (0 deps)
- `commander`: CLI 프레임워크
- `fast-glob`: 파일 탐색
- `chalk`: 터미널 색상

## 코드 컨벤션
- TypeScript strict 모드, ESM only (`type: "module"`)
- 변수/함수명: camelCase, 타입/인터페이스: PascalCase
- 코드 식별자는 영어, 주석은 한국어 허용
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- 각 기능 구현 완료 = 1 커밋

## 테스트
- vitest 사용, `tests/` 디렉토리
- 테스트 픽스처: `tests/fixtures/` (실제 TS/JS 파일)
- 커버리지 목표: lines 80%, branches 70%, functions 80%
- `pnpm test` — 전체 테스트 실행
- `pnpm test:coverage` — 커버리지 포함

## 빌드
- `pnpm build` — tsup으로 ESM 빌드 + DTS 생성
- `pnpm oxdoc` — tsx로 CLI 개발 모드 실행

## 브랜치 전략
- `main`: 안정 브랜치, 직접 커밋
- 현재는 main에 직접 커밋하되, 기능별 커밋 단위 유지

## CHANGELOG
- Keep a Changelog 형식 (https://keepachangelog.com)
- 모든 기능 커밋 시 CHANGELOG.md의 [Unreleased] 섹션 업데이트
