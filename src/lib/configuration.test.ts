import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { configuration } from "./configuration";

const schema = z.object({
	URL: z.url(),
	OPTIONAL: z.string().min(1).optional(),
});

describe("reading configuration", () => {
	it("returns what the source parsed to", () => {
		const read = configuration("test", schema, () => ({
			URL: "https://folio.test",
		}));

		expect(read()).toEqual({ URL: "https://folio.test" });
	});

	// Importing a module must never demand a configured server, so nothing is read yet.
	it("does not touch the source until it is called", () => {
		const source = vi.fn(() => ({ URL: "https://folio.test" }));

		configuration("test", schema, source);

		expect(source).not.toHaveBeenCalled();
	});

	it("reads the source once, however often it is asked", () => {
		const source = vi.fn(() => ({ URL: "https://folio.test" }));
		const read = configuration("test", schema, source);

		read();
		read();
		read();

		expect(source).toHaveBeenCalledOnce();
	});

	it("names itself and every fault when the source is wrong", () => {
		const read = configuration("environment", schema, () => ({ URL: "nope" }));

		expect(read).toThrow(/Invalid environment/);
		expect(read).toThrow(/URL/);
	});

	it("reports a source that is missing entirely", () => {
		const read = configuration("test", schema, () => undefined);

		expect(read).toThrow(/Invalid test/);
	});

	// A dotenv line left blank, `KEY=`, arrives as "" and means the key is not set.
	it("treats a value left blank as absent", () => {
		const read = configuration("test", schema, () => ({
			URL: "https://folio.test",
			OPTIONAL: "",
		}));

		expect(read()).toEqual({ URL: "https://folio.test" });
	});
});
