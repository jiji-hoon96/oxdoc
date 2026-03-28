# 커밋 워크플로우 스킬

## 커밋 전 체크리스트
1. `pnpm test` 전체 테스트 통과 확인
2. `pnpm build` 빌드 성공 확인
3. `pnpm typecheck` 타입 체크 통과 확인
4. CHANGELOG.md의 `[Unreleased]` 섹션에 변경사항 추가

## Conventional Commits 형식
```
<type>: <description>

[optional body]

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `chore`: 빌드, 설정, 도구 변경
- `docs`: 문서 변경
- `test`: 테스트 추가/수정
- `refactor`: 리팩토링 (기능 변경 없음)

## CHANGELOG 업데이트 규칙
- `feat` → Added 섹션
- `fix` → Fixed 섹션
- `chore`/`refactor` → Changed 섹션
- 삭제된 기능 → Removed 섹션
