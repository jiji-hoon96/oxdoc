import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "lib/index": "src/lib/index.ts" },
    format: ["esm"],
    dts: true,
    splitting: true,
    clean: true,
    target: "node20",
  },
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    splitting: true,
    clean: false,
    target: "node20",
    banner: { js: "#!/usr/bin/env node" },
  },
]);
