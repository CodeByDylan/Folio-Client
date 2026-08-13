import { z } from "zod";
import {
	zGetPageResponse,
	zPageSectionViewContactSectionView,
	zPageSectionViewHeroSectionView,
	zPageSectionViewProjectsSectionView,
	zPageSectionViewProseSectionView,
	zPageSectionViewQaSectionView,
	zPageSectionViewSkillsSectionView,
} from "./generated/zod.gen";

/** Every section type this client understands. Adding one starts here. */
const schemas = {
	prose: zPageSectionViewProseSectionView.extend({ type: z.literal("prose") }),
	hero: zPageSectionViewHeroSectionView.extend({ type: z.literal("hero") }),
	skills: zPageSectionViewSkillsSectionView.extend({
		type: z.literal("skills"),
	}),
	qa: zPageSectionViewQaSectionView.extend({ type: z.literal("qa") }),
	contact: zPageSectionViewContactSectionView.extend({
		type: z.literal("contact"),
	}),
	projects: zPageSectionViewProjectsSectionView.extend({
		type: z.literal("projects"),
	}),
} as const;

const known: ReadonlyArray<string> = Object.keys(schemas);

/** A section type this client predates, so one unknown section cannot cost the page. */
const zUnrecognised = z
	.looseObject({
		id: z.string(),
		// Refusing the known types keeps a malformed known section a contract error.
		type: z.string().refine((type) => !known.includes(type)),
	})
	.transform(({ id, type }) => ({
		id,
		type: "unknown" as const,
		declared: type,
	}));

const zSection = z.union([...Object.values(schemas), zUnrecognised]);

/** The page response, with unknown section types tolerated. */
export const zPage = zGetPageResponse.extend({ sections: z.array(zSection) });

export type Page = z.infer<typeof zPage>;
export type PageSection = Page["sections"][number];
export type SectionType = keyof typeof schemas;
export type KnownSection = Extract<PageSection, { type: SectionType }>;

export type ProseSection = Extract<PageSection, { type: "prose" }>;
export type HeroSection = Extract<PageSection, { type: "hero" }>;
export type SkillsSection = Extract<PageSection, { type: "skills" }>;
export type QaSection = Extract<PageSection, { type: "qa" }>;
export type ContactSection = Extract<PageSection, { type: "contact" }>;
export type ProjectsSection = Extract<PageSection, { type: "projects" }>;
export type SkillLevel =
	SkillsSection["categories"][number]["skills"][number]["level"];

type ContentChecks = {
	readonly [K in SectionType]: (
		section: Extract<KnownSection, { type: K }>,
	) => boolean;
};

const checks: ContentChecks = {
	prose: (section) => Boolean(section.body),
	hero: (section) =>
		Boolean(section.headline) ||
		Boolean(section.subheadline) ||
		section.actions.length > 0 ||
		section.media.length > 0,
	skills: (section) => section.categories.length > 0,
	qa: (section) =>
		section.questions.some((question) => Boolean(question.answer)),
	contact: () => true,
	projects: () => true,
};

/** Whether a section has anything to show. An empty one is not rendered at all. */
export function hasContent(section: PageSection): boolean {
	if (section.type === "unknown") {
		return false;
	}

	// TypeScript cannot correlate the key with its own section type here.
	const check = checks[section.type] as (section: KnownSection) => boolean;

	return check(section);
}
