import { describe, expect, it } from "vitest";
import { hasContent, type PageSection, zPage } from "./sections";

const page = (...sections: ReadonlyArray<unknown>) => ({
	requestedLocale: "en",
	locale: "en",
	slug: "about",
	home: false,
	navLabel: null,
	sections,
	provenance: {},
});

describe("the page contract", () => {
	it("keeps a known section at its own type", () => {
		const parsed = zPage.parse(
			page({ id: "intro", type: "prose", source: "folio", body: "# Hello" }),
		);

		expect(parsed.sections[0]).toMatchObject({ id: "intro", type: "prose" });
	});

	it("degrades a type this client predates rather than losing the page", () => {
		const parsed = zPage.parse(
			page({ id: "timeline", type: "timeline", entries: [1, 2] }),
		);

		expect(parsed.sections[0]).toEqual({
			id: "timeline",
			type: "unknown",
			declared: "timeline",
		});
	});

	it("refuses a malformed known type instead of calling it unknown", () => {
		// The fallback must not swallow a prose section whose body is the wrong shape.
		expect(() =>
			zPage.parse(
				page({ id: "intro", type: "prose", source: "folio", body: 7 }),
			),
		).toThrow();
	});

	it("reads a projects selection, limit and all", () => {
		const parsed = zPage.parse(
			page({
				id: "work",
				type: "projects",
				heading: null,
				featured: true,
				limit: 3,
			}),
		);

		expect(parsed.sections[0]).toMatchObject({ featured: true, limit: 3 });
	});

	it("refuses a section that carries no id", () => {
		expect(() => zPage.parse(page({ type: "timeline" }))).toThrow();
	});
});

describe("whether a section has anything to show", () => {
	const parse = (section: unknown): PageSection =>
		zPage.parse(page(section)).sections[0] as PageSection;

	it("shows prose that has a body", () => {
		expect(
			hasContent(
				parse({ id: "a", type: "prose", source: "folio", body: "hi" }),
			),
		).toBe(true);
	});

	it("hides prose that has none", () => {
		expect(
			hasContent(
				parse({ id: "a", type: "prose", source: "folio", body: null }),
			),
		).toBe(false);
	});

	// An unanswered question is not worth a divider or a heading.
	it("hides a q&a section where nothing is answered", () => {
		expect(
			hasContent(
				parse({
					id: "faq",
					type: "qa",
					questions: [{ id: "q1", question: "Why?", answer: null }],
				}),
			),
		).toBe(false);
	});

	it("shows a q&a section as soon as one question is answered", () => {
		expect(
			hasContent(
				parse({
					id: "faq",
					type: "qa",
					questions: [
						{ id: "q1", question: "Why?", answer: null },
						{ id: "q2", question: "How?", answer: "Like this." },
					],
				}),
			),
		).toBe(true);
	});

	it("hides a type this client predates", () => {
		expect(hasContent(parse({ id: "t", type: "timeline" }))).toBe(false);
	});
});

describe("whether a hero has anything to show", () => {
	const bare = {
		id: "h",
		headline: null,
		subheadline: null,
		actions: [],
		media: [],
	};

	const hero = (overrides: Record<string, unknown>): PageSection =>
		zPage.parse(page({ ...bare, type: "hero", ...overrides }))
			.sections[0] as PageSection;

	// It renders nothing, so it must not earn a divider either.
	it("hides a hero with every field empty", () => {
		expect(hasContent(hero({}))).toBe(false);
	});

	it("shows a hero with a headline", () => {
		expect(hasContent(hero({ headline: "Hello" }))).toBe(true);
	});

	it("shows a hero with only an action", () => {
		expect(
			hasContent(
				hero({ actions: [{ id: "a", url: "/projects", label: null }] }),
			),
		).toBe(true);
	});
});
