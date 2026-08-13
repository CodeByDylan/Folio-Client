import { describe, expect, it } from "vitest";
import type { SitePage } from "#/api/model";
import {
	isInternal,
	normalisePath,
	pagePath,
	projectPath,
	shadowedPages,
} from "./routing";

const site = (slug: string, home = false) =>
	({ slug, home, nav: true, navLabel: null }) as unknown as SitePage;

describe("page paths", () => {
	it("serves the home page at the root", () => {
		expect(pagePath(site("welcome", true))).toBe("/");
	});

	it("hangs every other page off its slug", () => {
		expect(pagePath(site("about"))).toBe("/about");
	});

	it("nests a project under its index", () => {
		expect(projectPath("folio")).toBe("/projects/folio");
	});
});

describe("shadowed pages", () => {
	// Route paths arrive with a trailing slash, which is what made this miss before.
	const routes = ["/", "/projects/", "/projects/$slug", "/$"];

	it("names a page a file route already owns", () => {
		expect(shadowedPages([site("projects"), site("about")], routes)).toEqual([
			"projects",
		]);
	});

	it("ignores the home page, which the root route always owns", () => {
		expect(shadowedPages([site("welcome", true)], routes)).toEqual([]);
	});

	// Contrived on purpose: only a slug matching a `$` path proves the filter runs.
	it("does not count a parameterised route as owning a slug", () => {
		expect(shadowedPages([site("$slug")], ["/$slug"])).toEqual([]);
	});
});

describe("normalising a path", () => {
	it("strips a trailing slash", () => {
		expect(normalisePath("/projects/")).toBe("/projects");
	});

	// The root is all trailing slash; stripping it would leave nothing to compare.
	it("leaves the root alone", () => {
		expect(normalisePath("/")).toBe("/");
	});

	it("leaves a path that has none alone", () => {
		expect(normalisePath("/about")).toBe("/about");
	});
});

describe("telling an internal url from an external one", () => {
	it("calls a rooted path internal", () => {
		expect(isInternal("/about")).toBe(true);
	});

	it("calls an absolute url external", () => {
		expect(isInternal("https://elsewhere.test")).toBe(false);
	});

	it("calls an absent url external", () => {
		expect(isInternal(undefined)).toBe(false);
	});
});
