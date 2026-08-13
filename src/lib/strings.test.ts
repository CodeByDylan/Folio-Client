import { describe, expect, it } from "vitest";
import type { StringKey } from "./defaults";
import { astryxOverrides, fallbackTranslator, translator } from "./strings";

// The interface refuses this key, so reaching the last rung takes a cast to get here.
const unknownKey = "no_such_key" as StringKey;

describe("translating a key", () => {
	it("prefers what the site says", () => {
		expect(translator({ retry: "Once more" })("retry")).toBe("Once more");
	});

	it("falls back to the built-in default", () => {
		expect(translator({})("retry")).toBe("Try again");
	});

	// A translation left blank means "nothing here", not an empty label.
	it("falls back past a translation left blank", () => {
		expect(translator({ retry: "" })("retry")).toBe("Try again");
	});

	it("returns the key when nothing names it", () => {
		expect(translator({})(unknownKey)).toBe("no_such_key");
	});

	it("gives the boundaries the same chain without a site", () => {
		expect(fallbackTranslator("retry")).toBe("Try again");
		expect(fallbackTranslator(unknownKey)).toBe("no_such_key");
	});
});

describe("naming a project status", () => {
	it("uses the built-in default", () => {
		expect(translator({}).status("wip")).toBe("In progress");
	});

	it("prefers what the site says", () => {
		expect(translator({ status_active: "Shipping" }).status("active")).toBe(
			"Shipping",
		);
	});
});

describe("naming a skill level", () => {
	it("uses the built-in default", () => {
		expect(translator({}).skill("expert")).toBe("Expert");
	});
});

describe("naming a locale", () => {
	it("uses the string the site published", () => {
		expect(translator({ locale_nl: "Nederlands" }).locale("nl")).toBe(
			"Nederlands",
		);
	});

	// Falls back to the bare code, casing intact — `pt-BR` must stay `pt-BR`.
	it("shows the bare code when nothing names it", () => {
		expect(translator({}).locale("nl")).toBe("nl");
		expect(translator({}).locale("pt-BR")).toBe("pt-BR");
	});
});

describe("labelling a link", () => {
	const link = { type: "demo", url: "https://demo.test" };

	it("prefers the label the api sent", () => {
		expect(translator({}).link({ ...link, label: "Live demo" })).toBe(
			"Live demo",
		);
	});

	it("falls back to the string named for its type", () => {
		expect(translator({ link_demo: "Demo" }).link(link)).toBe("Demo");
	});

	it("shows the url when neither names it", () => {
		expect(translator({}).link(link)).toBe("https://demo.test");
	});

	it("treats a blank label as no label at all", () => {
		expect(translator({}).link({ ...link, label: "" })).toBe(
			"https://demo.test",
		);
	});
});

describe("handing overrides to the design system", () => {
	it("keeps only the prefixed keys, under the locale", () => {
		expect(
			astryxOverrides({ "@astryx.close": "Sluiten", retry: "Opnieuw" }, "nl"),
		).toEqual({ nl: { "@astryx.close": "Sluiten" } });
	});

	// An empty object would make the provider fall back cleanly; a locale key would not.
	it("says nothing when the site overrides nothing", () => {
		expect(astryxOverrides({ retry: "Opnieuw" }, "nl")).toEqual({});
	});
});
