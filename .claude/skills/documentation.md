# 문서화 스킬

## Docusaurus 문서 사이트
- 위치: `docs/` 디렉토리
- 기술 결정은 ADR (Architecture Decision Record)로 기록
- ADR 위치: `docs/docs/adr/`

## ADR 형식
```markdown
# ADR-NNN: 제목

## 상태
Accepted / Proposed / Deprecated

## 컨텍스트
왜 이 결정이 필요한가?

## 결정
무엇을 결정했는가?

## 결과
이 결정으로 인한 영향은?
```

## API 문서 규칙
- 모든 export된 함수/클래스/인터페이스에 JSDoc 작성
- `@param`, `@returns`, `@example` 태그 필수
- `@example` 블록은 실행 가능한 코드로 작성
