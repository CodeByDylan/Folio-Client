import { describe, expect, it } from "vitest";
import { hasStars, projectDescription, projectName } from "./project";

describe("naming a project", () => {
	it("prefers the name it was given", () => {
		expect(projectName({ name: "Folio", slug: "folio" })).toBe("Folio");
	});

	it("falls back to the slug", () => {
		expect(projectName({ name: null, slug: "folio" })).toBe("folio");
	});

	it("falls back past a blank name", () => {
		expect(projectName({ name: "", slug: "folio" })).toBe("folio");
	});
});

describe("describing a project", () => {
	const repo = "CodeByDylan/folio";

	it("prefers the tagline", () => {
		expect(
			projectDescription({
				slug: "folio",
				repo,
				tagline: "A portfolio",
				metadata: { description: "From GitHub" },
			}),
		).toBe("A portfolio");
	});

	it("falls back to the repository description", () => {
		expect(
			projectDescription({
				slug: "folio",
				repo,
				tagline: null,
				metadata: { description: "From GitHub" },
			}),
		).toBe("From GitHub");
	});

	// A project always has a repository, so there is always something to say.
	it("falls back to the repository itself", () => {
		expect(
			projectDescription({
				slug: "folio",
				repo,
				tagline: null,
				metadata: { description: null },
			}),
		).toBe(repo);
	});
});

describe("whether a star count is worth showing", () => {
	it("shows a count there is one of", () => {
		expect(hasStars({ stars: 1 })).toBe(true);
	});

	it("hides a count of none", () => {
		expect(hasStars({ stars: 0 })).toBe(false);
	});
});
