import { notFound } from "@tanstack/react-router";
import { hasFailure } from "#/api/errors";
import type { Resolved } from "#/api/folio";

/** Folio calls an absent or unusable slug a failure; a route calls it a not-found. */
export async function requested<T>(call: Promise<Resolved<T>>): Promise<T> {
	try {
		return (await call).value;
	} catch (error) {
		if (hasFailure(error, "not-found") || hasFailure(error, "invalid")) {
			throw notFound();
		}

		throw error;
	}
}
