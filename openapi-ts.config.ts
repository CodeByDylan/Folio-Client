import { defineConfig } from "@hey-api/openapi-ts";

// Point FOLIO_OPENAPI at a local Folio checkout's docs/openapi.json to generate against a branch.
const published =
	"https://raw.githubusercontent.com/CodeByDylan/Folio/main/docs/openapi.json";

export default defineConfig({
	input: process.env.FOLIO_OPENAPI ?? published,
	output: { path: "src/api/generated", postProcess: [] },
	plugins: ["@hey-api/typescript", { name: "zod", dates: { offset: true } }],
});
