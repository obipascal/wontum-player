import { defineConfig } from "vite"
import { resolve } from "path"
import dts from "vite-plugin-dts"

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "WontumPlayer",
			formats: ["es", "cjs"],
			fileName: (format) => `wontum-player.${format === "es" ? "esm" : "cjs"}.js`,
		},
		rollupOptions: {
			external: ["react", "react-dom", "hls.js"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"hls.js": "Hls",
				},
			},
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true,
		}),
	],
})
