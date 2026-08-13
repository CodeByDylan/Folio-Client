import type { z } from "zod";
import { prettifyError } from "zod";

/**
 * Reads a configuration source on first use, so importing a module never demands
 * one, and reports every fault at once rather than throwing a bare parse error.
 */
/** A dotenv value left blank arrives as "", which every optional field means as absent. */
function withoutBlanks(source: unknown): unknown {
	if (typeof source !== "object" || source === null) {
		return source;
	}

	return Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== ""),
	);
}

export function configuration<TSchema extends z.ZodType>(
	name: string,
	schema: TSchema,
	source: () => unknown,
): () => z.infer<TSchema> {
	let cached: z.infer<TSchema> | undefined;

	return () => {
		if (cached === undefined) {
			const result = schema.safeParse(withoutBlanks(source()));

			if (!result.success) {
				throw new Error(`Invalid ${name}.\n${prettifyError(result.error)}`);
			}

			cached = result.data;
		}

		return cached;
	};
}
