import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

// The Start plugin is deliberately absent: these tests cover modules, not routes.
export default defineConfig({
	plugins: [react()],
	resolve: { alias: { "#": src, "@": src } },
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "modules",
					environment: "node",
					include: ["src/**/*.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "rendering",
					environment: "jsdom",
					include: ["src/**/*.test.tsx"],
					setupFiles: ["./src/test-dom.ts"],
				},
			},
		],
	},
});
