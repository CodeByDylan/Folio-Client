import { describe, expect, it } from "vitest";
import { paginate } from "./pagination";

describe("paginating a list", () => {
	it("counts the pages a list needs", () => {
		expect(paginate(9, 4, undefined).pages).toBe(3);
	});

	it("starts at the first page when none was asked for", () => {
		expect(paginate(9, 4, undefined)).toMatchObject({ current: 1, start: 0 });
	});

	it("windows the page that was asked for", () => {
		expect(paginate(9, 4, 2)).toMatchObject({ start: 4, end: 8 });
	});

	it("stops the last window at the end of the list", () => {
		expect(paginate(9, 4, 3)).toMatchObject({ start: 8, end: 9 });
	});

	it("clamps a page beyond the end back to the last one", () => {
		expect(paginate(9, 4, 99)).toMatchObject({ current: 3, start: 8 });
	});

	it("clamps a page below the first back to it", () => {
		expect(paginate(9, 4, 0)).toMatchObject({ current: 1, start: 0 });
	});

	// The empty state has to live somewhere, so an empty list still has one page.
	it("gives an empty list a single page", () => {
		expect(paginate(0, 4, undefined)).toMatchObject({
			current: 1,
			pages: 1,
			start: 0,
			end: 0,
		});
	});

	it("does not paginate a list that fits", () => {
		expect(paginate(4, 4, undefined).pages).toBe(1);
	});
});
