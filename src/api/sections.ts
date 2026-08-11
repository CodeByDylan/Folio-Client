import { z } from "zod";
import {
	zGetPageResponse,
	zPageSectionViewHeroSectionView,
	zPageSectionViewProseSectionView,
} from "./generated/zod.gen";

const known = ["prose", "hero"] as const;

const zProse = zPageSectionViewProseSectionView.extend({
	type: z.literal("prose"),
});

const zHero = zPageSectionViewHeroSectionView.extend({
	type: z.literal("hero"),
});

/** A section type this client predates, so one unknown section cannot cost the page. */
const zUnrecognised = z
	.looseObject({
		id: z.string(),
		// Refusing the known types keeps a malformed known section a contract error.
		type: z.string().refine((type) => !known.includes(type as never)),
	})
	.transform(({ id, type }) => ({
		id,
		type: "unknown" as const,
		declared: type,
	}));

const zSection = z.union([zProse, zHero, zUnrecognised]);

/** The page response, with unknown section types tolerated. */
export const zPage = zGetPageResponse.extend({ sections: z.array(zSection) });

export type Page = z.infer<typeof zPage>;
export type PageSection = Page["sections"][number];
export type ProseSection = z.infer<typeof zProse>;
export type HeroSection = z.infer<typeof zHero>;
