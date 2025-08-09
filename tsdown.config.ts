import { defineConfig } from "tsdown"

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    platform: "neutral",
    sourcemap: false,
    minify: true,
    bundle: true,
    dts: true,
    clean: true,
    format: ["es"],
    external: ["react"],
  },
])
