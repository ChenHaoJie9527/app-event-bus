import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: true,
	sourcemap: false,
	clean: true,
	minify: true,
	external: ["vitest"],
});
