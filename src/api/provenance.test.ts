import { describe, expect, it } from "vitest";
import { createProvenance, indexed, pointer } from "./provenance";

describe("json pointers", () => {
	it("joins segments", () => {
		expect(pointer("sections", 0, "body")).toBe("/sections/0/body");
	});

	it("escapes the two characters RFC 6901 reserves", () => {
		expect(pointer("a/b", "c~d")).toBe("/a~1b/c~0d");
	});

	it("is empty for no segments", () => {
		expect(pointer()).toBe("");
	});
});

describe("provenance lookup", () => {
	const entries = {
		"/name": { locale: "en", fallback: true },
		"/sections/0/body": { locale: "en", fallback: true },
		"/sections/1/body": { locale: "nl", fallback: false },
	} as never;

	const provenance = createProvenance(entries);

	it("reports a fallback at the root", () => {
		expect(provenance.isFallback("name")).toBe(true);
	});

	// The sidecar is sparse, so a missing pointer means the value came from the asked-for locale.
	it("reports no fallback where the sidecar says nothing", () => {
		expect(provenance.isFallback("tagline")).toBe(false);
	});

	it("believes an entry that says it is not a fallback", () => {
		expect(provenance.section(1).isFallback("body")).toBe(false);
	});

	it("addresses a section without the caller building the pointer", () => {
		expect(provenance.section(0).isFallback("body")).toBe(true);
		expect(provenance.section(2).isFallback("body")).toBe(false);
	});

	it("nests a scope onto the one it came from", () => {
		expect(
			createProvenance({
				"/sections/3/questions/1/answer": { locale: "en", fallback: true },
			} as never)
				.section(3)
				.isFallback("questions", 1, "answer"),
		).toBe(true);
	});
});

describe("capturing wire positions", () => {
	it("keeps each survivor's original index", () => {
		expect(indexed(["a", "", "b"], (item) => item !== "")).toEqual([
			{ item: "a", index: 0 },
			{ item: "b", index: 2 },
		]);
	});

	it("keeps nothing from an empty list", () => {
		expect(indexed([], () => true)).toEqual([]);
	});
});
