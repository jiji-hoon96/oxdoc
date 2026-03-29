# oxdoc Benchmarks

## 실행 방법

```bash
# 전체 벤치마크 실행 (100, 500, 1000, 5000 파일)
pnpm bench

# 특정 규모의 픽스처만 생성
npx tsx benchmarks/generate-fixtures.ts 10000
```

## 측정 항목

- **Parse(ms)**: 전체 파일 파싱 시간 (OXC parser + JSDoc 매칭)
- **Cover(ms)**: 커버리지 분석 시간
- **Total(ms)**: 전체 처리 시간
- **Memory(MB)**: 힙 메모리 증가량

## 참고

- 픽스처는 `benchmarks/fixtures/`에 캐시되어 재실행 시 재생성하지 않음
- `benchmarks/fixtures/`는 .gitignore에 포함
