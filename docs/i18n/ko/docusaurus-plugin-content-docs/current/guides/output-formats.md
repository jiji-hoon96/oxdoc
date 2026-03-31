---
sidebar_position: 6
---

# 출력 포맷

oxdoc은 4가지 출력 포맷을 지원하며, 각각 다른 용도에 적합합니다.

## JSON

전체 메타데이터를 포함한 구조화된 출력. 도구 연동 및 프로그래밍 방식 소비에 적합합니다.

```bash
oxdoc generate ./src --format json
```

완전한 `ProjectDocumentation` 구조를 포함합니다:

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
            "description": "Date 객체를 ISO 문자열로 포맷합니다",
            "tags": [
              { "tag": "param", "name": "date", "description": "포맷할 날짜" },
              { "tag": "returns", "description": "포맷된 날짜 문자열" }
            ]
          }
        }
      ]
    }
  ]
}
```

## Markdown

사람이 읽을 수 있는 문서. GitHub 위키나 정적 사이트 생성기에 적합합니다.

```bash
oxdoc generate ./src --format markdown
```

다음을 포함하는 Markdown 파일을 생성합니다:
- `##` 헤더로 구분된 파일 기반 섹션
- 파라미터 테이블 (Name | Type | Description)
- 반환 타입 섹션
- 예제 코드 블록

## HTML

내장 UI 기능을 갖춘 독립 실행형 단일 페이지 문서.

```bash
oxdoc generate ./src --format html
```

기능:
- **사이드바 네비게이션** — 접을 수 있는 파일 트리
- **검색 기능** — 심볼 필터링
- **다크 테마** 지원
- **심볼 뱃지** — 종류(function, class, interface 등) 표시
- **해시 기반 네비게이션** — 심볼에 직접 링크
- 외부 의존성 없음 — 하나의 자체 포함 HTML 파일

## llms.txt

[llmstxt.org](https://llmstxt.org) 사양을 따르는 AI/LLM 최적화 포맷.

```bash
oxdoc generate ./src --format llms-txt
```

용도:
- GitHub Copilot 컨텍스트
- Claude 및 ChatGPT 프로젝트 지식
- AI 기반 코드 어시스턴트
- 최소한의 토큰으로 최대한의 정보 밀도

출력은 Markdown보다 단순화되어 있으며, LLM 컨텍스트 윈도우에 최적화된 컴팩트한 형태로 시그니처, 파라미터, 반환 타입에 집중합니다.
