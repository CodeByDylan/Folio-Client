import "@tanstack/react-start/server-only";
import { z } from "zod";

const environment = z.object({
	FOLIO_API_URL: z.url(),
});

export type Environment = z.infer<typeof environment>;

function read(): Environment {
	const result = environment.safeParse(process.env);

	if (!result.success) {
		throw new Error(`Invalid environment.\n${z.prettifyError(result.error)}`);
	}

	return result.data;
}

export const env: Environment = read();
