import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "lib/index": "src/lib/index.ts",
    "cli/index": "src/cli/index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  clean: true,
  target: "node20",
  banner: ({ format }) => {
    if (format === "esm") {
      return {
        js: '#!/usr/bin/env node',
      };
    }
    return {};
  },
});
