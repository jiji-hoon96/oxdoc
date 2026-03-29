import { watch } from "node:fs/promises";

/**
 * 디렉토리를 감시하고 변경 시 콜백을 디바운스하여 실행한다.
 * @param dir - 감시할 디렉토리
 * @param callback - 변경 시 실행할 함수
 * @param debounceMs - 디바운스 간격 (기본 300ms)
 */
export async function watchDirectory(
  dir: string,
  callback: (filename: string | null) => void | Promise<void>,
  debounceMs = 300,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(dir, { recursive: true });

  for await (const event of watcher) {
    const filename = event.filename;
    // TS/JS 파일만 관심
    if (filename && !/\.(ts|tsx|js|jsx)$/.test(filename)) continue;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback(filename);
    }, debounceMs);
  }
}
