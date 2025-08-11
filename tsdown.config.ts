import { defineConfig } from "tsdown"

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    platform: "neutral",
    sourcemap: false,
    minify: true,
    unbundle: false,
    dts: true,
    clean: true,
    format: ["es"],
    external: ["react"],
  },
])
