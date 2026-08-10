import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input:
		"https://raw.githubusercontent.com/CodeByDylan/Folio/main/docs/openapi.json",
	output: { path: "src/api/generated", postProcess: [] },
	plugins: ["@hey-api/typescript", { name: "zod", dates: { offset: true } }],
});
