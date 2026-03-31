import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

export interface OxdocConfig {
  sourceRoot?: string;
  include?: string[];
  exclude?: string[];
  coverage?: {
    threshold?: number;
    exportedOnly?: boolean;
  };
  output?: {
    format?: "json" | "markdown" | "html" | "llms-txt";
    dir?: string;
  };
  plugins?: unknown[];
}

const DEFAULT_CONFIG: Required<OxdocConfig> = {
  sourceRoot: "./src",
  include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  exclude: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/__tests__/**"],
  coverage: { threshold: 0, exportedOnly: true },
  output: { format: "json", dir: "./docs-output" },
  plugins: [],
};

const CONFIG_FILES = [
  "oxdoc.config.json",
  "oxdoc.config.js",
  "oxdoc.config.mjs",
];

/**
 * 프로젝트 루트에서 설정 파일을 로드한다.
 * @param cwd - 프로젝트 루트 (기본: process.cwd())
 * @returns 기본값과 병합된 설정
 */
export async function loadConfig(cwd?: string): Promise<Required<OxdocConfig>> {
  const root = cwd ?? process.cwd();
  let userConfig: OxdocConfig = {};

  // 1. JSON 설정 파일 확인
  const jsonPath = resolve(root, CONFIG_FILES[0]);
  if (existsSync(jsonPath)) {
    try {
      const content = readFileSync(jsonPath, "utf-8");
      userConfig = JSON.parse(content);
    } catch {
      // JSON 파싱 실패 시 무시
    }
  }

  // 2. JS/MJS 설정 파일 확인
  if (Object.keys(userConfig).length === 0) {
    for (const file of CONFIG_FILES.slice(1)) {
      const filePath = resolve(root, file);
      if (existsSync(filePath)) {
        try {
          const imported = await import(filePath);
          userConfig = imported.default ?? imported;
        } catch {
          // import 실패 시 다음 시도
        }
        break;
      }
    }
  }

  // 3. package.json "oxdoc" 필드 확인
  if (Object.keys(userConfig).length === 0) {
    const pkgPath = join(root, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (pkg.oxdoc && typeof pkg.oxdoc === "object") {
          userConfig = pkg.oxdoc;
        }
      } catch {
        // package.json 파싱 실패 시 무시
      }
    }
  }

  return mergeConfig(DEFAULT_CONFIG, userConfig);
}

/**
 * 기본 설정과 사용자 설정을 병합한다.
 */
export function mergeConfig(
  defaults: Required<OxdocConfig>,
  user: OxdocConfig,
): Required<OxdocConfig> {
  return {
    sourceRoot: user.sourceRoot ?? defaults.sourceRoot,
    include: user.include ?? defaults.include,
    exclude: user.exclude ?? defaults.exclude,
    coverage: {
      ...defaults.coverage,
      ...user.coverage,
    },
    output: {
      ...defaults.output,
      ...user.output,
    },
    plugins: user.plugins ?? defaults.plugins,
  };
}

export { DEFAULT_CONFIG };
