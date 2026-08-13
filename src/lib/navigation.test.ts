import { describe, expect, it } from "vitest";
import type { ProjectSummary, Site } from "#/api/model";
import { navigation } from "./navigation";

const page = (slug: string, nav: boolean, home = false) =>
	({ slug, home, nav, navLabel: null }) as unknown as Site["pages"][number];

const site = (...pages: ReadonlyArray<Site["pages"][number]>) =>
	({ pages }) as unknown as Site;

const project = (slug: string, featured: boolean, stars = 0) =>
	({
		slug,
		featured,
		name: null,
		metadata: { stars },
	}) as unknown as ProjectSummary;

describe("what the navigation offers", () => {
	const pages = site(
		page("welcome", true, true),
		page("about", true),
		page("privacy", false),
	);

	it("separates the pages in the navigation from the rest", () => {
		const nav = navigation(pages, [], "/");

		expect(nav.pages.map((item) => item.slug)).toEqual(["welcome", "about"]);
		expect(nav.utility.map((item) => item.slug)).toEqual(["privacy"]);
	});

	it("keeps only the projects marked featured", () => {
		const nav = navigation(
			pages,
			[project("folio", true), project("other", false)],
			"/",
		);

		expect(nav.featured.map((item) => item.slug)).toEqual(["folio"]);
	});

	it("names a project that has no name after its slug", () => {
		const nav = navigation(pages, [project("folio", true)], "/");

		expect(nav.featured[0]?.label).toBe("folio");
	});

	it("labels a page whose navLabel is blank by its slug", () => {
		const blank = {
			slug: "about",
			home: false,
			nav: true,
			navLabel: "",
		} as unknown as Site["pages"][number];

		expect(navigation(site(blank), [], "/").pages[0]?.label).toBe("about");
	});
});

describe("where the visitor is", () => {
	const pages = site(page("welcome", true, true), page("about", true));

	it("marks the home page at the root", () => {
		const nav = navigation(pages, [], "/");

		expect(nav.pages[0]?.isCurrent).toBe(true);
		expect(nav.pages[1]?.isCurrent).toBe(false);
	});

	it("marks a page by its own path", () => {
		expect(navigation(pages, [], "/about").pages[1]?.isCurrent).toBe(true);
	});

	// Route paths carry a trailing slash that page paths never do.
	it("ignores a trailing slash", () => {
		expect(navigation(pages, [], "/about/").pages[1]?.isCurrent).toBe(true);
	});

	it("marks the projects section on the index", () => {
		expect(navigation(pages, [], "/projects").allProjects.isCurrent).toBe(true);
	});

	// A project's own page is still inside the section, which is what the side nav shows.
	it("marks the projects section on a project's own page", () => {
		expect(navigation(pages, [], "/projects/folio").allProjects.isCurrent).toBe(
			true,
		);
	});

	it("marks the featured project whose page this is", () => {
		const nav = navigation(
			pages,
			[project("folio", true), project("other", true)],
			"/projects/folio",
		);

		expect(nav.featured[0]?.isCurrent).toBe(true);
		expect(nav.featured[1]?.isCurrent).toBe(false);
	});

	it("marks nothing on a page it does not know", () => {
		const nav = navigation(pages, [], "/nowhere");

		expect(nav.pages.some((item) => item.isCurrent)).toBe(false);
		expect(nav.allProjects.isCurrent).toBe(false);
	});
});
