import { isNotFound } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { FolioError } from "#/api/errors";
import type { Resolved } from "#/api/folio";
import { requested } from "./loaders";

const resolved = <T>(value: T): Promise<Resolved<T>> =>
	Promise.resolve({ value, localeRejected: false });

const refused = (failure: "not-found" | "invalid" | "unavailable") =>
	Promise.reject(
		new FolioError(failure, "refused", { resource: "/v1/pages/x" }),
	) as Promise<Resolved<never>>;

describe("loading what a route asked for", () => {
	it("unwraps the value", async () => {
		await expect(requested(resolved("page"))).resolves.toBe("page");
	});

	it("turns an absent resource into the router's not-found", async () => {
		await expect(requested(refused("not-found"))).rejects.toSatisfy(isNotFound);
	});

	// A slug the API refuses names nothing this site serves, which is a not-found too.
	it("turns a refused request into the router's not-found", async () => {
		await expect(requested(refused("invalid"))).rejects.toSatisfy(isNotFound);
	});

	it("lets any other failure reach the error boundary", async () => {
		await expect(requested(refused("unavailable"))).rejects.toMatchObject({
			failure: "unavailable",
		});
	});
});
