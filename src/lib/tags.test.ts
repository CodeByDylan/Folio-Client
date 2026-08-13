import { describe, expect, it } from "vitest";
import { statusVariant, type Tag, tagColour } from "./tags";

const tag = (kind?: string) => ({ id: "t", kind }) as Tag;

describe("colouring a tag", () => {
	it("gives each kind its own colour", () => {
		expect(tagColour(tag("language"))).toBe("blue");
		expect(tagColour(tag("framework"))).toBe("purple");
		expect(tagColour(tag("domain"))).toBe("teal");
		expect(tagColour(tag("tool"))).toBe("orange");
	});

	it("falls back for a kind it does not know", () => {
		expect(tagColour(tag("mystery"))).toBe("default");
	});

	it("falls back for a tag with no kind at all", () => {
		expect(tagColour(tag())).toBe("default");
	});
});

describe("showing a project status", () => {
	it("maps every status the wire can send", () => {
		expect(statusVariant("wip")).toBe("accent");
		expect(statusVariant("active")).toBe("success");
		expect(statusVariant("maintenance")).toBe("warning");
		expect(statusVariant("archived")).toBe("neutral");
	});
});
